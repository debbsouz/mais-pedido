-- ============================================================
-- +Pedido: Loja pública — leitura sem login + pedido anônimo
--
-- Libera o que a loja pública (/loja/[slug]) precisa pra sair do
-- modo mock e mostrar dado real:
--
--   1. Leitura pública de categorias e produtos disponíveis.
--   2. Busca da organização por slug, sem exigir sessão — via
--      função SECURITY DEFINER, pra não expor colunas sensíveis
--      (ex.: cnpj) que uma policy de SELECT direta na tabela
--      exporia por completo.
--   3. Criação de pedido por visitante sem conta, restrita a
--      origin = 'Site' (para não se misturar com pedido interno
--      de garçom/atendente/balcão).
--
-- Não mexe em nenhuma policy existente — só adiciona novas
-- (RLS soma policies, não substitui).
-- ============================================================

-- ============================================================
-- 1. Leitura pública de categorias e produtos
-- ============================================================
CREATE POLICY "categories_select_public" ON categories
  FOR SELECT USING (true);

CREATE POLICY "products_select_public" ON products
  FOR SELECT USING (is_available = true);

-- ============================================================
-- 2. Organização por slug, sem sessão
-- ============================================================
CREATE OR REPLACE FUNCTION public.get_public_organization_by_slug(org_slug TEXT)
RETURNS TABLE (id UUID, name TEXT, slug TEXT)
LANGUAGE SQL
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  SELECT id, name, slug FROM organizations WHERE slug = org_slug;
$$;

GRANT EXECUTE ON FUNCTION public.get_public_organization_by_slug(TEXT) TO anon;

-- ============================================================
-- 3. Pedido criado por visitante anônimo
-- ============================================================
CREATE POLICY "orders_insert_public" ON orders
  FOR INSERT WITH CHECK (origin = 'Site');

CREATE POLICY "order_items_insert_public" ON order_items
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM orders o
      WHERE o.id = order_items.order_id
        AND o.origin = 'Site'
    )
  );
