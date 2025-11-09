'use client'

import { useState } from 'react'
import { claimsApi, CreateClaimRequest } from '@/lib/api'

export function CreateClaimForm() {
  const [formData, setFormData] = useState<CreateClaimRequest>({
    text: '',
    domain: 'economy',
    claim_type: 'numeric',
    predicted_value: undefined,
    predicted_category: undefined,
    predicted_probability: undefined,
    forecaster_name: '',
    forecaster_username: '',
    source_url: '',
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setSuccess(false)

    try {
      // Clean up undefined values
      const cleanedData: CreateClaimRequest = {
        text: formData.text,
        domain: formData.domain,
        claim_type: formData.claim_type,
      }

      if (formData.predicted_value !== undefined) {
        cleanedData.predicted_value = formData.predicted_value
      }
      if (formData.predicted_category) {
        cleanedData.predicted_category = formData.predicted_category
      }
      if (formData.predicted_probability !== undefined) {
        cleanedData.predicted_probability = formData.predicted_probability
      }
      if (formData.forecaster_name) {
        cleanedData.forecaster_name = formData.forecaster_name
      }
      if (formData.forecaster_username) {
        cleanedData.forecaster_username = formData.forecaster_username
      }
      if (formData.source_url) {
        cleanedData.source_url = formData.source_url
      }

      await claimsApi.create(cleanedData)
      setSuccess(true)
      setFormData({
        text: '',
        domain: 'economy',
        claim_type: 'numeric',
        predicted_value: undefined,
        predicted_category: undefined,
        predicted_probability: undefined,
        forecaster_name: '',
        forecaster_username: '',
        source_url: '',
      })
    } catch (err: any) {
      setError(err.response?.data?.error || err.message || 'Failed to create claim')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-white dark:bg-slate-800 rounded-lg shadow-md p-6 border border-slate-200 dark:border-slate-700 max-w-2xl">
      <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">Create New Claim</h2>

      {error && (
        <div className="mb-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
          <p className="text-red-800 dark:text-red-200">{error}</p>
        </div>
      )}

      {success && (
        <div className="mb-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
          <p className="text-green-800 dark:text-green-200">Claim created successfully!</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
            Claim Text *
          </label>
          <textarea
            value={formData.text}
            onChange={(e) => setFormData({ ...formData, text: e.target.value })}
            required
            rows={3}
            className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              Domain *
            </label>
            <select
              value={formData.domain}
              onChange={(e) => setFormData({ ...formData, domain: e.target.value as any })}
              required
              className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100"
            >
              <option value="economy">Economy</option>
              <option value="politics">Politics</option>
              <option value="technology">Technology</option>
              <option value="earthquakes">Earthquakes</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              Claim Type *
            </label>
            <select
              value={formData.claim_type}
              onChange={(e) => setFormData({ ...formData, claim_type: e.target.value as any })}
              required
              className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100"
            >
              <option value="numeric">Numeric</option>
              <option value="categorical">Categorical</option>
              <option value="probabilistic">Probabilistic</option>
            </select>
          </div>
        </div>

        {formData.claim_type === 'numeric' && (
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              Predicted Value
            </label>
            <input
              type="number"
              step="any"
              value={formData.predicted_value || ''}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  predicted_value: e.target.value ? parseFloat(e.target.value) : undefined,
                })
              }
              className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100"
            />
          </div>
        )}

        {formData.claim_type === 'categorical' && (
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              Predicted Category
            </label>
            <input
              type="text"
              value={formData.predicted_category || ''}
              onChange={(e) => setFormData({ ...formData, predicted_category: e.target.value })}
              className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100"
            />
          </div>
        )}

        {formData.claim_type === 'probabilistic' && (
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              Predicted Probability (0-1)
            </label>
            <input
              type="number"
              step="0.01"
              min="0"
              max="1"
              value={formData.predicted_probability || ''}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  predicted_probability: e.target.value ? parseFloat(e.target.value) : undefined,
                })
              }
              className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100"
            />
          </div>
        )}

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              Forecaster Name
            </label>
            <input
              type="text"
              value={formData.forecaster_name}
              onChange={(e) => setFormData({ ...formData, forecaster_name: e.target.value })}
              className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              Forecaster Username
            </label>
            <input
              type="text"
              value={formData.forecaster_username}
              onChange={(e) => setFormData({ ...formData, forecaster_username: e.target.value })}
              className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
            Source URL
          </label>
          <input
            type="url"
            value={formData.source_url}
            onChange={(e) => setFormData({ ...formData, source_url: e.target.value })}
            className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100"
          />
        </div>

        <button
          type="submit"
          disabled={loading || !formData.text}
          className="w-full px-6 py-3 bg-primary-600 text-white rounded-lg font-medium hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {loading ? 'Creating...' : 'Create Claim'}
        </button>
      </form>
    </div>
  )
}

