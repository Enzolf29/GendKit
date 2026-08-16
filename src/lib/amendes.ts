import amendesData from '../data/amendes-classes.json'

export interface AmendeClasse {
  minoree: number | null
  forfaitaire: number
  majoree: number
  note?: string
}

const data = amendesData as { classes: Record<string, AmendeClasse | { note: string }> }

export function getAmendeForNature(nature: string): AmendeClasse | { note: string } | undefined {
  return data.classes[nature]
}
