import type { NatinfEntry } from './types'

// Dérivé des codes juridiques cités dans les infractions (definiePar/reprimeePar).
// Un même NATINF peut citer plusieurs codes (ex. C.ROUTE + C.PENAL) : on retient
// le code le plus spécifique en priorité, "Circulation routière" en tête car
// c'est le cas d'usage principal de l'application.
const CATEGORY_RULES: { code: string; label: string }[] = [
  { code: 'C.ROUTE.', label: 'Circulation routière' },
  { code: 'C.TRANSPORTS.', label: 'Transports' },
  { code: 'C.ENVIR.', label: 'Environnement' },
  { code: 'C.SANTE.PUB.', label: 'Santé publique' },
  { code: 'C.RURAL.', label: 'Rural, chasse et pêche' },
  { code: 'C.TRAVAIL.', label: 'Droit du travail' },
  { code: 'C.CONSOMMAT.', label: 'Consommation' },
  { code: 'C.S.I.', label: 'Sécurité intérieure' },
  { code: 'C.DOUANES.', label: 'Douanes' },
  { code: 'C.M.F.', label: 'Monétaire et financier' },
  { code: 'C.COMMERCE.', label: 'Commerce' },
  { code: 'C.CONSTRUCT.', label: 'Construction et habitation' },
  { code: 'C.SPORT.', label: 'Sport' },
  { code: 'C.FORESTIER.', label: 'Forestier' },
  { code: 'C.PROPR.INT.', label: 'Propriété intellectuelle' },
  { code: 'C.URBANISME.', label: 'Urbanisme' },
  { code: 'C.DEFENSE.', label: 'Défense' },
  { code: 'C.G.I.', label: 'Impôts' },
  { code: 'C.ELECTORAL.', label: 'Électoral' },
  { code: 'C.E.S.E.D.A.', label: 'Étrangers et droit d\'asile' },
  { code: 'C.CIVIL.', label: 'Civil' },
  { code: 'C.J.M.', label: 'Justice militaire' },
  { code: 'C.PATRIMOINE.', label: 'Patrimoine' },
  { code: 'C.ASSURANCES.', label: 'Assurances' },
  { code: 'C.SECU.SOC.', label: 'Sécurité sociale' },
]

const GENERIC_PENAL_LABEL = 'Droit pénal général'
const OTHER_LABEL = 'Autres'

export const CATEGORY_LABELS: string[] = [
  'Circulation routière',
  ...CATEGORY_RULES.slice(1).map((r) => r.label),
  GENERIC_PENAL_LABEL,
  OTHER_LABEL,
]

export function getCategory(entry: NatinfEntry): string {
  const text = entry.definiePar + ' ' + entry.reprimeePar
  for (const rule of CATEGORY_RULES) {
    if (text.includes(rule.code)) return rule.label
  }
  if (text.includes('C.PENAL.')) return GENERIC_PENAL_LABEL
  return OTHER_LABEL
}
