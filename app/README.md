# Prospector local

Sistema de prospecção comercial que roda no seu computador: você descreve o que vende e para quem, o sistema busca empresas, pesquisa fontes públicas, classifica cada lead, escreve uma primeira mensagem e abre a conversa no WhatsApp Web **com o texto preenchido, para você conferir e enviar**.

**Esta primeira versão não envia nada sozinha.** Abrir o link do WhatsApp não conta como envio; você marca o envio e a resposta manualmente.

## Requisitos

- Node.js **22.13 ou mais novo** (`node -v`). O banco é o SQLite embutido no Node: não precisa compilar nada nem instalar banco.

## Instalar e iniciar

```bash
cd app
npm install
cp .env.example .env      # opcional para a demonstração; necessário para Google Places / IA
npm start
```

Abra **http://localhost:3000**. O servidor escuta só em `127.0.0.1` (não fica exposto na rede) e recusa requisições de outros sites.
Os dados ficam em `app/data/prospector.db` (ignorado pelo git). Para mudar a porta: `PORT=3010 npm start`.

## Rodar a demonstração (sem credenciais)

1. Em **Campanhas**, abra a campanha *Demonstração — agendamento para clínicas* (já vem criada).
2. Clique em **Prospectar (demonstração)**. A rodada traz 5 empresas fictícias novas e descarta 2 repetidas (uma por domínio, outra por telefone normalizado). Todas aparecem com a etiqueta **EXEMPLO**.
3. Em **Pipeline**, clique em uma empresa. Veja fatos confirmados com link da fonte, hipóteses separadas, a justificativa da classificação e o rascunho com o detalhe que o justifica.
4. Edite, **Salve edição** ou **Gere outra versão** (as anteriores ficam em *Versões*) e clique em **Aprovar rascunho**.
5. **Abrir conversa** só libera depois da aprovação. Em leads de exemplo o número é fictício: não envie.
6. Depois de enviar no WhatsApp, clique em **Marcar como enviado** (ou **Marcar como respondeu**).
7. Rode **Prospectar** de novo: aparecem os outros leads, e os já existentes mantêm status, rascunhos e histórico.
8. **Exportar Excel (.xlsx)** / **Exportar CSV** no Pipeline (respeitam os filtros ativos).
9. **Reiniciar demonstração** apaga só os dados da demonstração.

## Criar a sua campanha

Em **Campanhas → + Nova campanha** preencha: seu nome e empresa, o que vende, o problema que resolve, segmento, região, perfil da empresa, diferenciais e cases reais, seu jeito de escrever (com exemplos opcionais), leads por rodada e critérios de descarte. Nada disso está no código.

Dicas para o texto sair natural:
- *O que você vende*: uma frase (“sistema de agendamento online”).
- *Problema que resolve*: comece com verbo no infinitivo (“reduzir faltas e o tempo gasto confirmando consultas”).
- *Cases*: escreva só o que é verdade, como você diria. A mensagem usa o primeiro, sem mexer nos números.
- *Critérios de descarte*: um por linha; se a expressão aparecer no nome, observação ou site, o lead vira “fora do perfil”.

## Configurar a fonte de busca (Google Places)

1. No [Google Cloud Console](https://console.cloud.google.com/), crie um projeto, habilite o faturamento e ative **Places API (New)**.
2. Crie uma chave de API (recomendado restringi-la à Places API (New)).
3. Em `app/.env`: `GOOGLE_PLACES_API_KEY=sua-chave`.
4. Reinicie (`Ctrl+C`, `npm start`). Na campanha, clique em **Prospectar (Google Places)**.

A busca usa `"<segmento> em <região>"`, até 3 páginas (≈60 resultados) e para quando chega ao número de leads **novos** da campanha. Negócios fechados são ignorados. O uso é cobrado pelo Google conforme a tabela dele.
Sem chave, chave recusada ou limite estourado, a interface mostra a mensagem do problema, e tudo o que já foi salvo continua lá (rodada marcada como *parcial* ou *erro*).

## Importar CSV (segunda fonte)

Na campanha, **Importar CSV** (modelo em **Baixar modelo de CSV**). Aceita separador `;`, `,` ou tab. Colunas reconhecidas: `nome` (obrigatória), `segmento`, `cidade`, `endereco`, `site`, `telefone`, `observacao`, `fonte` (link), `contato_nome`, `contato_cargo`, `contato_fonte` (link). Os leads importados passam pela mesma pesquisa, qualificação e deduplicação.

## O que é pesquisado e como

- **Site da empresa**: página inicial e até 2 páginas internas (contato/sobre/serviços). Timeout de 8 s, limite de 1,5 MB, respeita `robots.txt` e bloqueia endereços internos (proteção contra SSRF). Links de Instagram/Facebook etc. não são tratados como “site próprio” e não são lidos.
- **Telefone**: só números informados por você/pelo CSV/pelo Google, ou publicados pela própria empresa no site (link `tel:`, link de WhatsApp ou texto). Se não houver, o campo fica vazio. Celulares geram link `wa.me`; **fixos não** (o WhatsApp não é garantido).
- **Pessoa de contato**: o nome só entra na mensagem se nome, cargo **e link de fonte** estiverem preenchidos.
- **Fatos × hipóteses**: fatos têm sempre link de fonte; hipóteses (inclusive “não achei X no site”) ficam separadas e nunca são usadas como fato na mensagem.
- **Classificação** (regras explícitas, com motivo em uma frase): *fora do perfil* (bate em critério de descarte ou segmento sem relação), *bom encaixe* (segmento confirmado em fonte + região compatível + fato com fonte pública), *precisa de revisão* (o resto, com a lacuna descrita).
- **Deduplicação** por domínio e por telefone normalizado (E.164), dentro da campanha. Quando reaparece, nada é sobrescrito: só se completam campos vazios e o histórico registra o reencontro.

## Mensagens

Por padrão usa um gerador por modelos, que usa sua voz (saudação, formalidade, emoji detectados nos seus exemplos/descrição), um detalhe confirmado com fonte, sua oferta e termina com uma pergunta. Sem detalhe confirmado, o rascunho fica marcado **“precisa de pesquisa”** (genérico, sem afirmar nada sobre a empresa) e só é aprovado com confirmação explícita.
Textos com urgência artificial ou que afirmem conhecer a empresa/ter usado seus serviços/ter achado um problema interno **não podem ser aprovados**.

**IA opcional**: em `.env` defina `AI_PROVIDER=anthropic` e `ANTHROPIC_API_KEY=...` (modelo em `ANTHROPIC_MODEL`). A chave fica só no servidor. Se a IA falhar ou gerar texto fora das regras, o sistema usa o modelo e mostra o motivo.

## WhatsApp Web

- **Conectar ao WhatsApp Web** apenas abre https://web.whatsapp.com/ em outra aba para você escanear o QR. A sessão fica no seu navegador; o sistema não lê cookies/sessão e **não afirma estar conectado** (não tem como verificar).
- **Abrir conversa** (após aprovar, e só para celular válido) abre `https://wa.me/<número internacional>?text=<texto codificado>`.
- **Pediu para não receber contato** bloqueia o número em todos os leads e em rodadas futuras (aba **Não contatar**, onde também dá para bloquear um número manualmente ou remover um bloqueio feito por engano).
- Envio automático está fora desta versão. Se algum dia for adicionado, deve usar a API oficial do WhatsApp Business, com consentimento e templates aprovados.

## Pipeline e planilha

Status: novo, em revisão, aprovado, enviado, respondeu, descartado, não contatar. Busca e filtros por campanha, status e classificação. A exportação (.xlsx e .csv, este com `;` e BOM para abrir direto no Excel) inclui contatos, fontes, justificativa, fatos, hipóteses, mensagem, detalhe usado e status. Textos que começam com `=`, `+`, `-` ou `@` são neutralizados para não virarem fórmulas.

## Testes

```bash
cd app
npm test
```

Cobrem: telefone, `wa.me`, regras de mensagem, SSRF, CSV, qualificação, o fluxo completo da demonstração (campanha → descoberta → deduplicação → aprovação → link do WhatsApp → bloqueio → exportação), importação de CSV lendo um site local, e o Google Places contra um servidor simulado (sem chave, chave recusada, paginação, falha parcial). Nenhum teste envia mensagem nem acessa a internet.

## Estrutura

```
app/
  server.js            API Express + arquivos estáticos
  src/service.js       regras de negócio (campanhas, leads, rodadas, rascunhos, status, bloqueios)
  src/research.js      leitura de sites e separação de fatos/hipóteses
  src/qualify.js       classificação explicável
  src/message.js       gerador por modelos, IA opcional e verificação das regras
  src/discovery/       places.js, csv.js, demo.js
  src/export.js        xlsx/csv
  public/              interface web
  test/                testes
```

## Limites conhecidos

- A integração com o Google Places e com o provedor de IA foi testada apenas contra servidores simulados; elas dependem das suas credenciais para validação real.
- A pesquisa lê apenas HTML estático: sites que só mostram conteúdo via JavaScript podem render poucos fatos (o lead fica “precisa de revisão”/“precisa de pesquisa”).
- Não há login: o sistema é pensado para uso local por uma pessoa.
