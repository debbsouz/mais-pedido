-- ============================================================
-- +Pedido: Loja pública — limite de pedidos por visitante
--
-- Hoje nada impede alguém de criar dezenas de pedidos falsos
-- seguidos na loja pública (sem login, sem custo). Esta migration
-- adiciona um limite simples: no máximo 5 pedidos por IP a cada
-- 10 minutos, por meio de uma função SECURITY DEFINER (o
-- visitante nunca acessa a tabela de controle diretamente).
-- ============================================================

CREATE TABLE IF NOT EXISTS public_order_attempts (
  id BIGSERIAL PRIMARY KEY,
  ip TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_public_order_attempts_ip_time
  ON public_order_attempts(ip, created_at DESC);

-- RLS habilitada e sem nenhuma policy: ninguém acessa esta tabela
-- direto, só através da função abaixo (SECURITY DEFINER).
ALTER TABLE public_order_attempts ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.check_and_log_order_attempt(client_ip TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  recent_count INTEGER;
BEGIN
  SELECT count(*) INTO recent_count
  FROM public_order_attempts
  WHERE ip = client_ip AND created_at > NOW() - INTERVAL '10 minutes';

  IF recent_count >= 5 THEN
    RETURN false;
  END IF;

  INSERT INTO public_order_attempts (ip) VALUES (client_ip);
  RETURN true;
END;
$$;

GRANT EXECUTE ON FUNCTION public.check_and_log_order_attempt(TEXT) TO anon;
