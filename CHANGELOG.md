# Journal des versions — GendKit

## 0.2.1 — 2026-08-16

- Les filtres NATINF (nature, catégorie) sont désormais des boutons plutôt que des menus déroulants, avec une petite icône par catégorie.
- Le filtre nature n'affiche plus les variantes douanières (toujours accessibles par la recherche texte).
- La catégorie « Circulation routière » se déplie en un vrai classement à deux niveaux : 14 sous-catégories (Vitesse, Alcool et stupéfiants, Permis de conduire, Priorités et signalisation, Dépassement et circulation, Stationnement, Équipements, Poids et chargement, Transport, Accidents et fuite, etc.), certaines se subdivisant encore (ex. Alcool et stupéfiants → Alcool / Stupéfiants), construites à partir d'une analyse réelle des 1105 infractions routières du dataset.

## 0.2.0 — 2026-08-16

- **NATINF** : retrait de la section « Dépistage alcool/stupéfiants » et du texte explicatif sous le badge de points (jugés inutiles à l'usage).
- Ajout des **favoris** : bouton étoile sur chaque fiche NATINF, organisables en **dossiers** personnalisés (créer, déplacer, supprimer un dossier sans perdre les favoris qu'il contient), consultables dans un nouvel onglet « Favoris ».
- Ajout d'un **filtre par catégorie d'infraction** (Circulation routière, Environnement, Droit du travail, Stupéfiants/Santé publique, Douanes, etc.), déduit automatiquement des codes juridiques cités par chaque infraction, combinable avec le filtre par nature existant.

## 0.1.4 — 2026-08-16

- **NATINF** : la fiche détaillée affiche désormais, pour les contraventions, les montants d'amende minorée/forfaitaire/majorée par classe (5e classe : amende judiciaire jusqu'à 1 500 €).
- Ajout d'une section « Dépistage alcool / stupéfiants » rappelant le cadre légal (art. L234-3 et L234-9 pour l'alcool, L235-2 pour les stupéfiants), avec un repère « Alcool obligatoire » pour les infractions du sous-ensemble vérifié qui sont punies de la suspension du permis de conduire (alcool, stupéfiants, excès de vitesse ≥ 30 km/h, conduite malgré suspension).

## 0.1.3 — 2026-08-16

- **NATINF** : la fiche détaillée affiche désormais le nombre de points retirés du permis quand l'infraction en fait perdre (barème officiel sécurité routière, ~45 infractions du code de la route couvertes). Les cas de récidive donnant lieu à annulation du permis sont signalés spécifiquement. Les NATINF « redevable de l'amende » (titulaire du certificat d'immatriculation, conducteur non identifié) sont volontairement exclus car ils ne retirent pas de points.

## 0.1.2 — 2026-08-16

Correctif critique d'installation.

- Le manifest PWA pointait `start_url`/`scope` vers la racine du domaine au lieu de `/GendKit/` : l'app installée sur téléphone ouvrait une page 404 au lieu de GendKit. Corrigé — ces valeurs suivent maintenant le chemin réel de déploiement.
- **Si vous aviez déjà installé l'app avant ce correctif, désinstallez-la et réinstallez-la** (le raccourci créé à l'installation garde l'ancienne cible).

## 0.1.1 — 2026-08-16

Corrections esthétiques suite aux premiers retours.

- Vrai mode sombre (fond neutre noir) au lieu du bleu marine.
- Menu latéral desktop redessiné (icônes sur fond teinté, « À propos » séparé en bas).
- PVE : bouton « Enregistrer » toujours visible en bas de la fiche, et bouton supprimer directement sur chaque brouillon dans la liste.

## 0.1.0 — 2026-08-16

Première version.

- **NATINF** : recherche offline dans les 17 168 infractions en vigueur (dataset Ministère de la Justice, avril 2026).
- **Vitesse** : calcul de la vitesse retenue (marge radar fixe/mobile) et rattachement automatique au NATINF correspondant.
- **Alcool** : calcul de la valeur retenue (marge éthylomètre, arrêté du 8 juillet 2003) et rattachement automatique au NATINF correspondant, y compris seuils renforcés et cas particuliers (ivresse manifeste, refus).
- **PVE** : brouillons avec géolocalisation automatique, immatriculation, NATINF liés, observations et photos ; export PDF en aide-mémoire.
- Application installable sur Android, iOS, Windows et macOS (PWA), fonctionne hors-ligne.
