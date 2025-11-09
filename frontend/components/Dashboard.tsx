'use client'

import { useState, useEffect } from 'react'
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'
import { claimsApi, leaderboardApi, Claim, LeaderboardEntry } from '@/lib/api'
import { calculateAnalytics, getTrendData, AnalyticsData } from '@/lib/analytics'
import { format } from 'date-fns'

const COLORS = ['#0ea5e9', '#8b5cf6', '#ec4899', '#f59e0b']

export function Dashboard() {
  const [claims, setClaims] = useState<Claim[]>([])
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([])
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null)
  const [trendData, setTrendData] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [period, setPeriod] = useState<'30d' | '90d' | '1y' | 'all'>('30d')

  useEffect(() => {
    loadData()
  }, [period])

  const loadData = async () => {
    try {
      setLoading(true)
      const [claimsData, leaderboardData] = await Promise.all([
        claimsApi.list({ limit: 1000 }),
        leaderboardApi.get({ period: period === 'all' ? undefined : period }),
      ])

      const allClaims = claimsData.claims || []
      setClaims(allClaims)
      setLeaderboard(leaderboardData.leaderboard || [])
      setAnalytics(calculateAnalytics(allClaims, leaderboardData.leaderboard || []))
      setTrendData(getTrendData(allClaims, period === 'all' ? 365 : 30))
    } catch (error) {
      console.error('Failed to load data:', error)
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

  if (!analytics) {
    return <div>No data available</div>
  }

  // Prepare chart data
  const domainChartData = Object.entries(analytics.domainStats).map(([domain, stats]) => ({
    name: domain.charAt(0).toUpperCase() + domain.slice(1),
    total: stats.total,
    resolved: stats.resolved,
    avgPerimeter: stats.averagePerimeter,
  }))

  const perimeterDistributionData = [
    { name: 'Excellent (80-100)', value: analytics.perimeterDistribution.excellent },
    { name: 'Good (60-79)', value: analytics.perimeterDistribution.good },
    { name: 'Fair (40-59)', value: analytics.perimeterDistribution.fair },
    { name: 'Poor (0-39)', value: analytics.perimeterDistribution.poor },
  ].filter((item) => item.value > 0)

  const typeChartData = Object.entries(analytics.typeStats).map(([type, count]) => ({
    name: type.charAt(0).toUpperCase() + type.slice(1),
    count,
  }))

  const topForecastersData = analytics.topForecasters.slice(0, 5).map((f) => ({
    name: f.forecaster_name.substring(0, 15) + (f.forecaster_name.length > 15 ? '...' : ''),
    perimeter: f.weighted_perimeter,
  }))

  return (
    <div className="space-y-6">
      {/* Period Selector */}
      <div className="flex justify-end">
        <select
          value={period}
          onChange={(e) => setPeriod(e.target.value as any)}
          className="px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
        >
          <option value="30d">Last 30 Days</option>
          <option value="90d">Last 90 Days</option>
          <option value="1y">Last Year</option>
          <option value="all">All Time</option>
        </select>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow-md p-6 border border-slate-200 dark:border-slate-700">
          <div className="text-sm text-slate-600 dark:text-slate-400 mb-1">Total Claims</div>
          <div className="text-3xl font-bold text-slate-900 dark:text-white">
            {analytics.totalClaims}
          </div>
          <div className="text-xs text-slate-500 dark:text-slate-500 mt-2">
            {analytics.resolvedClaims} resolved
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-lg shadow-md p-6 border border-slate-200 dark:border-slate-700">
          <div className="text-sm text-slate-600 dark:text-slate-400 mb-1">Avg Perimeter</div>
          <div className="text-3xl font-bold text-primary-600 dark:text-primary-400">
            {analytics.averagePerimeter.toFixed(1)}
          </div>
          <div className="text-xs text-slate-500 dark:text-slate-500 mt-2">Across all resolved</div>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-lg shadow-md p-6 border border-slate-200 dark:border-slate-700">
          <div className="text-sm text-slate-600 dark:text-slate-400 mb-1">Pending Claims</div>
          <div className="text-3xl font-bold text-yellow-600 dark:text-yellow-400">
            {analytics.pendingClaims}
          </div>
          <div className="text-xs text-slate-500 dark:text-slate-500 mt-2">Awaiting resolution</div>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-lg shadow-md p-6 border border-slate-200 dark:border-slate-700">
          <div className="text-sm text-slate-600 dark:text-slate-400 mb-1">Recent Activity</div>
          <div className="text-3xl font-bold text-green-600 dark:text-green-400">
            {analytics.recentActivity.claims}
          </div>
          <div className="text-xs text-slate-500 dark:text-slate-500 mt-2">
            {analytics.recentActivity.resolutions} resolved (7d)
          </div>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Trend Chart */}
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow-md p-6 border border-slate-200 dark:border-slate-700">
          <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">
            Claims Trend
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={trendData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis
                dataKey="date"
                tick={{ fill: '#64748b' }}
                tickFormatter={(value) => format(new Date(value), 'MMM dd')}
              />
              <YAxis tick={{ fill: '#64748b' }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1e293b',
                  border: '1px solid #334155',
                  borderRadius: '8px',
                }}
              />
              <Legend />
              <Line
                type="monotone"
                dataKey="claims"
                stroke="#0ea5e9"
                strokeWidth={2}
                name="New Claims"
              />
              <Line
                type="monotone"
                dataKey="resolved"
                stroke="#10b981"
                strokeWidth={2}
                name="Resolved"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Domain Chart */}
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow-md p-6 border border-slate-200 dark:border-slate-700">
          <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">
            Claims by Domain
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={domainChartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="name" tick={{ fill: '#64748b' }} />
              <YAxis tick={{ fill: '#64748b' }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1e293b',
                  border: '1px solid #334155',
                  borderRadius: '8px',
                }}
              />
              <Legend />
              <Bar dataKey="total" fill="#0ea5e9" name="Total" />
              <Bar dataKey="resolved" fill="#10b981" name="Resolved" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Perimeter Distribution */}
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow-md p-6 border border-slate-200 dark:border-slate-700">
          <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">
            Perimeter Distribution
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={perimeterDistributionData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {perimeterDistributionData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1e293b',
                  border: '1px solid #334155',
                  borderRadius: '8px',
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Claim Types */}
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow-md p-6 border border-slate-200 dark:border-slate-700">
          <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">
            Claims by Type
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={typeChartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="name" tick={{ fill: '#64748b' }} />
              <YAxis tick={{ fill: '#64748b' }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1e293b',
                  border: '1px solid #334155',
                  borderRadius: '8px',
                }}
              />
              <Bar dataKey="count" fill="#8b5cf6" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Top Forecasters */}
      {topForecastersData.length > 0 && (
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow-md p-6 border border-slate-200 dark:border-slate-700">
          <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">
            Top Forecasters
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={topForecastersData} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis type="number" tick={{ fill: '#64748b' }} />
              <YAxis dataKey="name" type="category" tick={{ fill: '#64748b' }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1e293b',
                  border: '1px solid #334155',
                  borderRadius: '8px',
                }}
              />
              <Bar dataKey="perimeter" fill="#ec4899" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  )
}

