import React from "react";
import { AbsoluteFill, Audio, Img, Sequence, staticFile, useVideoConfig } from "remotion";
import T from "../public/audio/voiceover-timings.json";
import {
  Center, E, F, FONT, Hand, Letters, PhoneOutline, Scene, Underline, Words, W,
  ip, popStyle, prog, slideStyle, useSec,
} from "./lib";

/* Brigueli.ai · estilo Motion Clean · 9:16 · ciano #08CADB (CSS do site oficial) e branco
   Câmera SUAVE focando nos itens (movimentos ≥ 1,2 s, zoom ≤ 1,3). SEM círculo/anel/mancha. Ênfase = palavra MAIOR. Nenhuma pílula.
   Fatos (brigueli-ai.online): busca de empresas por nicho e cidade; telefone, WhatsApp e redes sociais; leads organizados com nota de potencial;
   dashboard de clientes e vendas em real, dólar e euro; biblioteca com mais de 300 prompts, skills e agents; plano Starter grátis, sem cartão;
   slogan "Prospecção inteligente com IA". Ilustrativo: nomes de empresas, notas e cartões do painel. */
const BG = "#FFFFFF", AC = "#08CADB", ACD = "#0AA4B3", INK = "#091124", MUTE = "#9A9AA3", SOFT = "#F4F4F6", LIGHT = "#E6F9FB";
const WATERMARK = "Seu Estúdio";

const words = (T as { words: { word: string; start: number; end: number }[] }).words;
const w = (i: number) => words[i]!.start;
export const TOTAL = Math.max(45, Math.ceil(words[words.length - 1]!.end + 4.5));
const B = [0, w(8), w(14), w(28), w(36), w(47), w(58), w(67)].map((x, i) => (i === 0 ? 0 : x - 0.12));
const SC = (i: number): [number, number] => [B[i]!, i + 1 < B.length ? B[i + 1]! : TOTAL];

/* marca oficial (assets/favicon.svg do site); versão branca = mesma forma recolorida */
const Mark: React.FC<{ s: number; white?: boolean }> = ({ s, white }) => (
  <Img src={staticFile(white ? "brand/brigueli-mark-white.svg" : "brand/brigueli-mark.svg")} style={{ width: s, height: s, display: "block" }} />
);

/* ícones de traço (viewBox 0 0 100 100, traço 6, pontas redondas) */
const P: Record<string, (c: string) => React.ReactNode> = {
  store: (c) => <><path d="M10 40 L18 12 H82 L90 40 Z" fill="none" stroke={c} strokeWidth="6" strokeLinejoin="round" /><path d="M18 46 V90 H82 V46" fill="none" stroke={c} strokeWidth="6" /><rect x="40" y="62" width="20" height="28" fill={c} /></>,
  pin: (c) => <><path d="M50 92 C28 66 18 52 18 38 a32 32 0 0 1 64 0 C82 52 72 66 50 92 Z" fill="none" stroke={c} strokeWidth="6" strokeLinejoin="round" /><circle cx="50" cy="38" r="11" fill={c} /></>,
  people: (c) => <><circle cx="36" cy="32" r="14" fill={c} /><path d="M8 90 Q8 54 36 54 Q64 54 64 90 Z" fill={c} /><circle cx="70" cy="36" r="11" fill="none" stroke={c} strokeWidth="5" /><path d="M66 56 Q92 56 92 88" fill="none" stroke={c} strokeWidth="5" strokeLinecap="round" /></>,
  check: (c) => <path d="M18 52 L40 74 L84 26" fill="none" stroke={c} strokeWidth="10" strokeLinecap="round" strokeLinejoin="round" />,
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
};
const Ic: React.FC<{ k: string; s: number; c?: string }> = ({ k, s, c = INK }) => (
  <svg width={s} height={s} viewBox="0 0 100 100" style={{ overflow: "visible", display: "block" }}>{P[k]!(c)}</svg>
);
const Tile: React.FC<{ k: string; s?: number; on?: boolean }> = ({ k, s = 200, on }) => (
  <div style={{ width: s, height: s, borderRadius: s * 0.24, background: on ? AC : SOFT, display: "grid", placeItems: "center" }}><Ic k={k} s={s * 0.54} c={on ? "#fff" : INK} /></div>
);

export const Video: React.FC<{ watermark: boolean }> = ({ watermark }) => {
  const t = useSec();
  const { fps } = useVideoConfig();

  return (
    <AbsoluteFill style={{ background: BG, fontFamily: FONT }}>
      {/* 1 · "Já pensou em encontrar clientes em velocidade máxima?" — empresas, cidade e clientes juntos numa moldura */}
      <Scene t={t} a={SC(0)[0]} b={SC(0)[1]} bg={BG} enter="none" exit="whipL"
        cam={[F(0, 540, 560, 1.28, -1), F(2.4, 540, 980, 1.22, 0, 3), F(SC(0)[1], 540, 1040, 1.04)]}>
        {() => {
          const frame = E.inOut(prog(t, w(5) - 0.1, 1.2));
          const tiles = [{ k: "store", s: "Empresas", x: 145, i: 3 }, { k: "pin", s: "Cidade", x: 425, i: 4 }, { k: "people", s: "Clientes", x: 705, i: 5 }];
          return (
            <>
              <Center y={470}>
                <Words t={t} size={62} color={MUTE} weight={600} items={[{ w: "Já", at: w(0) }, { w: "pensou", at: w(1), color: INK, weight: 800 }, { w: "em", at: w(2) }, { w: "encontrar", at: w(3), color: INK, weight: 800 }]} />
                <Words t={t} size={62} color={MUTE} weight={600} items={[{ w: "clientes", at: w(4), color: INK, weight: 800 }, { w: "em", at: w(5) }]} />
              </Center>
              {tiles.map((x, j) => (
                <div key={j} style={{ position: "absolute", left: x.x, top: 800, width: 230, display: "flex", flexDirection: "column", alignItems: "center", gap: 18, ...popStyle(t, w(x.i) - 0.15, 0.55, j % 2 ? 10 : -10) }}>
                  <Tile k={x.k} s={230} on={j === 1} />
                  <div style={{ fontSize: 42, fontWeight: 800, color: INK }}>{x.s}</div>
                </div>
              ))}
              <svg width={W} height={1920} style={{ position: "absolute", left: 0, top: 0 }}>
                <rect x={105} y={765} width={870} height={400} rx={56} fill="none" stroke={AC} strokeWidth={10} strokeLinecap="round" pathLength={1} strokeDasharray="1 1" strokeDashoffset={1 - frame} />
              </svg>
              <Center y={1420}>
                <Letters t={t} text="velocidade" at={w(6)} size={128} color={AC} weight={800} stagger={0.03} />
                <Letters t={t} text="máxima?" at={w(7)} size={128} color={AC} weight={800} stagger={0.03} />
                <Underline t={t} at={w(7) + 0.5} width={480} color={AC} thick={12} />
              </Center>
            </>
          );
        }}
      </Scene>

      {/* 2 · "Conheça a Brigueli.ai." — tela na cor, marca oficial em branco */}
      <Scene t={t} a={SC(1)[0]} b={SC(1)[1]} bg={AC} enter="whipR" exit="zoomThrough"
        cam={[F(SC(1)[0], 540, 880, 1.26, -2), F(SC(1)[1], 540, 960, 1.02)]}>
        {() => (
          <Center y={960}>
            <Words t={t} size={66} color="rgba(255,255,255,0.85)" weight={600} items={[{ w: "Conheça", at: w(8) }, { w: "a", at: w(9) }]} />
            <div style={{ height: 40 }} />
            <div style={popStyle(t, w(10) - 0.3, 0.65, -12)}><Mark s={300} white /></div>
            <div style={{ height: 30 }} />
            <Letters t={t} text="Brigueli.ai" at={w(10)} size={140} color="#fff" weight={800} />
          </Center>
        )}
      </Scene>

      {/* 3 · "Escolha o nicho e a cidade, e encontre empresas reais com telefone e WhatsApp." — celular: busca, mão no botão, resultados */}
      <Scene t={t} a={SC(2)[0]} b={SC(2)[1]} bg={BG} enter="zoomIn" exit="whipL"
        cam={[F(SC(2)[0], 540, 330, 1.28, -1), F(w(19) - 0.2, 590, 1000, 1.26, 0, 0, -3), F(w(25) - 0.2, 540, 1240, 1.04), F(SC(2)[1], 540, 1240, 1.08)]}>
        {() => {
          const tap = w(21) - 0.02;
          const rows = [{ n: "Barbearia do João", i: 22 }, { n: "Studio Premium", i: 23 }];
          return (
            <>
              <Center y={330}>
                <Words t={t} size={58} color={MUTE} weight={600} items={[{ w: "Escolha", at: w(14), color: INK, weight: 800 }, { w: "o", at: w(15) }]} />
                <Letters t={t} text="nicho" at={w(16)} size={124} color={AC} weight={800} />
              </Center>
              <div style={{ position: "absolute", left: 270, top: 560, transform: `translateY(${(1 - E.outExpo(prog(t, SC(2)[0] + 0.2, 0.9))) * 900}px)` }}>
                <PhoneOutline w={540} h={900} ink={INK}>
                  <div style={{ position: "absolute", left: 0, right: 0, top: 96, display: "flex", flexDirection: "column", alignItems: "center", gap: 22 }}>
                    <div style={{ fontSize: 34, fontWeight: 800, color: INK }}>Nova prospecção</div>
                    <div style={{ width: 440, height: 86, borderRadius: 43, border: `5px solid ${SOFT}`, display: "flex", alignItems: "center", gap: 16, padding: "0 28px", fontSize: 34, fontWeight: 700, color: INK, ...popStyle(t, w(16) - 0.1, 0.45) }}><Ic k="search" s={34} c={AC} />Barbearias</div>
                    <div style={{ width: 440, height: 86, borderRadius: 43, border: `5px solid ${SOFT}`, display: "flex", alignItems: "center", gap: 16, padding: "0 28px", fontSize: 34, fontWeight: 700, color: INK, ...popStyle(t, w(19) - 0.1, 0.45) }}><Ic k="pin" s={34} c={AC} />Campinas, SP</div>
                    <div style={{ width: 440, height: 92, borderRadius: 46, background: t > tap ? ACD : AC, display: "grid", placeItems: "center", fontSize: 36, fontWeight: 800, color: "#fff", ...popStyle(t, w(20) - 0.2, 0.45) }}>{t > tap ? "Buscando…" : "Buscar"}</div>
                  </div>
                  {rows.map((r, j) => (
                    <div key={j} style={{ position: "absolute", left: 38, top: 530 + j * 170, width: 440, height: 140, borderRadius: 36, background: LIGHT, display: "flex", alignItems: "center", gap: 18, padding: "0 22px", ...popStyle(t, w(r.i) - 0.1, 0.5) }}>
                      <div style={{ width: 76, height: 76, borderRadius: 22, background: AC, display: "grid", placeItems: "center", flex: "none" }}><Ic k="store" s={46} c="#fff" /></div>
                      <div style={{ flex: 1, fontSize: 31, fontWeight: 800, color: INK, lineHeight: 1.12 }}>{r.n}</div>
                      <div style={{ display: "flex", gap: 12 }}>
                        <div style={popStyle(t, w(25) - 0.1 + j * 0.15, 0.45)}><Ic k="phone" s={40} c={INK} /></div>
                        <div style={popStyle(t, w(27) - 0.1 + j * 0.15, 0.45)}><Ic k="chat" s={40} c={AC} /></div>
                      </div>
                    </div>
                  ))}
                </PhoneOutline>
              </div>
              <Hand t={t} from={[1000, 1800]} to={[540, 1020]} at={w(20) + 0.1} tap={tap} leave={tap + 0.8} ripple={AC} />
              <Center y={1630}>
                <Words t={t} size={52} color={MUTE} weight={600} items={[{ w: "e", at: w(20) }, { w: "encontre", at: w(21), color: INK, weight: 800 }, { w: "empresas", at: w(22), color: INK, weight: 800 }, { w: "reais", at: w(23) }]} />
                <Letters t={t} text="com WhatsApp." at={w(24)} size={100} color={AC} weight={800} stagger={0.03} />
              </Center>
            </>
          );
        }}
      </Scene>

      {/* 4 · "Os leads ficam organizados, com nota de potencial." — cards que deslizam com notas contando */}
      <Scene t={t} a={SC(3)[0]} b={SC(3)[1]} bg={BG} enter="whipR" exit="zoomThrough"
        cam={[F(SC(3)[0], 540, 420, 1.28, -1), F(w(31) + 0.3, 540, 860, 1.24, 0, 3), F(w(35) - 0.2, 540, 1150, 1.2, 0, 0, -3), F(SC(3)[1], 540, 1100, 1.04)]}>
        {() => {
          const L = [{ n: "Barbearia do João", v: 92 }, { n: "Studio Premium", v: 87 }, { n: "Salão Bela Vista", v: 74 }];
          return (
            <>
              <Center y={330}>
                <Words t={t} size={58} color={MUTE} weight={600} items={[{ w: "Os", at: w(28) }, { w: "leads", at: w(29), color: INK, weight: 800 }, { w: "ficam", at: w(30) }]} />
                <Letters t={t} text="organizados," at={w(31)} size={116} color={AC} weight={800} stagger={0.03} />
              </Center>
              {L.map((r, j) => {
                const v = Math.round(ip(t, [w(33) - 0.1 + j * 0.15, w(35) + 0.5 + j * 0.15], [0, r.v], E.outQuint));
                return (
                  <div key={j} style={{ position: "absolute", left: 110, top: 540 + j * 210, width: 860, height: 180, borderRadius: 48, background: t > w(33) ? LIGHT : SOFT, display: "flex", alignItems: "center", gap: 30, padding: "0 36px", ...slideStyle(t, w(31) - 0.4 + j * 0.22, j % 2 ? 900 : -900, 0.6) }}>
                    <div style={{ width: 112, height: 112, borderRadius: 30, background: AC, display: "grid", placeItems: "center", flex: "none" }}><Ic k="store" s={66} c="#fff" /></div>
                    <div style={{ flex: 1, fontSize: 46, fontWeight: 800, color: INK, lineHeight: 1.1 }}>{r.n}</div>
                    <div style={{ textAlign: "center", opacity: t > w(33) - 0.1 ? 1 : 0 }}>
                      <div style={{ fontSize: 28, fontWeight: 700, color: MUTE }}>nota</div>
                      <div style={{ fontSize: 76, fontWeight: 800, color: AC, letterSpacing: "-0.04em", fontVariantNumeric: "tabular-nums", lineHeight: 1 }}>{v}</div>
                    </div>
                  </div>
                );
              })}
              <Center y={1400}>
                <Words t={t} size={56} color={MUTE} weight={600} items={[{ w: "com", at: w(32) }, { w: "nota", at: w(33), color: INK, weight: 800 }, { w: "de", at: w(34) }]} />
                <Letters t={t} text="potencial." at={w(35)} size={116} color={AC} weight={800} stagger={0.03} />
              </Center>
            </>
          );
        }}
      </Scene>

      {/* 5 · "Tem dashboard de clientes e vendas, em real, dólar ou euro." — painel 2×2, gráfico e moedas tocadas pela mão */}
      <Scene t={t} a={SC(4)[0]} b={SC(4)[1]} bg={BG} enter="zoomIn" exit="whipL"
        cam={[F(SC(4)[0], 540, 330, 1.28, -1), F(SC(4)[0] + 1.4, 540, 700, 1.26, -1, 3), F(SC(4)[0] + 3.0, 540, 1180, 1.24, 1, 0, -3), F(SC(4)[1], 540, 1300, 1.06)]}>
        {() => {
          const C = [{ k: "people", s: "Clientes", i: 39 }, { k: "cart", s: "Vendas", i: 41 }, { k: "bill", s: "Recebido", i: 41 }, { k: "chart", s: "Lucro", i: 41 }];
          const chart = E.inOut(prog(t, w(41) + 0.2, 1.4));
          const taps = [w(43) - 0.02, w(44) - 0.02, w(46) - 0.02];
          const active = taps.filter((x) => t >= x).length - 1;
          const chips = [{ s: "R$ Real", x: 266 }, { s: "US$ Dólar", x: 546 }, { s: "€ Euro", x: 826 }];
          return (
            <>
              <Center y={300}>
                <Words t={t} size={58} color={MUTE} weight={600} items={[{ w: "Tem", at: w(36) }]} />
                <Letters t={t} text="dashboard" at={w(37)} size={124} color={INK} weight={800} />
              </Center>
              <div style={{ position: "absolute", left: 90, top: 470, width: 900, height: 1000, borderRadius: 56, border: `6px solid ${INK}`, background: "#fff", ...slideStyle(t, SC(4)[0] + 0.2, 1000, 0.7) }}>
                <div style={{ position: "absolute", left: 40, top: 30, display: "flex", alignItems: "center", gap: 16 }}><Mark s={60} /><div style={{ fontSize: 36, fontWeight: 800, color: INK }}>Brigueli.ai</div></div>
                {C.map((c, j) => (
                  <div key={j} style={{ position: "absolute", left: 40 + (j % 2) * 420, top: 120 + Math.floor(j / 2) * 220, width: 390, height: 200, borderRadius: 40, background: t > w(c.i) ? LIGHT : SOFT, display: "flex", flexDirection: "column", justifyContent: "center", gap: 14, padding: "0 34px", ...popStyle(t, w(c.i) - 0.2 + (j > 1 ? (j - 1) * 0.12 : 0), 0.5) }}>
                    <div style={{ width: 76, height: 76, borderRadius: 22, background: AC, display: "grid", placeItems: "center" }}><Ic k={c.k} s={46} c="#fff" /></div>
                    <div style={{ fontSize: 44, fontWeight: 800, color: INK }}>{c.s}</div>
                  </div>
                ))}
                <svg width={820} height={200} style={{ position: "absolute", left: 40, top: 570 }}>
                  <path d="M10 180 H810" stroke={SOFT} strokeWidth={6} />
                  <path d="M10 160 C90 152 120 120 200 126 C280 132 300 90 380 84 C460 78 480 104 560 70 C640 36 700 50 810 14" fill="none" stroke={AC} strokeWidth={12} strokeLinecap="round" pathLength={1} strokeDasharray="1 1" strokeDashoffset={1 - chart} />
                </svg>
                {chips.map((c, j) => (
                  <div key={j} style={{ position: "absolute", left: c.x - 226, top: 820, width: 260, height: 100, borderRadius: 50, background: active === j ? AC : SOFT, display: "grid", placeItems: "center", fontSize: 38, fontWeight: 800, color: active === j ? "#fff" : INK, ...popStyle(t, w(42) - 0.1 + j * 0.12, 0.45) }}>{c.s}</div>
                ))}
              </div>
              <Hand t={t} from={[1000, 1800]} to={[266, 1346]} at={w(42) + 0.2} tap={taps[0]!} until={w(43) + 0.2} ripple={AC} />
              <Hand t={t} from={[266, 1346]} to={[546, 1346]} at={w(43) + 0.2} tap={taps[1]!} until={w(44) + 0.2} ripple={AC} />
              <Hand t={t} from={[546, 1346]} to={[826, 1346]} at={w(44) + 0.2} tap={taps[2]!} leave={w(46) + 0.6} ripple={AC} />
              <Center y={1660}>
                <Words t={t} size={52} color={MUTE} weight={600} items={[{ w: "de", at: w(38) }, { w: "clientes", at: w(39), color: INK, weight: 800 }, { w: "e", at: w(40) }, { w: "vendas,", at: w(41), color: INK, weight: 800 }, { w: "em", at: w(42) }]} />
                <Letters t={t} text="real, dólar ou euro." at={w(43)} size={84} color={AC} weight={800} stagger={0.03} />
              </Center>
            </>
          );
        }}
      </Scene>

      {/* 6 · "E uma biblioteca com mais de trezentos prompts, skills e agents." — contador 300+ e três blocos */}
      <Scene t={t} a={SC(5)[0]} b={SC(5)[1]} bg={BG} enter="whipR" exit="zoomThrough"
        cam={[F(SC(5)[0], 540, 560, 1.28, -1), F(w(53) - 0.2, 540, 840, 1.24, 0, 3), F(w(55), 540, 1260, 1.22, 0, 0, -3), F(SC(5)[1], 540, 1100, 1.05)]}>
        {() => {
          const n = Math.round(ip(t, [w(51) - 0.1, w(53) + 0.4], [0, 300], E.outQuint));
          const K = [{ k: "spark", s: "Prompts", i: 54, x: 130 }, { k: "bolt", s: "Skills", i: 55, x: 425 }, { k: "bot", s: "Agents", i: 57, x: 720 }];
          return (
            <>
              <Center y={330}>
                <Words t={t} size={58} color={MUTE} weight={600} items={[{ w: "E", at: w(47) }, { w: "uma", at: w(48) }, { w: "biblioteca", at: w(49), color: INK, weight: 800 }, { w: "com", at: w(50) }]} />
              </Center>
              <Center y={760}>
                <Words t={t} size={58} color={MUTE} weight={600} items={[{ w: "mais", at: w(51) }, { w: "de", at: w(52) }]} />
                <div style={{ fontSize: 300, fontWeight: 800, letterSpacing: "-0.04em", color: AC, lineHeight: 1, fontVariantNumeric: "tabular-nums", ...popStyle(t, w(51) - 0.15, 0.55) }}>{n}+</div>
              </Center>
              {K.map((x, j) => (
                <div key={j} style={{ position: "absolute", left: x.x, top: 1100, width: 230, display: "flex", flexDirection: "column", alignItems: "center", gap: 18, ...popStyle(t, w(x.i) - 0.2, 0.5, j % 2 ? 10 : -10) }}>
                  <Tile k={x.k} s={230} on={j === 0} />
                  <div style={{ fontSize: 46, fontWeight: 800, color: INK }}>{x.s}</div>
                </div>
              ))}
            </>
          );
        }}
      </Scene>

      {/* 7 · "Quer começar? O plano Starter é grátis, sem cartão." — tela na cor, "Grátis" gigante e cartão riscado */}
      <Scene t={t} a={SC(6)[0]} b={SC(6)[1]} bg={AC} enter="zoomIn" exit="zoomThrough"
        cam={[F(SC(6)[0], 540, 520, 1.28, -1), F(w(64) - 0.2, 540, 1000, 1.2, 0, 3), F(SC(6)[1], 540, 1300, 1.06)]}>
        {() => {
          const strike = E.inOut(prog(t, w(66) - 0.1, 0.7));
          return (
            <>
              <Center y={380}>
                <Letters t={t} text="Quer começar?" at={w(58)} size={112} color="#fff" weight={800} stagger={0.03} />
              </Center>
              <Center y={700}>
                <Words t={t} size={60} color="rgba(255,255,255,0.85)" weight={600} items={[{ w: "O", at: w(60) }, { w: "plano", at: w(61) }, { w: "Starter", at: w(62), color: "#fff", weight: 800 }, { w: "é", at: w(63) }]} />
              </Center>
              <Center y={1000}>
                <div style={{ fontSize: 290, fontWeight: 800, letterSpacing: "-0.05em", color: "#fff", lineHeight: 1, ...popStyle(t, w(64) - 0.15, 0.6, -6) }}>Grátis</div>
              </Center>
              <div style={{ position: "absolute", left: 540 - 125, top: 1290, ...popStyle(t, w(65) - 0.2, 0.5, -8) }}><div style={{ width: 250, height: 250, borderRadius: 60, background: "#fff", display: "grid", placeItems: "center" }}><Ic k="card" s={140} c={AC} /></div></div>
              <svg width={W} height={1920} style={{ position: "absolute", left: 0, top: 0 }}>
                <path d="M380 1560 C470 1470 600 1380 700 1290" fill="none" stroke={INK} strokeWidth={14} strokeLinecap="round" pathLength={1} strokeDasharray="1 1" strokeDashoffset={1 - strike} />
              </svg>
              <Center y={1640}>
                <Words t={t} size={60} color="rgba(255,255,255,0.85)" weight={600} items={[{ w: "sem", at: w(65), color: "#fff", weight: 800 }, { w: "cartão.", at: w(66), color: "#fff", weight: 800 }]} />
              </Center>
            </>
          );
        }}
      </Scene>

      {/* 8 · "Brigueli.ai. Prospecção inteligente com IA." — marca oficial + slogan do site (hold) */}
      <Scene t={t} a={SC(7)[0]} b={SC(7)[1]} bg={BG} enter="pop" exit="none" drift={0.4}
        cam={[F(SC(7)[0], 540, 800, 1.26, -1), F(w(71), 540, 960, 1.0), F(SC(7)[1], 540, 960, 1.05)]}>
        {() => (
          <>
            <Center y={760}>
              <div style={popStyle(t, w(67) - 0.25, 0.65, -12)}><Mark s={300} /></div>
              <div style={{ height: 30 }} />
              <Letters t={t} text="Brigueli.ai" at={w(67)} size={130} color={INK} weight={800} />
            </Center>
            <Center y={1250}>
              <Words t={t} size={58} color={MUTE} weight={600} items={[{ w: "Prospecção", at: w(71), color: INK, weight: 800 }]} />
              <Letters t={t} text="inteligente com IA." at={w(72)} size={84} color={AC} weight={800} stagger={0.025} />
              <Underline t={t} at={w(75) + 0.3} width={520} color={AC} thick={12} />
              <div style={{ height: 36 }} />
              <Words t={t} size={50} color={MUTE} weight={700} items={[{ w: "brigueli-ai.online", at: w(75) + 0.7 }]} />
            </Center>
          </>
        )}
      </Scene>

      {watermark && (
        <AbsoluteFill style={{ pointerEvents: "none" }}>
          <div style={{ position: "absolute", left: 66, bottom: 420, padding: "12px 22px", borderRadius: 999, background: "rgba(20,18,16,0.55)", color: "rgba(255,255,255,0.95)", font: `800 30px ${FONT}` }}>◆ {WATERMARK}</div>
          <div style={{ position: "absolute", left: "50%", top: "50%", transform: "translate(-50%,-50%) rotate(-30deg)", font: `900 150px ${FONT}`, letterSpacing: "0.04em", color: "rgba(128,128,128,0.16)", whiteSpace: "nowrap" }}>{WATERMARK.toUpperCase()}</div>
        </AbsoluteFill>
      )}
      <Soundtrack fps={fps} />
    </AbsoluteFill>
  );
};

/* ---------------- som: só nas ações importantes (sem tique por palavra, sem rajada de tick) ---------------- */
type Fx = [number, string, number];
const sfxList = (): Fx[] => {
  const L: Fx[] = [];
  B.slice(1).forEach((b, i) => { L.push([b - 0.32, i % 3 === 1 ? "zoom.mp3" : "whoosh.mp3", 0.3]); L.push([b - 0.02, "swoosh.mp3", 0.16]); });
  const add = (at: number, f: string, v: number) => L.push([at, f, v]);
  add(0.02, "text-in.mp3", 0.2);
  // 1 · hook
  [3, 4, 5].forEach((i) => add(w(i) - 0.15, "pop.mp3", 0.22)); add(w(5) - 0.1, "scribble.mp3", 0.24); add(w(6) - 0.15, "zoomin.mp3", 0.18); add(w(7) + 0.5, "scribble.mp3", 0.22);
  // 2 · marca
  add(w(10) - 0.3, "reveal.mp3", 0.34); add(w(10) - 0.3, "sparkle.mp3", 0.22);
  // 3 · celular com busca
  add(SC(2)[0] + 0.2, "swish.mp3", 0.24); add(w(16) - 0.1, "pop.mp3", 0.22); add(w(19) - 0.1, "pop.mp3", 0.22); add(w(20) - 0.2, "pop.mp3", 0.22); add(w(21) - 0.02, "click.mp3", 0.34);
  add(w(22) - 0.1, "pop.mp3", 0.26); add(w(23) - 0.1, "pop.mp3", 0.22); add(w(25) - 0.1, "pop.mp3", 0.2); add(w(27) - 0.1, "pop.mp3", 0.2);
  // 4 · leads com nota
  [0, 1, 2].forEach((j) => add(w(31) - 0.4 + j * 0.22, "swish.mp3", 0.2)); add(w(33) - 0.1, "tick.mp3", 0.13); add(w(35) + 0.5, "notify.mp3", 0.28);
  // 5 · dashboard
  add(SC(4)[0] + 0.2, "swish.mp3", 0.24); [39, 41].forEach((i) => add(w(i) - 0.2, "pop.mp3", 0.2)); add(w(41) - 0.08, "pop.mp3", 0.2); add(w(41) + 0.04, "pop.mp3", 0.2); add(w(41) + 0.2, "scribble.mp3", 0.22);
  add(w(43) - 0.02, "click.mp3", 0.34); add(w(44) - 0.02, "click.mp3", 0.34); add(w(46) - 0.02, "click.mp3", 0.34);
  // 6 · biblioteca
  add(w(51) - 0.15, "pop.mp3", 0.28); add(w(51) - 0.1, "tick.mp3", 0.13); add(w(53) + 0.4, "notify.mp3", 0.28); [54, 55, 57].forEach((i) => add(w(i) - 0.2, "pop.mp3", 0.24));
  // 7 · preço
  add(w(64) - 0.15, "zoomin.mp3", 0.18); add(w(64) - 0.15, "pop.mp3", 0.28); add(w(65) - 0.2, "pop.mp3", 0.24); add(w(66) - 0.1, "scribble.mp3", 0.24);
  // 8 · final
  add(w(67) - 0.25, "reveal.mp3", 0.34); add(w(67) - 0.25, "sparkle.mp3", 0.24); add(w(75) + 0.3, "scribble.mp3", 0.26); add(w(75) + 1.0, "stamp.mp3", 0.2);
  return L.filter(([at]) => at >= 0 && at < TOTAL);
};

const Soundtrack: React.FC<{ fps: number }> = ({ fps }) => {
  const fx = React.useMemo(sfxList, []);
  return (
    <>
      <Audio src={staticFile("audio/voiceover.mp3")} volume={1} />
      <Audio src={staticFile("audio/music.mp3")} volume={(f) => {
        const s = f / fps; const talking = words.some((x) => s > x.start - 0.15 && s < x.end + 0.25);
        return (talking ? 0.07 : 0.16) * Math.max(0, Math.min(1, (TOTAL - s) / 2.5));
      }} />
      {fx.map(([at, f, v], i) => (
        <Sequence key={i} from={Math.round(at * fps)} durationInFrames={Math.round(1.6 * fps)}>
          <Audio src={staticFile(`sfx/${f}`)} volume={v} />
        </Sequence>
      ))}
    </>
  );
};
