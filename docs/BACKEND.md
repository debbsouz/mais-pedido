# Backend do +Pedido — Fundação Supabase

## 1. Contexto

Documento que descreve a estrutura inicial do back-end do +Pedido,
construída sobre **Next.js (App Router)** + **Supabase** (PostgreSQL,
Auth e Storage).

Esta é a fase de **fundação técnica**: prepara o projeto para receber
autenticação SSR, banco de dados multi-tenant e regras de negócio,
**sem** criar tabelas, telas ou regras de negócio ainda.

## 2. Stack

- **Next.js 16** (App Router) — aplicação e server runtime
- **React 19** + **TypeScript** — front-end
- **Supabase** — autenticação, banco (PostgreSQL), futuramente Storage
- **Pacotes oficiais**: `@supabase/supabase-js` (cliente) e
  `@supabase/ssr` (integração SSR com App Router)

> Não utilizamos pacotes legados como `@supabase/auth-helpers-nextjs`.

## 3. Estrutura do back-end

```text
lib/
└── supabase/
    ├── client.ts   # createBrowserClient — uso no navegador
    └── server.ts   # createServerClient — uso no servidor
```

| Arquivo | Função | Onde usar |
|---|---|---|
| `lib/supabase/client.ts` | Cliente do navegador (`createBrowserClient`) | Client Components, formulários, eventos |
| `lib/supabase/server.ts` | Cliente do servidor (`createServerClient` + `cookies()`) | Server Components, Server Actions, Route Handlers |

Regras de uso:

- Client Components **nunca** importam `server.ts`.
- O cliente do servidor lê/grava os cookies de sessão da requisição via
  `await cookies()` (convenção assíncrona do Next 16).

## 4. Variáveis de ambiente

| Variável | Descrição | Obrigatória |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | URL do projeto Supabase | sim |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Chave pública `anon` | sim |

- `.env.example` contém apenas placeholders e é versionado.
- `.env.local` é ignorado pelo Git (nunca deve conter valores reais no
  repositório).

## 5. Multi-tenant (direção futura)

O +Pedido é uma plataforma **multiempresa**: cada estabelecimento verá
apenas os próprios dados. Toda tabela de domínio deverá conter um
identificador de estabelecimento (ex.: `establishment_id`) e as políticas
de segurança (RLS) garantirão o isolamento por tenant.

**Nesta fase** nenhuma tabela, migração ou política RLS foi criada. A
estrutura de clientes já está pronta para, nas próximas etapas, receber:

- tipagem de banco gerada (`lib/supabase/types.ts`);
- autenticação (email/senha, OAuth) com cookies de sessão;
- proxy de refresh de sessão (`proxy.ts` — novo nome do `middleware.ts`
  no Next 16);
- tabelas de domínio com `establishment_id` + Row Level Security.

## 6. O que foi intencionalmente deixado de fora

- Telas de login/cadastro e dashboard.
- Tabelas, migrações e SQL.
- `proxy.ts` (refresh de sessão) — será criado quando a autenticação
  for implementada.
- Tipos gerados do banco (`Database`).
- Regras de negócio.

## 7. Próximas etapas sugeridas

1. Criar o projeto no Supabase e preencher `.env.local`.
2. Gerar tipos do banco com `supabase gen types`.
3. Implementar fluxo de autenticação SSR (sign-up, sign-in, sign-out).
4. Criar `proxy.ts` para refresh de sessão.
5. Modelar o schema multi-tenant (establishments, users, etc.).
6. Definir políticas RLS por estabelecimento.
