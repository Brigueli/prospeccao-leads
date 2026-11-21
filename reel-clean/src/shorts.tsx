import React from "react";
import { useVideoConfig } from "remotion";
import {
  AC, ACD, BG, INK, LIGHT, MUTE, SOFT, Center, Closing, E, F, Hand, Ic, LeadCards, Letters, Mark, PhoneSearch, Scene, Soundtrack,
  Stage, Tile, Underline, Words, W, ip, popStyle, prog, slideStyle, baseFx, timeline,
} from "./kit";
import type { Fx } from "./kit";
import { useSec } from "./lib";
import T1 from "../public/audio/v1-timings.json";
import T2 from "../public/audio/v2-timings.json";
import T3 from "../public/audio/v3-timings.json";
import T4 from "../public/audio/v4-timings.json";
import T5 from "../public/audio/v5-timings.json";
import T6 from "../public/audio/v6-timings.json";
import T7 from "../public/audio/v7-timings.json";
import T8 from "../public/audio/v8-timings.json";
import T9 from "../public/audio/v9-timings.json";

/* 9 vídeos curtos · Brigueli.ai · Motion Clean · 9:16 · ciano #08CADB e branco · 120 fps
   Fatos (brigueli-ai.online): busca por nicho e cidade; empresas com telefone e WhatsApp; leads com nota de potencial;
   dashboard com clientes, vendas, recebido e lucro estimado em real/dólar/euro; biblioteca com mais de 300 prompts, skills e agents;
   criador de prompt com IA; plano Starter gratuito, sem cartão. Ilustrativo: nomes de empresas, notas e telas. */

type C = React.FC<{ watermark: boolean }>;
export type Short = { id: string; Comp: C; TOTAL: number };
const bold = { color: INK, weight: 800 } as const;
const mk = (id: string, TOTAL: number, Comp: C): Short => ({ id, Comp, TOTAL });
const wm = (n: number) => `v${n}`;

/* ============ V1 · "Cliente não cai do céu." ============ */
const v1 = (() => {
  const { words, w, TOTAL, B, SC } = timeline(T1, [0, 8, 13, 31, 40]);
  const fx: Fx[] = [...baseFx(B), [w(2) - 0.15, "pop.mp3", 0.24], [w(5) - 0.15, "pop.mp3", 0.24], [w(6) - 0.15, "zoomin.mp3", 0.18],
    [w(10) - 0.2, "pop.mp3", 0.26], [w(11) - 0.1, "scribble.mp3", 0.26],
    [SC(2)[0] + 0.2, "swish.mp3", 0.24], [w(21) - 0.1, "pop.mp3", 0.22], [w(24) - 0.1, "pop.mp3", 0.22], [w(25) - 0.2, "pop.mp3", 0.22], [w(27) - 0.02, "click.mp3", 0.34], [w(28) - 0.1, "pop.mp3", 0.26], [w(29) - 0.1, "pop.mp3", 0.22],
    [w(32) - 0.2, "swish.mp3", 0.2], [w(34) - 0.1, "pop.mp3", 0.22], [w(36) - 0.1, "pop.mp3", 0.22], [w(39), "notify.mp3", 0.26],
    [w(40) - 0.25, "reveal.mp3", 0.34], [w(40) - 0.25, "sparkle.mp3", 0.22], [w(44) + 0.4, "scribble.mp3", 0.26], [w(44) + 1.2, "stamp.mp3", 0.2]];
  const Comp: C = () => {
    const t = useSec(); const { fps } = useVideoConfig();
    const strike = E.inOut(prog(t, w(11) - 0.1, 0.7));
    const on = t > w(5);
    return (
      <Stage>
        <Scene t={t} a={SC(0)[0]} b={SC(0)[1]} bg={BG} enter="none" exit="whipL" cam={[F(0, 540, 560, 1.28, -1), F(SC(0)[1], 540, 1000, 1.04)]}>
          {() => (
            <>
              <Center y={470}>
                <Words t={t} size={62} color={MUTE} weight={600} items={[{ w: "Você", at: w(0) }, { w: "espera", at: w(1), ...bold }, { w: "cliente", at: w(2), ...bold }, { w: "chegar", at: w(3) }]} />
                <Words t={t} size={62} color={MUTE} weight={600} items={[{ w: "ou", at: w(4) }, { w: "vai", at: w(5), ...bold }]} />
              </Center>
              <div style={{ position: "absolute", left: 130, top: 760, width: 380, height: 340, borderRadius: 56, background: SOFT, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 20, ...popStyle(t, w(2) - 0.15, 0.55, -8) }}><Ic k="clock" s={130} /><div style={{ fontSize: 46, fontWeight: 800, color: INK }}>Esperar</div></div>
              <div style={{ position: "absolute", left: 570, top: 760, width: 380, height: 340, borderRadius: 56, background: on ? AC : SOFT, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 20, ...popStyle(t, w(5) - 0.15, 0.55, 8) }}><Ic k="search" s={130} c={on ? "#fff" : INK} /><div style={{ fontSize: 46, fontWeight: 800, color: on ? "#fff" : INK }}>Ir atrás</div></div>
              <Center y={1390}><Letters t={t} text="atrás dele?" at={w(6)} size={124} color={AC} weight={800} stagger={0.03} /><Underline t={t} at={w(7) + 0.3} width={480} color={AC} thick={12} /></Center>
            </>
          )}
        </Scene>
        <Scene t={t} a={SC(1)[0]} b={SC(1)[1]} bg={AC} enter="whipR" exit="zoomThrough" cam={[F(SC(1)[0], 540, 900, 1.26, -2), F(SC(1)[1], 540, 960, 1.02)]}>
          {() => (
            <>
              <Center y={640}>
                <Words t={t} size={70} color="#fff" weight={800} items={[{ w: "Cliente", at: w(8) }]} />
                <Letters t={t} text="não cai do céu." at={w(9)} size={112} color="#fff" weight={800} stagger={0.03} />
              </Center>
              <div style={{ position: "absolute", left: 410, top: 1000, ...popStyle(t, w(10) - 0.2, 0.55, -8) }}><div style={{ width: 260, height: 260, borderRadius: 62, background: "#fff", display: "grid", placeItems: "center" }}><Ic k="cloud" s={150} c={AC} /></div></div>
              <svg width={W} height={1920} style={{ position: "absolute", left: 0, top: 0 }}><path d="M390 1290 C470 1190 600 1090 690 1010" fill="none" stroke={INK} strokeWidth={14} strokeLinecap="round" pathLength={1} strokeDasharray="1 1" strokeDashoffset={1 - strike} /></svg>
            </>
          )}
        </Scene>
        <Scene t={t} a={SC(2)[0]} b={SC(2)[1]} bg={BG} enter="zoomIn" exit="whipL" cam={[F(SC(2)[0], 540, 330, 1.28, -1), F(w(24) - 0.2, 590, 1000, 1.26, 0, 0, -3), F(SC(2)[1], 540, 1240, 1.06)]}>
          {() => (
            <>
              <Center y={330}>
                <Words t={t} size={58} color={MUTE} weight={600} items={[{ w: "Na", at: w(13) }, { w: "Brigueli.ai,", at: w(14), ...bold }, { w: "você", at: w(18) }, { w: "escolhe", at: w(19), ...bold }, { w: "o", at: w(20) }]} />
                <Letters t={t} text="nicho e cidade," at={w(21)} size={112} color={AC} weight={800} stagger={0.03} />
              </Center>
              <PhoneSearch t={t} a={SC(2)[0]} nicho="Barbearias" cidade="Campinas, SP" nichoAt={w(21)} cidadeAt={w(24)} btnAt={w(25)} tap={w(27) - 0.02} rows={[{ n: "Barbearia do João", at: w(28) }, { n: "Studio Premium", at: w(29) }]} />
              <Center y={1630}>
                <Words t={t} size={52} color={MUTE} weight={600} items={[{ w: "e", at: w(25) }, { w: "os", at: w(26) }, { w: "leads", at: w(27), ...bold }]} />
                <Letters t={t} text="aparecem na tela." at={w(28)} size={92} color={AC} weight={800} stagger={0.03} />
              </Center>
            </>
          )}
        </Scene>
        <Scene t={t} a={SC(3)[0]} b={SC(3)[1]} bg={BG} enter="whipR" exit="zoomThrough" cam={[F(SC(3)[0], 540, 420, 1.28, -1), F(w(35) - 0.2, 540, 900, 1.22, 0, 3), F(SC(3)[1], 540, 1000, 1.04)]}>
          {() => (
            <>
              <Center y={330}>
                <Words t={t} size={58} color={MUTE} weight={600} items={[{ w: "Empresas", at: w(31), ...bold }, { w: "reais,", at: w(32), ...bold }, { w: "com", at: w(33) }]} />
                <Letters t={t} text="telefone" at={w(34)} size={116} color={AC} weight={800} stagger={0.03} />
                <Letters t={t} text="e WhatsApp." at={w(35)} size={116} color={AC} weight={800} stagger={0.03} />
              </Center>
              <LeadCards t={t} top={640} names={["Barbearia do João", "Studio Premium"]} slideAt={w(32) - 0.2} phoneAt={w(34)} chatAt={w(36)} />
              <Center y={1400}>
                <Words t={t} size={56} color={MUTE} weight={600} items={[{ w: "É", at: w(37) }, { w: "só", at: w(38) }]} />
                <Letters t={t} text="abordar." at={w(39)} size={124} color={AC} weight={800} stagger={0.03} />
              </Center>
            </>
          )}
        </Scene>
        <Closing t={t} a={SC(4)[0]} b={SC(4)[1]} markAt={w(40)}>
          <Words t={t} size={58} color={MUTE} weight={600} items={[{ w: "O", at: w(40) }, { w: "plano", at: w(41) }, { w: "Starter", at: w(42), ...bold }, { w: "é", at: w(43) }]} />
          <Letters t={t} text="grátis." at={w(44)} size={120} color={AC} weight={800} />
          <Underline t={t} at={w(44) + 0.4} width={400} color={AC} thick={12} />
          <div style={{ height: 30 }} />
          <Words t={t} size={50} color={MUTE} weight={700} items={[{ w: "brigueli-ai.online", at: w(44) + 0.9 }]} />
        </Closing>
        <Soundtrack fps={fps} words={words} total={TOTAL} voice={wm(1)} fx={fx} />
      </Stage>
    );
  };
  return mk("V1", TOTAL, Comp);
})();

/* ============ V2 · Antes e depois da planilha ============ */
const v2 = (() => {
  const { words, w, TOTAL, B, SC } = timeline(T2, [0, 14, 17, 28]);
  const rowsM: [string, string][] = [["João", "9?? ??"], ["Maria (já falei?)", "—"], ["Studio ???", "8888-"], ["Dr. Paulo", "?"], ["João", "9?? ??"], ["Pet Bela", "sem tel."]];
  const rowAt = [w(0) + 0.5, w(2), w(2) + 0.3, w(4), w(4) + 0.3, w(8)];
  const fx: Fx[] = [...baseFx(B), ...rowAt.map((x): Fx => [x - 0.1, "pop.mp3", 0.2]), [w(12) - 0.1, "scribble.mp3", 0.28], [w(13) - 0.1, "scribble.mp3", 0.26],
    [w(15) - 0.2, "zoomin.mp3", 0.18], [w(20) - 0.4, "swish.mp3", 0.2], [w(20) - 0.18, "swish.mp3", 0.2], [w(20) + 0.04, "swish.mp3", 0.2], [w(22) - 0.1, "tick.mp3", 0.13], [w(24) + 0.5, "notify.mp3", 0.28],
    [w(31) - 0.25, "reveal.mp3", 0.34], [w(31) - 0.25, "sparkle.mp3", 0.22], [w(29) + 0.4, "scribble.mp3", 0.26], [w(31) + 1.3, "stamp.mp3", 0.2]];
  const Comp: C = () => {
    const t = useSec(); const { fps } = useVideoConfig();
    const x1 = E.inOut(prog(t, w(12) - 0.1, 0.9)), x2 = E.inOut(prog(t, w(13) - 0.1, 0.9));
    return (
      <Stage>
        <Scene t={t} a={SC(0)[0]} b={SC(0)[1]} bg={BG} enter="none" exit="whipL" cam={[F(0, 540, 520, 1.28, -1), F(2.4, 540, 900, 1.2, 0, 3), F(SC(0)[1], 540, 1000, 1.04)]}>
          {() => (
            <>
              <Center y={310}>
                <Letters t={t} text="Planilha" at={w(0)} size={120} color={AC} weight={800} stagger={0.03} />
                <Letters t={t} text="bagunçada?" at={w(1)} size={120} color={AC} weight={800} stagger={0.03} />
              </Center>
              <div style={{ position: "absolute", left: 110, top: 540, width: 860, height: 880, borderRadius: 48, background: "#fff", border: `6px solid ${INK}`, overflow: "hidden", ...popStyle(t, w(0) - 0.1, 0.6) }}>
                <div style={{ height: 90, background: SOFT, display: "flex", alignItems: "center", padding: "0 36px", fontSize: 36, fontWeight: 800, color: INK, gap: 18 }}><Ic k="sheet" s={44} />Leads_final_v7.xlsx</div>
                {rowsM.map((r, j) => (
                  <div key={j} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", height: 118, padding: "0 40px", borderTop: `3px solid ${SOFT}`, fontSize: 42, fontWeight: 700, color: INK, transform: `rotate(${(j % 3 - 1) * 1.8}deg) translateX(${j % 2 ? 16 : -14}px)`, ...popStyle(t, rowAt[j]!, 0.4) }}>
                    <span>{r[0]}</span><span style={{ color: MUTE }}>{r[1]}</span>
                  </div>
                ))}
              </div>
              <svg width={W} height={1920} style={{ position: "absolute", left: 0, top: 0 }}>
                <path d="M150 580 C400 760 700 1120 960 1390" fill="none" stroke={AC} strokeWidth={18} strokeLinecap="round" pathLength={1} strokeDasharray="1 1" strokeDashoffset={1 - x1} />
                <path d="M960 580 C700 760 400 1120 150 1390" fill="none" stroke={AC} strokeWidth={18} strokeLinecap="round" pathLength={1} strokeDasharray="1 1" strokeDashoffset={1 - x2} />
              </svg>
              <Center y={1630}>
                <Words t={t} size={50} color={MUTE} weight={600} items={[{ w: "e", at: w(7) }, { w: "ninguém", at: w(8), ...bold }, { w: "sabe", at: w(9) }, { w: "quem", at: w(10) }, { w: "já", at: w(11) }, { w: "foi", at: w(12) }, { w: "chamado.", at: w(13), ...bold }]} />
              </Center>
            </>
          )}
        </Scene>
        <Scene t={t} a={SC(1)[0]} b={SC(1)[1]} bg={AC} enter="whipR" exit="zoomThrough" cam={[F(SC(1)[0], 540, 900, 1.26, -2), F(SC(1)[1], 540, 960, 1.02)]}>
          {() => (
            <Center y={900}>
              <Words t={t} size={70} color="rgba(255,255,255,0.85)" weight={600} items={[{ w: "Agora", at: w(14) }]} />
              <Letters t={t} text="olha isso." at={w(15)} size={140} color="#fff" weight={800} />
            </Center>
          )}
        </Scene>
        <Scene t={t} a={SC(2)[0]} b={SC(2)[1]} bg={BG} enter="zoomIn" exit="whipL" cam={[F(SC(2)[0], 540, 420, 1.28, -1), F(w(22) - 0.2, 540, 860, 1.24, 0, 3), F(SC(2)[1], 540, 1100, 1.04)]}>
          {() => (
            <>
              <Center y={330}>
                <Words t={t} size={58} color={MUTE} weight={600} items={[{ w: "Os", at: w(17) }, { w: "leads", at: w(18), ...bold }, { w: "ficam", at: w(19) }]} />
                <Letters t={t} text="organizados," at={w(20)} size={116} color={AC} weight={800} stagger={0.03} />
              </Center>
              <LeadCards t={t} top={540} names={["Barbearia do João", "Studio Premium", "Salão Bela Vista"]} slideAt={w(20) - 0.4} scores={{ vals: [92, 87, 71], from: w(22), to: w(24) }} />
              <Center y={1360}>
                <Words t={t} size={54} color={MUTE} weight={600} items={[{ w: "com", at: w(21) }, { w: "nota", at: w(22), ...bold }, { w: "de", at: w(23) }]} />
                <Letters t={t} text="potencial," at={w(24)} size={104} color={AC} weight={800} stagger={0.03} />
              </Center>
              <Center y={1620}>
                <Words t={t} size={54} color={MUTE} weight={600} items={[{ w: "num", at: w(25) }, { w: "só", at: w(26) }]} />
                <Letters t={t} text="lugar." at={w(27)} size={104} color={AC} weight={800} stagger={0.03} />
              </Center>
            </>
          )}
        </Scene>
        <Closing t={t} a={SC(3)[0]} b={SC(3)[1]} markAt={w(31)}>
          <Letters t={t} text="Teste grátis" at={w(28)} size={104} color={AC} weight={800} stagger={0.03} />
          <Underline t={t} at={w(29) + 0.4} width={460} color={AC} thick={12} />
        </Closing>
        <Soundtrack fps={fps} words={words} total={TOTAL} voice={wm(2)} fx={fx} />
      </Stage>
    );
  };
  return mk("V2", TOTAL, Comp);
})();

/* ============ V3 · 3 nichos que você ainda não prospectou ============ */
const v3 = (() => {
  const { words, w, TOTAL, B, SC } = timeline(T3, [0, 7, 14, 31]);
  const N = [{ k: "scissors", s: "Barbearias", i: 8 }, { k: "plus", s: "Clínicas", i: 10 }, { k: "paw", s: "Pet shops", i: 12 }];
  const fx: Fx[] = [...baseFx(B), [w(1) - 0.15, "pop.mp3", 0.22], [w(1) + 0.1, "pop.mp3", 0.22], [w(1) + 0.35, "pop.mp3", 0.22], [w(6) - 0.15, "zoomin.mp3", 0.18], [w(6) + 0.5, "scribble.mp3", 0.24],
    ...N.map((n): Fx => [w(n.i) - 0.4, "swish.mp3", 0.22]), ...N.map((n): Fx => [w(n.i) - 0.1, "pop.mp3", 0.24]),
    [SC(2)[0] + 0.2, "swish.mp3", 0.24], [w(18) - 0.1, "pop.mp3", 0.22], [w(21) - 0.1, "pop.mp3", 0.22], [w(22) - 0.2, "pop.mp3", 0.22], [w(24) - 0.02, "click.mp3", 0.34], [w(28) - 0.1, "pop.mp3", 0.26], [w(29) - 0.1, "pop.mp3", 0.22],
    [w(31) - 0.25, "reveal.mp3", 0.34], [w(31) - 0.25, "sparkle.mp3", 0.22], [w(35) + 0.4, "scribble.mp3", 0.26], [w(35) + 1.3, "stamp.mp3", 0.2]];
  const Comp: C = () => {
    const t = useSec(); const { fps } = useVideoConfig();
    return (
      <Stage>
        <Scene t={t} a={SC(0)[0]} b={SC(0)[1]} bg={BG} enter="none" exit="whipL" cam={[F(0, 540, 560, 1.28, -1), F(SC(0)[1], 540, 1000, 1.04)]}>
          {() => (
            <>
              <Center y={470}>
                <Words t={t} size={62} color={MUTE} weight={600} items={[{ w: "Três", at: w(0), ...bold }, { w: "nichos", at: w(1), ...bold }, { w: "que", at: w(2) }, { w: "você", at: w(3) }]} />
                <Words t={t} size={62} color={MUTE} weight={600} items={[{ w: "ainda", at: w(4) }, { w: "não", at: w(5) }]} />
              </Center>
              {[{ k: "scissors", x: 145 }, { k: "plus", x: 425 }, { k: "paw", x: 705 }].map((x, j) => (
                <div key={j} style={{ position: "absolute", left: x.x, top: 790, ...popStyle(t, w(1) - 0.15 + j * 0.25, 0.55, j % 2 ? 10 : -10) }}><Tile k={x.k} s={230} on={j === 1} /></div>
              ))}
              <Center y={1300}><Letters t={t} text="prospectou." at={w(6)} size={128} color={AC} weight={800} stagger={0.03} /><Underline t={t} at={w(6) + 0.6} width={500} color={AC} thick={12} /></Center>
            </>
          )}
        </Scene>
        <Scene t={t} a={SC(1)[0]} b={SC(1)[1]} bg={BG} enter="whipR" exit="zoomThrough" cam={[F(SC(1)[0], 540, 520, 1.28, -1), F(w(10) - 0.2, 540, 900, 1.22, 0, 3), F(SC(1)[1], 540, 1000, 1.04)]}>
          {() => (
            <>
              <Center y={310}><Words t={t} size={78} color={MUTE} weight={600} items={[{ w: "Um,", at: w(7), ...bold }, { w: "dois,", at: w(9), ...bold }, { w: "três.", at: w(11), ...bold }]} /></Center>
              {N.map((n, j) => {
                const on = t > w(n.i);
                return (
                  <div key={j} style={{ position: "absolute", left: 110, top: 480 + j * 260, width: 860, height: 220, borderRadius: 52, background: on ? LIGHT : SOFT, display: "flex", alignItems: "center", gap: 36, padding: "0 40px", ...slideStyle(t, w(n.i) - 0.4, j % 2 ? 900 : -900, 0.6) }}>
                    <div style={{ fontSize: 90, fontWeight: 800, color: AC, width: 70 }}>{j + 1}</div>
                    <div style={{ width: 128, height: 128, borderRadius: 34, background: AC, display: "grid", placeItems: "center", flex: "none" }}><Ic k={n.k} s={76} c="#fff" /></div>
                    <div style={{ flex: 1, fontSize: 60, fontWeight: 800, color: INK }}>{n.s}</div>
                  </div>
                );
              })}
            </>
          )}
        </Scene>
        <Scene t={t} a={SC(2)[0]} b={SC(2)[1]} bg={BG} enter="zoomIn" exit="whipL" cam={[F(SC(2)[0], 540, 330, 1.28, -1), F(w(21) - 0.2, 590, 1000, 1.26, 0, 0, -3), F(SC(2)[1], 540, 1240, 1.06)]}>
          {() => (
            <>
              <Center y={330}>
                <Words t={t} size={58} color={MUTE} weight={600} items={[{ w: "É", at: w(14) }, { w: "só", at: w(15) }, { w: "escolher", at: w(16), ...bold }, { w: "o", at: w(17) }]} />
                <Letters t={t} text="nicho e cidade," at={w(18)} size={112} color={AC} weight={800} stagger={0.03} />
              </Center>
              <PhoneSearch t={t} a={SC(2)[0]} nicho="Barbearias" cidade="Campinas, SP" nichoAt={w(18)} cidadeAt={w(21)} btnAt={w(22)} tap={w(24) - 0.02} rows={[{ n: "Barbearia do João", at: w(28) }, { n: "Studio Premium", at: w(29) }]} />
              <Center y={1630}>
                <Words t={t} size={52} color={MUTE} weight={600} items={[{ w: "e", at: w(22) }, { w: "a", at: w(23) }, { w: "Brigueli.ai", at: w(24), ...bold }]} />
                <Letters t={t} text="encontra as empresas." at={w(28)} size={78} color={AC} weight={800} stagger={0.025} />
              </Center>
            </>
          )}
        </Scene>
        <Closing t={t} a={SC(3)[0]} b={SC(3)[1]} markAt={w(31)}>
          <Words t={t} size={58} color={MUTE} weight={600} items={[{ w: "Qual", at: w(31), ...bold }, { w: "você", at: w(32) }, { w: "vai", at: w(33) }, { w: "testar", at: w(34), ...bold }]} />
          <Letters t={t} text="primeiro?" at={w(35)} size={116} color={AC} weight={800} stagger={0.03} />
          <Underline t={t} at={w(35) + 0.4} width={440} color={AC} thick={12} />
        </Closing>
        <Soundtrack fps={fps} words={words} total={TOTAL} voice={wm(3)} fx={fx} />
      </Stage>
    );
  };
  return mk("V3", TOTAL, Comp);
})();

/* ============ V4 · Prospecção em quatro passos ============ */
const v4 = (() => {
  const { words, w, TOTAL, B, SC } = timeline(T4, [0, 4, 23]);
  const S = [{ k: "search", s: "Escolha o nicho", at: 5, ck: 7 }, { k: "pin", s: "Escolha a cidade", at: 9, ck: 11 }, { k: "store", s: "Veja as empresas", at: 13, ck: 16 }, { k: "chat", s: "Abra o WhatsApp", at: 18, ck: 22 }];
  const fx: Fx[] = [...baseFx(B), [w(2) - 0.15, "zoomin.mp3", 0.18], [w(2) - 0.15, "pop.mp3", 0.22], [w(2) + 0.0, "pop.mp3", 0.2], [w(2) + 0.15, "pop.mp3", 0.2], [w(2) + 0.3, "pop.mp3", 0.2],
    ...S.map((s): Fx => [w(s.at) - 0.4, "swish.mp3", 0.22]), ...S.map((s): Fx => [w(s.ck) + 0.3, "pop.mp3", 0.24]), [w(22) - 0.05, "click.mp3", 0.34], [w(22) + 0.3, "notify.mp3", 0.28],
    [w(26) - 0.25, "reveal.mp3", 0.34], [w(26) - 0.25, "sparkle.mp3", 0.22], [w(24) + 0.4, "scribble.mp3", 0.26], [w(29) + 1.0, "stamp.mp3", 0.2]];
  const Comp: C = () => {
    const t = useSec(); const { fps } = useVideoConfig();
    return (
      <Stage>
        <Scene t={t} a={SC(0)[0]} b={SC(0)[1]} bg={BG} enter="none" exit="whipL" cam={[F(0, 540, 560, 1.28, -1), F(SC(0)[1], 540, 1000, 1.04)]}>
          {() => (
            <>
              <Center y={520}>
                <Words t={t} size={64} color={MUTE} weight={600} items={[{ w: "Prospecção", at: w(0), ...bold }, { w: "em", at: w(1) }]} />
                <Letters t={t} text="quatro" at={w(2)} size={170} color={AC} weight={800} stagger={0.03} />
                <Letters t={t} text="passos." at={w(3)} size={170} color={AC} weight={800} stagger={0.03} />
              </Center>
              <div style={{ position: "absolute", left: 0, top: 1060, width: W, display: "flex", justifyContent: "center", gap: 40 }}>
                {[1, 2, 3, 4].map((n, j) => (
                  <div key={n} style={{ width: 170, height: 170, borderRadius: 42, background: j === 0 ? AC : SOFT, display: "grid", placeItems: "center", fontSize: 96, fontWeight: 800, color: j === 0 ? "#fff" : INK, ...popStyle(t, w(2) - 0.1 + j * 0.15, 0.5, j % 2 ? 8 : -8) }}>{n}</div>
                ))}
              </div>
            </>
          )}
        </Scene>
        <Scene t={t} a={SC(1)[0]} b={SC(1)[1]} bg={BG} enter="whipR" exit="zoomThrough"
          cam={[F(SC(1)[0], 540, 560, 1.28, -1), F(w(9) - 0.2, 540, 800, 1.24, 0, 3), F(w(13) - 0.2, 540, 1000, 1.24, 1, 0, -3), F(w(18) - 0.2, 540, 1250, 1.24, -1), F(SC(1)[1], 540, 1050, 1.05)]}>
          {() => (
            <>
              {S.map((s, j) => {
                const done = t > w(s.ck) + 0.3;
                return (
                  <div key={j} style={{ position: "absolute", left: 110, top: 360 + j * 270, width: 860, height: 230, borderRadius: 56, background: done ? LIGHT : SOFT, display: "flex", alignItems: "center", gap: 30, padding: "0 40px", ...slideStyle(t, w(s.at) - 0.4, j % 2 ? 900 : -900, 0.6) }}>
                    <div style={{ width: 130, height: 130, borderRadius: 36, background: AC, display: "grid", placeItems: "center", flex: "none" }}><Ic k={s.k} s={78} c="#fff" /></div>
                    <div style={{ flex: 1, fontSize: 30, fontWeight: 800, color: MUTE, lineHeight: 1 }}>PASSO {j + 1}<div style={{ fontSize: 52, color: INK, marginTop: 8 }}>{s.s}</div></div>
                    <div style={{ width: 66, height: 66, borderRadius: 20, background: done ? AC : "#fff", border: done ? "none" : `5px solid ${INK}`, display: "grid", placeItems: "center" }}>{done && <div style={popStyle(t, w(s.ck) + 0.3, 0.4)}><Ic k="check" s={42} c="#fff" /></div>}</div>
                  </div>
                );
              })}
              <Hand t={t} from={[1000, 1800]} to={[900, 1280]} at={w(22) - 1.0} tap={w(22) - 0.05} leave={w(22) + 0.9} ripple={AC} />
              <Center y={1560}>
                <Words t={t} size={54} color={MUTE} weight={600} items={[{ w: "Primeiro,", at: w(4) }, { w: "segundo,", at: w(8) }, { w: "terceiro,", at: w(12) }, { w: "quarto.", at: w(17), ...bold }]} />
              </Center>
            </>
          )}
        </Scene>
        <Closing t={t} a={SC(2)[0]} b={SC(2)[1]} markAt={w(26)}>
          <Letters t={t} text="Comece grátis" at={w(23)} size={104} color={AC} weight={800} stagger={0.03} />
          <Underline t={t} at={w(24) + 0.4} width={460} color={AC} thick={12} />
        </Closing>
        <Soundtrack fps={fps} words={words} total={TOTAL} voice={wm(4)} fx={fx} />
      </Stage>
    );
  };
  return mk("V4", TOTAL, Comp);
})();

/* ============ V5 · Quanto custa um cliente novo? (na mão x na plataforma) ============ */
const v5 = (() => {
  const { words, w, TOTAL, B, SC } = timeline(T5, [0, 5, 17, 31, 36]);
  const M = [{ k: "search", s: "Procurar empresa por empresa", at: 8, x: 11 }, { k: "phone", s: "Copiar telefone", at: 12, x: 13 }, { k: "sheet", s: "Montar planilha", at: 15, x: 16 }];
  const Pl = [{ k: "search", s: "Escolhe nicho e cidade", at: 20, ck: 23 }, { k: "store", s: "Vê os leads", at: 26, ck: 28 }, { k: "chat", s: "Com WhatsApp", at: 29, ck: 30 }];
  const fx: Fx[] = [...baseFx(B), [w(3) - 0.15, "pop.mp3", 0.26], [w(3) - 0.15, "zoomin.mp3", 0.18],
    ...M.map((m): Fx => [w(m.at) - 0.4, "swish.mp3", 0.22]), ...M.map((m): Fx => [w(m.x) + 0.15, "scribble.mp3", 0.24]),
    ...Pl.map((p): Fx => [w(p.at) - 0.4, "swish.mp3", 0.22]), ...Pl.map((p): Fx => [w(p.ck) + 0.2, "notify.mp3", 0.24]),
    [w(32) - 0.15, "pop.mp3", 0.26], [w(35) - 0.1, "zoomin.mp3", 0.18], [w(39) - 0.25, "reveal.mp3", 0.34], [w(39) - 0.25, "sparkle.mp3", 0.22], [w(37) + 0.4, "scribble.mp3", 0.26], [w(42) + 1.3, "stamp.mp3", 0.2]];
  const Comp: C = () => {
    const t = useSec(); const { fps } = useVideoConfig();
    return (
      <Stage>
        <Scene t={t} a={SC(0)[0]} b={SC(0)[1]} bg={BG} enter="none" exit="whipL" cam={[F(0, 540, 560, 1.28, -1), F(SC(0)[1], 540, 1000, 1.04)]}>
          {() => (
            <>
              <Center y={470}><Words t={t} size={66} color={MUTE} weight={600} items={[{ w: "Quanto", at: w(0), ...bold }, { w: "custa", at: w(1) }, { w: "um", at: w(2) }]} /></Center>
              <div style={{ position: "absolute", left: 540 - 150, top: 700, ...popStyle(t, w(3) - 0.15, 0.55, -10) }}><Tile k="people" s={300} on /></div>
              <Center y={1250}><Letters t={t} text="cliente novo?" at={w(3)} size={128} color={AC} weight={800} stagger={0.03} /><Underline t={t} at={w(4) + 0.3} width={520} color={AC} thick={12} /></Center>
            </>
          )}
        </Scene>
        <Scene t={t} a={SC(1)[0]} b={SC(1)[1]} bg={BG} enter="whipR" exit="zoomThrough" cam={[F(SC(1)[0], 540, 500, 1.28, -1), F(w(12) - 0.2, 540, 900, 1.24, 0, 3), F(SC(1)[1], 540, 1000, 1.04)]}>
          {() => (
            <>
              <Center y={300}><Words t={t} size={58} color={MUTE} weight={600} items={[{ w: "Na", at: w(5) }]} /><Letters t={t} text="mão," at={w(6)} size={124} color={INK} weight={800} /></Center>
              {M.map((m, j) => {
                const x = E.inOut(prog(t, w(m.x) + 0.15, 0.55));
                return (
                  <div key={j} style={{ position: "absolute", left: 110, top: 500 + j * 250, width: 860, height: 200, borderRadius: 52, background: SOFT, display: "flex", alignItems: "center", gap: 30, padding: "0 36px", ...slideStyle(t, w(m.at) - 0.4, j % 2 ? 900 : -900, 0.6) }}>
                    <div style={{ width: 112, height: 112, borderRadius: 30, background: "#fff", display: "grid", placeItems: "center", flex: "none" }}><Ic k={m.k} s={62} /></div>
                    <div style={{ flex: 1, fontSize: 44, fontWeight: 800, color: INK, lineHeight: 1.1 }}>{m.s}</div>
                    <svg width={860} height={200} style={{ position: "absolute", left: 0, top: 0 }}><path d="M30 120 C300 70 560 130 830 80" fill="none" stroke={AC} strokeWidth={14} strokeLinecap="round" pathLength={1} strokeDasharray="1 1" strokeDashoffset={1 - x} /></svg>
                  </div>
                );
              })}
            </>
          )}
        </Scene>
        <Scene t={t} a={SC(2)[0]} b={SC(2)[1]} bg={AC} enter="zoomIn" exit="whipL" cam={[F(SC(2)[0], 540, 500, 1.28, -1), F(w(26) - 0.2, 540, 900, 1.24, 0, 3), F(SC(2)[1], 540, 1000, 1.04)]}>
          {() => (
            <>
              <Center y={300}><Words t={t} size={58} color="rgba(255,255,255,0.85)" weight={600} items={[{ w: "Na", at: w(17) }]} /><Letters t={t} text="plataforma," at={w(18)} size={116} color="#fff" weight={800} stagger={0.03} /></Center>
              {Pl.map((p, j) => {
                const done = t > w(p.ck) + 0.2;
                return (
                  <div key={j} style={{ position: "absolute", left: 110, top: 520 + j * 250, width: 860, height: 200, borderRadius: 52, background: "#fff", display: "flex", alignItems: "center", gap: 30, padding: "0 36px", ...slideStyle(t, w(p.at) - 0.4, j % 2 ? 900 : -900, 0.6) }}>
                    <div style={{ width: 112, height: 112, borderRadius: 30, background: AC, display: "grid", placeItems: "center", flex: "none" }}><Ic k={p.k} s={62} c="#fff" /></div>
                    <div style={{ flex: 1, fontSize: 46, fontWeight: 800, color: INK, lineHeight: 1.1 }}>{p.s}</div>
                    <div style={{ width: 66, height: 66, borderRadius: 20, background: done ? AC : "#fff", border: done ? "none" : `5px solid ${INK}`, display: "grid", placeItems: "center" }}>{done && <div style={popStyle(t, w(p.ck) + 0.2, 0.4)}><Ic k="check" s={42} c="#fff" /></div>}</div>
                  </div>
                );
              })}
            </>
          )}
        </Scene>
        <Scene t={t} a={SC(3)[0]} b={SC(3)[1]} bg={BG} enter="whipR" exit="zoomThrough" cam={[F(SC(3)[0], 540, 700, 1.28, -1), F(SC(3)[1], 540, 960, 1.04)]}>
          {() => (
            <>
              <Center y={560}><Words t={t} size={62} color={MUTE} weight={600} items={[{ w: "Quanto", at: w(31), ...bold }, { w: "vale", at: w(32) }, { w: "o", at: w(33) }, { w: "seu", at: w(34) }]} /></Center>
              <div style={{ position: "absolute", left: 540 - 130, top: 800, ...popStyle(t, w(32) - 0.15, 0.55, -10) }}><Tile k="clock" s={260} on /></div>
              <Center y={1250}><Letters t={t} text="tempo?" at={w(35)} size={150} color={AC} weight={800} stagger={0.03} /></Center>
            </>
          )}
        </Scene>
        <Closing t={t} a={SC(4)[0]} b={SC(4)[1]} markAt={w(39)}>
          <Letters t={t} text="Teste grátis" at={w(36)} size={104} color={AC} weight={800} stagger={0.03} />
          <Underline t={t} at={w(37) + 0.4} width={460} color={AC} thick={12} />
        </Closing>
        <Soundtrack fps={fps} words={words} total={TOTAL} voice={wm(5)} fx={fx} />
      </Stage>
    );
  };
  return mk("V5", TOTAL, Comp);
})();

/* ============ V6 · Mito vs. verdade ============ */
const v6 = (() => {
  const { words, w, TOTAL, B, SC } = timeline(T6, [0, 5, 12, 27]);
  const fx: Fx[] = [...baseFx(B), [w(0) + 0.1, "pop.mp3", 0.26], [w(4) + 0.0, "scribble.mp3", 0.28], [w(5) - 0.15, "zoomin.mp3", 0.18], [w(10) - 0.15, "pop.mp3", 0.24],
    [w(14) - 0.15, "pop.mp3", 0.24], [w(17) - 0.15, "pop.mp3", 0.24], [w(20) - 0.15, "pop.mp3", 0.24], [w(24) - 0.1, "scribble.mp3", 0.24], [w(26) - 0.15, "zoomin.mp3", 0.18],
    [w(27) + 0.3 - 0.25, "reveal.mp3", 0.34], [w(27) + 0.3 - 0.25, "sparkle.mp3", 0.22], [w(29) + 0.4, "scribble.mp3", 0.26], [w(33) + 1.0, "stamp.mp3", 0.2]];
  const Comp: C = () => {
    const t = useSec(); const { fps } = useVideoConfig();
    const strike = E.inOut(prog(t, w(4), 0.5));
    const frame = E.inOut(prog(t, w(24) - 0.1, 1.0));
    return (
      <Stage>
        <Scene t={t} a={SC(0)[0]} b={SC(0)[1]} bg={BG} enter="none" exit="whipL" cam={[F(0, 540, 640, 1.28, -1), F(SC(0)[1], 540, 900, 1.04)]}>
          {() => (
            <>
              <Center y={380}><Letters t={t} text="Mito:" at={w(0)} size={160} color={AC} weight={800} /></Center>
              <div style={{ position: "absolute", left: 110, top: 600, width: 860, height: 420, borderRadius: 56, background: SOFT, display: "grid", placeItems: "center", padding: "0 50px", ...popStyle(t, w(0) + 0.1, 0.55) }}>
                <Words t={t} size={84} color={INK} weight={800} items={[{ w: "Prospectar", at: w(1) }, { w: "é", at: w(2) }, { w: "perder", at: w(3) }, { w: "tempo.", at: w(4) }]} />
              </div>
              <svg width={W} height={1920} style={{ position: "absolute", left: 0, top: 0 }}><path d="M130 640 C400 760 700 880 950 980" fill="none" stroke={AC} strokeWidth={20} strokeLinecap="round" pathLength={1} strokeDasharray="1 1" strokeDashoffset={1 - strike} /></svg>
              <div style={{ position: "absolute", left: 540 - 90, top: 1200, ...popStyle(t, w(3) - 0.2, 0.5, -10) }}><Tile k="cross" s={180} /></div>
            </>
          )}
        </Scene>
        <Scene t={t} a={SC(1)[0]} b={SC(1)[1]} bg={AC} enter="whipR" exit="zoomThrough" cam={[F(SC(1)[0], 540, 700, 1.26, -2), F(SC(1)[1], 540, 960, 1.02)]}>
          {() => (
            <>
              <Center y={420}><Letters t={t} text="Verdade:" at={w(5)} size={150} color="#fff" weight={800} /></Center>
              <Center y={850}>
                <Words t={t} size={72} color="rgba(255,255,255,0.85)" weight={600} items={[{ w: "perder", at: w(6) }, { w: "tempo", at: w(7), color: "#fff", weight: 800 }, { w: "é", at: w(8) }, { w: "prospectar", at: w(9), color: "#fff", weight: 800 }]} />
              </Center>
              <Center y={1200}><Letters t={t} text="sem organização." at={w(10)} size={100} color="#fff" weight={800} stagger={0.03} /></Center>
            </>
          )}
        </Scene>
        <Scene t={t} a={SC(2)[0]} b={SC(2)[1]} bg={BG} enter="zoomIn" exit="whipL" cam={[F(SC(2)[0], 540, 420, 1.28, -1), F(w(17) - 0.2, 540, 900, 1.22, 0, 3), F(SC(2)[1], 540, 1100, 1.04)]}>
          {() => (
            <>
              <Center y={330}>
                <Words t={t} size={58} color={MUTE} weight={600} items={[{ w: "Escolha", at: w(12) }, { w: "o", at: w(13) }, { w: "nicho,", at: w(14), ...bold }, { w: "escolha", at: w(15) }, { w: "a", at: w(16) }, { w: "cidade,", at: w(17), ...bold }]} />
              </Center>
              {[{ k: "search", s: "Nicho", x: 145, i: 14 }, { k: "pin", s: "Cidade", x: 425, i: 17 }, { k: "chart", s: "Nota", x: 705, i: 20 }].map((x, j) => (
                <div key={j} style={{ position: "absolute", left: x.x, top: 700, width: 230, display: "flex", flexDirection: "column", alignItems: "center", gap: 18, ...popStyle(t, w(x.i) - 0.15, 0.55, j % 2 ? 10 : -10) }}>
                  <Tile k={x.k} s={230} on={j === 2} />
                  <div style={{ fontSize: 44, fontWeight: 800, color: INK }}>{x.s}</div>
                </div>
              ))}
              <svg width={W} height={1920} style={{ position: "absolute", left: 0, top: 0 }}><rect x={105} y={665} width={870} height={400} rx={56} fill="none" stroke={AC} strokeWidth={10} strokeLinecap="round" pathLength={1} strokeDasharray="1 1" strokeDashoffset={1 - frame} /></svg>
              <Center y={1400}>
                <Words t={t} size={52} color={MUTE} weight={600} items={[{ w: "veja", at: w(18) }, { w: "a", at: w(19) }, { w: "nota", at: w(20), ...bold }, { w: "de", at: w(21) }, { w: "potencial", at: w(22), ...bold }, { w: "e", at: w(23) }, { w: "comece", at: w(24) }, { w: "pelos", at: w(25) }]} />
                <Letters t={t} text="melhores." at={w(26)} size={128} color={AC} weight={800} stagger={0.03} />
              </Center>
            </>
          )}
        </Scene>
        <Closing t={t} a={SC(3)[0]} b={SC(3)[1]} markAt={w(27) + 0.3}>
          <Words t={t} size={58} color={MUTE} weight={600} items={[{ w: "Prospecção", at: w(27), ...bold }, { w: "com", at: w(28) }]} />
          <Letters t={t} text="método." at={w(29)} size={124} color={AC} weight={800} stagger={0.03} />
          <Underline t={t} at={w(29) + 0.5} width={440} color={AC} thick={12} />
        </Closing>
        <Soundtrack fps={fps} words={words} total={TOTAL} voice={wm(6)} fx={fx} />
      </Stage>
    );
  };
  return mk("V6", TOTAL, Comp);
})();

/* ============ V7 · Por dentro do dashboard ============ */
const v7 = (() => {
  const { words, w, TOTAL, B, SC } = timeline(T7, [0, 4, 22]);
  const C4 = [{ k: "people", s: "Clientes cadastrados", i: 4 }, { k: "cart", s: "Vendas no período", i: 6 }, { k: "bill", s: "Recebido", i: 9 }, { k: "chart", s: "Lucro estimado", i: 10 }];
  const fx: Fx[] = [...baseFx(B), [w(3) - 0.15, "pop.mp3", 0.28], [w(3) - 0.15, "zoomin.mp3", 0.18], [SC(1)[0] + 0.2, "swish.mp3", 0.24], ...C4.map((c): Fx => [w(c.i) - 0.2, "pop.mp3", 0.22]), [w(10) + 0.3, "scribble.mp3", 0.22],
    [w(18) - 0.02, "click.mp3", 0.34], [w(19) - 0.02, "click.mp3", 0.34], [w(21) - 0.02, "click.mp3", 0.34],
    [w(22) + 0.3 - 0.25, "reveal.mp3", 0.34], [w(22) + 0.3 - 0.25, "sparkle.mp3", 0.22], [w(25) + 0.4, "scribble.mp3", 0.26], [w(32) + 1.0, "stamp.mp3", 0.2]];
  const Comp: C = () => {
    const t = useSec(); const { fps } = useVideoConfig();
    const chart = E.inOut(prog(t, w(10) + 0.3, 1.2));
    const taps = [w(18) - 0.02, w(19) - 0.02, w(21) - 0.02];
    const active = taps.filter((x) => t >= x).length - 1;
    const chips = [{ s: "R$ Real", x: 266 }, { s: "US$ Dólar", x: 546 }, { s: "€ Euro", x: 826 }];
    return (
      <Stage>
        <Scene t={t} a={SC(0)[0]} b={SC(0)[1]} bg={BG} enter="none" exit="whipL" cam={[F(0, 540, 560, 1.28, -1), F(SC(0)[1], 540, 1000, 1.04)]}>
          {() => (
            <>
              <Center y={520}>
                <Words t={t} size={64} color={MUTE} weight={600} items={[{ w: "Por", at: w(0) }, { w: "dentro", at: w(1), ...bold }, { w: "do", at: w(2) }]} />
                <Letters t={t} text="dashboard." at={w(3)} size={140} color={AC} weight={800} stagger={0.03} />
              </Center>
              <div style={{ position: "absolute", left: 540 - 150, top: 900, ...popStyle(t, w(3) - 0.15, 0.55, -10) }}><Tile k="chart" s={300} on /></div>
            </>
          )}
        </Scene>
        <Scene t={t} a={SC(1)[0]} b={SC(1)[1]} bg={BG} enter="whipR" exit="zoomThrough"
          cam={[F(SC(1)[0], 540, 330, 1.1, -1), F(w(9) - 0.2, 540, 760, 1.1, -1, 3), F(w(17) - 0.2, 540, 1250, 1.08, 1, 0, -3), F(SC(1)[1], 540, 1150, 1.04)]}>
          {() => (
            <>
              <Center y={300}>
                <Words t={t} size={52} color={MUTE} weight={600} items={[{ w: "Clientes", at: w(4), ...bold }, { w: "cadastrados.", at: w(5) }, { w: "Vendas", at: w(6), ...bold }, { w: "no", at: w(7) }, { w: "período.", at: w(8) }, { w: "Recebido.", at: w(9), ...bold }, { w: "Lucro", at: w(10), ...bold }, { w: "estimado.", at: w(11) }]} />
              </Center>
              <div style={{ position: "absolute", left: 90, top: 470, width: 900, height: 1000, borderRadius: 56, border: `6px solid ${INK}`, background: "#fff", ...slideStyle(t, SC(1)[0] + 0.2, 1000, 0.7) }}>
                <div style={{ position: "absolute", left: 40, top: 30, display: "flex", alignItems: "center", gap: 16 }}><Mark s={60} /><div style={{ fontSize: 36, fontWeight: 800, color: INK }}>Brigueli.ai</div></div>
                {C4.map((c, j) => (
                  <div key={j} style={{ position: "absolute", left: 40 + (j % 2) * 420, top: 120 + Math.floor(j / 2) * 220, width: 390, height: 200, borderRadius: 40, background: t > w(c.i) ? LIGHT : SOFT, display: "flex", flexDirection: "column", justifyContent: "center", gap: 12, padding: "0 30px", ...popStyle(t, w(c.i) - 0.2, 0.5) }}>
                    <div style={{ width: 70, height: 70, borderRadius: 20, background: AC, display: "grid", placeItems: "center" }}><Ic k={c.k} s={42} c="#fff" /></div>
                    <div style={{ fontSize: 36, fontWeight: 800, color: INK, lineHeight: 1.1 }}>{c.s}</div>
                  </div>
                ))}
                <svg width={820} height={200} style={{ position: "absolute", left: 40, top: 570 }}>
                  <path d="M10 180 H810" stroke={SOFT} strokeWidth={6} />
                  <path d="M10 160 C90 152 120 120 200 126 C280 132 300 90 380 84 C460 78 480 104 560 70 C640 36 700 50 810 14" fill="none" stroke={AC} strokeWidth={12} strokeLinecap="round" pathLength={1} strokeDasharray="1 1" strokeDashoffset={1 - chart} />
                </svg>
                {chips.map((c, j) => (
                  <div key={j} style={{ position: "absolute", left: c.x - 226, top: 820, width: 260, height: 100, borderRadius: 50, background: active === j ? AC : SOFT, display: "grid", placeItems: "center", fontSize: 38, fontWeight: 800, color: active === j ? "#fff" : INK, ...popStyle(t, w(16) - 0.1 + j * 0.12, 0.45) }}>{c.s}</div>
                ))}
              </div>
              <Hand t={t} from={[1000, 1800]} to={[266, 1346]} at={w(16) + 0.1} tap={taps[0]!} until={w(18) + 0.2} ripple={AC} />
              <Hand t={t} from={[266, 1346]} to={[546, 1346]} at={w(18) + 0.2} tap={taps[1]!} until={w(19) + 0.2} ripple={AC} />
              <Hand t={t} from={[546, 1346]} to={[826, 1346]} at={w(19) + 0.2} tap={taps[2]!} leave={w(21) + 0.6} ripple={AC} />
              <Center y={1660}>
                <Words t={t} size={52} color={MUTE} weight={600} items={[{ w: "E", at: w(12) }, { w: "dá", at: w(13) }, { w: "para", at: w(14) }, { w: "ver", at: w(15) }, { w: "tudo", at: w(16) }, { w: "em", at: w(17) }]} />
                <Letters t={t} text="real, dólar ou euro." at={w(18)} size={84} color={AC} weight={800} stagger={0.03} />
              </Center>
            </>
          )}
        </Scene>
        <Closing t={t} a={SC(2)[0]} b={SC(2)[1]} markAt={w(22) + 0.3}>
          <Words t={t} size={58} color={MUTE} weight={600} items={[{ w: "Seu", at: w(22) }, { w: "negócio", at: w(23), ...bold }, { w: "em", at: w(24) }]} />
          <Letters t={t} text="movimento," at={w(25)} size={110} color={AC} weight={800} stagger={0.03} />
          <Words t={t} size={58} color={MUTE} weight={600} items={[{ w: "num", at: w(26) }, { w: "só", at: w(27) }, { w: "painel.", at: w(28), ...bold }]} />
          <Underline t={t} at={w(28) + 0.5} width={440} color={AC} thick={12} />
        </Closing>
        <Soundtrack fps={fps} words={words} total={TOTAL} voice={wm(7)} fx={fx} />
      </Stage>
    );
  };
  return mk("V7", TOTAL, Comp);
})();

/* ============ V8 · Perguntas que me fazem ============ */
const v8 = (() => {
  const { words, w, TOTAL, B, SC } = timeline(T8, [0, 4, 28]);
  const A1 = ["Uma", "plataforma", "de", "prospecção", "que", "ajuda", "a", "pesquisar", "empresas", "por", "nicho", "e", "localização", "e", "organizar", "leads."];
  const Q2 = ["Preciso", "informar", "cartão", "para", "começar?"];
  const A2 = ["Não.", "O", "plano", "Starter", "é", "gratuito."];
  const fx: Fx[] = [...baseFx(B), [w(2) - 0.15, "zoomin.mp3", 0.18], [w(1) - 0.1, "pop.mp3", 0.26], [w(4) - 0.15, "message.mp3", 0.3], [w(12) - 0.15, "message.mp3", 0.3], [w(27) + 0.2, "notify.mp3", 0.26],
    [w(28) - 0.15, "message.mp3", 0.3], [w(33) - 0.15, "message.mp3", 0.3], [w(38) + 0.2, "notify.mp3", 0.28], [w(37) - 0.25, "reveal.mp3", 0.34], [w(37) - 0.25, "sparkle.mp3", 0.22], [w(38) + 1.2, "stamp.mp3", 0.2]];
  const Comp: C = () => {
    const t = useSec(); const { fps } = useVideoConfig();
    return (
      <Stage>
        <Scene t={t} a={SC(0)[0]} b={SC(0)[1]} bg={BG} enter="none" exit="whipL" cam={[F(0, 540, 560, 1.28, -1), F(SC(0)[1], 540, 1000, 1.04)]}>
          {() => (
            <>
              <Center y={520}>
                <Words t={t} size={64} color={MUTE} weight={600} items={[{ w: "Perguntas", at: w(0), ...bold }, { w: "que", at: w(1) }]} />
                <Letters t={t} text="me fazem." at={w(2)} size={138} color={AC} weight={800} stagger={0.03} />
              </Center>
              <div style={{ position: "absolute", left: 540 - 140, top: 880, ...popStyle(t, w(1) - 0.1, 0.55, -10) }}><Tile k="chat" s={280} on /></div>
            </>
          )}
        </Scene>
        <Scene t={t} a={SC(1)[0]} b={SC(1)[1]} bg={BG} enter="whipR" exit="zoomThrough" cam={[F(SC(1)[0], 540, 520, 1.28, -1), F(w(12) - 0.2, 540, 900, 1.24, 0, 3), F(SC(1)[1], 540, 1000, 1.04)]}>
          {() => (
            <>
              <div style={{ position: "absolute", left: 110, top: 440, maxWidth: 720, padding: "34px 44px", borderRadius: "48px 48px 48px 12px", background: SOFT, ...popStyle(t, w(4) - 0.15, 0.5) }}>
                <Words t={t} size={54} color={INK} weight={800} gap={0.22} items={[{ w: "O", at: w(4) }, { w: "que", at: w(5) }, { w: "é", at: w(6) }, { w: "a", at: w(7) }, { w: "Brigueli.ai?", at: w(8) }]} style={{ justifyContent: "flex-start" }} />
              </div>
              <div style={{ position: "absolute", right: 110, top: 760, width: 720, padding: "40px 48px", borderRadius: "48px 48px 12px 48px", background: AC, ...popStyle(t, w(12) - 0.15, 0.5) }}>
                <Words t={t} size={46} color="#fff" weight={700} gap={0.22} items={A1.map((x, i) => ({ w: x, at: w(12 + i) }))} style={{ justifyContent: "flex-start" }} />
              </div>
            </>
          )}
        </Scene>
        <Scene t={t} a={SC(2)[0]} b={SC(2)[1]} bg={AC} enter="whipR" exit="none" drift={0.4} cam={[F(SC(2)[0], 540, 520, 1.26, -1), F(w(33), 540, 960, 1.0), F(SC(2)[1], 540, 960, 1.05)]}>
          {() => (
            <>
              <div style={{ position: "absolute", left: 110, top: 360, maxWidth: 720, padding: "34px 44px", borderRadius: "48px 48px 48px 12px", background: "#fff", ...popStyle(t, w(28) - 0.15, 0.5) }}>
                <Words t={t} size={52} color={INK} weight={800} gap={0.22} items={Q2.map((x, i) => ({ w: x, at: w(28 + i) }))} style={{ justifyContent: "flex-start" }} />
              </div>
              <div style={{ position: "absolute", right: 110, top: 700, width: 700, padding: "40px 48px", borderRadius: "48px 48px 12px 48px", background: INK, ...popStyle(t, w(33) - 0.15, 0.5) }}>
                <Words t={t} size={52} color="#fff" weight={700} gap={0.22} items={A2.map((x, i) => ({ w: x, at: w(33 + i) }))} style={{ justifyContent: "flex-start" }} />
              </div>
              <Center y={1300}>
                <div style={popStyle(t, w(37) - 0.25, 0.65, -12)}><Mark s={200} white /></div>
                <div style={{ height: 20 }} />
                <Letters t={t} text="Brigueli.ai" at={w(37)} size={100} color="#fff" weight={800} />
              </Center>
            </>
          )}
        </Scene>
        <Soundtrack fps={fps} words={words} total={TOTAL} voice={wm(8)} fx={fx} />
      </Stage>
    );
  };
  return mk("V8", TOTAL, Comp);
})();

/* ============ V9 · Biblioteca de prompts ============ */
const v9 = (() => {
  const { words, w, TOTAL, B, SC } = timeline(T9, [0, 10, 25]);
  const fx: Fx[] = [...baseFx(B), [w(2) - 0.15, "pop.mp3", 0.28], [w(2) - 0.1, "tick.mp3", 0.13], [w(2) + 0.5, "notify.mp3", 0.26], [w(3) - 0.2, "pop.mp3", 0.24], [w(4) - 0.2, "pop.mp3", 0.24], [w(6) - 0.2, "pop.mp3", 0.24], [w(7) - 0.15, "zoomin.mp3", 0.18],
    [SC(1)[0] + 0.2, "swish.mp3", 0.24], [w(13) - 0.1, "pop.mp3", 0.24], [w(21) - 0.05, "click.mp3", 0.34], [w(22), "notify.mp3", 0.28],
    [w(25) + 0.3 - 0.25, "reveal.mp3", 0.34], [w(25) + 0.3 - 0.25, "sparkle.mp3", 0.22], [w(27) + 0.5, "scribble.mp3", 0.26], [w(32) + 1.0, "stamp.mp3", 0.2]];
  const Comp: C = () => {
    const t = useSec(); const { fps } = useVideoConfig();
    const n = Math.round(ip(t, [w(2) - 0.1, w(2) + 0.5], [0, 300], E.outQuint));
    const tap = w(21) - 0.02;
    const K = [{ k: "spark", s: "Prompts", i: 3, x: 130 }, { k: "bolt", s: "Skills", i: 4, x: 425 }, { k: "bot", s: "Agents", i: 6, x: 720 }];
    return (
      <Stage>
        <Scene t={t} a={SC(0)[0]} b={SC(0)[1]} bg={BG} enter="none" exit="whipL" cam={[F(0, 540, 560, 1.28, -1), F(2.6, 540, 1000, 1.22, 0, 3), F(SC(0)[1], 540, 1100, 1.04)]}>
          {() => (
            <>
              <Center y={420}>
                <Words t={t} size={62} color={MUTE} weight={600} items={[{ w: "Mais", at: w(0) }, { w: "de", at: w(1) }]} />
                <div style={{ fontSize: 300, fontWeight: 800, letterSpacing: "-0.04em", color: AC, lineHeight: 1, fontVariantNumeric: "tabular-nums", ...popStyle(t, w(2) - 0.15, 0.55) }}>{n}+</div>
              </Center>
              {K.map((x, j) => (
                <div key={j} style={{ position: "absolute", left: x.x, top: 780, width: 230, display: "flex", flexDirection: "column", alignItems: "center", gap: 18, ...popStyle(t, w(x.i) - 0.2, 0.5, j % 2 ? 10 : -10) }}>
                  <Tile k={x.k} s={230} on={j === 0} />
                  <div style={{ fontSize: 46, fontWeight: 800, color: INK }}>{x.s}</div>
                </div>
              ))}
              <Center y={1400}>
                <Words t={t} size={54} color={MUTE} weight={600} items={[{ w: "num", at: w(7) }, { w: "lugar", at: w(8), ...bold }]} />
                <Letters t={t} text="só." at={w(9)} size={150} color={AC} weight={800} />
              </Center>
            </>
          )}
        </Scene>
        <Scene t={t} a={SC(1)[0]} b={SC(1)[1]} bg={BG} enter="whipR" exit="zoomThrough" cam={[F(SC(1)[0], 540, 400, 1.12, -1), F(w(15) - 0.2, 540, 900, 1.1, 0, 3), F(w(21) - 0.2, 540, 1000, 1.08, 0, 0, -3), F(SC(1)[1], 540, 1100, 1.04)]}>
          {() => (
            <>
              <Center y={330}>
                <Words t={t} size={58} color={MUTE} weight={600} items={[{ w: "E", at: w(10) }, { w: "tem", at: w(11) }, { w: "o", at: w(12) }]} />
                <Letters t={t} text="criador de prompt" at={w(13)} size={96} color={AC} weight={800} stagger={0.03} />
              </Center>
              <div style={{ position: "absolute", left: 90, top: 560, width: 900, height: 760, borderRadius: 56, border: `6px solid ${INK}`, background: "#fff", ...slideStyle(t, SC(1)[0] + 0.2, 1000, 0.7) }}>
                <div style={{ position: "absolute", left: 40, top: 30, display: "flex", alignItems: "center", gap: 16 }}><Mark s={60} /><div style={{ fontSize: 36, fontWeight: 800, color: INK }}>Criador de Prompt IA</div></div>
                <div style={{ position: "absolute", left: 40, top: 120, width: 820, height: 190, borderRadius: 36, background: SOFT, padding: "36px 40px", display: "flex", flexDirection: "column", gap: 24, ...popStyle(t, w(15) - 0.1, 0.5) }}>
                  {[92, 74, 52].map((p, j) => <div key={j} style={{ height: 22, width: `${p}%`, borderRadius: 11, background: "#D9DBE3" }} />)}
                </div>
                <div style={{ position: "absolute", left: 234, top: 340, width: 420, height: 100, borderRadius: 50, background: t > tap ? ACD : AC, display: "grid", placeItems: "center", fontSize: 40, fontWeight: 800, color: "#fff", ...popStyle(t, w(19) - 0.1, 0.45) }}>{t > tap ? "Melhorando…" : "Melhorar"}</div>
                <div style={{ position: "absolute", left: 40, top: 470, width: 820, height: 200, borderRadius: 36, background: LIGHT, padding: "34px 40px", display: "flex", flexDirection: "column", gap: 22, ...popStyle(t, w(22) - 0.05, 0.5) }}>
                  {[96, 80, 88].map((p, j) => <div key={j} style={{ height: 22, width: `${p}%`, borderRadius: 11, background: AC, opacity: 0.8 }} />)}
                  <div style={{ position: "absolute", right: 30, top: 22 }}><Ic k="check" s={50} c={AC} /></div>
                </div>
              </div>
              <Hand t={t} from={[1000, 1800]} to={[540, 956]} at={tap - 1.0} tap={tap} leave={tap + 0.9} ripple={AC} />
              <Center y={1560}>
                <Words t={t} size={52} color={MUTE} weight={600} items={[{ w: "para", at: w(19) }, { w: "criar", at: w(20), ...bold }, { w: "e", at: w(21) }]} />
                <Letters t={t} text="melhorar os seus." at={w(22)} size={92} color={AC} weight={800} stagger={0.03} />
              </Center>
            </>
          )}
        </Scene>
        <Closing t={t} a={SC(2)[0]} b={SC(2)[1]} markAt={w(25) + 0.3}>
          <Words t={t} size={58} color={MUTE} weight={600} items={[{ w: "Tudo", at: w(25), ...bold }, { w: "na", at: w(26) }]} />
          <Letters t={t} text="biblioteca." at={w(27)} size={112} color={AC} weight={800} stagger={0.03} />
          <Underline t={t} at={w(27) + 0.6} width={460} color={AC} thick={12} />
        </Closing>
        <Soundtrack fps={fps} words={words} total={TOTAL} voice={wm(9)} fx={fx} />
      </Stage>
    );
  };
  return mk("V9", TOTAL, Comp);
})();

export const SHORTS: Short[] = [v1, v2, v3, v4, v5, v6, v7, v8, v9];
