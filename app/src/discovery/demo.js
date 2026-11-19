'use strict';
// Empresas 100% FICTÍCIAS, para testar sem credenciais. Domínios ".example" são reservados e não existem.
// Telefones usam o bloco 9 0000-xxxx, que não corresponde a linhas reais.

const page = (title, desc, body) => `<html><head><title>${title}</title><meta name="description" content="${desc}"></head><body><h1>${title}</h1>${body}</body></html>`;

const DEMO_CAMPAIGN = {
  name: 'Demonstração — agendamento para clínicas (empresas fictícias)',
  seller_name: 'Ana Souza',
  company: 'AgendaFácil (exemplo)',
  offer: 'sistema de agendamento online com confirmação automática por WhatsApp',
  problem: 'reduzir faltas e o tempo que a recepção gasta confirmando consultas',
  segment: 'clínica odontológica',
  region: 'Campinas e região',
  profile: 'clínicas pequenas e médias, com atendimento por consulta marcada',
  differentials: 'Implantação em um dia\nSem fidelidade de contrato',
  cases_text: 'Na Clínica Modelo (exemplo), as faltas caíram de 22% para 9% em três meses.',
  voice: 'Informal, direto e educado. Trata por "você". Sem emojis.',
  voice_examples: 'Oi, tudo bem? Aqui é a Ana. Vi que vocês atendem por agendamento e queria trocar uma ideia rápida. Posso te contar como funciona?',
  leads_per_run: 5,
  discard_criteria: 'franquia\nrede de clínicas',
};

const D = (slug) => `https://${slug}.example`;

const DEMO_CANDIDATES = [
  { name: 'Clínica Sorriso Vivo (EXEMPLO)', segment: 'Clínica odontológica', city: 'Campinas', address: 'Rua Fictícia, 100, Campinas - SP', website: D('sorrisovivo-exemplo'), phone: '(19) 90000-0101',
    html: page('Clínica Sorriso Vivo', 'Clínica odontológica em Campinas com implantes, ortodontia e clareamento para toda a família.', '<h2>Implantes e ortodontia</h2><p>Ligue para marcar sua consulta.</p><a href="tel:+5519900000101">Ligar</a>') },
  { name: 'OdontoCentro (EXEMPLO)', segment: 'Clínica odontológica', city: 'Campinas', address: 'Av. Inventada, 200, Campinas - SP', website: D('odontocentro-exemplo'), phone: '(19) 90000-0102',
    html: page('OdontoCentro', 'Atendimento odontológico geral e estética dental no centro de Campinas.', '<p>Agende sua consulta online pelo formulário.</p><p>Agendamento online disponível em horário comercial.</p><a href="https://wa.me/5519900000102">WhatsApp</a>') },
  { name: 'Dra. Paula Reis Odontologia (EXEMPLO)', segment: 'Dentista', city: 'Campinas', address: 'Rua Imaginária, 30, Campinas - SP', website: '', phone: '019 9 0000-0103', html: '' },
  // Duplicado por domínio (nome e telefone diferentes)
  { name: 'Clinica Dente Feliz (EXEMPLO)', segment: 'Clínica odontológica', city: 'Campinas', address: '', website: 'www.sorrisovivo-exemplo.example/contato', phone: '(19) 90000-0199', html: '' },
  // Duplicado por telefone (formatação diferente, domínio diferente)
  { name: 'OdontoCentro Unidade 2 (EXEMPLO)', segment: 'Clínica odontológica', city: 'Campinas', address: '', website: '', phone: '+55 19 9 0000-0102', html: '' },
  { name: 'Pet Shop Patas Felizes (EXEMPLO)', segment: 'Pet shop', city: 'Campinas', address: 'Rua Fictícia, 300, Campinas - SP', website: D('patasfelizes-exemplo'), phone: '(19) 90000-0104',
    html: page('Patas Felizes', 'Banho, tosa e rações para cães e gatos em Campinas.', '<p>Peça seu orçamento.</p>') },
  { name: 'OdontoMax Rede (EXEMPLO)', segment: 'Clínica odontológica', city: 'Campinas', address: '', website: D('odontomax-exemplo'), phone: '(19) 90000-0105',
    html: page('OdontoMax', 'Rede de clínicas odontológicas com unidades em todo o estado.', '<p>Seja um franqueado: franquia odontológica com suporte completo.</p>') },
  { name: 'Clínica Bem-Estar Dental (EXEMPLO)', segment: 'Clínica odontológica', city: 'Valinhos', address: 'Rua Fictícia, 50, Valinhos - SP', website: D('bemestardental-exemplo'), phone: '(19) 90000-0106',
    html: page('Bem-Estar Dental', 'Clínica odontológica em Valinhos com foco em atendimento humanizado.', '<p>Atendemos com hora marcada.</p>') },
  { name: 'Odonto Kids (EXEMPLO)', segment: 'Odontopediatria', city: 'Campinas', address: 'Rua Inventada, 400, Campinas - SP', website: D('odontokids-exemplo'), phone: '(19) 90000-0107',
    html: page('Odonto Kids', 'Clínica odontológica infantil em Campinas, com ambiente lúdico e atendimento para crianças.', '<p>Solicite orçamento ou marque sua avaliação.</p><a href="https://wa.me/5519900000107">Fale no WhatsApp</a>') },
  { name: 'Clínica Sorriso Novo (EXEMPLO)', segment: 'Clínica odontológica', city: 'Campinas', address: 'Rua Imaginária, 77, Campinas - SP', website: D('sorrisonovo-exemplo'), phone: '(19) 3000-0110',
    html: page('Sorriso Novo', 'Clínica odontológica em Campinas especializada em próteses e tratamentos de canal.', '<p>Atendimento de segunda a sábado.</p>') },
].map((c) => ({ ...c, sourceUrl: c.website ? (/^https?:/.test(c.website) ? c.website : `https://${c.website}`) : '', sourceLabel: 'Empresa fictícia de demonstração', origin: 'demo', isExample: true, note: 'EXEMPLO FICTÍCIO: não existe de verdade.' }));

async function* demoCandidates() { for (const c of DEMO_CANDIDATES) yield c; }

module.exports = { DEMO_CAMPAIGN, DEMO_CANDIDATES, demoCandidates };
