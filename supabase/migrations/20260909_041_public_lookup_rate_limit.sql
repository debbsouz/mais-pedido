-- ============================================================
-- +Pedido: limite de tentativas pra consultas públicas
-- (cupom e saldo de cashback por telefone)
--
-- Achado numa revisão geral: createPublicOrder já tinha limite de
-- tentativas (check_and_log_order_attempt), mas checkPublicCoupon e
-- checkPublicCashback não tinham nenhum — dava pra tentar validar
-- cupom ou telefone repetidas vezes sem parar (varrer código de
-- cupom ou telefone de cliente por tentativa e erro). Mesmo padrão
-- da migration 016, só que mais permissivo (são consultas de
-- leitura, não criação de pedido) — 20 tentativas a cada 10 minutos
-- por IP e por tipo de consulta.
-- ============================================================

CREATE TABLE IF NOT EXISTS public_lookup_attempts (
  id BIGSERIAL PRIMARY KEY,
  ip TEXT NOT NULL,
  action TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_public_lookup_attempts_ip_action_time
  ON public_lookup_attempts(ip, action, created_at DESC);

ALTER TABLE public_lookup_attempts ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.check_and_log_lookup_attempt(
  client_ip TEXT,
  lookup_action TEXT
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  recent_count INTEGER;
BEGIN
  SELECT count(*) INTO recent_count
  FROM public_lookup_attempts
  WHERE ip = client_ip
    AND action = lookup_action
    AND created_at > NOW() - INTERVAL '10 minutes';

  IF recent_count >= 20 THEN
    RETURN false;
  END IF;

  INSERT INTO public_lookup_attempts (ip, action) VALUES (client_ip, lookup_action);
  RETURN true;
END;
$$;

GRANT EXECUTE ON FUNCTION public.check_and_log_lookup_attempt(TEXT, TEXT) TO anon;
