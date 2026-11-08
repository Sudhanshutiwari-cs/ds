'use client'

import React, { useEffect, useState } from 'react'
import {
  BookOpen,
  CheckCircle2,
  Clock,
  Code2,
  GraduationCap,
  Layers,
  Plus,
  RefreshCw,
  Search,
  Sparkles,
  User,
  X,
} from 'lucide-react'
import {
  fetchLearningModules,
  crmSupabase,
  LearningModule,
} from '@/lib/crm-supabase'

export default function CrmAcademyPage() {
  const [modules, setModules] = useState<LearningModule[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedTrack, setSelectedTrack] = useState<string>('all')

  // Create Module Modal
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({
    track: 'Full-Stack Next.js 15',
    title: '',
    description: '',
    durationHours: 4.5,
    lessonsText: 'Introduction to Core Architecture (30 min)\nHands-on Implementation Lab (60 min)\nProduction Hardening & Testing (45 min)',
  })

  const loadData = async () => {
    setLoading(true)
    try {
      const data = await fetchLearningModules()
      setModules(data)
    } catch (err) {
      console.error('Failed to load learning modules:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  const handleCreateModule = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.title || !form.description) return

    setSaving(true)
    try {
      const lessons = form.lessonsText
        .split('\n')
        .filter((l) => l.trim().length > 0)
        .map((line, idx) => ({
          id: `lesson-${Date.now()}-${idx}`,
          title: line.trim(),
          duration: '45 min',
          completed: false,
        }))

      const { data, error } = await crmSupabase
        .from('learning_modules')
        .insert([
          {
            track: form.track,
            title: form.title,
            description: form.description,
            duration_hours: Number(form.durationHours),
            sort_order: modules.length + 1,
            lessons,
          },
        ])
        .select()
        .single()

      if (error) throw error
      setModules((prev) => [...prev, data])
      setIsModalOpen(false)
      setForm((prev) => ({ ...prev, title: '', description: '' }))
    } catch (err: any) {
      alert(`Error creating module: ${err.message}`)
    } finally {
      setSaving(false)
    }
  }

  const filtered = modules.filter(
    (m) => selectedTrack === 'all' || m.track.toLowerCase().includes(selectedTrack.toLowerCase())
  )

  const uniqueTracks = Array.from(new Set(modules.map((m) => m.track)))

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col justify-between gap-4 rounded-2xl border border-[#2a2a35] bg-[#131318] p-5 sm:flex-row sm:items-center">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-2xl font-bold text-white">Engineering Academy & Tech Roadmaps</h2>
            <span className="rounded-full border border-indigo-500/30 bg-indigo-500/10 px-2.5 py-0.5 text-xs font-semibold text-indigo-300 flex items-center gap-1">
              <GraduationCap size={13} />
              Internal Developer LMS
            </span>
          </div>
          <p className="mt-1 text-sm text-[#a0a0b0]">
            Curated onboarding paths, system design tutorials, and technical guidelines for agency interns
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

          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 px-4 py-2 text-xs font-bold text-white shadow-lg shadow-indigo-500/20 hover:brightness-110"
          >
            <Plus size={15} />
            <span>Create Learning Module</span>
          </button>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-[#2a2a35] bg-[#131318] p-5">
          <p className="text-xs font-semibold uppercase tracking-wider text-[#a0a0b0]">Active Tracks</p>
          <p className="mt-2 text-3xl font-black text-white">{uniqueTracks.length}</p>
          <p className="mt-1 text-xs text-[#808095]">Next.js, PostgreSQL, AI Systems</p>
        </div>
        <div className="rounded-2xl border border-[#2a2a35] bg-[#131318] p-5">
          <p className="text-xs font-semibold uppercase tracking-wider text-indigo-400">Total Modules</p>
          <p className="mt-2 text-3xl font-black text-indigo-400">{modules.length}</p>
          <p className="mt-1 text-xs text-[#808095]">
            {modules.reduce((acc, m) => acc + (m.lessons?.length || 0), 0)} interactive lessons
          </p>
        </div>
        <div className="rounded-2xl border border-[#2a2a35] bg-[#131318] p-5">
          <p className="text-xs font-semibold uppercase tracking-wider text-emerald-400">Total Curriculum Hours</p>
          <p className="mt-2 text-3xl font-black text-emerald-400">
            {modules.reduce((acc, m) => acc + Number(m.duration_hours), 0).toFixed(1)} hrs
          </p>
          <p className="mt-1 text-xs text-[#808095]">Self-paced practical engineering</p>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-wrap items-center gap-2 rounded-2xl border border-[#2a2a35] bg-[#131318] p-4">
        <span className="text-xs font-semibold text-[#808095]">Filter by Track:</span>
        <button
          onClick={() => setSelectedTrack('all')}
          className={`rounded-lg px-2.5 py-1 text-xs font-medium transition-all ${
            selectedTrack === 'all'
              ? 'bg-[#6417ed] text-white shadow-md'
              : 'border border-[#2a2a35] bg-[#1a1a24] text-[#a0a0b0] hover:text-white'
          }`}
        >
          All Tracks
        </button>
        {uniqueTracks.map((tr) => (
          <button
            key={tr}
            onClick={() => setSelectedTrack(tr)}
            className={`rounded-lg px-2.5 py-1 text-xs font-medium transition-all ${
              selectedTrack === tr
                ? 'bg-[#6417ed] text-white shadow-md'
                : 'border border-[#2a2a35] bg-[#1a1a24] text-[#a0a0b0] hover:text-white'
            }`}
          >
            {tr}
          </button>
        ))}
      </div>

      {/* Module Cards Grid */}
      <div className="grid gap-5 sm:grid-cols-2">
        {filtered.map((mod, index) => (
          <div key={mod.id} className="rounded-2xl border border-[#2a2a35] bg-[#131318] p-5 space-y-4">
            <div className="flex items-start justify-between">
              <div>
                <span className="rounded-full border border-purple-500/30 bg-purple-500/10 px-2.5 py-0.5 text-[10px] font-bold uppercase text-purple-300">
                  {mod.track}
                </span>
                <h3 className="text-base font-bold text-white mt-2">{mod.title}</h3>
                <p className="text-xs text-[#a0a0b0] mt-1 leading-relaxed">{mod.description}</p>
              </div>
              <span className="text-xs font-mono font-bold text-indigo-400 bg-indigo-500/10 border border-indigo-500/30 px-2.5 py-1 rounded-xl shrink-0">
                {mod.duration_hours} hrs
              </span>
            </div>

            {/* Lesson Checklist */}
            <div className="rounded-xl border border-[#2a2a35] bg-[#1a1a24] p-3 space-y-2">
              <p className="text-xs font-semibold text-white">Syllabus & Lesson Modules ({mod.lessons?.length || 0}):</p>
              <div className="space-y-1.5">
                {(mod.lessons || []).map((l, i) => (
                  <div key={l.id || i} className="flex items-center justify-between text-xs text-[#d0ccda] py-1 px-2 rounded-lg bg-[#131318]/60">
                    <span className="flex items-center gap-2">
                      <span className="font-mono text-[#808095] text-[10px]">0{i + 1}.</span>
                      <span>{l.title}</span>
                    </span>
                    <span className="text-[10px] text-[#808095] font-mono">{l.duration}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-[#2a2a35] text-[11px] text-[#808095]">
              <span>Sequence Position: #{index + 1}</span>
              <span className="text-emerald-400 font-medium">Published & Available in Portal</span>
            </div>
          </div>
        ))}
      </div>

      {/* CREATE MODULE MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-2xl border border-[#3a3545] bg-[#131318] p-6 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-[#2a2a35]">
              <div className="flex items-center gap-2">
                <div className="rounded-xl bg-indigo-500/20 p-2 text-indigo-400">
                  <BookOpen size={18} />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">Create Learning Module</h3>
                  <p className="text-xs text-[#a0a0b0]">Publish technical training curriculum for interns</p>
                </div>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="text-[#a0a0b0] hover:text-white">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreateModule} className="mt-5 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[#a0a0b0] mb-1">Track</label>
                  <select
                    value={form.track}
                    onChange={(e) => setForm({ ...form, track: e.target.value })}
                    className="w-full rounded-xl border border-[#2a2a35] bg-[#1a1a24] px-3.5 py-2.5 text-xs text-white focus:border-indigo-500 focus:outline-none"
                  >
                    <option value="Full-Stack Next.js 15">Full-Stack Next.js 15</option>
                    <option value="PostgreSQL & Database Systems">PostgreSQL & Database Systems</option>
                    <option value="AI & Agentic Systems">AI & Agentic Systems</option>
                    <option value="DevOps & Docker Deployment">DevOps & Docker Deployment</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#a0a0b0] mb-1">Duration (Hours)</label>
                  <input
                    type="number"
                    step="0.5"
                    required
                    value={form.durationHours}
                    onChange={(e) => setForm({ ...form, durationHours: Number(e.target.value) })}
                    className="w-full rounded-xl border border-[#2a2a35] bg-[#1a1a24] px-3.5 py-2.5 text-xs text-white focus:border-indigo-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#a0a0b0] mb-1">Module Title *</label>
                <input
                  type="text"
                  required
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  placeholder="e.g. Advanced Caching & Revalidation in Next.js App Router"
                  className="w-full rounded-xl border border-[#2a2a35] bg-[#1a1a24] px-3.5 py-2.5 text-xs text-white focus:border-indigo-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#a0a0b0] mb-1">Module Description *</label>
                <textarea
                  required
                  rows={2}
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  placeholder="Key concepts, architectural goals, and takeaways."
                  className="w-full rounded-xl border border-[#2a2a35] bg-[#1a1a24] p-3 text-xs text-white focus:border-indigo-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#a0a0b0] mb-1">
                  Lessons (One per line)
                </label>
                <textarea
                  required
                  rows={4}
                  value={form.lessonsText}
                  onChange={(e) => setForm({ ...form, lessonsText: e.target.value })}
                  placeholder="One lesson per line..."
                  className="w-full rounded-xl border border-[#2a2a35] bg-[#1a1a24] p-3 text-xs text-white font-mono focus:border-indigo-500 focus:outline-none"
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
                  disabled={saving}
                  className="rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 px-5 py-2 text-xs font-bold text-white hover:brightness-110 disabled:opacity-50"
                >
                  {saving ? 'Creating...' : 'Publish Module'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
