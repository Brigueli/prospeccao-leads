# Automação com a API oficial do WhatsApp Business

## O que o /automatizar faz e o que ele NÃO faz

O /automatizar prospecta leads de vários nichos e cidades, gera uma mensagem diferente para cada empresa e monta a fila de envio com dia, hora, telefone, modelo e custo. Ele entrega a fila pronta em planilha.

Ele NÃO envia mensagem sozinho pela conta pessoal do usuário no WhatsApp e NÃO usa programa não oficial, como Baileys ou whatsapp-web.js. Enviar em massa pela conta pessoal, com programa não oficial, é contra as regras do WhatsApp e o número pode ser banido. A automação aqui é só pela API oficial do WhatsApp Business, a Cloud API da Meta.

## Entrevista do /automatizar

Pergunte, nesta ordem, e só comece depois de todas as respostas:

1. Quais nichos da lista de 50, podendo ser mais de um.
2. Quais cidades e estados, podendo ser mais de uma.
3. Quantos envios por dia. Padrão seguro para começar: 20 por dia.
4. Intervalo entre envios. Padrão: 1 envio a cada 30 minutos, só em horário comercial.
5. Horário de início e de fim dos envios.

## Regras de envio

- Comece com no máximo 20 envios por dia, 1 a cada 30 minutos, em horário comercial.
- O limite inicial da conta nova na Cloud API é de 250 pessoas diferentes por 24 horas, e só sobe com o tempo e com boa qualidade de envio.
- Use no mínimo 3 modelos de mensagem diferentes e alterne entre eles, sempre com o nome da empresa e o nicho dela.
- Nunca envie duas vezes para o mesmo número no mesmo dia.
- Nunca envie para número em formato antigo ou incompleto sem testar antes.
- Pare tudo se houver bloqueio, denúncia de spam ou queda na qualidade da conta, e avise o usuário.
- Prospecção fria, para quem nunca pediu contato, tem risco alto de denúncia e de queda na qualidade da conta, mesmo na API oficial. A Meta exige opt-in para mensagem de marketing. Comece pelos leads com WhatsApp confirmado e volume baixo, e acompanhe as respostas e denúncias.

## O que precisa para ligar a API oficial

1. Conta no Meta Business Suite e empresa verificada com documentos.
2. Um número de telefone exclusivo para o WhatsApp Business. Esse número não pode ter conta ativa no WhatsApp comum nem no WhatsApp Business no celular.
3. App de desenvolvedor na Meta, com o produto WhatsApp, e uma conta WhatsApp Business (WABA).
4. Token de acesso de usuário de sistema, guardado com segurança, nunca no código do site e nunca no chat.
5. Webhook HTTPS com certificado válido para receber entregas e respostas.
6. Modelo de mensagem, o template, criado no Gerenciador do WhatsApp e aprovado pela Meta antes de enviar.
7. Cartão cadastrado na conta da empresa, em BRL, para pagar as mensagens.

Sem esses 7 itens a automação não sai do papel. Um provedor oficial, BSP, como Whaticket e outros, faz essa parte por uma plataforma pronta, e cobra assinatura além da tarifa da Meta.

## Template de marketing

Fora da janela de 24 horas depois da última mensagem do cliente, só dá para iniciar conversa com template aprovado. O template é da categoria Marketing, com variáveis para nome da empresa e nicho. Exemplo de base, para aprovar na Meta antes de usar:

"Olá, aqui é o Lorenzo, eu faço sites. Vi que a {{nome_da_empresa}} atende muito pelo WhatsApp, mas não tem um site próprio. Um site com {{beneficio_do_nicho}} ajuda a receber pedidos e orçamentos sem depender só do WhatsApp. Quer que eu te mostre uma ideia rápida para a {{nome_da_empresa}}? Responda SIM para receber ou NÃO para não receber mais mensagens."

Nunca prometa que o template vai ser aprovado. A Meta pode recusar template de prospecção fria.

## Custo

A Meta cobra por mensagem entregue, por categoria e por país. Para o Brasil, a tarifa de referência da categoria Marketing é R$ 0,3217 por mensagem entregue. Ou seja, 20 envios por dia custam cerca de R$ 6,43 por dia em tarifa da Meta, sem contar assinatura de provedor, se houver. Confirme a tarifa vigente na página oficial da Meta antes de fechar o orçamento, porque ela muda.

## Fila de envio

Entregue a fila em planilha, com as colunas: Data e hora do envio, Nome da empresa, Nicho, Cidade e estado, Telefone, Template usado, Mensagem final, Status (Pendente, Enviado, Respondido, Sem resposta, Bloqueado) e Custo estimado. Entregue junto a planilha de leads normal, com os mesmos leads.

## Exemplo de envio pela Cloud API

Depois do template aprovado e do token criado, o envio é uma chamada HTTP para a Graph API, com o telefone do remetente, o número do lead e o nome do template. Guarde o token fora do código, em variável de ambiente, e nunca cole o token no chat. A skill não guarda token e não envia mensagem sozinha: ela só prepara a fila e o exemplo de chamada.
