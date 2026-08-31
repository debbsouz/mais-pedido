-- ============================================================
-- +Pedido: campos de configuração da loja pública
--
-- Status aberto/fechado e pedido mínimo hoje só existem no
-- localStorage do navegador (Topbar) — não são reais, não
-- sincronizam entre aparelhos. Redes sociais nem existem ainda.
-- Esta migration adiciona os campos reais em "organizations" e
-- devolve eles na função de busca pública por slug.
-- ============================================================

ALTER TABLE organizations
  ADD COLUMN IF NOT EXISTS is_open BOOLEAN NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS min_order_cents INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS instagram_url TEXT,
  ADD COLUMN IF NOT EXISTS facebook_url TEXT,
  ADD COLUMN IF NOT EXISTS whatsapp_url TEXT;

-- Precisa recriar (não só substituir): o retorno da função mudou.
DROP FUNCTION IF EXISTS public.get_public_organization_by_slug(TEXT);

CREATE FUNCTION public.get_public_organization_by_slug(org_slug TEXT)
RETURNS TABLE (
  id UUID,
  name TEXT,
  slug TEXT,
  is_open BOOLEAN,
  min_order_cents INTEGER,
  instagram_url TEXT,
  facebook_url TEXT,
  whatsapp_url TEXT
)
LANGUAGE SQL
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  SELECT id, name, slug, is_open, min_order_cents,
         instagram_url, facebook_url, whatsapp_url
  FROM organizations
  WHERE slug = org_slug;
$$;

GRANT EXECUTE ON FUNCTION public.get_public_organization_by_slug(TEXT) TO anon;
