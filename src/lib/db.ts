import Dexie, { type EntityTable } from 'dexie'
import type { PveDraft, PvePhoto, FavoriteFolder, Favorite } from './types'

const db = new Dexie('gendkit') as Dexie & {
  pveDrafts: EntityTable<PveDraft, 'id'>
  pvePhotos: EntityTable<PvePhoto, 'id'>
  favoriteFolders: EntityTable<FavoriteFolder, 'id'>
  favorites: EntityTable<Favorite, 'id'>
}

db.version(1).stores({
  pveDrafts: '++id, statut, updatedAt',
  pvePhotos: '++id, draftId',
})

db.version(2).stores({
  pveDrafts: '++id, statut, updatedAt',
  pvePhotos: '++id, draftId',
  favoriteFolders: '++id, name',
  favorites: '++id, natinf, folderId',
})

export { db }
