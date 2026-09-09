-- ============================================================
-- +Pedido: Identidade visual — logo e banner (dado real)
--
-- A tela Configurações → Identidade Visual só mostrava "Em breve" —
-- honesto, mas incompleto. A loja pública (StoreHeader.tsx,
-- lib/storefront/types.ts) já esperava logoUrl/bannerUrl há tempo,
-- só vinham fixos como null em get-storefront-data.ts.
--
-- Mesmo padrão de storage já usado pra imagem de produto
-- (20260811_008_product_images_storage.sql): bucket público,
-- upload autenticado, leitura pública, dono deleta o próprio.
-- ============================================================

ALTER TABLE organizations
  ADD COLUMN logo_url TEXT,
  ADD COLUMN banner_url TEXT;

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
  banner_url TEXT
)
LANGUAGE SQL
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  SELECT id, name, slug, is_open, min_order_cents,
         phone, instagram_url, facebook_url, accepted_card_brands,
         meta_pixel_id, google_ads_id, logo_url, banner_url
  FROM organizations
  WHERE slug = org_slug;
$$;

GRANT EXECUTE ON FUNCTION public.get_public_organization_by_slug(TEXT) TO anon;

-- Bucket público para logo/banner da organização (5MB, só imagens).
-- storage.create_bucket() não existe nesta instância — insere direto
-- na tabela, que é o mecanismo real por trás dela.
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'organization-branding',
  'organization-branding',
  true,
  5242880, -- 5MB
  ARRAY['image/png', 'image/jpeg', 'image/webp']
)
ON CONFLICT (id) DO NOTHING;

-- Achado no caminho: nenhum bucket existia no projeto — a migration
-- 20260811_008_product_images_storage.sql usava storage.create_bucket(),
-- que não existe nesta instância, então NUNCA tinha sido aplicada
-- de verdade (falhava calada). Ou seja, o upload de imagem de
-- produto no Cardápio está quebrado hoje. Aproveita e cria também.
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'product-images',
  'product-images',
  true,
  5242880,
  ARRAY['image/png', 'image/jpeg', 'image/webp']
)
ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS "Autenticados fazem upload de identidade visual" ON storage.objects;
CREATE POLICY "Autenticados fazem upload de identidade visual"
  ON storage.objects
  FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'organization-branding');

DROP POLICY IF EXISTS "Leitura pública de identidade visual" ON storage.objects;
CREATE POLICY "Leitura pública de identidade visual"
  ON storage.objects
  FOR SELECT
  TO public
  USING (bucket_id = 'organization-branding');

DROP POLICY IF EXISTS "Dono deleta sua identidade visual" ON storage.objects;
CREATE POLICY "Dono deleta sua identidade visual"
  ON storage.objects
  FOR DELETE
  TO authenticated
  USING (bucket_id = 'organization-branding' AND auth.uid() = owner);
