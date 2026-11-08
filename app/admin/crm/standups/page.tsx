'use client'

import React, { useEffect, useState } from 'react'
import {
  AlertTriangle,
  Calendar,
  CheckCircle2,
  Filter,
  Loader2,
  MessageSquare,
  RefreshCw,
  Search,
  Sparkles,
  User,
  Users,
  X,
} from 'lucide-react'
import { fetchStandups, reviewStandup, fetchTeams, Standup, Team } from '@/lib/crm-supabase'

export default function CrmStandupsPage() {
  const [standups, setStandups] = useState<Standup[]>([])
  const [teams, setTeams] = useState<Team[]>([])
  const [loading, setLoading] = useState(true)

  // Filters
  const [selectedTeam, setSelectedTeam] = useState<string>('all')
  const [blockerFilter, setBlockerFilter] = useState<'all' | 'blockers_only'>('all')
  const [searchTerm, setSearchTerm] = useState('')

  // Review Feedback Modal
  const [selectedStandupForReview, setSelectedStandupForReview] = useState<Standup | null>(null)
  const [feedbackText, setFeedbackText] = useState('')
  const [savingFeedback, setSavingFeedback] = useState(false)

  const loadData = async () => {
    setLoading(true)
    try {
      const [standupsData, teamsData] = await Promise.all([
        fetchStandups(),
        fetchTeams(),
      ])
      setStandups(standupsData)
      setTeams(teamsData)
    } catch (err) {
      console.error('Failed to load standups:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  const handleSaveFeedback = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedStandupForReview || !feedbackText.trim()) return
    setSavingFeedback(true)
    try {
      const updated = await reviewStandup(selectedStandupForReview.id, feedbackText.trim())
      setStandups((prev) =>
        prev.map((s) => (s.id === updated.id ? { ...s, leader_feedback: updated.leader_feedback } : s))
      )
      setSelectedStandupForReview(null)
      setFeedbackText('')
    } catch (err: any) {
      alert(`Feedback error: ${err.message}`)
    } finally {
      setSavingFeedback(false)
    }
  }

  const openReviewModal = (s: Standup) => {
    setSelectedStandupForReview(s)
    setFeedbackText(s.leader_feedback || '')
  }

  // Filtered Standups
  const filtered = standups.filter((s) => {
    if (selectedTeam !== 'all' && s.team_id !== selectedTeam) return false
    if (blockerFilter === 'blockers_only' && !s.has_blockers) return false
    if (searchTerm) {
      const q = searchTerm.toLowerCase()
      const name = s.interns?.full_name?.toLowerCase() || ''
      const yesterday = s.yesterday.toLowerCase()
      const today = s.today.toLowerCase()
      const blockers = s.blockers?.toLowerCase() || ''
      if (!name.includes(q) && !yesterday.includes(q) && !today.includes(q) && !blockers.includes(q)) {
        return false
      }
    }
    return true
  })

  const totalBlockers = standups.filter((s) => s.has_blockers).length

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-white sm:text-2xl flex items-center gap-2.5">
            <MessageSquare size={24} className="text-[#7727ff]" />
            Daily Async Standups & Blocker Tracker
          </h1>
          <p className="mt-1 text-xs text-[#a0a0b0]">
            Review engineering daily check-ins across squads, unblock interns, and provide leadership feedback.
          </p>
        </div>

        <button
          onClick={loadData}
          disabled={loading}
          className="flex items-center gap-1.5 rounded-xl border border-[#2b2735] bg-[#16141c] px-3.5 py-2 text-xs font-semibold text-[#c8b4ff] hover:bg-[#6417ed] hover:text-white transition-all shadow-sm shrink-0"
        >
          <RefreshCw size={13} className={loading ? 'animate-spin' : ''} />
          <span>Refresh</span>
        </button>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-[#2b2735] bg-[#111015] p-5">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-[#8e8a99]">Total Standups Logged</span>
          <p className="mt-2 text-2xl font-black text-white">{standups.length}</p>
          <p className="mt-1 text-[11px] text-[#8e8a99]">Recorded across all cohort squads</p>
        </div>

        <div className="rounded-2xl border border-[#2b2735] bg-[#111015] p-5">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-[#8e8a99]">Active Blockers</span>
          <p className={`mt-2 text-2xl font-black ${totalBlockers > 0 ? 'text-rose-400' : 'text-emerald-400'}`}>
            {totalBlockers}
          </p>
          <p className="mt-1 text-[11px] text-[#8e8a99]">Requiring squad lead intervention</p>
        </div>

        <div className="rounded-2xl border border-[#2b2735] bg-[#111015] p-5">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-[#8e8a99]">Active Squads</span>
          <p className="mt-2 text-2xl font-black text-[#c8b4ff]">{teams.length}</p>
          <p className="mt-1 text-[11px] text-[#8e8a99]">Engineering pods reporting daily</p>
        </div>
      </div>

      {/* Filter Controls */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={15} className="absolute left-3.5 top-3 text-[#8e8a99]" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by intern name, deliverables, or blocker details..."
            className="w-full rounded-xl border border-[#2b2735] bg-[#16141c] pl-10 pr-4 py-2 text-xs text-white placeholder-[#606075] focus:border-[#7727ff] focus:outline-none"
          />
        </div>

        <select
          value={selectedTeam}
          onChange={(e) => setSelectedTeam(e.target.value)}
          className="rounded-xl border border-[#2b2735] bg-[#16141c] px-3.5 py-2 text-xs text-white focus:border-[#7727ff] focus:outline-none"
        >
          <option value="all">All Squads</option>
          {teams.map((t) => (
            <option key={t.id} value={t.id}>
              {t.name}
            </option>
          ))}
        </select>

        <button
          onClick={() => setBlockerFilter(blockerFilter === 'all' ? 'blockers_only' : 'all')}
          className={`flex items-center gap-1.5 rounded-xl border px-3.5 py-2 text-xs font-semibold transition-all ${
            blockerFilter === 'blockers_only'
              ? 'border-rose-500/50 bg-rose-500/20 text-rose-300'
              : 'border-[#2b2735] bg-[#16141c] text-[#8e8a99] hover:text-white'
          }`}
        >
          <AlertTriangle size={13} />
          {blockerFilter === 'blockers_only' ? 'Showing Blockers Only' : 'Filter Blockers'}
        </button>
      </div>

      {/* Standup Cards Stream */}
      {loading ? (
        <div className="flex h-64 items-center justify-center">
          <Loader2 size={32} className="animate-spin text-[#7727ff]" />
          <span className="ml-3 text-xs text-[#a0a0b0]">Loading squad standups...</span>
        </div>
      ) : filtered.length === 0 ? (
        <div className="rounded-2xl border border-[#2a2a35] bg-[#111015] p-12 text-center text-xs text-[#8e8a99]">
          No standups match the current filter criteria.
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map((s) => (
            <div
              key={s.id}
              className={`rounded-2xl border p-5 transition-all ${
                s.has_blockers
                  ? 'border-rose-500/40 bg-gradient-to-br from-[#160e14] to-[#121016]'
                  : 'border-[#262332] bg-[#111015]'
              }`}
            >
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 pb-3 border-b border-[#211d2c]">
                <div className="flex items-center gap-2.5">
                  <span className="flex size-7 items-center justify-center rounded-full bg-[#7727ff] text-xs font-bold text-white">
                    {s.interns?.full_name?.[0] || 'I'}
                  </span>
                  <div>
                    <h3 className="text-xs font-bold text-white">{s.interns?.full_name || 'Intern'}</h3>
                    <p className="text-[10px] text-[#8e8a99]">{s.teams?.name || 'General Squad'}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {s.has_blockers && (
                    <span className="flex items-center gap-1 rounded-full border border-rose-500/40 bg-rose-500/20 px-2.5 py-0.5 text-[10px] font-bold text-rose-300">
                      <AlertTriangle size={11} /> Blocker Reported
                    </span>
                  )}
                  <span className="text-[11px] text-[#8e8a99]">{s.standup_date}</span>
                </div>
              </div>

              {/* Standup Content */}
              <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                <div className="space-y-1">
                  <span className="text-[10px] uppercase font-bold text-[#8e8a99] block">1. Accomplished Yesterday:</span>
                  <p className="text-[#d0ccda] leading-relaxed">{s.yesterday}</p>
                </div>
                <div className="space-y-1">
                  <span className="text-[10px] uppercase font-bold text-[#8e8a99] block">2. Shipping Today:</span>
                  <p className="text-[#d0ccda] leading-relaxed">{s.today}</p>
                </div>
              </div>

              {s.blockers && (
                <div className="mt-3 rounded-xl border border-rose-500/30 bg-rose-500/10 p-3 text-xs text-rose-300">
                  <span className="font-bold text-[10px] uppercase block">Reported Blocker / Dependency:</span>
                  <p className="mt-0.5 leading-relaxed">{s.blockers}</p>
                </div>
              )}

              {/* Feedback Section */}
              <div className="mt-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 pt-3 border-t border-[#201d29]">
                {s.leader_feedback ? (
                  <div className="rounded-xl border border-[#7727ff]/30 bg-[#7727ff]/10 p-2.5 text-xs text-[#c8b4ff] flex-1">
                    <span className="font-bold text-[10px] uppercase block flex items-center gap-1 text-[#b58cff]">
                      <Sparkles size={11} /> Squad Lead Note:
                    </span>
                    <p className="mt-0.5 text-white">{s.leader_feedback}</p>
                  </div>
                ) : (
                  <span className="text-[11px] text-[#606070] italic">No lead feedback added yet.</span>
                )}

                <button
                  onClick={() => openReviewModal(s)}
                  className="rounded-xl border border-[#363046] bg-[#1a1724] px-3.5 py-1.5 text-xs font-semibold text-[#c8b4ff] hover:bg-[#6417ed] hover:text-white transition-all shrink-0"
                >
                  {s.leader_feedback ? 'Edit Feedback' : 'Provide Feedback'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* FEEDBACK MODAL */}
      {selectedStandupForReview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-3xl border border-[#302c3d] bg-[#111015] p-6 shadow-2xl space-y-4">
            <div className="flex justify-between items-center pb-3 border-b border-[#211d2c]">
              <div>
                <h3 className="text-sm font-bold text-white">Provide Standup Feedback</h3>
                <p className="text-[11px] text-[#8e8a99]">
                  For {selectedStandupForReview.interns?.full_name} ({selectedStandupForReview.standup_date})
                </p>
              </div>
              <button onClick={() => setSelectedStandupForReview(null)} className="text-[#a0a0b0] hover:text-white">
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleSaveFeedback} className="space-y-4 text-xs">
              <div>
                <label className="block text-[#a0a0b0] mb-1 font-semibold">Leadership Note / Guidance *</label>
                <textarea
                  required
                  rows={4}
                  value={feedbackText}
                  onChange={(e) => setFeedbackText(e.target.value)}
                  placeholder="e.g. Great progress on the components! For the S3 blocker, I have whitelisted CORS; ping me if you need help with credentials."
                  className="w-full rounded-xl border border-[#2a2a35] bg-[#181622] p-3 text-xs text-white focus:border-[#7727ff] focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setSelectedStandupForReview(null)}
                  className="rounded-xl border border-[#2a2a35] px-4 py-2 text-[#a0a0b0]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingFeedback}
                  className="rounded-xl bg-[#6417ed] px-5 py-2 font-bold text-white hover:bg-[#7727ff] disabled:opacity-50"
                >
                  {savingFeedback ? 'Saving...' : 'Send Feedback'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
