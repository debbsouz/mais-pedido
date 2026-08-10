'use client'

import {
  createContext,
  type ReactNode,
  useContext,
} from 'react'

import type {
  CurrentUserData,
  CurrentSubscriptionData,
} from '@/lib/dal'

// ============================================================
// Context
// ============================================================

interface AuthContextValue {
  user: CurrentUserData
  subscription: CurrentSubscriptionData
}

const AuthContext =
  createContext<AuthContextValue | null>(null)

// ============================================================
// Provider
// ============================================================

/**
 * Fornece dados de autenticacao e assinatura para todos
 * os Client Components do painel.
 *
 * Hidratado pelo Server Component (panel layout) que
 * busca os dados reais da sessao Supabase.
 */
export function AuthProvider({
  children,
  user,
  subscription,
}: {
  children: ReactNode
  user: CurrentUserData
  subscription: CurrentSubscriptionData
}) {
  return (
    <AuthContext.Provider
      value={{ user, subscription }}
    >
      {children}
    </AuthContext.Provider>
  )
}

// ============================================================
// Hooks
// ============================================================

/**
 * Retorna o usuario logado (dados da sessao).
 * Deve ser usado dentro de AuthProvider.
 */
export function useCurrentUser() {
  const context = useContext(AuthContext)

  if (!context) {
    throw new Error(
      'useCurrentUser deve ser usado dentro de AuthProvider.',
    )
  }

  return context.user
}

/**
 * Retorna a assinatura atual da organizacao.
 * Deve ser usado dentro de AuthProvider.
 */
export function useCurrentSubscription() {
  const context = useContext(AuthContext)

  if (!context) {
    throw new Error(
      'useCurrentSubscription deve ser usado dentro de AuthProvider.',
    )
  }

  return context.subscription
}
