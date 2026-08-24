# Loja pública (/loja/[slug]) — pendências de backend

> **Fluxo de trabalho (Git)**: ver `docs/PENDENCIAS_JON.md`, seção 0 —
> não commitar/push direto na `main`, trabalhar em branch própria com
> PR, e avisar a Débora antes de qualquer ajuste que precise mexer no
> front-end.

## 1. Contexto

O front-end da loja pública já está pronto (rota `app/loja/[slug]/page.tsx`,
componentes em `components/loja/`), construído inteiramente com **dados
mockados**, isolados em `lib/storefront/`:

- `lib/storefront/types.ts` — contrato de dados que os componentes esperam.
- `lib/storefront/mock-data.ts` — dados fictícios da loja "burger-house".
- `lib/storefront/get-storefront-data.ts` — **único ponto de acesso aos
  dados**. Hoje devolve o mock; quando os itens abaixo estiverem prontos,
  troca-se só o corpo desta função por chamadas reais ao Supabase — os
  componentes não precisam mudar, desde que o formato devolvido bata com
  `StorefrontData` (ver `types.ts`).

Este documento existe pra alinhar o que falta no backend antes de a loja
pública sair do modo "só visual" e passar a mostrar dado real.

## 2. O que já existe no banco hoje

- `organizations`: `id`, `name`, `slug` (único), `cnpj`.
- `units`: `id`, `organization_id`, `name`, `slug`, `address`, `phone`.
- `categories` / `products`: RLS exige `is_member_of(organization_id)` —
  só membro autenticado da organização lê.
- `orders`: RLS de INSERT também exige `is_member_of(organization_id)`.
- Cadastro de organização: **manual**, via migration/SQL direto no
  Supabase (ver `supabase/migrations/20260810_003_seed_demo_data.sql`).
  Não existe tela nem processo automatizado ainda.

## 3. Pendências — bloqueantes pro MVP da loja pública

Sem isso, não dá pra tirar a loja pública do modo mock.

### 3.1 Leitura pública de categorias e produtos

Hoje `categories_select_member` / `products_select_member` só liberam
leitura para membro da organização. Precisa de uma policy adicional de
`SELECT` para visitante anônimo (`anon`), filtrando por organização/unidade
ativa — sem expor produtos de organizações inativas/suspensas.

### 3.2 Busca pública de organização/unidade por slug

Hoje a consulta de organização depende de sessão autenticada
(`getCurrentUser()` → `getCatalogContext()`). Precisa de uma forma de
resolver `slug → organização/unidade` sem sessão, retornando só os campos
seguros para exibição pública (nada sensível tipo CNPJ, dados de outros
clientes, configurações internas).

### 3.3 Criação de pedido por visitante anônimo

RLS de INSERT em `orders` hoje também exige `is_member_of`. Precisa de uma
policy que permita um visitante sem login criar pedido vinculado à
organização/unidade certa — com os limites de segurança que fizerem
sentido (rate limit, validação de itens/preço no servidor para evitar
manipulação do carrinho pelo cliente, etc.).

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

### 4.2 Status aberto/fechado e pedido mínimo

Hoje "aberto/fechado" é só `localStorage` no painel administrativo — não
existe no banco, não é um dado real nem sincronizado. Precisa de uma
coluna (`is_open` e `min_order_value`, provavelmente em `units`) que o
painel escreve e a loja pública lê.

### 4.3 Redes sociais

Campos `instagram_url`, `facebook_url`, `whatsapp_url` — hoje inexistentes.
Formato esperado: `StorefrontSocial` em `types.ts`.

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

1. 3.1, 3.2, 3.3 — sem isso a loja pública não sai do mock de jeito nenhum.
2. 4.1, 4.2 — identidade e status são o que mais aparece visualmente.
3. 4.3, 4.5 — redes sociais e pagamento, rápidos de adicionar.
4. 4.4, 4.6 — promoções e populares, melhoram a experiência mas a loja
   funciona sem eles (as seções já somem sozinhas quando vazias).
5. 4.7, 4.8 — dependem de autenticação de cliente / mesas, podem esperar
   uma fase própria.
