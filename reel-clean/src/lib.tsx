/**
 * MOTION CLEAN · núcleo do estilo.
 * NÃO ALTERE os números deste arquivo: eles SÃO o estilo (curvas, durações, desfoques, câmera).
 * TUDO em SEGUNDOS (não em quadros): o mesmo código roda a 30, 60 ou 120 fps sem mudar a velocidade.
 * Formato: troque só FORMAT ("9x16" = 1080×1920, padrão; "16x9" = 1920×1080).
 */
import React from "react";
import { Easing, interpolate, useCurrentFrame, useVideoConfig } from "remotion";

export const FORMAT = "9x16" as "9x16" | "16x9"; // troque para "16x9" no formato horizontal
export const W = FORMAT === "9x16" ? 1080 : 1920, H = FORMAT === "9x16" ? 1920 : 1080;
/** distância do chicote lateral (1100 px no 9:16, 1900 px no 16:9) */
const WHIP = FORMAT === "9x16" ? 1100 : 1900;
export const FONT = "Outfit, sans-serif";

/* ---------- tempo ---------- */
export const useSec = () => { const f = useCurrentFrame(); const { fps } = useVideoConfig(); return f / fps; };
export const clamp01 = (x: number) => Math.max(0, Math.min(1, x));
export const prog = (t: number, t0: number, d: number) => clamp01((t - t0) / d);
export const E = {
  outExpo: Easing.bezier(0.16, 1, 0.3, 1),
  outBack: Easing.bezier(0.34, 1.56, 0.64, 1),
  outQuint: Easing.bezier(0.22, 1, 0.36, 1),
  inOut: Easing.bezier(0.65, 0, 0.35, 1),
  inExpo: Easing.bezier(0.7, 0, 0.84, 0),
};
export const lerp = (a: number, b: number, p: number) => a + (b - a) * p;
export const ip = (t: number, ts: number[], vs: number[], ease = E.inOut) =>
  interpolate(t, ts, vs, { easing: ease, extrapolateLeft: "clamp", extrapolateRight: "clamp" });

/* ---------- tema (troca por marca) ---------- */
export type Theme = { bg: string; ink: string; soft: string; accent: string; accentInk: string; mute: string };

/* ---------- texto ---------- */
/** Palavras que saem do desfoque, uma a uma (tempo de cada palavra = fala). */
export const Words: React.FC<{
  t: number; items: { w: string; at: number; color?: string; weight?: number }[];
  size: number; color: string; weight?: number; gap?: number; style?: React.CSSProperties;
}> = ({ t, items, size, color, weight = 600, gap = 0.26, style }) => (
  <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", alignItems: "baseline", fontFamily: FONT, fontSize: size, fontWeight: weight, letterSpacing: "-0.02em", lineHeight: 1.08, ...style }}>
    {items.map((it, i) => {
      const p = E.outExpo(prog(t, it.at - 0.08, 0.42));
      return (
        <span key={i} style={{
          display: "inline-block", marginRight: i < items.length - 1 ? `${gap}em` : 0, color: it.color ?? color, fontWeight: it.weight ?? weight,
          opacity: clamp01(p * 2), filter: p < 1 ? `blur(${(1 - p) * 14}px)` : undefined,
          transform: p < 1 ? `translateY(${(1 - p) * 34}px) scale(${1.12 - 0.12 * p})` : undefined,
        }}>{it.w}</span>
      );
    })}
  </div>
);

/** Letras que entram pulando e girando, uma a uma ("sele·cio·na" das referências). */
export const Letters: React.FC<{ t: number; text: string; at: number; size: number; color: string; weight?: number; stagger?: number; style?: React.CSSProperties }> =
  ({ t, text, at, size, color, weight = 700, stagger = 0.035, style }) => (
    <div style={{ display: "flex", justifyContent: "center", fontFamily: FONT, fontSize: size, fontWeight: weight, letterSpacing: "-0.03em", lineHeight: 1.05, color, whiteSpace: "pre", ...style }}>
      {[...text].map((c, i) => {
        const p = prog(t, at - 0.06 + i * stagger, 0.5);
        const b = E.outBack(p);
        const rot = (i % 3 === 0 ? -1 : i % 3 === 1 ? 1 : -0.5) * 28 * (1 - b);
        return <span key={i} style={{ display: "inline-block", opacity: clamp01(p * 3), transform: p < 1 ? `translateY(${(1 - b) * -70}px) rotate(${rot}deg) scale(${0.5 + 0.5 * b})` : undefined }}>{c === " " ? " " : c}</span>;
      })}
    </div>
  );

/** Saída de um bloco de texto: encolhe, sobe e desfoca. */
export const outStyle = (t: number, at: number, d = 0.3): React.CSSProperties => {
  const p = E.inExpo(prog(t, at, d));
  return p <= 0 ? {} : { opacity: 1 - p, filter: `blur(${p * 14}px)`, transform: `translateY(${-50 * p}px) scale(${1 - 0.15 * p})` };
};

/* ---------- elementos ---------- */
/** Traço desenhado à mão embaixo da palavra (swoosh). */
export const Underline: React.FC<{ t: number; at: number; width: number; color: string; dur?: number; thick?: number; style?: React.CSSProperties }> =
  ({ t, at, width, color, dur = 0.5, thick = 8, style }) => {
    const p = E.outQuint(prog(t, at, dur));
    return (
      <svg width={width} height={60} viewBox="0 0 400 60" preserveAspectRatio="none" style={{ display: "block", overflow: "visible", ...style }}>
        <path d="M8 34 C 110 10, 250 6, 392 22 M 360 34 C 300 40, 200 48, 120 52" fill="none" stroke={color} strokeWidth={thick * 400 / width} strokeLinecap="round"
          pathLength={1} strokeDasharray="1 1" strokeDashoffset={1 - p} vectorEffect="non-scaling-stroke" />
      </svg>
    );
  };

/* Rings (anéis) e Glow (mancha) foram REMOVIDOS: proibidos no estilo. Nunca recrie. */

/** Pílula/caixa que cresce da esquerda com a palavra dentro. RARA: no máximo 1 por vídeo (às vezes nenhuma). */
export const Pill: React.FC<{ t: number; at: number; text: string; bg: string; color: string; size: number; dotted?: string; rot?: number; style?: React.CSSProperties }> =
  ({ t, at, text, bg, color, size, dotted, rot = 0, style }) => {
    const p = E.outExpo(prog(t, at - 0.06, 0.45));
    const tp = prog(t, at + 0.08, 0.3);
    return (
      <div style={{ display: "inline-block", position: "relative", transform: `rotate(${rot}deg)`, ...style }}>
        <div style={{ position: "absolute", inset: 0, borderRadius: 999, background: bg, border: dotted ? `4px dashed ${dotted}` : undefined, transform: `scaleX(${p})`, transformOrigin: "0% 50%" }} />
        <div style={{ position: "relative", padding: `${size * 0.16}px ${size * 0.55}px ${size * 0.2}px`, fontFamily: FONT, fontSize: size, fontWeight: 700, letterSpacing: "-0.02em", color, whiteSpace: "nowrap", opacity: tp, filter: tp < 1 ? `blur(${(1 - tp) * 8}px)` : undefined }}>{text}</div>
      </div>
    );
  };

/** Mãozinha (contorno preto, preenchimento branco) que chega, toca e solta uma onda. */
export const HAND_PATH = "M22 4 Q28 4 28 10 V30 Q30 26 35 27 Q40 28 40 33 Q42 30 46 31 Q51 32 51 37 Q53 35 56 36 Q60 38 60 44 V52 Q60 66 46 68 H34 Q24 68 18 58 L6 40 Q3 35 7 32 Q11 30 15 35 L18 39 V10 Q18 4 22 4 Z";
export const Hand: React.FC<{ t: number; from: [number, number]; to: [number, number]; at: number; tap: number; leave?: number; until?: number; ripple?: string; size?: number }> =
  ({ t, from, to, at, tap, leave, until, ripple = "#000", size = 110 }) => {
    if (t < at || (until !== undefined && t >= until)) return null;
    const m = E.inOut(prog(t, at, Math.max(0.2, tap - at - 0.05)));
    let x = lerp(from[0], to[0], m), y = lerp(from[1], to[1], m);
    let o = 1;
    if (leave !== undefined) { const l = E.inExpo(prog(t, leave, 0.4)); x = lerp(x, x + 260, l); y = lerp(y, y + 380, l); o = 1 - l; }
    const press = t >= tap && t < tap + 0.18 ? 0.82 : 1;
    const rp = prog(t, tap, 0.55);
    return (
      <>
        {rp > 0 && rp < 1 && <div style={{ position: "absolute", left: to[0] - 90, top: to[1] - 90, width: 180, height: 180, borderRadius: "50%", border: `5px solid ${ripple}`, opacity: 0.5 * (1 - rp), transform: `scale(${0.3 + 0.9 * E.outExpo(rp)})` }} />}
        <svg width={size} height={size * 70 / 60} viewBox="0 0 60 70" style={{ position: "absolute", left: x - size * 0.37, top: y - size * 0.06, overflow: "visible", opacity: o, transform: `scale(${press})`, transformOrigin: "37% 6%" }}>
          <path d={HAND_PATH} fill="#fff" stroke="#111" strokeWidth={3.2} strokeLinejoin="round" />
          <path d="M28 30 V40 M40 33 V42 M51 37 V45" stroke="#111" strokeWidth={2.4} strokeLinecap="round" />
        </svg>
      </>
    );
  };

/** Chave liga/desliga. */
export const Toggle: React.FC<{ t: number; at: number; on: string; off?: string; w?: number }> = ({ t, at, on, off = "#D9DBE3", w = 150 }) => {
  const p = E.outBack(prog(t, at, 0.35));
  const h = w * 0.54, k = h - 14;
  return (
    <div style={{ position: "relative", width: w, height: h, borderRadius: h, background: t >= at ? on : off, transition: "none" }}>
      <div style={{ position: "absolute", top: 7, left: 7 + (w - h) * p, width: k, height: k, borderRadius: k, background: "#fff", boxShadow: "0 4px 10px rgba(0,0,0,0.18)" }} />
    </div>
  );
};

/** Pop de elemento (escala com overshoot + giro). */
export const popStyle = (t: number, at: number, d = 0.5, rot = 0): React.CSSProperties => {
  const p = prog(t, at, d);
  if (p <= 0) return { opacity: 0 };
  const b = E.outBack(p);
  return { opacity: clamp01(p * 3), transform: `scale(${b}) rotate(${rot * (1 - b)}deg)` };
};

/** Entra deslizando de um lado com desfoque. */
export const slideStyle = (t: number, at: number, dx: number, d = 0.55): React.CSSProperties => {
  const p = prog(t, at, d);
  if (p <= 0) return { opacity: 0 };
  const e = E.outExpo(p);
  return { opacity: clamp01(p * 2.5), transform: `translateX(${dx * (1 - e)}px)`, filter: p < 1 ? `blur(${(1 - e) * 16}px)` : undefined };
};

/** Celular em contorno (como nas referências). */
export const PhoneOutline: React.FC<{ w: number; h: number; ink: string; children?: React.ReactNode; bg?: string }> = ({ w, h, ink, children, bg = "#fff" }) => (
  <div style={{ position: "relative", width: w, height: h, borderRadius: w * 0.14, border: `${Math.max(6, w * 0.022)}px solid ${ink}`, background: bg, overflow: "hidden", boxShadow: "0 30px 60px rgba(0,0,0,0.10)" }}>
    <div style={{ position: "absolute", left: "50%", top: w * 0.04, width: w * 0.28, height: w * 0.07, marginLeft: -w * 0.14, borderRadius: 99, background: ink, zIndex: 3 }} />
    {children}
  </div>
);

/* ---------- cena com transição de entrada e saída ---------- */
export type Enter = "zoomIn" | "whipR" | "whipL" | "pop" | "rise" | "none";
export type Exit = "zoomThrough" | "shrink" | "whipL" | "whipR" | "fade" | "none";
export const TR = 0.38;
/** Câmera que FOCA nos itens (o estilo nunca deixa a tela parada).
 *  Cada chave diz para onde a câmera olha (x, y no palco) e o zoom (s), num instante absoluto t (s).
 *  Entre chaves: in-out suave; desfoque de movimento proporcional à velocidade da câmera. */
export type CamKey = { t: number; x: number; y: number; s: number; r?: number; rx?: number; ry?: number };
type CamPos = [number, number, number, number, number, number];
const kv = (k: CamKey): CamPos => [k.x, k.y, k.s, k.r ?? 0, k.rx ?? 0, k.ry ?? 0];
/** câmera SUAVE: chaves a menos de CAM_MIN_GAP s da anterior são ignoradas, então todo movimento dura ≥ 1,2 s */
export const CAM_MIN_GAP = 1.2;
const smoothKeys = (keys: CamKey[]): CamKey[] => keys.reduce<CamKey[]>((acc, k) => { const last = acc[acc.length - 1]; if (!last || k.t - last.t >= CAM_MIN_GAP) acc.push(k); return acc; }, []);
const camAt = (raw: CamKey[], t: number): CamPos => {
  const keys = smoothKeys(raw);
  if (t <= keys[0]!.t) return kv(keys[0]!);
  for (let i = 0; i < keys.length - 1; i++) {
    const k0 = keys[i]!, k1 = keys[i + 1]!;
    if (t < k1.t) { const p = E.inOut((t - k0.t) / Math.max(0.001, k1.t - k0.t)); const A = kv(k0), Bv = kv(k1); return A.map((v, j) => lerp(v, Bv[j]!, p)) as CamPos; }
  }
  return kv(keys[keys.length - 1]!);
};
/** atalho: foco no ponto (x,y), zoom s, giro r (°) e inclinação 3D rx/ry (°) a partir do instante t
 *  (a câmera dos motions antigos do estúdio: pan, dolly, órbita/tilt 3D, roll + câmera na mão + desfoque de movimento) */
export const F = (t: number, x: number, y: number, s = 1.25, r = 0, rx = 0, ry = 0): CamKey => ({ t, x, y, s, r, rx, ry });

export const Scene: React.FC<{ t: number; a: number; b: number; bg: string; enter?: Enter; exit?: Exit; children: (lt: number) => React.ReactNode; drift?: number; cam?: CamKey[] }> =
  ({ t, a, b, bg, enter = "zoomIn", exit = "zoomThrough", children, drift = 1, cam }) => {
    if (t < a || t >= b + (exit === "none" ? 0 : 0.001)) return null;
    let s = 1, x = 0, y = 0, bl = 0, o = 1, r = 0;
    const pe = prog(t, a, TR), ee = E.outExpo(pe);
    if (pe < 1) {
      if (enter === "zoomIn") { s *= lerp(0.55, 1, ee); bl += (1 - ee) * 18; o *= clamp01(pe * 2.5); }
      if (enter === "whipR") { x += WHIP * (1 - ee); bl += (1 - ee) * 26; }
      if (enter === "whipL") { x -= WHIP * (1 - ee); bl += (1 - ee) * 26; }
      if (enter === "pop") { s *= lerp(1.35, 1, ee); bl += (1 - ee) * 14; o *= clamp01(pe * 2.5); }
      if (enter === "rise") { y += H * (1 - ee); }
    }
    const px = prog(t, b - TR, TR), xe = E.inExpo(px);
    if (px > 0) {
      if (exit === "zoomThrough") { s *= lerp(1, 3.2, xe); bl += xe * 24; o *= 1 - clamp01((px - 0.45) * 2); }
      if (exit === "shrink") { s *= lerp(1, 0.15, xe); bl += xe * 12; o *= 1 - xe; r -= 8 * xe; }
      if (exit === "whipL") { x -= WHIP * xe; bl += xe * 26; }
      if (exit === "whipR") { x += WHIP * xe; bl += xe * 26; }
      if (exit === "fade") { o *= 1 - xe; bl += xe * 16; }
    }
    // câmera: aproximação lenta + giro leve o tempo todo
    const k = (t - a) / Math.max(0.5, b - a);
    s *= 1 + 0.045 * k * drift; r += 0.8 * Math.sin(k * Math.PI) * drift;
    // câmera focando nos itens
    let camTf = "none", camBl = 0;
    if (cam && cam.length) {
      const [cx, cy, cs, cr, crx, cry] = camAt(cam, t);
      const A0 = camAt(cam, t - 1 / 60), B0 = camAt(cam, t + 1 / 60);
      const speed = Math.hypot(B0[0] - A0[0], B0[1] - A0[1]) * 30 + Math.abs(B0[2] - A0[2]) * 30 * 900 + (Math.abs(B0[3] - A0[3]) + Math.abs(B0[4] - A0[4]) + Math.abs(B0[5] - A0[5])) * 30 * 12;
      camBl = Math.min(3, speed * 0.0015);
      // câmera na mão: três senos de períodos diferentes (determinístico) + respiração do zoom
      const lt0 = t - a;
      const hx = 4 * Math.sin(lt0 * 2 * Math.PI / 1.7), hy = 3 * Math.sin(lt0 * 2 * Math.PI / 2.3 + 1), hr = 0.2 * Math.sin(lt0 * 2 * Math.PI / 2.9 + 2);
      const breathe = 1 + 0.012 * Math.sin(lt0 * 1.3);
      const S = cs * breathe;
      camTf = `perspective(1800px) translate(${W / 2 + hx}px, ${H / 2 + hy}px) rotateX(${crx}deg) rotateY(${cry}deg) rotate(${cr + hr}deg) scale(${S}) translate(${-cx}px, ${-cy}px)`;
      s /= 1 + 0.045 * k * drift; r -= 0.8 * Math.sin(k * Math.PI) * drift;   // a câmera substitui o drift
    }
    return (
      <div style={{ position: "absolute", inset: 0, background: bg, overflow: "hidden" }}>
        <div style={{ position: "absolute", inset: 0, transformOrigin: `${W / 2}px ${H / 2}px`, transform: `translate(${x}px,${y}px) scale(${s}) rotate(${r}deg)`, filter: bl > 0.05 ? `blur(${bl}px)` : undefined, opacity: o }}>
          <div style={{ position: "absolute", inset: 0, transformOrigin: "0 0", transform: camTf, filter: camBl > 0.3 ? `blur(${camBl.toFixed(2)}px)` : undefined }}>
            {children(t - a)}
          </div>
        </div>
      </div>
    );
  };

export const Center: React.FC<{ y?: number; children: React.ReactNode; style?: React.CSSProperties }> = ({ y = H / 2, children, style }) => (
  <div style={{ position: "absolute", left: 0, width: W, top: y, transform: "translateY(-50%)", display: "flex", flexDirection: "column", alignItems: "center", ...style }}>{children}</div>
);
