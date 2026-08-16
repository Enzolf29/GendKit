import { useState } from 'react'
import { evaluateAlcohol, reinforcedThresholds, specialCases, type AlcoholResult } from '../lib/alcohol'
import { useAppState } from '../lib/AppState'
import { IconArrowRight } from '../components/icons'

export default function AlcoolScreen() {
  const [mesure, setMesure] = useState('')
  const [result, setResult] = useState<AlcoholResult | null>(null)
  const { sendToPve } = useAppState()

  function calculer() {
    const v = Number(mesure)
    if (!v) return
    setResult(evaluateAlcohol(v))
  }

  return (
    <div>
      <div className="card">
        <h2>Éthylomètre</h2>
        <div className="field">
          <label>Valeur mesurée (mg/L d'air expiré)</label>
          <input type="number" step="0.001" inputMode="decimal" value={mesure} onChange={(e) => setMesure(e.target.value)} placeholder="ex. 0.35" />
        </div>
        <button className="btn" onClick={calculer}>
          Calculer
        </button>
      </div>

      {result && (
        <div className="card">
          <div className="result-highlight">
            <div className="big">{result.valeurRetenue.toFixed(3)} mg/L</div>
            <div className="label">valeur retenue</div>
          </div>
          <div className="result-row">
            <span className="muted">Valeur mesurée</span>
            <span className="value">{result.valeurMesuree.toFixed(3)} mg/L</span>
          </div>
          <div className="result-row">
            <span className="muted">Marge appliquée</span>
            <span className="value">− {result.margeAppliquee.toFixed(3)} mg/L</span>
          </div>
          <p className="muted small" style={{ marginTop: '0.3rem' }}>
            {result.margeLabel}
          </p>

          {result.bracket ? (
            <div style={{ marginTop: '0.9rem' }}>
              <span className={`badge ${result.bracket.classe.toLowerCase().includes('délit') ? 'red' : 'amber'}`}>{result.bracket.classe}</span>
              <p style={{ marginTop: '0.5rem', fontSize: '0.88rem' }}>{result.bracket.label}</p>
              <p className="muted small" style={{ marginTop: '0.2rem' }}>
                NATINF {result.bracket.natinf}
              </p>
              <button
                className="btn"
                style={{ marginTop: '0.8rem' }}
                onClick={() =>
                  sendToPve({
                    natinf: { numero: result.bracket!.natinf, qualification: result.bracket!.label },
                    note: `Alcoolémie mesurée : ${result.valeurMesuree.toFixed(3)} mg/L — valeur retenue : ${result.valeurRetenue.toFixed(3)} mg/L (après marge éthylomètre).`,
                  })
                }
              >
                Envoyer vers un PVE <IconArrowRight style={{ width: 18, height: 18 }} />
              </button>
            </div>
          ) : (
            <div className="disclaimer" style={{ marginTop: '0.8rem' }}>
              Valeur retenue inférieure au seuil contraventionnel (0,25 mg/L) : pas d'infraction caractérisée au seuil standard.
            </div>
          )}
        </div>
      )}

      <div className="card">
        <h2>Seuils renforcés (0,10 mg/L)</h2>
        <p className="muted small" style={{ marginBottom: '0.6rem' }}>
          Permis probatoire, apprentissage, transport en commun, véhicule équipé d'un EAD.
        </p>
        {reinforcedThresholds.map((t) => (
          <div className="natinf-chip" key={t.id}>
            <div className="content">
              {t.label} <span className="muted">— NATINF {t.natinf}</span>
            </div>
            {result && result.valeurRetenue >= t.min && (
              <button onClick={() => sendToPve({ natinf: { numero: t.natinf, qualification: t.label }, note: `Alcoolémie retenue ${result.valeurRetenue.toFixed(3)} mg/L, seuil renforcé applicable (${t.label}).` })}>
                <IconArrowRight style={{ width: 16, height: 16 }} />
              </button>
            )}
          </div>
        ))}
      </div>

      <div className="card">
        <h2>Cas particuliers</h2>
        {specialCases.map((c) => (
          <div className="natinf-chip" key={c.id}>
            <div className="content">
              {c.label} <span className="muted">— NATINF {c.natinf}</span>
            </div>
            <button onClick={() => sendToPve({ natinf: { numero: c.natinf, qualification: c.label }, note: '' })}>
              <IconArrowRight style={{ width: 16, height: 16 }} />
            </button>
          </div>
        ))}
      </div>

      <div className="disclaimer">
        Marge éthylomètre (arrêté du 8 juillet 2003, art. 15) : ± 0,032 mg/L sous 0,400 mg/L, ± 8% de 0,400 à 2,000 mg/L, ± 30% au-delà. Barème à vérifier avant usage officiel.
      </div>
    </div>
  )
}
