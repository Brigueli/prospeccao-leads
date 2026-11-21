import React from "react";
import { Composition, staticFile } from "remotion";
import { loadFont } from "@remotion/fonts";
import { Video, TOTAL } from "./Video";
import { W, H } from "./lib";

/** 120 fps OBRIGATÓRIO (regra do estúdio). As animações são em segundos, então o fps não muda a velocidade. */
export const FPS = 120;

loadFont({ family: "Outfit", url: staticFile("fonts/outfit-latin.woff2"), weight: "100 900", unicodeRange: "U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+0304, U+0308, U+0329, U+2000-206F, U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215, U+FEFF, U+FFFD" });
loadFont({ family: "Outfit", url: staticFile("fonts/outfit-latin-ext.woff2"), weight: "100 900", unicodeRange: "U+0100-02BA, U+02BD-02C5, U+02C7-02CC, U+02CE-02D7, U+02DD-02FF, U+1E00-1E9F, U+20A0-20AB, U+20AD-20C0, U+2C60-2C7F, U+A720-A7FF" });

export const Root: React.FC = () => (
  <>
    <Composition id="Motion" component={Video} durationInFrames={Math.round(TOTAL * FPS)} fps={FPS} width={W} height={H} defaultProps={{ watermark: false }} />
    <Composition id="MotionWatermark" component={Video} durationInFrames={Math.round(TOTAL * FPS)} fps={FPS} width={W} height={H} defaultProps={{ watermark: true }} />
  </>
);
