import { useState } from 'react'
import { evaluateSpeed, recidiveInfo, type Cinemometre, type SpeedResult } from '../lib/speed'
import { getNatinfByNumero } from '../lib/natinf'
import { useAppState } from '../lib/AppState'
import { NatinfDetail } from './NatinfScreen'
import type { NatinfEntry } from '../lib/types'
import { IconArrowRight } from '../components/icons'

export default function VitesseScreen() {
  const [appareil, setAppareil] = useState<Cinemometre>('fixe')
  const [limite, setLimite] = useState('50')
  const [relevee, setRelevee] = useState('')
  const [recidive, setRecidive] = useState(false)
  const [result, setResult] = useState<SpeedResult | null>(null)
  const [detail, setDetail] = useState<NatinfEntry | null>(null)
  const { sendToPve } = useAppState()

  function calculer() {
    const vLimite = Number(limite)
    const vRelevee = Number(relevee)
    if (!vLimite || !vRelevee) return
    setResult(evaluateSpeed(vRelevee, vLimite, appareil))
  }

  const bracket = result?.exces && recidive && result.exces >= recidiveInfo.minExcess ? recidiveInfo : result?.bracket

  return (
    <div>
      <div className="card">
        <h2>Cinémomètre</h2>
        <div className="segmented" style={{ marginBottom: '0.9rem' }}>
          <button className={appareil === 'fixe' ? 'active' : ''} onClick={() => setAppareil('fixe')}>
            Radar fixe
          </button>
          <button className={appareil === 'mobile' ? 'active' : ''} onClick={() => setAppareil('mobile')}>
            Radar mobile / embarqué
          </button>
        </div>

        <div className="field">
          <label>Vitesse maximale autorisée (km/h)</label>
          <input type="number" inputMode="numeric" value={limite} onChange={(e) => setLimite(e.target.value)} />
        </div>
        <div className="field">
          <label>Vitesse relevée par l'appareil (km/h)</label>
          <input type="number" inputMode="numeric" value={relevee} onChange={(e) => setRelevee(e.target.value)} placeholder="ex. 78" />
        </div>
        <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', marginBottom: '0.9rem' }}>
          <input type="checkbox" checked={recidive} onChange={(e) => setRecidive(e.target.checked)} />
          Récidive légale (délit ≥ 50 km/h)
        </label>
        <button className="btn" onClick={calculer}>
          Calculer
        </button>
      </div>

      {result && (
        <div className="card">
          <div className="result-highlight">
            <div className="big">{result.vitesseRetenue} km/h</div>
            <div className="label">vitesse retenue (excès de {result.exces} km/h)</div>
          </div>
          <div className="result-row">
            <span className="muted">Vitesse relevée</span>
            <span className="value">{result.vitesseRelevee} km/h</span>
          </div>
          <div className="result-row">
            <span className="muted">Marge appliquée</span>
            <span className="value">− {result.margeAppliquee} km/h</span>
          </div>
          <div className="result-row">
            <span className="muted">Vitesse limite</span>
            <span className="value">{result.vitesseLimite} km/h</span>
          </div>

          {bracket ? (
            <div style={{ marginTop: '0.9rem' }}>
              <span className={`badge ${bracket.classe.toLowerCase().includes('délit') ? 'red' : 'amber'}`}>{bracket.classe}</span>
              <p style={{ marginTop: '0.5rem', fontSize: '0.88rem' }}>{bracket.label}</p>
              <button
                className="btn secondary"
                style={{ marginTop: '0.7rem' }}
                onClick={() => setDetail(getNatinfByNumero(bracket.natinf) ?? null)}
              >
                Voir la fiche NATINF {bracket.natinf}
              </button>
              <button
                className="btn"
                style={{ marginTop: '0.6rem' }}
                onClick={() =>
                  sendToPve({
                    natinf: { numero: bracket.natinf, qualification: bracket.label },
                    note: `Vitesse relevée : ${result.vitesseRelevee} km/h — vitesse retenue : ${result.vitesseRetenue} km/h (limite ${result.vitesseLimite} km/h, excès ${result.exces} km/h, appareil ${appareil === 'fixe' ? 'radar fixe' : 'radar mobile/embarqué'}).`,
                  })
                }
              >
                Envoyer vers un PVE <IconArrowRight style={{ width: 18, height: 18 }} />
              </button>
            </div>
          ) : (
            <div className="disclaimer" style={{ marginTop: '0.8rem' }}>
              Pas d'excès retenu après application de la marge : aucune infraction de vitesse caractérisée.
            </div>
          )}
        </div>
      )}

      <div className="disclaimer">
        Marges réglementaires : radar fixe = 5 km/h (&lt;100 km/h) ou 5% au-delà ; radar mobile/embarqué = 10 km/h ou 10% au-delà. Barème de classification à vérifier avant usage officiel, les textes pouvant évoluer.
      </div>

      {detail && <NatinfDetail entry={detail} onClose={() => setDetail(null)} />}
    </div>
  )
}
