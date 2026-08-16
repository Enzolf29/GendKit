import { useState } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '../lib/db'
import { updateDraft, deleteDraft, addNatinfToDraft, removeNatinfFromDraft, setDraftLocation, addPhoto, deletePhoto } from '../lib/pve'
import { getCurrentLocation, reverseGeocode } from '../lib/geolocation'
import { exportDraftToPdf } from '../lib/pveExport'
import NatinfPicker from '../components/NatinfPicker'
import { IconMapPin, IconCamera, IconTrash, IconDownload, IconX, IconCheck } from '../components/icons'

export default function PveEditor({ draftId, onClose }: { draftId: number; onClose: () => void }) {
  const draft = useLiveQuery(() => db.pveDrafts.get(draftId), [draftId])
  const photos = useLiveQuery(() => db.pvePhotos.where('draftId').equals(draftId).toArray(), [draftId])
  const [showPicker, setShowPicker] = useState(false)
  const [locating, setLocating] = useState(false)
  const [locError, setLocError] = useState<string | null>(null)

  if (!draft) return null

  async function localiser() {
    setLocating(true)
    setLocError(null)
    try {
      const lieu = await getCurrentLocation()
      const adresse = await reverseGeocode(lieu.lat, lieu.lng)
      await setDraftLocation(draftId, { ...lieu, adresse: adresse ?? undefined })
    } catch (err) {
      setLocError(err instanceof Error ? err.message : 'Erreur de géolocalisation')
    } finally {
      setLocating(false)
    }
  }

  async function onPhotoSelected(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files
    if (!files) return
    for (const file of Array.from(files)) {
      await addPhoto(draftId, file, file.name)
    }
    e.target.value = ''
  }

  async function handleDelete() {
    if (!confirm('Supprimer ce brouillon de PVE et ses photos ?')) return
    await deleteDraft(draftId)
    onClose()
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-sheet with-footer" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 640 }}>
        <div className="modal-header">
          <h2>PVE {draft.immatriculation || 'sans plaque'}</h2>
          <button className="icon-btn" onClick={onClose}>
            <IconX />
          </button>
        </div>

        <div className="modal-scroll">
        <div className="field">
          <label>Immatriculation</label>
          <input
            type="text"
            value={draft.immatriculation}
            onChange={(e) => updateDraft(draftId, { immatriculation: e.target.value.toUpperCase() })}
            style={{ textTransform: 'uppercase' }}
            placeholder="AA-123-AA"
          />
        </div>

        <div className="field">
          <label>Lieu</label>
          {draft.lieu ? (
            <div className="disclaimer" style={{ marginBottom: '0.5rem' }}>
              {draft.lieu.adresse || `${draft.lieu.lat.toFixed(5)}, ${draft.lieu.lng.toFixed(5)}`}
              <br />
              <span className="muted">précision ± {Math.round(draft.lieu.accuracy)} m — {new Date(draft.lieu.capturedAt).toLocaleTimeString('fr-FR')}</span>
            </div>
          ) : (
            <div className="empty-state" style={{ padding: '0.8rem' }}>
              Aucune position enregistrée
            </div>
          )}
          <button className="btn secondary" onClick={localiser} disabled={locating}>
            <IconMapPin style={{ width: 18, height: 18 }} /> {locating ? 'Localisation...' : 'Localiser ma position'}
          </button>
          {locError && <p className="small" style={{ color: 'var(--red)', marginTop: '0.4rem' }}>{locError}</p>}
        </div>

        <div className="field">
          <label>NATINF liés</label>
          {draft.natinfs.length === 0 && <p className="muted small">Aucun NATINF lié pour l'instant.</p>}
          {draft.natinfs.map((n) => (
            <div className="natinf-chip" key={n.numero}>
              <div className="content">
                <strong>NATINF {n.numero}</strong>
                <div className="muted">{n.qualification}</div>
              </div>
              <button onClick={() => removeNatinfFromDraft(draftId, n.numero)}>
                <IconTrash style={{ width: 16, height: 16 }} />
              </button>
            </div>
          ))}
          <button className="btn secondary" onClick={() => setShowPicker(true)}>
            + Ajouter un NATINF
          </button>
        </div>

        <div className="field">
          <label>Observations</label>
          <textarea value={draft.observations} onChange={(e) => updateDraft(draftId, { observations: e.target.value })} placeholder="Circonstances, déclarations, éléments à ne pas oublier..." />
        </div>

        <div className="field">
          <label>Photos</label>
          <div className="photo-grid">
            {photos?.map((p) => (
              <div className="photo" key={p.id}>
                <img src={URL.createObjectURL(p.blob)} alt={p.name} />
                <button onClick={() => deletePhoto(p.id!)}>
                  <IconX style={{ width: 12, height: 12 }} />
                </button>
              </div>
            ))}
            <label className="add-photo">
              <IconCamera style={{ width: 24, height: 24 }} />
              <input type="file" accept="image/*" capture="environment" multiple onChange={onPhotoSelected} style={{ display: 'none' }} />
            </label>
          </div>
        </div>

        <button className="btn" onClick={() => exportDraftToPdf(draft, photos ?? [])}>
          <IconDownload style={{ width: 18, height: 18 }} /> Exporter en PDF (aide-mémoire)
        </button>
        <button className="btn danger" style={{ marginTop: '0.6rem' }} onClick={handleDelete}>
          Supprimer ce brouillon
        </button>
        </div>

        <div className="modal-footer">
          <button className="btn" onClick={onClose}>
            <IconCheck style={{ width: 18, height: 18 }} /> Enregistrer
          </button>
        </div>

        {showPicker && (
          <NatinfPicker
            onPick={(entry) => addNatinfToDraft(draftId, { numero: entry.numero, qualification: entry.qualification })}
            onClose={() => setShowPicker(false)}
          />
        )}
      </div>
    </div>
  )
}
