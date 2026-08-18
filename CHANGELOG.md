# Journal des versions — GendKit

## 0.7.0 — 2026-08-18

- **Classement routier affiné** : le fourre-tout "Autres infractions routières" passe de 33 % à 13 % des 1105 infractions routières, grâce à 6 nouvelles sous-catégories (Âge minimum de conduite, Publicité et enseignes, Amende du titulaire, Obligations administratives et péage, Animaux sur la route, Autres règles de circulation) qui couvrent des cas auparavant non classés.
- **Navigation simplifiée** : le fil d'ariane cliquable est remplacé par une flèche retour claire en haut à gauche, qui remonte d'un niveau à chaque tap (catégorie → sous-catégorie → sous-sous-catégorie → catégories), avec le titre du niveau actuel affiché à côté.

## 0.6.1 — 2026-08-18

- **Géolocalisation refusée** : une fois la permission de localisation refusée, le navigateur mémorise ce blocage pour le site et ne réaffiche plus jamais le pop-up automatiquement — réinstaller l'app ou changer les réglages Android ne suffit pas, c'est une limitation du navigateur, pas de l'app. Le message d'erreur explique maintenant précisément quoi faire (réinitialiser l'autorisation du site dans Brave) au lieu d'afficher le message brut du navigateur. Un avertissement apparaît aussi dès l'ouverture d'un PVE si la localisation est déjà bloquée, sans attendre d'appuyer sur GPS.

## 0.6.0 — 2026-08-18

- **Correctif important** : l'étoile "favori" et la croix "fermer" de la fiche NATINF (et des autres fenêtres modales) étaient invisibles sur mobile — les icônes s'écrasaient à une taille quasi nulle faute de dimension explicite dans ce contexte. Corrigé pour toutes les modales de l'app ; testé et confirmé visible et fonctionnel.
- **Persistance de la recherche** : la recherche, les filtres (nature, catégorie, sous-catégorie routière) et l'onglet actif sont maintenant sauvegardés en continu. Si le téléphone décharge l'application en arrière-plan puis la recharge, vous retrouvez exactement où vous en étiez au lieu de repartir de zéro.

## 0.5.1 — 2026-08-17

- **Correctif important** : re-vérification complète, un par un, des 46 NATINF du barème de points (suite à un signalement sur le non-port de ceinture par un passager majeur, affiché à tort comme perdant des points). **17 erreurs corrigées** — le schéma general était : seul le conducteur perd des points, jamais le passager (ceinture, casque, gants). Autres corrections : pas de retrait de points pour l'excès de vitesse < 5 km/h, l'usage/détention d'un détecteur de radar, le défaut d'éclairage nocturne, le non-respect de distance de sécurité sur ouvrage à risque, le franchissement de ligne sur bande d'arrêt d'urgence, et la conduite malgré suspension (le permis étant déjà suspendu, il n'y a plus de points à retirer).

## 0.5.0 — 2026-08-17

- **PVE — lecture automatique de plaque** : un petit bouton appareil photo à côté du champ Immatriculation ouvre la caméra, lit la plaque par reconnaissance de texte (entièrement dans le téléphone, aucune donnée envoyée à un serveur) et remplit le champ.
- Ajouter une photo (caméra ou galerie) alors que le champ Immatriculation est vide déclenche aussi automatiquement cette lecture en arrière-plan ; le champ n'est jamais écrasé s'il est déjà rempli.
- Nécessite une connexion réseau la première fois (téléchargement du moteur de lecture, ~quelques Mo, mis en cache par le navigateur ensuite).

## 0.4.1 — 2026-08-17

- **Correctif** : dans Vitesse, une vitesse relevée inférieure (ou égale) à la vitesse limite affichait à tort une infraction. Corrigé — plus aucune infraction n'est affichée tant que la vitesse retenue ne dépasse pas réellement la limite.
- Le lien « voir la fiche » NATINF dans Vitesse et Alcool est remplacé par un vrai bouton pleine largeur, plus facile à toucher sur téléphone.

## 0.4.0 — 2026-08-17

- **Correctif important** : sur mobile, le bouton/geste "retour" quittait l'application au lieu de fermer la fiche NATINF ouverte. Corrigé — il ferme maintenant la fiche, comme la croix. Ce bug empêchait aussi d'ouvrir les fiches dans certains cas (favoris compris), c'est réparé.
- **Vitesse et Alcool** : le NATINF affiché dans le résultat (et dans les seuils renforcés / cas particuliers de l'écran Alcool) est cliquable pour ouvrir directement sa fiche détaillée, en plus du bouton d'envoi vers PVE.
- **Observations** enrichies sur les peines complémentaires, notamment la suspension du permis pour les infractions routières : alcool (contravention et délit), stupéfiants, excès de vitesse ≥ 30 km/h, conduite malgré suspension — chaque durée vérifiée individuellement (3 ans pour l'alcool et la vitesse, 5 ans pour les stupéfiants).
- **PDF PVE** : titre renommé « GendKit — Mémo PVE » ; les photos ne ressortent plus pivotées à 90° (l'orientation de la prise de vue est maintenant correctement appliquée) et respectent leur véritable ratio au lieu d'être déformées.

## 0.3.1 — 2026-08-16

- Retrait du badge de catégorie sur la fiche NATINF détaillée.
- Ajout d'une carte « Observation » sur la fiche NATINF pour les remarques ponctuelles vérifiées (n'apparaît que si une remarque existe pour ce NATINF). Première entrée : usage du téléphone tenu en main cumulé avec une autre infraction de conduite → rétention puis suspension du permis possible jusqu'à 6 mois (art. R.224-19-1 C.route).

## 0.3.0 — 2026-08-16

**NATINF** — refonte mobile-first des filtres :
- Nature et catégorie en gros boutons carrés/pilules à plusieurs lignes (plus de défilement horizontal), icône par catégorie.
- Nature : retrait des douanières, délits fiscaux et infractions civiles.
- Vraie navigation par menus pour « Circulation routière » : catégories → sous-catégories → sous-sous-catégories → liste des infractions triée par numéro NATINF, avec fil d'ariane pour remonter.

**PVE** :
- Nouveau champ **Heure**, pré-rempli à l'heure de rédaction, modifiable manuellement.
- **Localisation manuelle** en complément du GPS (adresse, lieu-dit, PK...) quand la géolocalisation n'est pas fiable ou disponible.
- Import de photos **depuis la galerie**, en plus de la prise de photo directe.

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
