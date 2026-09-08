'use server'

import { revalidatePath } from 'next/cache'

import { getOrdersContext } from '@/lib/orders-dal'
import { roleHasPermission, type UserRole } from '@/lib/roles'
import { getSiteOrigin } from '@/lib/site-url'
import { createAdminClient } from '@/lib/supabase/admin'
import { createClient } from '@/lib/supabase/server'

export type TeamActionResult =
  | { success: true }
  | { success: false; error: string }

export interface TeamMember {
  id: string
  userId: string
  name: string
  role: UserRole
  isActive: boolean
}

const addableRoles: UserRole[] = [
  'manager',
  'attendant',
  'waiter',
  'kitchen',
  'delivery',
]

/**
 * Lista os membros ativos da própria organização. Qualquer membro
 * pode ver a equipe (mesma policy que já existe pra outras leituras
 * da organização) — só adicionar/remover é restrito ao owner.
 */
export async function getTeamMembers(): Promise<TeamMember[]> {
  const context = await getOrdersContext()

  if (!context) {
    return []
  }

  const supabase = await createClient()

  const { data: memberRows } = await supabase
    .from('organization_members')
    .select('id, user_id, role, is_active')
    .eq('organization_id', context.organizationId)
    .eq('is_active', true)
    .order('created_at', { ascending: true })

  const members = memberRows ?? []

  if (members.length === 0) {
    return []
  }

  // organization_members.user_id referencia auth.users, não
  // profiles diretamente — não existe FK entre as duas tabelas
  // pro PostgREST embutir num só select, então busca à parte.
  const userIds = members.map((member) => member.user_id as string)

  const { data: profileRows } = await supabase
    .from('profiles')
    .select('id, full_name')
    .in('id', userIds)

  const namesByUserId = new Map(
    (profileRows ?? []).map((profile) => [
      profile.id as string,
      profile.full_name as string,
    ]),
  )

  return members.map((row) => ({
    id: row.id as string,
    userId: row.user_id as string,
    name:
      namesByUserId.get(row.user_id as string) || 'Sem nome',
    role: row.role as UserRole,
    isActive: row.is_active as boolean,
  }))
}

export interface AddTeamMemberInput {
  email: string
  fullName: string
  role: string
}

/**
 * Convida (por e-mail) ou reaproveita um login já existente, e
 * vincula esse usuário à equipe da organização (ver migration
 * 20260826_022_add_team_member.sql pra parte do vínculo).
 *
 * Antes disso, criar o login em si era manual no Supabase Dashboard
 * (sem service_role key). Agora usa auth.admin.inviteUserByEmail —
 * o Supabase manda um e-mail com um link, a pessoa define a própria
 * senha em /redefinir-senha e já cai logada.
 */
export async function addTeamMember(
  input: AddTeamMemberInput,
): Promise<TeamActionResult> {
  const context = await getOrdersContext()

  if (!context || !roleHasPermission(context.role, 'manageUsers')) {
    return { success: false, error: 'Não autorizado.' }
  }

  const email = input.email.trim().toLowerCase()
  const fullName = input.fullName.trim()

  if (!email || !fullName) {
    return {
      success: false,
      error: 'Preencha o nome e o e-mail.',
    }
  }

  if (!addableRoles.includes(input.role as UserRole)) {
    return { success: false, error: 'Cargo inválido.' }
  }

  const origin = await getSiteOrigin()
  const admin = createAdminClient()

  const { error: inviteError } =
    await admin.auth.admin.inviteUserByEmail(email, {
      data: { full_name: fullName },
      redirectTo: `${origin}/redefinir-senha`,
    })

  // "E-mail já cadastrado" não é erro aqui — só significa que essa
  // pessoa já tem login (de uma organização anterior, por exemplo).
  // Segue o fluxo normal e só vincula à equipe.
  const emailJaExiste =
    inviteError &&
    (inviteError.code === 'email_exists' ||
      /already.*registered/i.test(inviteError.message))

  if (inviteError && !emailJaExiste) {
    return {
      success: false,
      error: 'Não foi possível enviar o convite. Tente novamente.',
    }
  }

  const supabase = await createClient()

  const { error } = await supabase.rpc('add_team_member', {
    p_email: email,
    p_full_name: fullName,
    p_organization_id: context.organizationId,
    p_role: input.role,
  })

  if (error) {
    // A função no banco manda uma mensagem já pronta pra exibir
    // (ex.: "nenhum usuário encontrado com esse e-mail").
    return {
      success: false,
      error: error.message.replace(/^.*?:\s*/, ''),
    }
  }

  revalidatePath('/configuracoes')

  return { success: true }
}

/**
 * Remove (desativa) um membro da equipe. Owner apenas — a policy
 * organization_members_manage_owner já garante isso no banco, mas
 * confere aqui também pra dar uma mensagem clara.
 */
export async function removeTeamMember(
  memberId: string,
): Promise<TeamActionResult> {
  const context = await getOrdersContext()

  if (!context || !roleHasPermission(context.role, 'manageUsers')) {
    return { success: false, error: 'Não autorizado.' }
  }

  const supabase = await createClient()

  const { data, error } = await supabase
    .from('organization_members')
    .update({ is_active: false })
    .eq('id', memberId)
    .eq('organization_id', context.organizationId)
    .neq('role', 'owner')
    .select('id')

  if (error || !data || data.length === 0) {
    return {
      success: false,
      error: 'Não foi possível remover esse membro.',
    }
  }

  revalidatePath('/configuracoes')

  return { success: true }
}
