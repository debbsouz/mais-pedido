# Padrões de Código — +Pedido

Diretrizes de desenvolvimento do projeto +Pedido.

---

## 1. Nomenclatura

### Arquivos

| Tipo | Padrão | Exemplo |
|------|--------|---------|
| Componentes React | `PascalCase.tsx` | `Button.tsx` |
| Hooks | `camelCase.ts` | `useAuth.ts` |
| Utilitários | `camelCase.ts` | `formatCurrency.ts` |
| Serviços | `camelCase.ts` | `orderService.ts` |
| Repositórios | `camelCase.ts` | `orderRepository.ts` |
| Tipos/Interfaces | `PascalCase.ts` | `User.ts` |
| Constantes | `SCREAMING_SNAKE_CASE.ts` | `HTTP_STATUS.ts` |

### Variáveis e Funções

```typescript
// Variáveis: camelCase
const userName = 'João'
const isActive = true

// Constantes: SCREAMING_SNAKE_CASE
const MAX_RETRIES = 3

// Funções: camelCase, verbo no infinitivo
function calculateTotal(price: number, quantity: number): number

// Booleanos: prefixo is/has/should/can
const isAuthenticated = false
```

### Tipos e Interfaces

```typescript
// Interface para objetos que podem ser estendidos
interface User {
  id: string
  name: string
}

// Type para uniões e tipos primitivos
type Status = 'active' | 'inactive'

// Props de componentes: prefixo Props
interface ButtonProps {
  label: string
  onClick: () => void
}
```

---

## 2. Organização de Código

Estrutura de pastas (sem `src/`):

```text
app/            # Next.js App Router (rotas, páginas, layouts)
components/     # Componentes React reutilizáveis
config/         # Configurações da aplicação
lib/            # Infraestrutura e utilitários
repositories/   # Acesso a dados
services/       # Lógica de negócio
types/          # Tipagens TypeScript compartilhadas
validators/     # Validação de entrada
docs/           # Documentação
```

Responsabilidades por camada:

| Camada | Responsabilidade | Pode depender de |
|--------|------------------|------------------|
| `app/` | Rotas, páginas, layouts | Todas |
| `components/` | UI e apresentação | `lib/`, `types/` |
| `services/` | Regras de negócio | `repositories/`, `lib/`, `types/` |
| `repositories/` | Acesso a dados | `lib/`, `types/` |
| `lib/` | Infraestrutura e utilitários | Dependências externas |
| `types/` | Contratos de dados | Nenhuma |
| `validators/` | Validação de entrada | `types/` |
| `config/` | Configurações | Nenhuma |

---

## 3. Imports

Ordem de imports:

```typescript
// 1. Node.js
import { cookies } from 'next/headers'

// 2. Pacotes externos
import { createServerClient } from '@supabase/ssr'

// 3. Internos com alias
import { Button } from '@/components/ui/Button'

// 4. Relativos (evitar quando possível)
import { LocalComponent } from './LocalComponent'
```

- Usar sempre alias `@/` para imports internos (já configurado no `tsconfig.json`).
- Agrupar por tipo, separando com linha em branco.
- Usar `import type` para importar apenas tipos.

---

## 4. Funções

```typescript
// Funções nomeadas (preferir)
function calculateTotal(price: number, quantity: number): number {
  return price * quantity
}

// Arrow functions para callbacks e funções curtas
const double = (n: number): number => n * 2

// Funções assíncronas
async function fetchUser(id: string): Promise<User> {
  const response = await fetch(`/api/users/${id}`)
  return response.json()
}
```

- Evitar muitos parâmetros posicionais; usar objeto de parâmetros.
- Sempre tipar retornos de funções públicas.

---

## 5. Comentários

- Comentar **"por que"**, não "o que".
- Usar JSDoc para funções públicas com `@param`, `@returns` e `@example`.
- Marcar dívidas com `TODO(nome): contexto`.

---

## 6. Commits

Formato: `<tipo>(<escopo>): <descrição>`

Tipos:

| Tipo | Uso |
|------|-----|
| `feat` | Nova funcionalidade |
| `fix` | Correção de bug |
| `refactor` | Mudança sem correção nem feature |
| `docs` | Apenas documentação |
| `style` | Formatação (sem efeito em lógica) |
| `test` | Adição/correção de testes |
| `chore` | Build, CI, dependências |
| `perf` | Performance |
| `ci` | Configuração de CI/CD |

Regras:
- Verbo no imperativo ("adiciona", não "adicionado").
- Primeira letra minúscula, sem ponto final.
- Máximo de 72 caracteres no título.
- Corpo (se necessário) explica "o que" e "por que".

---

## 7. Branches

Nomenclatura: `<tipo>/<descricao-curta>`

| Tipo | Uso |
|------|-----|
| `feat/` | Nova funcionalidade |
| `fix/` | Correção de bug |
| `refactor/` | Refatoração |
| `docs/` | Documentação |
| `chore/` | Manutenção |

Fluxo:
1. `main` sempre estável.
2. Branches de feature saem de `main`.
3. Merge via Pull Request; branch deletada após merge.

---

## 8. Código Limpo

- **DRY** — extrair código duplicado para funções reutilizáveis.
- **KISS** — preferir soluções simples.
- **YAGNI** — não implementar o que não é necessário agora.
- **Single Responsibility** — cada função faz uma coisa bem feita.

Evitar:
- Comentários óbvios (`// retorna o usuário`).
- Magic numbers — usar constantes nomeadas.
- Funções gigantes (> 50 linhas, como guia).
- Aninhamento profundo (> 3 níveis).

---

## 9. TypeScript

- `strict: true` e opções estritas obrigatórias.
- Evitar `any`; usar `unknown` com type guard.
- Usar `as const` para literais.
- Tipos explícitos em APIs públicas.
- `import type` para importações de tipo.

---

## 10. Linting

- Executar `npm run lint` antes de todo commit.
- Corrigir todos os warnings/errors antes de push.

---

## Referências

- [TypeScript Handbook](https://www.typescriptlang.org/docs/handbook/)
- [Next.js Documentation](https://nextjs.org/docs)
- [Conventional Commits](https://www.conventionalcommits.org/)
