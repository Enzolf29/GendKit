export interface NatinfEntry {
  numero: string
  nature: string
  qualification: string
  definiePar: string
  reprimeePar: string
}

export interface NatinfRef {
  numero: string
  qualification: string
}

export interface PvePhoto {
  id?: number
  draftId: number
  blob: Blob
  name: string
  createdAt: string
}

export interface PveLocation {
  lat?: number
  lng?: number
  accuracy?: number
  capturedAt: string
  manuel?: boolean
  adresse?: string
}

export interface PveDraft {
  id?: number
  createdAt: string
  updatedAt: string
  heure: string
  immatriculation: string
  natinfs: NatinfRef[]
  observations: string
  lieu: PveLocation | null
  statut: 'brouillon' | 'archive'
}

export interface FavoriteFolder {
  id?: number
  name: string
  createdAt: string
}

export interface Favorite {
  id?: number
  natinf: string
  qualification: string
  folderId: number | null
  addedAt: string
}
