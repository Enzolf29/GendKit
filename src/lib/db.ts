import Dexie, { type EntityTable } from 'dexie'
import type { PveDraft, PvePhoto } from './types'

const db = new Dexie('gendkit') as Dexie & {
  pveDrafts: EntityTable<PveDraft, 'id'>
  pvePhotos: EntityTable<PvePhoto, 'id'>
}

db.version(1).stores({
  pveDrafts: '++id, statut, updatedAt',
  pvePhotos: '++id, draftId',
})

export { db }
