# Loja pública (/loja/[slug]) — pendências de backend

> **Fluxo de trabalho (Git)**: ver `docs/PENDENCIAS_BACKEND.md`, seção 0 —
> não commitar/push direto na `main`, trabalhar em branch própria com
> PR, e avisar a Débora antes de qualquer ajuste que precise mexer no
> front-end.

## 1. Contexto

O front-end da loja pública está pronto (rota `app/loja/[slug]/page.tsx`,
componentes em `components/loja/`) e, desde 2026-08-25, **já lê dado real
do Supabase** — não usa mais mock. Camada de dados em `lib/storefront/`:

- `lib/storefront/types.ts` — contrato de dados que os componentes esperam.
- `lib/storefront/get-storefront-data.ts` — **único ponto de acesso aos
  dados**. Busca a organização pelo slug, categorias e produtos
  disponíveis, direto do Supabase. Campos que ainda não têm coluna real
  (cor da marca, logo/banner, avaliação, redes sociais, promoções,
  populares, pedidos recentes) usam valor neutro/vazio — nunca um número
  inventado (ver seção 4 abaixo para o que falta em cada um).
- `app/actions/public-orders.ts` — cria pedido real a partir do carrinho
  da loja pública (visitante sem login), com `origin: 'Site'`.

Este documento existe pra alinhar o que falta no backend pra loja pública
ficar completa (identidade visual, promoções, etc.) — a base já funciona.

## 2. O que já existe no banco hoje

- `organizations`: `id`, `name`, `slug` (único), `cnpj`.
- `units`: `id`, `organization_id`, `name`, `slug`, `address`, `phone`.
- `categories` / `products`: leitura pública liberada (ver seção 3).
- `orders` / `order_items`: criação por visitante anônimo liberada (ver
  seção 3), restrita a `origin = 'Site'`.
- Cadastro de organização: **manual**, via migration/SQL direto no
  Supabase (ver `supabase/migrations/20260810_003_seed_demo_data.sql`).
  Não existe tela nem processo automatizado ainda.

## 3. Bloqueantes do MVP — ✅ resolvidos em 2026-08-25

Migrations `20260825_014_loja_publica_leitura_e_pedido.sql` e
`20260825_015_loja_publica_fix_order_items_rls.sql` (aplicadas direto no
banco de produção, verificadas com a chave pública simulando um visitante
real, incluindo um pedido de teste ponta a ponta que depois foi removido):

- **Leitura pública de categorias e produtos**: policies
  `categories_select_public` (`USING (true)`) e `products_select_public`
  (`USING (is_available = true)`).
- **Busca pública de organização por slug**: função SECURITY DEFINER
  `get_public_organization_by_slug(org_slug)`, devolve só `id`/`name`/
  `slug` — nunca CNPJ nem outro dado sensível.
- **Criação de pedido por visitante anônimo**: policies
  `orders_insert_public` e `order_items_insert_public`, restritas a
  `origin = 'Site'`. O preço de cada item é sempre revalidado contra o
  catálogo real no servidor (`app/actions/public-orders.ts`), nunca
  confiando no valor enviado pelo navegador.

**Detalhe técnico que vale registrar** (pegou os dois de nós de surpresa
durante o teste): `INSERT ... RETURNING` também passa pela RLS de
`SELECT` da tabela — como visitante anônimo não pode ler `orders` (tem
nome/telefone de cliente), um `RETURNING` inicial quebrava mesmo com a
policy de INSERT correta. Resolvido gerando o `id` do pedido no servidor
(`crypto.randomUUID()`) em vez de pedir de volta. Pelo mesmo motivo, a
policy de `order_items` usa uma função SECURITY DEFINER
(`order_is_public`) em vez de uma subquery direta em `orders`.

## 4. Pendências — necessárias pra loja ficar "completa", mas não bloqueiam o MVP

### 4.1 Identidade visual da loja

Não existem colunas para isso ainda. Sugestão de campos (em `organizations`
ou `units`, o que fizer mais sentido para o modelo de multi-unidade):

- `logo_url`, `banner_url` (Supabase Storage)
- `theme_primary_color`, `theme_secondary_color`
- `description`
- `establishment_type` (ex.: "Hamburgueria", "Pizzaria")

O front já sabe consumir tudo isso — ver `StorefrontBrand` em
`lib/storefront/types.ts`.

### 4.2 Status aberto/fechado e pedido mínimo — ✅ resolvido em 2026-08-25

Colunas `is_open` e `min_order_cents` em `organizations`. O toggle
"Loja aberta/fechada" no Topbar (que antes só escrevia no
`localStorage`) agora persiste de verdade via
`app/actions/store-settings.ts` (`updateStoreStatus`), e o pedido
mínimo é editável em Configurações → card "Loja pública"
(`updateStoreSettings`). A loja pública lê os dois direto do banco.

### 4.3 Redes sociais — ✅ resolvido em 2026-08-25

Colunas `instagram_url`, `facebook_url`, `whatsapp_url` em
`organizations`, editáveis no mesmo card "Loja pública" em
Configurações.

**Detalhe técnico que vale registrar**: a tabela `organizations` tinha
política de `SELECT` (membro) e `INSERT`, mas nenhuma de `UPDATE`. Isso
fazia o "salvar" retornar sucesso sem gravar nada (o Supabase não
retorna erro quando um `UPDATE` bate 0 linhas por causa do RLS).
Corrigido com a policy `organizations_update_member` (migration
`20260825_019`). Os dois Server Actions também passaram a usar
`.select()` após o update para detectar isso no futuro, caso aconteça
de novo em outra tabela.

### 4.4 Promoções/destaques configuráveis

Recurso opcional por loja (nem toda empresa vai querer usar). Sugestão:
tabela `promotions` (ou similar) com `organization_id`, `kind` (desconto /
entrega grátis / cupom / combo / aviso / personalizado), `title`,
`subtitle`, `active`. Formato esperado: `StorefrontPromo` em `types.ts`.

### 4.5 Formas de pagamento aceitas por loja

Hoje fixo no mock (Pix / Cartão / Dinheiro). Precisa ser configurável por
organização, provavelmente ligado às configurações que já existem em
`app/(panel)/configuracoes` (Pix, bandeiras aceitas). Formato esperado:
`StorefrontPaymentMethod` em `types.ts`.

### 4.6 "Mais pedidos" (popularidade agregada)

Precisa de uma consulta que agregue os produtos mais pedidos por
organização (contagem de itens em pedidos concluídos, por exemplo). Não é
histórico pessoal do cliente — é popularidade geral da loja. Enquanto não
existir, o front pode continuar recebendo uma lista vazia ou calculada de
forma simples.

### 4.7 "Peça de novo" (histórico real do cliente)

Só deve aparecer quando existir cliente autenticado com pedidos
anteriores nesta loja. Depende de autenticação de cliente (fora do escopo
deste documento — explicitamente não implementada ainda, por instrução da
Débora) e de uma consulta de pedidos por cliente + organização.

### 4.8 Mesa / QR Code (`?mesa=12`)

O front já lê o parâmetro `mesa` na URL e ajusta o checkout (trava em
"salão", mostra "Mesa 12"). Hoje não valida se essa mesa existe de
verdade. Se fizer sentido ter uma tabela `tables` (por unidade), a
validação pode vir depois — não é bloqueante, hoje o número é só exibido.

## 5. Fora de escopo por enquanto (não pedir pro Jon ainda)

- Autenticação de cliente final (login do cliente que faz pedido).
- Mercado Pago / pagamento real.
- Notificações via WhatsApp Business API.
- Painel administrativo interno da Next Code (cadastro de empresas
  clientes, contrato, mensalidade) — decisão consciente de deixar para
  quando houver mais de uma empresa cliente real. Cadastro de organização
  continua manual (SQL/Supabase Dashboard) até lá.

## 6. Prioridade sugerida

1. ~~3.1, 3.2, 3.3~~ — feito em 2026-08-25.
2. 4.1 — identidade visual: adiada de propósito até existir uma
   empresa real cadastrada (não faz sentido construir upload de
   logo/banner sem ter o que enviar).
3. ~~4.2, 4.3~~ — feito em 2026-08-25.
4. ~~4.5 (parcial)~~ — feito em 2026-08-26: bandeiras de cartão
   aceitas na entrega são reais e já aparecem no cardápio digital.
   Pix continua só cadastro da chave (sem QR Code/cobrança
   automática — isso ainda depende de decidir a integração de
   pagamento).

## 7. Telefone único (2026-08-26)

Não existe mais campo de WhatsApp separado. O telefone cadastrado em
Configurações → Estabelecimento (`organizations.phone`) é a fonte
única — o botão de WhatsApp da loja pública é gerado a partir dele
(`buildWhatsAppUrl` em `lib/storefront/get-storefront-data.ts`).

## 8. Horário de funcionamento por dia da semana (2026-08-26)

Tabela `business_hours` (migration `20260826_021_business_hours.sql`):
uma linha por dia da semana (0 = domingo) por organização, com
`is_closed`, `opens_at`, `closes_at`. Leitura pública liberada (não é
dado sensível); escrita só para membro da organização.

`status.isOpen` da loja pública passa a combinar dois fatores
(`isWithinBusinessHours` em `lib/storefront/business-hours.ts`,
usado em `get-storefront-data.ts`):

- Interruptor manual (`organizations.is_open`, Topbar) — continua
  funcionando como um "fechar de emergência", mesmo dentro do
  horário programado.
- Horário programado do dia (considera também o dia anterior, pra
  cobrir horário que passa da meia-noite).

Se a organização não configurar nenhum horário (tabela vazia para
ela), o cálculo cai de volta pro comportamento antigo — só o
interruptor manual decide. Isso mantém compatível qualquer
organização que ainda não configurou nada.

UI de edição: Configurações → Cardápio Digital, seção "Horário de
funcionamento" (`app/actions/business-hours.ts` para
`getBusinessHours`/`updateBusinessHours`).
4. 4.4, 4.6 — promoções e populares, melhoram a experiência mas a loja
   funciona sem eles (as seções já somem sozinhas quando vazias).
5. 4.7, 4.8 — dependem de autenticação de cliente / mesas, podem esperar
   uma fase própria.
