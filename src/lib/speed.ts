import speedData from '../data/speed-brackets.json'

export type Cinemometre = 'fixe' | 'mobile'

interface SpeedBracket {
  minExcess: number
  maxExcess: number | null
  zone: 'le50' | 'gt50' | 'any'
  natinf: string
  classe: string
  label: string
  points: number
}

const data = speedData as {
  margins: Record<Cinemometre, { belowThreshold: { maxSpeed: number; flatKmh: number }; aboveThreshold: { percent: number } }>
  brackets: SpeedBracket[]
  recidive: { minExcess: number; natinf: string; classe: string; label: string }
}

export interface SpeedResult {
  vitesseRelevee: number
  vitesseRetenue: number
  margeAppliquee: number
  vitesseLimite: number
  exces: number
  bracket: SpeedBracket | null
}

export function computeRetainedSpeed(vitesseRelevee: number, appareil: Cinemometre): { vitesseRetenue: number; margeAppliquee: number } {
  const margin = data.margins[appareil]
  const margeAppliquee =
    vitesseRelevee < margin.belowThreshold.maxSpeed
      ? margin.belowThreshold.flatKmh
      : Math.round(vitesseRelevee * (margin.aboveThreshold.percent / 100) * 10) / 10

  return {
    vitesseRetenue: Math.round((vitesseRelevee - margeAppliquee) * 10) / 10,
    margeAppliquee,
  }
}

export function findSpeedBracket(exces: number, vitesseLimite: number): SpeedBracket | null {
  const zone = vitesseLimite <= 50 ? 'le50' : 'gt50'
  return (
    data.brackets.find((b) => {
      const zoneOk = b.zone === 'any' || b.zone === zone
      const minOk = exces >= b.minExcess
      const maxOk = b.maxExcess === null || exces < b.maxExcess
      return zoneOk && minOk && maxOk
    }) ?? null
  )
}

export function evaluateSpeed(vitesseRelevee: number, vitesseLimite: number, appareil: Cinemometre): SpeedResult {
  const { vitesseRetenue, margeAppliquee } = computeRetainedSpeed(vitesseRelevee, appareil)
  const diff = Math.round((vitesseRetenue - vitesseLimite) * 10) / 10
  const exces = Math.max(0, diff)
  // Pas d'infraction si la vitesse retenue n'excède pas la limite (diff <= 0) :
  // on ne cherche un palier que s'il y a un excès réel, même minime.
  const bracket = diff > 0 ? findSpeedBracket(exces, vitesseLimite) : null

  return { vitesseRelevee, vitesseRetenue, margeAppliquee, vitesseLimite, exces, bracket }
}

export const recidiveInfo = data.recidive
