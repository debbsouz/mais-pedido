# Fluxos do +Pedido

Este documento descreve como cada tipo de usuário utiliza o +Pedido.

O sistema terá experiências diferentes para cada perfil, mantendo todos os pedidos e operações integrados.

## Perfis do sistema

- Cliente
- Garçom
- Atendente
- Caixa
- Cozinha
- Entregador
- Gerente
- Proprietário
- Administrador da Next Code

---

## Regra principal

Cada perfil deverá visualizar apenas as informações e ações necessárias para realizar o próprio trabalho.

Os perfis poderão utilizar interfaces, menus e páginas diferentes.

Todos os pedidos, independentemente da origem, deverão entrar na mesma operação do estabelecimento.

## Origens possíveis de um pedido

- Cardápio digital
- WhatsApp
- Telefone
- Balcão
- Garçom
- QR Code da mesa
- Pedido manual pelo painel

---

# Fluxo 01 — Cliente no cardápio digital

## Objetivo

Permitir que o cliente faça um pedido de forma rápida, sem precisar acessar o painel interno do estabelecimento.

## Entrada

O cliente pode chegar ao cardápio por:

- link compartilhado;
- Instagram;
- WhatsApp;
- Google;
- site do estabelecimento;
- QR Code;
- QR Code da mesa.

## Fluxo principal

1. O cliente abre o cardápio.
2. O sistema identifica o estabelecimento.
3. O cliente escolhe a modalidade:
   - delivery;
   - retirada;
   - consumir no local, quando vier pelo QR Code da mesa.
4. O cliente navega pelas categorias.
5. Seleciona um produto.
6. Escolhe adicionais, variações e observações.
7. Adiciona o produto ao carrinho.
8. Repete o processo, se desejar.
9. Revisa o carrinho.
10. Informa nome e WhatsApp.
11. Se for delivery, informa ou seleciona o endereço.
12. Escolhe a forma de pagamento.
13. Confirma o pedido.
14. O sistema cria o pedido.
15. O cliente recebe a confirmação e pode acompanhar o andamento.

## Primeiro pedido

O cliente não será obrigado a criar uma conta tradicional.

No primeiro pedido, serão solicitados apenas:

- nome;
- WhatsApp;
- endereço, quando necessário.

O sistema poderá reconhecer o cliente em pedidos futuros pelo telefone.

## Informações mostradas ao cliente

- produtos;
- preços;
- adicionais;
- tempo estimado;
- taxa de entrega;
- valor total;
- status do pedido.

## Informações que o cliente não vê

- dashboard;
- financeiro;
- estoque interno;
- dados de outros clientes;
- pedidos de outras pessoas;
- configurações do estabelecimento.

## Estados do pedido para o cliente

- pedido recebido;
- confirmado;
- em preparo;
- pronto para retirada;
- saiu para entrega;
- concluído;
- cancelado.

## Exceções

### Loja fechada

O sistema informa que o estabelecimento está fechado e mostra o próximo horário de funcionamento.

### Produto indisponível

O produto não pode ser adicionado ao carrinho.

### Endereço fora da área de entrega

O sistema informa que o endereço não é atendido antes da confirmação do pedido.

### Falha no envio

O sistema mantém o carrinho e permite tentar novamente.

---

# Fluxo 02 — Garçom

## Objetivo

Permitir que o garçom lance pedidos de mesa com rapidez pelo celular ou tablet.

## Entrada

Após o login, o garçom deve ser direcionado diretamente para a área de mesas.

Ele não acessa o dashboard completo.

## Tela inicial do garçom

- mapa de mesas;
- mesas livres;
- mesas ocupadas;
- mesas aguardando atendimento;
- mesas aguardando fechamento;
- busca por mesa ou comanda.

## Fluxo principal

1. O garçom seleciona uma mesa.
2. Se a mesa estiver livre, abre uma comanda.
3. Informa o número de pessoas, quando necessário.
4. Pode identificar o cliente ou continuar sem identificação.
5. Seleciona produtos.
6. Escolhe adicionais e observações.
7. Revisa os itens.
8. Envia o pedido para produção.
9. O pedido aparece na cozinha ou setor responsável.
10. O garçom pode continuar adicionando itens à mesma comanda.
11. Quando solicitado, abre a pré-conta.
12. Encaminha o fechamento para o caixa ou conclui, caso tenha permissão.
13. Após o pagamento, a mesa volta ao estado livre.

## Ações permitidas

- abrir comanda;
- adicionar produtos;
- adicionar observações;
- enviar pedido para produção;
- consultar itens da mesa;
- solicitar pré-conta;
- transferir comanda;
- transferir itens;
- juntar mesas, se autorizado.

## Ações que dependem de permissão

- aplicar desconto;
- cancelar item já enviado;
- cancelar pedido;
- fechar conta;
- alterar forma de pagamento;
- reabrir comanda.

## Informações que o garçom não vê

- faturamento geral;
- assinatura do sistema;
- planos;
- configurações avançadas;
- relatórios financeiros;
- dados de outras unidades.

## Exceções

### Mesa já ocupada

O sistema abre a comanda existente e mostra o responsável atual.

### Produto indisponível

O produto aparece como indisponível e não pode ser enviado.

### Pedido já em preparo

Alterações exigem autorização ou geram um novo envio para a cozinha.

---

# Fluxo 03 — Atendente e caixa

## Objetivo

Permitir que o estabelecimento registre pedidos recebidos por WhatsApp, telefone, balcão, retirada ou delivery.

## Tela principal

A interface deve priorizar:

- pedidos;
- botão `+ Novo Pedido`;
- busca de clientes;
- caixa;
- mesas, quando permitido;
- pedidos aguardando confirmação.

## Novo pedido manual

1. O atendente clica em `+ Novo Pedido`.
2. Escolhe a origem:
   - WhatsApp;
   - telefone;
   - balcão;
   - delivery;
   - retirada;
   - mesa.
3. Pesquisa o cliente pelo nome ou telefone.
4. Se o cliente não existir, faz um cadastro rápido.
5. Seleciona os produtos.
6. Adiciona adicionais e observações.
7. Define a modalidade.
8. Se for delivery, confirma o endereço e a taxa.
9. Escolhe a forma de pagamento.
10. Revisa o pedido.
11. Confirma.
12. O pedido entra na operação e segue para produção.

## Pedido recebido pelo WhatsApp

O cliente pode fazer o pedido diretamente com o atendente.

O atendente registra tudo no painel em nome do cliente.

A origem do pedido deve ficar registrada como `WhatsApp`.

## Pedido de balcão

O atendente pode criar um pedido sem cadastro completo do cliente.

O nome poderá ser opcional, conforme configuração.

## Pedido para retirada

O sistema deve registrar:

- nome do cliente;
- telefone;
- horário estimado;
- forma de pagamento.

## Delivery manual

O sistema deve permitir:

- selecionar cliente existente;
- cadastrar novo cliente;
- selecionar endereço;
- calcular ou informar taxa;
- escolher entregador depois;
- registrar troco, quando necessário.

## Ações permitidas

- criar pedido;
- editar pedido antes da produção;
- consultar clientes;
- cadastrar cliente;
- confirmar pagamento;
- imprimir pedido;
- acompanhar status.

## Ações que dependem de permissão

- cancelar pedido;
- aplicar desconto;
- alterar preço;
- reabrir caixa;
- excluir pagamento;
- finalizar pedido com divergência.

## Informações que o atendente não vê

- assinatura;
- planos;
- configurações sensíveis;
- dados de outras unidades;
- relatórios estratégicos, salvo permissão.

---

# Fluxo 04 — Cozinha

## Objetivo

Permitir que a equipe da cozinha visualize, prepare e finalize os pedidos de maneira rápida e organizada.

## Entrada

Após o login, o usuário da cozinha deve ser direcionado diretamente para o painel de produção.

Ele não acessa dashboard, financeiro, clientes ou configurações administrativas.

## Tela principal

O painel da cozinha deve ser dividido por etapas:

- aguardando preparo;
- em preparo;
- prontos;
- atrasados.

## Informações do pedido

Cada pedido deve mostrar:

- número do pedido;
- origem;
- horário;
- tempo de espera;
- itens;
- quantidades;
- adicionais;
- observações;
- mesa ou modalidade;
- prioridade.

A cozinha não precisa visualizar informações financeiras ou dados completos do cliente.

## Fluxo principal

1. Um pedido confirmado entra na fila da cozinha.
2. O pedido aparece em `Aguardando preparo`.
3. Um funcionário seleciona `Iniciar preparo`.
4. O pedido muda para `Em preparo`.
5. Quando todos os itens estiverem prontos, o funcionário seleciona `Marcar como pronto`.
6. O pedido segue para:
   - retirada no balcão;
   - garçom;
   - entregador;
   - cliente que aguarda retirada.
7. O sistema registra os horários de cada etapa.

## Pedidos por setor

No futuro, o estabelecimento poderá separar a produção por setor.

Exemplos:

- cozinha;
- bebidas;
- bar;
- sobremesas;
- churrasqueira.

Cada setor poderá visualizar apenas os itens relacionados a ele.

## Alertas

O sistema deve destacar:

- pedidos atrasados;
- observações importantes;
- pedidos prioritários;
- alterações feitas após o envio;
- itens cancelados.

## Exceções

### Item indisponível após o pedido

A cozinha deve avisar o atendente ou responsável antes de cancelar ou substituir o item.

### Alteração em pedido já iniciado

A alteração deve aparecer com destaque e gerar uma confirmação visual.

### Falha na impressão

O painel digital continua mostrando o pedido e informa o problema de impressão.

---

# Fluxo 05 — Entregador

## Objetivo

Permitir que o entregador visualize e atualize apenas as entregas atribuídas a ele.

## Entrada

Após o login, o entregador deve ser direcionado diretamente para a área de entregas.

## Tela principal

- entregas disponíveis, quando permitido;
- minhas entregas;
- entregas em andamento;
- entregas concluídas;
- resumo do dia.

## Informações da entrega

- número do pedido;
- nome do cliente;
- endereço;
- complemento;
- referência;
- telefone;
- forma de pagamento;
- valor a cobrar;
- troco necessário;
- observações da entrega;
- botão para abrir rota.

## Fluxo principal

1. O pedido fica pronto para entrega.
2. O pedido é atribuído a um entregador.
3. O entregador recebe uma notificação.
4. O entregador confirma a retirada.
5. O status muda para `Saiu para entrega`.
6. O entregador abre a rota.
7. Após entregar, seleciona `Marcar como entregue`.
8. O sistema registra o horário da conclusão.
9. O pedido é finalizado ou enviado para conferência do caixa, conforme o pagamento.

## Pagamento na entrega

Quando houver pagamento na entrega, o sistema deve mostrar:

- valor total;
- forma de pagamento;
- troco;
- confirmação do recebimento.

## Informações que o entregador não vê

- faturamento geral;
- outros clientes;
- relatórios;
- cardápio administrativo;
- configurações;
- dados de outras unidades.

## Exceções

### Cliente não localizado

O entregador pode informar o problema e entrar em contato com o estabelecimento.

### Cliente não atende

O entregador registra a tentativa e aguarda orientação.

### Pagamento recusado

O pedido não deve ser marcado como concluído sem registrar a ocorrência.

### Endereço incorreto

O entregador pode solicitar ajuda ao atendente ou responsável.

---

# Fluxo 06 — Proprietário

## Objetivo

Permitir que o proprietário acompanhe e administre toda a operação do estabelecimento.

## Entrada

Após o login, o proprietário deve ser direcionado para o dashboard.

Se possuir acesso a mais de uma unidade, deverá selecionar ou alternar a unidade ativa.

## Dashboard

O dashboard deve responder rapidamente:

- quanto foi vendido;
- quantos pedidos foram recebidos;
- o que está acontecendo agora;
- o que precisa de atenção;
- como está o desempenho do estabelecimento.

## Informações principais

- loja aberta ou fechada;
- vendas do dia;
- quantidade de pedidos;
- ticket médio;
- pedidos em andamento;
- pedidos atrasados;
- mesas ocupadas;
- comandas aguardando fechamento;
- pedidos em preparo;
- entregas em andamento;
- produtos mais vendidos;
- alertas operacionais.

## Ações principais

- abrir ou fechar a loja;
- criar novo pedido;
- acompanhar pedidos;
- gerenciar cardápio;
- visualizar clientes;
- administrar funcionários;
- acompanhar mesas;
- acessar financeiro;
- consultar relatórios;
- alterar configurações;
- gerenciar assinatura.

## Fluxo principal

1. O proprietário entra no sistema.
2. Visualiza o resumo da operação.
3. Identifica alertas ou pendências.
4. Acessa o módulo necessário.
5. Executa ou delega a ação.
6. Retorna ao dashboard para acompanhar os resultados.

## Multiunidade

Quando o proprietário possuir várias unidades, o sistema deve permitir:

- alternar unidade;
- visualizar resumo de todas as unidades;
- comparar desempenho;
- restringir funcionários por unidade;
- administrar cardápios separados ou compartilhados, no futuro.

## Informações sensíveis

Somente usuários autorizados poderão visualizar:

- faturamento;
- despesas;
- lucro;
- assinatura;
- pagamentos do sistema;
- configurações de integração;
- permissões dos funcionários.

## Alertas do proprietário

Exemplos:

- loja fechada em horário de funcionamento;
- pedido atrasado;
- falha de impressão;
- pagamento pendente;
- produto indisponível;
- funcionário bloqueado;
- assinatura vencendo;
- queda incomum nas vendas.

---

# Fluxo 07 — Gerente

## Objetivo

Permitir que o gerente administre a operação sem necessariamente acessar todas as áreas sensíveis do proprietário.

## Entrada

O gerente pode ser direcionado ao dashboard ou à operação, conforme suas permissões.

## Possíveis acessos

- dashboard operacional;
- pedidos;
- mesas;
- cozinha;
- entregas;
- cardápio;
- funcionários;
- clientes;
- relatórios operacionais.

## Acessos que podem ser restringidos

- assinatura;
- dados financeiros completos;
- configurações da organização;
- exclusão de usuários;
- integrações sensíveis;
- dados de outras unidades.

## Regra

As permissões do gerente devem ser configuráveis pelo proprietário.

---

# Fluxo 08 — Caixa

## Objetivo

Permitir que o operador de caixa registre pagamentos, acompanhe comandas e mantenha o caixa organizado.

## Entrada

Após o login, o caixa deve ser direcionado para a área operacional de pagamentos.

## Tela principal

- caixa aberto ou fechado;
- pedidos aguardando pagamento;
- comandas aguardando fechamento;
- pagamentos recentes;
- divergências;
- botão para novo pedido, quando permitido.

## Abertura do caixa

1. O operador seleciona `Abrir caixa`.
2. Informa o valor inicial.
3. Confirma a abertura.
4. O sistema registra o usuário, a data e o horário.

## Recebimento de pedido

1. O operador abre o pedido ou comanda.
2. Confere os itens e o valor total.
3. Aplica desconto, se possuir permissão.
4. Seleciona a forma de pagamento.
5. Registra o valor recebido.
6. Informa troco, quando necessário.
7. Confirma o pagamento.
8. O pedido ou comanda é finalizado.

## Formas de pagamento

- dinheiro;
- PIX;
- cartão de débito;
- cartão de crédito;
- pagamento online;
- vale ou outra forma configurada.

O sistema deve permitir pagamento dividido entre mais de uma forma.

## Fechamento do caixa

1. O operador seleciona `Fechar caixa`.
2. O sistema mostra o resumo esperado.
3. O operador informa os valores contabilizados.
4. O sistema calcula possíveis diferenças.
5. O operador informa uma justificativa, quando necessário.
6. O fechamento é confirmado.
7. O sistema registra o responsável, a data e o horário.

## Ações que dependem de permissão

- aplicar desconto;
- cancelar pagamento;
- reabrir caixa;
- corrigir lançamento;
- retirar dinheiro;
- realizar suprimento;
- fechar caixa com divergência.

## Informações que o caixa não vê

- assinatura do sistema;
- configurações técnicas;
- dados de outras unidades;
- relatórios estratégicos, salvo permissão;
- permissões administrativas.

---

# Fluxo 09 — Administrador da Next Code

## Objetivo

Permitir que a equipe responsável pelo +Pedido administre a plataforma SaaS.

## Entrada

O administrador da Next Code deve acessar uma área separada do painel dos estabelecimentos.

## Tela principal

- estabelecimentos ativos;
- organizações;
- usuários;
- assinaturas;
- planos;
- pagamentos;
- contas em teste;
- contas suspensas;
- alertas técnicos;
- métricas gerais da plataforma.

## Ações principais

- cadastrar e consultar organizações;
- consultar unidades;
- ativar ou suspender contas;
- gerenciar planos;
- acompanhar assinaturas;
- consultar pagamentos;
- visualizar logs;
- prestar suporte;
- administrar usuários internos;
- acompanhar a saúde da plataforma.

## Segurança

O administrador da Next Code não deve utilizar o painel comum do estabelecimento para executar ações administrativas da plataforma.

A área administrativa deverá possuir:

- controle de acesso específico;
- registro de ações;
- proteção reforçada;
- auditoria;
- permissões internas.

## Acesso a dados dos clientes

O acesso aos dados de um estabelecimento deve acontecer somente quando necessário para:

- suporte;
- investigação de erro;
- segurança;
- cumprimento de obrigação legal.

Toda ação sensível deve ser registrada.

---

# Redirecionamento por perfil

Após o login, o sistema deverá identificar o perfil e direcionar o usuário para sua área principal.

| Perfil | Tela inicial |
|---|---|
| Proprietário | Dashboard |
| Gerente | Dashboard ou operação |
| Atendente | Pedidos |
| Caixa | Caixa |
| Garçom | Mesas |
| Cozinha | Produção |
| Entregador | Entregas |
| Administrador da Next Code | Painel administrativo |

O cliente não utiliza o painel interno. Ele acessa o cardápio digital do estabelecimento.

---

# Separação das experiências

O +Pedido será dividido em experiências específicas.

## Experiência do cliente

Voltada para:

- encontrar produtos;
- montar o pedido;
- realizar pagamento;
- acompanhar o pedido.

## Experiência operacional

Voltada para:

- registrar pedidos;
- atender mesas;
- preparar produtos;
- receber pagamentos;
- realizar entregas.

## Experiência administrativa

Voltada para:

- acompanhar resultados;
- administrar o negócio;
- gerenciar cardápio;
- configurar funcionários;
- acessar financeiro e relatórios.

## Experiência da plataforma

Voltada exclusivamente para a equipe da Next Code administrar o SaaS.

---

# Regra de permissões

A interface não deve apenas esconder botões.

O servidor e o banco de dados também deverão validar se o usuário possui permissão para executar cada ação.

Exemplos:

- um garçom não pode consultar o faturamento através de uma chamada direta;
- um caixa não pode alterar a assinatura;
- um entregador não pode acessar pedidos de outro estabelecimento;
- um gerente não pode executar ações restritas ao proprietário sem permissão;
- um cliente nunca pode acessar o painel interno.

---

# Regra de integração dos pedidos

Todos os pedidos devem utilizar a mesma operação central, independentemente de sua origem.

Origens possíveis:

- cardápio digital;
- QR Code da mesa;
- garçom;
- WhatsApp;
- telefone;
- balcão;
- painel administrativo.

Cada pedido deve manter registrada sua origem, mas seguir uma estrutura operacional comum.

Isso permite que cozinha, atendimento, caixa e entrega trabalhem de forma integrada.