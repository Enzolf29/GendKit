import { natinfMeta } from '../lib/natinf'
import { useAppState } from '../lib/AppState'
import logo from '../assets/logo.png'
import { IconSun, IconMoon } from '../components/icons'

export default function AboutScreen() {
  const { theme, toggleTheme } = useAppState()

  return (
    <div>
      <div className="card" style={{ textAlign: 'center' }}>
        <img src={logo} alt="GendKit" style={{ width: 80, height: 80, borderRadius: 16, marginBottom: '0.8rem' }} />
        <h2 style={{ fontSize: '1.2rem' }}>GendKit</h2>
        <p className="muted small">La boîte à outils du gendarme</p>
        <p className="muted small" style={{ marginTop: '0.4rem' }}>
          Version {__APP_VERSION__}
        </p>
      </div>

      <div className="card">
        <h2>Apparence</h2>
        <button className="btn secondary" onClick={toggleTheme}>
          {theme === 'dark' ? <IconSun style={{ width: 18, height: 18 }} /> : <IconMoon style={{ width: 18, height: 18 }} />}
          Passer en mode {theme === 'dark' ? 'clair' : 'sombre'}
        </button>
      </div>

      <div className="card">
        <h2>Dataset NATINF</h2>
        <div className="result-row">
          <span className="muted">Source</span>
          <span>{natinfMeta.sourceTitle}</span>
        </div>
        <div className="result-row">
          <span className="muted">Infractions en base</span>
          <span>{natinfMeta.count.toLocaleString('fr-FR')}</span>
        </div>
        <div className="result-row">
          <span className="muted">Généré le</span>
          <span>{new Date(natinfMeta.generatedAt).toLocaleDateString('fr-FR')}</span>
        </div>
        <p className="muted small" style={{ marginTop: '0.6rem' }}>
          Nomenclature officielle du Ministère de la Justice, mise à jour trimestriellement. Le dataset est embarqué dans l'application et fonctionne hors-ligne.
        </p>
      </div>

      <div className="disclaimer">
        Les calculs (vitesse, alcoolémie) et les correspondances NATINF sont fournis à titre d'aide-mémoire. Vérifiez toujours les textes en vigueur avant rédaction d'un procès-verbal officiel : les barèmes et seuils peuvent évoluer.
      </div>
    </div>
  )
}
