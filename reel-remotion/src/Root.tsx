import { Composition } from "remotion";
import { Reel } from "./Reel";

export const FPS = 30;
export const DURATION = 28 * FPS;

export const Root: React.FC = () => (
  <Composition
    id="Reel"
    component={Reel}
    durationInFrames={DURATION}
    fps={FPS}
    width={1080}
    height={1920}
  />
);
