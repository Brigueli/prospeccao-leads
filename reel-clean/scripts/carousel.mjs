// Renderiza todos os slides dos carrosséis (PNG 1080x1350) em out/carrosseis/<id>/NN.png
import { bundle } from "@remotion/bundler";
import { renderStill, selectComposition } from "@remotion/renderer";
import path from "node:path";
const serveUrl = await bundle({ entryPoint: path.resolve("src/index.ts") });
const counts = JSON.parse(process.argv[2] || "[7,8,7,6]");
const ids = JSON.parse(process.argv[3] || '["c1-cinco-passos","c2-primeiro-contato","c3-erros-lead-sumir","c4-planos"]');
const chrome = process.env.CHROME || null;
for (let c = 0; c < counts.length; c++) {
  for (let i = 0; i < counts[c]; i++) {
    const inputProps = { c, i };
    const comp = await selectComposition({ serveUrl, id: "Slide", inputProps, browserExecutable: chrome });
    await renderStill({ composition: comp, serveUrl, frame: 0, output: `out/carrosseis/${ids[c]}/${String(i + 1).padStart(2, "0")}.png`, inputProps, browserExecutable: chrome, imageFormat: "png" });
  }
  console.log("ok", ids[c]);
}
