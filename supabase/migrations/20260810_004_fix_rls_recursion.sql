-- ============================================================
-- +Pedido: CORRECAO de recursao infinita nas policies RLS
--
-- Problema: as policies referenciavam organization_members
-- dentro da propria query, causando:
--   "infinite recursion detected in policy for relation
--    organization_members"
--
-- Solucao: funcoes SECURITY DEFINER que rodam como postgres
-- (bypassam RLS) para verificar membership/ownership.
-- ============================================================

-- ============================================================
-- Funcoes auxiliares (SECURITY DEFINER)
-- ============================================================

-- Usuario e membro ATIVO da organizacao?
CREATE OR REPLACE FUNCTION public.is_member_of(org_id UUID)
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
      AND is_active = true
  )
$$;

-- Usuario e OWNER da organizacao?
CREATE OR REPLACE FUNCTION public.is_owner_of(org_id UUID)
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
      AND role = 'owner'
      AND is_active = true
  )
$$;

-- ============================================================
-- Remover policies antigas (com recursao)
-- ============================================================

DROP POLICY IF EXISTS "organization_members_select_same_org" ON organization_members;
DROP POLICY IF EXISTS "organization_members_manage_owner" ON organization_members;
DROP POLICY IF EXISTS "organizations_select_member" ON organizations;
DROP POLICY IF EXISTS "units_select_member" ON units;
DROP POLICY IF EXISTS "units_manage_owner" ON units;

-- ============================================================
-- Recriar policies usando as funcoes
-- ============================================================

-- organizations: membros veem suas organizacoes
CREATE POLICY "organizations_select_member" ON organizations
  FOR SELECT USING (is_member_of(id));

-- units: membros veem unidades de suas organizacoes
CREATE POLICY "units_select_member" ON units
  FOR SELECT USING (is_member_of(organization_id));

-- units: owner gerencia unidades da organizacao
CREATE POLICY "units_manage_owner" ON units
  FOR ALL USING (is_owner_of(organization_id))
  WITH CHECK (is_owner_of(organization_id));

-- organization_members: membros veem membros da mesma org
CREATE POLICY "organization_members_select_same_org" ON organization_members
  FOR SELECT USING (is_member_of(organization_id));

-- organization_members: owner gerencia membros da org
CREATE POLICY "organization_members_manage_owner" ON organization_members
  FOR ALL USING (is_owner_of(organization_id))
  WITH CHECK (is_owner_of(organization_id));

-- ============================================================
-- Conceder acesso publico de execucao (necessario para o anon
-- key rodar as funcoes via RLS)
-- ============================================================

GRANT EXECUTE ON FUNCTION public.is_member_of(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_owner_of(UUID) TO authenticated;
GRANT USAGE ON SCHEMA public TO authenticated;
