import { createContext, useContext, useEffect, useState, useCallback } from 'react'
import type { ReactNode } from 'react'
import { fetchDolarRates } from '../lib/dolarApi'
import type { DolarRate } from '../lib/dolarApi'

export type DolarSource = 'oficial' | 'cripto'

interface DisplayCurrencyValue {
  mode: 'native' | 'usd'
  source: DolarSource
  rates: { oficial: DolarRate | null; cripto: DolarRate | null }
  updatedAt: string | null
  loading: boolean
  rate: number | null // venta del source elegido, para conversión
  setSource: (s: DolarSource) => void
  toggle: () => void
  refresh: () => void
}

const DisplayCurrencyContext = createContext<DisplayCurrencyValue>({
  mode: 'native',
  source: 'oficial',
  rates: { oficial: null, cripto: null },
  updatedAt: null,
  loading: false,
  rate: null,
  setSource: () => {},
  toggle: () => {},
  refresh: () => {},
})

const MODE_KEY = 'enquegasto:display-currency-mode'
const SOURCE_KEY = 'enquegasto:dolar-source'
const CACHE_KEY = 'enquegasto:dolar-rates-cache'
const CACHE_MS = 10 * 60 * 1000 // 10 minutos

export function DisplayCurrencyProvider({ children }: { children: ReactNode }) {
  const [mode, setMode] = useState<'native' | 'usd'>('native')
  const [source, setSourceState] = useState<DolarSource>('oficial')
  const [rates, setRates] = useState<{ oficial: DolarRate | null; cripto: DolarRate | null }>({
    oficial: null,
    cripto: null,
  })
  const [updatedAt, setUpdatedAt] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const load = useCallback(async (force = false) => {
    if (!force) {
      try {
        const cached = localStorage.getItem(CACHE_KEY)
        if (cached) {
          const parsed = JSON.parse(cached)
          if (Date.now() - parsed.fetchedAt < CACHE_MS) {
            setRates(parsed.rates)
            setUpdatedAt(parsed.updatedAt)
            return
          }
        }
      } catch {
        // caché corrupto, seguimos y pedimos de nuevo
      }
    }
    setLoading(true)
    const fresh = await fetchDolarRates()
    setLoading(false)
    setRates(fresh)
    const now = new Date().toISOString()
    setUpdatedAt(now)
    try {
      localStorage.setItem(
        CACHE_KEY,
        JSON.stringify({ rates: fresh, updatedAt: now, fetchedAt: Date.now() })
      )
    } catch {
      // localStorage lleno o no disponible: no pasa nada
    }
  }, [])

  useEffect(() => {
    const storedMode = localStorage.getItem(MODE_KEY)
    if (storedMode === 'usd') setMode('usd')
    const storedSource = localStorage.getItem(SOURCE_KEY)
    if (storedSource === 'cripto' || storedSource === 'oficial') setSourceState(storedSource)
    load()
  }, [load])

  const setSource = (s: DolarSource) => {
    setSourceState(s)
    localStorage.setItem(SOURCE_KEY, s)
  }

  const toggle = () => {
    setMode((prev) => {
      const next = prev === 'native' ? 'usd' : 'native'
      localStorage.setItem(MODE_KEY, next)
      return next
    })
  }

  const rate = rates[source]?.venta ?? null

  return (
    <DisplayCurrencyContext.Provider
      value={{
        mode,
        source,
        rates,
        updatedAt,
        loading,
        rate,
        setSource,
        toggle,
        refresh: () => load(true),
      }}
    >
      {children}
    </DisplayCurrencyContext.Provider>
  )
}

export function useDisplayCurrency() {
  return useContext(DisplayCurrencyContext)
}
