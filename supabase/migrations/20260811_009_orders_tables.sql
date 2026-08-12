-- ============================================================
-- +Pedido: Pedidos — Etapa 5
-- Tabelas persistentes: orders e order_items
--
-- Decisoes desta etapa:
--   - total_cents denormalizado (computado no createOrder a partir
--     dos itens, evita agregacao a cada leitura)
--   - address e payment como JSONB (o frontend usa objetos aninhados)
--   - order_items.product_id nullable (produto pode ser excluido;
--     o item do pedido persiste com nome/preco congelados)
--   - CONSTRAINT CHECK para origin/fulfillment/status validos
--
-- Permissoes (lib/roles.ts):
--   createOrders -> owner, manager, attendant, waiter
--   manageOrders -> owner, manager, attendant
-- ============================================================

-- ============================================================
-- Funcao: can_create_orders(org_id)
-- Mapeia a permissao 'createOrders' para SQL.
-- ============================================================
CREATE OR REPLACE FUNCTION public.can_create_orders(org_id UUID)
RETURNS BOOLEAN
LANGUAGE SQL
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.organization_members
    WHERE user_id = auth.uid()
      AND organization_id = org_id
      AND role IN ('owner', 'manager', 'attendant', 'waiter')
      AND is_active = true
  )
$$;

GRANT EXECUTE ON FUNCTION public.can_create_orders(UUID) TO authenticated;

-- ============================================================
-- Funcao: can_manage_orders(org_id)
-- Mapeia a permissao 'manageOrders' para SQL.
-- ============================================================
CREATE OR REPLACE FUNCTION public.can_manage_orders(org_id UUID)
RETURNS BOOLEAN
LANGUAGE SQL
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.organization_members
    WHERE user_id = auth.uid()
      AND organization_id = org_id
      AND role IN ('owner', 'manager', 'attendant')
      AND is_active = true
  )
$$;

GRANT EXECUTE ON FUNCTION public.can_manage_orders(UUID) TO authenticated;

-- ============================================================
-- orders
-- ============================================================
CREATE TABLE orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  customer_name TEXT NOT NULL DEFAULT '',
  customer_phone TEXT,
  origin TEXT NOT NULL,
  fulfillment TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'new',
  table_number TEXT,
  pickup_name TEXT,
  observation TEXT,
  address JSONB,
  payment JSONB,
  total_cents INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  CONSTRAINT orders_origin_check CHECK (origin IN ('Site', 'WhatsApp', 'Garçom', 'Atendente')),
  CONSTRAINT orders_fulfillment_check CHECK (fulfillment IN ('Delivery', 'Retirada', 'Mesa', 'Balcão')),
  CONSTRAINT orders_status_check CHECK (status IN ('new', 'preparing', 'ready', 'delivery')),
  CONSTRAINT orders_total_cents_check CHECK (total_cents >= 0)
);

CREATE INDEX idx_orders_organization_created ON orders(organization_id, created_at DESC);
CREATE INDEX idx_orders_status ON orders(organization_id, status);

-- ============================================================
-- order_items
-- ============================================================
CREATE TABLE order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_id UUID,
  name TEXT NOT NULL,
  price_cents INTEGER NOT NULL,
  quantity INTEGER NOT NULL DEFAULT 1,

  CONSTRAINT order_items_price_check CHECK (price_cents >= 0),
  CONSTRAINT order_items_quantity_check CHECK (quantity > 0),
  CONSTRAINT order_items_order_name_key UNIQUE (order_id, name)
);

CREATE INDEX idx_order_items_order ON order_items(order_id);

-- ============================================================
-- RLS
-- ============================================================
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;

-- Leitura: qualquer membro ativo da organizacao
CREATE POLICY "orders_select_member" ON orders
  FOR SELECT USING (is_member_of(organization_id));

-- Criacao: quem tem createOrders (owner, manager, attendant, waiter)
CREATE POLICY "orders_insert_create_permission" ON orders
  FOR INSERT WITH CHECK (
    is_member_of(organization_id) AND can_create_orders(organization_id)
  );

-- Atualizacao de status: quem tem manageOrders (owner, manager, attendant)
CREATE POLICY "orders_update_manage_permission" ON orders
  FOR UPDATE USING (is_member_of(organization_id) AND can_manage_orders(organization_id));

-- Exclusao: quem tem manageOrders
CREATE POLICY "orders_delete_manage_permission" ON orders
  FOR DELETE USING (is_member_of(organization_id) AND can_manage_orders(organization_id));

-- order_items segue o RLS do order pai (via subquery)
CREATE POLICY "order_items_select_member" ON order_items
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM orders o
      WHERE o.id = order_items.order_id
        AND is_member_of(o.organization_id)
    )
  );

CREATE POLICY "order_items_insert_manage_permission" ON order_items
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM orders o
      WHERE o.id = order_items.order_id
        AND is_member_of(o.organization_id)
        AND can_create_orders(o.organization_id)
    )
  );

CREATE POLICY "order_items_delete_manage_permission" ON order_items
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM orders o
      WHERE o.id = order_items.order_id
        AND is_member_of(o.organization_id)
        AND can_manage_orders(o.organization_id)
    )
  );
