"""Junta os quadros de revisão (stills.mjs) numa folha só, em ordem de tempo, para conferir o vídeo inteiro de uma vez.
Uso: python3 scripts/grid.py <pasta-dos-stills> [colunas=8]   → <pasta>/grid.png"""
import glob, re, subprocess, sys
d = sys.argv[1]; cols = int(sys.argv[2]) if len(sys.argv) > 2 else 8
fs = sorted(glob.glob(d + "/t*.png"), key=lambda f: float(re.search(r"t([\d.]+)\.png", f).group(1)))
n = len(fs); rows = -(-n // cols)
while len(fs) < rows * cols: fs.append(fs[-1])
args = sum([["-i", f] for f in fs], [])
subprocess.run(["ffmpeg", "-v", "error", "-y"] + args + ["-filter_complex", "".join(f"[{i}]" for i in range(len(fs))) + f"xstack=inputs={len(fs)}:grid={cols}x{rows}", d + "/grid.png"], check=True)
print("ok", d + "/grid.png")
