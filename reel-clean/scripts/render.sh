#!/bin/sh
# Render FINAL: as duas versões (limpa + marca d'água "Seu Estúdio"), 120 fps, CRF 18, depois master −14 LUFS.
# Uso (na pasta do projeto): sh scripts/render.sh <nome-da-peça>   → out/<nome>-limpa.mp4 e out/<nome>-marca-dagua.mp4
set -e
NAME=${1:-motion}
[ -f public/sfx/zoom.mp3 ] || python3 scripts/gerar_sons.py
mkdir -p out
npx remotion render Motion out/raw-limpa.mp4 --codec=h264 --crf=18 --pixel-format=yuv420p --audio-codec=aac --audio-bitrate=320k --log=error
npx remotion render MotionWatermark out/raw-marca.mp4 --codec=h264 --crf=18 --pixel-format=yuv420p --audio-codec=aac --audio-bitrate=320k --log=error
sh scripts/master.sh out/raw-limpa.mp4 "out/$NAME-limpa.mp4"
sh scripts/master.sh out/raw-marca.mp4 "out/$NAME-marca-dagua.mp4"
echo RENDER_OK
