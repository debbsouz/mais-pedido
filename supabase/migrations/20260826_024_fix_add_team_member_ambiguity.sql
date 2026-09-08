-- ============================================================
-- +Pedido: corrige "column reference user_id is ambiguous"
--
-- add_team_member (migration 022) declarava RETURNS TABLE
-- (member_id UUID, user_id UUID) — o nome "user_id" do parâmetro
-- de saída colide com a coluna real user_id usada dentro da
-- função (INSERT/ON CONFLICT em organization_members), e o
-- PL/pgSQL não consegue decidir qual dos dois é qual. Renomeia a
-- coluna de saída pra added_user_id, que não colide com nada.
-- ============================================================

DROP FUNCTION IF EXISTS public.add_team_member(TEXT, TEXT, UUID, TEXT);

CREATE OR REPLACE FUNCTION public.add_team_member(
  p_email TEXT,
  p_full_name TEXT,
  p_organization_id UUID,
  p_role TEXT
)
RETURNS TABLE (member_id UUID, added_user_id UUID)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_unit_id UUID;
  v_user_id UUID;
  v_member_id UUID;
BEGIN
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
