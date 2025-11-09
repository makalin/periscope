'use client'

import { useState, useEffect } from 'react'
import { claimsApi, Claim } from '@/lib/api'
import { generateClaimsPDF } from '@/lib/pdfExport'
import { exportClaimsToCSV } from '@/lib/csvExport'

export function ClaimsList() {
  const [claims, setClaims] = useState<Claim[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [filter, setFilter] = useState<{ domain?: string; status?: string }>({})

  useEffect(() => {
    loadClaims()
  }, [filter])

  const loadClaims = async () => {
    try {
      setLoading(true)
      const data = await claimsApi.list(filter)
      setClaims(data.claims || [])
      setError(null)
    } catch (err: any) {
      setError(err.message || 'Failed to load claims')
    } finally {
      setLoading(false)
    }
  }

  const getDomainColor = (domain: string) => {
    const colors: Record<string, string> = {
      economy: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
      politics: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
      technology: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
      earthquakes: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
    }
    return colors[domain] || 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
  }

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
      resolved: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
      expired: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200',
      invalid: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
    }
    return colors[status] || 'bg-gray-100 text-gray-800'
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
            onClick={() => generateClaimsPDF(claims, 'Claims Report')}
            className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700 transition-colors flex items-center gap-2"
            disabled={claims.length === 0}
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
            onClick={() => exportClaimsToCSV(claims)}
            className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 transition-colors flex items-center gap-2"
            disabled={claims.length === 0}
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
          value={filter.status || ''}
          onChange={(e) => setFilter({ ...filter, status: e.target.value || undefined })}
          className="px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
        >
          <option value="">All Statuses</option>
          <option value="pending">Pending</option>
          <option value="resolved">Resolved</option>
          <option value="expired">Expired</option>
        </select>
      </div>

      {/* Claims List */}
      <div className="space-y-4">
        {claims.length === 0 ? (
          <div className="text-center py-12 text-slate-600 dark:text-slate-400">
            No claims found
          </div>
        ) : (
          claims.map((claim) => (
            <div
              key={claim.id}
              className="bg-white dark:bg-slate-800 rounded-lg shadow-md p-6 border border-slate-200 dark:border-slate-700"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <p className="text-lg font-medium text-slate-900 dark:text-white mb-2">
                    {claim.text}
                  </p>
                  {claim.forecaster_name && (
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                      by {claim.forecaster_name}
                      {claim.forecaster_username && ` (@${claim.forecaster_username})`}
                    </p>
                  )}
                </div>
                <div className="flex gap-2">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-medium ${getDomainColor(
                      claim.domain
                    )}`}
                  >
                    {claim.domain}
                  </span>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(
                      claim.status
                    )}`}
                  >
                    {claim.status}
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-between text-sm text-slate-600 dark:text-slate-400">
                <div>
                  <span className="font-medium">Type:</span> {claim.claim_type}
                  {claim.predicted_value !== undefined && (
                    <span className="ml-4">
                      <span className="font-medium">Predicted:</span> {claim.predicted_value}
                    </span>
                  )}
                </div>
                {claim.perimeter_score !== undefined && (
                  <div className="text-lg font-bold text-primary-600 dark:text-primary-400">
                    Perimeter: {claim.perimeter_score.toFixed(1)}
                  </div>
                )}
              </div>

              <div className="mt-2 text-xs text-slate-500 dark:text-slate-500">
                {new Date(claim.created_at).toLocaleDateString()}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}

