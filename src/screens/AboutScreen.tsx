import { natinfMeta } from '../lib/natinf'
import { useAppState } from '../lib/AppState'
import logo from '../assets/logo.png'
import { IconSun, IconMoon } from '../components/icons'
import releases from '../data/releases.json'
import { pointsUpdatedAt } from '../lib/points'

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

      <section className="card" aria-labelledby="release-history-title">
        <h2 id="release-history-title">Historique des mises à jour</h2>
        <p className="small muted">Les dernières nouveautés, disponibles aussi hors connexion.</p>
        {releases.map((release, index) => (
          <details key={release.version} className="release-entry" open={index === 0}>
            <summary>
              <span>Version {release.version}{release.version === __APP_VERSION__ ? ' · installée' : ''}</span>
              <time dateTime={release.date}>{new Date(`${release.date}T12:00:00`).toLocaleDateString('fr-FR')}</time>
            </summary>
            <h3>{release.title}</h3>
            <ul>{release.changes.map((change) => <li key={change}>{change}</li>)}</ul>
          </details>
        ))}
        <a className="small" href="https://github.com/Enzolf29/GendKit/blob/main/CHANGELOG.md" target="_blank" rel="noreferrer">Journal complet sur GitHub (connexion nécessaire)</a>
      </section>

      <div className="card">
        <h2>Barème de points</h2>
        <p className="small">Dernière mise à jour : {new Date(`${pointsUpdatedAt}T12:00:00`).toLocaleDateString('fr-FR')}.</p>
        <p className="small muted">Référentiel ONISR complété par les textes officiels. La couverture reste partielle : une fiche non renseignée ne signifie pas zéro point.</p>
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
