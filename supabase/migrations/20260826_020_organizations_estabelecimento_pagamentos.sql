-- ============================================================
-- +Pedido: telefone, chave Pix e bandeiras aceitas
--
-- - phone: telefone único da empresa. Alimenta tanto a aba
--   Estabelecimento quanto o botão de WhatsApp da loja pública
--   (mesmo número, sem cadastro duplicado).
-- - pix_key / pix_key_type: preparação para quando cada empresa
--   for cadastrada de verdade — a Next Code vai preencher a chave
--   Pix do cliente aqui. NÃO é integração real (sem geração de QR
--   Code, sem Mercado Pago) — só o dado, guardado e pronto pra
--   quando essa integração for construída.
-- - accepted_card_brands: bandeiras aceitas na maquininha (pagamento
--   na entrega). Hoje só existia como estado solto no front-end,
--   sem gravar em lugar nenhum.
-- ============================================================

ALTER TABLE organizations
  ADD COLUMN IF NOT EXISTS phone TEXT,
  ADD COLUMN IF NOT EXISTS pix_key TEXT,
  ADD COLUMN IF NOT EXISTS pix_key_type TEXT,
  ADD COLUMN IF NOT EXISTS accepted_card_brands TEXT[] NOT NULL DEFAULT '{}';

-- Recria a função pública: agora também devolve telefone (pro
-- WhatsApp) e bandeiras aceitas (pro cliente ver antes de pedir).
-- NÃO devolve pix_key/pix_key_type — não tem uso público ainda.
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
  accepted_card_brands TEXT[]
)
LANGUAGE SQL
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  SELECT id, name, slug, is_open, min_order_cents,
         phone, instagram_url, facebook_url, accepted_card_brands
  FROM organizations
  WHERE slug = org_slug;
$$;

GRANT EXECUTE ON FUNCTION public.get_public_organization_by_slug(TEXT) TO anon;
