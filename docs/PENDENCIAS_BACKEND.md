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

## 1. Migration de status terminais de pedido — CONFIRMAR SE JÁ FOI APLICADA

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

**Status**: a Débora pediu para eu aplicar isso no banco, mas eu não
tenho credenciais de administração do Supabase neste ambiente (só
`NEXT_PUBLIC_SUPABASE_URL` e `NEXT_PUBLIC_SUPABASE_ANON_KEY`, que não
permitem DDL). Ela decidiu como proceder — **confira com ela se este
SQL já foi rodado** antes de assumir que sim. Enquanto não for
aplicado, os botões "Finalizar pedido", "Recusar" e "Finalizar
entrega" mostram um erro ("Não foi possível atualizar o pedido.") em
vez de funcionar — testei e confirmei que isso já falha de forma
segura (sem apagar nada, sem travar a tela), então não é urgente ao
ponto de quebrar o produto, mas precisa ser aplicado antes de qualquer
demonstração real desse fluxo.

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

**Bug observado, NÃO corrigido ainda** (fora do escopo desta sessão):
na tela Início (`/inicio`), o card "Saúde da operação"
(`components/inicio/OperationStats.tsx`) mostrou "Operação com atraso
crítico" com "Tempo médio: 31453 minutos" — isso vem de pedidos de
teste antigos (de 12/08) que ficaram presos em status
`preparing`/`ready` por semanas e nunca foram finalizados/cancelados,
distorcendo o cálculo de tempo médio. Não é dado inventado, é cálculo
real em cima de dado de teste velho — mas o cálculo em si também
parece não descartar pedidos muito antigos, o que é um bug separado
(um pedido esquecido há semanas não devia contar como "31453 minutos
de atraso"). Fica registrado pra próxima sessão investigar
`OperationStats`/`OperationAlert` e decidir um limite razoável (ex.:
ignorar pedidos com mais de X horas no cálculo de tempo médio).

## 3. Preço do pedido — revalidação server-side (já corrigida, registrar aqui pra visibilidade)

`app/actions/orders.ts` (`createOrder`) antes confiava cegamente no
`priceCents` enviado pelo navegador para cada item. Agora, para itens
que têm `productId`, o preço é revalidado contra a tabela `products`
antes de gravar o pedido. Itens sem `productId` (personalizados)
continuam usando o preço informado, já que não há produto de catálogo
para conferir. Não precisa de ação do Jon — só documentando a mudança
para você saber que esse comportamento já existe.
