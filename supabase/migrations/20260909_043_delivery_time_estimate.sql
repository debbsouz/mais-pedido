-- ============================================================
-- +Pedido: tempo estimado de entrega, configurável por empresa
--
-- Cada empresa sabe o próprio tempo de entrega (depende da região,
-- do número de entregadores etc.) — não faz sentido a Next Code
-- estipular um valor único pra todo mundo. Fica opcional: se a
-- empresa não configurar, a loja pública simplesmente não mostra
-- nada (nunca um número inventado).
-- ============================================================

ALTER TABLE organizations
  ADD COLUMN delivery_time_min_minutes INTEGER,
  ADD COLUMN delivery_time_max_minutes INTEGER;

ALTER TABLE organizations
  ADD CONSTRAINT delivery_time_range_check CHECK (
    (delivery_time_min_minutes IS NULL AND delivery_time_max_minutes IS NULL)
    OR (
      delivery_time_min_minutes IS NOT NULL
      AND delivery_time_max_minutes IS NOT NULL
      AND delivery_time_min_minutes > 0
      AND delivery_time_max_minutes >= delivery_time_min_minutes
    )
  );

-- Expõe as duas colunas novas na função pública já existente
-- (loja pública lê organização por slug, sem sessão).
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
  google_ads_id TEXT,
  logo_url TEXT,
  banner_url TEXT,
  delivery_time_min_minutes INTEGER,
  delivery_time_max_minutes INTEGER
)
LANGUAGE SQL
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  SELECT id, name, slug, is_open, min_order_cents,
         phone, instagram_url, facebook_url, accepted_card_brands,
         meta_pixel_id, google_ads_id, logo_url, banner_url,
         delivery_time_min_minutes, delivery_time_max_minutes
  FROM organizations
  WHERE slug = org_slug;
$$;

GRANT EXECUTE ON FUNCTION public.get_public_organization_by_slug(TEXT) TO anon;
