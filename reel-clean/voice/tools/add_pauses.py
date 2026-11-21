"""
Insere pausas entre as frases da locução (sem regerar a voz) e ajusta os timings.
Uso (na pasta voice/ do projeto): python3 tools/add_pauses.py [pausa_s=0.6]
Corta no meio do silêncio entre o fim da frase e a próxima palavra, insere silêncio e
desloca todas as palavras seguintes. Fonte: public/audio/voiceover.raw.mp3 (cópia do original).
"""
import json, os, shutil, subprocess, sys

PAUSE = float(sys.argv[1]) if len(sys.argv) > 1 else 0.6
FPS = 30
A = "public/audio"
raw = f"{A}/voiceover.raw.mp3"
if not os.path.exists(raw):
    shutil.copy(f"{A}/voiceover.mp3", raw)
    shutil.copy(f"{A}/voiceover-timings.json", f"{A}/voiceover-timings.raw.json")
d = json.load(open(f"{A}/voiceover-timings.raw.json"))
words = d["words"]
cuts = []
for i, w in enumerate(words[:-1]):
    if w["word"][-1] in ".?…:!":
        cuts.append((i, (w["end"] + words[i + 1]["start"]) / 2))
# monta segmentos
tmp = f"{A}/_seg"
os.makedirs(tmp, exist_ok=True)
bounds = [0.0] + [c for _, c in cuts] + [None]
listing = []
for k in range(len(bounds) - 1):
    s, e = bounds[k], bounds[k + 1]
    out = f"{tmp}/s{k}.wav"
    cmd = ["ffmpeg", "-v", "error", "-y", "-i", raw, "-ss", str(s)] + (["-to", str(e)] if e else []) + ["-ar", "44100", "-ac", "1", out]
    subprocess.run(cmd, check=True)
    listing.append(out)
    if e is not None:
        sil = f"{tmp}/p{k}.wav"
        subprocess.run(["ffmpeg", "-v", "error", "-y", "-f", "lavfi", "-i", f"anullsrc=r=44100:cl=mono", "-t", str(PAUSE), sil], check=True)
        listing.append(sil)
with open(f"{tmp}/list.txt", "w") as f:
    for p in listing:
        f.write(f"file '{os.path.abspath(p)}'\n")
subprocess.run(["ffmpeg", "-v", "error", "-y", "-f", "concat", "-safe", "0", "-i", f"{tmp}/list.txt", "-c:a", "libmp3lame", "-b:a", "192k", f"{A}/voiceover.mp3"], check=True)
shutil.rmtree(tmp)
# desloca timings
shift = 0.0
ci = 0
for i, w in enumerate(words):
    w["start"] += shift
    w["end"] += shift
    if ci < len(cuts) and cuts[ci][0] == i:
        shift += PAUSE
        ci += 1
for w in words:
    w["startFrame"] = round(w["start"] * FPS)
    w["endFrame"] = round(w["end"] * FPS)
d["durationSeconds"] = words[-1]["end"]
d["pauseInserted"] = PAUSE
json.dump(d, open(f"{A}/voiceover-timings.json", "w"), indent=2, ensure_ascii=False)
print(f"OK: {len(cuts)} pausas de {PAUSE}s, fala termina em {d['durationSeconds']:.2f}s")
