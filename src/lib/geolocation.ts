import type { PveLocation } from './types'

export class GeolocationError extends Error {
  code: number
  constructor(code: number, message: string) {
    super(message)
    this.code = code
  }
}

export function getCurrentLocation(): Promise<PveLocation> {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new GeolocationError(0, "La géolocalisation n'est pas disponible sur cet appareil."))
      return
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        resolve({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
          accuracy: pos.coords.accuracy,
          capturedAt: new Date().toISOString(),
        })
      },
      (err) => {
        reject(new GeolocationError(err.code, err.message))
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 }
    )
  })
}

// Une fois la géolocalisation refusée, le navigateur mémorise ce blocage pour
// le site et ne réaffiche plus jamais le pop-up automatiquement (comportement
// de sécurité standard, aucune API web ne permet de le forcer) : il faut que
// l'utilisateur réinitialise lui-même la permission dans les réglages du
// navigateur. On donne donc un message d'erreur qui explique exactement quoi
// faire plutôt que le message brut du navigateur ("User denied Geolocation").
export function describeGeolocationError(err: unknown): string {
  if (err instanceof GeolocationError) {
    switch (err.code) {
      case 1: // PERMISSION_DENIED
        return "Localisation bloquée pour cette application. Réinstaller l'app ou changer la permission dans les réglages Android ne suffit pas : il faut réinitialiser l'autorisation du SITE dans le navigateur. Ouvrez ce lien dans Brave (pas via le raccourci installé), appuyez sur l'icône à gauche de la barre d'adresse (ⓘ ou 🔒) → Autorisations → Localisation → Autoriser. Puis rechargez la page."
      case 2: // POSITION_UNAVAILABLE
        return 'Position indisponible pour le moment (GPS désactivé ou signal insuffisant). Vérifiez que la localisation est activée sur le téléphone.'
      case 3: // TIMEOUT
        return 'La localisation a pris trop de temps à répondre. Réessayez, si possible à l’extérieur ou près d’une fenêtre.'
      default:
        return err.message || 'Impossible de récupérer la position.'
    }
  }
  return err instanceof Error ? err.message : 'Impossible de récupérer la position.'
}

export async function getGeolocationPermissionState(): Promise<PermissionState | 'unsupported'> {
  if (!navigator.permissions?.query) return 'unsupported'
  try {
    const status = await navigator.permissions.query({ name: 'geolocation' as PermissionName })
    return status.state
  } catch {
    return 'unsupported'
  }
}

export async function reverseGeocode(lat: number, lng: number): Promise<string | null> {
  if (!navigator.onLine) return null
  try {
    const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}&zoom=18`, {
      headers: { Accept: 'application/json' },
    })
    if (!res.ok) return null
    const json = await res.json()
    return json.display_name ?? null
  } catch {
    return null
  }
}
