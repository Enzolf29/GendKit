import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { getPointsForNatinf } from '../src/lib/points.ts'

const read = (path) => JSON.parse(readFileSync(new URL(path, import.meta.url), 'utf8'))
const dataset = read('../public/data/natinf.json').infractions
const rules = read('../src/data/points-rules.json')
const entry = (id) => {
  const found = dataset.find((item) => item.numero === id)
  assert.ok(found, `NATINF ${id} absent du dataset`)
  return found
}

// Attendus issus des articles et du référentiel officiel, indépendants de la table applicative.
const regressions = {
  '256': 4, '32971': 0, // Sens interdit / redevable seulement
  '12929': 3, '12930': 0, // Ceinture conducteur / passager
  '12931': 3, '12932': 0, '12933': 0,
  '32032': 0, '32033': 0, '32034': 1, '32035': 1,
  '7557': 6, '22909': 6, '11052': 4, '11053': 3,
  '23082': 3, '28649': 1, '5707': 6, '7953': 0,
  '35273': 0, '35274': 0, '25386': 1, '11302': 2,
  '11301': 3, '21527': 4, '21526': 6,
  '51': 6, '2000': 0, '8544': 6, '29256': 6,
  '23761': 6, '23762': 9, '29259': 9,
  '202': 6, '26959': 6, '26960': 6, '28031': 6,
  '6091': 4, '6102': 3, '11063': 4, '31063': 3,
  '50': 6, '42': 6, '35564': 2, '35940': 6,
  '29130': 0, // L234-16 : aucune réduction de points, contrairement aux autres délits alcool
}

for (const [id, expected] of Object.entries(regressions)) {
  test(`NATINF ${id} : ${expected} points`, () => {
    assert.equal(getPointsForNatinf(entry(id))?.points, expected)
  })
}

test('Une fiche absente du barème reste inconnue, et ne devient pas zéro', () => {
  assert.equal(getPointsForNatinf(entry('4080')), undefined) // Sens interdit ferroviaire
  assert.equal(getPointsForNatinf(entry('34089')), undefined) // Stupéfiants à bord d'un bateau
  assert.equal(getPointsForNatinf(entry('6090')), undefined)
})

test('Tous les redevables L121-3 restent à zéro, indépendamment du barème conducteur', () => {
  const redevables = dataset.filter((e) => e.qualification.startsWith("REDEVABLE DE L'AMENDE") && /ART\.L\.121-3\b/.test(e.definiePar))
  assert.ok(redevables.length > 10)
  for (const e of redevables) assert.equal(getPointsForNatinf(e)?.points, 0, e.numero)
})

test('Chaque correspondance est unique, existe dans le dataset et possède une source officielle', () => {
  const seen = new Set()
  for (const group of rules.groups) {
    assert.ok([0, 1, 2, 3, 4, 6, 9].includes(group.points))
    const source = rules.sources[group.source]
    assert.ok(source?.label)
    assert.match(new URL(source.url).hostname, /(^|\.)(legifrance|service-public|securite-routiere)\.gouv\.fr$/)
    for (const id of group.natinfs) {
      assert.ok(!seen.has(id), `Doublon ${id}`)
      seen.add(id)
      entry(id)
    }
  }
})

test('La version affichée dans les nouveautés correspond à la version livrée', () => {
  const releases = read('../src/data/releases.json')
  assert.equal(releases[0].version, read('../package.json').version)
  assert.equal(read('../package-lock.json').version, releases[0].version)
  assert.equal(new Set(releases.map((r) => r.version)).size, releases.length)
})

test('Les points des barèmes Vitesse et Alcool concordent avec le barème principal', () => {
  const speed = read('../src/data/speed-brackets.json').brackets
  const alcohol = read('../src/data/alcohol-brackets.json').standardBrackets
  for (const row of [...speed, ...alcohol]) {
    if (row.points === undefined) continue
    assert.equal(getPointsForNatinf(entry(row.natinf))?.points, row.points, `NATINF ${row.natinf}`)
  }
})

test('Les notes de suspension ne mélangent pas les NATINF du Code pénal, du Code de la santé publique et du Code de la route', () => {
  const notes = Object.fromEntries(read('../src/data/observations.json').entries.map((e) => [e.natinf, e.note]))
  assert.doesNotMatch(notes['7953'], /L\.224-16 C\.route\)\.$/) // 7953 relève de l'article 434-41 du Code pénal
  assert.match(notes['7953'], /434-41/)
  assert.match(notes['2000'], /L\.3354-2/)
  assert.doesNotMatch(notes['2000'], /suspension du permis jusqu'à 3 ans possible/)
})
