import type { PveDraft, PvePhoto } from './types'

// Dessine la photo sur un canvas plutôt que d'injecter les octets bruts du
// fichier dans le PDF : le navigateur applique alors l'orientation EXIF de la
// photo (prise en portrait par un téléphone) au moment du dessin, ce qui
// évite que l'image ressorte pivotée de 90° dans le PDF final.
function loadPhotoAsCanvasDataUrl(blob: Blob): Promise<{ dataUrl: string; width: number; height: number }> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(blob)
    const img = new Image()
    img.onload = () => {
      const canvas = document.createElement('canvas')
      canvas.width = img.naturalWidth
      canvas.height = img.naturalHeight
      const ctx = canvas.getContext('2d')
      if (!ctx) {
        URL.revokeObjectURL(url)
        reject(new Error('Canvas non disponible'))
        return
      }
      ctx.drawImage(img, 0, 0)
      URL.revokeObjectURL(url)
      resolve({ dataUrl: canvas.toDataURL('image/jpeg', 0.85), width: canvas.width, height: canvas.height })
    }
    img.onerror = () => {
      URL.revokeObjectURL(url)
      reject(new Error('Impossible de charger la photo'))
    }
    img.src = url
  })
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleString('fr-FR')
}

export async function exportDraftToPdf(draft: PveDraft, photos: PvePhoto[]): Promise<void> {
  const { jsPDF } = await import('jspdf')
  const doc = new jsPDF({ unit: 'mm', format: 'a4' })
  const margin = 15
  const pageWidth = doc.internal.pageSize.getWidth()
  const pageHeight = doc.internal.pageSize.getHeight()
  let y = margin

  function checkPageBreak(needed: number) {
    if (y + needed > pageHeight - margin) {
      doc.addPage()
      y = margin
    }
  }

  doc.setFontSize(16)
  doc.setFont('helvetica', 'bold')
  doc.text('GendKit — Mémo PVE', margin, y)
  y += 6
  doc.setFontSize(9)
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(120)
  doc.text("Aide-mémoire de terrain — ne remplace pas le procès-verbal officiel", margin, y)
  doc.setTextColor(0)
  y += 8

  doc.setFontSize(10)
  doc.text(`Créé le : ${formatDate(draft.createdAt)}`, margin, y)
  y += 5
  doc.text(`Dernière modification : ${formatDate(draft.updatedAt)}`, margin, y)
  y += 8

  doc.setFont('helvetica', 'bold')
  doc.text('Immatriculation', margin, y)
  doc.setFont('helvetica', 'normal')
  doc.text(draft.immatriculation || '—', margin + 45, y)
  y += 7

  doc.setFont('helvetica', 'bold')
  doc.text('Heure', margin, y)
  doc.setFont('helvetica', 'normal')
  doc.text(draft.heure || '—', margin + 45, y)
  y += 7

  doc.setFont('helvetica', 'bold')
  doc.text('Lieu', margin, y)
  doc.setFont('helvetica', 'normal')
  if (draft.lieu) {
    const lieuText =
      draft.lieu.adresse ||
      (draft.lieu.lat != null ? `${draft.lieu.lat.toFixed(5)}, ${draft.lieu.lng!.toFixed(5)} (± ${Math.round(draft.lieu.accuracy ?? 0)} m)` : '—')
    const lines = doc.splitTextToSize(lieuText, pageWidth - margin - 45 - margin)
    doc.text(lines, margin + 45, y)
    y += 5 * lines.length
  } else {
    doc.text('—', margin + 45, y)
    y += 5
  }
  y += 4

  doc.setFont('helvetica', 'bold')
  doc.text('NATINF liés', margin, y)
  y += 6
  doc.setFont('helvetica', 'normal')
  if (draft.natinfs.length === 0) {
    doc.text('Aucun', margin + 4, y)
    y += 5
  } else {
    for (const n of draft.natinfs) {
      checkPageBreak(10)
      const lines = doc.splitTextToSize(`NATINF ${n.numero} — ${n.qualification}`, pageWidth - 2 * margin - 4)
      doc.text(lines, margin + 4, y)
      y += 5 * lines.length
    }
  }
  y += 4

  doc.setFont('helvetica', 'bold')
  doc.text('Observations', margin, y)
  y += 6
  doc.setFont('helvetica', 'normal')
  const obsLines = doc.splitTextToSize(draft.observations || '—', pageWidth - 2 * margin)
  checkPageBreak(5 * obsLines.length)
  doc.text(obsLines, margin, y)
  y += 5 * obsLines.length + 4

  if (photos.length > 0) {
    doc.setFont('helvetica', 'bold')
    checkPageBreak(10)
    doc.text('Photos jointes', margin, y)
    y += 4

    const maxWidth = pageWidth - 2 * margin
    const maxHeight = pageHeight - 2 * margin

    for (const photo of photos) {
      const { dataUrl, width, height } = await loadPhotoAsCanvasDataUrl(photo.blob)
      let imgWidth = maxWidth
      let imgHeight = (imgWidth * height) / width
      if (imgHeight > maxHeight) {
        imgHeight = maxHeight
        imgWidth = (imgHeight * width) / height
      }
      checkPageBreak(imgHeight + 6)
      doc.addImage(dataUrl, 'JPEG', margin, y, imgWidth, imgHeight, undefined, 'MEDIUM')
      y += imgHeight + 6
    }
  }

  doc.save(`PVE_${draft.immatriculation || 'brouillon'}_${draft.id}.pdf`)
}
