"""Gera do zero (sem download, sem licença de terceiros) TODOS os efeitos sonoros do estilo + uma trilha leve de 60 s.
Só usa Python 3 (biblioteca padrão) + ffmpeg. Determinístico: sempre gera os mesmos arquivos.
Uso (na pasta do projeto):  python3 scripts/gerar_sons.py        → public/sfx/*.mp3 e public/audio/music.mp3
Se você tiver sons melhores (Mixkit/Kenney/Pixabay) com o MESMO nome de arquivo, pode substituir: o código do vídeo não muda."""
import math, os, random, struct, subprocess, wave

SR = 44100
OUT_SFX, OUT_AUD = "public/sfx", "public/audio"
rng = random.Random(7)

def env_exp(i, n, k=6.0):
    return math.exp(-k * i / n)

def bell(i, n):  # sobe e desce (seno)
    return math.sin(math.pi * i / n)

def noise():
    return rng.uniform(-1, 1)

def sine_sweep(dur, f0, f1, k=6.0, amp=0.9):
    n = int(dur * SR); ph = 0.0; out = []
    for i in range(n):
        f = f0 + (f1 - f0) * i / n
        ph += 2 * math.pi * f / SR
        out.append(amp * math.sin(ph) * env_exp(i, n, k))
    return out

def tone(dur, freqs, k=5.0, amp=0.5, attack=0.004):
    n = int(dur * SR); a = max(1, int(attack * SR)); out = []
    for i in range(n):
        s = sum(math.sin(2 * math.pi * f * i / SR) for f in freqs) / len(freqs)
        out.append(amp * s * min(1, i / a) * env_exp(i, n, k))
    return out

def filtered_noise(dur, c0, c1, shape="bell", amp=0.8):
    """ruído com passa-baixa de 1 polo cujo corte vai de c0 a c1 (0..1); envelope em sino."""
    n = int(dur * SR); y = 0.0; out = []
    for i in range(n):
        c = c0 + (c1 - c0) * i / n
        y += c * (noise() - y)
        e = bell(i, n) ** 1.5 if shape == "bell" else env_exp(i, n, 5)
        out.append(amp * 3.0 * y * e)
    return out

def mix(*tracks, offsets=None):
    offsets = offsets or [0] * len(tracks)
    n = max(int(o * SR) + len(t) for t, o in zip(tracks, offsets))
    out = [0.0] * n
    for t, o in zip(tracks, offsets):
        s = int(o * SR)
        for i, v in enumerate(t):
            out[s + i] += v
    return out

def save(name, data, folder=OUT_SFX, peak=0.7):
    os.makedirs(folder, exist_ok=True)
    m = max(1e-9, max(abs(v) for v in data)); g = peak / m
    wav = os.path.join(folder, name.replace(".mp3", ".wav"))
    with wave.open(wav, "wb") as w:
        w.setnchannels(1); w.setsampwidth(2); w.setframerate(SR)
        w.writeframes(b"".join(struct.pack("<h", int(max(-1, min(1, v * g)) * 32767)) for v in data))
    subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", wav, "-ac", "2", "-b:a", "160k", os.path.join(folder, name)], check=True)
    os.remove(wav)
    print("ok", name)

# ---------- efeitos ----------
save("pop.mp3", sine_sweep(0.11, 520, 1250, k=9))
save("tick.mp3", tone(0.03, [3200], k=12, amp=0.6))
save("soft.mp3", tone(0.04, [1500], k=10, amp=0.4))
save("click.mp3", mix([0.9 * noise() * env_exp(i, 300, 8) for i in range(300)], tone(0.035, [2100], k=10, amp=0.5)))
save("toggle.mp3", mix(tone(0.03, [1800], k=10), tone(0.04, [2600], k=9), offsets=[0, 0.06]))
save("whoosh.mp3", filtered_noise(0.55, 0.02, 0.35))
save("swish.mp3", filtered_noise(0.30, 0.08, 0.5, amp=0.7))
save("swoosh.mp3", mix(filtered_noise(0.40, 0.05, 0.45), sine_sweep(0.08, 700, 1300, k=9, amp=0.4), offsets=[0, 0.33]))
save("zoom.mp3", mix(filtered_noise(0.65, 0.01, 0.6), sine_sweep(0.65, 180, 900, k=2, amp=0.25)))
save("zoomin.mp3", [v * (0.75 + 0.25 * math.sin(2 * math.pi * 18 * i / SR)) for i, v in enumerate(sine_sweep(0.8, 300, 1200, k=1.5, amp=0.5))])
save("riser.mp3", mix(filtered_noise(1.5, 0.01, 0.4, amp=0.5), [0.35 * math.sin(2 * math.pi * (200 * i / SR + 300 * (i / SR) ** 2)) * (i / (1.5 * SR)) for i in range(int(1.5 * SR))]))
save("reveal.mp3", mix(tone(1.2, [880, 1320, 1760], k=3, amp=0.5, attack=0.02), filtered_noise(0.5, 0.1, 0.6, amp=0.3)))
save("sparkle.mp3", mix(*[tone(0.25, [rng.choice([2093, 2637, 3136, 3520, 4186])], k=7, amp=0.4) for _ in range(7)], offsets=[j * 0.09 for j in range(7)]))
save("scribble.mp3", [0.8 * v * (0.6 + 0.4 * math.sin(2 * math.pi * 22 * i / SR)) for i, v in enumerate(filtered_noise(0.5, 0.35, 0.25))])
save("message.mp3", mix(tone(0.15, [880], k=5), tone(0.25, [1320], k=5), offsets=[0, 0.09]))
save("notify.mp3", mix(tone(0.25, [1047], k=5), tone(0.25, [1319], k=5), tone(0.4, [1568], k=4), offsets=[0, 0.09, 0.18]))
save("stamp.mp3", mix(sine_sweep(0.3, 120, 55, k=7, amp=1.0), [0.5 * noise() * env_exp(i, 2000, 6) for i in range(2000)]))
save("text-in.mp3", mix(filtered_noise(0.25, 0.1, 0.5, amp=0.5), tone(0.03, [2400], k=10, amp=0.3), offsets=[0, 0.2]))
save("typing.mp3", mix(*[tone(0.025, [rng.choice([1800, 2000, 2300])], k=12, amp=0.5) for _ in range(10)], offsets=[j * 0.1 + rng.uniform(0, 0.03) for j in range(10)]))
save("like.mp3", mix(sine_sweep(0.1, 500, 1100, k=8), tone(0.35, [1568, 2093], k=5, amp=0.4), offsets=[0, 0.05]))
save("bubble.mp3", mix(sine_sweep(0.05, 300, 900, k=4), sine_sweep(0.05, 400, 1100, k=4), offsets=[0, 0.07]))

# ---------- trilha leve de 60 s (acordes suaves + pulso discreto, 100 bpm) ----------
dur, bpm = 60.0, 100
beat = 60 / bpm
chords = [[261.6, 329.6, 392.0], [196.0, 246.9, 293.7], [220.0, 261.6, 329.6], [174.6, 220.0, 261.6]]  # C G Am F
n = int(dur * SR); music = [0.0] * n
bar = 4 * beat
for i in range(n):
    t = i / SR
    c = chords[int(t // bar) % 4]
    pos = (t % bar) / bar
    pad = sum(math.sin(2 * math.pi * f * t) + 0.3 * math.sin(2 * math.pi * 2 * f * t) for f in c) / 6
    pad *= 0.6 * min(1, pos * 8) * (1 - 0.3 * pos)
    bt = t % beat
    kick = 0.5 * math.sin(2 * math.pi * (55 + 60 * math.exp(-bt * 30)) * bt) * math.exp(-bt * 9)
    pluck_f = c[int((t // (beat / 2)) % 3)] * 2
    pt = t % (beat / 2)
    pluck = 0.18 * math.sin(2 * math.pi * pluck_f * pt) * math.exp(-pt * 10)
    fade = min(1, t / 0.3) * min(1, (dur - t) / 2.5)
    music[i] = (pad + kick + pluck) * fade
save("music.mp3", music, folder=OUT_AUD, peak=0.5)
print("sons ok")
