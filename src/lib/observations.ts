import observationsData from '../data/observations.json'

const data = observationsData as { entries: { natinf: string; note: string }[] }

const byNumero = new Map(data.entries.map((e) => [e.natinf, e.note]))

export function getObservation(numero: string): string | undefined {
  return byNumero.get(numero.trim())
}
