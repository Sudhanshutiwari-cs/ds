'use client'

import React, { useEffect, useState } from 'react'
import {
  Calendar,
  CheckCircle2,
  Clock,
  ExternalLink,
  Heart,
  MessageSquare,
  Plus,
  RefreshCw,
  Sparkles,
  ThumbsUp,
  User,
  Users,
  Video,
  X,
} from 'lucide-react'
import {
  fetchMentorshipSessions,
  scheduleMentorshipSession,
  fetchRetrospectives,
  submitRetrospective,
  upvoteRetrospective,
  fetchInterns,
  MentorshipSession,
  Retrospective,
  Intern,
} from '@/lib/crm-supabase'

export default function CrmMentorshipPage() {
  const [tab, setTab] = useState<'sessions' | 'retro'>('sessions')
  const [sessions, setSessions] = useState<MentorshipSession[]>([])
  const [retros, setRetros] = useState<Retrospective[]>([])
  const [interns, setInterns] = useState<Intern[]>([])
  const [loading, setLoading] = useState(true)

  // Modals
  const [isSessionModalOpen, setIsSessionModalOpen] = useState(false)
  const [isRetroModalOpen, setIsRetroModalOpen] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  // Schedule Session Form
  const [sessionForm, setSessionForm] = useState({
    internId: '',
    mentorName: 'Deepak Sharma (Managing Director)',
    scheduledAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().substring(0, 16),
    durationMinutes: 30,
    topic: 'Career Growth & High-Scale Systems Architecture',
    agenda: '1. Review current sprint roadblocks\n2. Discuss PPO transition checklist\n3. System architecture guidance',
    meetingUrl: 'https://meet.google.com/dss-office-hours',
  })

  // Retrospective Form
  const [retroForm, setRetroForm] = useState({
    squadName: 'Alpha Squad',
    sprintName: 'Sprint 3',
    category: 'went_well' as 'went_well' | 'to_improve' | 'action_item' | 'kudos',
    content: '',
    authorName: 'Deepak Sharma',
  })

  const loadData = async () => {
    setLoading(true)
    try {
      const [sess, ret, ints] = await Promise.all([
        fetchMentorshipSessions(),
        fetchRetrospectives(),
        fetchInterns(),
      ])
      setSessions(sess)
      setRetros(ret)
      setInterns(ints)

      if (ints.length > 0 && !sessionForm.internId) {
        setSessionForm((prev) => ({ ...prev, internId: ints[0].user_id }))
      }
    } catch (err) {
      console.error('Failed to load mentorship & retro data:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  const handleScheduleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!sessionForm.internId || !sessionForm.topic) return

    setSubmitting(true)
    try {
      const created = await scheduleMentorshipSession(sessionForm)
      setSessions((prev) => [...prev, created])
      setIsSessionModalOpen(false)
    } catch (err: any) {
      alert(`Scheduling error: ${err.message}`)
    } finally {
      setSubmitting(false)
    }
  }

  const handleRetroSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!retroForm.content) return

    setSubmitting(true)
    try {
      const created = await submitRetrospective(retroForm)
      setRetros((prev) => [created, ...prev])
      setIsRetroModalOpen(false)
      setRetroForm((prev) => ({ ...prev, content: '' }))
    } catch (err: any) {
      alert(`Retro submission error: ${err.message}`)
    } finally {
      setSubmitting(false)
    }
  }

  const handleUpvote = async (retroId: string, currentVotes: number) => {
    try {
      const updated = await upvoteRetrospective(retroId, currentVotes)
      setRetros((prev) => prev.map((r) => (r.id === retroId ? { ...r, votes: updated.votes } : r)))
    } catch (err) {
      console.error('Vote error:', err)
    }
  }

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col justify-between gap-4 rounded-2xl border border-[#2a2a35] bg-[#131318] p-5 sm:flex-row sm:items-center">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-2xl font-bold text-white">1:1 Mentorship & Sprint Retrospectives</h2>
            <span className="rounded-full border border-blue-500/30 bg-blue-500/10 px-2.5 py-0.5 text-xs font-semibold text-blue-300 flex items-center gap-1">
              <Users size={13} />
              Culture & Office Hours
            </span>
          </div>
          <p className="mt-1 text-sm text-[#a0a0b0]">
            Schedule 1:1 senior architect mentorship slots and run bi-weekly squad retrospective boards
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={loadData}
            className="flex items-center gap-2 rounded-xl border border-[#2a2a35] bg-[#1a1a24] px-3.5 py-2 text-xs font-medium text-white transition-all hover:bg-[#252532]"
            title="Refresh"
          >
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
            <span>Sync</span>
          </button>

          {tab === 'sessions' ? (
            <button
              onClick={() => setIsSessionModalOpen(true)}
              className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-4 py-2 text-xs font-bold text-white shadow-lg shadow-blue-500/20 hover:brightness-110"
            >
              <Plus size={15} />
              <span>Schedule 1:1 Session</span>
            </button>
          ) : (
            <button
              onClick={() => setIsRetroModalOpen(true)}
              className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 px-4 py-2 text-xs font-bold text-white shadow-lg shadow-purple-500/20 hover:brightness-110"
            >
              <Plus size={15} />
              <span>Add Retro Note</span>
            </button>
          )}
        </div>
      </div>

      {/* Tab Switcher */}
      <div className="flex gap-2 border-b border-[#2a2a35] pb-2">
        <button
          onClick={() => setTab('sessions')}
          className={`flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-xl transition-all ${
            tab === 'sessions'
              ? 'bg-[#1a1a24] text-blue-400 border border-blue-500/30 shadow-md'
              : 'text-[#a0a0b0] hover:text-white'
          }`}
        >
          <Calendar size={14} />
          <span>1:1 Mentorship Office Hours ({sessions.length})</span>
        </button>

        <button
          onClick={() => setTab('retro')}
          className={`flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-xl transition-all ${
            tab === 'retro'
              ? 'bg-[#1a1a24] text-purple-400 border border-purple-500/30 shadow-md'
              : 'text-[#a0a0b0] hover:text-white'
          }`}
        >
          <MessageSquare size={14} />
          <span>Sprint Retrospective Board ({retros.length})</span>
        </button>
      </div>

      {/* TAB 1: MENTORSHIP SESSIONS */}
      {tab === 'sessions' && (
        <div className="grid gap-4 sm:grid-cols-2">
          {sessions.map((sess) => (
            <div key={sess.id} className="rounded-2xl border border-[#2a2a35] bg-[#131318] p-5 space-y-4">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    <User size={15} className="text-[#a77aff]" />
                    {sess.interns?.full_name || 'Intern'}
                  </h3>
                  <p className="text-xs text-[#a0a0b0] mt-0.5">Mentor: {sess.mentor_name}</p>
                </div>
                <span className="rounded-full border border-blue-500/30 bg-blue-500/10 px-2.5 py-0.5 text-[10px] font-bold uppercase text-blue-400">
                  {sess.status}
                </span>
              </div>

              <div className="rounded-xl border border-[#2a2a35] bg-[#1a1a24] p-3 text-xs space-y-1">
                <span className="font-semibold text-white block">{sess.topic}</span>
                {sess.agenda && <p className="text-[#a0a0b0] whitespace-pre-wrap">{sess.agenda}</p>}
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-[#2a2a35] text-xs">
                <span className="text-[#a0a0b0] flex items-center gap-1.5">
                  <Clock size={13} className="text-blue-400" />
                  {new Date(sess.scheduled_at).toLocaleString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    hour: 'numeric',
                    minute: '2-digit',
                  })}{' '}
                  ({sess.duration_minutes}m)
                </span>

                {sess.meeting_url && (
                  <a
                    href={sess.meeting_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-blue-400 hover:text-blue-300 font-semibold text-xs"
                  >
                    <Video size={13} />
                    <span>Join Google Meet</span>
                    <ExternalLink size={11} />
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* TAB 2: RETROSPECTIVE BOARD */}
      {tab === 'retro' && (
        <div className="grid gap-4 sm:grid-cols-4">
          {/* Column 1: Went Well */}
          <div className="space-y-3">
            <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-3 flex items-center justify-between">
              <span className="text-xs font-bold text-emerald-300">🟢 What Went Well</span>
              <span className="text-[10px] bg-emerald-500/20 px-2 py-0.5 rounded-full text-emerald-300 font-bold">
                {retros.filter((r) => r.category === 'went_well').length}
              </span>
            </div>
            {retros
              .filter((r) => r.category === 'went_well')
              .map((r) => (
                <div key={r.id} className="rounded-xl border border-[#2a2a35] bg-[#131318] p-3.5 space-y-2.5">
                  <p className="text-xs text-[#d0ccda] leading-relaxed">{r.content}</p>
                  <div className="flex items-center justify-between text-[11px] text-[#808095] pt-1 border-t border-[#2a2a35]">
                    <span>{r.author_name}</span>
                    <button
                      onClick={() => handleUpvote(r.id, r.votes)}
                      className="inline-flex items-center gap-1 text-emerald-400 hover:text-emerald-300 font-bold"
                    >
                      <ThumbsUp size={11} /> {r.votes}
                    </button>
                  </div>
                </div>
              ))}
          </div>

          {/* Column 2: To Improve */}
          <div className="space-y-3">
            <div className="rounded-xl border border-rose-500/30 bg-rose-500/10 p-3 flex items-center justify-between">
              <span className="text-xs font-bold text-rose-300">🔴 To Improve</span>
              <span className="text-[10px] bg-rose-500/20 px-2 py-0.5 rounded-full text-rose-300 font-bold">
                {retros.filter((r) => r.category === 'to_improve').length}
              </span>
            </div>
            {retros
              .filter((r) => r.category === 'to_improve')
              .map((r) => (
                <div key={r.id} className="rounded-xl border border-[#2a2a35] bg-[#131318] p-3.5 space-y-2.5">
                  <p className="text-xs text-[#d0ccda] leading-relaxed">{r.content}</p>
                  <div className="flex items-center justify-between text-[11px] text-[#808095] pt-1 border-t border-[#2a2a35]">
                    <span>{r.author_name}</span>
                    <button
                      onClick={() => handleUpvote(r.id, r.votes)}
                      className="inline-flex items-center gap-1 text-rose-400 hover:text-rose-300 font-bold"
                    >
                      <ThumbsUp size={11} /> {r.votes}
                    </button>
                  </div>
                </div>
              ))}
          </div>

          {/* Column 3: Action Items */}
          <div className="space-y-3">
            <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-3 flex items-center justify-between">
              <span className="text-xs font-bold text-amber-300">🟡 Action Items</span>
              <span className="text-[10px] bg-amber-500/20 px-2 py-0.5 rounded-full text-amber-300 font-bold">
                {retros.filter((r) => r.category === 'action_item').length}
              </span>
            </div>
            {retros
              .filter((r) => r.category === 'action_item')
              .map((r) => (
                <div key={r.id} className="rounded-xl border border-[#2a2a35] bg-[#131318] p-3.5 space-y-2.5">
                  <p className="text-xs text-[#d0ccda] leading-relaxed font-medium">{r.content}</p>
                  <div className="flex items-center justify-between text-[11px] text-[#808095] pt-1 border-t border-[#2a2a35]">
                    <span>{r.author_name}</span>
                    <button
                      onClick={() => handleUpvote(r.id, r.votes)}
                      className="inline-flex items-center gap-1 text-amber-400 hover:text-amber-300 font-bold"
                    >
                      <ThumbsUp size={11} /> {r.votes}
                    </button>
                  </div>
                </div>
              ))}
          </div>

          {/* Column 4: Kudos */}
          <div className="space-y-3">
            <div className="rounded-xl border border-purple-500/30 bg-purple-500/10 p-3 flex items-center justify-between">
              <span className="text-xs font-bold text-purple-300">💜 Kudos & Shoutouts</span>
              <span className="text-[10px] bg-purple-500/20 px-2 py-0.5 rounded-full text-purple-300 font-bold">
                {retros.filter((r) => r.category === 'kudos').length}
              </span>
            </div>
            {retros
              .filter((r) => r.category === 'kudos')
              .map((r) => (
                <div key={r.id} className="rounded-xl border border-[#2a2a35] bg-[#131318] p-3.5 space-y-2.5">
                  <p className="text-xs text-[#d0ccda] leading-relaxed italic">{r.content}</p>
                  <div className="flex items-center justify-between text-[11px] text-[#808095] pt-1 border-t border-[#2a2a35]">
                    <span>{r.author_name}</span>
                    <button
                      onClick={() => handleUpvote(r.id, r.votes)}
                      className="inline-flex items-center gap-1 text-pink-400 hover:text-pink-300 font-bold"
                    >
                      <Heart size={11} /> {r.votes}
                    </button>
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* MODAL 1: SCHEDULE 1:1 */}
      {isSessionModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl border border-[#3a3545] bg-[#131318] p-6 shadow-2xl">
            <div className="flex items-center justify-between pb-4 border-b border-[#2a2a35]">
              <div className="flex items-center gap-2">
                <div className="rounded-xl bg-blue-500/20 p-2 text-blue-400">
                  <Calendar size={18} />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">Schedule 1:1 Mentorship Slot</h3>
                  <p className="text-xs text-[#a0a0b0]">Dedicated office hours with senior leadership</p>
                </div>
              </div>
              <button onClick={() => setIsSessionModalOpen(false)} className="text-[#a0a0b0] hover:text-white">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleScheduleSubmit} className="mt-5 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[#a0a0b0] mb-1">Select Intern *</label>
                <select
                  required
                  value={sessionForm.internId}
                  onChange={(e) => setSessionForm({ ...sessionForm, internId: e.target.value })}
                  className="w-full rounded-xl border border-[#2a2a35] bg-[#1a1a24] px-3.5 py-2.5 text-xs text-white focus:border-blue-500 focus:outline-none"
                >
                  {interns.map((i) => (
                    <option key={i.user_id} value={i.user_id}>
                      {i.full_name} ({i.teams?.name || 'Squad'})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#a0a0b0] mb-1">Mentor Name</label>
                <input
                  type="text"
                  required
                  value={sessionForm.mentorName}
                  onChange={(e) => setSessionForm({ ...sessionForm, mentorName: e.target.value })}
                  className="w-full rounded-xl border border-[#2a2a35] bg-[#1a1a24] px-3.5 py-2.5 text-xs text-white focus:border-blue-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[#a0a0b0] mb-1">Date & Time *</label>
                  <input
                    type="datetime-local"
                    required
                    value={sessionForm.scheduledAt}
                    onChange={(e) => setSessionForm({ ...sessionForm, scheduledAt: e.target.value })}
                    className="w-full rounded-xl border border-[#2a2a35] bg-[#1a1a24] px-3.5 py-2.5 text-xs text-white focus:border-blue-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#a0a0b0] mb-1">Duration (Mins)</label>
                  <select
                    value={sessionForm.durationMinutes}
                    onChange={(e) => setSessionForm({ ...sessionForm, durationMinutes: Number(e.target.value) })}
                    className="w-full rounded-xl border border-[#2a2a35] bg-[#1a1a24] px-3.5 py-2.5 text-xs text-white focus:border-blue-500 focus:outline-none"
                  >
                    <option value={15}>15 Minutes</option>
                    <option value={30}>30 Minutes</option>
                    <option value={45}>45 Minutes</option>
                    <option value={60}>60 Minutes</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#a0a0b0] mb-1">Discussion Topic *</label>
                <input
                  type="text"
                  required
                  value={sessionForm.topic}
                  onChange={(e) => setSessionForm({ ...sessionForm, topic: e.target.value })}
                  placeholder="e.g. Architecture Deep Dive & Sprint Unblocking"
                  className="w-full rounded-xl border border-[#2a2a35] bg-[#1a1a24] px-3.5 py-2.5 text-xs text-white focus:border-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#a0a0b0] mb-1">Google Meet Link</label>
                <input
                  type="url"
                  value={sessionForm.meetingUrl}
                  onChange={(e) => setSessionForm({ ...sessionForm, meetingUrl: e.target.value })}
                  className="w-full rounded-xl border border-[#2a2a35] bg-[#1a1a24] px-3.5 py-2.5 text-xs text-white focus:border-blue-500 focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setIsSessionModalOpen(false)}
                  className="rounded-xl border border-[#2a2a35] px-4 py-2 text-xs font-semibold text-[#a0a0b0] hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-5 py-2 text-xs font-bold text-white hover:brightness-110 disabled:opacity-50"
                >
                  {submitting ? 'Booking...' : 'Confirm Mentorship Slot'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: ADD RETRO NOTE */}
      {isRetroModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl border border-[#3a3545] bg-[#131318] p-6 shadow-2xl">
            <div className="flex items-center justify-between pb-4 border-b border-[#2a2a35]">
              <div className="flex items-center gap-2">
                <div className="rounded-xl bg-purple-500/20 p-2 text-purple-400">
                  <MessageSquare size={18} />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">Post Retrospective Card</h3>
                  <p className="text-xs text-[#a0a0b0]">Share constructive insights for the squad sprint</p>
                </div>
              </div>
              <button onClick={() => setIsRetroModalOpen(false)} className="text-[#a0a0b0] hover:text-white">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleRetroSubmit} className="mt-5 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[#a0a0b0] mb-1">Squad Name</label>
                  <input
                    type="text"
                    required
                    value={retroForm.squadName}
                    onChange={(e) => setRetroForm({ ...retroForm, squadName: e.target.value })}
                    className="w-full rounded-xl border border-[#2a2a35] bg-[#1a1a24] px-3.5 py-2.5 text-xs text-white focus:border-purple-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#a0a0b0] mb-1">Category</label>
                  <select
                    value={retroForm.category}
                    onChange={(e) => setRetroForm({ ...retroForm, category: e.target.value as any })}
                    className="w-full rounded-xl border border-[#2a2a35] bg-[#1a1a24] px-3.5 py-2.5 text-xs text-white focus:border-purple-500 focus:outline-none"
                  >
                    <option value="went_well">🟢 Went Well</option>
                    <option value="to_improve">🔴 Needs Improvement</option>
                    <option value="action_item">🟡 Action Item</option>
                    <option value="kudos">💜 Kudos & Shoutout</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#a0a0b0] mb-1">Feedback / Retro Note *</label>
                <textarea
                  required
                  rows={3}
                  value={retroForm.content}
                  onChange={(e) => setRetroForm({ ...retroForm, content: e.target.value })}
                  placeholder="What specifically worked well, what caused friction, or who deserves recognition?"
                  className="w-full rounded-xl border border-[#2a2a35] bg-[#1a1a24] p-3 text-xs text-white focus:border-purple-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#a0a0b0] mb-1">Author Name</label>
                <input
                  type="text"
                  required
                  value={retroForm.authorName}
                  onChange={(e) => setRetroForm({ ...retroForm, authorName: e.target.value })}
                  className="w-full rounded-xl border border-[#2a2a35] bg-[#1a1a24] px-3.5 py-2.5 text-xs text-white focus:border-purple-500 focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setIsRetroModalOpen(false)}
                  className="rounded-xl border border-[#2a2a35] px-4 py-2 text-xs font-semibold text-[#a0a0b0] hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 px-5 py-2 text-xs font-bold text-white hover:brightness-110 disabled:opacity-50"
                >
                  {submitting ? 'Posting...' : 'Post to Retro Board'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
