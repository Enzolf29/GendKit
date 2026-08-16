import { useEffect } from 'react'

/**
 * Fait en sorte que le bouton/geste "retour" du téléphone ferme la modale
 * au lieu de quitter l'application (réflexe naturel sur mobile). Pousse une
 * entrée d'historique factice à l'ouverture ; au "popstate" (retour), on
 * ferme la modale au lieu de la laisser naviguer en arrière dans le site.
 *
 * On ne tente pas de "dépiler" cette entrée quand la modale se ferme par la
 * croix (plutôt que par le bouton retour) : un history.back() en cleanup est
 * asynchrone et entre en conflit avec le double-montage des effets en mode
 * développement (StrictMode), ce qui refermait la modale instantanément.
 * Laisser l'entrée en place est sans danger (même URL, invisible pour
 * l'utilisateur) — au pire un "retour" plus tard sera silencieusement absorbé.
 */
export function useModalBackButton(onClose: () => void): void {
  useEffect(() => {
    window.history.pushState({ gendkitModal: true }, '')

    function onPopState() {
      onClose()
    }

    window.addEventListener('popstate', onPopState)
    return () => {
      window.removeEventListener('popstate', onPopState)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])
}
