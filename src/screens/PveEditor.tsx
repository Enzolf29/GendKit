import { useEffect, useState } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '../lib/db'
import { updateDraft, deleteDraft, addNatinfToDraft, removeNatinfFromDraft, setDraftLocation, addPhoto, deletePhoto } from '../lib/pve'
import { getCurrentLocation, reverseGeocode, describeGeolocationError, getGeolocationPermissionState } from '../lib/geolocation'
import { recognizePlate } from '../lib/plateOcr'
import { exportDraftToPdf } from '../lib/pveExport'
import NatinfPicker from '../components/NatinfPicker'
import { useModalBackButton } from '../lib/useModalBackButton'
import { IconMapPin, IconCamera, IconImage, IconTrash, IconDownload, IconX, IconCheck } from '../components/icons'

export default function PveEditor({ draftId, onClose }: { draftId: number; onClose: () => void }) {
  const draft = useLiveQuery(() => db.pveDrafts.get(draftId), [draftId])
  const photos = useLiveQuery(() => db.pvePhotos.where('draftId').equals(draftId).toArray(), [draftId])
  const [showPicker, setShowPicker] = useState(false)
  const [locating, setLocating] = useState(false)
  const [locError, setLocError] = useState<string | null>(null)
  const [showManualLoc, setShowManualLoc] = useState(false)
  const [manualAddress, setManualAddress] = useState('')
  const [scanning, setScanning] = useState(false)
  const [scanError, setScanError] = useState<string | null>(null)
  const [permDenied, setPermDenied] = useState(false)
  const [enlargedPhotoId, setEnlargedPhotoId] = useState<number | null>(null)

  useModalBackButton(onClose)

  useEffect(() => {
    getGeolocationPermissionState().then((state) => setPermDenied(state === 'denied'))
  }, [])

  if (!draft) return null

  async function localiser() {
    setLocating(true)
    setLocError(null)
    try {
      const lieu = await getCurrentLocation()
      const adresse = await reverseGeocode(lieu.lat!, lieu.lng!)
      await setDraftLocation(draftId, { ...lieu, adresse: adresse ?? undefined })
      setShowManualLoc(false)
      setPermDenied(false)
    } catch (err) {
      setLocError(describeGeolocationError(err))
      getGeolocationPermissionState().then((state) => setPermDenied(state === 'denied'))
    } finally {
      setLocating(false)
    }
  }

  async function saveManualLocation() {
    const adresse = manualAddress.trim()
    if (!adresse) return
    await setDraftLocation(draftId, { adresse, capturedAt: new Date().toISOString(), manuel: true })
    setManualAddress('')
    setShowManualLoc(false)
  }

  async function onPhotoSelected(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files
    if (!files) return
    for (const file of Array.from(files)) {
      await addPhoto(draftId, file, file.name)
      // Lecture de plaque en arrière-plan : ne remplit le champ que s'il est
      // encore vide au moment où l'OCR se termine (pas d'écrasement d'une
      // saisie manuelle entre-temps).
      const before = await db.pveDrafts.get(draftId)
      if (before && !before.immatriculation) {
        // Remplissage automatique et silencieux : seuil de confiance élevé
        // pour éviter d'inscrire une fausse plaque à partir d'une photo qui
        // ne montre pas forcément la plaque (véhicule entier, galerie...).
        recognizePlate(file, { minConfidence: 65 })
          .then(async (plate) => {
            if (!plate) return
            const current = await db.pveDrafts.get(draftId)
            if (current && !current.immatriculation) {
              await updateDraft(draftId, { immatriculation: plate })
            }
          })
          .catch(() => {})
      }
    }
    e.target.value = ''
  }

  async function onScanPlate(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return
    setScanning(true)
    setScanError(null)
    try {
      // Action volontaire (bouton dédié) : seuil plus bas, l'utilisateur
      // vérifie le résultat et peut réessayer si besoin.
      const plate = await recognizePlate(file, { minConfidence: 35 })
      if (plate) {
        await updateDraft(draftId, { immatriculation: plate })
      } else {
        setScanError('Plaque non détectée, réessayez ou saisissez-la manuellement.')
      }
    } catch {
      setScanError('Erreur de lecture, réessayez.')
    } finally {
      setScanning(false)
    }
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
        <div style={{ display: 'flex', gap: '0.7rem' }}>
          <div className="field" style={{ flex: 2 }}>
            <label>Immatriculation</label>
            <div style={{ display: 'flex', gap: '0.4rem' }}>
              <input
                type="text"
                value={draft.immatriculation}
                onChange={(e) => updateDraft(draftId, { immatriculation: e.target.value.toUpperCase() })}
                style={{ textTransform: 'uppercase', flex: 1 }}
                placeholder="AA-123-AA"
              />
              <label className="scan-plate-btn">
                {scanning ? <span className="spinner" /> : <IconCamera style={{ width: 20, height: 20 }} />}
                <input type="file" accept="image/*" capture="environment" onChange={onScanPlate} disabled={scanning} style={{ display: 'none' }} />
              </label>
            </div>
            {scanning && <p className="small muted" style={{ marginTop: '0.35rem' }}>Lecture de la plaque en cours...</p>}
            {scanError && <p className="small" style={{ marginTop: '0.35rem', color: 'var(--red)' }}>{scanError}</p>}
          </div>
          <div className="field" style={{ flex: 1 }}>
            <label>Heure</label>
            <input type="time" value={draft.heure} onChange={(e) => updateDraft(draftId, { heure: e.target.value })} />
          </div>
        </div>

        <div className="field">
          <label>Lieu</label>
          {draft.lieu ? (
            <div className="disclaimer" style={{ marginBottom: '0.5rem' }}>
              {draft.lieu.adresse || (draft.lieu.lat != null ? `${draft.lieu.lat.toFixed(5)}, ${draft.lieu.lng!.toFixed(5)}` : '—')}
              <br />
              <span className="muted">
                {draft.lieu.manuel ? 'Saisie manuelle' : `précision ± ${Math.round(draft.lieu.accuracy ?? 0)} m`} — {new Date(draft.lieu.capturedAt).toLocaleTimeString('fr-FR')}
              </span>
            </div>
          ) : (
            <div className="empty-state" style={{ padding: '0.8rem' }}>
              Aucune position enregistrée
            </div>
          )}
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button className="btn secondary" onClick={localiser} disabled={locating} style={{ flex: 1 }}>
              <IconMapPin style={{ width: 18, height: 18 }} /> {locating ? 'Localisation...' : 'GPS'}
            </button>
            <button className="btn secondary" onClick={() => setShowManualLoc((v) => !v)} style={{ flex: 1 }}>
              Saisie manuelle
            </button>
          </div>
          {permDenied && !locError && (
            <p className="small" style={{ color: 'var(--red)', marginTop: '0.4rem' }}>
              Localisation bloquée pour cette application dans le navigateur. Utilisez la saisie manuelle, ou appuyez sur GPS pour voir comment débloquer.
            </p>
          )}
          {locError && <p className="small" style={{ color: 'var(--red)', marginTop: '0.4rem' }}>{locError}</p>}
          {showManualLoc && (
            <div style={{ marginTop: '0.5rem' }}>
              <input
                type="text"
                autoFocus
                placeholder="Adresse, lieu-dit, PK..."
                value={manualAddress}
                onChange={(e) => setManualAddress(e.target.value)}
              />
              <button className="btn" style={{ marginTop: '0.5rem' }} onClick={saveManualLocation}>
                Enregistrer ce lieu
              </button>
            </div>
          )}
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
                <img src={URL.createObjectURL(p.blob)} alt={p.name} onClick={() => setEnlargedPhotoId(p.id!)} />
                <button onClick={() => deletePhoto(p.id!)}>
                  <IconX style={{ width: 12, height: 12 }} />
                </button>
              </div>
            ))}
            <label className="add-photo">
              <IconCamera style={{ width: 22, height: 22 }} />
              <span className="add-photo-label">Photo</span>
              <input type="file" accept="image/*" capture="environment" multiple onChange={onPhotoSelected} style={{ display: 'none' }} />
            </label>
            <label className="add-photo">
              <IconImage style={{ width: 22, height: 22 }} />
              <span className="add-photo-label">Galerie</span>
              <input type="file" accept="image/*" multiple onChange={onPhotoSelected} style={{ display: 'none' }} />
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

      {enlargedPhotoId != null && (() => {
        const enlarged = photos?.find((p) => p.id === enlargedPhotoId)
        if (!enlarged) return null
        return (
          <div
            className="modal-overlay lightbox-overlay"
            onClick={(e) => {
              e.stopPropagation()
              setEnlargedPhotoId(null)
            }}
          >
            <button className="icon-btn lightbox-close" onClick={() => setEnlargedPhotoId(null)}>
              <IconX />
            </button>
            <img className="lightbox-img" src={URL.createObjectURL(enlarged.blob)} alt={enlarged.name} onClick={(e) => e.stopPropagation()} />
          </div>
        )
      })()}
    </div>
  )
}
