# Prospecção de Leads

Skill para encontrar empresas sem site próprio em uma cidade, com celular e WhatsApp, e entregar os leads em planilha para quem vende sites.

## Comandos

Todos os comandos só funcionam com `/` na frente.

- `/prospectar` — começa uma busca nova de leads
- `/nichos` — mostra a lista dos 30 nichos
- `/leads` — mostra os leads já encontrados na conversa atual
- `/planilha` — gera de novo a planilha com os leads já encontrados
- `/mensagem` — monta a mensagem de abordagem para um lead da planilha
- `/mais` — busca mais leads do mesmo nicho na mesma cidade, sem repetir os já encontrados
- `/descartados` — mostra quem foi descartado e o motivo de cada descarte
- `/resumo` — mostra o resumo da busca atual: quantos leads, quantos confirmados, quantos prováveis e qual é o melhor lead
- `/help` — mostra todos os comandos

## Como funciona

1. `/prospectar` mostra os 30 nichos numerados de 1 a 30.
2. Você escolhe o nicho pelo número ou pelo nome.
3. Você digita a cidade e o estado.
4. A skill busca o nicho na cidade INTEIRA no Maps e no Google, com no mínimo 4 buscas diferentes, por centro, bairros, delivery e variações do nome do nicho, mirando em pelo menos 10 leads.
5. Descarta quem já tem site próprio.
6. Fica só com quem tem celular ou WhatsApp.
7. Marca como WhatsApp confirmado só quando a própria empresa publica o número como WhatsApp.
8. Avisa quando o número está em formato antigo ou incompleto, para testar antes.
9. Entrega a planilha com endereço, telefone, link do WhatsApp e o motivo de ser um bom lead.

## Planilha

A planilha tem as colunas: Nome da empresa, Nicho, Cidade e estado, Endereço, Telefone, Link do WhatsApp, Site próprio, WhatsApp confirmado, Motivo de ser bom lead, Fonte e Data da busca. Ela é formatada com cabeçalho azul-marinho, filtro, linhas alternadas, cores no WhatsApp confirmado (verde, amarelo e vermelho) e abas de Resumo e de Como foi feita a busca.

## Arquivos

- `SKILL.md` — as instruções da skill
- `skill.yaml` — nome, título e descrição da skill
- `references/nichos.md` — os 30 nichos
- `references/verificacao-whatsapp.md` — as regras de WhatsApp confirmado e provável
- `references/planilha.md` — as regras da planilha
- `references/mensagem.md` — o modelo da mensagem de abordagem
