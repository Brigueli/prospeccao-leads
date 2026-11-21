#!/bin/sh
# Master de áudio do estúdio: mede o LUFS integrado (ebur128) e leva a −14 LUFS com limitador (pico 0.7).
# Vídeo é copiado sem recompressão. Uso: sh scripts/master.sh entrada.mp4 saida.mp4
# PRÉVIA SEM VOZ (voz muda): use  PREVIA=1 sh scripts/master.sh ...  → só +10 dB + limitador.
set -e
IN=$1; OUT=$2
if [ -n "$PREVIA" ]; then
  ffmpeg -v error -y -i "$IN" -c:v copy -af "volume=10dB,alimiter=limit=0.7:level=false" -c:a aac -b:a 320k "$OUT"; echo "master prévia: $OUT"; exit 0
fi
I=$(ffmpeg -hide_banner -nostats -i "$IN" -af ebur128 -f null - 2>&1 | awk '/Integrated loudness:/{f=1} f&&/I:/{print $2; exit}')
G=$(python3 -c "print(round(-14-($I),2))")
ffmpeg -v error -y -i "$IN" -c:v copy -af "volume=${G}dB,alimiter=limit=0.7:level=false" -c:a aac -b:a 320k "$OUT"
echo "master: $OUT (era $I LUFS, ganho ${G} dB)"
