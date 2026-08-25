# Revisão da branch `backend/ajustes`

Revisão feita em 2026-08-24, lendo o código de verdade (não só o resumo
gerado pela IA que você usa) e rodando `tsc --noEmit` numa cópia
isolada da branch, sem mexer no ambiente de ninguém. Isso não é uma
crítica ao trabalho — é o processo normal de review antes de mesclar
qualquer branch na `main`. A ideia geral (numeração sequencial, status
`accepted`, terminar pedido sem apagar) está correta e bem pensada;
faltou só fechar a integração em alguns pontos.

## O que está certo

- A migration `20260824_013_orders_accepted_status.sql` foi construída
  **em cima** da nossa `20260824_011_orders_terminal_status.sql` — já
  inclui `completed`/`cancelled` no mesmo `CHECK`, então aplicar as
  duas em sequência não quebra nada.
- `20260824_012_orders_sequential_numbering.sql` (tabela
  `order_sequences`, função `get_next_order_number` com lock
  pessimista, trigger de auto-incremento, backfill dos pedidos
  existentes) está bem estruturada — não achei problema nela.
- Os ajustes em `app/actions/orders.ts`, `lib/orders-dal.ts`,
  `lib/format.ts`, `components/providers/OrdersProvider.tsx`,
  `components/cozinha/KitchenCard.tsx`, `components/entregas/DeliveryCard.tsx`,
  `components/pedidos/OrderDrawer.tsx` e `components/inicio/RecentOrders.tsx`
  são todos aditivos e coerentes com o que já está na `main`.

## O que precisa de ajuste antes do merge

Rodando `npx tsc --noEmit` na branch, aparecem **8 erros de
compilação**. O resumo da sua ferramenta disse "no problems found" —
isso não bate com o estado atual do código, então recomendo rodar esse
comando de novo antes do próximo push (`npx tsc --noEmit` na raiz do
projeto).

### 1. `OrdersBoard.tsx` não foi atualizado — a tela principal de Pedidos não compila

Arquivo: `components/pedidos/OrdersBoard.tsx`

Esse arquivo define `statusSequence`, `mobileStatusLabels`,
`getColumnVariant` e `statusCounts` como mapas que precisam cobrir
**todos** os status possíveis (`Record<OrderStatus, ...>`). Como o
`OrderStatus` agora inclui `accepted`, `completed` e `cancelled`, mas
esses mapas só conhecem os 4 status antigos, o TypeScript recusa a
compilar. É a tela mais central do fluxo — precisa decidir:

- `accepted` ganha uma coluna própria no quadro (entre "Novos
  pedidos" e "Em preparo"), ou
- fica só como um status interno de transição, sem coluna visual
  dedicada (parecido com o que foi feito na Cozinha, que já trata
  `new`/`accepted`/`preparing` como um grupo só).

De qualquer forma, `completed`/`cancelled` não devem aparecer em
nenhuma coluna do quadro — são status finais, o pedido já devia sumir
da tela ativa (é assim que o nosso lado já trata: `ordersByStatus`
filtra por igualdade exata com os 4 status ativos, então basta os
mapas terem entradas para os 3 novos status sem quebrar essa lógica).

### 2. Número do pedido exibido errado em `OrderCard.tsx`

Arquivo: `components/pedidos/OrderCard.tsx`, dentro do `return` do
componente.

Está assim:

```tsx
<span className="order-card__id">
  {formatOrderNumber(id)}
</span>
```

`formatOrderNumber` espera um `number` (ex: `7` → `"#007"`), mas está
recebendo `id`, que é o UUID do pedido (string). Ia mostrar algo tipo
`#a3f8e21c-9b44-...` em vez de `#007`. Precisa:

1. Adicionar `number` na desestruturação do `order` (logo no início do
   componente, junto com `id, customer, origin, ...`).
2. Trocar para `{formatOrderNumber(number)}`.

Nos outros 4 lugares onde `formatOrderNumber` foi usado (Cozinha,
Entregas, Drawer do pedido, Início) está correto — só esse ficou pra
trás.

### 3. Três lugares criam `Order` sem o campo `number`

`number` virou campo obrigatório na interface `Order`
(`components/pedidos/OrderCard.tsx`). Isso quebra a compilação em
todo lugar que monta um objeto `Order` "na mão" (sem vir do banco
ainda) e esqueceu desse campo:

- `components/garcom/WaiterHome.tsx`
- `components/mesas/TablesBoard.tsx`
- `components/pedidos/NewOrderDrawer.tsx`

Esses são pedidos otimistas (criados no front antes de saber o número
real que o banco vai gerar). Precisa decidir um valor temporário
sensato até a resposta do servidor chegar — `0` já é aceito pelo tipo,
mas vale conferir se algum desses três não passa esse valor direto
pra tela antes do pedido "de verdade" ser confirmado (senão aparece
"#000" por um instante).

## O que ainda não tem gatilho real

Mesmo depois de corrigido o item 1, hoje **nada no fluxo principal
efetivamente transforma um pedido em `accepted`** — o botão "Aceitar"
em `OrdersBoard.tsx` continua chamando `onMoveOrder(orderId,
"preparing")` direto, pulando o novo status. Ou isso é intencional (o
`accepted` existe só pra outros fluxos, tipo automações futuras) ou
falta decidir onde, na tela de Pedidos, o usuário efetivamente marca
"aceito" antes de "em preparo".

## Sugestão de próximo passo

Rodar `npx tsc --noEmit` local antes do próximo push, corrigir os 3
pontos acima, decidir o design do item "accepted no quadro" e do
gatilho, e aí sim abrir de novo pra revisão antes do merge na `main`.
