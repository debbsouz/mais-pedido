-- ============================================================
-- +Pedido: Pedidos — status terminais (completed / cancelled)
--
-- Ate aqui, "finalizar pedido" e "recusar pedido" no front-end
-- eram implementados chamando deleteOrder() — ou seja, um pedido
-- concluido e um pedido recusado produziam exatamente o mesmo
-- efeito no banco: a linha era apagada para sempre, sem deixar
-- historico. Isso inviabiliza qualquer relatorio de faturamento
-- futuro e torna "concluir" e "recusar" indistinguiveis.
--
-- Esta migration adiciona dois status terminais ao ciclo de vida
-- do pedido, sem remover nem migrar nenhum dado existente:
--   - completed: pedido efetivamente atendido/entregue
--   - cancelled: pedido recusado/cancelado
--
-- Pedidos completed/cancelled somem sozinhos dos quadros
-- operacionais (Pedidos, Cozinha, Entregas), pois esses quadros
-- so exibem status ativos (new/preparing/ready/delivery) — mas o
-- registro continua no banco, disponivel para relatorios futuros.
-- ============================================================

ALTER TABLE orders DROP CONSTRAINT orders_status_check;

ALTER TABLE orders ADD CONSTRAINT orders_status_check
  CHECK (status IN ('new', 'preparing', 'ready', 'delivery', 'completed', 'cancelled'));
