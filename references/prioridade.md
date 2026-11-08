# Ranquear os leads por prioridade

## O que o comando faz

O `/prioridade` ranqueia os leads da planilha atual e mostra quem abordar primeiro. O ranking aparece só no chat e não muda a ordem da planilha.

## Pontuação

Some os pontos de cada lead:

- WhatsApp confirmado: +3 pontos. WhatsApp provável: +1 ponto. Testar número: 0 pontos.
- Sem site próprio: +2 pontos. Site da rede: -3 pontos.
- Endereço completo com número: +1 ponto. Endereço sem número: 0 pontos.

Quem está com a caixinha marcada em Já falei? sai do ranking.

## Exemplos

- WhatsApp confirmado + sem site + endereço completo: 3 + 2 + 1 = 6 pontos (topo da lista).
- WhatsApp provável + sem site + endereço completo: 1 + 2 + 1 = 4 pontos.
- WhatsApp provável + site da rede + endereço completo: 1 - 3 + 1 = -1 ponto (fim da lista).

## Saída

- Mostre no chat os 5 primeiros colocados, com a pontuação e o motivo da posição de cada um.
- Se houver empate, desempate pelo WhatsApp confirmado primeiro.
