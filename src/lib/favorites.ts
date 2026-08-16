import { db } from './db'
import type { NatinfRef } from './types'

export async function createFolder(name: string): Promise<number> {
  return db.favoriteFolders.add({ name, createdAt: new Date().toISOString() }) as Promise<number>
}

export async function renameFolder(id: number, name: string): Promise<void> {
  await db.favoriteFolders.update(id, { name })
}

export async function deleteFolder(id: number): Promise<void> {
  await db.transaction('rw', db.favoriteFolders, db.favorites, async () => {
    await db.favoriteFolders.delete(id)
    // Les favoris du dossier supprimé repassent en "Sans dossier" plutôt que d'être perdus.
    const items = await db.favorites.where('folderId').equals(id).toArray()
    await Promise.all(items.map((f) => db.favorites.update(f.id!, { folderId: null })))
  })
}

export async function addFavorite(natinf: NatinfRef, folderId: number | null = null): Promise<number> {
  return db.favorites.add({
    natinf: natinf.numero,
    qualification: natinf.qualification,
    folderId,
    addedAt: new Date().toISOString(),
  }) as Promise<number>
}

export async function removeFavoriteByNatinf(numero: string): Promise<void> {
  const existing = await db.favorites.where('natinf').equals(numero).toArray()
  await db.favorites.bulkDelete(existing.map((f) => f.id!))
}

export async function setFavoriteFolder(id: number, folderId: number | null): Promise<void> {
  await db.favorites.update(id, { folderId })
}
