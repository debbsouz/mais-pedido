-- ============================================================
-- +Pedido: Dados de demonstracao
-- Cria: organizacao "Burger House", unidade "Centro"
--
-- IMPORTANTE: O usuario demo deve ser criado manualmente no
-- Supabase Auth (Dashboard > Authentication > New User) com
-- email e senha definidos. Depois, descomente e substitua
-- os UUIDs abaixo pelo UUID real do auth.users criado.
-- ============================================================

-- Organizacao demo
INSERT INTO organizations (id, name, slug, cnpj)
VALUES (
  'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
  'Burger House',
  'burger-house',
  '12.345.678/0001-90'
);

-- Unidade demo
INSERT INTO units (id, organization_id, name, slug, address, phone)
VALUES (
  'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22',
  'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
  'Burger House Centro',
  'centro',
  'Rua das Flores, 123 - Centro',
  '(31) 99999-0000'
);

-- ============================================================
-- Perfil + vinculo do usuario demo
-- DESCOMENTE e substitua UUID_DO_USUARIO_AUTH pelo UUID real
-- que aparece no Supabase Auth > Users apos criar o usuario.
-- ============================================================

-- INSERT INTO profiles (id, full_name)
-- VALUES ('UUID_DO_USUARIO_AUTH', 'Debora Souza');

-- INSERT INTO organization_members (user_id, organization_id, unit_id, role)
-- VALUES ('UUID_DO_USUARIO_AUTH', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22', 'owner');
