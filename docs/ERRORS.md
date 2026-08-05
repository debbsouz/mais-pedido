# Tratamento de Erros — +Pedido

Padrão de tratamento de erros do projeto.

---

## 1. Filosofia

1. **Detectar cedo** — validar entrada e pré-condições.
2. **Propagar claro** — usar exceções tipadas.
3. **Tratar na borda** — API/UI, no limite da aplicação.
4. **Comunicar bem** — mensagens claras para usuário e logs.

---

## 2. Hierarquia de Erros

```text
BaseError (abstrato)
└── AppError
    ├── ValidationError (dados inválidos)
    ├── NotFoundError (recurso não encontrado)
    ├── ConflictError (conflito de estado)
    ├── UnauthorizedError (não autenticado)
    └── ForbiddenError (não autorizado)
```

Definição em `lib/errors/index.ts`.

---

## 3. Classes de Erro

| Classe | Código | HTTP | Uso |
|--------|--------|------|-----|
| `ValidationError` | `VALIDATION_ERROR` | 400 | Dados de entrada inválidos |
| `UnauthorizedError` | `UNAUTHORIZED` | 401 | Não autenticado |
| `ForbiddenError` | `FORBIDDEN` | 403 | Sem permissão |
| `NotFoundError` | `NOT_FOUND` | 404 | Recurso inexistente |
| `ConflictError` | `CONFLICT` | 409 | Violação de estado |

### Uso

```typescript
throw new NotFoundError('Usuário não encontrado', {
  resource: 'User',
  id: '123',
})

throw new ValidationError('Dados inválidos', {
  issues: [{ path: ['email'], message: 'Formato inválido' }],
})
```

---

## 4. Onde Lançar

- **Services**: regras de negócio. Lançam `AppError` quando a operação não pode prosseguir.
- **Repositories**: acesso a dados. Erros de banco **não** devem vazar para o usuário.
- **API Routes**: borda da aplicação. Traduzem erros em respostas HTTP.

---

## 5. Log de Erros

| Nível | Uso |
|-------|-----|
| `error` | Erros que afetam o fluxo |
| `warn` | Situações anormais não fatais |
| `info` | Eventos importantes |
| `debug` | Apenas em desenvolvimento |

Regra: **nunca** expor stack traces ou detalhes internos ao usuário.

---

## 6. Validação de Entrada

Será definida quando as APIs existirem. Na fundação, nenhuma validação foi implementada.

---

## 7. Erros em Client Components

Tratar erros próximos ao uso:

```typescript
try {
  await createOrder(formData)
} catch (error) {
  setError('Ocorreu um erro. Tente novamente.')
  console.error(error)
}
```

---

## 8. Checklist

- [ ] Usar classes tipadas de `lib/errors`.
- [ ] Incluir mensagem clara e código.
- [ ] Adicionar contexto (ID, campo).
- [ ] Logar erros de infraestrutura.
- [ ] Validar entrada antes de processar.
- [ ] Tratar erros na borda (API/UI).
- [ ] Nunca expor detalhes internos ao usuário.

---

## Referências

- [Custom Errors em JavaScript](https://javascript.info/custom-errors)
