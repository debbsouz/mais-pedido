-- ============================================================
-- +Pedido: clientes (dado real, substitui os 6 fictícios)
--
-- A tela /clientes sempre mostrava os mesmos 6 clientes inventados
-- (Mariana Souza, Carlos Eduardo...) — não existia tabela nenhuma.
-- O formulário de cadastro/edição já existia pronto no front, mas
-- estava órfão (nenhum botão abria ele).
--
-- Esta tabela guarda só a identidade/CRM do cliente (nome, contato,
-- endereço, observação). Pedidos, total gasto e histórico
-- continuam vindo dos pedidos reais (orders), casando pelo telefone
-- — mesmo princípio já usado em restaurant_tables: não duplicar o
-- que já existe em outra tabela.
--
-- phone fica sempre normalizado (só dígitos) — quem exibe formata.
-- ============================================================

CREATE TABLE customers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT,
  zip_code TEXT,
  street TEXT,
  number TEXT,
  complement TEXT,
  neighborhood TEXT,
  city TEXT,
  notes TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  CONSTRAINT customers_phone_not_blank CHECK (length(trim(phone)) > 0),
  CONSTRAINT customers_org_phone_unique UNIQUE (organization_id, phone)
);

CREATE INDEX idx_customers_organization
  ON customers(organization_id);

ALTER TABLE customers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "customers_select_member" ON customers
  FOR SELECT USING (is_member_of(organization_id));

CREATE POLICY "customers_insert_member" ON customers
  FOR INSERT WITH CHECK (is_member_of(organization_id));

CREATE POLICY "customers_update_member" ON customers
  FOR UPDATE USING (is_member_of(organization_id))
  WITH CHECK (is_member_of(organization_id));

CREATE POLICY "customers_delete_member" ON customers
  FOR DELETE USING (is_member_of(organization_id));
