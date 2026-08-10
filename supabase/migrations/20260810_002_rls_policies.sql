-- ============================================================
-- +Pedido: Politicas RLS para identidade multiempresa
-- Isolamento por tenant (organization_id / unit_id)
-- ============================================================

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE units ENABLE ROW LEVEL SECURITY;
ALTER TABLE organization_members ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- profiles
-- ============================================================

-- Usuario pode ver e atualizar seu proprio perfil
CREATE POLICY "profiles_select_own" ON profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "profiles_update_own" ON profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "profiles_insert_own" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- ============================================================
-- organizations
-- ============================================================

-- Membros podem ver organizacoes as quais pertencem
CREATE POLICY "organizations_select_member" ON organizations
  FOR SELECT USING (
    id IN (
      SELECT organization_id FROM organization_members
      WHERE user_id = auth.uid() AND is_active = true
    )
  );

-- Qualquer usuario autenticado pode criar organizacao (fluxo de cadastro)
CREATE POLICY "organizations_insert_authenticated" ON organizations
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- ============================================================
-- units
-- ============================================================

-- Membros podem ver unidades de suas organizacoes
CREATE POLICY "units_select_member" ON units
  FOR SELECT USING (
    organization_id IN (
      SELECT organization_id FROM organization_members
      WHERE user_id = auth.uid() AND is_active = true
    )
  );

-- Owner pode gerenciar unidades da sua organizacao
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

-- ============================================================
-- organization_members
-- ============================================================

-- Membros podem ver outros membros da mesma organizacao
CREATE POLICY "organization_members_select_same_org" ON organization_members
  FOR SELECT USING (
    organization_id IN (
      SELECT organization_id FROM organization_members
      WHERE user_id = auth.uid() AND is_active = true
    )
  );

-- Owner pode gerenciar membros da sua organizacao
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
