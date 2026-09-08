-- ============================================================
-- +Pedido: agendamento de pedido (plano Essencial)
--
-- Escopo real (sem esconder isso de ninguém): o cliente escolhe um
-- horário futuro na loja pública, e o pedido já entra no painel
-- normalmente (status 'new'), só que marcado com esse horário —
-- a equipe vê destacado e decide quando começar a preparar. NÃO
-- existe uma tarefa automática que segura o pedido escondido até
-- a hora certa (precisaria de um cron/job rodando, que este
-- sistema não tem hoje). É agendamento visível, não automático.
-- ============================================================

ALTER TABLE orders
  ADD COLUMN scheduled_for TIMESTAMPTZ;
