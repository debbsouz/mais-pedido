# Como cadastrar uma empresa nova (cliente novo)

Processo manual — a Débora decidiu que, por enquanto, todo cliente
novo é cadastrado por ela ou pelo Jon, direto no banco. Não existe
tela de "criar minha conta" pública (decisão consciente, ver
`docs/PENDENCIAS_BACKEND.md` seção 7 e o histórico da conversa —
pode virar self-service depois, se fizer sentido).

## 1. Informações a coletar do cliente

- Nome da empresa (ex: "Padaria Carinho e Amor")
- CNPJ (opcional)
- Nome da unidade/loja (se só tiver uma, pode repetir o nome da
  empresa + "Centro" ou similar)
- Nome completo do dono/responsável
- E-mail do dono (vai ser o login dele)
- Qual plano contratou: `start`, `essencial`, `gestao-pro` ou
  `premium` (ver `lib/plans.ts` pra conferir o que cada um libera)

## 2. FAZER MANUAL NO SUPABASE — criar o login do dono

Isso só é manual pra esse primeiro login (o dono) — ainda não existe
ninguém na empresa nova pra "convidar" ele. Depois disso, o próprio
dono consegue convidar todo o resto da equipe sozinho, direto pelo
sistema (ver passo 4).

No painel do Supabase: **Authentication → Add user**. Preenche o
e-mail do dono e uma senha temporária (avise o cliente pra trocar
depois, em "Meu perfil" — ou passe a senha por um canal seguro).
Confirme o e-mail automaticamente (marque "Auto Confirm User" se a
opção aparecer, senão o Supabase manda um e-mail de confirmação).

## 3. Rodar o script SQL abaixo

Substitua os valores em maiúsculo e rode direto no banco (mesma
conexão usada nas migrations). É uma transação única — ou cria tudo,
ou não cria nada, sem risco de ficar pela metade.

```sql
WITH new_org AS (
  INSERT INTO organizations (name, slug, cnpj, plan_id)
  VALUES (
    'NOME DA EMPRESA',
    'slug-da-empresa',        -- vira parte do link público: /loja/slug-da-empresa
    NULL,                     -- CNPJ, ou NULL se não tiver
    'start'                   -- start | essencial | gestao-pro | premium
  )
  RETURNING id
),
new_unit AS (
  INSERT INTO units (organization_id, name, slug)
  SELECT id, 'NOME DA UNIDADE', 'unidade-principal'
  FROM new_org
  RETURNING id, organization_id
)
INSERT INTO organization_members (user_id, organization_id, unit_id, role, is_active)
SELECT
  (SELECT id FROM auth.users WHERE email = 'DONO@EMPRESA.COM'),
  new_unit.organization_id,
  new_unit.id,
  'owner',
  true
FROM new_unit;
```

**Dicas pro `slug`**: minúsculo, sem acento, sem espaço (usa hífen).
Vira o link que o cliente vai divulgar pros clientes dele
(`+pedido.com/loja/slug-da-empresa`), então vale confirmar com ele
antes se possível.

## 4. Conferir

Peça pro dono logar com o e-mail/senha criados. Deve cair direto em
`/inicio`, já com o nome da empresa dele aparecendo (não mais
"Burger House" — isso foi corrigido, ver seção 5 de
`PENDENCIAS_BACKEND.md`).

A partir daí, o próprio dono consegue:

- Cadastrar o cardápio (categorias/produtos) em Cardápio.
- Configurar tudo em Configurações (telefone, Instagram, horário de
  funcionamento, bandeiras de cartão, etc.).
- Adicionar a equipe dele sozinho (Configurações → Equipe — o
  próprio sistema manda o convite por e-mail pra cada funcionário,
  não precisa mais repetir o passo 2 manualmente pra cada um).

Não precisa de mais nenhuma ação manual depois disso — o resto do
sistema já funciona sozinho pra cada empresa nova.

## 5. FAZER MANUAL NO SUPABASE — trocar o plano de uma empresa

Pra testar como o sistema se comporta em cada plano (sidebar
esconde/bloqueia item, rota fica inacessível etc.), ou quando um
cliente muda de plano de verdade: **Table Editor → organizations**,
acha a linha pelo `slug` ou `name`, edita a coluna `plan_id` pra um
desses valores: `start`, `essencial`, `gestao-pro`, `premium`. Só
recarregar a página no navegador que o sistema já reflete o plano
novo — não precisa de mais nada.
