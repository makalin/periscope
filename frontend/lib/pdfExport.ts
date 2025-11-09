import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import { Claim, LeaderboardEntry } from './api'
import { format } from 'date-fns'

export interface ReportData {
  title: string
  generatedAt: Date
  claims?: Claim[]
  leaderboard?: LeaderboardEntry[]
  statistics?: {
    totalClaims: number
    resolvedClaims: number
    averagePerimeter: number
    domainBreakdown: Record<string, number>
  }
}

export function generatePDFReport(data: ReportData): void {
  const doc = new jsPDF()
  const pageWidth = doc.internal.pageSize.getWidth()
  const pageHeight = doc.internal.pageSize.getHeight()
  let yPosition = 20

  // Header
  doc.setFontSize(20)
  doc.setFont('helvetica', 'bold')
  doc.text('Periscope Report', pageWidth / 2, yPosition, { align: 'center' })
  yPosition += 10

  doc.setFontSize(12)
  doc.setFont('helvetica', 'normal')
  doc.text(data.title, pageWidth / 2, yPosition, { align: 'center' })
  yPosition += 8

  doc.setFontSize(10)
  doc.setTextColor(100, 100, 100)
  doc.text(
    `Generated: ${format(data.generatedAt, 'PPpp')}`,
    pageWidth / 2,
    yPosition,
    { align: 'center' }
  )
  yPosition += 15

  // Statistics Section
  if (data.statistics) {
    doc.setTextColor(0, 0, 0)
    doc.setFontSize(14)
    doc.setFont('helvetica', 'bold')
    doc.text('Statistics', 14, yPosition)
    yPosition += 8

    doc.setFontSize(10)
    doc.setFont('helvetica', 'normal')
    doc.text(`Total Claims: ${data.statistics.totalClaims}`, 14, yPosition)
    yPosition += 6
    doc.text(`Resolved Claims: ${data.statistics.resolvedClaims}`, 14, yPosition)
    yPosition += 6
    doc.text(
      `Average Perimeter: ${data.statistics.averagePerimeter.toFixed(2)}`,
      14,
      yPosition
    )
    yPosition += 10

    // Domain Breakdown
    if (Object.keys(data.statistics.domainBreakdown).length > 0) {
      doc.setFont('helvetica', 'bold')
      doc.text('Domain Breakdown:', 14, yPosition)
      yPosition += 6
      doc.setFont('helvetica', 'normal')
      Object.entries(data.statistics.domainBreakdown).forEach(([domain, count]) => {
        doc.text(`${domain}: ${count}`, 20, yPosition)
        yPosition += 6
      })
      yPosition += 5
    }
  }

  // Leaderboard Table
  if (data.leaderboard && data.leaderboard.length > 0) {
    if (yPosition > pageHeight - 60) {
      doc.addPage()
      yPosition = 20
    }

    doc.setFontSize(14)
    doc.setFont('helvetica', 'bold')
    doc.text('Leaderboard', 14, yPosition)
    yPosition += 8

    autoTable(doc, {
      startY: yPosition,
      head: [['Rank', 'Forecaster', 'Claims', 'Resolved', 'Avg Perimeter', 'Weighted Perimeter']],
      body: data.leaderboard.map((entry, index) => [
        (index + 1).toString(),
        entry.forecaster_name || 'Unknown',
        entry.total_claims.toString(),
        entry.resolved_claims.toString(),
        entry.average_perimeter.toFixed(2),
        entry.weighted_perimeter.toFixed(2),
      ]),
      theme: 'striped',
      headStyles: { fillColor: [14, 165, 233] },
      styles: { fontSize: 9 },
    })

    yPosition = (doc as any).lastAutoTable.finalY + 10
  }

  // Claims Table
  if (data.claims && data.claims.length > 0) {
    if (yPosition > pageHeight - 60) {
      doc.addPage()
      yPosition = 20
    }

    doc.setFontSize(14)
    doc.setFont('helvetica', 'bold')
    doc.text('Claims', 14, yPosition)
    yPosition += 8

    autoTable(doc, {
      startY: yPosition,
      head: [['Text', 'Domain', 'Type', 'Status', 'Perimeter', 'Forecaster', 'Date']],
      body: data.claims.map((claim) => [
        claim.text.substring(0, 40) + (claim.text.length > 40 ? '...' : ''),
        claim.domain,
        claim.claim_type,
        claim.status,
        claim.perimeter_score ? claim.perimeter_score.toFixed(2) : 'N/A',
        claim.forecaster_name || 'Unknown',
        format(new Date(claim.created_at), 'MMM dd, yyyy'),
      ]),
      theme: 'striped',
      headStyles: { fillColor: [14, 165, 233] },
      styles: { fontSize: 8 },
      columnStyles: {
        0: { cellWidth: 60 },
        1: { cellWidth: 25 },
        2: { cellWidth: 25 },
        3: { cellWidth: 20 },
        4: { cellWidth: 20 },
        5: { cellWidth: 30 },
        6: { cellWidth: 25 },
      },
    })
  }

  // Footer
  const totalPages = doc.getNumberOfPages()
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i)
    doc.setFontSize(8)
    doc.setTextColor(100, 100, 100)
    doc.text(
      `Page ${i} of ${totalPages}`,
      pageWidth / 2,
      pageHeight - 10,
      { align: 'center' }
    )
    doc.text(
      'Periscope - Prediction Intelligence',
      pageWidth / 2,
      pageHeight - 5,
      { align: 'center' }
    )
  }

  // Save PDF
  const fileName = `periscope-report-${format(new Date(), 'yyyy-MM-dd-HHmmss')}.pdf`
  doc.save(fileName)
}

export function generateClaimsPDF(claims: Claim[], title: string = 'Claims Report'): void {
  const statistics = {
    totalClaims: claims.length,
    resolvedClaims: claims.filter((c) => c.status === 'resolved').length,
    averagePerimeter:
      claims
        .filter((c) => c.perimeter_score !== undefined)
        .reduce((sum, c) => sum + (c.perimeter_score || 0), 0) /
      claims.filter((c) => c.perimeter_score !== undefined).length || 0,
    domainBreakdown: claims.reduce((acc, claim) => {
      acc[claim.domain] = (acc[claim.domain] || 0) + 1
      return acc
    }, {} as Record<string, number>),
  }

  generatePDFReport({
    title,
    generatedAt: new Date(),
    claims,
    statistics,
  })
}

export function generateLeaderboardPDF(
  leaderboard: LeaderboardEntry[],
  title: string = 'Leaderboard Report'
): void {
  generatePDFReport({
    title,
    generatedAt: new Date(),
    leaderboard,
  })
}

