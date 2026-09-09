# Pendências de backend — painel de gestão

Diferente de `docs/LOJA_PUBLICA_BACKEND.md` (que é só sobre a loja
pública), este documento junta pendências de backend encontradas numa
revisão completa do painel de gestão (login, pedidos, cozinha, mesas,
garçom, atendente, cardápio, clientes, configurações).

## 0. Fluxo de trabalho — Git

- **Não commitar nem fazer push direto na `main`.** Trabalhar em uma
  branch própria (padrão já usado no projeto: `backend/nome-da-etapa`,
  igual à `backend/fundacao-identidade` que virou a PR #10) e abrir
  Pull Request para revisão antes do merge. É assim que o front-end
  também está sendo conduzido (branch `frontend/desenvolvimento`) —
  queremos manter essa estrutura dos dois lados.
- **Se uma mudança de backend exigir ajuste no front-end** (troca de
  formato de dado, novo campo, nome de coluna diferente do que o
  front já espera, etc.), avisar a Débora antes de meter a mão no
  front-end diretamente. Ela e a IA que ajuda no front mantêm esse
  lado do código; qualquer ajuste lá deve passar por ela primeiro.

## 1. Migration de status terminais de pedido — ✅ CONFIRMADO aplicado (2026-09-08)

Arquivo: `supabase/migrations/20260824_011_orders_terminal_status.sql`

**Contexto**: até aqui, "Finalizar pedido" e "Recusar pedido" no
front-end chamavam `deleteOrder()` — ou seja, um pedido concluído e um
pedido recusado produziam o mesmo efeito no banco: a linha era apagada
para sempre, sem histórico. Isso foi corrigido no front-end
(`app/actions/orders.ts`, `components/providers/OrdersProvider.tsx`)
para usar `updateOrderStatus(orderId, 'completed' | 'cancelled')` em
vez de excluir.

**Só que o banco ainda não aceita esses dois valores** — a constraint
`orders_status_check` só permite `new`, `preparing`, `ready`,
`delivery`. A migration acima resolve isso:

```sql
ALTER TABLE orders DROP CONSTRAINT orders_status_check;

ALTER TABLE orders ADD CONSTRAINT orders_status_check
  CHECK (status IN ('new', 'preparing', 'ready', 'delivery', 'completed', 'cancelled'));
```

**Status**: confirmado direto no banco em 2026-09-08 — a constraint
`orders_status_check` já inclui `completed` e `cancelled` (e também
`accepted`, de um ajuste do Jon). "Finalizar pedido"/"Recusar"
funcionam de verdade. Não precisa de mais nenhuma ação aqui.

Depois de aplicada, pedidos com status `completed`/`cancelled` somem
sozinhos dos quadros operacionais (Pedidos, Cozinha, Entregas) — eles
só exibem os 4 status ativos — mas continuam no banco, disponíveis
para relatórios futuros de faturamento.

## 2. Clientes — ✅ construído em 2026-09-08 (eram 6 fictícios fixos)

A tela `/clientes` mostrava sempre os mesmos 6 clientes inventados
(Mariana Souza, Carlos Eduardo...), sem tabela nenhuma no banco. O
formulário de cadastro/edição já existia pronto (`CustomerFormDrawer.tsx`)
mas estava órfão — nenhum botão abria ele.

Migrations `20260908_034_customers.sql` (tabela + RLS),
`_035_customers_public_upsert.sql` e `_036_fix_..._normalize.sql`
(função pra loja pública, corrigida) aplicadas.

- **`customers`** guarda só a identidade/CRM (nome, telefone, e-mail,
  endereço, observação) — mesmo princípio de `restaurant_tables`:
  pedidos, total gasto e histórico **não são duplicados aqui**, vêm
  dos pedidos reais (`orders`) casando pelo telefone (sempre
  normalizado, só dígitos — `normalizePhone`/`formatPhone` em
  `lib/format.ts`).
- **Cadastro automático pelo pedido** (a própria tela mock já
  prometia isso no texto, nunca tinha sido implementado): toda vez
  que um pedido é criado com telefone — pelo painel
  (`app/actions/orders.ts`) ou pela loja pública
  (`app/actions/public-orders.ts`, via função `upsert_customer_from_order`
  SECURITY DEFINER, porque visitante anônimo não pode escrever direto
  na tabela) — o cliente é criado se ainda não existir.
  `ON CONFLICT DO NOTHING`: nunca sobrescreve nome/endereço que a
  equipe já tenha editado manualmente.
- **CRUD manual completo**: cadastrar, editar e remover cliente
  direto na tela (`app/actions/customers.ts`), pra registrar alguém
  antes do primeiro pedido (ex.: WhatsApp).
- **Removido da tela**: a seção "Fidelidade" (barra de progresso
  X/10 pedidos) que existia no mock — é a interface de um programa de
  cashback que nunca teve regra nenhuma definida (quantos pedidos?
  qual a recompensa? como resgata?). Não inventei um número —
  isso é o `cashback` do `lib/plans.ts`, ainda não construído.

**Achado pelo caminho**: `/clientes`, `/cardapio`, `/financeiro` e
`/relatorios` são layouts separados do grupo `(panel)` (`app/cardapio/layout.tsx`
etc.), e nenhum deles envolvia `OrdersProvider` — só reaproveitava
`AppLayout`/`Topbar`. Isso nunca tinha dado problema porque nada
neles usava `useOrders()`. Ao consertar o sino de notificações mais
cedo no mesmo dia (seção 10) pra usar dado real, os 4 quebraram
(`useOrders deve ser usado dentro de OrdersProvider`). Corrigido
adicionando `OrdersProvider` com dado real nos 4 layouts, igual o
`(panel)` já fazia.

Testado ponta a ponta: cadastro manual funciona (endereço/e-mail
salvos e exibidos formatados); pedido real lançado com o mesmo
telefone aparece automaticamente no perfil do cliente (pedidos,
total gasto, ticket médio e histórico corretos); editar e remover
cliente confirmados direto no banco. Dados de teste removidos
depois.

## 4. Financeiro e Relatórios — construídos em 2026-09-02, "tempo médio" do Início ainda quebrado

`/financeiro` e `/relatorios` estavam cadastrados em
`lib/route-access.ts` (com permissão `viewFinancial`/`viewReports`,
concedida a `owner`/`manager`) e apareciam no menu lateral, mas não
tinham nenhuma página — clicar neles dava 404 pra quem tivesse acesso
(proprietário/gerente, ou seja, qualquer conta real de dono de
restaurante). Construídas agora, com dado 100% real (sem número de
exemplo):

- `/financeiro` (`lib/financeiro-dal.ts`): receita hoje/7 dias/30
  dias, ticket médio, receita por forma de pagamento, por origem do
  pedido e gráfico de receita por dia. Conta tudo que não foi
  cancelado (não só `status = 'completed'`), porque em fluxo de
  balcão/mesa nem sempre alguém marca isso.
- `/relatorios` (`lib/relatorios-dal.ts`): produtos mais vendidos,
  pedidos por status e horários de pico, últimos 30 dias.

**Bug de layout encontrado e corrigido nesse processo**: o menu
lateral (`components/layout/Sidebar.tsx`) tinha `overflow: hidden`
sem scroll — com poucos itens nunca dava problema, mas ao adicionar
o item "Relatórios" o menu passou a ter itens demais pra caber na
tela, e o item simplesmente sumia (sem barra de rolagem, sem aviso).
Corrigido dando scroll interno pro `.sidebar__navigation`
(`app/globals.css`). Vale ficar de olho se a lista de "Gestão"
crescer mais.

## 5. "Burger House" hardcoded em 5 componentes — ✅ corrigido em 2026-09-02

Achado enquanto revisava a Sidebar: o nome "Burger House" (e "Unidade
Centro", e até o nome "João" do garçom) estava escrito direto no
JSX em `Sidebar.tsx`, `Topbar.tsx`, `OperationHeader.tsx`,
`WaiterHeader.tsx` e `AttendantHome.tsx` — ou seja, **qualquer
empresa real que fosse cadastrada continuaria vendo "Burger House"
em vez do próprio nome**, em praticamente toda tela do painel. Bug
crítico de multi-tenancy, não só estético.

Corrigido: `lib/dal.ts` (`getCurrentUser`) agora busca
`organizations.name` e `units.name` reais via
`organization_members` e devolve em `CurrentUserData` como
`organizationName`/`unitName`. Os 5 componentes passaram a usar
`useCurrentUser()` em vez de texto fixo. De quebra, um `getInitials`
duplicado saiu de `lib/storefront/get-storefront-data.ts` e virou
compartilhado em `lib/format.ts` (existe ainda um outro
`getInitials` em `lib/user-display.ts`, mas esse é pra iniciais de
nome de pessoa, não de empresa — lógica diferente de propósito,
mantido separado).

**Bug do "tempo médio: 31453 minutos" — ✅ corrigido em 2026-09-02.**
Vinha de `components/inicio/OperationOverview.tsx` (não de
`OperationStats.tsx`, que é mock e nem é usado em `/inicio` — é do
`/dashboard`, ver seção 6). Pedidos de teste antigos (12/08) presos
em `preparing` há semanas faziam o tempo médio explodir. Não era bug
de cálculo (a conta em minutos estava certa) — era falta de
formatação: minutos crus sendo jogados direto na tela. Corrigido
com `formatDuration()` (novo, em `lib/order-timing.ts`), que mostra
"22d" em vez de "31453 minutos". Também apliquei o mesmo formato em
`KitchenCard.tsx` e `DeliveryBoard.tsx`, que tinham o mesmo problema
(um pedido esquecido por dias na Cozinha/Entregas ia mostrar o
mesmo número gigante).

## 6. `OperationStats.tsx` e `OperationAlert.tsx` eram 100% mock — ✅ removidos em 2026-09-02

Achado ao investigar o bug acima: `/dashboard` (item "Dashboard" no
menu, separado de "Início") usava `OperationStats.tsx`,
`OperationAlert.tsx` e `OperationPanel.tsx`, **totalmente
hardcoded** ("3 pedidos", "Tempo médio de 17 min" etc., sem nenhuma
leitura do banco) — duplicando o que `/inicio` já faz de verdade
via `OperationOverview.tsx`. A Débora confirmou remover: item
"Dashboard" saiu do menu (`components/layout/Sidebar.tsx`), a rota
`/dashboard` agora só redireciona pra `/inicio` (não quebra
link/favorito antigo), e os 3 componentes mock foram apagados.

## 7. Equipe (cadastro de funcionário) — ✅ construído em 2026-09-08

Migrations `20260826_022_add_team_member.sql`, `_023_profiles_select_same_org.sql`
e `_024_fix_add_team_member_ambiguity.sql` (aplicadas). A tela
Equipe (Configurações → Equipe) agora é real:

- **Lista o time atual** de verdade (`app/actions/team.ts`,
  `getTeamMembers`) — nome + cargo de cada membro ativo da
  organização.
- **Adicionar funcionário — ✅ 100% automático desde 2026-09-08**
  (atualização: a chave `service_role` foi configurada). O
  dono/gerente digita nome, e-mail e cargo na tela Equipe;
  `addTeamMember` (`app/actions/team.ts`) usa
  `auth.admin.inviteUserByEmail` (via `lib/supabase/admin.ts`,
  cliente privilegiado — ver `.env.local`) pra criar o login e
  mandar o e-mail de convite sozinho, depois chama a função
  `add_team_member` (SECURITY DEFINER, só owner pode chamar) pra
  vincular à organização, criando/atualizando `profiles` e
  `organization_members`. Se o e-mail já tiver login (de uma
  organização anterior, por exemplo), o convite é ignorado sem erro
  e só o vínculo é feito. Reativa automaticamente se a pessoa já
  tinha sido removida antes. **Não precisa mais de nenhum passo
  manual da Débora** pra isso.
- **Remover funcionário**: desativa (`is_active = false`) via
  `removeTeamMember` — a policy `organization_members_manage_owner`
  já permitia isso direto, sem precisar de função especial. Owner
  não pode se autorremover por essa tela.

**Detalhe técnico que vale registrar** (achado testando, não
adivinhado): `organization_members.user_id` referencia `auth.users`,
não `profiles` — não existe FK direta entre `organization_members` e
`profiles`, então o PostgREST não consegue embutir
`profiles(full_name)` num único `.select()` (a query falhava
silenciosamente e a lista sempre voltava vazia). Resolvido buscando
os dois separadamente e juntando em JS. Além disso, `profiles` só
tinha policy de SELECT pro próprio dono — precisou de uma policy
nova (`profiles_select_same_org`) pra um membro conseguir ver o
nome dos colegas.

Testado ponta a ponta (parte original): lista carrega os 3 membros
reais que já existiam, tentativa com e-mail inexistente mostra erro
claro, e um ciclo completo de remover + readicionar funcionou e
devolveu ao estado original — sem sobra de dado quebrado.

**Convite automático (parte nova, 2026-09-08)** — também testado
ponta a ponta com Playwright + consulta direta no banco: convite pra
e-mail novo cria o `auth.users` (`invited_at` preenchido) e já
aparece na equipe; reenviar convite pro MESMO e-mail (já
cadastrado) não dá erro, só atualiza o cargo; gerado um link de
recuperação de verdade (Admin API) pra simular o clique no e-mail —
cai em `/redefinir-senha`, define senha nova, e o login com essa
senha nova funciona e cai na tela certa pro cargo.

**Achado durante o teste, importante**: o link de convite/recuperar
senha do Supabase usa um formato de URL (`#access_token=...` depois
do `#`) que o painel de "Redirect URLs" do projeto não tinha
liberado pra `/redefinir-senha` — sem isso, o Supabase manda a
pessoa de volta pra `/login` puro, sem conseguir criar a senha nunca.
Resolvido de duas formas, pra não depender só da configuração do
Supabase: (1) `/login` agora detecta esse link "perdido" e redireciona
sozinho pra `/redefinir-senha` preservando o token; (2) recomendado,
mas não obrigatório — **FAZER MANUAL NO SUPABASE**: Authentication →
URL Configuration → Redirect URLs → adicionar
`http://localhost:3000/**` (e o domínio de produção, quando tiver
um, ex.: `https://app.maispedido.com.br/**`) pra ficar redundante.

## 8. Mesas do salão — ✅ construído em 2026-09-08 (era 100% mock)

Achado testando (Débora reportou "esses dados são reais?"): o
`TablesProvider.tsx` inteiro era um `useState` local com 8 mesas
fixas, nomes fictícios (Carlos, Amanda, João, Mariana) e totais
fixos (R$ 84,90 etc.) — nunca salvava nada, resetava a cada
recarregamento, e era **igual para toda organização** (qualquer
cliente testando o sistema veria os mesmos nomes fictícios). Afetava
3 telas: `/mesas` (painel), o app do Garçom (`/garcom`) e o app do
Atendente (`/atendente`), além do card "Resumo do salão" em Início.

Migrations `20260908_031_restaurant_tables.sql` (tabela + RLS) e
`20260908_032_restaurant_tables_realtime.sql` (Realtime) aplicadas.

- **`restaurant_tables`** guarda só o *estado* da mesa (número,
  status livre/ocupada/aguardando pagamento, nome do cliente,
  quantidade de pessoas, hora que abriu). O total e os itens da
  comanda **não são duplicados aqui** — vêm dos pedidos reais
  (`orders`/`order_items`, mesma tabela que já alimenta a Cozinha)
  filtrados por `table_number` + `opened_at` (`lib/tables-dal.ts`,
  `getRestaurantTables`). Ou seja: uma rodada lançada na mesa já era
  um pedido real antes dessa mudança — só o *status da mesa em si*
  era fictício.
- **Auto-semeadura**: na primeira vez que uma organização nova abre
  o Mesas, o sistema cria 8 mesas livres automaticamente (só se a
  organização tiver zero mesas cadastradas). Depois disso, quem
  administra a conta (owner/manager) pode adicionar/remover mesas
  pela própria tela de Mesas — o número de mesas não fica mais preso
  em 8 fixo.
- **Tempo real entre os 3 apps**: se o Garçom abre a mesa 5 pelo
  celular, o painel desktop (Mesas) e o app do Atendente atualizam
  sozinhos, sem precisar recarregar (Supabase Realtime na tabela
  `restaurant_tables`, mesmo padrão já usado em `orders`).
- **Permissão corrigida**: o cargo Atendente precisa liberar a mesa
  depois de receber o pagamento, mas não tinha `manageTables` em
  `lib/roles.ts` — corrigido (achado revisando o fluxo, não só
  copiando o que já existia).

Testado ponta a ponta com Playwright + consulta direta no banco:
abrir mesa → **recarregar a página inteira** → mesa continua
ocupada com o mesmo cliente (antes, resetava pro mock); lançar um
item → recarregar de novo → comanda e total continuam corretos
(prova que vêm de um pedido real, não de estado voador); Início
"Resumo do salão" mostra 1/8 ocupadas em tempo real; solicitar
fechamento → confirmar pagamento → mesa libera e Início volta a
0/8; adicionar/remover mesa funciona (confirmado direto no banco).
Dados de teste (mesa extra e pedido de teste) removidos depois.

## 9. Plano da assinatura — ✅ construído em 2026-09-08 (era hardcoded)

`lib/dal.ts` (`getCurrentSubscription`) sempre retornava
`planId: 'premium'` pra qualquer organização. Efeito prático: o
sidebar mostrava "Premium" pra qualquer empresa, e o bloqueio de
item por plano (`Sidebar.tsx`, já existia pronto — ícone de cadeado
+ "Disponível em um plano superior") nunca ativava, porque todo
mundo "tinha" o plano mais alto.

Migration `20260908_033_organizations_plan.sql` aplicada: coluna
`organizations.plan_id` (`start` | `essencial` | `gestao-pro` |
`premium`, default `'start'`). Organizações que já existiam antes
dessa coluna foram migradas pra `'premium'` (era o que recebiam de
fato no código antigo — ninguém perdeu recurso na hora da migração).
`getCurrentSubscription` agora lê o plano de verdade da organização
do usuário logado.

Onboarding manual (`docs/ONBOARDING_NOVA_EMPRESA.md`) atualizado:
tem um passo pra escolher o plano na hora de cadastrar o cliente, e
outro (seção 5) pra trocar o plano de uma empresa já existente
direto no Table Editor do Supabase — útil pra testar como cada plano
se comporta no sistema.

**Bônus, mesmo escopo**: o bloqueio de item por plano só existia no
sidebar (visual) — quem soubesse a URL direto (ex.: `/financeiro`)
entrava mesmo sem o plano incluir aquele recurso. Adicionado o mesmo
bloqueio na entrada da rota (`lib/route-access.ts` +
`PanelAccessGuard.tsx`), reaproveitando o mapeamento rota → recurso
que já existia no Sidebar (Mesas, Cozinha, Entregas, Cardápio,
Financeiro, e also Garçom/Atendente que ainda não tinham essa
checagem em lugar nenhum).

## 10. Sino de notificações — ✅ corrigido em 2026-09-08 (era decorativo)

Achado numa varredura geral pedida pela Débora ("analise tudo").
`components/layout/Topbar.tsx` — o sino visível em toda tela do
painel sempre mostrava a bolinha vermelha ao carregar a página
(`useState(true)` fixo, nunca reflete nada real) e duas notificações
hardcoded que nunca mudavam: "3 pedidos aguardando confirmação" e
"Cozinha em operação / Nenhum pedido crítico" — mesmos números em
qualquer empresa. Só o card "Status da loja" ali dentro era real.

Corrigido: os dois cards agora usam a contagem real de pedidos
(`useOrders()`, mesmo padrão já usado em `OperationOverview.tsx`) —
"aguardando confirmação" mostra o número real de pedidos novos (com
uma mensagem positiva quando não há nenhum), "em preparo" mostra
quantos estão sendo preparados agora. A bolinha vermelha só aparece
quando há pedido de verdade esperando confirmação.

## 11. Identidade Visual — ✅ construído em 2026-09-09 (era "Em breve")

`Configurações → Identidade Visual` só mostrava dois quadrados
"Em breve" — honesto, mas incompleto. A loja pública já esperava
`logoUrl`/`bannerUrl` há tempo (`StoreHeader.tsx`,
`lib/storefront/types.ts`), só vinham fixos como `null` em
`get-storefront-data.ts`.

Migration `20260908_037_organization_branding.sql` aplicada:
colunas `organizations.logo_url`/`banner_url`, bucket público
`organization-branding` no Supabase Storage (upload autenticado,
leitura pública, dono deleta o próprio — mesmo padrão de
`product-images`, já usado no Cardápio).

- Tela de upload real (clica, escolhe imagem PNG/JPG/WEBP até 5MB,
  sobe pro Storage, salva a URL em `organizations` via
  `updateBrandingSettings`). Dá pra trocar ou remover cada imagem.
- `get-storefront-data.ts` agora lê `logo_url`/`banner_url` de
  verdade — a loja pública mostra a marca do cliente.

**Achado importante no caminho**: o bucket `product-images` (usado
pelo Cardápio pra foto de produto) **nunca existiu de verdade**. A
migration original (`20260811_008_product_images_storage.sql`) usava
`storage.create_bucket()`, uma função que não existe nesta instância
do Supabase — a migration falhava calada, sem criar bucket nem
políticas. Ou seja, **o upload de foto de produto estava quebrado
desde sempre** (confirmado testando: erro de RLS "new row violates
row-level security policy"). Corrigido em duas migrations: `037`
cria o bucket `product-images` que faltava (junto com o de
identidade visual), `038` recria as políticas de RLS que a `008`
nunca conseguiu criar.

Testado ponta a ponta: upload de logo e banner funcionando, imagem
persiste depois de recarregar a página, aparece de verdade na loja
pública (`/loja/burger-house`). Upload de foto de produto no
Cardápio testado e confirmado funcionando pela primeira vez.
Arquivos de teste removidos do Storage depois (não dá pra apagar
`storage.objects` direto por SQL — usa a API de Storage).

## 12. Filtro de categoria travado em nomes de hamburgueria — ✅ corrigido em 2026-09-09

Achado numa varredura pedida pela Débora ("o que podemos fazer
agora?"). `components/pedidos/OrderItemsForm.tsx` (usado em Mesas e
em "Novo pedido") e `components/garcom/WaiterOrderForm.tsx` (app do
Garçom) tinham uma lista fixa de categorias pra filtrar produto:
`["Todos", "Hambúrgueres", "Pizzas", "Bebidas", "Porções",
"Sobremesas"]` — só fazia sentido pra uma hamburgueria. Pra qualquer
outra empresa (uma sushi, uma pizzaria com nomes diferentes, uma
padaria), as abas de categoria não batiam com as categorias reais
cadastradas em `categories` — o produto existia, mas sumia ao clicar
numa aba (ou nunca tinha aba nenhuma, se a categoria fosse "Sem
categoria"). Bug funcional, não só visual: atrapalhava o garçom/
atendente a lançar pedido.

Corrigido: as categorias agora vêm dos produtos reais retornados por
`getProductsForOrder()` (mesmo padrão já usado em
`MenuManagement.tsx` e na loja pública, que nunca tiveram esse
problema). Testado criando uma categoria "Sushi QA" de propósito
(fora da lista antiga) — as abas passaram a mostrar "Sem categoria"
e "Sushi QA" corretamente, nos dois formulários. Categoria e produto
de teste removidos depois.

De quebra, removido um sino de notificação no cabeçalho do app do
Garçom (`WaiterHeader.tsx`) que não tinha nenhuma função — não
mostrava número nenhum (diferente do bug do sino do painel, esse
nunca fingiu ter dado nenhum), só não fazia nada ao tocar.

## 13. Cashback — ✅ construído em 2026-09-09 (configurável por empresa)

Débora foi clara: não dá pra ter uma regra única de cashback pra
todo mundo — cada estabelecimento decide a própria (e quem decide
não somos nós, é o dono do restaurante). Construído como um recurso
que cada empresa liga e configura sozinha, sem precisar de ninguém
da Next Code mexer em nada.

Migrations `20260909_039_cashback.sql` e `_040_refund_public_cashback.sql`
aplicadas.

- **Configuração** (Configurações → Cardápio Digital → Cashback):
  liga/desliga, percentual de volta (%), pedido mínimo pra ganhar
  (opcional) e saldo mínimo pra usar (opcional). Só liga quem tem o
  recurso no plano (Essencial+, `lib/plans.ts`) — checado no
  servidor (`updateCashbackSettings`), não só escondido na tela.
- **Ganha**: quando o pedido é marcado como concluído (não na
  criação — evita criar e cancelar pedido só pra ganhar saldo à
  toa). `app/actions/orders.ts` (`updateOrderStatus`) credita
  automaticamente o percentual configurado no cliente (achado pelo
  telefone), uma vez só por pedido.
- **Usa**: na loja pública, depois do cliente digitar o telefone, a
  tela de pagamento mostra o saldo disponível e deixa aplicar como
  desconto (soma com cupom, se tiver os dois). O resgate é atômico
  no banco (`redeem_public_cashback`, SECURITY DEFINER — visitante é
  anônimo, mesmo padrão de `validate_public_coupon`) e nunca confia
  em valor vindo do navegador.
- **Se o pedido for cancelado depois de ter usado cashback**, o
  saldo volta pro cliente (`refund_public_cashback`) — ele não pode
  perder o desconto de um pedido que não aconteceu.

**Limitação conhecida, aceita por ora**: se uma empresa ativar o
cashback e depois for rebaixada de plano, o recurso continua
funcionando até alguém desligar manualmente — não há uma checagem
automática de plano toda vez que um pedido ganha/usa cashback, só na
hora de LIGAR. Risco baixo (exigiria um downgrade real depois de já
estar usando), registrado aqui caso vire problema de verdade.

Testado ponta a ponta: configurar 10% → pedido de R$100 marcado como
concluído credita R$10,00 no cliente (achado pelo telefone) →
segundo pedido na loja pública mostra "Você tem R$10,00 de cashback"
→ marca usar → total recalculado corretamente (R$32,00 → R$22,00) →
saldo debitado no banco → cancelar esse segundo pedido devolve o
saldo. Dados de teste removidos depois.

## 14. Revisão geral de "pronto pra vender" (2026-09-09)

Débora pediu uma revisão completa pra decidir se o sistema já pode
ser vendido. Rodei `npm run build` de verdade (nunca tinha sido
testado — só `npm run dev` o dia inteiro) — **passa limpo**. Conferi
RLS de toda tabela do banco direto no Postgres — todas com RLS
ligada e pelo menos uma policy real, nenhum buraco. Os 3 apps de
equipe (Garçom, Atendente, Cozinha) e a loja pública já têm CSS
responsivo de verdade pra celular, não só desktop.

Achados e corrigidos nessa revisão:

- **Pix mentia sobre uma automação que não existe** — a tela
  Pagamentos dizia "o próprio banco confirma o pagamento
  automaticamente" (Mercado Pago), mas não existe NENHUMA integração
  de pagamento no código, em lugar nenhum — busquei no projeto
  inteiro. Corrigido pra dizer a verdade: "Em breve", com uma nota
  explicando que por enquanto o Pix é combinado por fora do sistema,
  igual dinheiro ou maquininha. Isso já era uma decisão sua antiga
  (`LOJA_PUBLICA_BACKEND.md`, "Mercado Pago / pagamento real" listado
  como fora de escopo) — o problema era só o texto da tela prometer
  mais do que existe hoje.
- **Consulta de cupom e de saldo de cashback não tinham limite de
  tentativas** — visitante anônimo da loja pública podia tentar
  validar cupom ou telefone repetidas vezes sem nenhum freio (dava
  pra tentar adivinhar código de cupom ou telefone de cliente por
  tentativa e erro). Migration `20260909_041_public_lookup_rate_limit.sql`:
  20 tentativas a cada 10 minutos por IP e por tipo de consulta,
  mesmo princípio do limite que já existia pra criar pedido.
- **Página não encontrada dentro do painel perdia o menu lateral** —
  adicionado `app/(panel)/not-found.tsx`. Detalhe técnico: isso só
  ajuda em casos onde uma rota *reconhecida* chama `notFound()` por
  dentro (nenhuma existe assim hoje) — uma URL totalmente errada
  digitada à mão (ex.: `/xyz123`) sempre cai na página 404 genérica
  da raiz, é assim que o Next.js funciona, não dá pra evitar sem
  reestruturar as rotas. Baixíssima prioridade, o botão "voltar pro
  início" já funciona direitinho de qualquer jeito.

**Duas coisas que achei e NÃO são código — decisão/providência sua**:

1. **Ainda não existe implantação em produção** — o `README.md`
   continua sendo o padrão gerado pelo `create-next-app`, não existe
   `.vercel` nem qualquer configuração de deploy no projeto. Ou seja,
   hoje o sistema só roda na sua máquina (`localhost`) — pra vender
   de verdade, precisa publicar num endereço público de verdade
   (Vercel é o caminho mais direto pra um projeto Next.js) antes de
   qualquer cliente conseguir acessar.
2. **Termos de Uso / Política de Privacidade não existem** — a tela
   `/termos` já avisa honestamente "Em elaboração". Como o sistema
   coleta nome/telefone/endereço de cliente final pela loja pública,
   vale ter um texto real antes de vender pra valer (não é algo que
   eu deva escrever sozinho — é decisão jurídica/de negócio sua, mas
   posso rascunhar uma base se você quiser, com aviso claro de que
   não substitui uma revisão jurídica de verdade).

## 15. Pix automático via Mercado Pago — ✅ construído em 2026-09-09 (nunca testado ao vivo)

Você pediu pra construir a integração real de Pix (Mercado Pago) já
pronta pra vender, sem deixar rascunho visível pro cliente final, e
confirmou o modelo mais simples: cada dono de restaurante pega o
**próprio** Access Token dele no Mercado Pago dele e me passa —
não é a Next Code que se cadastra como "aplicativo" no Mercado Pago
(isso seria o modelo mais complicado que eu propus antes por engano
e você corrigiu). Instrução explícita sua: **"Constrói sem testar
por enquanto"** — ou seja, construí tudo, mas nunca chamei a API real
do Mercado Pago (não tenho nenhuma credencial de verdade em mãos).

O que foi construído:

- Migration `20260909_042_mercado_pago.sql`: coluna
  `organizations.mercado_pago_access_token` (o token de cada
  empresa) e colunas em `orders` pra guardar o QR code gerado e o
  horário de confirmação do pagamento.
- `lib/mercado-pago.ts`: as duas chamadas pra API do Mercado Pago
  (criar cobrança Pix, reconsultar status de um pagamento) — escrito
  estritamente a partir da documentação oficial deles.
- `app/api/webhooks/mercadopago/route.ts`: endereço que o Mercado
  Pago chama quando o status de um pagamento muda. Por segurança,
  ele nunca confia no que vem no aviso — sempre reconsulta o
  pagamento direto na API do Mercado Pago antes de marcar como pago.
- Quando um cliente final escolhe Pix no cardápio digital e a
  empresa **tem** o token configurado: o sistema cria a cobrança na
  hora, mostra o QR code e o código "copia e cola" na tela de
  sucesso do pedido.
- Quando a empresa **não tem** token configurado (situação de hoje,
  nenhuma empresa configurou ainda): o pedido é criado normalmente,
  só sem QR code — exatamente como funcionava antes dessa
  integração existir. Testei esse caminho de verdade (pedido
  completo do carrinho até a tela de sucesso, sem erro nenhum).
- Tela Configurações → Pagamentos agora mostra "Ativo" ou "Não
  configurado" de verdade (antes dizia sempre "Em breve").
- O token de cada empresa nunca é devolvido pro navegador — só uma
  informação de sim/não (`mercadoPagoConfigured`); a leitura do
  token de verdade só acontece dentro do servidor.
- Passo de ativação documentado em `docs/ONBOARDING_NOVA_EMPRESA.md`
  seção 6.

**O que eu NÃO consegui testar** (e por quê): criar uma cobrança Pix
de verdade e receber o aviso de pagamento exigem uma credencial real
do Mercado Pago e, pro aviso (webhook) chegar, um endereço público
na internet — nenhum dos dois existe ainda (você decidiu publicar só
no final). Então essa parte — a chamada pra API do Mercado Pago em
si e o recebimento do aviso — está construída conforme a
documentação oficial, mas **nunca rodou contra o serviço real**.
Pra ativar de verdade pra um cliente: (1) publicar o sistema num
endereço público, (2) pegar o Access Token do Mercado Pago do
cliente e configurar conforme o passo 6 do onboarding, (3) fazer um
pedido de teste com Pix de verdade pra confirmar que o QR code e a
confirmação de pagamento funcionam ponta a ponta.

## 3. Preço do pedido — revalidação server-side (já corrigida, registrar aqui pra visibilidade)

`app/actions/orders.ts` (`createOrder`) antes confiava cegamente no
`priceCents` enviado pelo navegador para cada item. Agora, para itens
que têm `productId`, o preço é revalidado contra a tabela `products`
antes de gravar o pedido. Itens sem `productId` (personalizados)
continuam usando o preço informado, já que não há produto de catálogo
para conferir. Não precisa de ação do Jon — só documentando a mudança
para você saber que esse comportamento já existe.
