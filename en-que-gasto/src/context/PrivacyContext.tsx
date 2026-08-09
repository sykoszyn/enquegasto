import { createContext, useContext, useEffect, useState } from 'react'
import type { ReactNode } from 'react'

interface PrivacyContextValue {
  hidden: boolean
  toggle: () => void
}

const PrivacyContext = createContext<PrivacyContextValue>({ hidden: false, toggle: () => {} })

const STORAGE_KEY = 'enquegasto:hide-amounts'

export function PrivacyProvider({ children }: { children: ReactNode }) {
  const [hidden, setHidden] = useState(false)

  useEffect(() => {
    setHidden(localStorage.getItem(STORAGE_KEY) === '1')
  }, [])

  const toggle = () => {
    setHidden((prev) => {
      const next = !prev
      localStorage.setItem(STORAGE_KEY, next ? '1' : '0')
      return next
    })
  }

  return (
    <PrivacyContext.Provider value={{ hidden, toggle }}>{children}</PrivacyContext.Provider>
  )
}

export function usePrivacy() {
  return useContext(PrivacyContext)
}
