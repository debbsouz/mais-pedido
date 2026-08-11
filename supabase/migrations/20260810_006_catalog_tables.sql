-- ============================================================
-- +Pedido: Cardapio — Etapa 1/9
-- Tabelas persistentes: categories e products
--
-- Decisoes desta etapa:
--   - Sem soft delete (V1 usa exclusao real)
--   - Sem seed (dados demo tratados em etapa posterior)
--   - price em CENTAVOS (inteiro), nunca negativo
--   - categories e products pertencem a ORGANIZACAO (nao unidade)
--   - Integridade cross-org garantida por FK composta
-- ============================================================

-- ============================================================
-- categories
-- ============================================================
CREATE TABLE categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- Uma organizacao nao pode ter duas categorias com o mesmo nome
  CONSTRAINT categories_organization_name_key
    UNIQUE (organization_id, name),

  -- Indice unico exigido pela FK composta de products
  -- (garante que category_id so aponte para categoria da MESMA org)
  CONSTRAINT categories_organization_id_key
    UNIQUE (organization_id, id)
);

-- ============================================================
-- products
-- ============================================================
CREATE TABLE products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  category_id UUID,
  name TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  price INTEGER NOT NULL,
  image_url TEXT,
  is_available BOOLEAN NOT NULL DEFAULT TRUE,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- Preco em centavos, nunca negativo
  CONSTRAINT products_price_non_negative
    CHECK (price >= 0),

  -- FK COMPOSTA (organization_id, category_id):
  -- Um produto so pode referenciar uma categoria que pertenca
  -- a MESMA organizacao do produto. Impede cross-tenant a nivel
  -- de schema, sem depender de RLS nem do frontend.
  -- NO ACTION: permite deletar a organizacao (cascata), mas
  -- bloqueia deletar categoria que ainda tem produtos.
  CONSTRAINT products_organization_category_fk
    FOREIGN KEY (organization_id, category_id)
    REFERENCES categories (organization_id, id)
    ON DELETE NO ACTION
);

-- ============================================================
-- Indices (apenas para consultas previsiveis)
-- ============================================================

-- Listagem de categorias de uma org, ordenadas por sort_order
CREATE INDEX idx_categories_organization_sort
  ON categories (organization_id, sort_order);

-- Listagem de produtos de uma org, ordenados por sort_order
CREATE INDEX idx_products_organization_sort
  ON products (organization_id, sort_order);

-- Filtro de produtos por categoria
CREATE INDEX idx_products_category_id
  ON products (category_id);

-- ============================================================
-- updated_at (reutiliza funcao da fundacao)
-- ============================================================

DROP TRIGGER IF EXISTS set_categories_updated_at ON categories;
CREATE TRIGGER set_categories_updated_at
  BEFORE UPDATE ON categories
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS set_products_updated_at ON products;
CREATE TRIGGER set_products_updated_at
  BEFORE UPDATE ON products
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
