import { useMemo, useState } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '../lib/db'
import { searchNatinf, getAllNatures, natureShortLabel, getNatinfByNumero, natinfMeta } from '../lib/natinf'
import { getPointsForNatinf } from '../lib/points'
import { getAmendeForNature } from '../lib/amendes'
import { getObservation } from '../lib/observations'
import { useModalBackButton } from '../lib/useModalBackButton'
import { usePersistentState } from '../lib/usePersistentState'
import { CATEGORIES, getCategoryIcon } from '../lib/category'
import { ROUTIER_SUB_CATEGORIES, getRoutierSubSubCategories } from '../lib/routierCategory'
import { createFolder, addFavorite, removeFavoriteByNatinf, setFavoriteFolder, deleteFolder } from '../lib/favorites'
import type { NatinfEntry } from '../lib/types'
import { useAppState } from '../lib/AppState'
import { IconSearch, IconX, IconArrowRight, IconArrowLeft, IconStar, IconStarFilled, IconPlus, IconTrash } from '../components/icons'

function natureBadgeClass(nature: string): string {
  if (nature === 'Crime' || nature.startsWith('Délit')) return 'red'
  if (nature.startsWith('Contravention de classe 5') || nature.startsWith('Contravention de classe 4')) return 'amber'
  return 'blue'
}

export default function NatinfScreen() {
  const [view, setView] = usePersistentState<'recherche' | 'favoris'>('gendkit-natinf-view', 'recherche')
  const [query, setQuery] = usePersistentState('gendkit-natinf-query', '')
  const [nature, setNature] = usePersistentState('gendkit-natinf-nature', '')
  const [categorie, setCategorie] = usePersistentState('gendkit-natinf-categorie', '')
  const [subCategorie, setSubCategorie] = usePersistentState('gendkit-natinf-subcategorie', '')
  const [subSubCategorie, setSubSubCategorie] = usePersistentState('gendkit-natinf-subsubcategorie', '')
  const [selected, setSelected] = useState<NatinfEntry | null>(null)
  const natures = useMemo(() => getAllNatures(), [])
  const results = useMemo(
    () =>
      searchNatinf(query, {
        nature: nature || undefined,
        categorie: categorie || undefined,
        subCategorie: subCategorie || undefined,
        subSubCategorie: subSubCategorie || undefined,
        limit: query ? 150 : 400,
      }),
    [query, nature, categorie, subCategorie, subSubCategorie]
  )
  const subSubOptions = subCategorie ? getRoutierSubSubCategories(subCategorie) : []

  function goBackOneLevel() {
    if (subSubCategorie) setSubSubCategorie('')
    else if (subCategorie) setSubCategorie('')
    else if (categorie) setCategorie('')
  }

  function onCategorieChange(v: string) {
    setCategorie(v)
    setSubCategorie('')
    setSubSubCategorie('')
  }

  function onSubCategorieChange(v: string) {
    setSubCategorie(v)
    setSubSubCategorie('')
  }

  // En navigation (pas de recherche texte), on affiche la liste dès qu'on ne
  // peut plus descendre d'un niveau : catégorie non-routière, ou sous-catégorie
  // routière sans enfants, ou sous-sous-catégorie choisie, ou simple filtre nature.
  const routierHasChildren = categorie === 'Circulation routière' && !subCategorie
  const routierSubHasChildren = categorie === 'Circulation routière' && subCategorie && subSubOptions.length > 0 && !subSubCategorie
  const showBrowseList = !query && (nature || categorie) && !routierHasChildren && !routierSubHasChildren

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
            <div className="field" style={{ marginBottom: '0.7rem' }}>
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

            <div className="small muted" style={{ marginBottom: '0.4rem' }}>
              Nature
            </div>
            <div className="pill-grid">
              <button className={nature === '' ? 'active' : ''} onClick={() => setNature('')}>
                Toutes
              </button>
              {natures.map((n) => (
                <button key={n} className={nature === n ? 'active' : ''} onClick={() => setNature(n)}>
                  {natureShortLabel(n)}
                </button>
              ))}
            </div>
          </div>

          {!query && (
            <div className="card">
              {categorie ? (
                <div className="nav-header">
                  <button className="back-btn" onClick={goBackOneLevel} aria-label="Retour">
                    <IconArrowLeft style={{ width: 20, height: 20 }} />
                  </button>
                  <div className="nav-title">
                    {!subCategorie && (
                      <span style={{ marginRight: '0.35rem' }}>{getCategoryIcon(categorie)}</span>
                    )}
                    {subSubCategorie || subCategorie || categorie}
                  </div>
                </div>
              ) : (
                <div className="small muted" style={{ marginBottom: '0.5rem' }}>
                  Parcourir par catégorie
                </div>
              )}

              {!categorie && (
                <div className="tile-grid">
                  {CATEGORIES.map((c) => (
                    <button key={c.label} onClick={() => onCategorieChange(c.label)}>
                      <span className="tile-icon">{c.icon}</span>
                      {c.label}
                    </button>
                  ))}
                </div>
              )}

              {routierHasChildren && (
                <div className="menu-grid">
                  {ROUTIER_SUB_CATEGORIES.map((s) => (
                    <button key={s} onClick={() => onSubCategorieChange(s)}>
                      {s}
                    </button>
                  ))}
                </div>
              )}

              {routierSubHasChildren && (
                <div className="menu-grid">
                  {subSubOptions.map((s) => (
                    <button key={s} onClick={() => setSubSubCategorie(s)}>
                      {s}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {!query && !nature && !categorie && (
            <div className="empty-state">
              Tapez un mot-clé, ou parcourez par catégorie ci-dessus.
              <br />
              <span className="small">{natinfMeta.count.toLocaleString('fr-FR')} infractions en base, dataset {natinfMeta.sourceTitle}</span>
            </div>
          )}

          {(query || showBrowseList) && results.length === 0 && <div className="empty-state">Aucun résultat.</div>}

          {(query || showBrowseList) && results.length > 0 && (
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
              {results.length >= 400 && <p className="small muted" style={{ marginTop: '0.5rem' }}>Affichage limité aux 400 premiers résultats — affinez avec la recherche ou une sous-catégorie.</p>}
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

export function NatinfDetail({ entry, onClose }: { entry: NatinfEntry; onClose: () => void }) {
  const { sendToPve } = useAppState()
  const pointsInfo = getPointsForNatinf(entry.numero)
  const amende = getAmendeForNature(entry.nature)
  const isContravention = entry.nature.startsWith('Contravention')
  const observation = getObservation(entry.numero)
  const favorite = useLiveQuery(() => db.favorites.where('natinf').equals(entry.numero).first(), [entry.numero])
  const isFavorite = !!favorite
  const folders = useLiveQuery(() => db.favoriteFolders.toArray())

  useModalBackButton(onClose)

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
        {pointsInfo?.points && (
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

        {observation && (
          <div className="card">
            <h2>Observation</h2>
            <p className="small">{observation}</p>
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
