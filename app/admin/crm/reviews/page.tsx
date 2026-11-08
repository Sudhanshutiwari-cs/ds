'use client'

import React, { useEffect, useState } from 'react'
import {
  CheckCircle2,
  Code2,
  ExternalLink,
  GitBranch,
  GitPullRequest,
  Loader2,
  Plus,
  RefreshCw,
  Search,
  Star,
  User,
  X,
  XCircle,
} from 'lucide-react'
import {
  fetchCodeReviews,
  submitCodeReview,
  fetchInterns,
  CodeReview,
  Intern,
} from '@/lib/crm-supabase'

const statusStyles: Record<string, { bg: string; text: string; border: string }> = {
  pending: { bg: 'bg-amber-500/10', text: 'text-amber-400', border: 'border-amber-500/30' },
  approved: { bg: 'bg-emerald-500/10', text: 'text-emerald-400', border: 'border-emerald-500/30' },
  changes_requested: { bg: 'bg-rose-500/10', text: 'text-rose-400', border: 'border-rose-500/30' },
  merged: { bg: 'bg-purple-500/10', text: 'text-purple-400', border: 'border-purple-500/30' },
}

export default function CrmReviewsPage() {
  const [reviews, setReviews] = useState<CodeReview[]>([])
  const [interns, setInterns] = useState<Intern[]>([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState('all')
  const [searchTerm, setSearchTerm] = useState('')

  // New Review Modal
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [form, setForm] = useState({
    internId: '',
    reviewerName: 'Deepak Sharma (Tech Lead)',
    prUrl: 'https://github.com/dssoftwares/',
    prTitle: '',
    status: 'approved' as 'pending' | 'approved' | 'changes_requested' | 'merged',
    architectureScore: 5,
    cleanCodeScore: 5,
    performanceScore: 4,
    testsScore: 4,
    feedback: '',
  })

  const loadData = async () => {
    setLoading(true)
    try {
      const [revs, ints] = await Promise.all([
        fetchCodeReviews(),
        fetchInterns(),
      ])
      setReviews(revs)
      setInterns(ints)

      if (ints.length > 0 && !form.internId) {
        setForm((prev) => ({ ...prev, internId: ints[0].user_id }))
      }
    } catch (err) {
      console.error('Failed to load reviews:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.internId || !form.prTitle || !form.feedback) {
      alert('Please complete all review fields.')
      return
    }

    setSubmitting(true)
    try {
      const created = await submitCodeReview({
        internId: form.internId,
        reviewerName: form.reviewerName,
        prUrl: form.prUrl,
        prTitle: form.prTitle,
        status: form.status,
        architectureScore: Number(form.architectureScore),
        cleanCodeScore: Number(form.cleanCodeScore),
        performanceScore: Number(form.performanceScore),
        testsScore: Number(form.testsScore),
        feedback: form.feedback,
      })
      setReviews((prev) => [created, ...prev])
      setIsModalOpen(false)
      setForm((prev) => ({ ...prev, prTitle: '', feedback: '' }))
    } catch (err: any) {
      alert(`Submission error: ${err.message}`)
    } finally {
      setSubmitting(false)
    }
  }

  const filtered = reviews.filter((r) => {
    const author = r.interns?.full_name?.toLowerCase() || ''
    const title = r.pr_title?.toLowerCase() || ''
    const q = searchTerm.toLowerCase()
    const matchesSearch = author.includes(q) || title.includes(q)
    const matchesStatus = statusFilter === 'all' || r.status === statusFilter
    return matchesSearch && matchesStatus
  })

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col justify-between gap-4 rounded-2xl border border-[#2a2a35] bg-[#131318] p-5 sm:flex-row sm:items-center">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-2xl font-bold text-white">GitHub PR & Code Review Hub</h2>
            <span className="rounded-full border border-purple-500/30 bg-purple-500/10 px-2.5 py-0.5 text-xs font-semibold text-purple-300 flex items-center gap-1">
              <GitPullRequest size={13} />
              Architectural Code Auditing
            </span>
          </div>
          <p className="mt-1 text-sm text-[#a0a0b0]">
            Review intern pull requests with 4-pillar rubrics (Clean Code, System Design, Latency, and Test Coverage)
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={loadData}
            className="flex items-center gap-2 rounded-xl border border-[#2a2a35] bg-[#1a1a24] px-3.5 py-2 text-xs font-medium text-white transition-all hover:bg-[#252532]"
            title="Refresh code reviews"
          >
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
            <span>Sync</span>
          </button>

          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#7727ff] to-[#6417ed] px-4 py-2 text-xs font-bold text-white shadow-lg shadow-purple-500/20 hover:brightness-110"
          >
            <Plus size={15} />
            <span>Log PR Review</span>
          </button>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid gap-4 sm:grid-cols-4">
        <div className="rounded-2xl border border-[#2a2a35] bg-[#131318] p-5">
          <p className="text-xs font-semibold uppercase tracking-wider text-[#a0a0b0]">Total PRs Reviewed</p>
          <p className="mt-2 text-3xl font-black text-white">{reviews.length}</p>
        </div>
        <div className="rounded-2xl border border-[#2a2a35] bg-[#131318] p-5">
          <p className="text-xs font-semibold uppercase tracking-wider text-purple-400">Merged to Main</p>
          <p className="mt-2 text-3xl font-black text-purple-400">
            {reviews.filter((r) => r.status === 'merged').length}
          </p>
        </div>
        <div className="rounded-2xl border border-[#2a2a35] bg-[#131318] p-5">
          <p className="text-xs font-semibold uppercase tracking-wider text-emerald-400">Approved</p>
          <p className="mt-2 text-3xl font-black text-emerald-400">
            {reviews.filter((r) => r.status === 'approved').length}
          </p>
        </div>
        <div className="rounded-2xl border border-[#2a2a35] bg-[#131318] p-5">
          <p className="text-xs font-semibold uppercase tracking-wider text-rose-400">Changes Requested</p>
          <p className="mt-2 text-3xl font-black text-rose-400">
            {reviews.filter((r) => r.status === 'changes_requested').length}
          </p>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="flex flex-col gap-3 rounded-2xl border border-[#2a2a35] bg-[#131318] p-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1 sm:max-w-md">
          <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#a0a0b0]" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by PR title or intern..."
            className="w-full rounded-xl border border-[#2a2a35] bg-[#1a1a24] py-2 pl-9 pr-3 text-xs text-white placeholder-[#606070] focus:border-[#7727ff] focus:outline-none"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-semibold text-[#808095]">Status:</span>
          {['all', 'pending', 'approved', 'changes_requested', 'merged'].map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`rounded-lg px-2.5 py-1 text-xs font-medium capitalize transition-all ${
                statusFilter === s
                  ? 'bg-[#6417ed] text-white shadow-md'
                  : 'border border-[#2a2a35] bg-[#1a1a24] text-[#a0a0b0] hover:text-white'
              }`}
            >
              {s.replace('_', ' ')}
            </button>
          ))}
        </div>
      </div>

      {/* Review Cards Grid */}
      <div className="grid gap-4 sm:grid-cols-2">
        {filtered.map((rev) => {
          const style = statusStyles[rev.status] || statusStyles['pending']
          const avgScore = ((rev.architecture_score + rev.clean_code_score + rev.performance_score + rev.tests_score) / 4).toFixed(1)

          return (
            <div key={rev.id} className="rounded-2xl border border-[#2a2a35] bg-[#131318] p-5 space-y-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <a
                    href={rev.pr_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm font-bold text-white hover:text-[#a77aff] flex items-center gap-1.5 transition-colors"
                  >
                    <GitPullRequest size={15} className="text-[#a77aff] shrink-0" />
                    <span>{rev.pr_title}</span>
                    <ExternalLink size={12} className="text-[#808095]" />
                  </a>
                  <p className="text-xs text-[#a0a0b0] mt-1 flex items-center gap-2">
                    <span className="text-white font-medium">{rev.interns?.full_name || 'Intern'}</span>
                    <span>•</span>
                    <span>Reviewed by {rev.reviewer_name}</span>
                  </p>
                </div>

                <span
                  className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-[10px] font-bold capitalize shrink-0 ${style.bg} ${style.text} ${style.border}`}
                >
                  {rev.status.replace('_', ' ')}
                </span>
              </div>

              {/* Rubric Breakdown */}
              <div className="grid grid-cols-4 gap-2 rounded-xl border border-[#2a2a35] bg-[#1a1a24] p-3 text-center text-xs">
                <div>
                  <span className="text-[10px] text-[#808095] block">Architecture</span>
                  <span className="font-bold text-purple-300">{rev.architecture_score} / 5</span>
                </div>
                <div>
                  <span className="text-[10px] text-[#808095] block">Clean Code</span>
                  <span className="font-bold text-emerald-300">{rev.clean_code_score} / 5</span>
                </div>
                <div>
                  <span className="text-[10px] text-[#808095] block">Performance</span>
                  <span className="font-bold text-blue-300">{rev.performance_score} / 5</span>
                </div>
                <div>
                  <span className="text-[10px] text-[#808095] block">Test Suite</span>
                  <span className="font-bold text-amber-300">{rev.tests_score} / 5</span>
                </div>
              </div>

              {/* Lead Feedback */}
              <div className="rounded-xl border border-[#2a2a35] bg-[#1a1a24]/50 p-3 text-xs text-[#d0ccda] leading-relaxed">
                <span className="text-[#a0a0b0] font-semibold block mb-1">Code Quality Feedback:</span>
                "{rev.feedback}"
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-[#2a2a35] text-[11px] text-[#808095]">
                <span>Rubric Index: {avgScore} / 5.0</span>
                <span>{new Date(rev.created_at).toLocaleDateString()}</span>
              </div>
            </div>
          )
        })}
      </div>

      {/* MODAL: SUBMIT CODE REVIEW */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-2xl border border-[#3a3545] bg-[#131318] p-6 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-[#2a2a35]">
              <div className="flex items-center gap-2">
                <div className="rounded-xl bg-purple-500/20 p-2 text-purple-400">
                  <GitPullRequest size={18} />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">Log Pull Request Code Review</h3>
                  <p className="text-xs text-[#a0a0b0]">Record rubric scores and technical feedback</p>
                </div>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="text-[#a0a0b0] hover:text-white">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSubmitReview} className="mt-5 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[#a0a0b0] mb-1">Author / Intern *</label>
                <select
                  required
                  value={form.internId}
                  onChange={(e) => setForm({ ...form, internId: e.target.value })}
                  className="w-full rounded-xl border border-[#2a2a35] bg-[#1a1a24] px-3.5 py-2.5 text-xs text-white focus:border-[#7727ff] focus:outline-none"
                >
                  {interns.map((i) => (
                    <option key={i.user_id} value={i.user_id}>
                      {i.full_name} ({i.teams?.name || 'Squad'})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#a0a0b0] mb-1">PR Title *</label>
                <input
                  type="text"
                  required
                  value={form.prTitle}
                  onChange={(e) => setForm({ ...form, prTitle: e.target.value })}
                  placeholder="e.g. feat(auth): Add Supabase SSR OAuth flow"
                  className="w-full rounded-xl border border-[#2a2a35] bg-[#1a1a24] px-3.5 py-2.5 text-xs text-white focus:border-[#7727ff] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#a0a0b0] mb-1">GitHub Pull Request URL *</label>
                <input
                  type="url"
                  required
                  value={form.prUrl}
                  onChange={(e) => setForm({ ...form, prUrl: e.target.value })}
                  className="w-full rounded-xl border border-[#2a2a35] bg-[#1a1a24] px-3.5 py-2.5 text-xs text-white focus:border-[#7727ff] focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[#a0a0b0] mb-1">Review Decision</label>
                  <select
                    value={form.status}
                    onChange={(e) => setForm({ ...form, status: e.target.value as any })}
                    className="w-full rounded-xl border border-[#2a2a35] bg-[#1a1a24] px-3.5 py-2.5 text-xs text-white focus:border-[#7727ff] focus:outline-none"
                  >
                    <option value="approved">Approved</option>
                    <option value="merged">Merged</option>
                    <option value="changes_requested">Changes Requested</option>
                    <option value="pending">In Review / Pending</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#a0a0b0] mb-1">Reviewer Name</label>
                  <input
                    type="text"
                    required
                    value={form.reviewerName}
                    onChange={(e) => setForm({ ...form, reviewerName: e.target.value })}
                    className="w-full rounded-xl border border-[#2a2a35] bg-[#1a1a24] px-3.5 py-2.5 text-xs text-white focus:border-[#7727ff] focus:outline-none"
                  />
                </div>
              </div>

              {/* Rubric Rating Sliders (1-5) */}
              <div className="rounded-xl border border-[#2a2a35] bg-[#1a1a24] p-3.5 space-y-3">
                <p className="text-xs font-semibold text-white">4-Pillar Engineering Rubric (1–5 Stars):</p>
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div>
                    <label className="block text-[#a0a0b0] mb-1">Architecture: {form.architectureScore}★</label>
                    <input
                      type="range"
                      min={1}
                      max={5}
                      value={form.architectureScore}
                      onChange={(e) => setForm({ ...form, architectureScore: Number(e.target.value) })}
                      className="w-full accent-purple-500"
                    />
                  </div>
                  <div>
                    <label className="block text-[#a0a0b0] mb-1">Clean Code: {form.cleanCodeScore}★</label>
                    <input
                      type="range"
                      min={1}
                      max={5}
                      value={form.cleanCodeScore}
                      onChange={(e) => setForm({ ...form, cleanCodeScore: Number(e.target.value) })}
                      className="w-full accent-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="block text-[#a0a0b0] mb-1">Performance: {form.performanceScore}★</label>
                    <input
                      type="range"
                      min={1}
                      max={5}
                      value={form.performanceScore}
                      onChange={(e) => setForm({ ...form, performanceScore: Number(e.target.value) })}
                      className="w-full accent-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-[#a0a0b0] mb-1">Tests: {form.testsScore}★</label>
                    <input
                      type="range"
                      min={1}
                      max={5}
                      value={form.testsScore}
                      onChange={(e) => setForm({ ...form, testsScore: Number(e.target.value) })}
                      className="w-full accent-amber-500"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#a0a0b0] mb-1">Code Review Notes / Feedback *</label>
                <textarea
                  required
                  rows={3}
                  value={form.feedback}
                  onChange={(e) => setForm({ ...form, feedback: e.target.value })}
                  placeholder="Provide concrete architectural feedback, suggestions for optimization, or shoutouts for clean code."
                  className="w-full rounded-xl border border-[#2a2a35] bg-[#1a1a24] p-3 text-xs text-white focus:border-[#7727ff] focus:outline-none"
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
                  className="rounded-xl bg-gradient-to-r from-[#7727ff] to-[#6417ed] px-5 py-2 text-xs font-bold text-white hover:brightness-110 disabled:opacity-50"
                >
                  {submitting ? 'Submitting...' : 'Save Code Review'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
