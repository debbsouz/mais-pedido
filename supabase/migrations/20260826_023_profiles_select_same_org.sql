-- ============================================================
-- +Pedido: ver o nome dos colegas de equipe
--
-- profiles só tinha policy de SELECT pro próprio dono
-- (profiles_select_own). Isso bloqueava a tela Equipe de mostrar
-- o nome de qualquer pessoa que não fosse quem está logado — a
-- lista sempre voltava vazia/"Sem nome" pros outros membros.
--
-- Libera SELECT quando os dois (quem pergunta e o dono do perfil)
-- são membros ativos da mesma organização — mesma lógica de
-- is_member_of, mas comparando dois usuários via organization_members
-- em vez de checar contra um organization_id fixo.
-- ============================================================

CREATE POLICY "profiles_select_same_org" ON profiles
  FOR SELECT USING (
    EXISTS (
      SELECT 1
      FROM organization_members AS viewer
      JOIN organization_members AS target
        ON target.organization_id = viewer.organization_id
      WHERE viewer.user_id = auth.uid()
        AND viewer.is_active = true
        AND target.user_id = profiles.id
        AND target.is_active = true
    )
  );
