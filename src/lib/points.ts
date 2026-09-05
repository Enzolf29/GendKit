import pointsData from '../data/points-rules.json' with { type: 'json' }
import type { NatinfEntry } from './types'

export interface PointsEntry {
  natinf: string
  points: number
  source: { label: string; url: string }
  note?: string
}

export const pointsUpdatedAt = pointsData.updatedAt
const sources: Record<string, { label: string; url: string }> = pointsData.sources
const byNumero = new Map<string, PointsEntry>()
for (const group of pointsData.groups) {
  for (const natinf of group.natinfs) {
    if (byNumero.has(natinf)) throw new Error(`Barème de points en double : ${natinf}`)
    byNumero.set(natinf, { natinf, points: group.points, source: sources[group.source], note: group.note })
  }
}

export function getPointsForNatinf(entry: NatinfEntry): PointsEntry | undefined {
  // La responsabilité pécuniaire ne doit jamais hériter des points du conducteur.
  if (entry.qualification.startsWith("REDEVABLE DE L'AMENDE") && /ART\.L\.121-3\b/.test(entry.definiePar)) {
    return { natinf: entry.numero, points: 0, source: sources.redevable,
      note: "Responsabilité pécuniaire du titulaire : aucun retrait de points. Le conducteur identifié relève d'une autre qualification." }
  }
  return byNumero.get(entry.numero.trim())
}
