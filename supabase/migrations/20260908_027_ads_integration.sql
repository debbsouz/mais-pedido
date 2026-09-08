-- ============================================================
-- +Pedido: integração com anúncios (plano Gestão Pro)
--
-- Versão honesta do recurso: não existe "central de campanhas"
-- dentro do sistema — o que dá pra entregar de verdade é deixar o
-- dono cadastrar o Pixel do Meta e/ou a tag do Google Ads, e o
-- sistema injeta esses scripts reais na loja pública sozinho. Quem
-- cria/gerencia a campanha continua sendo o próprio Meta Ads
-- Manager / Google Ads — o +Pedido só carrega o rastreador.
-- ============================================================

ALTER TABLE organizations
  ADD COLUMN IF NOT EXISTS meta_pixel_id TEXT,
  ADD COLUMN IF NOT EXISTS google_ads_id TEXT;

DROP FUNCTION IF EXISTS public.get_public_organization_by_slug(TEXT);

CREATE FUNCTION public.get_public_organization_by_slug(org_slug TEXT)
RETURNS TABLE (
  id UUID,
  name TEXT,
  slug TEXT,
  is_open BOOLEAN,
  min_order_cents INTEGER,
  phone TEXT,
  instagram_url TEXT,
  facebook_url TEXT,
  accepted_card_brands TEXT[],
  meta_pixel_id TEXT,
  google_ads_id TEXT
)
LANGUAGE SQL
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  SELECT id, name, slug, is_open, min_order_cents,
         phone, instagram_url, facebook_url, accepted_card_brands,
         meta_pixel_id, google_ads_id
  FROM organizations
  WHERE slug = org_slug;
$$;

GRANT EXECUTE ON FUNCTION public.get_public_organization_by_slug(TEXT) TO anon;
