import { Link, useLocation } from 'react-router-dom'
import type { ReactNode } from 'react'
import { Home, CreditCard, PiggyBank, Settings as SettingsIcon, LogOut } from 'lucide-react'
import { supabase } from '../lib/supabaseClient'

const TABS = [
  { to: '/app', label: 'Resumen', icon: Home },
  { to: '/app/tarjetas', label: 'Tarjetas', icon: CreditCard },
  { to: '/app/ahorros', label: 'Ahorros', icon: PiggyBank },
  { to: '/app/configuracion', label: 'Ajustes', icon: SettingsIcon },
]

export default function AppShell({ children }: { children: ReactNode }) {
  const { pathname } = useLocation()

  const signOut = async () => {
    await supabase.auth.signOut()
    window.location.href = '/'
  }

  return (
    <div className="min-h-screen bg-bg text-white">
      <header className="sticky top-0 z-30 border-b border-bg-border/60 bg-bg/80 backdrop-blur-lg">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-5 py-4">
          <Link to="/app" className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-brand text-sm font-extrabold text-bg">
              $
            </span>
            <span className="text-sm font-bold tracking-tight">En qué gasto?</span>
          </Link>

          <nav className="hidden items-center gap-1 sm:flex">
            {TABS.map((t) => {
              const active = pathname === t.to
              const Icon = t.icon
              return (
                <Link
                  key={t.to}
                  to={t.to}
                  className={`flex items-center gap-2 rounded-xl px-3.5 py-2 text-sm font-medium transition ${
                    active
                      ? 'bg-bg-raised text-white'
                      : 'text-muted hover:text-white'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {t.label}
                </Link>
              )
            })}
          </nav>

          <button
            onClick={signOut}
            className="flex items-center gap-1.5 rounded-xl px-3 py-2 text-sm font-medium text-muted transition hover:text-gasto"
          >
            <LogOut className="h-4 w-4" />
            <span className="hidden sm:inline">Salir</span>
          </button>
        </div>
      </header>

      <div className="pb-24 sm:pb-8">{children}</div>

      {/* mobile bottom tab bar */}
      <nav className="fixed bottom-0 left-0 right-0 z-30 border-t border-bg-border/60 bg-bg/90 backdrop-blur-lg sm:hidden">
        <div className="mx-auto flex max-w-5xl items-center justify-around px-2 py-2">
          {TABS.map((t) => {
            const active = pathname === t.to
            const Icon = t.icon
            return (
              <Link
                key={t.to}
                to={t.to}
                className={`flex flex-col items-center gap-1 rounded-xl px-4 py-1.5 text-[11px] font-medium transition ${
                  active ? 'text-brand' : 'text-muted'
                }`}
              >
                <Icon className="h-5 w-5" />
                {t.label}
              </Link>
            )
          })}
        </div>
      </nav>
    </div>
  )
}
