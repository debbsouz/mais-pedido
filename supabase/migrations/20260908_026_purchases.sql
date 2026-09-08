-- ============================================================
-- +Pedido: registro de compras (plano Gestão Pro)
--
-- Registro simples de compras/despesas (insumo, fornecedor, etc.),
-- separado da receita de pedidos. Mesmo padrão de RLS por
-- organização já usado em products/categories.
-- ============================================================

CREATE TABLE purchases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  supplier TEXT NOT NULL,
  description TEXT NOT NULL,
  cost_cents INTEGER NOT NULL,
  purchase_date DATE NOT NULL DEFAULT CURRENT_DATE,
  notes TEXT NOT NULL DEFAULT '',
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  CONSTRAINT purchases_cost_non_negative CHECK (cost_cents >= 0)
);

CREATE INDEX idx_purchases_organization_date
  ON purchases(organization_id, purchase_date DESC);

ALTER TABLE purchases ENABLE ROW LEVEL SECURITY;

CREATE POLICY "purchases_select_member" ON purchases
  FOR SELECT USING (is_member_of(organization_id));

CREATE POLICY "purchases_insert_member" ON purchases
  FOR INSERT WITH CHECK (is_member_of(organization_id));

CREATE POLICY "purchases_delete_member" ON purchases
  FOR DELETE USING (is_member_of(organization_id));
