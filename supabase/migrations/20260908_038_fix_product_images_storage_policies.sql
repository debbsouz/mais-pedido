-- ============================================================
-- +Pedido: corrige políticas do bucket product-images
--
-- Achado testando a Identidade Visual: a migration original
-- (20260811_008_product_images_storage.sql) usava
-- storage.create_bucket(), que não existe nesta instância —
-- falhava calada, então NUNCA criou nem o bucket nem as políticas.
-- O bucket já foi criado na migration 037 (junto com o de
-- organization-branding). Esta migration só cria as políticas que
-- faltaram — upload de imagem de produto no Cardápio estava
-- quebrado (RLS: "new row violates row-level security policy")
-- desde sempre.
-- ============================================================

DROP POLICY IF EXISTS "Autenticados fazem upload de imagens" ON storage.objects;
CREATE POLICY "Autenticados fazem upload de imagens"
  ON storage.objects
  FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'product-images');

DROP POLICY IF EXISTS "Leitura pública de imagens" ON storage.objects;
CREATE POLICY "Leitura pública de imagens"
  ON storage.objects
  FOR SELECT
  TO public
  USING (bucket_id = 'product-images');

DROP POLICY IF EXISTS "Dono deleta sua imagem" ON storage.objects;
CREATE POLICY "Dono deleta sua imagem"
  ON storage.objects
  FOR DELETE
  TO authenticated
  USING (bucket_id = 'product-images' AND auth.uid() = owner);
