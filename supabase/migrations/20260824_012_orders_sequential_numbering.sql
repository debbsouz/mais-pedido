-- ============================================================
-- +Pedido: Pedidos — Numeração Sequencial
--
-- Adiciona suporte a numeração sequencial e amigável dos pedidos.
-- Cada pedido recebe um número único e sequencial por organização:
--   Pedido #001, #002, #003...
--
-- Em vez de usar o UUID ou um short code do UUID, usamos um
-- numero inteiro que é mais legivel e profissional.
--
-- A sequência é mantida em uma tabela separada (order_sequences)
-- para evitar gerar gap-less sequences com SERIAL/BIGSERIAL.
-- ============================================================

-- ============================================================
-- Tabela: order_sequences
-- Rastreia o proximo numero de pedido por organizacao
-- ============================================================
CREATE TABLE IF NOT EXISTS order_sequences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL UNIQUE REFERENCES organizations(id) ON DELETE CASCADE,
  next_number INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_order_sequences_org ON order_sequences(organization_id);

-- ============================================================
-- Funcao: get_next_order_number(org_id)
-- Retorna o proximo numero de pedido para uma organizacao
-- (com lock pessimista para evitar race conditions)
-- ============================================================
CREATE OR REPLACE FUNCTION public.get_next_order_number(org_id UUID)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  next_num INTEGER;
BEGIN
  -- Insere a sequencia se nao existir (primeira vez)
  INSERT INTO order_sequences (organization_id, next_number)
  VALUES (org_id, 1)
  ON CONFLICT (organization_id) DO NOTHING;

  -- Pega o proximo numero e atualiza (com lock pessimista)
  UPDATE order_sequences
  SET next_number = next_number + 1
  WHERE organization_id = org_id
  RETURNING next_number - 1 INTO next_num;

  RETURN COALESCE(next_num, 1);
END;
$$;

GRANT EXECUTE ON FUNCTION public.get_next_order_number(UUID) TO authenticated;

-- ============================================================
-- Tabela orders: Adiciona coluna "number"
-- ============================================================
ALTER TABLE orders ADD COLUMN IF NOT EXISTS number INTEGER;

-- Funcao para preencher order_number em pedidos existentes
DO $$
DECLARE
  org_record RECORD;
  order_record RECORD;
  seq INTEGER := 1;
BEGIN
  -- Para cada organizacao com pedidos
  FOR org_record IN
    SELECT DISTINCT organization_id FROM orders WHERE number IS NULL
  LOOP
    seq := 1;
    -- Atribui numeros sequenciais aos pedidos existentes
    FOR order_record IN
      SELECT id FROM orders
      WHERE organization_id = org_record.organization_id
        AND number IS NULL
      ORDER BY created_at ASC
    LOOP
      UPDATE orders
      SET number = seq
      WHERE id = order_record.id;
      seq := seq + 1;
    END LOOP;

    -- Atualiza a sequencia para a proxima organizacao
    INSERT INTO order_sequences (organization_id, next_number)
    VALUES (org_record.organization_id, seq)
    ON CONFLICT (organization_id) DO UPDATE
    SET next_number = GREATEST(order_sequences.next_number, seq);
  END LOOP;
END $$;

-- Agora adiciona NOT NULL constraint (apos preencher dados existentes)
ALTER TABLE orders ALTER COLUMN number SET NOT NULL;

-- Index para buscar por numero + organizacao (util para operacoes)
CREATE INDEX IF NOT EXISTS idx_orders_org_number ON orders(organization_id, number DESC);

-- ============================================================
-- Trigger: Auto-incrementar numero ao criar pedido
-- ============================================================
CREATE OR REPLACE FUNCTION public.set_order_number()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.number IS NULL THEN
    NEW.number := get_next_order_number(NEW.organization_id);
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trigger_set_order_number ON orders;

CREATE TRIGGER trigger_set_order_number
BEFORE INSERT ON orders
FOR EACH ROW
EXECUTE FUNCTION public.set_order_number();

-- ============================================================
-- RLS para order_sequences (leitura apenas para membros)
-- ============================================================
ALTER TABLE order_sequences ENABLE ROW LEVEL SECURITY;

CREATE POLICY "order_sequences_select_member" ON order_sequences
  FOR SELECT USING (is_member_of(organization_id));
