import axios from 'axios'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3001'

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

export interface Claim {
  id: string
  text: string
  domain: string
  claim_type: 'numeric' | 'categorical' | 'probabilistic'
  predicted_value?: number
  predicted_category?: string
  predicted_probability?: number
  status: 'pending' | 'resolved' | 'expired' | 'invalid'
  forecaster_name?: string
  forecaster_username?: string
  perimeter_score?: number
  created_at: string
}

export interface CreateClaimRequest {
  text: string
  domain: 'economy' | 'politics' | 'technology' | 'earthquakes'
  claim_type: 'numeric' | 'categorical' | 'probabilistic'
  predicted_value?: number
  predicted_category?: string
  predicted_probability?: number
  deadline_date?: string
  tags?: string[]
  forecaster_name?: string
  forecaster_username?: string
  forecaster_platform?: string
  source_url?: string
}

export interface ResolveClaimRequest {
  actual_value?: number
  actual_category?: string
  actual_probability?: number
  data_source?: string
}

export interface LeaderboardEntry {
  forecaster_id: string
  forecaster_name: string
  forecaster_username?: string
  total_claims: number
  resolved_claims: number
  average_perimeter: number
  weighted_perimeter: number
}

export const claimsApi = {
  list: async (params?: { domain?: string; status?: string; limit?: number }) => {
    const response = await api.get('/v1/claims', { params })
    return response.data
  },
  get: async (id: string) => {
    const response = await api.get(`/v1/claims/${id}`)
    return response.data
  },
  create: async (data: CreateClaimRequest) => {
    const response = await api.post('/v1/claims', data)
    return response.data
  },
  resolve: async (id: string, data: ResolveClaimRequest) => {
    const response = await api.post(`/v1/claims/${id}/resolve`, data)
    return response.data
  },
}

export const leaderboardApi = {
  get: async (params?: { domain?: string; period?: string; min_claims?: number }) => {
    const response = await api.get('/v1/leaderboard', { params })
    return response.data
  },
}

export interface AnalyticsData {
  totalClaims: number
  resolvedClaims: number
  pendingClaims: number
  averagePerimeter: number
  domainBreakdown: Record<string, number>
  typeBreakdown: Record<string, number>
  statusBreakdown: Record<string, number>
  perimeterDistribution: {
    excellent: number
    good: number
    fair: number
    poor: number
  }
  recentActivity: {
    claims: number
    resolutions: number
  }
}

export interface TrendData {
  date: string
  claims: number
  resolved: number
  averagePerimeter: number
}

export const analyticsApi = {
  get: async (params?: { domain?: string; period?: string }): Promise<AnalyticsData> => {
    const response = await api.get('/v1/analytics', { params })
    return response.data
  },
  getTrends: async (params?: { days?: number; domain?: string }): Promise<{ trends: TrendData[] }> => {
    const response = await api.get('/v1/analytics/trends', { params })
    return response.data
  },
}

