import type { NatinfEntry } from './types'
import { getCategory as getLegacyCategory } from './category'

// Classement à deux sections pour l'écran NATINF :
//
// Section « Transport » (6 catégories, chacune sous-triée) : le mode de
// transport prime sur le code juridique cité — un NATINF « Code des
// transports » sur un poids lourd finit dans Poids Lourds, pas dans une
// catégorie juridique générique.
//
// Section « Autres infractions » : d'abord les infractions courantes en
// gendarmerie mais sans lien avec un véhicule (IPM, stupéfiants, outrage et
// rébellion), puis les grandes familles de codes juridiques restantes.
//
// Toutes les règles sont vérifiées contre le texte réel des infractions du
// dataset (voir historique), pas devinées.

interface TopRule {
  top: string
  pattern: RegExp
}

// Ordre = priorité. Les modes de transport sont vérifiés avant tout, sur
// l'ensemble du texte (indépendamment du code juridique cité), puis
// « Code de la route » récupère le reste des infractions C.ROUTE., puis les
// infractions courantes non liées à un véhicule.
const TOP_RULES: TopRule[] = [
  { top: 'Aérien', pattern: /AERONEF|AERODROME|A[EÉ]RIEN|CIRCULATION AERIENNE/i },
  { top: 'Ferroviaire', pattern: /FERROVIAIRE|CHEMIN DE FER|\bTRAIN\b|VOIE FERREE|PASSAGE A NIVEAU/i },
  { top: 'Maritime', pattern: /MARITIME|NAVIRE|\bBATEAU\b|NAVIGATION|PLAISANCE|\bMARIN\b/i },
  { top: '2 Roues', pattern: /MOTOCYCLETTE|CYCLOMOTEUR|SCOOTER|DEUX-ROUES|DEUX ROUES|\bMOTO\b|TRICYCLE A MOTEUR|QUADRICYCLE (LEGER )?A MOTEUR/i },
  { top: 'Poids Lourds', pattern: /POIDS LOURD|TACHYGRAPHE|TEMPS DE CONDUITE|TRANSPORT ROUTIER DE MARCHANDISES|SEMI-REMORQUE|MARCHANDISES DANGEREUSES|\bPTAC\b|VEHICULE LOURD/i },
]

const COMMON_RULES: TopRule[] = [
  { top: 'Ivresse publique (IPM)', pattern: /IVRESSE PUBLIQUE/i },
  { top: 'Outrage et rébellion', pattern: /OUTRAGE|REBELLION/i },
  { top: 'Stupéfiants (usage, détention, trafic)', pattern: /STUPEFIANT/i },
]

export const TRANSPORT_CATEGORIES: { label: string; icon: string }[] = [
  { label: 'Code de la route', icon: '🚗' },
  { label: '2 Roues', icon: '🏍️' },
  { label: 'Poids Lourds', icon: '🚛' },
  { label: 'Maritime', icon: '⚓' },
  { label: 'Ferroviaire', icon: '🚆' },
  { label: 'Aérien', icon: '✈️' },
]

export const COMMON_INFRACTION_CATEGORIES: { label: string; icon: string }[] = [
  { label: 'Ivresse publique (IPM)', icon: '🍺' },
  { label: 'Outrage et rébellion', icon: '🗣️' },
  { label: 'Stupéfiants (usage, détention, trafic)', icon: '💊' },
]

export function getTopCategory(entry: NatinfEntry): string {
  const text = entry.qualification
  const codes = entry.definiePar + ' ' + entry.reprimeePar

  for (const rule of TOP_RULES) {
    if (rule.pattern.test(text)) return rule.top
  }
  if (codes.includes('C.ROUTE.')) return 'Code de la route'
  for (const rule of COMMON_RULES) {
    if (rule.pattern.test(text)) return rule.top
  }
  return getLegacyCategory(entry)
}

export function isTransportCategory(top: string): boolean {
  return TRANSPORT_CATEGORIES.some((c) => c.label === top)
}

export function getCategoryIcon(top: string): string {
  const found = [...TRANSPORT_CATEGORIES, ...COMMON_INFRACTION_CATEGORIES].find((c) => c.label === top)
  if (found) return found.icon
  return legacyIcon(top)
}

// ---- Sous-catégories (2e et 3e niveaux) ----

interface SubRule {
  top: string
  sub: string
  subSub?: string
  pattern: RegExp
}

const SUB_RULES: SubRule[] = [
  // --- Code de la route ---
  { top: 'Code de la route', sub: 'Alcool et stupéfiants', subSub: 'Alcool', pattern: /ALCOOL|IVRESSE|IMPREGNATION ALCOOLIQUE/ },
  { top: 'Code de la route', sub: 'Alcool et stupéfiants', subSub: 'Stupéfiants', pattern: /STUPEFIANT/ },
  { top: 'Code de la route', sub: 'Vitesse', pattern: /VITESSE/ },
  { top: 'Code de la route', sub: 'Permis de conduire', subSub: 'Sans permis / défaut de permis', pattern: /SANS ETRE TITULAIRE DU PERMIS|SANS PERMIS|DEFAUT DE PERMIS|SANS ETRE TITULAIRE DE LA CATEGORIE/ },
  { top: 'Code de la route', sub: 'Permis de conduire', subSub: 'Suspension, rétention, annulation', pattern: /SUSPENSION|RETENTION DU PERMIS|ANNULATION DU PERMIS|INTERDICTION D.OBTENIR/ },
  { top: 'Code de la route', sub: 'Permis de conduire', subSub: 'Apprentissage et permis probatoire', pattern: /PERMIS PROBATOIRE|CONDUITE ACCOMPAGNEE|APPRENTISSAGE ANTICIPE|ELEVE CONDUCTEUR/ },
  { top: 'Code de la route', sub: 'Permis de conduire', pattern: /PERMIS DE CONDUIRE/ },
  { top: 'Code de la route', sub: 'Âge minimum de conduite', pattern: /MINEUR DE MOINS DE/ },
  { top: 'Code de la route', sub: 'Priorités et signalisation', subSub: 'Feu rouge, stop et cédez-le-passage', pattern: /FEU ROUGE|\bSTOP\b|CEDER LE PASSAGE/ },
  { top: 'Code de la route', sub: 'Publicité et enseignes', pattern: /PUBLICITE|ENSEIGNE/ },
  { top: 'Code de la route', sub: 'Priorités et signalisation', pattern: /PRIORITE|PANNEAU|SIGNALISATION/ },
  { top: 'Code de la route', sub: 'Accidents et fuite', subSub: 'Délit de fuite', pattern: /DELIT DE FUITE/ },
  { top: 'Code de la route', sub: 'Accidents et fuite', subSub: "Refus d'obtempérer", pattern: /OBTEMPERER/ },
  { top: 'Code de la route', sub: 'Accidents et fuite', subSub: 'Blessures et homicides routiers', pattern: /BLESSURES ROUTIERES|HOMICIDE ROUTIER|BLESSURES INVOLONTAIRES.*CONDUCTEUR|HOMICIDE INVOLONTAIRE.*CONDUCTEUR/ },
  { top: 'Code de la route', sub: 'Dépassement et circulation', subSub: 'Dépassement', pattern: /DEPASSEMENT|DEPASSER/ },
  { top: 'Code de la route', sub: 'Dépassement et circulation', subSub: 'Lignes et voies de circulation', pattern: /LIGNE (CONTINUE|DISCONTINUE)|VOIE (DE|RESERVEE)|CHAUSSEE|BANDE D.ARRET|SENS INTERDIT|MARCHE ARRIERE|DEMI-TOUR/ },
  { top: 'Code de la route', sub: 'Dépassement et circulation', subSub: 'Distances de sécurité', pattern: /DISTANCE DE SECURITE/ },
  { top: 'Code de la route', sub: 'Stationnement et arrêt', pattern: /STATIONNEMENT|ARRET (OU|DANGEREUX|GENANT|IRREGULIER)/ },
  { top: 'Code de la route', sub: 'Équipement du conducteur', subSub: 'Ceinture, casque et gants', pattern: /CEINTURE DE SECURITE|CASQUE|GANTS/ },
  { top: 'Code de la route', sub: 'Équipement du conducteur', subSub: 'Téléphone au volant', pattern: /TELEPHONE/ },
  { top: 'Code de la route', sub: 'Équipement et contrôle du véhicule', subSub: 'Éclairage et avertisseurs', pattern: /ECLAIRAGE|\bFEUX\b|AVERTISSEUR/ },
  { top: 'Code de la route', sub: 'Équipement et contrôle du véhicule', subSub: 'Plaques et immatriculation', pattern: /IMMATRICULATION|PLAQUE/ },
  { top: 'Code de la route', sub: 'Équipement et contrôle du véhicule', subSub: 'Contrôle technique', pattern: /CONTROLE TECHNIQUE/ },
  { top: 'Code de la route', sub: 'Équipement et contrôle du véhicule', subSub: 'Vitres teintées', pattern: /VITRES/ },
  { top: 'Code de la route', sub: 'Équipement et contrôle du véhicule', subSub: 'Détecteur ou brouilleur de radar', pattern: /DECELER OU PERTURBER/ },
  { top: 'Code de la route', sub: 'Équipement et contrôle du véhicule', subSub: 'Équipements techniques divers', pattern: /NON EQUIPE|PNEUMATIQUE|FREINAGE|COMPTEUR KILOMETRIQUE|INDICATEUR DE VITESSE/ },
  { top: 'Code de la route', sub: 'Poids, chargement et dimensions', pattern: /\bPOIDS\b|CHARGEMENT|SURCHARGE|SURELEVATION|DIMENSION|GABARIT|ARRIMAGE/ },
  { top: 'Code de la route', sub: 'Transport de personnes et marchandises', pattern: /TRANSPORT (DE|EN|D.)|\bTAXI\b|VOITURE DE TRANSPORT|VEHICULE DE TRANSPORT/ },
  { top: 'Code de la route', sub: 'Assurance et documents', pattern: /ASSURANCE|CERTIFICAT D.IMMATRICULATION|CARTE GRISE/ },
  { top: 'Code de la route', sub: "Amende du titulaire (conducteur non identifié)", pattern: /REDEVABLE DE L.AMENDE/ },
  { top: 'Code de la route', sub: 'Obligations administratives et péage', pattern: /NON DECLARATION|NON PRESENTATION|NON JUSTIFICATION|NON TRANSMISSION|NON ACQUITTEMENT|NON CONSERVATION|PEAGE/ },
  { top: 'Code de la route', sub: 'Animaux sur la route', pattern: /\bANIMAL\b|ANIMAUX|TROUPEAUX|ATTELE|TRACTION ANIMALE/ },
  { top: 'Code de la route', sub: 'Autres règles de circulation', pattern: /^CIRCULATION |^CONDUITE / },

  // --- 2 Roues ---
  { top: '2 Roues', sub: 'Casque et équipement', pattern: /CASQUE|GANTS/ },
  { top: '2 Roues', sub: 'Permis, âge et formation', pattern: /PERMIS|MINEUR|BREVET DE SECURITE ROUTIERE/ },
  { top: '2 Roues', sub: 'Transport de passager', pattern: /PASSAGER|TRANSPORT/ },
  { top: '2 Roues', sub: 'Circulation et éclairage', pattern: /CIRCULATION|ECLAIRAGE|\bFEU\b|CATADIOPTRE/ },

  // --- Poids Lourds ---
  { top: 'Poids Lourds', sub: 'Temps de conduite et tachygraphe', pattern: /TACHYGRAPHE|TEMPS DE CONDUITE|REPOS/ },
  { top: 'Poids Lourds', sub: 'Transport de marchandises', pattern: /MARCHANDISE|LETTRE DE VOITURE/ },
  { top: 'Poids Lourds', sub: 'Poids et dimensions', pattern: /\bPOIDS\b|PTAC|DIMENSION|GABARIT|SURCHARGE|CHARGEMENT/ },
  { top: 'Poids Lourds', sub: 'Contrôle technique et équipements', pattern: /CONTROLE TECHNIQUE|EQUIPE|DISPOSITIF/ },

  // --- Maritime ---
  { top: 'Maritime', sub: 'Pêche maritime', pattern: /PECHE/ },
  { top: 'Maritime', sub: 'Environnement marin', pattern: /IMMERSION|POLLUTION|REJET|DECHET/ },
  { top: 'Maritime', sub: 'Transport de marchandises', pattern: /TRANSPORT.*MARCHANDISE|CARGAISON/ },
  { top: 'Maritime', sub: 'Navigation et sécurité', pattern: /NAVIGATION|EQUIPAGE|TITRE DE NAVIGATION|CONDUITE/ },
  { top: 'Maritime', sub: 'Navire et équipement', pattern: /NAVIRE|BATEAU/ },

  // --- Ferroviaire ---
  { top: 'Ferroviaire', sub: 'Titre de transport', pattern: /TITRE DE TRANSPORT|VOYAGE (SANS|AVEC)/ },
  { top: 'Ferroviaire', sub: 'Marchandises dangereuses', pattern: /MARCHANDISE DANGEREUSE/ },
  { top: 'Ferroviaire', sub: 'Personnel roulant', pattern: /PERSONNEL ROULANT|REPOS|DUREE.*TRAVAIL|ABANDON DE POSTE/ },
  { top: 'Ferroviaire', sub: 'Sûreté et malveillance', pattern: /ARME|OBSTACLE|COMMERCE|ENTRAVE|DEGRADATION|MENACE|\bJET\b|MODIFICATION|EMBARRAS|DESTRUCTION/ },

  // --- Aérien ---
  { top: 'Aérien', sub: 'Aéronefs sans équipage (drones)', pattern: /SANS EQUIPAGE|\bUAS\b/ },
  { top: 'Aérien', sub: "Conformité et sécurité de l'aéronef", pattern: /CONFORME|IMMATRICULATION|ENREGISTREMENT|EQUIPEMENT|LICENCE|NAVIGABILITE|MARQUES D.IDENTIFICATION|CARNET DE ROUTE/ },
  { top: 'Aérien', sub: 'Personnel navigant', pattern: /PILOTE|EQUIPAGE|PERSONNEL NAVIGANT/ },
  { top: 'Aérien', sub: 'Sûreté et malveillance', pattern: /DESTRUCTION|DETOURNEMENT|ENTRAVE|DEGRADATION|MANOEUVRE FRAUDULEUSE|USAGE.*OBJET.*INTERDIT/ },
  { top: 'Aérien', sub: 'Accidents et incidents', pattern: /DELIT DE FUITE|BLESSURES|ACCIDENT/ },

  // --- Outrage et rébellion ---
  { top: 'Outrage et rébellion', sub: 'Outrage', pattern: /OUTRAGE/ },
  { top: 'Outrage et rébellion', sub: 'Rébellion', pattern: /REBELLION/ },

  // --- Stupéfiants ---
  { top: 'Stupéfiants (usage, détention, trafic)', sub: 'Usage', pattern: /\bUSAGE\b/ },
  { top: 'Stupéfiants (usage, détention, trafic)', sub: 'Détention', pattern: /DETENTION/ },
  { top: 'Stupéfiants (usage, détention, trafic)', sub: 'Trafic, cession et transport', pattern: /CESSION|OFFRE|TRANSPORT|PRODUCTION|FABRICATION|ACQUISITION|TRAFIC|RECEL|DELIVRANCE|OBTENTION/ },
]

const OTHER_LABEL = 'Autres'

export interface SubClassification {
  sub: string
  subSub: string | null
}

export function hasSubCategories(top: string): boolean {
  return SUB_RULES.some((r) => r.top === top)
}

export function getSubCategory(top: string, entry: NatinfEntry): SubClassification {
  for (const rule of SUB_RULES) {
    if (rule.top === top && rule.pattern.test(entry.qualification)) {
      return { sub: rule.sub, subSub: rule.subSub ?? null }
    }
  }
  return { sub: OTHER_LABEL, subSub: null }
}

export function getSubCategories(top: string): string[] {
  const subs = [...new Set(SUB_RULES.filter((r) => r.top === top).map((r) => r.sub))]
  return [...subs, OTHER_LABEL]
}

export function getSubSubCategories(top: string, sub: string): string[] {
  return [...new Set(SUB_RULES.filter((r) => r.top === top && r.sub === sub && r.subSub).map((r) => r.subSub as string))]
}

// ---- Icônes de repli pour les catégories juridiques existantes (section 2) ----
const LEGACY_ICONS: Record<string, string> = {
  Transports: '🚆',
  Environnement: '🌿',
  'Santé publique': '⚕️',
  'Rural, chasse et pêche': '🌾',
  'Droit du travail': '💼',
  Consommation: '🛒',
  'Sécurité intérieure': '🛡️',
  Douanes: '🛃',
  'Monétaire et financier': '💶',
  Commerce: '🏪',
  'Construction et habitation': '🏗️',
  Sport: '⚽',
  Forestier: '🌲',
  'Propriété intellectuelle': '©️',
  Urbanisme: '🏙️',
  Défense: '🎖️',
  Impôts: '🧾',
  Électoral: '🗳️',
  "Étrangers et droit d'asile": '🛂',
  Civil: '⚖️',
  'Justice militaire': '⚔️',
  Patrimoine: '🏛️',
  Assurances: '📄',
  'Sécurité sociale': '🏥',
  'Droit pénal général': '📕',
  Autres: '📁',
}

function legacyIcon(label: string): string {
  return LEGACY_ICONS[label] ?? '📁'
}

// Catégories "autres" affichées en section 2, dans un ordre stable : les
// infractions courantes en tête, puis les grandes familles de codes
// juridiques restantes.
export const OTHER_CATEGORIES: { label: string; icon: string }[] = [
  ...COMMON_INFRACTION_CATEGORIES,
  ...Object.keys(LEGACY_ICONS).map((label) => ({ label, icon: LEGACY_ICONS[label] })),
]
