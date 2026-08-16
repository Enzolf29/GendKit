import { useMemo, useState } from 'react'
import { searchNatinf, getAllNatures, natinfMeta } from '../lib/natinf'
import { getPointsForNatinf } from '../lib/points'
import { getAmendeForNature } from '../lib/amendes'
import type { NatinfEntry } from '../lib/types'
import { useAppState } from '../lib/AppState'
import { IconSearch, IconX, IconArrowRight } from '../components/icons'

function natureBadgeClass(nature: string): string {
  if (nature === 'Crime' || nature.startsWith('Délit')) return 'red'
  if (nature.startsWith('Contravention de classe 5') || nature.startsWith('Contravention de classe 4')) return 'amber'
  return 'blue'
}

export default function NatinfScreen() {
  const [query, setQuery] = useState('')
  const [nature, setNature] = useState('')
  const [selected, setSelected] = useState<NatinfEntry | null>(null)
  const natures = useMemo(() => getAllNatures(), [])
  const results = useMemo(() => searchNatinf(query, { nature: nature || undefined }), [query, nature])

  return (
    <div>
      <div className="card">
        <div className="field" style={{ marginBottom: '0.6rem' }}>
          <div style={{ position: 'relative' }}>
            <IconSearch className="muted" style={{ position: 'absolute', left: '0.75rem', top: '0.7rem', width: 18, height: 18 }} />
            <input
              type="search"
              placeholder="Rechercher : mot-clé, n° NATINF, article..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              style={{ paddingLeft: '2.2rem' }}
            />
          </div>
        </div>
        <select value={nature} onChange={(e) => setNature(e.target.value)} style={{ width: '100%', background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: 10, padding: '0.55rem 0.7rem', color: 'var(--text)' }}>
          <option value="">Toutes les natures d'infraction</option>
          {natures.map((n) => (
            <option key={n} value={n}>
              {n}
            </option>
          ))}
        </select>
      </div>

      {!query && !nature && (
        <div className="empty-state">
          Tapez un mot-clé (ex. "stationnement", "alcool") ou un numéro NATINF.
          <br />
          <span className="small">{natinfMeta.count.toLocaleString('fr-FR')} infractions en base, dataset {natinfMeta.sourceTitle}</span>
        </div>
      )}

      {(query || nature) && results.length === 0 && <div className="empty-state">Aucun résultat.</div>}

      {results.length > 0 && (
        <div className="card">
          {results.map((entry) => (
            <div className="list-item" key={entry.numero} onClick={() => setSelected(entry)}>
              <div className="content">
                <span className="num">NATINF {entry.numero}</span>{' '}
                <span className={`badge ${natureBadgeClass(entry.nature)}`}>{entry.nature}</span>
                <div className="qualif">{entry.qualification}</div>
              </div>
            </div>
          ))}
        </div>
      )}

      {selected && <NatinfDetail entry={selected} onClose={() => setSelected(null)} />}
    </div>
  )
}

function NatinfDetail({ entry, onClose }: { entry: NatinfEntry; onClose: () => void }) {
  const { sendToPve } = useAppState()
  const pointsInfo = getPointsForNatinf(entry.numero)
  const amende = getAmendeForNature(entry.nature)
  const isContravention = entry.nature.startsWith('Contravention')

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-sheet" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>NATINF {entry.numero}</h2>
          <button className="icon-btn" onClick={onClose}>
            <IconX />
          </button>
        </div>
        <span className={`badge ${natureBadgeClass(entry.nature)}`}>{entry.nature}</span>{' '}
        {pointsInfo && (
          <span className="badge red">{pointsInfo.points === 'annulation' ? 'Annulation du permis' : `− ${pointsInfo.points} point${pointsInfo.points > 1 ? 's' : ''}`}</span>
        )}
        <p style={{ marginTop: '0.7rem', lineHeight: 1.5 }}>{entry.qualification}</p>

        {pointsInfo && (
          <div className="disclaimer" style={{ marginTop: '0.7rem' }}>
            Retrait de permis à points : {pointsInfo.categorie}. Barème officiel (sécurité routière), à vérifier avant usage officiel.
          </div>
        )}

        <div className="card" style={{ marginTop: '1rem' }}>
          <h2>Articles définissant l'infraction</h2>
          <p className="small">{entry.definiePar}</p>
        </div>
        <div className="card">
          <h2>Peines encourues</h2>
          <p className="small">{entry.reprimeePar}</p>
        </div>

        {isContravention && amende && (
          <div className="card">
            <h2>Montant de l'amende</h2>
            {'note' in amende ? (
              <p className="small">{amende.note}</p>
            ) : (
              <>
                <div className="result-row">
                  <span className="muted">Minorée</span>
                  <span className="value">{amende.minoree !== null ? `${amende.minoree} €` : '—'}</span>
                </div>
                <div className="result-row">
                  <span className="muted">Forfaitaire</span>
                  <span className="value">{amende.forfaitaire} €</span>
                </div>
                <div className="result-row">
                  <span className="muted">Majorée</span>
                  <span className="value">{amende.majoree} €</span>
                </div>
              </>
            )}
          </div>
        )}

        <div className="card">
          <h2>Dépistage alcool / stupéfiants</h2>
          {pointsInfo?.suspensionPermis ? (
            <p className="small" style={{ marginBottom: '0.6rem' }}>
              <span className="badge red">Alcool obligatoire</span> — cette infraction est punie de la suspension du permis de conduire : le dépistage d'alcoolémie est obligatoire (art. L234-3 C.route), que l'état du conducteur soit apparent ou non.
            </p>
          ) : (
            <p className="small" style={{ marginBottom: '0.6rem' }}>
              Non établi pour cette infraction précise — le dépistage d'alcoolémie reste possible à tout moment à l'initiative de l'agent (art. L234-9 C.route), et devient obligatoire si l'infraction est punie de la suspension du permis ou en cas d'accident corporel.
            </p>
          )}
          <p className="small muted">
            Stupéfiants : dépistage obligatoire uniquement en cas d'accident mortel ou corporel (art. L235-2 C.route) ; en dehors de ce cas, il reste à l'appréciation de l'agent.
          </p>
        </div>

        <button
          className="btn"
          onClick={() => {
            sendToPve({ natinf: { numero: entry.numero, qualification: entry.qualification }, note: '' })
            onClose()
          }}
        >
          Utiliser pour un PVE <IconArrowRight style={{ width: 18, height: 18 }} />
        </button>
      </div>
    </div>
  )
}
