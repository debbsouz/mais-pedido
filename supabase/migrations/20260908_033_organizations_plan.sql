-- ============================================================
-- +Pedido: plano contratado — dado real (era hardcoded)
--
-- lib/dal.ts (getCurrentSubscription) sempre retornava 'premium'
-- pra qualquer organização — por isso o sidebar mostrava "Premium"
-- pra todo mundo e o bloqueio de item por plano (que já existia
-- pronto no Sidebar) nunca ativava.
--
-- Onboarding é manual (Débora/Next Code cadastra cada cliente —
-- não tem autoatendimento/cobrança automática ainda), então uma
-- coluna simples em organizations já resolve — não precisa de uma
-- tabela subscriptions separada por enquanto.
-- ============================================================

ALTER TABLE organizations
  ADD COLUMN plan_id TEXT NOT NULL DEFAULT 'start';

ALTER TABLE organizations
  ADD CONSTRAINT organizations_plan_id_check
  CHECK (plan_id IN ('start', 'essencial', 'gestao-pro', 'premium'));

-- Organizações que já existem hoje (antes dessa coluna existir)
-- vinham recebendo o comportamento do Premium no código antigo —
-- mantém isso pra não tirar recurso de quem já está usando.
-- Cadastros novos entram no default 'start'.
UPDATE organizations SET plan_id = 'premium';
