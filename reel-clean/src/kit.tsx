import React from "react";
import { AbsoluteFill, Audio, Img, Sequence, staticFile } from "remotion";
import { Center, E, F as LibF, FONT, Hand, Letters, PhoneOutline, Scene, Underline, Words, W, ip, popStyle, prog, slideStyle } from "./lib";

/** Câmera dos vídeos curtos: igual ao F do lib, com zoom limitado a 1,15 (cards de 860 px não encostam na borda). */
export const F = (t: number, x: number, y: number, s = 1.25, r = 0, rx = 0, ry = 0) => LibF(t, x, y, Math.min(s, 1.15), r, rx, ry);

/* Peças compartilhadas dos vídeos curtos da Brigueli.ai (estilo Motion Clean).
   Cor única de destaque: ciano #08CADB (CSS oficial do site). NÃO altere o lib.tsx. */
export const BG = "#FFFFFF", AC = "#08CADB", ACD = "#0AA4B3", INK = "#091124", MUTE = "#9A9AA3", SOFT = "#F4F4F6", LIGHT = "#E6F9FB";

export type Word = { word: string; start: number; end: number };

/** Tempos de um vídeo: w(i) = início da palavra i; B = primeira palavra de cada cena; TOTAL curto (15–35 s). */
export const timeline = (T: unknown, firstWords: number[]) => {
  const words = (T as { words: Word[] }).words;
  const w = (i: number) => words[i]!.start;
  const TOTAL = Math.max(15, Math.ceil(words[words.length - 1]!.end + 3));
  const B = firstWords.map((x, i) => (i === 0 ? 0 : w(x) - 0.12));
  const SC = (i: number): [number, number] => [B[i]!, i + 1 < B.length ? B[i + 1]! : TOTAL];
  return { words, w, TOTAL, B, SC };
};

export const Mark: React.FC<{ s: number; white?: boolean }> = ({ s, white }) => (
  <Img src={staticFile(white ? "brand/brigueli-mark-white.svg" : "brand/brigueli-mark.svg")} style={{ width: s, height: s, display: "block" }} />
);

const P: Record<string, (c: string) => React.ReactNode> = {
  store: (c) => <><path d="M10 40 L18 12 H82 L90 40 Z" fill="none" stroke={c} strokeWidth="6" strokeLinejoin="round" /><path d="M18 46 V90 H82 V46" fill="none" stroke={c} strokeWidth="6" /><rect x="40" y="62" width="20" height="28" fill={c} /></>,
  pin: (c) => <><path d="M50 92 C28 66 18 52 18 38 a32 32 0 0 1 64 0 C82 52 72 66 50 92 Z" fill="none" stroke={c} strokeWidth="6" strokeLinejoin="round" /><circle cx="50" cy="38" r="11" fill={c} /></>,
  people: (c) => <><circle cx="36" cy="32" r="14" fill={c} /><path d="M8 90 Q8 54 36 54 Q64 54 64 90 Z" fill={c} /><circle cx="70" cy="36" r="11" fill="none" stroke={c} strokeWidth="5" /><path d="M66 56 Q92 56 92 88" fill="none" stroke={c} strokeWidth="5" strokeLinecap="round" /></>,
  check: (c) => <path d="M18 52 L40 74 L84 26" fill="none" stroke={c} strokeWidth="10" strokeLinecap="round" strokeLinejoin="round" />,
  cross: (c) => <path d="M24 24 L76 76 M76 24 L24 76" fill="none" stroke={c} strokeWidth="10" strokeLinecap="round" />,
  phone: (c) => <><rect x="28" y="8" width="44" height="84" rx="10" fill="none" stroke={c} strokeWidth="6" /><path d="M44 78 H56" stroke={c} strokeWidth="6" strokeLinecap="round" /></>,
  chat: (c) => <><path d="M12 46 C12 26 28 12 50 12 C72 12 88 26 88 46 C88 66 72 80 50 80 C44 80 40 79 36 78 L16 90 L22 70 C16 64 12 56 12 46 Z" fill="none" stroke={c} strokeWidth="6" strokeLinejoin="round" /><path d="M34 46 H66" stroke={c} strokeWidth="6" strokeLinecap="round" /></>,
  search: (c) => <><circle cx="42" cy="42" r="28" fill="none" stroke={c} strokeWidth="7" /><path d="M63 63 L90 90" stroke={c} strokeWidth="8" strokeLinecap="round" /></>,
  chart: (c) => <><path d="M10 90 H92" stroke={c} strokeWidth="6" strokeLinecap="round" /><path d="M18 72 L38 48 L56 60 L88 20" fill="none" stroke={c} strokeWidth="7" strokeLinecap="round" strokeLinejoin="round" /></>,
  card: (c) => <><rect x="8" y="22" width="84" height="56" rx="10" fill="none" stroke={c} strokeWidth="6" /><path d="M8 42 H92 M22 62 H46" stroke={c} strokeWidth="6" strokeLinecap="round" /></>,
  spark: (c) => <path d="M50 8 L58 42 L92 50 L58 58 L50 92 L42 58 L8 50 L42 42 Z" fill={c} strokeLinejoin="round" />,
  bolt: (c) => <path d="M58 6 L22 54 H46 L40 94 L78 42 H54 Z" fill={c} strokeLinejoin="round" />,
  bot: (c) => <><rect x="18" y="32" width="64" height="52" rx="14" fill="none" stroke={c} strokeWidth="6" /><circle cx="38" cy="58" r="6" fill={c} /><circle cx="62" cy="58" r="6" fill={c} /><path d="M50 32 V18" stroke={c} strokeWidth="6" strokeLinecap="round" /><circle cx="50" cy="12" r="5" fill={c} /></>,
  cart: (c) => <><path d="M6 14 H20 L32 66 H80 L90 30 H26" fill="none" stroke={c} strokeWidth="6" strokeLinejoin="round" strokeLinecap="round" /><circle cx="38" cy="82" r="7" fill={c} /><circle cx="74" cy="82" r="7" fill={c} /></>,
  bill: (c) => <><path d="M20 8 H80 V92 L70 84 L60 92 L50 84 L40 92 L30 84 L20 92 Z" fill="none" stroke={c} strokeWidth="6" strokeLinejoin="round" /><path d="M34 32 H66 M34 48 H66 M34 64 H54" stroke={c} strokeWidth="6" strokeLinecap="round" /></>,
  clock: (c) => <><circle cx="50" cy="50" r="40" fill="none" stroke={c} strokeWidth="6" /><path d="M50 24 V52 L70 64" fill="none" stroke={c} strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" /></>,
  cloud: (c) => <path d="M26 74 C10 74 8 52 26 50 C26 30 56 26 62 46 C80 42 90 70 72 74 Z" fill="none" stroke={c} strokeWidth="6" strokeLinejoin="round" />,
  sheet: (c) => <><rect x="12" y="10" width="76" height="80" rx="8" fill="none" stroke={c} strokeWidth="6" /><path d="M12 36 H88 M12 62 H88 M42 10 V90" stroke={c} strokeWidth="5" /></>,
  plus: (c) => <path d="M50 16 V84 M16 50 H84" fill="none" stroke={c} strokeWidth="12" strokeLinecap="round" />,
  paw: (c) => <><ellipse cx="50" cy="66" rx="22" ry="18" fill={c} /><circle cx="22" cy="42" r="9" fill={c} /><circle cx="40" cy="26" r="9" fill={c} /><circle cx="60" cy="26" r="9" fill={c} /><circle cx="78" cy="42" r="9" fill={c} /></>,
  scissors: (c) => <><circle cx="26" cy="72" r="14" fill="none" stroke={c} strokeWidth="6" /><circle cx="74" cy="72" r="14" fill="none" stroke={c} strokeWidth="6" /><path d="M34 62 L70 10 M66 62 L30 10" fill="none" stroke={c} strokeWidth="6" strokeLinecap="round" /></>,
  user: (c) => <><circle cx="50" cy="32" r="18" fill={c} /><path d="M14 92 Q14 58 50 58 Q86 58 86 92 Z" fill={c} /></>,
};
export const Ic: React.FC<{ k: string; s: number; c?: string }> = ({ k, s, c = INK }) => (
  <svg width={s} height={s} viewBox="0 0 100 100" style={{ overflow: "visible", display: "block" }}>{P[k]!(c)}</svg>
);
export const Tile: React.FC<{ k: string; s?: number; on?: boolean }> = ({ k, s = 200, on }) => (
  <div style={{ width: s, height: s, borderRadius: s * 0.24, background: on ? AC : SOFT, display: "grid", placeItems: "center" }}><Ic k={k} s={s * 0.54} c={on ? "#fff" : INK} /></div>
);

/* ---------- celular com a busca (nicho + cidade + Buscar + resultados) ---------- */
export const PhoneSearch: React.FC<{
  t: number; a: number; nicho: string; cidade: string; nichoAt: number; cidadeAt: number; btnAt: number; tap: number;
  rows: { n: string; at: number }[];
}> = ({ t, a, nicho, cidade, nichoAt, cidadeAt, btnAt, tap, rows }) => (
  <>
    <div style={{ position: "absolute", left: 270, top: 560, transform: `translateY(${(1 - E.outExpo(prog(t, a + 0.2, 0.9))) * 900}px)` }}>
      <PhoneOutline w={540} h={900} ink={INK}>
        <div style={{ position: "absolute", left: 0, right: 0, top: 96, display: "flex", flexDirection: "column", alignItems: "center", gap: 22 }}>
          <div style={{ fontSize: 34, fontWeight: 800, color: INK }}>Nova prospecção</div>
          <div style={{ width: 440, height: 86, borderRadius: 43, border: `5px solid ${SOFT}`, display: "flex", alignItems: "center", gap: 16, padding: "0 28px", fontSize: 34, fontWeight: 700, color: INK, ...popStyle(t, nichoAt - 0.1, 0.45) }}><Ic k="search" s={34} c={AC} />{nicho}</div>
          <div style={{ width: 440, height: 86, borderRadius: 43, border: `5px solid ${SOFT}`, display: "flex", alignItems: "center", gap: 16, padding: "0 28px", fontSize: 34, fontWeight: 700, color: INK, ...popStyle(t, cidadeAt - 0.1, 0.45) }}><Ic k="pin" s={34} c={AC} />{cidade}</div>
          <div style={{ width: 440, height: 92, borderRadius: 46, background: t > tap ? ACD : AC, display: "grid", placeItems: "center", fontSize: 36, fontWeight: 800, color: "#fff", ...popStyle(t, btnAt - 0.2, 0.45) }}>{t > tap ? "Buscando…" : "Buscar"}</div>
        </div>
        {rows.map((r, j) => (
          <div key={j} style={{ position: "absolute", left: 38, top: 530 + j * 170, width: 440, height: 140, borderRadius: 36, background: LIGHT, display: "flex", alignItems: "center", gap: 18, padding: "0 22px", ...popStyle(t, r.at - 0.1, 0.5) }}>
            <div style={{ width: 76, height: 76, borderRadius: 22, background: AC, display: "grid", placeItems: "center", flex: "none" }}><Ic k="store" s={46} c="#fff" /></div>
            <div style={{ flex: 1, fontSize: 31, fontWeight: 800, color: INK, lineHeight: 1.12 }}>{r.n}</div>
          </div>
        ))}
      </PhoneOutline>
    </div>
    <Hand t={t} from={[1000, 1800]} to={[540, 1020]} at={tap - 0.9} tap={tap} leave={tap + 0.8} ripple={AC} />
  </>
);

/* ---------- cards de leads (com nota e/ou ícones de contato) ---------- */
export const LeadCards: React.FC<{
  t: number; top: number; names: string[]; slideAt: number; step?: number;
  scores?: { vals: number[]; from: number; to: number }; phoneAt?: number; chatAt?: number;
}> = ({ t, top, names, slideAt, step = 0.22, scores, phoneAt, chatAt }) => (
  <>
    {names.map((n, j) => (
      <div key={j} style={{ position: "absolute", left: 110, top: top + j * 200, width: 860, height: 170, borderRadius: 48, background: LIGHT, display: "flex", alignItems: "center", gap: 30, padding: "0 36px", ...slideStyle(t, slideAt + j * step, j % 2 ? 900 : -900, 0.6) }}>
        <div style={{ width: 106, height: 106, borderRadius: 28, background: AC, display: "grid", placeItems: "center", flex: "none" }}><Ic k="store" s={62} c="#fff" /></div>
        <div style={{ flex: 1, fontSize: 44, fontWeight: 800, color: INK, lineHeight: 1.1 }}>{n}</div>
        {scores && (
          <div style={{ textAlign: "center", opacity: t > scores.from - 0.1 + j * 0.15 ? 1 : 0 }}>
            <div style={{ fontSize: 28, fontWeight: 700, color: MUTE }}>nota</div>
            <div style={{ fontSize: 72, fontWeight: 800, color: AC, letterSpacing: "-0.04em", fontVariantNumeric: "tabular-nums", lineHeight: 1 }}>
              {Math.round(ip(t, [scores.from - 0.1 + j * 0.15, scores.to + 0.5 + j * 0.15], [0, scores.vals[j]!], E.outQuint))}
            </div>
          </div>
        )}
        {(phoneAt !== undefined || chatAt !== undefined) && (
          <div style={{ display: "flex", gap: 22 }}>
            {phoneAt !== undefined && <div style={popStyle(t, phoneAt - 0.1 + j * 0.15, 0.45)}><Ic k="phone" s={58} c={INK} /></div>}
            {chatAt !== undefined && <div style={popStyle(t, chatAt - 0.1 + j * 0.15, 0.45)}><Ic k="chat" s={58} c={AC} /></div>}
          </div>
        )}
      </div>
    ))}
  </>
);

/* ---------- cena final: marca oficial + nome, e o bloco de baixo livre ---------- */
export const Closing: React.FC<{ t: number; a: number; b: number; markAt: number; children?: React.ReactNode; lowY?: number }> = ({ t, a, b, markAt, children, lowY = 1250 }) => (
  <Scene t={t} a={a} b={b} bg={BG} enter="pop" exit="none" drift={0.4}
    cam={[F(a, 540, 800, 1.26, -1), F(Math.min(a + 1.6, b - 1.2), 540, 960, 1.0), F(b, 540, 960, 1.05)]}>
    {() => (
      <>
        <Center y={700}>
          <div style={popStyle(t, markAt - 0.25, 0.65, -12)}><Mark s={280} /></div>
          <div style={{ height: 28 }} />
          <Letters t={t} text="Brigueli.ai" at={markAt} size={124} color={INK} weight={800} />
        </Center>
        <Center y={lowY}>{children}</Center>
      </>
    )}
  </Scene>
);

/* ---------- som: transições + lista própria; voz do vídeo; trilha com ducking ---------- */
export type Fx = [number, string, number];
export const baseFx = (B: number[]): Fx[] => {
  const L: Fx[] = [[0.02, "text-in.mp3", 0.2]];
  B.slice(1).forEach((b, i) => { L.push([b - 0.32, i % 3 === 1 ? "zoom.mp3" : "whoosh.mp3", 0.3]); L.push([b - 0.02, "swoosh.mp3", 0.16]); });
  return L;
};
export const Soundtrack: React.FC<{ fps: number; words: Word[]; total: number; voice: string; fx: Fx[] }> = ({ fps, words, total, voice, fx }) => (
  <>
    <Audio src={staticFile(`audio/${voice}.mp3`)} volume={1} />
    <Audio src={staticFile("audio/music.mp3")} volume={(f) => {
      const s = f / fps; const talking = words.some((x) => s > x.start - 0.15 && s < x.end + 0.25);
      return (talking ? 0.07 : 0.16) * Math.max(0, Math.min(1, (total - s) / 2.5));
    }} />
    {fx.filter(([at]) => at >= 0 && at < total).map(([at, f, v], i) => (
      <Sequence key={i} from={Math.round(at * fps)} durationInFrames={Math.round(1.6 * fps)}>
        <Audio src={staticFile(`sfx/${f}`)} volume={v} />
      </Sequence>
    ))}
  </>
);

export const Stage: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <AbsoluteFill style={{ background: BG, fontFamily: FONT }}>{children}</AbsoluteFill>
);
export { Center, E, FONT, Hand, Letters, PhoneOutline, Scene, Underline, Words, W, ip, popStyle, prog, slideStyle };
