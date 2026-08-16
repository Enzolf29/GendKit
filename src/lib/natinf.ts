import type { NatinfEntry } from './types'

interface NatinfDataset {
  source: string
  sourceTitle: string
  generatedAt: string
  count: number
  infractions: NatinfEntry[]
}

let dataset: NatinfDataset | null = null
let byNumero: Map<string, NatinfEntry> = new Map()
let loadPromise: Promise<void> | null = null

export function loadNatinfDataset(): Promise<void> {
  if (dataset) return Promise.resolve()
  if (!loadPromise) {
    loadPromise = fetch(`${import.meta.env.BASE_URL}data/natinf.json`)
      .then((res) => {
        if (!res.ok) throw new Error(`Échec du chargement du dataset NATINF (${res.status})`)
        return res.json()
      })
      .then((json: NatinfDataset) => {
        dataset = json
        byNumero = new Map(json.infractions.map((e) => [e.numero, e]))
      })
  }
  return loadPromise
}

export const natinfMeta = {
  get source() {
    return dataset?.source ?? ''
  },
  get sourceTitle() {
    return dataset?.sourceTitle ?? ''
  },
  get generatedAt() {
    return dataset?.generatedAt ?? ''
  },
  get count() {
    return dataset?.count ?? 0
  },
}

export function getNatinfByNumero(numero: string): NatinfEntry | undefined {
  return byNumero.get(numero.trim())
}

export function getAllNatures(): string[] {
  if (!dataset) return []
  return [...new Set(dataset.infractions.map((e) => e.nature))].sort()
}

function normalize(s: string): string {
  return s
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
}

export function searchNatinf(
  query: string,
  options: { nature?: string; limit?: number } = {}
): NatinfEntry[] {
  if (!dataset) return []
  const limit = options.limit ?? 150
  const q = normalize(query.trim())
  const nature = options.nature

  let results = dataset.infractions

  if (nature) {
    results = results.filter((e) => e.nature === nature)
  }

  if (!q) {
    return nature ? results.slice(0, limit) : []
  }

  const isNumeric = /^\d+$/.test(q)
  const tokens = q.split(/\s+/).filter(Boolean)
  const matches: NatinfEntry[] = []

  for (const entry of results) {
    let isMatch: boolean
    if (isNumeric) {
      isMatch = entry.numero.startsWith(q)
    } else {
      const haystack = normalize(entry.qualification) + ' ' + normalize(entry.definiePar)
      isMatch = entry.numero === q || tokens.every((t) => haystack.includes(t))
    }
    if (isMatch) {
      matches.push(entry)
      if (matches.length >= limit) break
    }
  }

  return matches
}
