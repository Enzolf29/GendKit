import { useMemo, useState } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '../lib/db'
import { searchNatinf, getAllNatures, getNatinfByNumero, natinfMeta } from '../lib/natinf'
import { getPointsForNatinf } from '../lib/points'
import { getAmendeForNature } from '../lib/amendes'
import { CATEGORY_LABELS, getCategory } from '../lib/category'
import { createFolder, addFavorite, removeFavoriteByNatinf, setFavoriteFolder, deleteFolder } from '../lib/favorites'
import type { NatinfEntry } from '../lib/types'
import { useAppState } from '../lib/AppState'
import { IconSearch, IconX, IconArrowRight, IconStar, IconStarFilled, IconPlus, IconTrash } from '../components/icons'

function natureBadgeClass(nature: string): string {
  if (nature === 'Crime' || nature.startsWith('Délit')) return 'red'
  if (nature.startsWith('Contravention de classe 5') || nature.startsWith('Contravention de classe 4')) return 'amber'
  return 'blue'
}

export default function NatinfScreen() {
  const [view, setView] = useState<'recherche' | 'favoris'>('recherche')
  const [query, setQuery] = useState('')
  const [nature, setNature] = useState('')
  const [categorie, setCategorie] = useState('')
  const [selected, setSelected] = useState<NatinfEntry | null>(null)
  const natures = useMemo(() => getAllNatures(), [])
  const results = useMemo(() => searchNatinf(query, { nature: nature || undefined, categorie: categorie || undefined }), [query, nature, categorie])

  return (
    <div>
      <div className="top-tabs">
        <button className={view === 'recherche' ? 'active' : ''} onClick={() => setView('recherche')}>
          Recherche
        </button>
        <button className={view === 'favoris' ? 'active' : ''} onClick={() => setView('favoris')}>
          ★ Favoris
        </button>
      </div>

      {view === 'recherche' ? (
        <>
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
            <select value={nature} onChange={(e) => setNature(e.target.value)} style={{ width: '100%', background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: 10, padding: '0.55rem 0.7rem', color: 'var(--text)', marginBottom: '0.5rem' }}>
              <option value="">Toutes les natures d'infraction</option>
              {natures.map((n) => (
                <option key={n} value={n}>
                  {n}
                </option>
              ))}
            </select>
            <select value={categorie} onChange={(e) => setCategorie(e.target.value)} style={{ width: '100%', background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: 10, padding: '0.55rem 0.7rem', color: 'var(--text)' }}>
              <option value="">Toutes les catégories</option>
              {CATEGORY_LABELS.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          {!query && !nature && !categorie && (
            <div className="empty-state">
              Tapez un mot-clé (ex. "stationnement", "alcool") ou un numéro NATINF.
              <br />
              <span className="small">{natinfMeta.count.toLocaleString('fr-FR')} infractions en base, dataset {natinfMeta.sourceTitle}</span>
            </div>
          )}

          {(query || nature || categorie) && results.length === 0 && <div className="empty-state">Aucun résultat.</div>}

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
        </>
      ) : (
        <FavorisView onOpen={(numero) => setSelected(getNatinfByNumero(numero) ?? null)} />
      )}

      {selected && <NatinfDetail entry={selected} onClose={() => setSelected(null)} />}
    </div>
  )
}

function FavorisView({ onOpen }: { onOpen: (numero: string) => void }) {
  const folders = useLiveQuery(() => db.favoriteFolders.toArray())
  const favorites = useLiveQuery(() => db.favorites.toArray())
  const [newFolderName, setNewFolderName] = useState('')
  const [showNewFolder, setShowNewFolder] = useState(false)

  if (!folders || !favorites) return null

  async function handleCreateFolder() {
    const name = newFolderName.trim()
    if (!name) return
    await createFolder(name)
    setNewFolderName('')
    setShowNewFolder(false)
  }

  const groups: { id: number | null; name: string }[] = [...folders.map((f) => ({ id: f.id!, name: f.name })), { id: null, name: 'Sans dossier' }]

  return (
    <div>
      {showNewFolder ? (
        <div className="card">
          <div className="field" style={{ marginBottom: '0.6rem' }}>
            <input type="text" autoFocus placeholder="Nom du dossier" value={newFolderName} onChange={(e) => setNewFolderName(e.target.value)} />
          </div>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button className="btn" onClick={handleCreateFolder}>
              Créer
            </button>
            <button className="btn secondary" onClick={() => setShowNewFolder(false)}>
              Annuler
            </button>
          </div>
        </div>
      ) : (
        <button className="btn secondary" style={{ marginBottom: '1rem' }} onClick={() => setShowNewFolder(true)}>
          <IconPlus style={{ width: 18, height: 18 }} /> Nouveau dossier
        </button>
      )}

      {favorites.length === 0 && <div className="empty-state">Aucun NATINF en favori. Ouvrez une fiche et tapez sur l'étoile pour l'ajouter.</div>}

      {groups.map((group) => {
        const items = favorites.filter((f) => f.folderId === group.id)
        if (items.length === 0) return null
        return (
          <div className="card" key={String(group.id)}>
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '0.5rem' }}>
              <h2 style={{ flex: 1 }}>{group.name}</h2>
              {group.id !== null && (
                <button className="icon-btn" onClick={() => deleteFolder(group.id!)} aria-label="Supprimer le dossier">
                  <IconTrash style={{ width: 16, height: 16 }} />
                </button>
              )}
            </div>
            {items.map((fav) => (
              <div className="list-item" key={fav.id}>
                <div className="content" onClick={() => onOpen(fav.natinf)}>
                  <span className="num">NATINF {fav.natinf}</span>
                  <div className="qualif">{fav.qualification}</div>
                </div>
                <select
                  value={fav.folderId ?? ''}
                  onClick={(e) => e.stopPropagation()}
                  onChange={(e) => setFavoriteFolder(fav.id!, e.target.value ? Number(e.target.value) : null)}
                  style={{ background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: 8, color: 'var(--text)', fontSize: '0.75rem', padding: '0.3rem', maxWidth: 90 }}
                >
                  <option value="">Sans dossier</option>
                  {folders.map((f) => (
                    <option key={f.id} value={f.id}>
                      {f.name}
                    </option>
                  ))}
                </select>
                <button className="delete-btn" onClick={() => removeFavoriteByNatinf(fav.natinf)} aria-label="Retirer des favoris">
                  <IconX style={{ width: 16, height: 16 }} />
                </button>
              </div>
            ))}
          </div>
        )
      })}
    </div>
  )
}

function NatinfDetail({ entry, onClose }: { entry: NatinfEntry; onClose: () => void }) {
  const { sendToPve } = useAppState()
  const pointsInfo = getPointsForNatinf(entry.numero)
  const amende = getAmendeForNature(entry.nature)
  const isContravention = entry.nature.startsWith('Contravention')
  const categorie = getCategory(entry)
  const favorite = useLiveQuery(() => db.favorites.where('natinf').equals(entry.numero).first(), [entry.numero])
  const isFavorite = !!favorite
  const folders = useLiveQuery(() => db.favoriteFolders.toArray())

  async function toggleFavorite() {
    if (isFavorite) {
      await removeFavoriteByNatinf(entry.numero)
    } else {
      await addFavorite({ numero: entry.numero, qualification: entry.qualification }, null)
    }
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-sheet" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>NATINF {entry.numero}</h2>
          <button className="icon-btn" onClick={toggleFavorite} aria-label="Favori">
            {isFavorite ? <IconStarFilled style={{ color: 'var(--amber)' }} /> : <IconStar />}
          </button>
          <button className="icon-btn" onClick={onClose}>
            <IconX />
          </button>
        </div>
        <span className={`badge ${natureBadgeClass(entry.nature)}`}>{entry.nature}</span>{' '}
        <span className="badge">{categorie}</span>{' '}
        {pointsInfo && (
          <span className="badge red">{pointsInfo.points === 'annulation' ? 'Annulation du permis' : `− ${pointsInfo.points} point${pointsInfo.points > 1 ? 's' : ''}`}</span>
        )}

        {isFavorite && folders && folders.length > 0 && (
          <div className="field" style={{ marginTop: '0.6rem' }}>
            <label>Dossier</label>
            <select
              value={favorite?.folderId ?? ''}
              onChange={(e) => setFavoriteFolder(favorite!.id!, e.target.value ? Number(e.target.value) : null)}
            >
              <option value="">Sans dossier</option>
              {folders.map((f) => (
                <option key={f.id} value={f.id}>
                  {f.name}
                </option>
              ))}
            </select>
          </div>
        )}

        <p style={{ marginTop: '0.7rem', lineHeight: 1.5 }}>{entry.qualification}</p>

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
