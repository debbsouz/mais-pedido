-- ============================================================
-- +Pedido: Cardápio — Imagens de produto via Supabase Storage
--
-- Cria o bucket "product-images" (público) e as políticas RLS
-- para upload autenticado, leitura pública e exclusão pelo dono.
-- ============================================================

-- Bucket público para imagens de produto (5MB, apenas imagens)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM storage.buckets WHERE name = 'product-images'
  ) THEN
    PERFORM storage.create_bucket(
      'product-images',
      public := true,
      file_size_limit := 5242880, -- 5MB
      allowed_mime_types := ARRAY['image/png', 'image/jpeg', 'image/webp']
    );
  END IF;
END $$;

-- ============================================================
-- Políticas RLS para storage.objects
-- ============================================================

-- Qualquer autenticado pode fazer upload para o bucket
DROP POLICY IF EXISTS "Autenticados fazem upload de imagens" ON storage.objects;
CREATE POLICY "Autenticados fazem upload de imagens"
  ON storage.objects
  FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'product-images');

-- Leitura pública (bucket público)
DROP POLICY IF EXISTS "Leitura pública de imagens" ON storage.objects;
CREATE POLICY "Leitura pública de imagens"
  ON storage.objects
  FOR SELECT
  TO public
  USING (bucket_id = 'product-images');

-- O dono do arquivo pode deletar
DROP POLICY IF EXISTS "Dono deleta sua imagem" ON storage.objects;
CREATE POLICY "Dono deleta sua imagem"
  ON storage.objects
  FOR DELETE
  TO authenticated
  USING (bucket_id = 'product-images' AND auth.uid() = owner);
