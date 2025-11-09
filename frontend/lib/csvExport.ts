import { Claim, LeaderboardEntry } from './api'
import { format } from 'date-fns'

export function exportClaimsToCSV(claims: Claim[], filename?: string): void {
  const headers = [
    'ID',
    'Text',
    'Domain',
    'Type',
    'Predicted Value',
    'Predicted Category',
    'Predicted Probability',
    'Status',
    'Perimeter Score',
    'Forecaster',
    'Forecaster Username',
    'Created At',
  ]

  const rows = claims.map((claim) => [
    claim.id,
    `"${claim.text.replace(/"/g, '""')}"`, // Escape quotes in CSV
    claim.domain,
    claim.claim_type,
    claim.predicted_value?.toString() || '',
    claim.predicted_category || '',
    claim.predicted_probability?.toString() || '',
    claim.status,
    claim.perimeter_score?.toString() || '',
    claim.forecaster_name || '',
    claim.forecaster_username || '',
    format(new Date(claim.created_at), 'yyyy-MM-dd HH:mm:ss'),
  ])

  const csvContent = [headers.join(','), ...rows.map((row) => row.join(','))].join('\n')

  // Create blob and download
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
  const link = document.createElement('a')
  const url = URL.createObjectURL(blob)
  link.setAttribute('href', url)
  link.setAttribute(
    'download',
    filename || `claims-export-${format(new Date(), 'yyyy-MM-dd-HHmmss')}.csv`
  )
  link.style.visibility = 'hidden'
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

export function exportLeaderboardToCSV(
  leaderboard: LeaderboardEntry[],
  filename?: string
): void {
  const headers = [
    'Rank',
    'Forecaster ID',
    'Forecaster Name',
    'Forecaster Username',
    'Total Claims',
    'Resolved Claims',
    'Average Perimeter',
    'Weighted Perimeter',
  ]

  const rows = leaderboard.map((entry, index) => [
    (index + 1).toString(),
    entry.forecaster_id,
    entry.forecaster_name,
    entry.forecaster_username || '',
    entry.total_claims.toString(),
    entry.resolved_claims.toString(),
    entry.average_perimeter.toFixed(2),
    entry.weighted_perimeter.toFixed(2),
  ])

  const csvContent = [headers.join(','), ...rows.map((row) => row.join(','))].join('\n')

  // Create blob and download
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
  const link = document.createElement('a')
  const url = URL.createObjectURL(blob)
  link.setAttribute('href', url)
  link.setAttribute(
    'download',
    filename || `leaderboard-export-${format(new Date(), 'yyyy-MM-dd-HHmmss')}.csv`
  )
  link.style.visibility = 'hidden'
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

