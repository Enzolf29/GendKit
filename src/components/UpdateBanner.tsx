import { useRegisterSW } from 'virtual:pwa-register/react'

export default function UpdateBanner() {
  const { needRefresh, updateServiceWorker } = useRegisterSW({
    onRegisteredSW(_url, registration) {
      registration?.update()
    },
  })

  if (!needRefresh[0]) return null

  return (
    <div className="update-banner">
      <span>Une nouvelle version de GendKit est disponible.</span>
      <button onClick={() => updateServiceWorker(true)}>Mettre à jour</button>
    </div>
  )
}
