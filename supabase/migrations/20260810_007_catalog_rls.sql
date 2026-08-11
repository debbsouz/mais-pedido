-- ============================================================
-- +Pedido: Cardapio — Etapa 1/9
-- RLS para categories e products
--
-- Permissoes mapeadas do modelo existente (lib/roles.ts):
--   viewMenu  -> owner, manager        (leitura no painel)
--   manageMenu-> owner, manager        (escrita/gestao)
--
-- Em RLS:
--   Leitura : qualquer membro ATIVO da organizacao pode ler.
--             (garcom/atendente/cozinha/entregador precisam ler
--             produtos para operar — viewMenu no frontend)
--   Escrita : owner e manager (permissao manageMenu).
--
-- Nova funcao auxiliar can_manage_menu segue o mesmo padrao
-- SECURITY DEFINER de is_member_of / is_owner_of (migration 004).
-- ============================================================

-- ============================================================
-- Funcao: can_manage_menu(org_id)
-- Retorna true se o usuario e owner OU manager ATIVO da org.
-- Mapeia a permissao 'manageMenu' para SQL.
-- ============================================================
CREATE OR REPLACE FUNCTION public.can_manage_menu(org_id UUID)
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
      AND role IN ('owner', 'manager')
      AND is_active = true
  )
$$;

GRANT EXECUTE ON FUNCTION public.can_manage_menu(UUID) TO authenticated;

-- ============================================================
-- categories
-- ============================================================
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;

-- Leitura: qualquer membro ativo da organizacao
CREATE POLICY "categories_select_member" ON categories
  FOR SELECT USING (is_member_of(organization_id));

-- Escrita: owner e manager (manageMenu)
CREATE POLICY "categories_manage_menu" ON categories
  FOR ALL USING (can_manage_menu(organization_id))
  WITH CHECK (can_manage_menu(organization_id));

-- ============================================================
-- products
-- ============================================================
ALTER TABLE products ENABLE ROW LEVEL SECURITY;

-- Leitura: qualquer membro ativo da organizacao
CREATE POLICY "products_select_member" ON products
  FOR SELECT USING (is_member_of(organization_id));

-- Escrita: owner e manager (manageMenu)
CREATE POLICY "products_manage_menu" ON products
  FOR ALL USING (can_manage_menu(organization_id))
  WITH CHECK (can_manage_menu(organization_id));
