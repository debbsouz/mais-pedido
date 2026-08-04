# Diretrizes de API — +Pedido

Define como as APIs do +Pedido serão estruturadas.

**Importante:** Este é apenas um guia. Nenhuma API foi implementada ainda.

---

## 1. Visão Geral

APIs serão implementadas com **Route Handlers** do Next.js App Router, em `app/api/`.

Estrutura futura (exemplo):

```text
app/api/
├── orders/
│   ├── route.ts
│   └── [id]/route.ts
└── products/
    ├── route.ts
    └── [id]/route.ts
```

---

## 2. Convenções REST

| Verbo | Uso | Idempotente |
|-------|-----|-------------|
| `GET` | Buscar | Sim |
| `POST` | Criar | Não |
| `PUT` | Atualizar completo | Sim |
| `PATCH` | Atualizar parcial | Sim |
| `DELETE` | Remover | Sim |

Rotas no padrão:

```text
GET    /api/orders
POST   /api/orders
GET    /api/orders/:id
PUT    /api/orders/:id
DELETE /api/orders/:id
```

---

## 3. Estrutura de Resposta

### Sucesso

```json
{
  "id": "123",
  "name": "João Silva",
  "email": "joao@example.com",
  "createdAt": "2024-01-15T10:30:00Z"
}
```

Lista paginada:

```json
{
  "data": [{ "id": "1", "status": "pending" }],
  "pagination": {
    "page": 1,
    "pageSize": 20,
    "total": 45,
    "totalPages": 3
  }
}
```

Criação: `201 Created`. Remoção: `204 No Content`.

### Erro

```json
{
  "name": "NotFoundError",
  "code": "NOT_FOUND",
  "message": "Recurso não encontrado",
  "timestamp": "2024-01-20T14:30:00Z"
}
```

---

## 4. Paginação

| Parâmetro | Tipo | Padrão | Descrição |
|-----------|------|--------|-----------|
| `page` | number | 1 | Página (1-indexed) |
| `pageSize` | number | 20 | Itens por página (máx. 100) |
| `sort` | string | `createdAt` | Campo de ordenação |
| `order` | `asc` \| `desc` | `desc` | Direção |

---

## 5. Filtros e Busca

Filtros por query string:

```text
GET /api/orders?status=pending&createdAfter=2024-01-01
GET /api/products?priceMin=100&priceMax=500
```

| Filtro | Tipo |
|--------|------|
| `status` | string |
| `createdAfter` / `createdBefore` | ISO date |
| `priceMin` / `priceMax` | number |
| `search` | string |

---

## 6. Tratamento de Erros

As classes de `lib/errors/` serão traduzidas em respostas HTTP na borda da API.

Fluxo:

```text
Service lança AppError → API route captura → resposta com statusCode → cliente recebe JSON
```

---

## 7. Autenticação

Será implementada quando o fluxo de autenticação existir. Nada definido nesta fase.

---

## 8. Versionamento

Sem versionamento no MVP. Quando houver breaking changes, usar `/api/v1`, `/api/v2`.

---

## 9. Checklist de Implementação

Para cada nova API:

- [ ] Verbo HTTP correto
- [ ] Validação de entrada
- [ ] Status code correto
- [ ] Tratamento de erros
- [ ] Autenticação (se necessário)
- [ ] Paginação (em listas)

---

## Referências

- [Next.js Route Handlers](https://nextjs.org/docs/app/building-your-application/routing/route-handlers)
- [RESTful API Design](https://restfulapi.net/)
