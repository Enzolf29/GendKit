# GendKit — la boîte à outils du gendarme

Application web installable (PWA) pour la réserve opérationnelle : NATINF, calcul de vitesse retenue, calcul d'alcoolémie retenue, et préparation de PVE (lieu, immatriculation, NATINF, observations, photos). Fonctionne hors-ligne une fois installée, sur Android, iOS, Windows et macOS, sans passer par un store.

> Les calculs et correspondances NATINF sont fournis à titre d'aide-mémoire de terrain. Vérifiez toujours les textes en vigueur avant rédaction d'un procès-verbal officiel.

## Développement

```bash
npm install
npm run dev
```

```bash
npm run build     # build de production dans dist/
npm run preview   # sert le build de production en local
```

## Mettre à jour la base NATINF

La nomenclature est mise à jour trimestriellement par le Ministère de la Justice sur data.gouv.fr. Pour rafraîchir le dataset embarqué dans l'app :

```bash
npm run update-natinf
```

Puis vérifiez le résultat (`git diff public/data/natinf.json`), mettez à jour `CHANGELOG.md` et republiez une nouvelle version (voir ci-dessous).

## Publier une nouvelle version

1. Faites vos modifications.
2. Incrémentez `version` dans `package.json` (ex. `0.1.0` → `0.2.0`).
3. Ajoutez une entrée dans `CHANGELOG.md`.
4. Commitez et poussez sur `main` (ou la branche déployée).

Une fois hébergée (voir ci-dessous), chaque publication redéploie automatiquement l'app. Les appareils qui ont déjà installé GendKit affichent une bannière « Mettre à jour » à la prochaine ouverture — un tap suffit, pas de réinstallation.

## Héberger et distribuer (gratuit, avec mises à jour automatiques)

Un fichier unique partagé par Google Drive ne permet pas les mises à jour automatiques ni une installation PWA fiable sur Android/iOS (il faut une vraie adresse HTTPS pour ça). La solution gratuite recommandée est un hébergement statique avec un vrai nom de domaine HTTPS.

### Option A — GitHub Pages (déjà configuré dans ce dépôt)

1. Poussez ce dépôt sur GitHub.
2. Dans le repo GitHub : **Settings → Pages → Source : GitHub Actions**.
3. Chaque `git push` sur `main` déclenche le workflow `.github/workflows/deploy.yml`, qui build et publie automatiquement sur `https://<votre-compte>.github.io/<nom-du-repo>/`.
4. Partagez ce lien à vos camarades — ils l'ouvrent une fois, l'installent (voir ci-dessous), et reçoivent ensuite les mises à jour automatiquement.

### Option B — Cloudflare Pages

1. Connectez le dépôt GitHub sur [pages.cloudflare.com](https://pages.cloudflare.com).
2. Build command : `npm run build` — Output directory : `dist`.
3. Ne définissez pas `VITE_BASE_PATH` (la racine `/` convient, Cloudflare Pages sert depuis un sous-domaine dédié).
4. Chaque push redéploie automatiquement, HTTPS et sous-domaine `*.pages.dev` gratuits à vie.

## Installer l'application (une fois hébergée)

- **Android (Chrome)** : ouvrir le lien → menu ⋮ → « Ajouter à l'écran d'accueil » / « Installer l'application ».
- **iOS (Safari)** : ouvrir le lien → bouton Partager → « Sur l'écran d'accueil ».
- **Windows / macOS (Chrome ou Edge)** : ouvrir le lien → icône d'installation dans la barre d'adresse (ou menu ⋮ → « Installer GendKit »).

Dans les trois cas, l'app s'installe localement comme un vrai logiciel (icône, fenêtre dédiée), sans passer par un store, et fonctionne ensuite hors-ligne.

## Structure

- `src/screens/` — les 4 modules (NATINF, Vitesse, Alcool, PVE) + À propos.
- `src/lib/` — logique métier (calculs, base locale IndexedDB, géolocalisation, export PDF).
- `src/data/` — barèmes vitesse/alcool → NATINF (sources citées dans chaque fichier).
- `public/data/natinf.json` — dataset NATINF embarqué (généré par `scripts/update-natinf.mjs`).
- `scripts/update-natinf.mjs` — script de mise à jour du dataset NATINF.
