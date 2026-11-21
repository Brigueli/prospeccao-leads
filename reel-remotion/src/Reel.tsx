import React from "react";
import {
  Audio,
  Easing,
  Sequence,
  interpolate,
  staticFile,
  useCurrentFrame,
} from "remotion";
import { css } from "./styles";

const FPS = 30;
const TOTAL = 28;

/* ---------- helpers de animação (tempo em segundos) ---------- */
const OUT = Easing.out(Easing.cubic);
const BACK = (s = 2) => Easing.out(Easing.back(s));

const ramp = (
  t: number,
  start: number,
  dur: number,
  from: number,
  to: number,
  ease: (x: number) => number = OUT
) =>
  interpolate(t, [start, start + dur], [from, to], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: ease,
  });

const useT = () => useCurrentFrame() / FPS;

/** Pulsa entre 1 e `amp` depois de `start`, por `n` ciclos. */
const pulse = (t: number, start: number, period: number, n: number, amp: number) => {
  const k = (t - start) / period;
  if (k < 0 || k > n) return 1;
  return 1 + (amp - 1) * (0.5 - 0.5 * Math.cos(2 * Math.PI * k));
};

/* ---------- moldura comum de cada cena ---------- */
type SceneProps = {
  num: string;
  tag: string;
  float: string;
  title: string;
  sub: string;
  first?: boolean;
  children: React.ReactNode;
};

const Scene: React.FC<SceneProps> = ({ num, tag, float, title, sub, first, children }) => {
  const lt = useT();
  const out = ramp(lt, 3.75, 0.25, 1, 0, Easing.in(Easing.quad));
  const bob = -13 * (1 - Math.cos((2 * Math.PI * Math.max(0, lt - 0.8)) / 1.8));
  const cardBob = -7 * (1 - Math.cos((2 * Math.PI * Math.max(0, lt - 0.8)) / 3.2));
  const shake = lt >= 0.95 ? -12 * Math.exp(-10 * (lt - 0.95)) * Math.cos(30 * (lt - 0.95)) : 0;
  const tStart = first ? 0 : 0.5;

  return (
    <div className="clip scene" style={{ opacity: out }}>
      <div className="num" style={{ opacity: ramp(lt, 0.05, 0.3, 0, 1) }}>{num}</div>
      <div
        className="tag"
        style={{
          opacity: ramp(lt, 0.05, 0.45, 0, 1),
          transform: `translateX(${ramp(lt, 0.05, 0.45, -60, 0, BACK(2))}px) scale(${ramp(lt, 0.05, 0.45, 0.9, 1, BACK(2))})`,
        }}
      >
        {tag}
      </div>
      <div
        className="float"
        style={{
          left: 730,
          top: 130,
          opacity: ramp(lt, 0.2, 0.6, 0, 1),
          transform: `translateY(${bob}px) scale(${ramp(lt, 0.2, 0.6, 0, 1, BACK(2.4))}) rotate(${ramp(lt, 0.2, 0.6, -40, 0, BACK(2.4))}deg)`,
        }}
      >
        {float}
      </div>
      <div
        className="card"
        style={{
          opacity: ramp(lt, 0.1, 0.6, 0, 1),
          transform: `translateY(${ramp(lt, 0.1, 0.6, 120, 0) + cardBob}px) scale(${ramp(lt, 0.1, 0.6, 0.94, 1)})`,
        }}
      >
        {children}
      </div>
      <div
        className="title"
        style={{
          opacity: first ? 1 : ramp(lt, tStart, 0.45, 0, 1),
          transform: `translateX(${shake}px) scale(${ramp(lt, tStart, 0.45, first ? 1.3 : 1.4, 1, Easing.out(Easing.exp))})`,
        }}
      >
        {title}
      </div>
      <div
        className="sub"
        style={{ opacity: ramp(lt, 1.1, 0.5, 0, 1), transform: `translateY(${ramp(lt, 1.1, 0.5, 40, 0)}px)` }}
      >
        {sub}
      </div>
    </div>
  );
};

/* ---------- CENA 1: busca digitada ---------- */
const TXT = "barbearia em Campinas";
const Scene1 = () => {
  const lt = useT();
  const n = Math.round(ramp(lt, 0.5, 0.95, 0, TXT.length, (x) => x));
  const caret = Math.floor(lt * 5) % 2 === 0 ? 1 : 0;
  const rows = [
    ["💈 Barbearia do João", "sem site"],
    ["💈 Studio Premium", "sem site"],
  ];
  const missShake = lt > 2.7 && lt < 3.2 ? 10 * Math.sin(lt * 80) : 0;
  return (
    <Scene num="01/07" tag="Prospecção" float="🔎" title="Encontre" sub="Empresas por nicho e cidade, em segundos." first>
      <div className="label">Nova prospecção</div>
      <div className="search">
        <span>🔎</span>
        <span>{TXT.slice(0, n)}</span>
        <span className="caret" style={{ opacity: caret }} />
      </div>
      {rows.map(([a, b], i) => (
        <div
          key={i}
          className="row"
          style={{
            opacity: ramp(lt, 1.6 + i * 0.25, 0.4, 0, 1),
            transform: `translateX(${ramp(lt, 1.6 + i * 0.25, 0.4, -80, 0, BACK(1.6))}px)`,
          }}
        >
          <span>{a}</span>
          <small>{b}</small>
        </div>
      ))}
      <div
        className="row miss"
        style={{
          opacity: ramp(lt, 2.2, 0.45, 0, 1),
          transform: `translateX(${ramp(lt, 2.2, 0.45, 80, 0, BACK(2)) + missShake}px) scale(${ramp(lt, 2.2, 0.45, 0.9, 1, BACK(2))})`,
          boxShadow: lt > 2.7 ? `0 0 ${20 + 20 * Math.sin((lt - 2.7) * 8)}px rgba(var(--accent-rgb),.9)` : undefined,
        }}
      >
        <span>🎯 +47 leads encontrados</span>
        <small>WhatsApp ✓</small>
      </div>
    </Scene>
  );
};

/* ---------- CENA 2: filtros ---------- */
const Scene2 = () => {
  const lt = useT();
  const heights = [35, 55, 40, 70, 50, 95];
  return (
    <Scene num="02/07" tag="Filtros" float="📱" title="Filtre" sub="Só quem tem WhatsApp e ainda não tem site.">
      <div
        className="badge"
        style={{
          opacity: ramp(lt, 1.55, 0.5, 0, 1),
          transform: `scale(${ramp(lt, 1.55, 0.5, 0, 1, BACK(3)) * pulse(lt, 2.1, 0.6, 5, 1.12)}) rotate(${ramp(lt, 1.55, 0.5, 15, 0, BACK(3))}deg)`,
        }}
      >
        ✅ QUALIFICADOS
      </div>
      <div className="label">Leads por filtro</div>
      <div className="bars">
        {heights.map((h, i) => (
          <div
            key={i}
            className={"bar" + (i === 5 ? " hot" : "")}
            style={{ height: `${h}%`, transformOrigin: "bottom", transform: `scaleY(${ramp(lt, 0.55 + i * 0.1, 0.5, 0, 1, BACK(1.6))})` }}
          />
        ))}
      </div>
      <div className="label" style={{ marginTop: 30 }}>Com WhatsApp e sem site</div>
      <div className="prog"><i style={{ width: `${ramp(lt, 1.3, 0.7, 0, 87)}%` }} /></div>
      <div
        className="pct"
        style={{ opacity: ramp(lt, 1.4, 0.5, 0, 1), transformOrigin: "left center", transform: `scale(${ramp(lt, 1.4, 0.5, 1.6, 1, BACK(2))})` }}
      >
        87%
      </div>
    </Scene>
  );
};

/* ---------- CENA 3: leads encontrados ---------- */
const Scene3 = () => {
  const lt = useT();
  const v = ramp(lt, 0.5, 1.8, 0, 128, Easing.out(Easing.quad));
  const pins = ["📍 Barbearias", "📍 Salões", "📍 Pet shops"];
  const nudge = lt > 2.9 ? 40 * (0.5 - 0.5 * Math.cos(2 * Math.PI * Math.min(lt - 2.9, 2) / 1.0)) : 0;
  return (
    <Scene num="03/07" tag="Sua lista" float="📍" title="Leads" sub="Tudo organizado, pronto pra abordar.">
      <div className="label">Leads encontrados</div>
      <div className="big">{Math.round(v).toLocaleString("pt-BR")}</div>
      <div className="label" style={{ marginTop: 14 }}>Exemplo ilustrativo</div>
      <div className="prog"><i style={{ width: `${ramp(lt, 0.5, 1.8, 0, 100, Easing.out(Easing.quad))}%` }} /></div>
      <div className="chips" style={{ marginTop: 30 }}>
        {pins.map((p, i) => (
          <span
            key={p}
            className="chip"
            style={{
              opacity: ramp(lt, 1.25 + i * 0.25, 0.45, 0, 1),
              transform: `translateY(${ramp(lt, 1.25 + i * 0.25, 0.45, -40, 0, BACK(3))}px) scale(${ramp(lt, 1.25 + i * 0.25, 0.45, 0, 1, BACK(3))})`,
            }}
          >
            {p}
          </span>
        ))}
      </div>
      <div
        className="row"
        style={{ marginTop: 26, opacity: ramp(lt, 2.35, 0.5, 0, 1), transform: `translateX(${ramp(lt, 2.35, 0.5, -100, 0) + nudge}px)` }}
      >
        <span>📂 Organizados em planilha</span>
        <small>pronto</small>
      </div>
    </Scene>
  );
};

/* ---------- CENA 4: ficha do lead ---------- */
const Scene4 = () => {
  const lt = useT();
  const blocks: React.CSSProperties[] = [
    { height: 30, width: "55%" },
    { height: 150, marginTop: 18, background: "linear-gradient(90deg,rgba(var(--accent-rgb),.55),rgba(255,255,255,.08))" },
  ];
  const bs = (i: number): React.CSSProperties => ({
    opacity: ramp(lt, 0.85 + i * 0.12, 0.4, 0, 1),
    transformOrigin: "left",
    transform: `scaleX(${ramp(lt, 0.85 + i * 0.12, 0.4, 0, 1)})`,
  });
  const chips = ["Telefone", "WhatsApp", "Endereço"];
  return (
    <Scene num="04/07" tag="Ficha do lead" float="📇" title="Contato" sub="Número e link do WhatsApp prontos pra usar.">
      <div className="label">Contato do lead</div>
      <div
        className="browser"
        style={{ opacity: ramp(lt, 0.45, 0.5, 0, 1), transform: `translateY(${ramp(lt, 0.45, 0.5, 60, 0)}px) scale(${ramp(lt, 0.45, 0.5, 0.85, 1, BACK(2))})` }}
      >
        <div className="bhead">
          <span className="dot" /><span className="dot" /><span className="dot" />
          <span className="url"><b>🔒</b> brigueli-ai.online</span>
        </div>
        <div className="bbody">
          <div className="blk" style={{ ...blocks[0], ...bs(0) }} />
          <div className="blk" style={{ ...blocks[1], ...bs(1) }} />
          <div style={{ display: "flex", gap: 14, marginTop: 18 }}>
            {[2, 3, 4].map((k) => (
              <div key={k} className="blk" style={{ height: 86, flex: 1, ...bs(k) }} />
            ))}
          </div>
          <div
            className="stars"
            style={{
              opacity: ramp(lt, 1.4, 0.5, 0, 1),
              transformOrigin: "left",
              transform: `scale(${ramp(lt, 1.4, 0.5, 0.6, 1, BACK(3))})`,
              filter: lt > 1.85 && lt < 3.1 ? `drop-shadow(0 0 ${12 + 12 * Math.sin((lt - 1.85) * 10)}px rgba(255,200,0,1))` : undefined,
            }}
          >
            ⭐⭐⭐⭐⭐
          </div>
        </div>
      </div>
      <div className="chips">
        {chips.map((c, i) => (
          <span
            key={c}
            className="chip on"
            style={{
              opacity: ramp(lt, 2.25 + i * 0.2, 0.4, 0, 1),
              transform: `translateY(${ramp(lt, 2.25 + i * 0.2, 0.4, 20, 0, BACK(3))}px) scale(${ramp(lt, 2.25 + i * 0.2, 0.4, 0, 1, BACK(3))})`,
            }}
          >
            {c}
          </span>
        ))}
      </div>
    </Scene>
  );
};

/* ---------- CENA 5: conversa no WhatsApp ---------- */
const Scene5 = () => {
  const lt = useT();
  const bubs = [
    { cls: "in", t: 0.65, x: -120, txt: "Oi! Vi sua mensagem, como funciona? 😃", time: "14:02" },
    { cls: "out", t: 1.35, x: 120, txt: "Te mostro agora! Posso ligar? ✅", time: "14:02 ✔✔" },
    { cls: "in", t: 2.05, x: -120, txt: "Pode sim! 🙌", time: "14:03" },
  ];
  return (
    <Scene num="05/07" tag="Conversa" float="💬" title="WhatsApp" sub="Chame direto e comece a vender.">
      <div className="label">Conversas iniciadas</div>
      <div className="big" style={{ fontSize: 110 }}>+{Math.round(ramp(lt, 0.5, 1.8, 0, 12, Easing.out(Easing.quad)))}</div>
      <div className="chat">
        {bubs.map((b, i) => (
          <div
            key={i}
            className={"bub " + b.cls}
            style={{ opacity: ramp(lt, b.t, 0.45, 0, 1), transform: `translateX(${ramp(lt, b.t, 0.45, b.x, 0, BACK(2))}px) scale(${ramp(lt, b.t, 0.45, 0.8, 1, BACK(2))})` }}
          >
            {b.txt}
            <small>{b.time}</small>
          </div>
        ))}
      </div>
      <div
        className="notif"
        style={{ opacity: ramp(lt, 2.85, 0.45, 0, 1), transform: `scale(${ramp(lt, 2.85, 0.45, 0, 1, BACK(3)) * pulse(lt, 3.3, 0.6, 1.5, 1.1)})` }}
      >
        💬 Nova mensagem
      </div>
    </Scene>
  );
};

/* ---------- CENA 6: rotina em 3 passos ---------- */
const Scene6 = () => {
  const lt = useT();
  const doneAt = [0.8, 1.5, 2.2];
  const steps = ["Encontre empresas", "Chame no WhatsApp", "Feche a venda"];
  return (
    <Scene num="06/07" tag="Rotina" float="🚀" title="Vendas" sub="Mais clientes, menos tempo procurando.">
      <div className="label">Prospecção em</div>
      <div className="big" style={{ fontSize: 110 }}>{Math.round(ramp(lt, 0.6, 1.0, 0, 3, (x) => x))} passos</div>
      <div className="days">
        {doneAt.map((d, i) => {
          const hot = lt >= d;
          return (
            <div
              key={i}
              className={"day" + (hot ? " hot" : "")}
              style={{ opacity: ramp(lt, 0.65 + i * 0.15, 0.4, 0, 1), transform: `translateY(${ramp(lt, 0.65 + i * 0.15, 0.4, 40, 0, BACK(2))}px)` }}
            >
              PASSO<b style={{ color: hot ? "var(--on-accent)" : "#fff" }}>{i + 1}</b>
            </div>
          );
        })}
      </div>
      {steps.map((s, i) => {
        const done = lt >= doneAt[i];
        const sc = done ? 1 + 0.3 * Math.max(0, 1 - (lt - doneAt[i]) / 0.4) : 1;
        return (
          <div
            key={s}
            className="step"
            style={{ opacity: ramp(lt, 0.9 + i * 0.18, 0.4, 0, 1), transform: `translateX(${ramp(lt, 0.9 + i * 0.18, 0.4, -90, 0)}px)` }}
          >
            <span className={"ck" + (done ? " done" : "")} style={{ transform: `scale(${sc})` }}>✓</span>
            {s}
          </div>
        );
      })}
    </Scene>
  );
};

/* ---------- CENA 7: chamada final com confete ---------- */
const COL = ["#19d3e6", "#ffffff", "#1e6fe0", "#25d366", "#6fe8f5"];
const Scene7 = () => {
  const lt = useT();
  const pieces = Array.from({ length: 40 }, (_, i) => i);
  return (
    <div className="clip scene">
      <div className="num" style={{ opacity: ramp(lt, 0.05, 0.3, 0, 1) }}>07/07</div>
      <div className="cta" style={{ opacity: ramp(lt, 0.1, 0.5, 0, 1), transform: `translateY(${ramp(lt, 0.1, 0.5, 60, 0)}px)` }}>
        Quer encontrar clientes<br />sem perder tempo?
      </div>
      <div
        className="kw"
        style={{
          opacity: ramp(lt, 0.55, 0.55, 0, 1),
          transform: `scale(${ramp(lt, 0.55, 0.55, 0.4, 1, BACK(2.4)) * pulse(lt, 1.1, 0.7, 4, 1.07)}) rotate(${ramp(lt, 0.55, 0.55, -10, 0, BACK(2.4))}deg)`,
        }}
      >
        TESTE GRÁTIS
      </div>
      <div className="arrow" style={{ opacity: ramp(lt, 1.3, 0.4, 0, 1), transform: `translateY(${ramp(lt, 1.3, 0.4, -40, 0) + 15 * (1 - Math.cos((2 * Math.PI * Math.max(0, lt - 1.7)) / 0.7))}px)` }}>
        👇
      </div>
      <div className="sub" style={{ top: 1180, opacity: ramp(lt, 1.5, 0.5, 0, 1), transform: `translateY(${ramp(lt, 1.5, 0.5, 30, 0)}px)` }}>
        Acesse o link e comece a prospectar.
      </div>
      <div
        className="site7"
        style={{
          opacity: ramp(lt, 2.1, 0.5, 0, 1),
          transform: `translateY(${ramp(lt, 2.1, 0.5, 40, 0, BACK(2))}px) scale(${ramp(lt, 2.1, 0.5, 0.9, 1, BACK(2))})`,
          boxShadow: `0 0 ${40 + 30 * (lt > 2.7 ? 0.5 - 0.5 * Math.cos((lt - 2.7) * 15) : 0)}px rgba(var(--accent-rgb),.6)`,
        }}
      >
        🌐 brigueli-ai.online
      </div>
      {pieces.map((i) => {
        const ang = (i / 40) * Math.PI * 2;
        const dist = 300 + (i % 7) * 70;
        const p = ramp(lt, 0.65, 0.8, 0, 1, Easing.out(Easing.quad));
        const fall = lt > 1.45 ? Math.pow(Math.min((lt - 1.45) / 1.6, 1), 2) * 700 : 0;
        const op = lt < 0.65 ? 0 : lt < 1.45 ? 1 : ramp(lt, 1.45, 1.6, 1, 0, Easing.in(Easing.quad));
        return (
          <div
            key={i}
            className="cf"
            style={{
              left: 540,
              top: 820,
              background: COL[i % 5],
              opacity: op,
              transform: `translate(${Math.cos(ang) * dist * p}px, ${Math.sin(ang) * dist * p - 160 * p + fall}px) rotate(${(360 + i * 40) * p}deg)`,
            }}
          />
        );
      })}
    </div>
  );
};

/* ---------- fundo vivo, barra de progresso, wipe ---------- */
const Background: React.FC = () => {
  const t = useT();
  const k = t / TOTAL;
  return (
    <div className="bg">
      <div className="grid" style={{ transform: `translateY(${180 * k}px)` }} />
      <div className="streak s1" style={{ transform: `translateX(${160 * k}px) rotate(-35deg)` }} />
      <div className="streak s2" style={{ transform: `translateX(${-180 * k}px) rotate(-35deg)` }} />
      <div className="streak s3" style={{ transform: `translate(${260 * k}px, ${160 * k}px) rotate(-35deg)` }} />
      <div className="dots" />
      {Array.from({ length: 26 }, (_, i) => {
        const s = 6 + ((i * 7) % 9);
        return (
          <div
            key={i}
            className="ptc"
            style={{
              width: s,
              height: s,
              left: (i * 197) % 1040,
              top: (i * 331) % 1860,
              opacity: (3 + (i % 6)) / 10,
              transform: `translate(${(i % 2 ? 40 : -40) * k}px, ${-(140 + (i % 5) * 60) * k}px)`,
            }}
          />
        );
      })}
    </div>
  );
};

const Wipe: React.FC = () => {
  const t = useT();
  let x = -1500;
  for (let i = 0; i < 6; i++) {
    const s = 3.65 + i * 4;
    if (t >= s && t <= s + 0.7) x = -1500 + ramp(t, s, 0.7, 0, 3000, Easing.inOut(Easing.cubic));
  }
  return <div id="wipe" style={{ left: 0, transform: `translateX(${x}px) skewX(-18deg)` }} />;
};

/* ---------- áudio ---------- */
const sfx: [string, number[], number, number][] = [
  ["whoosh", [0, 3.75, 7.75, 11.75, 15.75, 19.75, 23.75], 0.5, 0.7],
  ["impact", [0.45, 4.95, 8.95, 12.95, 16.95, 20.95], 0.55, 0.8],
  ["impact", [24.6], 0.7, 0.8],
  ["tick", [0.55, 0.7, 0.85, 1.0, 1.15, 1.3, 8.6, 8.8, 9.0, 9.2, 9.4, 9.6, 13.45, 13.55, 13.65, 13.75], 0.5, 0.06],
  ["pop", [1.7, 1.95, 9.3, 9.55, 9.8], 0.6, 0.25],
  ["pop", [2.3, 10.4], 0.8, 0.25],
  ["pop", [4.6, 4.7, 4.8, 4.9, 5.0, 12.9, 13.05, 13.2, 14.3, 14.5, 14.7], 0.5, 0.25],
  ["pop", [5.1, 12.5, 16.7, 17.4, 18.1, 25.6], 0.7, 0.25],
  ["ding", [5.6], 0.4, 1.0],
  ["ding", [13.85, 21.5], 0.5, 1.0],
  ["ding", [18.9, 22.2], 0.55, 1.0],
  ["ding", [20.8], 0.45, 1.0],
  ["ding", [25.0], 0.6, 1.0],
];

const Sounds: React.FC = () => (
  <>
    <Audio
      src={staticFile("assets/music.wav")}
      volume={(f) => 0.45 * interpolate(f / FPS, [TOTAL - 1.5, TOTAL], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })}
    />
    {sfx.flatMap(([name, times, vol, dur]) =>
      times.map((t) => (
        <Sequence key={name + t + vol} from={Math.round(t * FPS)} durationInFrames={Math.ceil(dur * FPS) + 1}>
          <Audio src={staticFile(`assets/${name}.wav`)} volume={vol} />
        </Sequence>
      ))
    )}
  </>
);

/* ---------- composição principal ---------- */
const scenes = [Scene1, Scene2, Scene3, Scene4, Scene5, Scene6, Scene7];

const TopBar: React.FC = () => {
  const t = useT();
  return (
    <div id="topbar">
      <div id="topfill" style={{ width: `${(t / TOTAL) * 100}%` }} />
    </div>
  );
};

export const Reel: React.FC = () => (
  <div id="root" style={{ position: "relative", width: 1080, height: 1920, overflow: "hidden", background: "var(--ground)", fontFamily: "var(--font-display)", color: "var(--ink)" }}>
    <style>{css}</style>
    <Background />
    <TopBar />
    {scenes.map((S, i) => (
      <Sequence key={i} from={i * 4 * FPS} durationInFrames={4 * FPS}>
        <S />
      </Sequence>
    ))}
    <Wipe />
    <Sounds />
  </div>
);
