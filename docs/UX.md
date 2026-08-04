# UX do +Pedido

## 1. Objetivo da experiência

O +Pedido deve ser simples, rápido e fácil de aprender.

O usuário não deve precisar procurar informações importantes.

O sistema deve mostrar primeiro o que exige atenção, depois os dados do dia e, por fim, informações secundárias.

A experiência deve ajudar o estabelecimento a:

- atender pedidos mais rápido;
- reduzir erros;
- visualizar prioridades;
- entender o desempenho do negócio;
- tomar decisões sem precisar analisar relatórios complexos.

---

## 2. Princípios de UX

### Simplicidade

Toda tela deve ter um objetivo principal claro.

Ações secundárias não devem competir visualmente com a ação principal.

### Rapidez

As tarefas mais frequentes devem exigir poucos cliques.

Exemplos:

- aceitar pedido;
- alterar status;
- cadastrar produto;
- abrir ou fechar a loja;
- visualizar pedidos pendentes.

### Prioridade visual

Informações urgentes devem aparecer antes de métricas ou relatórios.

Exemplos:

- pedidos aguardando confirmação;
- loja fechada;
- produto indisponível;
- falha de impressão;
- problema de pagamento.

### Linguagem humana

O sistema deve evitar mensagens técnicas.

Em vez de:

`Erro ao processar solicitação.`

Usar:

`Não foi possível salvar a alteração. Tente novamente.`

### Prevenção de erros

O sistema deve prevenir ações acidentais.

Exemplos:

- confirmar cancelamento de pedido;
- avisar antes de excluir produto;
- impedir fechamento de caixa com inconsistência;
- mostrar claramente quando a loja estiver fechada.

---

## 3. Tipos de usuário

### Proprietário

Possui acesso completo ao estabelecimento.

Pode visualizar:

- pedidos;
- cardápio;
- clientes;
- funcionários;
- entregadores;
- financeiro;
- relatórios;
- configurações.

### Gerente

Possui acesso operacional e administrativo limitado.

As permissões serão definidas pelo proprietário.

### Atendente

Trabalha principalmente com:

- pedidos;
- clientes;
- balcão;
- retirada;
- mesas.

### Cozinha

Visualiza pedidos em preparo.

Pode alterar o status operacional do pedido.

### Entregador

Visualiza entregas atribuídas a ele.

Pode alterar o status da entrega.

### Administrador da Next Code

Gerencia toda a plataforma.

Possui acesso ao painel administrativo do SaaS.

---

## 4. Primeiro acesso do estabelecimento

Ao entrar pela primeira vez, o usuário deve passar por uma configuração guiada.

### Etapa 1 — Dados do estabelecimento

- nome;
- categoria;
- telefone;
- endereço;
- cidade;
- estado;
- logotipo.

### Etapa 2 — Operação

- delivery;
- retirada;
- atendimento no balcão;
- atendimento em mesas.

O usuário pode selecionar uma ou mais opções.

### Etapa 3 — Horários

- dias de funcionamento;
- horário de abertura;
- horário de fechamento.

### Etapa 4 — Pagamentos

- dinheiro;
- PIX;
- cartão;
- pagamento online.

### Etapa 5 — Entregas

- retirada no local;
- taxa fixa;
- taxa por bairro;
- taxa por distância.

### Etapa 6 — Primeiro produto

O usuário poderá cadastrar o primeiro produto durante a configuração.

### Conclusão

O sistema deve mostrar uma confirmação simples:

`Seu estabelecimento está pronto para receber pedidos.`

---

## 5. Experiência de login

O login deve ser simples e direto.

Campos:

- e-mail;
- senha.

Ações:

- entrar;
- recuperar senha.

Após o login, o sistema deve identificar o usuário, o estabelecimento e suas permissões.

O usuário deve ser direcionado para a tela mais adequada ao seu papel.

Exemplos:

- proprietário: dashboard;
- atendente: pedidos;
- cozinha: painel de preparo;
- entregador: entregas.

---

## 6. Dashboard do proprietário

O dashboard deve responder rapidamente:

- quanto vendeu;
- quantos pedidos recebeu;
- o que precisa de atenção;
- como está o movimento;
- o que pode melhorar.

### Ordem das informações

#### 1. Saudação e situação da loja

Exemplo:

`Boa tarde, João.`

`Sua loja está aberta e recebendo pedidos.`

A situação da loja deve ser visível.

#### 2. Ações urgentes

Exemplos:

- pedidos aguardando confirmação;
- pedidos atrasados;
- falha de impressão;
- produto sem disponibilidade;
- loja próxima do horário de fechamento.

#### 3. Resumo do dia

- total vendido;
- quantidade de pedidos;
- ticket médio;
- pedidos cancelados.

#### 4. Pedidos em andamento

Exibir os pedidos atuais de forma resumida.

#### 5. Insights

Exemplos:

- produto mais vendido;
- horário de maior movimento;
- aumento ou queda nas vendas;
- clientes recorrentes;
- sugestão de promoção.

---

## 7. Experiência de pedidos

A tela de pedidos será uma das áreas mais importantes do sistema.

Ela deve ser rápida, clara e fácil de usar em ambientes movimentados.

### Status principais

- aguardando confirmação;
- confirmado;
- em preparo;
- pronto;
- saiu para entrega;
- concluído;
- cancelado.

### Informações essenciais no card do pedido

- número do pedido;
- horário;
- nome do cliente;
- modalidade;
- valor;
- forma de pagamento;
- status;
- tempo de espera.

### Ação principal

O botão principal deve mudar de acordo com o status.

Exemplos:

- `Confirmar pedido`;
- `Iniciar preparo`;
- `Marcar como pronto`;
- `Saiu para entrega`;
- `Concluir pedido`.

### Alertas

Pedidos atrasados devem receber destaque visual.

Pedidos novos podem emitir alerta sonoro, conforme configuração do estabelecimento.

---

## 8. Experiência do cardápio

A gestão do cardápio deve ser simples mesmo para usuários sem conhecimento técnico.

### Categorias

O usuário poderá:

- criar;
- editar;
- ordenar;
- ativar;
- desativar.

### Produtos

O cadastro de produto deve ser dividido em blocos:

- informações básicas;
- preço;
- imagem;
- categoria;
- adicionais;
- disponibilidade;
- estoque;
- promoção.

O usuário deve conseguir duplicar um produto para economizar tempo.

---

## 9. Estados vazios

Nenhuma tela deve parecer quebrada quando não houver dados.

Exemplo de pedidos:

`Nenhum pedido por aqui ainda.`

`Quando o primeiro pedido chegar, ele aparecerá nesta tela.`

Exemplo de produtos:

`Seu cardápio ainda está vazio.`

Botão principal:

`Cadastrar primeiro produto`

---

## 10. Feedback das ações

Toda ação deve mostrar claramente o resultado.

Exemplos:

- `Produto cadastrado com sucesso.`
- `Pedido confirmado.`
- `Alterações salvas.`
- `Funcionário convidado.`

Em caso de erro, a mensagem deve explicar o que aconteceu e, quando possível, o que fazer.

---

## 11. Responsividade

O sistema será pensado principalmente para computadores e notebooks, pois serão os dispositivos mais utilizados pelos estabelecimentos.

Também deverá funcionar corretamente em:

- tablets;
- celulares.

A versão mobile deve priorizar tarefas rápidas, como:

- visualizar pedidos;
- alterar status;
- abrir ou fechar a loja;
- consultar vendas;
- responder alertas.

---

## 12. Acessibilidade

O sistema deve seguir boas práticas de acessibilidade.

Exemplos:

- contraste adequado;
- textos legíveis;
- botões com tamanho confortável;
- navegação por teclado;
- estados de foco visíveis;
- ícones acompanhados de texto quando necessário.

---

## 13. Experiência em caso de falha

### Sem internet

Exibir:

`Você está sem conexão. Algumas funções podem ficar indisponíveis.`

### Falha ao salvar

Exibir:

`Não foi possível salvar agora. Verifique sua conexão e tente novamente.`

### Sessão expirada

Exibir:

`Sua sessão expirou. Entre novamente para continuar.`

### Falha no recebimento de pedidos

O sistema deve avisar claramente que existe um problema operacional.

---

## 14. Regra de validação de funcionalidades

Antes de desenvolver qualquer funcionalidade, devemos responder:

1. Qual problema ela resolve?
2. Quem utilizará?
3. Qual é a ação principal?
4. Quais erros podem acontecer?
5. Como será o estado sem dados?
6. Como funcionará no celular?
7. Como o sistema confirmará a ação?

---

# Experiência de Atendimento em Mesas

O +Pedido deverá permitir atendimento presencial tão eficiente quanto o delivery.

## Fluxo

1. Selecionar mesa
2. Abrir comanda
3. Adicionar produtos
4. Enviar para produção
5. Acompanhar preparo
6. Solicitar pagamento
7. Fechar conta

---

## Estados da Mesa

- Livre
- Ocupada
- Pedido em andamento
- Aguardando pagamento
- Reservada
- Bloqueada

---

## QR Code

Cada mesa poderá possuir um QR Code próprio.

Ao escanear:

- identifica automaticamente a mesa;
- abre o cardápio;
- permite realizar pedidos;
- envia o pedido para o estabelecimento.

---

## Divisão da Conta

O sistema deverá permitir:

- dividir igualmente;
- dividir por itens;
- dividir por cliente.

---

## Tablet

Toda a área de mesas deverá funcionar perfeitamente em tablets.