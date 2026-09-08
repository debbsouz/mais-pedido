-- ============================================================
-- +Pedido: mesas do salão (dado real, substitui o mock local)
--
-- Antes disso, o estado das mesas (livre/ocupada/aguardando
-- pagamento, cliente, pessoas, total da comanda) vivia só no
-- useState do TablesProvider — nunca era salvo, resetava a cada
-- recarregamento e era igual para toda organização (dados
-- fictícios "Carlos", "Amanda", "João", "Mariana").
--
-- Esta tabela guarda só o ESTADO da mesa (número, status, quem
-- está sentado, quando abriu). O total e os itens da comanda
-- continuam vindo dos pedidos reais (orders/order_items) já
-- existentes, filtrados por table_number + opened_at — não
-- duplicamos essa informação aqui.
-- ============================================================

CREATE TABLE restaurant_tables (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  number INTEGER NOT NULL,
  status TEXT NOT NULL DEFAULT 'free',
  customer_name TEXT,
  people_count INTEGER,
  opened_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  CONSTRAINT restaurant_tables_status_check
    CHECK (status IN ('free', 'occupied', 'waiting-payment')),

  CONSTRAINT restaurant_tables_number_positive
    CHECK (number > 0),

  CONSTRAINT restaurant_tables_people_positive
    CHECK (people_count IS NULL OR people_count > 0),

  CONSTRAINT restaurant_tables_org_number_unique
    UNIQUE (organization_id, number)
);

CREATE INDEX idx_restaurant_tables_organization
  ON restaurant_tables(organization_id);

ALTER TABLE restaurant_tables ENABLE ROW LEVEL SECURITY;

CREATE POLICY "restaurant_tables_select_member" ON restaurant_tables
  FOR SELECT USING (is_member_of(organization_id));

CREATE POLICY "restaurant_tables_insert_member" ON restaurant_tables
  FOR INSERT WITH CHECK (is_member_of(organization_id));

CREATE POLICY "restaurant_tables_update_member" ON restaurant_tables
  FOR UPDATE USING (is_member_of(organization_id))
  WITH CHECK (is_member_of(organization_id));

CREATE POLICY "restaurant_tables_delete_member" ON restaurant_tables
  FOR DELETE USING (is_member_of(organization_id));
