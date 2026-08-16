import { useEffect, useState } from 'react'
import { AppStateProvider, useAppState, type Tab } from './lib/AppState'
import { loadNatinfDataset } from './lib/natinf'
import NatinfScreen from './screens/NatinfScreen'
import VitesseScreen from './screens/VitesseScreen'
import AlcoolScreen from './screens/AlcoolScreen'
import PveScreen from './screens/PveScreen'
import AboutScreen from './screens/AboutScreen'
import UpdateBanner from './components/UpdateBanner'
import logo from './assets/logo.png'
import { IconScale, IconGauge, IconDroplet, IconClipboard, IconInfo } from './components/icons'

const tabs: { id: Tab; label: string; icon: typeof IconScale }[] = [
  { id: 'natinf', label: 'NATINF', icon: IconScale },
  { id: 'vitesse', label: 'Vitesse', icon: IconGauge },
  { id: 'alcool', label: 'Alcool', icon: IconDroplet },
  { id: 'pve', label: 'PVE', icon: IconClipboard },
  { id: 'about', label: 'À propos', icon: IconInfo },
]

const titles: Record<Tab, string> = {
  natinf: 'NATINF',
  vitesse: 'Vitesse',
  alcool: 'Alcool',
  pve: 'PVE',
  about: 'À propos',
}

function Shell() {
  const { tab, setTab } = useAppState()

  return (
    <div className="app-shell">
      <UpdateBanner />
      <nav className="bottom-nav">
        <div className="brand">
          <img src={logo} alt="GendKit" />
          <div>
            <div className="title">GendKit</div>
            <div className="subtitle">Boîte à outils</div>
          </div>
        </div>
        {tabs.map(({ id, label, icon: Icon }) => (
          <button key={id} className={tab === id ? 'active' : ''} onClick={() => setTab(id)}>
            <Icon />
            {label}
          </button>
        ))}
      </nav>

      <div className="app-content" style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        <header className="app-header">
          <img src={logo} alt="GendKit" />
          <div>
            <div className="title">{titles[tab]}</div>
            <div className="subtitle">GendKit</div>
          </div>
        </header>
        <main className="app-main">
          {tab === 'natinf' && <NatinfScreen />}
          {tab === 'vitesse' && <VitesseScreen />}
          {tab === 'alcool' && <AlcoolScreen />}
          {tab === 'pve' && <PveScreen />}
          {tab === 'about' && <AboutScreen />}
        </main>
      </div>
    </div>
  )
}

function SplashScreen() {
  return (
    <div style={{ height: '100dvh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '1rem', background: 'var(--bg)', color: 'var(--text)' }}>
      <img src={logo} alt="GendKit" style={{ width: 96, height: 96, borderRadius: 20 }} />
      <p className="muted">Chargement de la base NATINF...</p>
    </div>
  )
}

export default function App() {
  const [ready, setReady] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadNatinfDataset()
      .then(() => setReady(true))
      .catch((err) => setError(err instanceof Error ? err.message : 'Erreur de chargement'))
  }, [])

  if (error) {
    return (
      <div style={{ height: '100dvh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem', textAlign: 'center' }}>
        <p>{error}<br />Vérifiez votre connexion lors du premier lancement.</p>
      </div>
    )
  }

  if (!ready) return <SplashScreen />

  return (
    <AppStateProvider>
      <Shell />
    </AppStateProvider>
  )
}
