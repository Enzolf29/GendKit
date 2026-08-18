import type { NatinfEntry } from './types'

// Sous-classification des infractions "Circulation routière", construite à
// partir d'une analyse répétée des 1105 infractions réellement présentes
// dans le dataset (voir historique) : chaque règle est vérifiée contre le
// texte réel des infractions, pas devinée. Ordre = priorité : premier motif
// qui matche. Objectif : réduire au minimum le fourre-tout "Autres".
interface Rule {
  sub: string
  subSub?: string
  pattern: RegExp
}

const RULES: Rule[] = [
  { sub: 'Alcool et stupéfiants', subSub: 'Alcool', pattern: /ALCOOL|IVRESSE|IMPREGNATION ALCOOLIQUE/ },
  { sub: 'Alcool et stupéfiants', subSub: 'Stupéfiants', pattern: /STUPEFIANT/ },
  { sub: 'Vitesse', pattern: /VITESSE/ },
  { sub: 'Permis de conduire', subSub: 'Sans permis / défaut de permis', pattern: /SANS ETRE TITULAIRE DU PERMIS|SANS PERMIS|DEFAUT DE PERMIS|SANS ETRE TITULAIRE DE LA CATEGORIE/ },
  { sub: 'Permis de conduire', subSub: 'Suspension, rétention, annulation', pattern: /SUSPENSION|RETENTION DU PERMIS|ANNULATION DU PERMIS|INTERDICTION D.OBTENIR/ },
  { sub: 'Permis de conduire', subSub: 'Apprentissage et permis probatoire', pattern: /PERMIS PROBATOIRE|CONDUITE ACCOMPAGNEE|APPRENTISSAGE ANTICIPE|ELEVE CONDUCTEUR/ },
  { sub: 'Permis de conduire', pattern: /PERMIS DE CONDUIRE/ },
  { sub: 'Âge minimum de conduite', pattern: /MINEUR DE MOINS DE/ },
  { sub: 'Priorités et signalisation', subSub: 'Feu rouge, stop et cédez-le-passage', pattern: /FEU ROUGE|\bSTOP\b|CEDER LE PASSAGE/ },
  { sub: 'Publicité et enseignes', pattern: /PUBLICITE|ENSEIGNE/ },
  { sub: 'Priorités et signalisation', pattern: /PRIORITE|PANNEAU|SIGNALISATION/ },
  { sub: 'Accidents et fuite', subSub: 'Délit de fuite', pattern: /DELIT DE FUITE/ },
  { sub: 'Accidents et fuite', subSub: "Refus d'obtempérer", pattern: /OBTEMPERER/ },
  { sub: 'Accidents et fuite', subSub: 'Blessures et homicides routiers', pattern: /BLESSURES ROUTIERES|HOMICIDE ROUTIER|BLESSURES INVOLONTAIRES.*CONDUCTEUR|HOMICIDE INVOLONTAIRE.*CONDUCTEUR/ },
  { sub: 'Dépassement et circulation', subSub: 'Dépassement', pattern: /DEPASSEMENT|DEPASSER/ },
  { sub: 'Dépassement et circulation', subSub: 'Lignes et voies de circulation', pattern: /LIGNE (CONTINUE|DISCONTINUE)|VOIE (DE|RESERVEE)|CHAUSSEE|BANDE D.ARRET|SENS INTERDIT|MARCHE ARRIERE|DEMI-TOUR/ },
  { sub: 'Dépassement et circulation', subSub: 'Distances de sécurité', pattern: /DISTANCE DE SECURITE/ },
  { sub: 'Stationnement et arrêt', pattern: /STATIONNEMENT|ARRET (OU|DANGEREUX|GENANT|IRREGULIER)/ },
  { sub: 'Équipement du conducteur', subSub: 'Ceinture, casque et gants', pattern: /CEINTURE DE SECURITE|CASQUE|GANTS/ },
  { sub: 'Équipement du conducteur', subSub: 'Téléphone au volant', pattern: /TELEPHONE/ },
  { sub: 'Équipement et contrôle du véhicule', subSub: 'Éclairage et avertisseurs', pattern: /ECLAIRAGE|\bFEUX\b|AVERTISSEUR/ },
  { sub: 'Équipement et contrôle du véhicule', subSub: 'Plaques et immatriculation', pattern: /IMMATRICULATION|PLAQUE/ },
  { sub: 'Équipement et contrôle du véhicule', subSub: 'Contrôle technique', pattern: /CONTROLE TECHNIQUE/ },
  { sub: 'Équipement et contrôle du véhicule', subSub: 'Vitres teintées', pattern: /VITRES/ },
  { sub: 'Équipement et contrôle du véhicule', subSub: 'Détecteur ou brouilleur de radar', pattern: /DECELER OU PERTURBER/ },
  { sub: 'Équipement et contrôle du véhicule', subSub: 'Équipements techniques divers', pattern: /NON EQUIPE|PNEUMATIQUE|FREINAGE|COMPTEUR KILOMETRIQUE|INDICATEUR DE VITESSE/ },
  { sub: 'Poids, chargement et dimensions', pattern: /\bPOIDS\b|CHARGEMENT|SURCHARGE|SURELEVATION|DIMENSION|GABARIT|ARRIMAGE/ },
  { sub: 'Transport de personnes et marchandises', pattern: /TRANSPORT (DE|EN|D.)|\bTAXI\b|VOITURE DE TRANSPORT|VEHICULE DE TRANSPORT/ },
  { sub: 'Assurance et documents', pattern: /ASSURANCE|CERTIFICAT D.IMMATRICULATION|CARTE GRISE/ },
  { sub: 'Navigation intérieure (bateaux)', pattern: /NAVIGATION|\bBATEAU\b/ },
  { sub: "Amende du titulaire (conducteur non identifié)", pattern: /REDEVABLE DE L.AMENDE/ },
  { sub: 'Obligations administratives et péage', pattern: /NON DECLARATION|NON PRESENTATION|NON JUSTIFICATION|NON TRANSMISSION|NON ACQUITTEMENT|NON CONSERVATION|PEAGE/ },
  { sub: 'Animaux sur la route', pattern: /\bANIMAL\b|ANIMAUX|TROUPEAUX|ATTELE|TRACTION ANIMALE/ },
  { sub: 'Autres règles de circulation', pattern: /^CIRCULATION |^CONDUITE / },
]

const OTHER = 'Autres infractions routières'

export interface RoutierClassification {
  sub: string
  subSub: string | null
}

export function getRoutierSubCategory(entry: NatinfEntry): RoutierClassification {
  for (const rule of RULES) {
    if (rule.pattern.test(entry.qualification)) {
      return { sub: rule.sub, subSub: rule.subSub ?? null }
    }
  }
  return { sub: OTHER, subSub: null }
}

export const ROUTIER_SUB_CATEGORIES: string[] = [...new Set(RULES.map((r) => r.sub)), OTHER]

export function getRoutierSubSubCategories(sub: string): string[] {
  return [...new Set(RULES.filter((r) => r.sub === sub && r.subSub).map((r) => r.subSub as string))]
}
