-- ============================================================
-- +Pedido: organizations — política de UPDATE ausente
--
-- A tabela "organizations" tinha política de SELECT (membro) e
-- INSERT (qualquer autenticado), mas nenhuma de UPDATE. Isso fazia
-- com que qualquer tentativa de salvar configuração (status
-- aberto/fechado, pedido mínimo, redes sociais) "funcionasse" sem
-- erro (o Supabase não retorna erro quando o UPDATE bate 0 linhas
-- por causa do RLS — só o SELECT que ele já filtra), mas nada
-- realmente era gravado.
--
-- A checagem de "quem pode editar o quê" continua no
-- app/actions/store-settings.ts (ex.: só quem tem viewSettings
-- edita redes sociais/pedido mínimo); aqui, no banco, garantimos
-- só que ninguém edita a organização de outra pessoa.
-- ============================================================

CREATE POLICY "organizations_update_member" ON organizations
  FOR UPDATE
  USING (is_member_of(id))
  WITH CHECK (is_member_of(id));
