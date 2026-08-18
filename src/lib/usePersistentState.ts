import { useEffect, useState } from 'react'

/**
 * useState synchronisé avec localStorage. Permet de retrouver un état
 * (recherche, filtres, onglet actif...) tel quel après que le téléphone ait
 * déchargé puis rechargé la page en arrière-plan (fréquent sur mobile),
 * plutôt que de repartir à zéro.
 */
export function usePersistentState<T>(key: string, initial: T): [T, (value: T) => void] {
  const [state, setState] = useState<T>(() => {
    try {
      const raw = localStorage.getItem(key)
      return raw !== null ? (JSON.parse(raw) as T) : initial
    } catch {
      return initial
    }
  })

  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(state))
    } catch {
      // stockage indisponible (navigation privée, quota) : on ignore
    }
  }, [key, state])

  return [state, setState]
}
