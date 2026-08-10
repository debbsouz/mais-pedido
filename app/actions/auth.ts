'use server'

import { redirect } from 'next/navigation'

import { createClient } from '@/lib/supabase/server'

/**
 * Server Action: sign-in com email + senha.
 * Chamada pelo formulario de login.
 *
 * useActionState do React19 gerencia pending/error.
 */
export async function signIn(
  _prevState: { error: string } | undefined,
  formData: FormData,
): Promise<{ error: string } | undefined> {
  const supabase = await createClient()

  const email = formData.get('email') as string
  const password = formData.get('password') as string

  if (!email || !password) {
    return { error: 'Informe e-mail e senha.' }
  }

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) {
    return { error: 'E-mail ou senha invalidos.' }
  }

  redirect('/inicio')
}

/**
 * Server Action: sign-out.
 * Chamada pelo botao "Sair" na Sidebar.
 */
export async function signOut() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  redirect('/login')
}
