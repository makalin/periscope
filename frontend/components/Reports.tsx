'use client'

import { useState, useEffect } from 'react'
import { claimsApi, leaderboardApi, Claim, LeaderboardEntry } from '@/lib/api'
import { generatePDFReport, generateClaimsPDF, generateLeaderboardPDF } from '@/lib/pdfExport'
import { exportClaimsToCSV, exportLeaderboardToCSV } from '@/lib/csvExport'
import { calculateAnalytics, AnalyticsData } from '@/lib/analytics'
import { format } from 'date-fns'

export function Reports() {
  const [claims, setClaims] = useState<Claim[]>([])
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([])
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [reportType, setReportType] = useState<'claims' | 'leaderboard' | 'full'>('full')
  const [filter, setFilter] = useState<{ domain?: string; status?: string; period?: string }>({})

  useEffect(() => {
    loadData()
  }, [filter])

  const loadData = async () => {
    try {
      setLoading(true)
      const [claimsData, leaderboardData] = await Promise.all([
        claimsApi.list({ ...filter, limit: 1000 }),
        leaderboardApi.get({ domain: filter.domain, period: filter.period }),
      ])

      setClaims(claimsData.claims || [])
      setLeaderboard(leaderboardData.leaderboard || [])
      setAnalytics(calculateAnalytics(claimsData.claims || [], leaderboardData.leaderboard || []))
    } catch (error) {
      console.error('Failed to load data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleExportPDF = () => {
    if (reportType === 'claims') {
      generateClaimsPDF(claims, 'Claims Report')
    } else if (reportType === 'leaderboard') {
      generateLeaderboardPDF(leaderboard, 'Leaderboard Report')
    } else {
      // Full report
      generatePDFReport({
        title: 'Full Periscope Report',
        generatedAt: new Date(),
        claims,
        leaderboard,
        statistics: analytics
          ? {
              totalClaims: analytics.totalClaims,
              resolvedClaims: analytics.resolvedClaims,
              averagePerimeter: analytics.averagePerimeter,
              domainBreakdown: Object.fromEntries(
                Object.entries(analytics.domainStats).map(([domain, stats]) => [
                  domain,
                  stats.total,
                ])
              ),
            }
          : undefined,
      })
    }
  }

  const handleExportCSV = () => {
    if (reportType === 'claims') {
      exportClaimsToCSV(claims)
    } else if (reportType === 'leaderboard') {
      exportLeaderboardToCSV(leaderboard)
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Report Controls */}
      <div className="bg-white dark:bg-slate-800 rounded-lg shadow-md p-6 border border-slate-200 dark:border-slate-700">
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
          Generate Report
        </h2>

        <div className="space-y-4">
          {/* Report Type Selection */}
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Report Type
            </label>
            <div className="flex gap-4">
              <label className="flex items-center">
                <input
                  type="radio"
                  value="full"
                  checked={reportType === 'full'}
                  onChange={(e) => setReportType(e.target.value as any)}
                  className="mr-2"
                />
                <span className="text-slate-700 dark:text-slate-300">Full Report</span>
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  value="claims"
                  checked={reportType === 'claims'}
                  onChange={(e) => setReportType(e.target.value as any)}
                  className="mr-2"
                />
                <span className="text-slate-700 dark:text-slate-300">Claims Only</span>
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  value="leaderboard"
                  checked={reportType === 'leaderboard'}
                  onChange={(e) => setReportType(e.target.value as any)}
                  className="mr-2"
                />
                <span className="text-slate-700 dark:text-slate-300">Leaderboard Only</span>
              </label>
            </div>
          </div>

          {/* Filters */}
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                Domain
              </label>
              <select
                value={filter.domain || ''}
                onChange={(e) => setFilter({ ...filter, domain: e.target.value || undefined })}
                className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100"
              >
                <option value="">All Domains</option>
                <option value="economy">Economy</option>
                <option value="politics">Politics</option>
                <option value="technology">Technology</option>
                <option value="earthquakes">Earthquakes</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                Status
              </label>
              <select
                value={filter.status || ''}
                onChange={(e) => setFilter({ ...filter, status: e.target.value || undefined })}
                className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100"
              >
                <option value="">All Statuses</option>
                <option value="pending">Pending</option>
                <option value="resolved">Resolved</option>
                <option value="expired">Expired</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                Period
              </label>
              <select
                value={filter.period || ''}
                onChange={(e) => setFilter({ ...filter, period: e.target.value || undefined })}
                className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100"
              >
                <option value="">All Time</option>
                <option value="1y">Last Year</option>
                <option value="6m">Last 6 Months</option>
                <option value="3m">Last 3 Months</option>
                <option value="1m">Last Month</option>
              </select>
            </div>
          </div>

          {/* Export Buttons */}
          <div className="flex gap-4 pt-4">
            <button
              onClick={handleExportPDF}
              className="px-6 py-3 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition-colors flex items-center gap-2"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"
                />
              </svg>
              Export PDF
            </button>
            <button
              onClick={handleExportCSV}
              className="px-6 py-3 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors flex items-center gap-2"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
              Export CSV
            </button>
          </div>
        </div>
      </div>

      {/* Statistics Summary */}
      {analytics && (
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow-md p-6 border border-slate-200 dark:border-slate-700">
          <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-4">
            Report Summary
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-4 bg-slate-50 dark:bg-slate-900 rounded-lg">
              <div className="text-sm text-slate-600 dark:text-slate-400">Total Claims</div>
              <div className="text-2xl font-bold text-slate-900 dark:text-white">
                {analytics.totalClaims}
              </div>
            </div>
            <div className="p-4 bg-slate-50 dark:bg-slate-900 rounded-lg">
              <div className="text-sm text-slate-600 dark:text-slate-400">Resolved</div>
              <div className="text-2xl font-bold text-slate-900 dark:text-white">
                {analytics.resolvedClaims}
              </div>
            </div>
            <div className="p-4 bg-slate-50 dark:bg-slate-900 rounded-lg">
              <div className="text-sm text-slate-600 dark:text-slate-400">Avg Perimeter</div>
              <div className="text-2xl font-bold text-slate-900 dark:text-white">
                {analytics.averagePerimeter.toFixed(1)}
              </div>
            </div>
            <div className="p-4 bg-slate-50 dark:bg-slate-900 rounded-lg">
              <div className="text-sm text-slate-600 dark:text-slate-400">Pending</div>
              <div className="text-2xl font-bold text-slate-900 dark:text-white">
                {analytics.pendingClaims}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

