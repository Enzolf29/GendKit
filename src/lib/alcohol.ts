import alcoholData from '../data/alcohol-brackets.json'

interface AlcoholBracket {
  min: number
  max: number | null
  natinf: string
  classe: string
  label: string
  points: number
}

interface ReinforcedThreshold {
  id: string
  label: string
  min: number
  natinf: string
}

interface SpecialCase {
  id: string
  natinf: string
  classe: string
  label: string
}

const data = alcoholData as {
  margin: { tiers: Array<{ maxValue: number | null; type: 'flat' | 'percent'; value: number; label: string }> }
  standardBrackets: AlcoholBracket[]
  reinforcedThresholds: ReinforcedThreshold[]
  specialCases: SpecialCase[]
}

export interface AlcoholResult {
  valeurMesuree: number
  valeurRetenue: number
  margeAppliquee: number
  margeLabel: string
  bracket: AlcoholBracket | null
}

export function computeRetainedAlcohol(valeurMesuree: number): { valeurRetenue: number; margeAppliquee: number; margeLabel: string } {
  const tier = data.margin.tiers.find((t) => t.maxValue === null || valeurMesuree < t.maxValue) ?? data.margin.tiers[data.margin.tiers.length - 1]

  const margeAppliquee = tier.type === 'flat' ? tier.value : Math.round(valeurMesuree * (tier.value / 100) * 1000) / 1000

  return {
    valeurRetenue: Math.max(0, Math.round((valeurMesuree - margeAppliquee) * 1000) / 1000),
    margeAppliquee,
    margeLabel: tier.label,
  }
}

export function findAlcoholBracket(valeurRetenue: number): AlcoholBracket | null {
  return data.standardBrackets.find((b) => valeurRetenue >= b.min && (b.max === null || valeurRetenue < b.max)) ?? null
}

export function evaluateAlcohol(valeurMesuree: number): AlcoholResult {
  const { valeurRetenue, margeAppliquee, margeLabel } = computeRetainedAlcohol(valeurMesuree)
  const bracket = findAlcoholBracket(valeurRetenue)
  return { valeurMesuree, valeurRetenue, margeAppliquee, margeLabel, bracket }
}

export const reinforcedThresholds = data.reinforcedThresholds
export const specialCases = data.specialCases
