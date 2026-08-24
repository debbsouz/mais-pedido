# Pendências de backend — painel de gestão

Diferente de `docs/LOJA_PUBLICA_BACKEND.md` (que é só sobre a loja
pública), este documento junta pendências de backend encontradas numa
revisão completa do painel de gestão (login, pedidos, cozinha, mesas,
garçom, atendente, cardápio, clientes, configurações).

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

## 3. Preço do pedido — revalidação server-side (já corrigida, registrar aqui pra visibilidade)

`app/actions/orders.ts` (`createOrder`) antes confiava cegamente no
`priceCents` enviado pelo navegador para cada item. Agora, para itens
que têm `productId`, o preço é revalidado contra a tabela `products`
antes de gravar o pedido. Itens sem `productId` (personalizados)
continuam usando o preço informado, já que não há produto de catálogo
para conferir. Não precisa de ação do Jon — só documentando a mudança
para você saber que esse comportamento já existe.
