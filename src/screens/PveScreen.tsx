import { useEffect, useRef, useState } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '../lib/db'
import { createDraft, deleteDraft } from '../lib/pve'
import { useAppState, type PendingTransfer } from '../lib/AppState'
import PveEditor from './PveEditor'
import { IconPlus, IconMapPin, IconTrash } from '../components/icons'

export default function PveScreen() {
  const drafts = useLiveQuery(() => db.pveDrafts.orderBy('updatedAt').reverse().toArray())
  const [openId, setOpenId] = useState<number | null>(null)
  const { pendingTransfer, clearPendingTransfer } = useAppState()
  const processedTransfer = useRef<PendingTransfer | null>(null)

  useEffect(() => {
    if (!pendingTransfer || processedTransfer.current === pendingTransfer) return
    processedTransfer.current = pendingTransfer
    ;(async () => {
      const id = await createDraft({
        natinfs: [pendingTransfer.natinf],
        observations: pendingTransfer.note,
      })
      setOpenId(id)
      clearPendingTransfer()
    })()
  }, [pendingTransfer, clearPendingTransfer])

  async function nouveauPve() {
    const id = await createDraft()
    setOpenId(id)
  }

  async function supprimer(e: React.MouseEvent, id: number) {
    e.stopPropagation()
    if (!confirm('Supprimer ce brouillon de PVE et ses photos ?')) return
    await deleteDraft(id)
  }

  return (
    <div>
      <button className="btn" onClick={nouveauPve} style={{ marginBottom: '1rem' }}>
        <IconPlus style={{ width: 18, height: 18 }} /> Nouveau PVE
      </button>

      {drafts && drafts.length === 0 && <div className="empty-state">Aucun brouillon de PVE. Créez-en un pour commencer, ou envoyez un résultat depuis Vitesse / Alcool / NATINF.</div>}

      {drafts && drafts.length > 0 && (
        <div className="card">
          {drafts.map((d) => (
            <div className="list-item" key={d.id}>
              <div className="content" onClick={() => setOpenId(d.id!)}>
                <span className="num">{d.immatriculation || 'Sans plaque'}</span>{' '}
                {d.natinfs.length > 0 && <span className="badge blue">{d.natinfs.length} NATINF</span>}
                {d.lieu && (
                  <span className="badge">
                    <IconMapPin style={{ width: 10, height: 10, display: 'inline', verticalAlign: '-1px' }} /> localisé
                  </span>
                )}
                <div className="qualif muted">{d.observations || 'Pas d\'observations'}</div>
                <div className="small muted" style={{ marginTop: '0.2rem' }}>
                  Modifié le {new Date(d.updatedAt).toLocaleString('fr-FR')}
                </div>
              </div>
              <button className="delete-btn" onClick={(e) => supprimer(e, d.id!)} aria-label="Supprimer">
                <IconTrash style={{ width: 17, height: 17 }} />
              </button>
            </div>
          ))}
        </div>
      )}

      {openId !== null && <PveEditor draftId={openId} onClose={() => setOpenId(null)} />}
    </div>
  )
}
