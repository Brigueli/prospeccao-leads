"""
Gerador de voz PADRÃO do estúdio: Google AI Studio TTS (Gemini).
- Lê o roteiro da stdin e a direção de voz de src/data/voice.json (no diretório do projeto).
- Gera a narração inteira num pedido só (plano gratuito: 3 pedidos/min).
- O Gemini não devolve tempo por palavra: os timings são calculados pelas PAUSAS do próprio
  áudio (ffmpeg silencedetect). As fronteiras de frase (. ? ! … :) caem nas maiores pausas,
  as vírgulas nas pausas menores dentro da frase, e as palavras são distribuídas
  proporcionalmente às letras dentro de cada trecho. Precisão típica: ±2–4 frames, suficiente
  para ancorar animações.
Saída: public/audio/voiceover.mp3 + public/audio/voiceover-timings.json (mesmo formato de antes).

Chave: GEMINI_API_KEY (ambiente) ou .env do projeto, fora do git.
Uso (na pasta do projeto):  npm run voice
"""
import base64, json, os, re, subprocess, sys, time, urllib.request

PROJ = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))  # pasta do projeto
FPS = 30

def key():
    """Chave do Google AI Studio: variável de ambiente GEMINI_API_KEY, ou arquivo .env na pasta do projeto
    ou na pasta acima dela (linha GEMINI_API_KEY=...). NUNCA coloque a chave no git."""
    if os.environ.get("GEMINI_API_KEY"):
        return os.environ["GEMINI_API_KEY"].strip()
    for d in (PROJ, os.path.dirname(PROJ)):
        f = os.path.join(d, ".env")
        if os.path.exists(f):
            for line in open(f):
                if line.startswith("GEMINI_API_KEY="):
                    return line.split("=", 1)[1].strip()
    raise SystemExit("GEMINI_API_KEY ausente (variável de ambiente ou .env na pasta do projeto)")

def prompt(text, style):
    """Formato de direção recomendado pelo Google para TTS: as notas NÃO são lidas, só a transcrição."""
    return (
        "# AUDIO PROFILE\n"
        "Locutora brasileira, mulher jovem.\n\n"
        "### DIRECTOR'S NOTES\n"
        f"{style}\n"
        "Leia SOMENTE o texto da seção TRANSCRIPT, palavra por palavra, sem ler títulos nem estas notas.\n\n"
        "#### TRANSCRIPT\n"
        f"{text}"
    )

def tts(text, voice, style, model):
    body = {
        "contents": [{"parts": [{"text": prompt(text, style)}]}],
        "generationConfig": {"responseModalities": ["AUDIO"], "speechConfig": {"voiceConfig": {"prebuiltVoiceConfig": {"voiceName": voice}}}},
    }
    for attempt in range(4):
        req = urllib.request.Request(
            f"https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent",
            data=json.dumps(body).encode(), headers={"x-goog-api-key": key(), "Content-Type": "application/json"}, method="POST")
        try:
            r = json.load(urllib.request.urlopen(req, timeout=300))
            return base64.b64decode(r["candidates"][0]["content"]["parts"][0]["inlineData"]["data"])
        except urllib.error.HTTPError as e:
            msg = e.read().decode()[:300]
            if e.code == 429 and attempt < 3:
                print("limite por minuto; aguardando 65 s…", file=sys.stderr)
                time.sleep(65)
                continue
            raise SystemExit(f"Gemini TTS {e.code}: {msg}")

def silences(path, noise="-38dB", dur=0.14):
    out = subprocess.run(["ffmpeg", "-hide_banner", "-i", path, "-af", f"silencedetect=noise={noise}:d={dur}", "-f", "null", "-"], capture_output=True, text=True).stderr
    starts = [float(x) for x in re.findall(r"silence_start: ([\d.]+)", out)]
    ends = [float(x) for x in re.findall(r"silence_end: ([\d.]+)", out)]
    total = float(re.search(r"Duration: (\d+):(\d+):([\d.]+)", out).groups()[2]) + 60 * float(re.search(r"Duration: (\d+):(\d+):([\d.]+)", out).groups()[1])
    pairs = list(zip(starts, ends + [total] * (len(starts) - len(ends))))
    return pairs, total

def weight(w):
    return max(1, len(re.sub(r"[^\wÀ-ú]", "", w))) + 1.2

def main():
    text = sys.stdin.read().strip()
    text = text.replace("…", "...")
    cfg = json.load(open("src/data/voice.json", encoding="utf-8"))
    os.makedirs("public/audio", exist_ok=True)
    wav = "public/audio/voiceover.wav"
    n_words = len(text.split())
    expected = n_words / 2.6  # PT-BR conversado ≈ 2,6 palavras/s
    for attempt in range(3):
        open(wav, "wb").write(tts(text, cfg["voice"], cfg["style"], cfg.get("model", "gemini-3.8-flash-tts")))
        pairs, total = silences(wav)
        if total <= expected * 1.45 + 2:
            break
        print(f"duração suspeita ({total:.1f}s para ~{expected:.1f}s esperados: a instrução pode ter sido lida); gerando de novo…", file=sys.stderr)
        time.sleep(21)
    else:
        raise SystemExit("o TTS insistiu em duração fora do esperado; revisar roteiro/direção")
    # região de fala
    speech_start = pairs[0][1] if pairs and pairs[0][0] < 0.05 else 0.0
    speech_end = pairs[-1][0] if pairs and pairs[-1][1] >= total - 0.05 else total
    inner = [(s, e) for s, e in pairs if s > speech_start + 0.05 and e < speech_end - 0.05]
    # frases → trechos (vírgula)
    sentences = [s.strip() for s in re.split(r"(?<=[.?!…:])\s+", text) if s.strip()]
    gaps = sorted(sorted(inner, key=lambda p: p[1] - p[0], reverse=True)[: len(sentences) - 1])
    if len(gaps) < len(sentences) - 1:
        print("aviso: poucas pausas detectadas; timings só proporcionais", file=sys.stderr)
    spans = []
    cur = speech_start
    for i, s in enumerate(sentences):
        if i < len(gaps):
            spans.append((cur, gaps[i][0])); cur = gaps[i][1]
        else:
            spans.append((cur, None))
    # completa spans sem fim proporcionalmente ao texto restante
    open_idx = [i for i, sp in enumerate(spans) if sp[1] is None]
    if open_idx:
        rest = [sentences[i] for i in open_idx]
        tw = sum(sum(weight(w) for w in r.split()) for r in rest)
        t0 = spans[open_idx[0]][0]
        avail = speech_end - t0
        for i in open_idx:
            d = avail * sum(weight(w) for w in sentences[i].split()) / tw
            spans[i] = (t0, t0 + d); t0 += d
    used = set(gaps)
    words = []
    for s, (a, b) in zip(sentences, spans):
        chunks = [c.strip() for c in re.split(r"(?<=,)\s+", s) if c.strip()]
        local = [p for p in inner if p not in used and p[0] > a + 0.05 and p[1] < b - 0.05]
        # cada vírgula cai na pausa mais próxima da posição esperada pelo texto (±35% da frase)
        cw = [sum(weight(w) for w in c.split()) for c in chunks]
        tot_w = sum(cw)
        cg, acc = [], 0.0
        for j in range(len(chunks) - 1):
            acc += cw[j]
            exp_t = a + (b - a) * acc / tot_w
            cands = [p for p in local if p not in cg and abs((p[0] + p[1]) / 2 - exp_t) < 0.35 * (b - a)]
            if cands:
                cg.append(min(cands, key=lambda p: abs((p[0] + p[1]) / 2 - exp_t)))
        cg = sorted(cg)
        bounds, c0 = [], a
        for j, ch in enumerate(chunks):
            if j < len(cg):
                bounds.append((c0, cg[j][0])); c0 = cg[j][1]
            else:
                bounds.append((c0, None))
        if any(x[1] is None for x in bounds):
            oi = [j for j, x in enumerate(bounds) if x[1] is None]
            tw = sum(sum(weight(w) for w in chunks[j].split()) for j in oi)
            t0 = bounds[oi[0]][0]
            for j in oi:
                d = (b - t0) * sum(weight(w) for w in chunks[j].split()) / tw if tw else 0
                bounds[j] = (t0, t0 + d); t0 += d
        for ch, (ca, cb) in zip(chunks, bounds):
            toks = ch.split()
            tw = sum(weight(w) for w in toks)
            t = ca
            for w in toks:
                d = (cb - ca) * weight(w) / tw
                words.append({"word": w, "key": re.sub(r"[.,!?;:\"“”()…]", "", w.lower()), "start": round(t, 3), "end": round(t + d, 3)})
                t += d
    for w in words:
        w["startFrame"], w["endFrame"] = round(w["start"] * FPS), round(w["end"] * FPS)
    subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", wav, "-af", "loudnorm=I=-16:TP=-1.5", "-ar", "44100", "-b:a", "192k", "public/audio/voiceover.mp3"], check=True)
    os.remove(wav)
    # voz nova invalida as cópias "raw" usadas pelo add_pauses.py
    for f in ("public/audio/voiceover.raw.mp3", "public/audio/voiceover-timings.raw.json"):
        if os.path.exists(f):
            os.remove(f)
    json.dump({"fps": FPS, "engine": "google-ai-studio-tts", "model": cfg.get("model", "gemini-3.8-flash-tts"), "voice": cfg["voice"], "style": cfg["style"], "durationSeconds": round(speech_end, 3), "words": words}, open("public/audio/voiceover-timings.json", "w"), indent=2, ensure_ascii=False)
    print(f"OK: voz {cfg['voice']}, {len(words)} palavras, {len(sentences)} frases, pausas usadas {len(gaps)}, fala termina em {speech_end:.2f}s")

if __name__ == "__main__":
    main()
