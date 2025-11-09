'use client'

import { useState, useEffect } from 'react'
import { leaderboardApi, LeaderboardEntry } from '@/lib/api'
import { generateLeaderboardPDF } from '@/lib/pdfExport'
import { exportLeaderboardToCSV } from '@/lib/csvExport'

export function Leaderboard() {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [filter, setFilter] = useState<{ domain?: string; period?: string }>({})

  useEffect(() => {
    loadLeaderboard()
  }, [filter])

  const loadLeaderboard = async () => {
    try {
      setLoading(true)
      const data = await leaderboardApi.get(filter)
      setLeaderboard(data.leaderboard || [])
      setError(null)
    } catch (err: any) {
      setError(err.message || 'Failed to load leaderboard')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
        <p className="text-red-800 dark:text-red-200">{error}</p>
      </div>
    )
  }

  return (
    <div>
      {/* Export Buttons */}
      <div className="mb-4 flex justify-between items-center">
        <div className="flex gap-4">
          <button
            onClick={() => generateLeaderboardPDF(leaderboard, 'Leaderboard Report')}
            className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700 transition-colors flex items-center gap-2"
            disabled={leaderboard.length === 0}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
            onClick={() => exportLeaderboardToCSV(leaderboard)}
            className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 transition-colors flex items-center gap-2"
            disabled={leaderboard.length === 0}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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

      {/* Filters */}
      <div className="mb-4 flex gap-4">
        <select
          value={filter.domain || ''}
          onChange={(e) => setFilter({ ...filter, domain: e.target.value || undefined })}
          className="px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
        >
          <option value="">All Domains</option>
          <option value="economy">Economy</option>
          <option value="politics">Politics</option>
          <option value="technology">Technology</option>
          <option value="earthquakes">Earthquakes</option>
        </select>
        <select
          value={filter.period || ''}
          onChange={(e) => setFilter({ ...filter, period: e.target.value || undefined })}
          className="px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
        >
          <option value="">All Time</option>
          <option value="1y">Last Year</option>
          <option value="6m">Last 6 Months</option>
          <option value="3m">Last 3 Months</option>
          <option value="1m">Last Month</option>
        </select>
      </div>

      {/* Leaderboard Table */}
      <div className="bg-white dark:bg-slate-800 rounded-lg shadow-md overflow-hidden border border-slate-200 dark:border-slate-700">
        <table className="w-full">
          <thead className="bg-slate-50 dark:bg-slate-900">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                Rank
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                Forecaster
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                Claims
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                Resolved
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                Avg Perimeter
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                Weighted Perimeter
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
            {leaderboard.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-12 text-center text-slate-600 dark:text-slate-400">
                  No leaderboard data available
                </td>
              </tr>
            ) : (
              leaderboard.map((entry, index) => (
                <tr
                  key={entry.forecaster_id}
                  className="hover:bg-slate-50 dark:hover:bg-slate-900 transition-colors"
                >
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900 dark:text-white">
                    #{index + 1}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-slate-900 dark:text-white">
                      {entry.forecaster_name}
                    </div>
                    {entry.forecaster_username && (
                      <div className="text-sm text-slate-500 dark:text-slate-400">
                        @{entry.forecaster_username}
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600 dark:text-slate-400">
                    {entry.total_claims}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600 dark:text-slate-400">
                    {entry.resolved_claims}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600 dark:text-slate-400">
                    {entry.average_perimeter.toFixed(1)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-lg font-bold text-primary-600 dark:text-primary-400">
                      {entry.weighted_perimeter.toFixed(1)}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}

