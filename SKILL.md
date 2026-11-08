# Prospecção de Leads

## A regra da barra

- Use / na frente para chamar a skill e qualquer comando.
- Os comandos que funcionam são `/prospectar`, `/nichos`, `/leads`, `/planilha`, `/mensagem`, `/mais`, `/descartados`, `/resumo`, `/automatizar` e `/help`.
- Os comandos que não funcionam são `$prospectar`, `prospectar` sem / e `quero prospectar` sem /.
- Trate qualquer mensagem sem / como mensagem normal e a skill não ativa sem o comando.

## Comandos

- Use `/prospectar` para começar uma busca nova de leads.
- Use `/prospectar` com o nicho e a cidade junto para pular a entrevista.
- Use `/nichos` para ver a lista dos 50 nichos e escolher um deles.
- Use `/leads` para ver os leads já encontrados na conversa atual.
- Use `/planilha` para gerar de novo a planilha com os leads já encontrados.
- Use `/mensagem` para montar a mensagem de abordagem para um lead da planilha.
- Use `/mais` para buscar mais leads do mesmo nicho na mesma cidade, sem repetir os leads já encontrados.
- Use `/descartados` para ver quem foi descartado na busca atual e o motivo do descarte de cada um.
- Use `/resumo` para ver um resumo curto da busca atual: quantos leads, quantos confirmados, quantos prováveis, quantos para testar e qual é o melhor lead.
- Use `/automatizar` para prospectar leads de vários nichos e cidades e montar a fila de envio pela API oficial do WhatsApp Business. Leia as regras completas em [automatizar](references/automatizar.md) antes de começar.
- Use `/help` para ver a lista de todos os comandos com uma explicação curta de cada um.
- Mostre a lista completa de comandos quando o usuário digitar `/help`, a qualquer momento, sem apagar o que já foi feito.

## Comece perguntando

- Comece com `/prospectar` mostrando a lista dos 50 nichos numerados de 1 a 50.
- Deixe o usuário escolher pelo número ou pelo nome do nicho.
- Leia a lista completa em [nichos](references/nichos.md) e nunca invente um nicho novo na hora.
- Depois do nicho, peça para o usuário digitar a cidade e o estado.
- Aceite a cidade e o estado digitados como texto livre, como Mogi das Cruzes SP ou Suzano SP.
- Nunca escolha a cidade sozinho e nunca use a localização do usuário sem ele digitar.
- Se o usuário já der nicho e cidade no comando, pule a entrevista e vá direto para a busca.
- Se o usuário responder só parte das perguntas, trabalhe com o que ele deu e pergunte só o que falta.

## Os 5 passos da busca

- Faça os 5 passos abaixo em ordem em toda busca e nunca pule um deles.
- Busque o nicho na cidade INTEIRA no Maps e no Google, com várias buscas diferentes, e junte os resultados de todas as fontes.
- Descarte quem já tem site próprio e fique só com quem não tem site próprio.
- Fique só com quem tem celular ou WhatsApp e descarte quem só tem telefone fixo sem celular publicado.
- Marque como WhatsApp confirmado só quando a própria empresa publica o número como WhatsApp.
- Avise quando o número está em formato antigo ou incompleto e peça para testar antes de mandar mensagem.
- Entregue endereço, telefone, link do WhatsApp e o motivo de ser um bom lead para cada lead da lista.

## Busca na cidade INTEIRA

- A busca cobre a cidade INTEIRA que o usuário digitou, nunca só o centro e nunca só a primeira página de resultados.
- Nunca pare na primeira busca: faça no mínimo 4 buscas diferentes antes de fechar a lista.
- Varie as buscas em cada rodada: o nicho com a cidade, o nicho com "centro" e a cidade, o nicho com "delivery" e a cidade, o nicho com "bairro" e a cidade, e variações do nome do nicho, como sinônimos e o nome no singular e no plural.
- Busque também por bairros e regiões da cidade quando souber os nomes deles, e por ruas e avenidas movimentadas, para alcançar quem não aparece na busca geral.
- Busque também em listas locais, como TeleListas, Guia Fácil, Apontador, Lista Mais e Restaurant Guru, quando o Maps trouxer poucos lugares.
- Junte os resultados de todas as buscas e tire os repetidos pelo nome, pelo telefone e pelo endereço antes de montar a lista.
- Mire em pelo menos 10 leads por busca quando a cidade tiver esse tanto de empresas do nicho sem site próprio; só entregue menos quando a cidade realmente não tiver mais.
- Use `places details` com o place_id para confirmar endereço, telefone e links de quem não tem site listado.
- Nomeie só lugares que uma ferramenta devolveu e nunca invente um lugar.
- Descarte lugares fechados de forma permanente ou temporária, salvo se o usuário pedir para incluir.
- Guarde a lista de descartados com o motivo de cada um, para o comando `/descartados` mostrar depois.

## Descarte de quem tem site próprio

- Considere site próprio um domínio da empresa, como nomedaempresa.com.br.
- Não considere Instagram, Facebook, Linktree ou perfil no Google como site próprio.
- Descarte quem tem site próprio, mesmo que o site seja simples ou desatualizado.
- Marque como site da rede quando for franquia com site corporativo e sem site próprio da unidade.
- Deixe quem tem site da rede no fim da lista, com a ressalva escrita, e nunca coloque no topo.
- Registre o site encontrado em cada lead descartado, para o usuário conferir depois.

## Verificação do WhatsApp

- Leia as regras completas em [verificação do WhatsApp](references/verificacao-whatsapp.md).
- Marque WhatsApp confirmado só com prova publicada pela própria empresa.
- Considere prova um post da empresa que diz WhatsApp e mostra o número, a bio do Instagram com o número, o botão de WhatsApp no perfil do Google ou o site da empresa com o número de WhatsApp.
- Marque WhatsApp provável quando o número é celular e não há prova publicada pela empresa.
- Nunca marque WhatsApp confirmado só porque o número é celular ou porque o link wa.me abre.
- Use o caso da MultiTravel Mogi como exemplo de prova e a MultiTravel publicou o número 11 99662-8511 como WhatsApp no Instagram em 19 de outubro de 2026.
- Avise quando o número é fixo e não há celular publicado e descarte esse lead da lista final.

## Aviso de número antigo ou incompleto

- Confira o formato de todo telefone antes de entregar a planilha.
- Considere formato certo o celular com DDD e 9 dígitos começando com 9, como 11 99662-8511.
- Considere formato antigo o número com 8 dígitos, como 11 9888-9838, e o número com DDD e 8 dígitos sem o 9 na frente.
- Escreva o número exatamente como a fonte mostrou e escreva ao lado a versão para testar com o 9 na frente.
- Nunca invente o dígito que falta e nunca apresente a versão testada como se fosse o número confirmado.
- Avise no campo de observação da planilha que o número precisa de teste no WhatsApp antes do contato.

## A saída é planilha

- Entregue o resultado sempre em planilha e nunca entregue só a lista no chat.
- Leia as colunas, o nome do arquivo e a entrega em [planilha](references/planilha.md).
- Crie a planilha com `artifact.create_file` com kind spreadsheet e entregue o arquivo na mesma mensagem que diz que está pronta.
- Coloque na planilha nome, nicho, cidade e estado, endereço, telefone, link do WhatsApp, site próprio, WhatsApp confirmado, motivo de ser bom lead, fonte e data da busca.
- Ordene a planilha com WhatsApp confirmado primeiro, depois WhatsApp provável e por último os números para testar.
- Escreva no chat um resumo curto com o melhor lead e quantos leads confirmados e prováveis a planilha tem.
- Guarde a planilha em `~/workspace/your_files/prospeccao-leads/` com o nome do nicho e da cidade.

## Mensagem de abordagem

- Monte a mensagem só quando o usuário pedir com `/mensagem` e com um lead da planilha.
- Leia o modelo em [mensagem](references/mensagem.md) e adapte com o nome da empresa, o nicho e o que ela não tem hoje.
- Faça a mensagem curta, direta e em português, com o nome da empresa e a oferta de site.
- Nunca mande a mensagem para a empresa sozinho e entregue o texto para o usuário copiar.

## Automação pela API oficial

- O `/automatizar` só funciona pela API oficial do WhatsApp Business, a Cloud API da Meta. Nunca use programa não oficial e nunca envie pela conta pessoal do usuário.
- Antes de começar, leia [automatizar](references/automatizar.md) e faça a entrevista de lá: nichos, cidades, quantos envios por dia, intervalo e horário de início e fim.
- Padrão seguro para começar: no máximo 20 envios por dia, 1 a cada 30 minutos, só em horário comercial, com no mínimo 3 modelos de mensagem diferentes.
- Prospecte os leads com os 5 passos normais, tire os repetidos e monte a fila de envio em planilha, com data e hora, telefone, modelo usado, mensagem final, status e custo estimado.
- Avise o usuário do que falta para ligar a API: empresa verificada na Meta, número exclusivo, app e conta WhatsApp Business, token guardado com segurança, webhook, template aprovado e cartão em BRL. Sem isso, entregue só a fila pronta, e não prometa envio automático.
- Avise o custo: mensagem de marketing para o Brasil custa cerca de R$ 0,3217 por mensagem entregue, então 20 por dia custam cerca de R$ 6,43 por dia em tarifa da Meta.
- Avise o risco: prospecção fria, para quem nunca pediu contato, pode gerar denúncia e queda na qualidade da conta, mesmo na API oficial. Comece pelos leads com WhatsApp confirmado e volume baixo.

## Buscar mais, descartados e resumo

- Quando o usuário digitar `/mais`, busque mais leads do mesmo nicho na mesma cidade, com buscas novas que ainda não foram feitas, sem repetir nenhum lead já encontrado, e acrescente os novos na planilha.
- Quando o usuário digitar `/descartados`, mostre no chat quem foi descartado na busca atual, com o motivo de cada descarte, como site próprio, só telefone fixo ou fechado.
- Quando o usuário digitar `/resumo`, mostre no chat quantos leads a busca atual tem, quantos com WhatsApp confirmado, quantos prováveis, quantos para testar, quantos foram descartados e qual é o melhor lead, com o telefone dele.

## Available connectors

- [Places Search](/opt/hatch/connectors/places/CONNECTOR.md) for place search results, rich details, photos and identifying a place from a photo.

- Use `muse.connector_search` to find other connectors and `muse.skill_search` to find related skills.

- If nothing here fits, look on the web for a maintained API or MCP server and set it up with [Custom Connectors and MCPs](/opt/muse/skills/custom-connector-setup/SKILL.md), or build a custom connector.

## Websites

- [Google Maps](https://maps.google.com/) for finding businesses by niche and city and for checking phone, address and website.

- [TeleListas](https://www.telelistas.net/) for finding small businesses by niche and city when Maps returns few results.

- [Guia Fácil](https://guiafacil.com/) for finding small businesses by niche and city when Maps returns few results.

## Alternatives for better results

- Busque em uma cidade vizinha quando a cidade pedida trouxer poucos leads sem site.
- Busque um nicho parecido da lista de 50 quando o nicho pedido trouxer poucos leads sem site.
- Refaça a busca em outro dia quando muitos números estiverem desatualizados e avise o usuário.
