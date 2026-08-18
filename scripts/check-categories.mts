import { readFileSync } from 'node:fs'
import { getTopCategory, hasSubCategories, getSubCategories, getSubCategory } from '../src/lib/transportCategory.ts'

const data = JSON.parse(readFileSync(new URL('../public/data/natinf.json', import.meta.url), 'utf-8'))

const counts: Record<string, number> = {}
for (const e of data.infractions) {
  const c = getTopCategory(e)
  counts[c] = (counts[c] || 0) + 1
}
const total = Object.values(counts).reduce((a, b) => a + b, 0)
console.log('total classé:', total, '/', data.infractions.length)
Object.entries(counts)
  .sort((a, b) => b[1] - a[1])
  .forEach(([k, v]) => console.log(v, k))

console.log('\n--- sous-catégories par mode de transport ---')
for (const top of ['Code de la route', '2 Roues', 'Poids Lourds', 'Maritime', 'Ferroviaire', 'Aérien', 'Outrage et rébellion', 'Stupéfiants (usage, détention, trafic)']) {
  if (!hasSubCategories(top)) continue
  const subs = getSubCategories(top)
  const subCounts: Record<string, number> = {}
  for (const e of data.infractions) {
    if (getTopCategory(e) !== top) continue
    const s = getSubCategory(top, e).sub
    subCounts[s] = (subCounts[s] || 0) + 1
  }
  console.log(`\n${top} (${subs.length} sous-catégories):`)
  subs.forEach((s) => console.log('  ', subCounts[s] || 0, s))
}
