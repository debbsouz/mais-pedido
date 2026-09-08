-- ============================================================
-- +Pedido: adicionar funcionário à equipe
--
-- Contexto: este ambiente só tem a chave anon do Supabase (sem
-- service_role), então não dá pra criar usuário de autenticação
-- direto pelo app — isso continua sendo feito manualmente no
-- Supabase Dashboard (Authentication > Add user), pela Débora.
--
-- O que ESTA migration resolve: depois que o usuário já existe no
-- Supabase Auth, o dono da organização (owner) consegue vincular
-- essa pessoa à própria equipe digitando só o e-mail — sem precisar
-- saber o UUID dele. `profiles` e `organization_members` só
-- permitem que cada usuário mexa no próprio registro (RLS), então
-- esta função SECURITY DEFINER faz a ponte, verificando por dentro
-- que quem está chamando é owner da organização em questão.
-- ============================================================

CREATE OR REPLACE FUNCTION public.add_team_member(
  p_email TEXT,
  p_full_name TEXT,
  p_organization_id UUID,
  p_role TEXT
)
RETURNS TABLE (member_id UUID, user_id UUID)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_unit_id UUID;
  v_user_id UUID;
  v_member_id UUID;
BEGIN
  -- Só o owner da organização pode adicionar gente na equipe.
  -- Usa o mesmo vínculo pra descobrir em qual unidade o owner
  -- está operando, e coloca o novo membro na mesma unidade.
  SELECT unit_id INTO v_unit_id
  FROM organization_members
  WHERE user_id = auth.uid()
    AND organization_id = p_organization_id
    AND role = 'owner'
    AND is_active = true
  LIMIT 1;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Não autorizado.';
  END IF;

  IF p_role NOT IN ('manager', 'attendant', 'waiter', 'kitchen', 'delivery') THEN
    RAISE EXCEPTION 'Cargo inválido.';
  END IF;

  SELECT id INTO v_user_id
  FROM auth.users
  WHERE email = lower(trim(p_email))
  LIMIT 1;

  IF v_user_id IS NULL THEN
    RAISE EXCEPTION
      'Nenhum usuário encontrado com esse e-mail. Crie o acesso dessa pessoa no Supabase primeiro (Authentication > Add user).';
  END IF;

  INSERT INTO profiles (id, full_name)
  VALUES (v_user_id, p_full_name)
  ON CONFLICT (id) DO UPDATE SET full_name = EXCLUDED.full_name;

  INSERT INTO organization_members (user_id, organization_id, unit_id, role, is_active)
  VALUES (v_user_id, p_organization_id, v_unit_id, p_role, true)
  ON CONFLICT (user_id, organization_id, unit_id)
  DO UPDATE SET role = EXCLUDED.role, is_active = true
  RETURNING id INTO v_member_id;

  RETURN QUERY SELECT v_member_id, v_user_id;
END;
$$;

GRANT EXECUTE ON FUNCTION public.add_team_member(TEXT, TEXT, UUID, TEXT) TO authenticated;
