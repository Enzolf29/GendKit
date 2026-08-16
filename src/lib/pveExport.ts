import type { PveDraft, PvePhoto } from './types'

function blobToDataUrl(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = reject
    reader.readAsDataURL(blob)
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
  doc.text('GendKit — Fiche de préparation PVE', margin, y)
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
  doc.text('Lieu', margin, y)
  doc.setFont('helvetica', 'normal')
  if (draft.lieu) {
    const lieuText = draft.lieu.adresse || `${draft.lieu.lat.toFixed(5)}, ${draft.lieu.lng.toFixed(5)} (± ${Math.round(draft.lieu.accuracy)} m)`
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

    for (const photo of photos) {
      const dataUrl = await blobToDataUrl(photo.blob)
      const imgWidth = pageWidth - 2 * margin
      const imgHeight = imgWidth * 0.65
      checkPageBreak(imgHeight + 6)
      try {
        doc.addImage(dataUrl, 'JPEG', margin, y, imgWidth, imgHeight, undefined, 'MEDIUM')
      } catch {
        doc.addImage(dataUrl, 'PNG', margin, y, imgWidth, imgHeight, undefined, 'MEDIUM')
      }
      y += imgHeight + 6
    }
  }

  doc.save(`PVE_${draft.immatriculation || 'brouillon'}_${draft.id}.pdf`)
}
