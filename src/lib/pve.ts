import { db } from './db'
import type { PveDraft, NatinfRef, PveLocation } from './types'

function currentLocalTime(): string {
  const d = new Date()
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`
}

export async function createDraft(initial: Partial<PveDraft> = {}): Promise<number> {
  const now = new Date().toISOString()
  const draft: PveDraft = {
    createdAt: now,
    updatedAt: now,
    heure: currentLocalTime(),
    immatriculation: '',
    natinfs: [],
    observations: '',
    lieu: null,
    statut: 'brouillon',
    ...initial,
  }
  return db.pveDrafts.add(draft) as Promise<number>
}

export async function updateDraft(id: number, patch: Partial<PveDraft>): Promise<void> {
  await db.pveDrafts.update(id, { ...patch, updatedAt: new Date().toISOString() })
}

export async function deleteDraft(id: number): Promise<void> {
  await db.transaction('rw', db.pveDrafts, db.pvePhotos, async () => {
    await db.pveDrafts.delete(id)
    const photos = await db.pvePhotos.where('draftId').equals(id).toArray()
    await db.pvePhotos.bulkDelete(photos.map((p) => p.id!))
  })
}

export async function addNatinfToDraft(id: number, natinf: NatinfRef): Promise<void> {
  const draft = await db.pveDrafts.get(id)
  if (!draft) return
  if (draft.natinfs.some((n) => n.numero === natinf.numero)) return
  await updateDraft(id, { natinfs: [...draft.natinfs, natinf] })
}

export async function removeNatinfFromDraft(id: number, numero: string): Promise<void> {
  const draft = await db.pveDrafts.get(id)
  if (!draft) return
  await updateDraft(id, { natinfs: draft.natinfs.filter((n) => n.numero !== numero) })
}

export async function setDraftLocation(id: number, lieu: PveLocation): Promise<void> {
  await updateDraft(id, { lieu })
}

export async function addPhoto(draftId: number, blob: Blob, name: string): Promise<number> {
  return db.pvePhotos.add({ draftId, blob, name, createdAt: new Date().toISOString() }) as Promise<number>
}

export async function deletePhoto(id: number): Promise<void> {
  await db.pvePhotos.delete(id)
}
