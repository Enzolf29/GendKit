import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'
import { readFileSync } from 'node:fs'

const pkg = JSON.parse(readFileSync(new URL('./package.json', import.meta.url), 'utf-8'))

// Sur GitHub Pages (page de projet), l'app est servie depuis /<nom-du-repo>/.
// Le workflow CI positionne VITE_BASE_PATH en conséquence ; en local ou sur
// Cloudflare Pages (sous-domaine dédié), la racine "/" convient.
const base = process.env.VITE_BASE_PATH || '/'

// https://vite.dev/config/
export default defineConfig({
  base,
  define: {
    __APP_VERSION__: JSON.stringify(pkg.version),
  },
  plugins: [
    react(),
    VitePWA({
      registerType: 'prompt',
      includeAssets: ['favicon.png', 'icons/*.png'],
      manifest: {
        name: 'GendKit — La boîte à outils du gendarme',
        short_name: 'GendKit',
        description: 'Boîte à outils pour la réserve opérationnelle : NATINF, vitesse, alcoolémie, PVE.',
        lang: 'fr',
        theme_color: '#001b47',
        background_color: '#001b47',
        display: 'standalone',
        orientation: 'portrait-primary',
        // Doivent pointer vers le chemin réel de déploiement (ex. /GendKit/ sur
        // GitHub Pages) sinon l'app installée s'ouvre sur la racine du domaine
        // et tombe sur un 404.
        start_url: base,
        scope: base,
        icons: [
          { src: 'icons/icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: 'icons/icon-512.png', sizes: '512x512', type: 'image/png' },
          { src: 'icons/icon-512-maskable.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,png,svg,json,ico}'],
        // Le dataset NATINF (~4 Mo) doit être précaché pour la recherche offline dès l'installation.
        maximumFileSizeToCacheInBytes: 8 * 1024 * 1024,
      },
      devOptions: {
        enabled: true,
      },
    }),
  ],
})
