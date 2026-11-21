// Renderiza quadros de revisão (em segundos) sem rebundlar a cada quadro.
import { bundle } from "@remotion/bundler";
import { renderStill, selectComposition } from "@remotion/renderer";
import path from "node:path";
const times = (process.argv[2] || "1,2.5").split(",").map(Number);
const out = process.argv[3] || "out/stills";
const serveUrl = await bundle({ entryPoint: path.resolve("src/index.ts") });
const comp = await selectComposition({ serveUrl, id: process.argv[4] || "Motion", inputProps: { watermark: false }, browserExecutable: process.env.CHROME || null });
for (const s of times) {
  const frame = Math.min(comp.durationInFrames - 1, Math.round(s * comp.fps));
  await renderStill({ composition: comp, serveUrl, frame, output: `${out}/t${s.toFixed(2)}.png`, scale: 0.4, inputProps: { watermark: false }, browserExecutable: process.env.CHROME || null });
}
console.log("ok", times.length);
