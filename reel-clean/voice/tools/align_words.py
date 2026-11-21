"""
Alinhamento REAL palavra a palavra da locução (substitui o cálculo por pausas).
Roda o faster-whisper (CPU) no áudio, pega o tempo de cada palavra reconhecida e casa com as
palavras do roteiro (difflib). Palavras sem par recebem tempo interpolado entre vizinhas.
Uso (na pasta voice/ do projeto):  $ALIGN_PY tools/align_words.py   (ALIGN_PY = python de um venv com faster-whisper)
Lê/escreve public/audio/voiceover-timings.json e public/audio/voiceover.mp3.
Instalação: python3 -m venv ~/.venv-align && ~/.venv-align/bin/pip install faster-whisper numpy
"""
import difflib, json, re, subprocess, sys, unicodedata
import numpy as np
from faster_whisper import WhisperModel

FPS = 30
MODEL = sys.argv[1] if len(sys.argv) > 1 else "small"

def norm(w):
    w = unicodedata.normalize("NFD", w.lower())
    w = "".join(c for c in w if unicodedata.category(c) != "Mn")
    return re.sub(r"[^a-z0-9]", "", w)

def main():
    path = "public/audio/voiceover-timings.json"
    d = json.load(open(path, encoding="utf-8"))
    script = d["words"]
    model = WhisperModel(MODEL, device="cpu", compute_type="int8")
    initial = " ".join(w["word"] for w in script)
    # decodifica com ffmpeg (evita a incompatibilidade do PyAV) → float32 16 kHz mono
    pcm = subprocess.run(["ffmpeg", "-v", "error", "-i", "public/audio/voiceover.mp3", "-f", "f32le", "-ac", "1", "-ar", "16000", "-"], capture_output=True, check=True).stdout
    audio = np.frombuffer(pcm, dtype=np.float32)
    segs, _ = model.transcribe(audio, language="pt", word_timestamps=True, initial_prompt=initial, vad_filter=False, beam_size=5)
    rec = [w for s in segs for w in (s.words or [])]
    a = [norm(w["word"]) for w in script]
    b = [norm(w.word) for w in rec]
    sm = difflib.SequenceMatcher(a=a, b=b, autojunk=False)
    times = [None] * len(script)
    for blk in sm.get_matching_blocks():
        for k in range(blk.size):
            r = rec[blk.b + k]
            times[blk.a + k] = (float(r.start), float(r.end))
    # casamentos parciais dentro de trechos substituídos (palavra a palavra, por similaridade)
    for tag, i1, i2, j1, j2 in sm.get_opcodes():
        if tag == "replace" and (i2 - i1) == (j2 - j1):
            for k in range(i2 - i1):
                r = rec[j1 + k]
                times[i1 + k] = (float(r.start), float(r.end))
    matched = sum(1 for t in times if t)
    # interpola os que faltam
    n = len(times)
    for i in range(n):
        if times[i] is None:
            prev = next((times[j] for j in range(i - 1, -1, -1) if times[j]), None)
            nxt_j = next((j for j in range(i + 1, n) if times[j]), None)
            p_end = prev[1] if prev else 0.0
            n_start = times[nxt_j][0] if nxt_j is not None else p_end + 0.4
            gap_count = (nxt_j if nxt_j is not None else n) - i
            step = max(0.08, (n_start - p_end) / (gap_count + 1))
            times[i] = (p_end + step * 0.2, p_end + step)
    for w, (s, e) in zip(script, times):
        w["start"], w["end"] = round(s, 3), round(e, 3)
        w["startFrame"], w["endFrame"] = round(s * FPS), round(e * FPS)
    d["alignment"] = {"engine": f"faster-whisper-{MODEL}", "matched": matched, "total": n}
    d["durationSeconds"] = script[-1]["end"]
    json.dump(d, open(path, "w", encoding="utf-8"), indent=2, ensure_ascii=False)
    print(f"OK alinhamento: {matched}/{n} palavras casadas com o áudio ({MODEL})")

if __name__ == "__main__":
    main()
