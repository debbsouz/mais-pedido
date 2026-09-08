-- ============================================================
-- +Pedido: cadastro/atribuição de entregador (plano Essencial)
--
-- Reaproveita a equipe já cadastrada (Configurações → Equipe,
-- cargo "Entregador") em vez de criar um cadastro de motoboy
-- paralelo — quem pode ser atribuído a uma entrega é quem já tem
-- login com esse cargo na organização.
-- ============================================================

ALTER TABLE orders
  ADD COLUMN assigned_driver_id UUID REFERENCES auth.users(id) ON DELETE SET NULL;

-- A policy de UPDATE que já existe (orders_update_manage_permission,
-- via can_manage_orders) já cobre esta coluna nova — nenhuma policy
-- adicional necessária.
