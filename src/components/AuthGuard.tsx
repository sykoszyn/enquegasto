import { useEffect, useState } from 'react'
import type { ReactNode } from 'react'
import { Navigate } from 'react-router-dom'
import type { Session } from '@supabase/supabase-js'
import { supabase } from '../lib/supabaseClient'

export default function AuthGuard({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null | undefined>(undefined)

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSession(data.session))
    const { data: sub } = supabase.auth.onAuthStateChange((_event, sess) => {
      setSession(sess)
    })
    return () => sub.subscription.unsubscribe()
  }, [])

  if (session === undefined) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-bg text-white/40 text-sm">
        Cargando…
      </div>
    )
  }

  if (!session) {
    return <Navigate to="/login" replace />
  }

  return <>{children}</>
}
