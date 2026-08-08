import { useCallback, useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'
import type { Account, Category, Household } from '../types'
import AppShell from '../components/AppShell'
import CategoryManager from '../components/CategoryManager'
import AccountManager from '../components/AccountManager'
import HouseholdManager from '../components/HouseholdManager'

export default function Settings() {
  const [categories, setCategories] = useState<Category[]>([])
  const [accounts, setAccounts] = useState<Account[]>([])
  const [households, setHouseholds] = useState<Household[]>([])
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) return
    const [{ data: cat }, { data: acc }, { data: hs }] = await Promise.all([
      supabase.from('categories').select('*').eq('user_id', user.id).order('name'),
      supabase.from('accounts').select('*').order('created_at'),
      supabase.from('households').select('*').order('created_at'),
    ])
    setCategories(cat ?? [])
    setAccounts(acc ?? [])
    setHouseholds(hs ?? [])
    setLoading(false)
  }, [])

  useEffect(() => {
    load()
  }, [load])

  return (
    <AppShell>
      <main className="mx-auto max-w-5xl px-6 py-8">
        <h1 className="text-2xl font-extrabold text-white">Ajustes</h1>
        <p className="mt-1 text-sm text-white/40">
          Categorías, cuentas y con quién compartís tus gastos.
        </p>

        {loading ? (
          <p className="mt-8 text-sm text-white/40">Cargando…</p>
        ) : (
          <div className="mt-6 space-y-6">
            <HouseholdManager />
            <div className="grid gap-6 md:grid-cols-2">
              <CategoryManager categories={categories} onChange={load} />
              <AccountManager accounts={accounts} households={households} onChange={load} />
            </div>
          </div>
        )}
      </main>
    </AppShell>
  )
}
