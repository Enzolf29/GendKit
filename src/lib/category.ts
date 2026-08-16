import type { NatinfEntry } from './types'

// Dérivé des codes juridiques cités dans les infractions (definiePar/reprimeePar).
// Un même NATINF peut citer plusieurs codes (ex. C.ROUTE + C.PENAL) : on retient
// le code le plus spécifique en priorité, "Circulation routière" en tête car
// c'est le cas d'usage principal de l'application.
const CATEGORY_RULES: { code: string; label: string; icon: string }[] = [
  { code: 'C.ROUTE.', label: 'Circulation routière', icon: '🚗' },
  { code: 'C.TRANSPORTS.', label: 'Transports', icon: '🚆' },
  { code: 'C.ENVIR.', label: 'Environnement', icon: '🌿' },
  { code: 'C.SANTE.PUB.', label: 'Santé publique', icon: '⚕️' },
  { code: 'C.RURAL.', label: 'Rural, chasse et pêche', icon: '🌾' },
  { code: 'C.TRAVAIL.', label: 'Droit du travail', icon: '💼' },
  { code: 'C.CONSOMMAT.', label: 'Consommation', icon: '🛒' },
  { code: 'C.S.I.', label: 'Sécurité intérieure', icon: '🛡️' },
  { code: 'C.DOUANES.', label: 'Douanes', icon: '🛃' },
  { code: 'C.M.F.', label: 'Monétaire et financier', icon: '💶' },
  { code: 'C.COMMERCE.', label: 'Commerce', icon: '🏪' },
  { code: 'C.CONSTRUCT.', label: 'Construction et habitation', icon: '🏗️' },
  { code: 'C.SPORT.', label: 'Sport', icon: '⚽' },
  { code: 'C.FORESTIER.', label: 'Forestier', icon: '🌲' },
  { code: 'C.PROPR.INT.', label: 'Propriété intellectuelle', icon: '©️' },
  { code: 'C.URBANISME.', label: 'Urbanisme', icon: '🏙️' },
  { code: 'C.DEFENSE.', label: 'Défense', icon: '🎖️' },
  { code: 'C.G.I.', label: 'Impôts', icon: '🧾' },
  { code: 'C.ELECTORAL.', label: 'Électoral', icon: '🗳️' },
  { code: 'C.E.S.E.D.A.', label: 'Étrangers et droit d\'asile', icon: '🛂' },
  { code: 'C.CIVIL.', label: 'Civil', icon: '⚖️' },
  { code: 'C.J.M.', label: 'Justice militaire', icon: '⚔️' },
  { code: 'C.PATRIMOINE.', label: 'Patrimoine', icon: '🏛️' },
  { code: 'C.ASSURANCES.', label: 'Assurances', icon: '📄' },
  { code: 'C.SECU.SOC.', label: 'Sécurité sociale', icon: '🏥' },
]

const GENERIC_PENAL_LABEL = 'Droit pénal général'
const OTHER_LABEL = 'Autres'

export const CATEGORIES: { label: string; icon: string }[] = [
  ...CATEGORY_RULES.map((r) => ({ label: r.label, icon: r.icon })),
  { label: GENERIC_PENAL_LABEL, icon: '📕' },
  { label: OTHER_LABEL, icon: '📁' },
]

export const CATEGORY_LABELS: string[] = CATEGORIES.map((c) => c.label)

const iconByLabel = new Map(CATEGORIES.map((c) => [c.label, c.icon]))

export function getCategoryIcon(label: string): string {
  return iconByLabel.get(label) ?? '📁'
}

export function getCategory(entry: NatinfEntry): string {
  const text = entry.definiePar + ' ' + entry.reprimeePar
  for (const rule of CATEGORY_RULES) {
    if (text.includes(rule.code)) return rule.label
  }
  if (text.includes('C.PENAL.')) return GENERIC_PENAL_LABEL
  return OTHER_LABEL
}
