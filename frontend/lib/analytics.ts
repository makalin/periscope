import { Claim, LeaderboardEntry } from './api'
import { format, subDays, subMonths, subYears, isAfter, isBefore } from 'date-fns'

export interface AnalyticsData {
  totalClaims: number
  resolvedClaims: number
  pendingClaims: number
  expiredClaims: number
  averagePerimeter: number
  domainStats: Record<string, DomainStats>
  typeStats: Record<string, number>
  statusStats: Record<string, number>
  recentActivity: {
    claims: number
    resolutions: number
  }
  topForecasters: LeaderboardEntry[]
  perimeterDistribution: {
    excellent: number // 80-100
    good: number // 60-79
    fair: number // 40-59
    poor: number // 0-39
  }
}

export interface DomainStats {
  total: number
  resolved: number
  averagePerimeter: number
  topForecaster?: string
}

export function calculateAnalytics(
  claims: Claim[],
  leaderboard: LeaderboardEntry[] = []
): AnalyticsData {
  const resolved = claims.filter((c) => c.status === 'resolved')
  const pending = claims.filter((c) => c.status === 'pending')
  const expired = claims.filter((c) => c.status === 'expired')

  const perimeterScores = resolved
    .map((c) => c.perimeter_score)
    .filter((score): score is number => score !== undefined)

  const averagePerimeter =
    perimeterScores.length > 0
      ? perimeterScores.reduce((sum, score) => sum + score, 0) / perimeterScores.length
      : 0

  // Domain statistics
  const domainStats: Record<string, DomainStats> = {}
  const domains = ['economy', 'politics', 'technology', 'earthquakes']

  domains.forEach((domain) => {
    const domainClaims = claims.filter((c) => c.domain === domain)
    const domainResolved = domainClaims.filter((c) => c.status === 'resolved')
    const domainScores = domainResolved
      .map((c) => c.perimeter_score)
      .filter((score): score is number => score !== undefined)

    domainStats[domain] = {
      total: domainClaims.length,
      resolved: domainResolved.length,
      averagePerimeter:
        domainScores.length > 0
          ? domainScores.reduce((sum, score) => sum + score, 0) / domainScores.length
          : 0,
    }
  })

  // Type statistics
  const typeStats: Record<string, number> = {}
  claims.forEach((claim) => {
    typeStats[claim.claim_type] = (typeStats[claim.claim_type] || 0) + 1
  })

  // Status statistics
  const statusStats: Record<string, number> = {}
  claims.forEach((claim) => {
    statusStats[claim.status] = (statusStats[claim.status] || 0) + 1
  })

  // Perimeter distribution
  const perimeterDistribution = {
    excellent: perimeterScores.filter((s) => s >= 80).length,
    good: perimeterScores.filter((s) => s >= 60 && s < 80).length,
    fair: perimeterScores.filter((s) => s >= 40 && s < 60).length,
    poor: perimeterScores.filter((s) => s < 40).length,
  }

  // Recent activity (last 7 days)
  const sevenDaysAgo = subDays(new Date(), 7)
  const recentClaims = claims.filter((c) =>
    isAfter(new Date(c.created_at), sevenDaysAgo)
  ).length

  const recentResolutions = resolved.filter((c) => {
    // This would need outcome.created_at, but we'll estimate from claim.updated_at
    return isAfter(new Date(c.created_at), sevenDaysAgo)
  }).length

  return {
    totalClaims: claims.length,
    resolvedClaims: resolved.length,
    pendingClaims: pending.length,
    expiredClaims: expired.length,
    averagePerimeter,
    domainStats,
    typeStats,
    statusStats,
    recentActivity: {
      claims: recentClaims,
      resolutions: recentResolutions,
    },
    topForecasters: leaderboard.slice(0, 10),
    perimeterDistribution,
  }
}

export function filterByPeriod(
  claims: Claim[],
  period: '1d' | '7d' | '30d' | '90d' | '1y' | 'all'
): Claim[] {
  if (period === 'all') return claims

  let cutoffDate: Date
  switch (period) {
    case '1d':
      cutoffDate = subDays(new Date(), 1)
      break
    case '7d':
      cutoffDate = subDays(new Date(), 7)
      break
    case '30d':
      cutoffDate = subDays(new Date(), 30)
      break
    case '90d':
      cutoffDate = subDays(new Date(), 90)
      break
    case '1y':
      cutoffDate = subYears(new Date(), 1)
      break
    default:
      return claims
  }

  return claims.filter((claim) => isAfter(new Date(claim.created_at), cutoffDate))
}

export function getTrendData(claims: Claim[], days: number = 30): Array<{
  date: string
  claims: number
  resolved: number
  averagePerimeter: number
}> {
  const data: Array<{
    date: string
    claims: number
    resolved: number
    averagePerimeter: number
  }> = []

  for (let i = days - 1; i >= 0; i--) {
    const date = subDays(new Date(), i)
    const dateStr = format(date, 'yyyy-MM-dd')

    const dayClaims = claims.filter((c) => {
      const claimDate = format(new Date(c.created_at), 'yyyy-MM-dd')
      return claimDate === dateStr
    })

    const dayResolved = dayClaims.filter((c) => c.status === 'resolved')
    const dayScores = dayResolved
      .map((c) => c.perimeter_score)
      .filter((score): score is number => score !== undefined)

    data.push({
      date: dateStr,
      claims: dayClaims.length,
      resolved: dayResolved.length,
      averagePerimeter:
        dayScores.length > 0
          ? dayScores.reduce((sum, score) => sum + score, 0) / dayScores.length
          : 0,
    })
  }

  return data
}

