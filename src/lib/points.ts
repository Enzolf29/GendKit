import pointsData from '../data/points-permis.json'

export interface PointsEntry {
  natinf: string
  points?: number | 'annulation'
  categorie: string
  suspensionPermis?: boolean
}

const data = pointsData as { entries: PointsEntry[] }

const byNumero = new Map(data.entries.map((e) => [e.natinf, e]))

export function getPointsForNatinf(numero: string): PointsEntry | undefined {
  return byNumero.get(numero.trim())
}
