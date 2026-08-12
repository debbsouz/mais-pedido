-- ============================================================
-- +Pedido — MIGRACAO COMPLETA (copiar e colar no SQL Editor)
-- ============================================================
-- 1) Tabelas de identidade
-- 2) RLS
-- 3) Seed demo (Burger House)
--
-- IMPORTANTE: Para o passo 4 (usuario demo), crie o usuario
-- no Auth > New User ANTES de rodar este script, depois
-- descomente e substitua os UUIDs no final deste arquivo.
-- ============================================================


-- ============================================================
-- PARTE 1 — TABELAS
-- ============================================================

-- Perfil do usuario (estende auth.users do Supabase)
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL DEFAULT '',
  avatar_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Organizacao (a empresa dona do SaaS)
CREATE TABLE IF NOT EXISTS organizations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  cnpj TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Unidade (estabelecimento/restaurante = tenant operacional)
CREATE TABLE IF NOT EXISTS units (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  slug TEXT NOT NULL,
  address TEXT,
  phone TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(organization_id, slug)
);

-- Vinculo: usuario <-> organizacao <-> unidade <-> cargo
CREATE TABLE IF NOT EXISTS organization_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  unit_id UUID REFERENCES units(id) ON DELETE SET NULL,
  role TEXT NOT NULL CHECK (role IN ('owner', 'manager', 'attendant', 'waiter', 'kitchen', 'delivery')),
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, organization_id, unit_id)
);

-- Indices
CREATE INDEX IF NOT EXISTS idx_units_organization_id ON units(organization_id);
CREATE INDEX IF NOT EXISTS idx_organization_members_user_id ON organization_members(user_id);
CREATE INDEX IF NOT EXISTS idx_organization_members_org_unit ON organization_members(organization_id, unit_id);

-- updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS set_profiles_updated_at ON profiles;
CREATE TRIGGER set_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS set_organizations_updated_at ON organizations;
CREATE TRIGGER set_organizations_updated_at
  BEFORE UPDATE ON organizations
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS set_units_updated_at ON units;
CREATE TRIGGER set_units_updated_at
  BEFORE UPDATE ON units
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS set_organization_members_updated_at ON organization_members;
CREATE TRIGGER set_organization_members_updated_at
  BEFORE UPDATE ON organization_members
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();


-- ============================================================
-- PARTE 2 — RLS
-- ============================================================

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE units ENABLE ROW LEVEL SECURITY;
ALTER TABLE organization_members ENABLE ROW LEVEL SECURITY;

-- profiles: usuario ve/atualiza proprio perfil
DROP POLICY IF EXISTS "profiles_select_own" ON profiles;
CREATE POLICY "profiles_select_own" ON profiles
  FOR SELECT USING (auth.uid() = id);

DROP POLICY IF EXISTS "profiles_update_own" ON profiles;
CREATE POLICY "profiles_update_own" ON profiles
  FOR UPDATE USING (auth.uid() = id);

DROP POLICY IF EXISTS "profiles_insert_own" ON profiles;
CREATE POLICY "profiles_insert_own" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- organizations: membros veem suas organizacoes
DROP POLICY IF EXISTS "organizations_select_member" ON organizations;
CREATE POLICY "organizations_select_member" ON organizations
  FOR SELECT USING (
    id IN (
      SELECT organization_id FROM organization_members
      WHERE user_id = auth.uid() AND is_active = true
    )
  );

-- organizations: qualquer autenticado pode criar (fluxo cadastro)
DROP POLICY IF EXISTS "organizations_insert_authenticated" ON organizations;
CREATE POLICY "organizations_insert_authenticated" ON organizations
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- units: membros veem unidades de suas organizacoes
DROP POLICY IF EXISTS "units_select_member" ON units;
CREATE POLICY "units_select_member" ON units
  FOR SELECT USING (
    organization_id IN (
      SELECT organization_id FROM organization_members
      WHERE user_id = auth.uid() AND is_active = true
    )
  );

-- units: owner gerencia
DROP POLICY IF EXISTS "units_manage_owner" ON units;
CREATE POLICY "units_manage_owner" ON units
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM organization_members om
      WHERE om.user_id = auth.uid()
        AND om.organization_id = units.organization_id
        AND om.role = 'owner'
        AND om.is_active = true
    )
  );

-- organization_members: membros veem da mesma org
DROP POLICY IF EXISTS "organization_members_select_same_org" ON organization_members;
CREATE POLICY "organization_members_select_same_org" ON organization_members
  FOR SELECT USING (
    organization_id IN (
      SELECT organization_id FROM organization_members
      WHERE user_id = auth.uid() AND is_active = true
    )
  );

-- organization_members: owner gerencia
DROP POLICY IF EXISTS "organization_members_manage_owner" ON organization_members;
CREATE POLICY "organization_members_manage_owner" ON organization_members
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM organization_members om
      WHERE om.user_id = auth.uid()
        AND om.organization_id = organization_members.organization_id
        AND om.role = 'owner'
        AND om.is_active = true
    )
  );


-- ============================================================
-- PARTE 3 — SEED DEMO (Burger House)
-- ============================================================

INSERT INTO organizations (id, name, slug, cnpj)
VALUES (
  'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
  'Burger House',
  'burger-house',
  '12.345.678/0001-90'
)
ON CONFLICT (slug) DO NOTHING;

INSERT INTO units (id, organization_id, name, slug, address, phone)
VALUES (
  'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22',
  'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
  'Burger House Centro',
  'centro',
  'Rua das Flores, 123 - Centro',
  '(31) 99999-0000'
)
ON CONFLICT (organization_id, slug) DO NOTHING;


-- ============================================================
-- PARTE 4 — USUARIO DEMO
--
-- DESCOMENTE, substitua UUID_DO_USUARIO_AUTH pelo UUID real
-- do usuario criado no Supabase Auth (Dashboard > Auth > Users).
-- ============================================================

-- INSERT INTO profiles (id, full_name)
-- VALUES ('UUID_DO_USUARIO_AUTH', 'Debora Souza')
-- ON CONFLICT (id) DO NOTHING;

-- INSERT INTO organization_members (user_id, organization_id, unit_id, role)
-- VALUES ('UUID_DO_USUARIO_AUTH', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22', 'owner')
-- ON CONFLICT (user_id, organization_id, unit_id) DO NOTHING;
