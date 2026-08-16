// Lecture de plaque d'immatriculation par OCR, entièrement côté client
// (Tesseract.js, WebAssembly) — aucune donnée envoyée à un serveur.
// Nécessite un réseau au premier usage (téléchargement du moteur OCR),
// qui peut ensuite rester en cache navigateur.

const SIV_PATTERN = /([A-HJ-NP-TV-Z]{2})[\s-]*(\d{3})[\s-]*([A-HJ-NP-TV-Z]{2})/

function extractPlate(rawText: string): string | null {
  const cleaned = rawText.toUpperCase()
  const match = cleaned.match(SIV_PATTERN)
  if (!match) return null
  return `${match[1]}-${match[2]}-${match[3]}`
}

let workerPromise: ReturnType<typeof createWorkerOnce> | null = null

async function createWorkerOnce() {
  const { createWorker } = await import('tesseract.js')
  const worker = await createWorker('eng')
  await worker.setParameters({
    tessedit_char_whitelist: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789- ',
  })
  return worker
}

function getWorker() {
  if (!workerPromise) workerPromise = createWorkerOnce()
  return workerPromise
}

export async function recognizePlate(image: Blob | File): Promise<string | null> {
  const worker = await getWorker()
  const { data } = await worker.recognize(image)
  return extractPlate(data.text)
}
