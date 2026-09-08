-- ============================================================
-- +Pedido: gestão de estoque (plano Gestão Pro)
--
-- Controle de estoque é OPCIONAL por produto (track_stock) — muito
-- restaurante faz comida na hora e não quer controlar estoque de
-- prato pronto, só de alguns itens específicos (ex.: bebidas,
-- sobremesas industrializadas). Produto sem track_stock funciona
-- exatamente como hoje, sem nenhuma mudança de comportamento.
-- ============================================================

ALTER TABLE products
  ADD COLUMN track_stock BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN stock_quantity INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN low_stock_threshold INTEGER NOT NULL DEFAULT 5,
  ADD CONSTRAINT products_stock_quantity_non_negative CHECK (stock_quantity >= 0),
  ADD CONSTRAINT products_low_stock_threshold_non_negative CHECK (low_stock_threshold >= 0);

-- Marca se a baixa de estoque de um pedido já foi aplicada, pra
-- apply_order_stock_deductions poder ser chamada mais de uma vez
-- (ex.: tentativa de retry de rede) sem descontar em dobro.
ALTER TABLE orders
  ADD COLUMN stock_applied BOOLEAN NOT NULL DEFAULT false;

-- ============================================================
-- apply_order_stock_deductions(order_id)
--
-- Desconta do estoque os produtos com track_stock=true que fazem
-- parte do pedido, e marca como indisponível quando chega a zero.
-- SECURITY DEFINER porque tanto o checkout público (anon) quanto o
-- painel interno chamam isso, e nenhum dos dois tem permissão de
-- UPDATE direto em products vindo de fora da própria organização.
--
-- Seguro contra abuso: só mexe nos produtos que já estão em
-- order_items de um pedido que JÁ existe (então já passou pelas
-- validações/rate-limit da criação do pedido) — não é um "desconte
-- X unidades do produto Y" livre, o chamador só escolhe QUAL
-- pedido, nunca quanto descontar.
-- ============================================================
CREATE OR REPLACE FUNCTION public.apply_order_stock_deductions(p_order_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- "Reivindica" a aplicação de forma atômica: só segue se ainda
  -- não tinha sido aplicado pra esse pedido.
  UPDATE orders SET stock_applied = true
  WHERE id = p_order_id AND stock_applied = false;

  IF NOT FOUND THEN
    RETURN;
  END IF;

  UPDATE products p
  SET
    stock_quantity = GREATEST(p.stock_quantity - oi.quantity, 0),
    is_available = CASE
      WHEN GREATEST(p.stock_quantity - oi.quantity, 0) = 0 THEN false
      ELSE p.is_available
    END
  FROM order_items oi
  WHERE oi.order_id = p_order_id
    AND oi.product_id = p.id
    AND p.track_stock = true;
END;
$$;

GRANT EXECUTE ON FUNCTION public.apply_order_stock_deductions(UUID) TO anon, authenticated;
