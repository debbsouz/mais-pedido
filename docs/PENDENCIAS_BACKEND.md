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

## 2. Tabela de clientes não existe

A tela `/clientes` mostra sempre os mesmos 6 clientes fictícios,
hardcoded em `components/clientes/CustomersManagement.tsx`. Não existe
nenhuma tabela `customers` no banco (confirmado — nenhuma migration
cria isso). O formulário de cadastro/edição de cliente já existe pronto
no front-end (`CustomerFormDrawer.tsx`, 423 linhas), mas está
completamente órfão — não há botão que abra ele.

Pra essa tela funcionar de verdade, falta:

- Tabela `customers` (nome, telefone, e-mail, endereço, notas,
  `organization_id`, RLS por organização — seguindo o mesmo padrão de
  `products`/`categories`).
- DAL (`lib/customers-dal.ts`) e Server Actions
  (`app/actions/customers.ts`) equivalentes ao que já existe para
  catálogo e pedidos.

Isso é feature nova, não ajuste — não tentei simular com dado local.

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
- **Adicionar funcionário**: como este ambiente só tem a chave anon
  do Supabase (sem `service_role`), criar o *login* em si (e-mail +
  senha) continua manual, **FAZER MANUAL NO SUPABASE** (Authentication
  → Add user) — isso é feito pela Débora, não pelo sistema. Depois
  disso, na tela Equipe ela digita o mesmo e-mail + nome + cargo, e
  a função `add_team_member` (SECURITY DEFINER, só owner pode
  chamar) vincula esse usuário à organização, criando/atualizando
  `profiles` e `organization_members`. Reativa automaticamente se a
  pessoa já tinha sido removida antes.
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

Testado ponta a ponta: lista carrega os 3 membros reais que já
existiam (Débora/owner, além de dois logins de teste pré-existentes
— João/garçom, Maria/atendente), tentativa com e-mail inexistente
mostra erro claro, e um ciclo completo de remover + readicionar a
Maria funcionou e devolveu ela ao estado original (mesmo `id`, mesmo
cargo, ativa de novo) — sem sobra de dado quebrado.

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

## 9. Plano da assinatura — ainda hardcoded (pendência aberta)

`lib/dal.ts` (`getCurrentSubscription`) sempre retorna
`planId: 'premium'` pra qualquer organização — comentário no próprio
código já avisa (`TODO: buscar assinatura real da tabela
subscriptions`). Efeito prático: o sidebar mostra "Premium" pra
qualquer empresa, e o bloqueio de item por plano (`Sidebar.tsx`, já
existe pronto — ícone de cadeado + "Disponível em um plano
superior") nunca ativa, porque todo mundo "tem" o plano mais alto.

Proposta (não implementada ainda): adicionar uma coluna
`plan_id` em `organizations` (ou uma tabela `subscriptions` separada,
se um dia tiver cobrança automática recorrente — por enquanto não
tem, então uma coluna simples já resolve) e ler o plano de verdade
ali. O fluxo de onboarding manual (`docs/ONBOARDING_NOVA_EMPRESA.md`)
já teria onde registrar o plano contratado na hora de cadastrar o
cliente.

## 3. Preço do pedido — revalidação server-side (já corrigida, registrar aqui pra visibilidade)

`app/actions/orders.ts` (`createOrder`) antes confiava cegamente no
`priceCents` enviado pelo navegador para cada item. Agora, para itens
que têm `productId`, o preço é revalidado contra a tabela `products`
antes de gravar o pedido. Itens sem `productId` (personalizados)
continuam usando o preço informado, já que não há produto de catálogo
para conferir. Não precisa de ação do Jon — só documentando a mudança
para você saber que esse comportamento já existe.
