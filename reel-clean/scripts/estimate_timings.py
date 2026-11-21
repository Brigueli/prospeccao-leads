"""Tempos ESTIMADOS por palavra (quando não há chave do Gemini) + voz em silêncio do mesmo tamanho.
Uso: python3 scripts/estimate_timings.py  (sem chave do Gemini: lê voice/script.txt, grava public/audio/voiceover-timings.json e voiceover.mp3)"""
import json, re, subprocess
txt = open("voice/script.txt", encoding="utf-8").read().split()
def syl(w):
    return max(1, len(re.findall(r"[aeiouáéíóúâêôãõà]+", w.lower())))
t, out = 0.3, []
for w in txt:
    d = 0.08 + 0.17 * syl(w)
    out.append({"word": w, "start": round(t, 3), "end": round(t + d, 3)})
    t += d + 0.05
    if w[-1] in ".?!": t += 0.6
    elif w[-1] in ",:": t += 0.25
json.dump({"estimated": True, "words": out}, open("public/audio/voiceover-timings.json", "w"), ensure_ascii=False)
subprocess.run(["ffmpeg", "-v", "error", "-y", "-f", "lavfi", "-i", "anullsrc=r=48000:cl=stereo", "-t", str(round(t + 1, 2)), "-b:a", "128k", "public/audio/voiceover.mp3"], check=True)
for i, x in enumerate(out): print(i, x["word"], x["start"])
print("fim", round(t, 2))
