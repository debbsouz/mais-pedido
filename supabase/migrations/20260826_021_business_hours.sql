-- ============================================================
-- +Pedido: horário de funcionamento por dia da semana
--
-- Hoje "aberto/fechado" é só um interruptor manual — alguém
-- precisa lembrar de apertar todo dia. Esta migration adiciona um
-- horário programado por dia da semana; a loja pública passa a
-- calcular sozinha se está dentro do horário.
--
-- O interruptor manual continua existindo (Topbar) e funciona como
-- override — serve pra fechar de emergência mesmo dentro do
-- horário programado. Se a organização não configurar nenhum
-- horário, o comportamento antigo (só manual) continua idêntico.
-- ============================================================

CREATE TABLE IF NOT EXISTS business_hours (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  day_of_week SMALLINT NOT NULL CHECK (day_of_week BETWEEN 0 AND 6), -- 0 = domingo
  is_closed BOOLEAN NOT NULL DEFAULT false,
  opens_at TIME,
  closes_at TIME,
  UNIQUE (organization_id, day_of_week)
);

CREATE INDEX IF NOT EXISTS idx_business_hours_org
  ON business_hours(organization_id);

ALTER TABLE business_hours ENABLE ROW LEVEL SECURITY;

-- Leitura pública: horário não é dado sensível, e a loja pública
-- precisa dele pra calcular "aberto agora" sem exigir login.
CREATE POLICY "business_hours_select_public" ON business_hours
  FOR SELECT USING (true);

-- Escrita: só membro da própria organização.
CREATE POLICY "business_hours_insert_member" ON business_hours
  FOR INSERT WITH CHECK (is_member_of(organization_id));

CREATE POLICY "business_hours_update_member" ON business_hours
  FOR UPDATE
  USING (is_member_of(organization_id))
  WITH CHECK (is_member_of(organization_id));

CREATE POLICY "business_hours_delete_member" ON business_hours
  FOR DELETE USING (is_member_of(organization_id));
