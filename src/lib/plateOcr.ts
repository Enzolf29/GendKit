// Lecture de plaque d'immatriculation par OCR, entièrement côté client
// (Tesseract.js, WebAssembly) — aucune donnée envoyée à un serveur.
// Nécessite un réseau au premier usage (téléchargement du moteur OCR),
// qui peut ensuite rester en cache navigateur.

import type { Page } from 'tesseract.js'

const SIV_PATTERN = /([A-HJ-NP-TV-Z]{2})[\s-]*(\d{3})[\s-]*([A-HJ-NP-TV-Z]{2})/

function extractPlate(rawText: string): string | null {
  const cleaned = rawText.toUpperCase()
  const match = cleaned.match(SIV_PATTERN)
  if (!match) return null
  return `${match[1]}-${match[2]}-${match[3]}`
}

// Passer par les lignes détectées (avec leur confiance individuelle) plutôt
// que par le texte brut de la page évite deux problèmes : une plaque bien
// lue mais noyée dans du texte parasite de faible confiance (logos,
// inscriptions sur la carrosserie) qui produirait une correspondance
// aléatoire, et une plaque correcte qu'on validerait à tort si le reste de
// l'image contient du bruit qui matche le motif par hasard.
function collectLines(page: Page): { text: string; confidence: number }[] {
  const lines: { text: string; confidence: number }[] = []
  for (const block of page.blocks ?? []) {
    for (const para of block.paragraphs) {
      for (const line of para.lines) {
        lines.push({ text: line.text, confidence: line.confidence })
      }
    }
  }
  return lines
}

// Prétraitement : niveaux de gris + étirement de contraste, et agrandissement
// des petites images. Les plaques photographiées de loin ou avec peu de
// contraste (reflets, luminosité) sont la cause la plus fréquente d'échec
// de lecture par Tesseract.
async function preprocessForOcr(image: Blob | File): Promise<Blob> {
  const bitmap = await createImageBitmap(image)
  const scale = bitmap.width < 900 ? 900 / bitmap.width : 1
  const w = Math.round(bitmap.width * scale)
  const h = Math.round(bitmap.height * scale)
  const canvas = document.createElement('canvas')
  canvas.width = w
  canvas.height = h
  const ctx = canvas.getContext('2d')
  if (!ctx) return image
  ctx.drawImage(bitmap, 0, 0, w, h)
  const imgData = ctx.getImageData(0, 0, w, h)
  const d = imgData.data
  const gray = new Uint8ClampedArray(w * h)
  let min = 255
  let max = 0
  for (let i = 0, p = 0; i < d.length; i += 4, p++) {
    const g = 0.299 * d[i] + 0.587 * d[i + 1] + 0.114 * d[i + 2]
    gray[p] = g
    if (g < min) min = g
    if (g > max) max = g
  }
  const range = Math.max(1, max - min)
  for (let i = 0, p = 0; i < d.length; i += 4, p++) {
    const v = ((gray[p] - min) / range) * 255
    d[i] = d[i + 1] = d[i + 2] = v
  }
  ctx.putImageData(imgData, 0, 0)
  return new Promise((resolve) => {
    canvas.toBlob((blob) => resolve(blob ?? image), 'image/png')
  })
}

let workerPromise: ReturnType<typeof createWorkerOnce> | null = null

async function createWorkerOnce() {
  const { createWorker, PSM } = await import('tesseract.js')
  const worker = await createWorker('eng')
  await worker.setParameters({
    tessedit_char_whitelist: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789- ',
    // Une plaque photographiée n'a pas la mise en page d'un document : on
    // demande à Tesseract de chercher du texte sans supposer de structure
    // de page, plutôt que le mode par défaut qui échoue souvent sur ce
    // type d'image (d'où les "plaque introuvable" sur de vraies photos).
    tessedit_pageseg_mode: PSM.SPARSE_TEXT,
  })
  return worker
}

function getWorker() {
  if (!workerPromise) workerPromise = createWorkerOnce()
  return workerPromise
}

export async function recognizePlate(image: Blob | File, options: { minConfidence?: number } = {}): Promise<string | null> {
  const minConfidence = options.minConfidence ?? 45
  const worker = await getWorker()
  const prepared = await preprocessForOcr(image)
  const { data } = await worker.recognize(prepared, {}, { blocks: true })

  const lines = collectLines(data)
  for (const line of lines) {
    if (line.confidence < minConfidence) continue
    const plate = extractPlate(line.text)
    if (plate) return plate
  }
  return null
}
