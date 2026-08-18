import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import type { NatinfRef } from './types'
import { usePersistentState } from './usePersistentState'

export type Tab = 'natinf' | 'vitesse' | 'alcool' | 'pve' | 'about'
export type Theme = 'dark' | 'light'

export interface PendingTransfer {
  natinf: NatinfRef
  note: string
}

interface AppStateShape {
  tab: Tab
  setTab: (t: Tab) => void
  theme: Theme
  toggleTheme: () => void
  pendingTransfer: PendingTransfer | null
  sendToPve: (transfer: PendingTransfer) => void
  clearPendingTransfer: () => void
}

const AppStateContext = createContext<AppStateShape | null>(null)

export function AppStateProvider({ children }: { children: ReactNode }) {
  const [tab, setTab] = usePersistentState<Tab>('gendkit-active-tab', 'natinf')
  const [theme, setTheme] = useState<Theme>(() => (localStorage.getItem('gendkit-theme') as Theme) || 'dark')
  const [pendingTransfer, setPendingTransfer] = useState<PendingTransfer | null>(null)

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
    localStorage.setItem('gendkit-theme', theme)
  }, [theme])

  function toggleTheme() {
    setTheme((t) => (t === 'dark' ? 'light' : 'dark'))
  }

  function sendToPve(transfer: PendingTransfer) {
    setPendingTransfer(transfer)
    setTab('pve')
  }

  function clearPendingTransfer() {
    setPendingTransfer(null)
  }

  return (
    <AppStateContext.Provider value={{ tab, setTab, theme, toggleTheme, pendingTransfer, sendToPve, clearPendingTransfer }}>
      {children}
    </AppStateContext.Provider>
  )
}

export function useAppState(): AppStateShape {
  const ctx = useContext(AppStateContext)
  if (!ctx) throw new Error('useAppState must be used within AppStateProvider')
  return ctx
}
