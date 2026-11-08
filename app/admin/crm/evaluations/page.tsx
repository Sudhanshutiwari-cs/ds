'use client'

import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import {
  Award,
  CheckCircle2,
  ChevronRight,
  Compass,
  FileCheck,
  GraduationCap,
  Plus,
  RefreshCw,
  Search,
  Sparkles,
  Target,
  TrendingUp,
  User,
  X,
} from 'lucide-react'
import {
  fetchMilestoneReviews,
  submitMilestoneReview,
  fetchInterns,
  MilestoneReview,
  Intern,
} from '@/lib/crm-supabase'

const ppoStyles: Record<string, { bg: string; text: string; border: string }> = {
  recommended: { bg: 'bg-emerald-500/10', text: 'text-emerald-400', border: 'border-emerald-500/30' },
  eligible: { bg: 'bg-blue-500/10', text: 'text-blue-400', border: 'border-blue-500/30' },
  in_review: { bg: 'bg-amber-500/10', text: 'text-amber-400', border: 'border-amber-500/30' },
  not_eligible: { bg: 'bg-rose-500/10', text: 'text-rose-400', border: 'border-rose-500/30' },
}

export default function CrmEvaluationsPage() {
  const [reviews, setReviews] = useState<MilestoneReview[]>([])
  const [interns, setInterns] = useState<Intern[]>([])
  const [loading, setLoading] = useState(true)
  const [typeFilter, setTypeFilter] = useState('all')
  const [searchTerm, setSearchTerm] = useState('')

  // New Milestone Review Modal
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [form, setForm] = useState({
    internId: '',
    reviewerName: 'Deepak Sharma (Tech Lead)',
    milestoneType: '30_day' as '30_day' | '60_day' | 'final',
    architecture: 8,
    problemSolving: 9,
    velocity: 8,
    codeQuality: 9,
    ownership: 8,
    communication: 9,
    ppoRecommendation: 'recommended' as 'recommended' | 'eligible' | 'in_review' | 'not_eligible',
    notes: '',
  })

  const loadData = async () => {
    setLoading(true)
    try {
      const [revs, ints] = await Promise.all([
        fetchMilestoneReviews(),
        fetchInterns(),
      ])
      setReviews(revs)
      setInterns(ints)

      if (ints.length > 0 && !form.internId) {
        setForm((prev) => ({ ...prev, internId: ints[0].user_id }))
      }
    } catch (err) {
      console.error('Failed to load milestone reviews:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.internId || !form.notes) {
      alert('Please complete all evaluation fields.')
      return
    }

    setSubmitting(true)
    try {
      const created = await submitMilestoneReview({
        internId: form.internId,
        reviewerName: form.reviewerName,
        milestoneType: form.milestoneType,
        architecture: Number(form.architecture),
        problemSolving: Number(form.problemSolving),
        velocity: Number(form.velocity),
        codeQuality: Number(form.codeQuality),
        ownership: Number(form.ownership),
        communication: Number(form.communication),
        ppoRecommendation: form.ppoRecommendation,
        notes: form.notes,
      })
      setReviews((prev) => [created, ...prev])
      setIsModalOpen(false)
      setForm((prev) => ({ ...prev, notes: '' }))
    } catch (err: any) {
      alert(`Submission error: ${err.message}`)
    } finally {
      setSubmitting(false)
    }
  }

  const filtered = reviews.filter((r) => {
    const name = r.interns?.full_name?.toLowerCase() || ''
    const q = searchTerm.toLowerCase()
    const matchesSearch = name.includes(q)
    const matchesType = typeFilter === 'all' || r.milestone_type === typeFilter
    return matchesSearch && matchesType
  })

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col justify-between gap-4 rounded-2xl border border-[#2a2a35] bg-[#131318] p-5 sm:flex-row sm:items-center">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-2xl font-bold text-white">Skill Matrix & Milestone Reviews</h2>
            <span className="rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-0.5 text-xs font-semibold text-emerald-300 flex items-center gap-1">
              <Target size={13} />
              Full-Time PPO Pipeline
            </span>
          </div>
          <p className="mt-1 text-sm text-[#a0a0b0]">
            6-pillar competency assessments (30-day, 60-day, final) & pre-placement offer qualification
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={loadData}
            className="flex items-center gap-2 rounded-xl border border-[#2a2a35] bg-[#1a1a24] px-3.5 py-2 text-xs font-medium text-white transition-all hover:bg-[#252532]"
            title="Refresh evaluations"
          >
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
            <span>Sync</span>
          </button>

          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-emerald-600 to-green-600 px-4 py-2 text-xs font-bold text-white shadow-lg shadow-emerald-500/20 hover:brightness-110"
          >
            <Plus size={15} />
            <span>Log Milestone Review</span>
          </button>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid gap-4 sm:grid-cols-4">
        <div className="rounded-2xl border border-[#2a2a35] bg-[#131318] p-5">
          <p className="text-xs font-semibold uppercase tracking-wider text-[#a0a0b0]">Completed Reviews</p>
          <p className="mt-2 text-3xl font-black text-white">{reviews.length}</p>
        </div>
        <div className="rounded-2xl border border-[#2a2a35] bg-[#131318] p-5">
          <p className="text-xs font-semibold uppercase tracking-wider text-emerald-400">PPO Recommended</p>
          <p className="mt-2 text-3xl font-black text-emerald-400">
            {reviews.filter((r) => r.ppo_recommendation === 'recommended').length}
          </p>
        </div>
        <div className="rounded-2xl border border-[#2a2a35] bg-[#131318] p-5">
          <p className="text-xs font-semibold uppercase tracking-wider text-blue-400">PPO Eligible</p>
          <p className="mt-2 text-3xl font-black text-blue-400">
            {reviews.filter((r) => r.ppo_recommendation === 'eligible').length}
          </p>
        </div>
        <div className="rounded-2xl border border-[#2a2a35] bg-[#131318] p-5">
          <p className="text-xs font-semibold uppercase tracking-wider text-purple-400">Avg Competency Index</p>
          <p className="mt-2 text-3xl font-black text-purple-400">8.7 / 10</p>
        </div>
      </div>

      {/* Filter and Search */}
      <div className="flex flex-col gap-3 rounded-2xl border border-[#2a2a35] bg-[#131318] p-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1 sm:max-w-md">
          <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#a0a0b0]" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by intern name..."
            className="w-full rounded-xl border border-[#2a2a35] bg-[#1a1a24] py-2 pl-9 pr-3 text-xs text-white placeholder-[#606070] focus:border-[#7727ff] focus:outline-none"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-semibold text-[#808095]">Milestone:</span>
          {['all', '30_day', '60_day', 'final'].map((t) => (
            <button
              key={t}
              onClick={() => setTypeFilter(t)}
              className={`rounded-lg px-2.5 py-1 text-xs font-medium capitalize transition-all ${
                typeFilter === t
                  ? 'bg-[#6417ed] text-white shadow-md'
                  : 'border border-[#2a2a35] bg-[#1a1a24] text-[#a0a0b0] hover:text-white'
              }`}
            >
              {t.replace('_', ' ')}
            </button>
          ))}
        </div>
      </div>

      {/* Review Cards Grid */}
      <div className="grid gap-4 sm:grid-cols-2">
        {filtered.map((rev) => {
          const style = ppoStyles[rev.ppo_recommendation] || ppoStyles['in_review']
          const overallScore = (
            (rev.architecture + rev.problem_solving + rev.velocity + rev.code_quality + rev.ownership + rev.communication) /
            6
          ).toFixed(1)

          const pillars = [
            { name: 'System Architecture', score: rev.architecture },
            { name: 'Problem Solving', score: rev.problem_solving },
            { name: 'Shipping Velocity', score: rev.velocity },
            { name: 'Code Quality', score: rev.code_quality },
            { name: 'Ownership & Initiative', score: rev.ownership },
            { name: 'Communication', score: rev.communication },
          ]

          return (
            <div key={rev.id} className="rounded-2xl border border-[#2a2a35] bg-[#131318] p-5 space-y-4">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    <User size={15} className="text-[#a77aff]" />
                    {rev.interns?.full_name || 'Intern'}
                  </h3>
                  <p className="text-xs text-[#a0a0b0] mt-0.5">
                    {rev.milestone_type.toUpperCase().replace('_', '-')} Review • Evaluated by {rev.reviewer_name}
                  </p>
                </div>

                <div className="text-right">
                  <span
                    className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-[10px] font-bold uppercase ${style.bg} ${style.text} ${style.border}`}
                  >
                    PPO: {rev.ppo_recommendation.replace('_', ' ')}
                  </span>
                  <span className="block text-xs font-bold text-purple-300 mt-1">
                    Index: {overallScore} / 10
                  </span>
                </div>
              </div>

              {/* 6-Pillar Skill Matrix Progress Bars */}
              <div className="space-y-2 rounded-xl border border-[#2a2a35] bg-[#1a1a24] p-3.5">
                {pillars.map((p) => (
                  <div key={p.name} className="space-y-1">
                    <div className="flex justify-between text-[11px]">
                      <span className="text-[#a0a0b0]">{p.name}</span>
                      <span className="font-mono font-bold text-white">{p.score} / 10</span>
                    </div>
                    <div className="w-full bg-[#131318] h-1.5 rounded-full overflow-hidden">
                      <div
                        className="bg-gradient-to-r from-purple-500 to-emerald-400 h-full rounded-full"
                        style={{ width: `${p.score * 10}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>

              {/* Qualitative Notes */}
              <div className="rounded-xl border border-[#2a2a35] bg-[#1a1a24]/50 p-3 text-xs text-[#d0ccda] leading-relaxed">
                <span className="text-[#a0a0b0] font-semibold block mb-1">Lead Notes & Transition Assessment:</span>
                "{rev.notes}"
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-[#2a2a35] text-[11px] text-[#808095]">
                <span>Date: {new Date(rev.created_at).toLocaleDateString()}</span>
                {rev.ppo_recommendation === 'recommended' && (
                  <Link
                    href="/admin/crm/applications"
                    className="text-emerald-400 hover:text-emerald-300 font-semibold inline-flex items-center gap-1"
                  >
                    <span>Proceed to Full-Time Offer</span>
                    <ChevronRight size={12} />
                  </Link>
                )}
              </div>
            </div>
          )
        })}
      </div>

      {/* MODAL: SUBMIT MILESTONE REVIEW */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-2xl border border-[#3a3545] bg-[#131318] p-6 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-[#2a2a35]">
              <div className="flex items-center gap-2">
                <div className="rounded-xl bg-emerald-500/20 p-2 text-emerald-400">
                  <Target size={18} />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">Log Milestone Skill Assessment</h3>
                  <p className="text-xs text-[#a0a0b0]">Grade 6 competency pillars & determine PPO eligibility</p>
                </div>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="text-[#a0a0b0] hover:text-white">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="mt-5 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[#a0a0b0] mb-1">Select Intern *</label>
                <select
                  required
                  value={form.internId}
                  onChange={(e) => setForm({ ...form, internId: e.target.value })}
                  className="w-full rounded-xl border border-[#2a2a35] bg-[#1a1a24] px-3.5 py-2.5 text-xs text-white focus:border-emerald-500 focus:outline-none"
                >
                  {interns.map((i) => (
                    <option key={i.user_id} value={i.user_id}>
                      {i.full_name} ({i.teams?.name || 'Squad'})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[#a0a0b0] mb-1">Milestone Mark</label>
                  <select
                    value={form.milestoneType}
                    onChange={(e) => setForm({ ...form, milestoneType: e.target.value as any })}
                    className="w-full rounded-xl border border-[#2a2a35] bg-[#1a1a24] px-3.5 py-2.5 text-xs text-white focus:border-emerald-500 focus:outline-none"
                  >
                    <option value="30_day">30-Day Checkpoint</option>
                    <option value="60_day">60-Day Midterm</option>
                    <option value="final">Final Graduation Review</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#a0a0b0] mb-1">PPO Recommendation</label>
                  <select
                    value={form.ppoRecommendation}
                    onChange={(e) => setForm({ ...form, ppoRecommendation: e.target.value as any })}
                    className="w-full rounded-xl border border-[#2a2a35] bg-[#1a1a24] px-3.5 py-2.5 text-xs text-white focus:border-emerald-500 focus:outline-none"
                  >
                    <option value="recommended">Recommended for PPO</option>
                    <option value="eligible">Eligible (Under Watch)</option>
                    <option value="in_review">In Review</option>
                    <option value="not_eligible">Not Eligible</option>
                  </select>
                </div>
              </div>

              {/* 6 Sliders */}
              <div className="rounded-xl border border-[#2a2a35] bg-[#1a1a24] p-3.5 space-y-2.5">
                <p className="text-xs font-semibold text-white">6-Pillar Scores (1–10 Scale):</p>
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div>
                    <label className="block text-[#a0a0b0] mb-0.5">Architecture: {form.architecture}/10</label>
                    <input
                      type="range"
                      min={1}
                      max={10}
                      value={form.architecture}
                      onChange={(e) => setForm({ ...form, architecture: Number(e.target.value) })}
                      className="w-full accent-purple-500"
                    />
                  </div>
                  <div>
                    <label className="block text-[#a0a0b0] mb-0.5">Problem Solving: {form.problemSolving}/10</label>
                    <input
                      type="range"
                      min={1}
                      max={10}
                      value={form.problemSolving}
                      onChange={(e) => setForm({ ...form, problemSolving: Number(e.target.value) })}
                      className="w-full accent-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="block text-[#a0a0b0] mb-0.5">Velocity: {form.velocity}/10</label>
                    <input
                      type="range"
                      min={1}
                      max={10}
                      value={form.velocity}
                      onChange={(e) => setForm({ ...form, velocity: Number(e.target.value) })}
                      className="w-full accent-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-[#a0a0b0] mb-0.5">Code Quality: {form.codeQuality}/10</label>
                    <input
                      type="range"
                      min={1}
                      max={10}
                      value={form.codeQuality}
                      onChange={(e) => setForm({ ...form, codeQuality: Number(e.target.value) })}
                      className="w-full accent-amber-500"
                    />
                  </div>
                  <div>
                    <label className="block text-[#a0a0b0] mb-0.5">Ownership: {form.ownership}/10</label>
                    <input
                      type="range"
                      min={1}
                      max={10}
                      value={form.ownership}
                      onChange={(e) => setForm({ ...form, ownership: Number(e.target.value) })}
                      className="w-full accent-pink-500"
                    />
                  </div>
                  <div>
                    <label className="block text-[#a0a0b0] mb-0.5">Communication: {form.communication}/10</label>
                    <input
                      type="range"
                      min={1}
                      max={10}
                      value={form.communication}
                      onChange={(e) => setForm({ ...form, communication: Number(e.target.value) })}
                      className="w-full accent-green-500"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#a0a0b0] mb-1">Qualitative Assessment & PPO Rationale *</label>
                <textarea
                  required
                  rows={3}
                  value={form.notes}
                  onChange={(e) => setForm({ ...form, notes: e.target.value })}
                  placeholder="Summarize candidate technical growth, readiness for full-time engineering responsibilities, and specific strengths."
                  className="w-full rounded-xl border border-[#2a2a35] bg-[#1a1a24] p-3 text-xs text-white focus:border-emerald-500 focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="rounded-xl border border-[#2a2a35] px-4 py-2 text-xs font-semibold text-[#a0a0b0] hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="rounded-xl bg-gradient-to-r from-emerald-600 to-green-600 px-5 py-2 text-xs font-bold text-white hover:brightness-110 disabled:opacity-50"
                >
                  {submitting ? 'Recording...' : 'Save Milestone Assessment'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
