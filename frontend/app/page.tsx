'use client'

import { useState } from 'react'
import { ClaimsList } from '@/components/ClaimsList'
import { Leaderboard } from '@/components/Leaderboard'
import { CreateClaimForm } from '@/components/CreateClaimForm'
import { Dashboard } from '@/components/Dashboard'
import { Reports } from '@/components/Reports'
import { ThemeToggle } from '@/components/ThemeToggle'

export default function Home() {
  const [activeTab, setActiveTab] = useState<
    'claims' | 'leaderboard' | 'create' | 'dashboard' | 'reports'
  >('dashboard')

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 transition-colors">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <header className="mb-8 flex items-start justify-between">
          <div>
            <h1 className="text-4xl font-bold text-slate-900 dark:text-white mb-2">
              Periscope
            </h1>
            <p className="text-slate-600 dark:text-slate-300">
              Track public predictions and verify outcomes with Perimeter scoring
            </p>
          </div>
          <ThemeToggle />
        </header>

        {/* Navigation Tabs */}
        <div className="mb-6 border-b border-slate-200 dark:border-slate-700">
          <nav className="flex space-x-4 overflow-x-auto">
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`px-4 py-2 font-medium transition-colors whitespace-nowrap ${
                activeTab === 'dashboard'
                  ? 'text-primary-600 border-b-2 border-primary-600'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              Dashboard
            </button>
            <button
              onClick={() => setActiveTab('claims')}
              className={`px-4 py-2 font-medium transition-colors whitespace-nowrap ${
                activeTab === 'claims'
                  ? 'text-primary-600 border-b-2 border-primary-600'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              Claims
            </button>
            <button
              onClick={() => setActiveTab('leaderboard')}
              className={`px-4 py-2 font-medium transition-colors whitespace-nowrap ${
                activeTab === 'leaderboard'
                  ? 'text-primary-600 border-b-2 border-primary-600'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              Leaderboard
            </button>
            <button
              onClick={() => setActiveTab('create')}
              className={`px-4 py-2 font-medium transition-colors whitespace-nowrap ${
                activeTab === 'create'
                  ? 'text-primary-600 border-b-2 border-primary-600'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              Create Claim
            </button>
            <button
              onClick={() => setActiveTab('reports')}
              className={`px-4 py-2 font-medium transition-colors whitespace-nowrap ${
                activeTab === 'reports'
                  ? 'text-primary-600 border-b-2 border-primary-600'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              Reports
            </button>
          </nav>
        </div>

        {/* Content */}
        <div className="mt-6">
          {activeTab === 'dashboard' && <Dashboard />}
          {activeTab === 'claims' && <ClaimsList />}
          {activeTab === 'leaderboard' && <Leaderboard />}
          {activeTab === 'create' && <CreateClaimForm />}
          {activeTab === 'reports' && <Reports />}
        </div>
      </div>
    </main>
  )
}

