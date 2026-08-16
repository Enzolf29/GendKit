import { useMemo, useState } from 'react'
import { searchNatinf } from '../lib/natinf'
import { useModalBackButton } from '../lib/useModalBackButton'
import type { NatinfEntry } from '../lib/types'
import { IconSearch, IconX } from './icons'

export default function NatinfPicker({ onPick, onClose }: { onPick: (entry: NatinfEntry) => void; onClose: () => void }) {
  const [query, setQuery] = useState('')
  const results = useMemo(() => searchNatinf(query, { limit: 80 }), [query])
  useModalBackButton(onClose)

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-sheet" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Lier un NATINF</h2>
          <button className="icon-btn" onClick={onClose}>
            <IconX />
          </button>
        </div>
        <div className="field" style={{ position: 'relative' }}>
          <IconSearch className="muted" style={{ position: 'absolute', left: '0.75rem', top: '0.7rem', width: 18, height: 18 }} />
          <input
            autoFocus
            type="search"
            placeholder="Mot-clé ou numéro NATINF..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            style={{ paddingLeft: '2.2rem' }}
          />
        </div>
        {!query && <div className="empty-state">Commencez à taper pour rechercher.</div>}
        {query && results.length === 0 && <div className="empty-state">Aucun résultat.</div>}
        {results.map((entry) => (
          <div
            className="list-item"
            key={entry.numero}
            onClick={() => {
              onPick(entry)
              onClose()
            }}
          >
            <div className="content">
              <span className="num">NATINF {entry.numero}</span>
              <div className="qualif">{entry.qualification}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
