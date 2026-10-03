import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { getTopCategory, getCategoryPath, getSubCategories, getSubSubCategories } from '../src/lib/transportCategory.ts'

const dataset = JSON.parse(readFileSync(new URL('../public/data/natinf.json', import.meta.url), 'utf8')).infractions
const entry = (id) => {
  const found = dataset.find((item) => item.numero === id)
  assert.ok(found, `NATINF ${id} absent du dataset`)
  return found
}
const path = (id) => getCategoryPath(entry(id)).join(' › ')

test('Maintien en circulation sans contrôle technique : véhicule léger sous Code de la route › Contrôle technique', () => {
  for (const id of ['12522', '12523']) {
    assert.equal(path(id), 'Code de la route › Équipement et contrôle du véhicule › Contrôle technique', `NATINF ${id}`)
  }
})

test('Toutes les infractions « maintien en circulation sans contrôle/visite technique » sont rangées sous un contrôle technique', () => {
  const rows = dataset.filter((e) => /MAINTIEN EN CIRCULATION.*SANS (CONTROLE|VISITE) TECHNIQUE/i.test(e.qualification))
  assert.ok(rows.length >= 12, `seulement ${rows.length} infractions trouvées`)
  for (const e of rows) {
    assert.match(getCategoryPath(e).join(' › '), /Contrôle technique/, `NATINF ${e.numero} : ${getCategoryPath(e).join(' › ')}`)
  }
})

test('Un véhicule de PTAC inférieur à 3,5 tonnes n\'est pas classé en Poids Lourds', () => {
  const rows = dataset.filter((e) => /PTAC (INFERIEUR|<)/i.test(e.qualification) && !/VEHICULE LOURD|POIDS LOURD/i.test(e.qualification))
  assert.ok(rows.length > 5)
  for (const e of rows) assert.notEqual(getTopCategory(e), 'Poids Lourds', `NATINF ${e.numero}`)
})

test('Un véhicule de plus de 3,5 tonnes reste classé en Poids Lourds', () => {
  for (const id of ['6199', '6249', '12525', '12883', '22854']) assert.equal(getTopCategory(entry(id)), 'Poids Lourds', `NATINF ${id}`)
})

test('Les surcharges de poids ne sont pas rangées sous « Dépassement »', () => {
  const rows = dataset.filter((e) => /SURCHARGE/i.test(e.qualification))
  assert.ok(rows.length > 10)
  for (const e of rows) assert.doesNotMatch(getCategoryPath(e).join(' › '), /Dépassement/, `NATINF ${e.numero}`)
})

test('Un petit train routier n\'est pas classé en Ferroviaire', () => {
  assert.notEqual(getTopCategory(entry('22743')), 'Ferroviaire')
  assert.match(path('22743'), /Contrôle technique/)
})

test('Chaque infraction du dataset reçoit une catégorie', () => {
  for (const e of dataset) assert.ok(getTopCategory(e), `NATINF ${e.numero}`)
})

test('Les sous-catégories sont classées par ordre alphabétique, « Autres » en dernier', () => {
  const alpha = (a, b) => a.localeCompare(b, 'fr', { sensitivity: 'base' })
  for (const top of ['Code de la route', '2 Roues', 'Poids Lourds', 'Maritime', 'Ferroviaire', 'Aérien', 'Outrage et rébellion', 'Stupéfiants (usage, détention, trafic)']) {
    const subs = getSubCategories(top)
    assert.equal(subs.at(-1), 'Autres', top)
    const named = subs.slice(0, -1)
    assert.deepEqual(named, [...named].sort(alpha), `sous-catégories de ${top}`)
    for (const sub of named) {
      const subSubs = getSubSubCategories(top, sub)
      assert.deepEqual(subSubs, [...subSubs].sort(alpha), `${top} › ${sub}`)
    }
  }
  assert.deepEqual(getSubCategories('Code de la route').slice(0, 3), ['Accidents et fuite', 'Âge minimum de conduite', 'Alcool et stupéfiants'])
})
