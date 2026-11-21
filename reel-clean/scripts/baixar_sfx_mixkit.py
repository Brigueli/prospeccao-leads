"""Baixa do próprio Mixkit os 4 sons do estilo que NÃO podem ser redistribuídos soltos (licença Mixkit)
e aplica o mesmo tratamento do estúdio (corta silêncio, duração máxima, fade, pico −3 dBFS).
Uso (na pasta do projeto): python3 scripts/baixar_sfx_mixkit.py   → public/sfx/{zoom,swoosh,sparkle,zoomin}.mp3
Se o Mixkit estiver fora do ar, o script copia substitutos da própria pasta (whoosh/riser/reveal) para o vídeo nunca ficar mudo."""
import os, re, shutil, subprocess, urllib.request
SFX = {  # nome no projeto: (id Mixkit, duração máx. em s, substituto local)
    "zoom.mp3": (2627, 3.0, "whoosh.mp3"),      # "Fast swipe zoom"          → antes da troca de cena (alternando com whoosh)
    "swoosh.mp3": (3005, 3.0, "swish.mp3"),     # "Explainer video pops whoosh light pop" → no corte da troca
    "sparkle.mp3": (3083, 3.5, "reveal.mp3"),   # "Magic sparkle touch"      → revelação de logo/marca
    "zoomin.mp3": (2621, 3.0, "riser.mp3"),     # "Ui zoom in, long sound"   → antes da palavra grande
}
os.makedirs("public/sfx", exist_ok=True)
for name, (i, md, sub) in SFX.items():
    out = f"public/sfx/{name}"
    if os.path.exists(out):
        continue
    try:
        raw, tmp = out + ".src.mp3", out + ".tmp.wav"
        req = urllib.request.Request(f"https://assets.mixkit.co/active_storage/sfx/{i}/{i}-preview.mp3", headers={"User-Agent": "Mozilla/5.0"})
        open(raw, "wb").write(urllib.request.urlopen(req, timeout=60).read())
        subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", raw, "-af", f"silenceremove=start_periods=1:start_threshold=-50dB:start_silence=0.01,atrim=0:{md},afade=t=out:st={max(0, md - 0.08)}:d=0.08", "-ar", "44100", "-ac", "2", tmp], check=True)
        r = subprocess.run(["ffmpeg", "-hide_banner", "-i", tmp, "-af", "volumedetect", "-f", "null", "-"], capture_output=True, text=True)
        pk = float(re.search(r"max_volume: (-?[\d.]+) dB", r.stderr).group(1))
        subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", tmp, "-af", f"volume={-3.0 - pk:.2f}dB,areverse,silenceremove=start_periods=1:start_threshold=-60dB,areverse", "-c:a", "libmp3lame", "-b:a", "160k", out], check=True)
        os.remove(tmp); os.remove(raw)
        print("ok", name)
    except Exception as e:  # sem rede: usa substituto para nunca faltar arquivo
        shutil.copy(f"public/sfx/{sub}", out)
        print(f"aviso: {name} não baixou ({e.__class__.__name__}); usando cópia de {sub}")
print("sfx ok")
