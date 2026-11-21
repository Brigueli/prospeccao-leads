import React from "react";
import { AbsoluteFill } from "remotion";
import { AC, BG, INK, LIGHT, MUTE, Ic, Mark, Tile } from "./kit";
import { FONT } from "./lib";

/* Carrosséis da Brigueli.ai · 4:5 (1080×1350) · Motion Clean (branco + ciano #08CADB, Outfit).
   Fatos: site oficial brigueli-ai.online. Dicas de abordagem (carrosséis 2 e 3) são orientações gerais, sem promessa de resultado. */
export const SLIDE_W = 1080, SLIDE_H = 1350;

type Slide =
  | { kind: "cover"; pre: string; big: string; sub: string; icon: string }
  | { kind: "step"; title: string; text: string; icon: string; fix?: string }
  | { kind: "bubble"; label: string; text: string; note: string }
  | { kind: "plan"; name: string; price: string; note: string; on?: boolean }
  | { kind: "cta"; title: string; big: string; url: string };
export type Carousel = { id: string; tag: string; slides: Slide[] };

export const CAROUSELS: Carousel[] = [
  {
    id: "c1-cinco-passos", tag: "5 PASSOS",
    slides: [
      { kind: "cover", pre: "Como achar", big: "clientes no Brasil", sub: "em 5 passos", icon: "pin" },
      { kind: "step", title: "Escolha o nicho", text: "Barbearias, clínicas, pet shops… comece pelo segmento que você já atende.", icon: "search" },
      { kind: "step", title: "Escolha a cidade", text: "Defina onde você quer prospectar: cidade e estado.", icon: "pin" },
      { kind: "step", title: "Veja as empresas", text: "A plataforma encontra empresas com telefone, WhatsApp e redes sociais.", icon: "store" },
      { kind: "step", title: "Priorize pela nota", text: "Os leads vêm organizados com nota de potencial. Comece pelos melhores.", icon: "chart" },
      { kind: "step", title: "Abra o WhatsApp", text: "Chame o lead direto e registre cada venda no dashboard.", icon: "chat" },
      { kind: "cta", title: "Comece grátis", big: "Starter", url: "brigueli-ai.online" },
    ],
  },
  {
    id: "c2-primeiro-contato", tag: "PRIMEIRO CONTATO",
    slides: [
      { kind: "cover", pre: "O que mandar no", big: "primeiro contato", sub: "5 dicas + exemplo", icon: "chat" },
      { kind: "step", title: "Seja curto", text: "Uma mensagem de poucas linhas. Quem recebe lê no celular, no meio do dia.", icon: "clock" },
      { kind: "step", title: "Fale do negócio dele", text: "Mostre que você olhou a empresa: cite a cidade ou algo específico dela.", icon: "store" },
      { kind: "step", title: "Diga o que você faz", text: "Uma frase só, sem lista de serviços.", icon: "user" },
      { kind: "step", title: "Faça uma pergunta fácil", text: "Termine com algo simples de responder, como \"posso te mostrar?\".", icon: "check" },
      { kind: "step", title: "Não venda de cara", text: "O objetivo da primeira mensagem é começar a conversa, não fechar.", icon: "cross" },
      { kind: "bubble", label: "Exemplo (adapte ao seu serviço)", text: "Oi, [nome]! Vi a [empresa] aqui em [cidade] e achei o trabalho de vocês muito bacana. Eu ajudo negócios como o seu com [seu serviço]. Posso te mostrar como funciona?", note: "Troque o que está entre [colchetes]" },
      { kind: "cta", title: "Ache os leads", big: "grátis", url: "brigueli-ai.online" },
    ],
  },
  {
    id: "c3-erros-lead-sumir", tag: "5 ERROS",
    slides: [
      { kind: "cover", pre: "Erros que fazem o", big: "lead sumir", sub: "e como evitar", icon: "cross" },
      { kind: "step", title: "Mensagem genérica", text: "Copiar e colar o mesmo texto para todo mundo.", icon: "cross", fix: "Cite o nome e a cidade do negócio." },
      { kind: "step", title: "Textão logo de cara", text: "Parágrafos longos no primeiro contato.", icon: "cross", fix: "Poucas linhas e uma pergunta." },
      { kind: "step", title: "Vender no primeiro oi", text: "Mandar preço e proposta antes de conversar.", icon: "cross", fix: "Comece a conversa primeiro." },
      { kind: "step", title: "Não fazer follow-up", text: "Mandar uma vez só e esquecer o lead.", icon: "cross", fix: "Organize seus leads e volte a chamar." },
      { kind: "step", title: "Chamar no escuro", text: "Abordar sem saber o nicho e o perfil do lead.", icon: "cross", fix: "Prospecte por nicho e cidade." },
      { kind: "cta", title: "Organize seus leads", big: "grátis", url: "brigueli-ai.online" },
    ],
  },
  {
    id: "c4-planos", tag: "PLANOS",
    slides: [
      { kind: "cover", pre: "Starter, Pro,", big: "Enterprise ou Scale?", sub: "os planos da Brigueli.ai", icon: "card" },
      { kind: "plan", name: "Starter", price: "Grátis", note: "sem cartão para começar", on: true },
      { kind: "plan", name: "Pro", price: "R$ 29", note: "por mês" },
      { kind: "plan", name: "Enterprise", price: "R$ 59,99", note: "por mês" },
      { kind: "plan", name: "Scale", price: "R$ 79,99", note: "por mês" },
      { kind: "cta", title: "Veja o que cada plano inclui", big: "no site", url: "brigueli-ai.online" },
    ],
  },
];

const Footer: React.FC<{ i: number; n: number; tag: string; white?: boolean }> = ({ i, n, tag, white }) => (
  <>
    <div style={{ position: "absolute", left: 70, top: 60, fontSize: 30, fontWeight: 800, letterSpacing: "0.12em", color: white ? "rgba(255,255,255,0.85)" : MUTE }}>{tag}</div>
    <div style={{ position: "absolute", right: 70, top: 60, fontSize: 30, fontWeight: 800, color: white ? "rgba(255,255,255,0.85)" : MUTE }}>{i + 1}/{n}</div>
    <div style={{ position: "absolute", left: 70, bottom: 56, display: "flex", alignItems: "center", gap: 16 }}>
      {white ? <Mark s={54} white /> : <Mark s={54} />}
      <div style={{ fontSize: 34, fontWeight: 800, color: white ? "#fff" : INK }}>Brigueli.ai</div>
    </div>
    {i < n - 1 && (
      <svg width={120} height={40} viewBox="0 0 120 40" style={{ position: "absolute", right: 70, bottom: 64 }}>
        <path d="M6 20 H104 M82 6 L106 20 L82 34" fill="none" stroke={white ? "#fff" : AC} strokeWidth={8} strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    )}
  </>
);

export const CarouselSlide: React.FC<{ c: number; i: number }> = ({ c, i }) => {
  const car = CAROUSELS[c]!;
  const s = car.slides[i]!;
  const n = car.slides.length;
  const colored = s.kind === "cta" || (s.kind === "plan" && s.on);
  const bg = colored ? AC : BG;
  const ink = colored ? "#fff" : INK;
  const soft = colored ? "rgba(255,255,255,0.85)" : MUTE;
  return (
    <AbsoluteFill style={{ background: bg, fontFamily: FONT, color: ink }}>
      <Footer i={i} n={n} tag={car.tag} white={colored} />
      {s.kind === "cover" && (
        <div style={{ position: "absolute", left: 90, right: 90, top: 170, bottom: 190, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", textAlign: "center", gap: 22 }}>
          <Tile k={s.icon} s={250} on />
          <div style={{ height: 24 }} />
          <div style={{ fontSize: 64, fontWeight: 600, color: MUTE, letterSpacing: "-0.02em" }}>{s.pre}</div>
          <div style={{ fontSize: 132, fontWeight: 800, color: AC, letterSpacing: "-0.03em", lineHeight: 1.02 }}>{s.big}</div>
          <div style={{ fontSize: 56, fontWeight: 700, color: INK }}>{s.sub}</div>
        </div>
      )}
      {s.kind === "step" && (
        <div style={{ position: "absolute", left: 90, right: 90, top: 170, bottom: 190, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", textAlign: "center", gap: 30 }}>
          <Tile k={s.icon} s={230} on={s.icon !== "cross"} />
          <div style={{ fontSize: 96, fontWeight: 800, color: INK, letterSpacing: "-0.03em", lineHeight: 1.05 }}>{s.title}</div>
          <div style={{ fontSize: 50, fontWeight: 600, color: MUTE, lineHeight: 1.25, maxWidth: 860 }}>{s.text}</div>
          {s.fix && (
            <div style={{ marginTop: 14, display: "flex", alignItems: "center", gap: 20, background: LIGHT, borderRadius: 48, padding: "26px 40px" }}>
              <div style={{ width: 64, height: 64, borderRadius: 18, background: AC, display: "grid", placeItems: "center", flex: "none" }}><Ic k="check" s={40} c="#fff" /></div>
              <div style={{ fontSize: 46, fontWeight: 800, color: INK, textAlign: "left", lineHeight: 1.15 }}>{s.fix}</div>
            </div>
          )}
        </div>
      )}
      {s.kind === "bubble" && (
        <div style={{ position: "absolute", left: 90, right: 90, top: 170, bottom: 190, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 36 }}>
          <div style={{ fontSize: 46, fontWeight: 800, color: MUTE }}>{s.label}</div>
          <div style={{ background: AC, color: "#fff", borderRadius: "56px 56px 12px 56px", padding: "56px 60px", fontSize: 52, fontWeight: 700, lineHeight: 1.3 }}>{s.text}</div>
          <div style={{ fontSize: 40, fontWeight: 700, color: MUTE }}>{s.note}</div>
        </div>
      )}
      {s.kind === "plan" && (
        <div style={{ position: "absolute", left: 90, right: 90, top: 170, bottom: 190, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", textAlign: "center", gap: 18 }}>
          <div style={{ fontSize: 84, fontWeight: 800, color: soft }}>{s.name}</div>
          <div style={{ fontSize: 210, fontWeight: 800, color: s.on ? "#fff" : AC, letterSpacing: "-0.04em", lineHeight: 1 }}>{s.price}</div>
          <div style={{ fontSize: 56, fontWeight: 700, color: s.on ? "#fff" : INK }}>{s.note}</div>
        </div>
      )}
      {s.kind === "cta" && (
        <div style={{ position: "absolute", left: 90, right: 90, top: 170, bottom: 190, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", textAlign: "center", gap: 26 }}>
          <div style={{ fontSize: 70, fontWeight: 600, color: soft, lineHeight: 1.1 }}>{s.title}</div>
          <div style={{ fontSize: 190, fontWeight: 800, color: "#fff", letterSpacing: "-0.04em", lineHeight: 1 }}>{s.big}</div>
          <div style={{ marginTop: 20, background: "#fff", color: AC, borderRadius: 64, padding: "28px 56px", fontSize: 54, fontWeight: 800 }}>{s.url}</div>
        </div>
      )}
    </AbsoluteFill>
  );
};
