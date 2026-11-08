'use client'

import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import {
  AlertCircle,
  AlertTriangle,
  ArrowRight,
  Award,
  Banknote,
  BookOpen,
  Calendar,
  CalendarRange,
  Check,
  CheckCircle2,
  CheckSquare,
  ChevronRight,
  Clock,
  Coins,
  Compass,
  ExternalLink,
  Eye,
  FileCheck,
  FileText,
  Flame,
  GitPullRequest,
  GraduationCap,
  Layers,
  Loader2,
  Lock,
  LogOut,
  Mail,
  MessageSquare,
  Play,
  Plus,
  Printer,
  Receipt,
  RotateCcw,
  Send,
  ShieldCheck,
  Sparkles,
  Star,
  Target,
  ThumbsUp,
  Trophy,
  User,
  Users,
  Video,
  X,
  Zap,
} from 'lucide-react'
import {
  crmSupabase,
  fetchInternPortalData,
  updateTaskStatus,
  fetchInterns,
  submitStandup,
  requestLeave,
  submitCodeReview,
  scheduleMentorshipSession,
  updateLearningProgress,
  Intern,
  Task,
  TaskStatus,
  Deadline,
  SalaryStructure,
  Payslip,
  PayslipStatus,
  Standup,
  LeaveRequest,
  LeaveType,
  Certificate,
  InternGamification,
  CodeReview,
  MilestoneReview,
  MentorshipSession,
  LearningModule,
  InternLearningProgress,
} from '@/lib/crm-supabase'

const statusBadges: Record<TaskStatus, { bg: string; text: string; label: string }> = {
  todo: { bg: 'bg-blue-500/10 border-blue-500/30', text: 'text-blue-400', label: 'To Do' },
  in_progress: { bg: 'bg-[#7727ff]/10 border-[#7727ff]/30', text: 'text-[#a77aff]', label: 'In Progress' },
  review: { bg: 'bg-amber-500/10 border-amber-500/30', text: 'text-amber-400', label: 'In Review' },
  done: { bg: 'bg-emerald-500/10 border-emerald-500/30', text: 'text-emerald-400', label: 'Completed' },
  blocked: { bg: 'bg-rose-500/10 border-rose-500/30', text: 'text-rose-400', label: 'Blocked' },
}

const payslipStatusBadges: Record<PayslipStatus, { bg: string; text: string; border: string }> = {
  pending: { bg: 'bg-amber-500/10', text: 'text-amber-400', border: 'border-amber-500/30' },
  processing: { bg: 'bg-blue-500/10', text: 'text-blue-400', border: 'border-blue-500/30' },
  paid: { bg: 'bg-emerald-500/10', text: 'text-emerald-400', border: 'border-emerald-500/30' },
}

const leaveStatusBadges: Record<string, { bg: string; text: string }> = {
  pending: { bg: 'bg-amber-500/10 border-amber-500/30', text: 'text-amber-400' },
  approved: { bg: 'bg-emerald-500/10 border-emerald-500/30', text: 'text-emerald-400' },
  rejected: { bg: 'bg-rose-500/10 border-rose-500/30', text: 'text-rose-400' },
}

export default function InternPortalPage() {
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [activeInternId, setActiveInternId] = useState<string | null>(null)
  const [allRegisteredInterns, setAllRegisteredInterns] = useState<Intern[]>([])

  // Dashboard Data
  const [portalTab, setPortalTab] = useState<
    'tasks' | 'standups' | 'reviews' | 'academy' | 'mentorship' | 'evaluations' | 'leaves' | 'payslips' | 'credentials'
  >('tasks')
  const [internProfile, setInternProfile] = useState<any>(null)
  const [tasks, setTasks] = useState<Task[]>([])
  const [teammates, setTeammates] = useState<Intern[]>([])
  const [deadlines, setDeadlines] = useState<Deadline[]>([])
  const [salaryStructure, setSalaryStructure] = useState<SalaryStructure | null>(null)
  const [payslips, setPayslips] = useState<Payslip[]>([])
  const [standups, setStandups] = useState<Standup[]>([])
  const [leaves, setLeaves] = useState<LeaveRequest[]>([])
  const [certificates, setCertificates] = useState<Certificate[]>([])
  const [gamification, setGamification] = useState<InternGamification | null>(null)
  const [codeReviews, setCodeReviews] = useState<CodeReview[]>([])
  const [milestoneReviews, setMilestoneReviews] = useState<MilestoneReview[]>([])
  const [mentorshipSessions, setMentorshipSessions] = useState<MentorshipSession[]>([])
  const [learningModules, setLearningModules] = useState<LearningModule[]>([])
  const [learningProgress, setLearningProgress] = useState<InternLearningProgress[]>([])
  const [selectedPayslipForVoucher, setSelectedPayslipForVoucher] = useState<Payslip | null>(null)
  const [loading, setLoading] = useState(true)

  // Auth Form State (for direct email login)
  const [authEmail, setAuthEmail] = useState('')
  const [authPassword, setAuthPassword] = useState('')
  const [authLoading, setAuthLoading] = useState(false)
  const [authError, setAuthError] = useState<string | null>(null)

  // Filter Tasks
  const [taskFilter, setTaskFilter] = useState<'all' | 'todo' | 'in_progress' | 'review' | 'done'>('all')

  // Standup Form State
  const [standupYesterday, setStandupYesterday] = useState('')
  const [standupToday, setStandupToday] = useState('')
  const [standupBlockers, setStandupBlockers] = useState('')
  const [standupSubmitting, setStandupSubmitting] = useState(false)

  // Leave Form State / Modal
  const [isLeaveModalOpen, setIsLeaveModalOpen] = useState(false)
  const [leaveStart, setLeaveStart] = useState('')
  const [leaveEnd, setLeaveEnd] = useState('')
  const [leaveDays, setLeaveDays] = useState(1)
  const [leaveType, setLeaveType] = useState<LeaveType>('casual')
  const [leaveReason, setLeaveReason] = useState('')
  const [leaveSubmitting, setLeaveSubmitting] = useState(false)

  // PR Submission Modal
  const [isPrModalOpen, setIsPrModalOpen] = useState(false)
  const [prUrl, setPrUrl] = useState('https://github.com/dssoftwares/')
  const [prTitle, setPrTitle] = useState('')
  const [prSubmitting, setPrSubmitting] = useState(false)

  // Mentorship Booking Modal
  const [isMentorshipModalOpen, setIsMentorshipModalOpen] = useState(false)
  const [mentorTopic, setMentorTopic] = useState('Sprint Architecture Review & Roadmap Guidance')
  const [mentorScheduledAt, setMentorScheduledAt] = useState(
    new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().substring(0, 16)
  )
  const [mentorSubmitting, setMentorSubmitting] = useState(false)

  const todayStr = new Date().toISOString().substring(0, 10)
  const todayStandup = standups.find((s) => s.standup_date === todayStr)

  // 1. Initial Load: Check session & fetch intern directory for quick preview
  useEffect(() => {
    async function initPortal() {
      setLoading(true)
      try {
        const internsList = await fetchInterns()
        setAllRegisteredInterns(internsList)

        const { data: sessionData } = await crmSupabase.auth.getSession()
        const user = sessionData?.session?.user

        if (user) {
          setCurrentUser(user)
          setActiveInternId(user.id)
          await loadPortal(user.id)
        } else if (internsList.length > 0) {
          setActiveInternId(internsList[0].user_id)
          await loadPortal(internsList[0].user_id)
        }
      } catch (err) {
        console.error('Portal init error:', err)
      } finally {
        setLoading(false)
      }
    }

    initPortal()
  }, [])

  // Load specific intern dashboard
  const loadPortal = async (userId: string) => {
    setLoading(true)
    try {
      const data = await fetchInternPortalData(userId)
      setInternProfile(data.intern)
      setTasks(data.tasks)
      setTeammates(data.teammates)
      setDeadlines(data.deadlines)
      setSalaryStructure(data.salaryStructure || null)
      setPayslips(data.payslips || [])
      setStandups(data.standups || [])
      setLeaves(data.leaves || [])
      setCertificates(data.certificates || [])
      setGamification(data.gamification || null)
      setCodeReviews(data.codeReviews || [])
      setMilestoneReviews(data.milestoneReviews || [])
      setMentorshipSessions(data.mentorshipSessions || [])
      setLearningModules(data.learningModules || [])
      setLearningProgress(data.learningProgress || [])
    } catch (err) {
      console.error('Failed to load intern data:', err)
    } finally {
      setLoading(false)
    }
  }

  // Handle Intern Login with Email/Password
  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setAuthLoading(true)
    setAuthError(null)

    try {
      const { data, error } = await crmSupabase.auth.signInWithPassword({
        email: authEmail,
        password: authPassword,
      })

      if (error) {
        setAuthError(error.message)
      } else if (data?.user) {
        setCurrentUser(data.user)
        setActiveInternId(data.user.id)
        await loadPortal(data.user.id)
      }
    } catch (err: any) {
      setAuthError(err.message || 'Login failed')
    } finally {
      setAuthLoading(false)
    }
  }

  const handleSignOut = async () => {
    await crmSupabase.auth.signOut()
    setCurrentUser(null)
  }

  const handleSwitchIntern = (userId: string) => {
    setActiveInternId(userId)
    loadPortal(userId)
  }

  const handleTaskStatusChange = async (taskId: string, newStatus: TaskStatus) => {
    try {
      const updated = await updateTaskStatus(taskId, newStatus)
      setTasks((prev) => prev.map((t) => (t.id === taskId ? { ...t, status: updated.status } : t)))
    } catch (err) {
      console.error('Failed to update task:', err)
    }
  }

  // Submit Daily Standup
  const handleStandupSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!activeInternId || !internProfile?.team_id) return
    setStandupSubmitting(true)
    try {
      const submitted = await submitStandup({
        internId: activeInternId,
        teamId: internProfile.team_id,
        yesterday: standupYesterday,
        today: standupToday,
        blockers: standupBlockers,
      })
      setStandups((prev) => [submitted, ...prev.filter((s) => s.standup_date !== todayStr)])
      setStandupYesterday('')
      setStandupToday('')
      setStandupBlockers('')
      alert('Daily standup check-in submitted successfully!')
    } catch (err: any) {
      alert(`Standup error: ${err.message}`)
    } finally {
      setStandupSubmitting(false)
    }
  }

  // Submit Leave Request
  const handleLeaveSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!activeInternId) return
    setLeaveSubmitting(true)
    try {
      const req = await requestLeave({
        internId: activeInternId,
        startDate: leaveStart,
        endDate: leaveEnd,
        daysCount: Number(leaveDays),
        leaveType,
        reason: leaveReason,
      })
      setLeaves((prev) => [req, ...prev])
      setIsLeaveModalOpen(false)
      setLeaveStart('')
      setLeaveEnd('')
      setLeaveReason('')
      alert('Leave request submitted to squad lead!')
    } catch (err: any) {
      alert(`Leave request error: ${err.message}`)
    } finally {
      setLeaveSubmitting(false)
    }
  }

  // Submit PR for Review
  const handlePrSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!activeInternId || !prTitle || !prUrl) return
    setPrSubmitting(true)
    try {
      const created = await submitCodeReview({
        internId: activeInternId,
        reviewerName: 'Squad Lead / Peer',
        prUrl,
        prTitle,
        status: 'pending',
        architectureScore: 4,
        cleanCodeScore: 4,
        performanceScore: 4,
        testsScore: 4,
        feedback: 'Submitted by intern for sprint peer review.',
      })
      setCodeReviews((prev) => [created, ...prev])
      setIsPrModalOpen(false)
      setPrTitle('')
      alert('Pull Request submitted for code review!')
    } catch (err: any) {
      alert(`PR submission error: ${err.message}`)
    } finally {
      setPrSubmitting(false)
    }
  }

  // Book 1:1 Mentorship Slot
  const handleMentorshipSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!activeInternId || !mentorTopic) return
    setMentorSubmitting(true)
    try {
      const created = await scheduleMentorshipSession({
        internId: activeInternId,
        mentorName: 'Deepak Sharma (Managing Director)',
        scheduledAt: mentorScheduledAt,
        durationMinutes: 30,
        topic: mentorTopic,
      })
      setMentorshipSessions((prev) => [...prev, created])
      setIsMentorshipModalOpen(false)
      alert('1:1 Mentorship Session scheduled!')
    } catch (err: any) {
      alert(`Booking error: ${err.message}`)
    } finally {
      setMentorSubmitting(false)
    }
  }

  // Toggle Learning Lesson Progress
  const handleToggleLesson = async (moduleId: string, currentPct: number) => {
    if (!activeInternId) return
    const newPct = currentPct >= 100 ? 50 : 100
    try {
      await updateLearningProgress(activeInternId, moduleId, newPct)
      setLearningProgress((prev) => {
        const existing = prev.find((p) => p.module_id === moduleId)
        if (existing) {
          return prev.map((p) => (p.module_id === moduleId ? { ...p, progress_percent: newPct } : p))
        }
        return [
          ...prev,
          {
            id: 'temp',
            intern_id: activeInternId,
            module_id: moduleId,
            progress_percent: newPct,
            status: newPct >= 100 ? 'completed' : 'in_progress',
          },
        ]
      })
    } catch (err) {
      console.error(err)
    }
  }

  const completedCount = tasks.filter((t) => t.status === 'done').length
  const inProgressCount = tasks.filter((t) => t.status === 'in_progress').length
  const todoCount = tasks.filter((t) => t.status === 'todo').length
  const progressPct = tasks.length > 0 ? Math.round((completedCount / tasks.length) * 100) : 0

  const filteredTasks = tasks.filter((t) => {
    if (taskFilter === 'all') return true
    return t.status === taskFilter
  })

  return (
    <main className="min-h-screen bg-[#050506] font-sans text-[#f7f5ff] selection:bg-[#7727ff]">
      {/* Top Navbar */}
      <header className="sticky top-0 z-40 border-b border-[#211d2b] bg-[#0c0b0f]/90 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
          <div className="flex items-center gap-3">
            <a href="/" className="text-lg font-black tracking-[-0.04em]">
              <span className="text-[#7727ff]">DS</span>Softwares<span className="text-[#7727ff]">.</span>
            </a>
            <span className="rounded-md border border-[#7727ff]/40 bg-[#6417ed]/20 px-2 py-0.5 text-[11px] font-bold text-[#b58cff]">
              Intern Portal
            </span>
          </div>

          <div className="flex items-center gap-3">
            {/* Development Profile Switcher */}
            {allRegisteredInterns.length > 0 && (
              <div className="flex items-center gap-1.5 rounded-xl border border-[#2b2735] bg-[#16141c] px-2.5 py-1 text-xs">
                <span className="text-[11px] text-[#8e8a99] hidden sm:inline">Viewing as:</span>
                <select
                  value={activeInternId || ''}
                  onChange={(e) => handleSwitchIntern(e.target.value)}
                  className="bg-transparent text-xs font-bold text-[#c8b4ff] focus:outline-none cursor-pointer"
                >
                  {allRegisteredInterns.map((intern) => (
                    <option key={intern.user_id} value={intern.user_id} className="bg-[#16141c] text-white">
                      {intern.full_name} ({intern.teams?.name || 'No Squad'})
                    </option>
                  ))}
                </select>
              </div>
            )}

            {currentUser ? (
              <button
                onClick={handleSignOut}
                className="flex items-center gap-1.5 rounded-xl border border-[#353042] bg-[#1a1724] px-3 py-1.5 text-xs font-semibold text-[#a0a0b0] hover:text-white"
              >
                <LogOut size={13} />
                <span className="hidden sm:inline">Sign Out</span>
              </button>
            ) : (
              <a
                href="/admin"
                className="rounded-xl border border-[#2b2735] bg-[#16141c] px-3 py-1.5 text-xs font-semibold text-[#a0a0b0] hover:text-white"
              >
                Manager Login
              </a>
            )}
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
        {loading && !internProfile ? (
          <div className="flex h-96 items-center justify-center">
            <Loader2 size={32} className="animate-spin text-[#7727ff]" />
            <span className="ml-3 text-sm text-[#a0a0b0]">Loading your workspace...</span>
          </div>
        ) : !internProfile ? (
          /* No Intern Profile State / Auth Fallback */
          <div className="mx-auto max-w-md py-12">
            <div className="rounded-3xl border border-[#3f3b49] bg-[#111013] p-8 shadow-2xl text-center">
              <div className="mx-auto flex size-14 items-center justify-center rounded-2xl border border-[#7727ff]/30 bg-[#7727ff]/15 text-[#a77aff] mb-4">
                <GraduationCap size={28} />
              </div>
              <h2 className="text-xl font-bold text-white">Intern Portal Login</h2>
              <p className="mt-1 text-xs text-[#a0a0b0]">
                Sign in with the email provided during your internship onboarding.
              </p>

              {authError && (
                <div className="mt-4 rounded-xl border border-rose-500/30 bg-rose-500/10 p-3 text-xs text-rose-300">
                  {authError}
                </div>
              )}

              <form onSubmit={handleAuthSubmit} className="mt-6 space-y-4 text-left">
                <div>
                  <label className="block text-xs font-semibold text-[#a0a0b0] mb-1">Email Address</label>
                  <input
                    type="email"
                    required
                    value={authEmail}
                    onChange={(e) => setAuthEmail(e.target.value)}
                    placeholder="intern@example.com"
                    className="w-full rounded-xl border border-[#2b2735] bg-[#18161f] px-3.5 py-2.5 text-xs text-white focus:border-[#7727ff] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#a0a0b0] mb-1">Password</label>
                  <input
                    type="password"
                    required
                    value={authPassword}
                    onChange={(e) => setAuthPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full rounded-xl border border-[#2b2735] bg-[#18161f] px-3.5 py-2.5 text-xs text-white focus:border-[#7727ff] focus:outline-none"
                  />
                </div>
                <button
                  type="submit"
                  disabled={authLoading}
                  className="w-full rounded-xl bg-[#6417ed] py-2.5 text-xs font-bold text-white hover:bg-[#7727ff] disabled:opacity-50"
                >
                  {authLoading ? 'Verifying...' : 'Sign In to Portal'}
                </button>
              </form>
            </div>
          </div>
        ) : (
          /* Active Intern Workspace */
          <div className="space-y-8">
            {/* Welcome Header & Profile Card */}
            <div className="relative overflow-hidden rounded-3xl border border-[#312c3d] bg-gradient-to-r from-[#111015] via-[#161222] to-[#111015] p-6 sm:p-8">
              <div
                aria-hidden="true"
                className="pointer-events-none absolute -right-20 -top-20 size-72 rounded-full bg-[#7727ff15] blur-3xl"
              />

              <div className="relative flex flex-col justify-between gap-6 md:flex-row md:items-center">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="flex items-center gap-1.5 rounded-full border border-green-500/40 bg-green-500/10 px-3 py-1 text-xs font-bold text-green-400">
                      <span className="size-2 rounded-full bg-green-400 animate-pulse" />
                      Active Intern
                    </span>
                    <span className="rounded-full border border-[#7727ff]/30 bg-[#7727ff]/20 px-3 py-1 text-xs font-bold text-[#c8b4ff]">
                      {internProfile.batches?.programs?.title || 'Engineering Internship'}
                    </span>
                  </div>

                  <h1 className="mt-4 text-2xl font-black text-white sm:text-3xl">
                    Welcome back, {internProfile.full_name} 👋
                  </h1>
                  <p className="mt-1 text-xs text-[#a0a0b0] sm:text-sm">
                    Cohort: <strong className="text-white">{internProfile.batches?.name || 'Unassigned'}</strong> · Squad:{' '}
                    <strong className="text-[#a77aff]">{internProfile.teams?.name || 'Pending Squad Assignment'}</strong>
                  </p>

                  {/* Gamification Developer XP Ribbon */}
                  {gamification && (
                    <div className="mt-4 flex flex-wrap items-center gap-2.5">
                      <span className="inline-flex items-center gap-1.5 rounded-xl border border-amber-500/30 bg-amber-500/10 px-3 py-1 text-xs font-bold text-amber-300">
                        <Trophy size={14} className="text-amber-400" />
                        {gamification.xp} XP (Lvl {gamification.level})
                      </span>
                      <span className="inline-flex items-center gap-1 rounded-xl border border-purple-500/30 bg-purple-500/10 px-2.5 py-1 text-xs font-semibold text-purple-300">
                        {gamification.tier}
                      </span>
                      <span className="inline-flex items-center gap-1 rounded-xl border border-orange-500/30 bg-orange-500/10 px-2.5 py-1 text-xs font-semibold text-orange-400">
                        <Flame size={14} className="text-orange-400 animate-pulse" />
                        {gamification.streak_days} Days Streak
                      </span>
                      {(gamification.badges || []).slice(0, 3).map((b) => (
                        <span key={b} className="rounded-lg border border-[#3a3545] bg-[#1a1722] px-2 py-0.5 text-[10px] text-[#c8b4ff]">
                          ⭐ {b}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Velocity Progress Box */}
                <div className="rounded-2xl border border-[#2b2735] bg-[#0c0b0f]/80 p-5 min-w-[240px]">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-[#8e8a99]">Sprint Completion</span>
                    <span className="font-bold text-[#a77aff]">{progressPct}%</span>
                  </div>
                  <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-[#1e1c24]">
                    <div
                      className="h-full bg-gradient-to-r from-[#7727ff] to-[#22c55e] transition-all duration-500"
                      style={{ width: `${progressPct}%` }}
                    />
                  </div>
                  <p className="mt-2 text-[11px] text-[#8e8a99]">
                    {completedCount} completed · {inProgressCount + todoCount} remaining
                  </p>
                </div>
              </div>
            </div>

            {/* Top Navigation Tabs (9 Extended Feature Hubs) */}
            <div className="flex border-b border-[#211d2b] gap-3 sm:gap-6 text-xs sm:text-sm font-semibold overflow-x-auto scrollbar-none pb-0.5">
              <button
                onClick={() => setPortalTab('tasks')}
                className={`flex items-center gap-1.5 pb-3.5 border-b-2 transition-all whitespace-nowrap ${
                  portalTab === 'tasks'
                    ? 'border-[#7727ff] text-white font-bold'
                    : 'border-transparent text-[#8e8a99] hover:text-white'
                }`}
              >
                <CheckSquare size={15} className={portalTab === 'tasks' ? 'text-[#a77aff]' : ''} />
                Sprint Tasks ({tasks.length})
              </button>

              <button
                onClick={() => setPortalTab('standups')}
                className={`flex items-center gap-1.5 pb-3.5 border-b-2 transition-all whitespace-nowrap ${
                  portalTab === 'standups'
                    ? 'border-[#7727ff] text-white font-bold'
                    : 'border-transparent text-[#8e8a99] hover:text-white'
                }`}
              >
                <MessageSquare size={15} className={portalTab === 'standups' ? 'text-[#a77aff]' : ''} />
                Daily Standups
                {todayStandup ? (
                  <span className="size-2 rounded-full bg-green-400" />
                ) : (
                  <span className="size-2 rounded-full bg-amber-400 animate-pulse" />
                )}
              </button>

              <button
                onClick={() => setPortalTab('reviews')}
                className={`flex items-center gap-1.5 pb-3.5 border-b-2 transition-all whitespace-nowrap ${
                  portalTab === 'reviews'
                    ? 'border-[#7727ff] text-white font-bold'
                    : 'border-transparent text-[#8e8a99] hover:text-white'
                }`}
              >
                <GitPullRequest size={15} className={portalTab === 'reviews' ? 'text-[#a77aff]' : ''} />
                PR & Reviews ({codeReviews.length})
              </button>

              <button
                onClick={() => setPortalTab('academy')}
                className={`flex items-center gap-1.5 pb-3.5 border-b-2 transition-all whitespace-nowrap ${
                  portalTab === 'academy'
                    ? 'border-[#7727ff] text-white font-bold'
                    : 'border-transparent text-[#8e8a99] hover:text-white'
                }`}
              >
                <BookOpen size={15} className={portalTab === 'academy' ? 'text-[#a77aff]' : ''} />
                Tech Academy ({learningModules.length})
              </button>

              <button
                onClick={() => setPortalTab('mentorship')}
                className={`flex items-center gap-1.5 pb-3.5 border-b-2 transition-all whitespace-nowrap ${
                  portalTab === 'mentorship'
                    ? 'border-[#7727ff] text-white font-bold'
                    : 'border-transparent text-[#8e8a99] hover:text-white'
                }`}
              >
                <Users size={15} className={portalTab === 'mentorship' ? 'text-[#a77aff]' : ''} />
                1:1 Office Hours ({mentorshipSessions.length})
              </button>

              <button
                onClick={() => setPortalTab('evaluations')}
                className={`flex items-center gap-1.5 pb-3.5 border-b-2 transition-all whitespace-nowrap ${
                  portalTab === 'evaluations'
                    ? 'border-[#7727ff] text-white font-bold'
                    : 'border-transparent text-[#8e8a99] hover:text-white'
                }`}
              >
                <Target size={15} className={portalTab === 'evaluations' ? 'text-[#a77aff]' : ''} />
                Skill Matrix & PPO
              </button>

              <button
                onClick={() => setPortalTab('leaves')}
                className={`flex items-center gap-1.5 pb-3.5 border-b-2 transition-all whitespace-nowrap ${
                  portalTab === 'leaves'
                    ? 'border-[#7727ff] text-white font-bold'
                    : 'border-transparent text-[#8e8a99] hover:text-white'
                }`}
              >
                <CalendarRange size={15} className={portalTab === 'leaves' ? 'text-[#a77aff]' : ''} />
                Leaves ({leaves.length})
              </button>

              <button
                onClick={() => setPortalTab('payslips')}
                className={`flex items-center gap-1.5 pb-3.5 border-b-2 transition-all whitespace-nowrap ${
                  portalTab === 'payslips'
                    ? 'border-[#7727ff] text-white font-bold'
                    : 'border-transparent text-[#8e8a99] hover:text-white'
                }`}
              >
                <Banknote size={15} className={portalTab === 'payslips' ? 'text-[#a77aff]' : ''} />
                Payslips ({payslips.length})
              </button>

              <button
                onClick={() => setPortalTab('credentials')}
                className={`flex items-center gap-1.5 pb-3.5 border-b-2 transition-all whitespace-nowrap ${
                  portalTab === 'credentials'
                    ? 'border-[#7727ff] text-white font-bold'
                    : 'border-transparent text-[#8e8a99] hover:text-white'
                }`}
              >
                <Award size={15} className={portalTab === 'credentials' ? 'text-[#a77aff]' : ''} />
                Certificate ({certificates.length})
              </button>
            </div>

            {/* TAB 1: SPRINT TASKS & BACKLOG */}
            {portalTab === 'tasks' && (
              <div className="grid gap-8 lg:grid-cols-12">
                <div className="space-y-5 lg:col-span-8">
                  <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                    <div>
                      <h2 className="text-lg font-bold text-white flex items-center gap-2">
                        <CheckSquare size={18} className="text-[#7727ff]" />
                        My Assigned Sprint Tasks ({tasks.length})
                      </h2>
                      <p className="text-xs text-[#a0a0b0]">
                        Click actions on each card to update your sprint progress
                      </p>
                    </div>

                    <div className="flex flex-wrap gap-1.5 text-xs">
                      {(['all', 'todo', 'in_progress', 'review', 'done'] as const).map((tab) => (
                        <button
                          key={tab}
                          onClick={() => setTaskFilter(tab)}
                          className={`rounded-lg px-2.5 py-1 text-xs font-semibold capitalize transition-all ${
                            taskFilter === tab
                              ? 'bg-[#6417ed] text-white shadow-md'
                              : 'border border-[#2b2735] bg-[#16141c] text-[#8e8a99] hover:text-white'
                          }`}
                        >
                          {tab.replace('_', ' ')}
                        </button>
                      ))}
                    </div>
                  </div>

                  {tasks.length === 0 ? (
                    <div className="rounded-2xl border border-[#2a2a35] bg-[#111015] p-12 text-center">
                      <CheckSquare size={40} className="mx-auto text-[#606070] mb-3 opacity-40" />
                      <h3 className="text-sm font-bold text-white">No tasks assigned yet</h3>
                      <p className="mt-1 text-xs text-[#a0a0b0]">
                        Your team leader will assign your sprint deliverables shortly.
                      </p>
                    </div>
                  ) : filteredTasks.length === 0 ? (
                    <div className="rounded-2xl border border-[#2a2a35] bg-[#111015] p-8 text-center text-xs text-[#8e8a99]">
                      No tasks match the selected status filter.
                    </div>
                  ) : (
                    <div className="space-y-3.5">
                      {filteredTasks.map((task) => {
                        const badge = statusBadges[task.status] || statusBadges.todo
                        const isOverdue =
                          task.due_date &&
                          new Date(task.due_date) < new Date() &&
                          task.status !== 'done'

                        return (
                          <div
                            key={task.id}
                            className="rounded-2xl border border-[#2b2735] bg-[#111015] p-5 transition-all hover:border-[#3d384a]"
                          >
                            <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-start">
                              <div className="space-y-1">
                                <div className="flex items-center gap-2">
                                  <h3 className="text-sm font-bold text-white">{task.title}</h3>
                                  <span
                                    className={`inline-flex items-center rounded-md border px-2 py-0.5 text-[10px] font-bold ${badge.bg} ${badge.text}`}
                                  >
                                    {badge.label}
                                  </span>
                                </div>
                                {task.description && (
                                  <p className="text-xs text-[#a0a0b0] leading-relaxed line-clamp-2">
                                    {task.description}
                                  </p>
                                )}
                              </div>

                              {/* Status Action Buttons */}
                              <div className="flex flex-wrap items-center gap-1.5 self-start shrink-0">
                                {task.status !== 'in_progress' && task.status !== 'done' && (
                                  <button
                                    onClick={() => handleTaskStatusChange(task.id, 'in_progress')}
                                    className="rounded-lg border border-[#342f40] bg-[#1a1724] px-2.5 py-1 text-[11px] font-semibold text-[#c8b4ff] hover:bg-[#252230]"
                                  >
                                    Start Task
                                  </button>
                                )}
                                {task.status === 'in_progress' && (
                                  <button
                                    onClick={() => handleTaskStatusChange(task.id, 'review')}
                                    className="rounded-lg border border-amber-500/30 bg-amber-500/10 px-2.5 py-1 text-[11px] font-semibold text-amber-300 hover:bg-amber-500/20"
                                  >
                                    Ready for Review
                                  </button>
                                )}
                                {task.status !== 'done' && (
                                  <button
                                    onClick={() => handleTaskStatusChange(task.id, 'done')}
                                    className="flex items-center gap-1 rounded-lg border border-green-500/30 bg-green-500/10 px-2.5 py-1 text-[11px] font-semibold text-green-400 hover:bg-green-500/20"
                                  >
                                    <Check size={11} /> Mark Complete
                                  </button>
                                )}
                              </div>
                            </div>

                            <div className="mt-4 flex flex-wrap items-center justify-between border-t border-[#1e1c24] pt-3 text-[11px] text-[#8e8a99]">
                              <span className="flex items-center gap-1.5">
                                <Clock size={12} className={isOverdue ? 'text-rose-400' : 'text-[#8e8a99]'} />
                                {task.due_date ? (
                                  <span className={isOverdue ? 'font-bold text-rose-400' : ''}>
                                    Due: {new Date(task.due_date).toLocaleDateString()}
                                  </span>
                                ) : (
                                  'No deadline'
                                )}
                              </span>
                              <span>Squad: {task.teams?.name || 'Assigned Squad'}</span>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  )}
                </div>

                {/* Right Sidebar: Teammates & Upcoming Deadlines */}
                <div className="space-y-6 lg:col-span-4">
                  {/* Squad Members */}
                  <div className="rounded-3xl border border-[#2b2735] bg-[#111015] p-5">
                    <h3 className="text-sm font-bold text-white flex items-center gap-2">
                      <Users size={16} className="text-[#7727ff]" />
                      Squad Teammates ({teammates.length + 1})
                    </h3>
                    <p className="mt-0.5 text-xs text-[#8e8a99]">
                      Team {internProfile.teams?.name || 'Unassigned'}
                    </p>

                    <div className="mt-4 space-y-3">
                      <div className="flex items-center gap-3 rounded-xl bg-[#18161f] p-2.5">
                        <div className="flex size-8 items-center justify-center rounded-lg bg-[#6417ed] text-xs font-bold text-white">
                          {internProfile.full_name?.charAt(0) || 'U'}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-xs font-bold text-white truncate">{internProfile.full_name} (You)</p>
                          <span className="text-[10px] text-green-400">● Online</span>
                        </div>
                      </div>

                      {teammates.map((peer) => (
                        <div key={peer.user_id || peer.id} className="flex items-center gap-3 rounded-xl bg-[#14121a] p-2.5">
                          <div className="flex size-8 items-center justify-center rounded-lg bg-[#272332] text-xs font-bold text-[#c8b4ff]">
                            {peer.full_name?.charAt(0) || 'P'}
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="text-xs font-bold text-[#d0ccda] truncate">{peer.full_name}</p>
                            <span className="text-[10px] text-[#8e8a99] capitalize">{peer.status || 'Active'}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Upcoming Deadlines */}
                  <div className="rounded-3xl border border-[#2b2735] bg-[#111015] p-5">
                    <h3 className="text-sm font-bold text-white flex items-center gap-2">
                      <Calendar size={16} className="text-amber-400" />
                      Cohort Milestones
                    </h3>
                    <div className="mt-4 space-y-3">
                      {deadlines.length === 0 ? (
                        <p className="text-xs text-[#8e8a99]">No major deadlines posted.</p>
                      ) : (
                        deadlines.map((dl) => (
                          <div key={dl.id} className="rounded-xl border border-[#231f2d] bg-[#16141c] p-3">
                            <p className="text-xs font-bold text-white">{dl.title}</p>
                            <p className="mt-1 text-[11px] text-amber-400">
                              {new Date(dl.due_date).toLocaleDateString('en-US', {
                                month: 'short',
                                day: 'numeric',
                              })}
                            </p>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 2: DAILY ASYNC STANDUPS */}
            {portalTab === 'standups' && (
              <div className="space-y-6">
                {/* Today's Check-in Card */}
                <div className="rounded-3xl border border-[#2e2a3b] bg-gradient-to-br from-[#121019] to-[#0c0a11] p-6 sm:p-7 shadow-xl">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 pb-4 border-b border-[#211d2c]">
                    <div>
                      <h2 className="text-base font-bold text-white flex items-center gap-2">
                        <MessageSquare size={17} className="text-[#a77aff]" /> Daily Async Standup Check-in
                      </h2>
                      <p className="text-xs text-[#a0a0b0]">
                        Log your progress for {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
                      </p>
                    </div>

                    {todayStandup ? (
                      <span className="flex items-center gap-1.5 rounded-full border border-green-500/40 bg-green-500/10 px-3 py-1 text-xs font-bold text-green-400">
                        <CheckCircle2 size={13} /> Standup Submitted
                      </span>
                    ) : (
                      <span className="flex items-center gap-1.5 rounded-full border border-amber-500/40 bg-amber-500/10 px-3 py-1 text-xs font-bold text-amber-400 animate-pulse">
                        <Clock size={13} /> Check-in Pending
                      </span>
                    )}
                  </div>

                  {todayStandup ? (
                    <div className="mt-5 space-y-4">
                      <div className="rounded-2xl border border-[#2b2735] bg-[#15131c] p-4 text-xs space-y-2">
                        <p className="text-[#8e8a99] font-semibold">What was shipped yesterday:</p>
                        <p className="text-white whitespace-pre-wrap">{todayStandup.yesterday || todayStandup.yesterday_work}</p>

                        <p className="text-[#8e8a99] font-semibold pt-2">Today's sprint focus:</p>
                        <p className="text-white whitespace-pre-wrap">{todayStandup.today || todayStandup.today_plan}</p>

                        {todayStandup.blockers && (
                          <>
                            <p className="text-rose-400 font-semibold pt-2 flex items-center gap-1">
                              <AlertTriangle size={13} /> Blockers reported:
                            </p>
                            <p className="text-rose-300 whitespace-pre-wrap">{todayStandup.blockers}</p>
                          </>
                        )}
                      </div>

                      {todayStandup.leader_feedback && (
                        <div className="rounded-2xl border border-[#7727ff]/30 bg-[#7727ff]/10 p-4 text-xs">
                          <p className="font-bold text-[#c8b4ff] flex items-center gap-1.5">
                            <Sparkles size={13} /> Squad Lead Response:
                          </p>
                          <p className="mt-1 text-[#e1d7ff] leading-relaxed">
                            {todayStandup.leader_feedback}
                          </p>
                        </div>
                      )}
                    </div>
                  ) : (
                    <form onSubmit={handleStandupSubmit} className="mt-5 space-y-4 text-xs">
                      <div>
                        <label className="block text-[#a0a0b0] font-semibold mb-1">
                          1. What did you accomplish yesterday? *
                        </label>
                        <textarea
                          required
                          rows={2}
                          value={standupYesterday}
                          onChange={(e) => setStandupYesterday(e.target.value)}
                          placeholder="e.g. Completed Supabase database schema and RLS policies for CRM tables..."
                          className="w-full rounded-xl border border-[#2b2735] bg-[#16141c] p-3 text-white placeholder-[#606070] focus:border-[#7727ff] focus:outline-none"
                        />
                      </div>

                      <div>
                        <label className="block text-[#a0a0b0] font-semibold mb-1">
                          2. What is your primary objective today? *
                        </label>
                        <textarea
                          required
                          rows={2}
                          value={standupToday}
                          onChange={(e) => setStandupToday(e.target.value)}
                          placeholder="e.g. Integrate Next.js API routes with automated payslip calculations..."
                          className="w-full rounded-xl border border-[#2b2735] bg-[#16141c] p-3 text-white placeholder-[#606070] focus:border-[#7727ff] focus:outline-none"
                        />
                      </div>

                      <div>
                        <label className="block text-[#a0a0b0] font-semibold mb-1 flex items-center gap-1">
                          <span>3. Are you facing any blockers?</span>
                          <span className="text-[10px] text-[#808095]">(Optional - alert squad lead)</span>
                        </label>
                        <textarea
                          rows={2}
                          value={standupBlockers}
                          onChange={(e) => setStandupBlockers(e.target.value)}
                          placeholder="e.g. Need AWS IAM credentials or review on PR #42..."
                          className="w-full rounded-xl border border-[#2b2735] bg-[#16141c] p-3 text-white placeholder-[#606070] focus:border-[#7727ff] focus:outline-none"
                        />
                      </div>

                      <div className="flex justify-end pt-2">
                        <button
                          type="submit"
                          disabled={standupSubmitting}
                          className="flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-[#7727ff] to-[#6417ed] px-5 py-2.5 text-xs font-bold text-white shadow-lg shadow-purple-500/20 hover:brightness-110 disabled:opacity-50"
                        >
                          <Send size={13} />
                          {standupSubmitting ? 'Submitting...' : 'Submit Daily Standup'}
                        </button>
                      </div>
                    </form>
                  )}
                </div>

                {/* Standup History */}
                <div className="rounded-3xl border border-[#2b2735] bg-[#111015] p-6 space-y-4">
                  <h3 className="text-sm font-bold text-white">Standup History ({standups.length})</h3>
                  {standups.length === 0 ? (
                    <p className="text-xs text-[#8e8a99]">No previous standup submissions recorded.</p>
                  ) : (
                    <div className="space-y-3">
                      {standups.map((s) => (
                        <div key={s.id} className="rounded-xl border border-[#211d2c] bg-[#16141c] p-4 text-xs space-y-2">
                          <div className="flex justify-between items-center text-[11px] text-[#8e8a99] border-b border-[#211d2c] pb-2">
                            <span className="font-semibold text-white">{s.standup_date}</span>
                            {s.blockers ? (
                              <span className="text-rose-400 font-bold flex items-center gap-1">
                                <AlertTriangle size={11} /> Had Blocker
                              </span>
                            ) : (
                              <span className="text-green-400 font-semibold">✓ Clear Day</span>
                            )}
                          </div>
                          <p className="text-[#a0a0b0]"><strong className="text-white">Did:</strong> {s.yesterday || s.yesterday_work}</p>
                          <p className="text-[#a0a0b0]"><strong className="text-white">Plan:</strong> {s.today || s.today_plan}</p>
                          {s.leader_feedback && (
                            <p className="text-[#c8b4ff] bg-[#7727ff]/10 p-2 rounded-lg">
                              <strong>Lead Feedback:</strong> {s.leader_feedback}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* TAB 3: LEAVES & ATTENDANCE */}
            {portalTab === 'leaves' && (
              <div className="space-y-6">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <div>
                    <h2 className="text-lg font-bold text-white flex items-center gap-2">
                      <CalendarRange size={18} className="text-[#7727ff]" /> Leaves & Attendance Management
                    </h2>
                    <p className="text-xs text-[#a0a0b0]">
                      Submit leave requests, view approvals, and review salary deduction impact
                    </p>
                  </div>
                  <button
                    onClick={() => setIsLeaveModalOpen(true)}
                    className="flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-[#7727ff] to-[#6417ed] px-4 py-2 text-xs font-bold text-white hover:brightness-110 shadow-lg shadow-purple-500/20"
                  >
                    <Plus size={14} /> Request Leave
                  </button>
                </div>

                {/* Leave Policy Notice */}
                <div className="rounded-2xl border border-amber-500/30 bg-amber-500/10 p-4 text-xs text-[#d0ccda] space-y-1">
                  <p className="font-bold text-amber-300 flex items-center gap-1.5">
                    <AlertTriangle size={14} /> Internship Leave & Stipend Policy:
                  </p>
                  <p className="text-[11px] leading-relaxed">
                    Casual, exam, and approved medical leaves within allowance do not incur stipend deductions.
                    Approved <strong>unpaid leaves</strong> are pro-rated and automatically adjusted on your monthly payslip.
                  </p>
                </div>

                {/* Leaves Table */}
                <div className="rounded-3xl border border-[#2b2735] bg-[#111015] p-5 space-y-4">
                  <h3 className="text-sm font-bold text-white">Leave Requests Register ({leaves.length})</h3>
                  {leaves.length === 0 ? (
                    <div className="p-8 text-center text-xs text-[#8e8a99]">
                      No leave requests filed. Your attendance record is 100% active.
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs">
                        <thead className="border-b border-[#211d2c] text-[#8e8a99]">
                          <tr>
                            <th className="py-2.5 font-semibold">Type</th>
                            <th className="py-2.5 font-semibold">Date Range</th>
                            <th className="py-2.5 font-semibold">Days</th>
                            <th className="py-2.5 font-semibold">Reason</th>
                            <th className="py-2.5 font-semibold">Status</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-[#211d2c]">
                          {leaves.map((l) => {
                            const badge = leaveStatusBadges[l.status] || leaveStatusBadges.pending
                            return (
                              <tr key={l.id} className="text-[#a0a0b0]">
                                <td className="py-3 font-semibold capitalize text-white">{l.leave_type}</td>
                                <td className="py-3">{l.start_date} → {l.end_date}</td>
                                <td className="py-3 font-bold text-white">{l.days_count}d</td>
                                <td className="py-3 max-w-xs truncate">{l.reason}</td>
                                <td className="py-3">
                                  <span className={`inline-flex items-center rounded-md border px-2 py-0.5 text-[10px] font-bold capitalize ${badge.bg} ${badge.text}`}>
                                    {l.status}
                                  </span>
                                </td>
                              </tr>
                            )
                          })}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* TAB 4: STIPENDS & PAYSLIPS */}
            {portalTab === 'payslips' && (
              <div className="space-y-8">
                <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
                  <div className="rounded-3xl border border-[#2b2735] bg-[#111015] p-6 space-y-2">
                    <span className="text-xs font-semibold uppercase tracking-wider text-[#8e8a99]">Base Monthly Rate</span>
                    <p className="text-3xl font-black text-white">
                      ₹{salaryStructure ? Number(salaryStructure.base_amount).toLocaleString('en-IN') : '15,000'}
                    </p>
                    <p className="text-[11px] text-[#8e8a99] capitalize">
                      Cycle: {salaryStructure?.pay_cycle || 'monthly'} · Next cycle end of month
                    </p>
                  </div>

                  <div className="rounded-3xl border border-[#2b2735] bg-[#111015] p-6 space-y-2">
                    <span className="text-xs font-semibold uppercase tracking-wider text-green-400">Total Disbursed</span>
                    <p className="text-3xl font-black text-green-400">
                      ₹
                      {payslips
                        .filter((p) => p.status === 'paid')
                        .reduce((sum, p) => sum + Number(p.net), 0)
                        .toLocaleString('en-IN')}
                    </p>
                    <p className="text-[11px] text-[#8e8a99]">Direct bank remittance vouchers</p>
                  </div>

                  <div className="rounded-3xl border border-[#2b2735] bg-[#111015] p-6 space-y-2">
                    <span className="text-xs font-semibold uppercase tracking-wider text-purple-400">Issued Payslips</span>
                    <p className="text-3xl font-black text-purple-400">{payslips.length}</p>
                    <p className="text-[11px] text-[#8e8a99]">Vouchers verifiable on portal</p>
                  </div>
                </div>

                {/* Payslips Table */}
                <div className="rounded-3xl border border-[#2b2735] bg-[#111015] p-6 space-y-4">
                  <h3 className="text-sm font-bold text-white">Disbursement History & Vouchers</h3>
                  {payslips.length === 0 ? (
                    <div className="p-8 text-center text-xs text-[#8e8a99]">
                      No payslips issued yet. Your first voucher will generate at the conclusion of the monthly billing cycle.
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs">
                        <thead className="border-b border-[#211d2c] text-[#8e8a99]">
                          <tr>
                            <th className="py-3 font-semibold">Period Range</th>
                            <th className="py-3 font-semibold">Gross</th>
                            <th className="py-3 font-semibold">Deductions</th>
                            <th className="py-3 font-semibold">Net Payout</th>
                            <th className="py-3 font-semibold">Status</th>
                            <th className="py-3 font-semibold text-right">Action</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-[#211d2c]">
                          {payslips.map((ps) => {
                            const badge = payslipStatusBadges[ps.status] || payslipStatusBadges.pending
                            return (
                              <tr key={ps.id} className="transition-colors hover:bg-[#181622]">
                                <td className="py-3.5 font-medium text-white">
                                  {ps.period_start} → {ps.period_end}
                                </td>
                                <td className="py-3.5 text-[#d0ccda]">₹{Number(ps.gross).toLocaleString('en-IN')}</td>
                                <td className="py-3.5 text-rose-400">
                                  {Number(ps.deductions) > 0 ? `-₹${Number(ps.deductions).toLocaleString('en-IN')}` : '₹0'}
                                </td>
                                <td className="py-3.5 font-black text-sm text-emerald-400">₹{Number(ps.net).toLocaleString('en-IN')}</td>
                                <td className="py-3.5">
                                  <span className={`inline-flex items-center rounded-md border px-2 py-0.5 text-[10px] font-bold uppercase ${badge.bg} ${badge.text}`}>
                                    {ps.status}
                                  </span>
                                </td>
                                <td className="py-3.5 text-right">
                                  <button
                                    onClick={() => setSelectedPayslipForVoucher(ps)}
                                    className="inline-flex items-center gap-1.5 rounded-xl border border-[#342f40] bg-[#1a1724] px-3 py-1.5 text-xs font-semibold text-[#c8b4ff] hover:bg-[#6417ed] hover:text-white transition-all shadow-sm"
                                  >
                                    <Eye size={12} /> View Voucher
                                  </button>
                                </td>
                              </tr>
                            )
                          })}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* TAB 5: ACCREDITATION & CERTIFICATE */}
            {portalTab === 'credentials' && (
              <div className="space-y-6">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <div>
                    <h2 className="text-lg font-bold text-white flex items-center gap-2">
                      <Award size={18} className="text-[#7727ff]" /> Engineering Credentials & Verification
                    </h2>
                    <p className="text-xs text-[#a0a0b0]">
                      Official verifiable digital credentials issued upon milestone completion.
                    </p>
                  </div>
                </div>

                {certificates.length === 0 ? (
                  <div className="rounded-3xl border border-[#2b2735] bg-[#111015] p-12 text-center">
                    <Award size={48} className="mx-auto text-[#606070] mb-3 opacity-40" />
                    <h3 className="text-base font-bold text-white">Accreditation In Progress</h3>
                    <p className="mt-2 text-xs text-[#a0a0b0] max-w-md mx-auto leading-relaxed">
                      Complete 100% of your squad sprint tasks and final milestone evaluation to unlock your verified digital certificate and official letter of recommendation.
                    </p>
                  </div>
                ) : (
                  <div className="grid gap-6 sm:grid-cols-2">
                    {certificates.map((cert) => (
                      <div
                        key={cert.id}
                        className="rounded-3xl border-2 border-[#7727ff]/40 bg-gradient-to-br from-[#12101b] to-[#0c0a11] p-6 shadow-2xl relative overflow-hidden space-y-4"
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <span className="rounded-full border border-green-500/30 bg-green-500/10 px-2.5 py-0.5 text-[10px] font-bold text-green-400">
                              Issued & Verified
                            </span>
                            <h3 className="text-base font-extrabold text-white mt-2">{cert.title}</h3>
                            <p className="text-xs text-[#a77aff] font-semibold">{cert.track}</p>
                          </div>
                          <span className="rounded-xl border border-[#7727ff]/30 bg-[#7727ff]/15 px-2.5 py-1 text-xs font-black text-[#c8b4ff]">
                            {cert.grade}
                          </span>
                        </div>

                        <div className="border-t border-b border-[#211d2c] py-3 text-xs space-y-1 text-[#8e8a99]">
                          <p>Credential ID: <strong className="font-mono text-white">{cert.certificate_number}</strong></p>
                          <p>Issued: <strong className="text-white">{cert.issue_date}</strong></p>
                        </div>

                        <div className="flex items-center justify-between pt-2">
                          <Link
                            href={`/verify/${cert.verification_code}`}
                            className="inline-flex items-center gap-1.5 text-xs font-bold text-[#a77aff] hover:underline"
                          >
                            View Public Verification <ExternalLink size={12} />
                          </Link>

                          <Link
                            href={`/verify/${cert.verification_code}`}
                            className="rounded-xl bg-white px-3.5 py-1.5 text-xs font-bold text-black hover:bg-slate-200"
                          >
                            Print Certificate
                          </Link>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* TAB 6: PULL REQUESTS & CODE REVIEWS */}
            {portalTab === 'reviews' && (
              <div className="space-y-6">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <div>
                    <h2 className="text-lg font-bold text-white flex items-center gap-2">
                      <GitPullRequest size={18} className="text-[#7727ff]" /> Pull Requests & Code Reviews
                    </h2>
                    <p className="text-xs text-[#a0a0b0]">
                      Track code quality, peer reviews, architecture feedback, and rubric scores
                    </p>
                  </div>
                  <button
                    onClick={() => setIsPrModalOpen(true)}
                    className="flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-[#7727ff] to-[#6417ed] px-4 py-2 text-xs font-bold text-white hover:brightness-110 shadow-lg shadow-purple-500/20"
                  >
                    <Plus size={14} /> Submit PR for Review
                  </button>
                </div>

                {codeReviews.length === 0 ? (
                  <div className="rounded-3xl border border-[#2b2735] bg-[#111015] p-12 text-center">
                    <GitPullRequest size={44} className="mx-auto text-[#606070] mb-3 opacity-40" />
                    <h3 className="text-sm font-bold text-white">No Pull Requests Logged Yet</h3>
                    <p className="mt-1 text-xs text-[#a0a0b0]">
                      Submit your GitHub PR link to receive structured architectural feedback from your squad lead.
                    </p>
                  </div>
                ) : (
                  <div className="grid gap-4 sm:grid-cols-2">
                    {codeReviews.map((rev) => (
                      <div key={rev.id} className="rounded-2xl border border-[#2a2a35] bg-[#111015] p-5 space-y-4">
                        <div className="flex items-start justify-between">
                          <div>
                            <a
                              href={rev.pr_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-sm font-bold text-white hover:text-[#a77aff] flex items-center gap-1.5"
                            >
                              <span>{rev.pr_title}</span>
                              <ExternalLink size={12} className="text-[#808095]" />
                            </a>
                            <p className="text-xs text-[#a0a0b0] mt-0.5">Reviewed by {rev.reviewer_name}</p>
                          </div>
                          <span
                            className={`rounded-full border px-2.5 py-0.5 text-[10px] font-bold uppercase ${
                              rev.status === 'merged'
                                ? 'border-purple-500/30 bg-purple-500/10 text-purple-400'
                                : rev.status === 'approved'
                                ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-400'
                                : 'border-rose-500/30 bg-rose-500/10 text-rose-400'
                            }`}
                          >
                            {rev.status.replace('_', ' ')}
                          </span>
                        </div>

                        {/* 4 Pillars Score */}
                        <div className="grid grid-cols-4 gap-2 rounded-xl border border-[#2a2a35] bg-[#181622] p-2.5 text-center text-[11px]">
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
                            <span className="text-[10px] text-[#808095] block">Tests</span>
                            <span className="font-bold text-amber-300">{rev.tests_score} / 5</span>
                          </div>
                        </div>

                        <div className="rounded-xl border border-[#2a2a35] bg-[#16141e] p-3 text-xs text-[#d0ccda] italic leading-relaxed">
                          "{rev.feedback}"
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* TAB 7: TECH ACADEMY & ROADMAPS */}
            {portalTab === 'academy' && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-lg font-bold text-white flex items-center gap-2">
                    <BookOpen size={18} className="text-[#7727ff]" /> Engineering Academy & Curated Roadmaps
                  </h2>
                  <p className="text-xs text-[#a0a0b0]">
                    Hands-on modules and self-paced technical challenges designed by DS Softwares
                  </p>
                </div>

                <div className="grid gap-5 sm:grid-cols-2">
                  {learningModules.map((mod) => {
                    const prog = learningProgress.find((p) => p.module_id === mod.id)
                    const pct = prog ? prog.progress_percent : 0
                    const isDone = pct >= 100

                    return (
                      <div key={mod.id} className="rounded-2xl border border-[#2a2a35] bg-[#111015] p-5 space-y-4">
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

                        {/* Progress Bar */}
                        <div>
                          <div className="flex justify-between text-xs mb-1">
                            <span className="text-[#808095]">Module Mastery</span>
                            <span className="font-bold text-purple-300">{pct}% Complete</span>
                          </div>
                          <div className="w-full bg-[#181622] h-2 rounded-full overflow-hidden">
                            <div
                              className="bg-gradient-to-r from-purple-500 to-emerald-400 h-full rounded-full transition-all duration-300"
                              style={{ width: `${pct}%` }}
                            />
                          </div>
                        </div>

                        {/* Lessons List */}
                        <div className="space-y-1.5 rounded-xl border border-[#2a2a35] bg-[#181622] p-3 text-xs">
                          {(mod.lessons || []).map((l, i) => (
                            <div key={l.id || i} className="flex items-center justify-between py-1 px-2 rounded-lg bg-[#111015]">
                              <span className="text-[#d0ccda] flex items-center gap-2">
                                <span className="font-mono text-[10px] text-[#808095]">0{i + 1}.</span>
                                <span>{l.title}</span>
                              </span>
                              <span className="text-[10px] text-[#808095] font-mono">{l.duration}</span>
                            </div>
                          ))}
                        </div>

                        <div className="flex justify-end pt-2 border-t border-[#2a2a35]">
                          <button
                            onClick={() => handleToggleLesson(mod.id, pct)}
                            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                              isDone
                                ? 'bg-emerald-500/15 border border-emerald-500/30 text-emerald-400'
                                : 'bg-[#6417ed] text-white hover:bg-[#7727ff]'
                            }`}
                          >
                            {isDone ? '✓ Completed' : 'Mark as In Progress (50%)'}
                          </button>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}

            {/* TAB 8: 1:1 MENTORSHIP & RETROSPECTIVES */}
            {portalTab === 'mentorship' && (
              <div className="space-y-6">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <div>
                    <h2 className="text-lg font-bold text-white flex items-center gap-2">
                      <Users size={18} className="text-[#7727ff]" /> 1:1 Mentorship & Office Hours
                    </h2>
                    <p className="text-xs text-[#a0a0b0]">
                      Schedule dedicated 1:1 sessions with Deepak Sharma and senior engineering architects
                    </p>
                  </div>
                  <button
                    onClick={() => setIsMentorshipModalOpen(true)}
                    className="flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-4 py-2 text-xs font-bold text-white hover:brightness-110 shadow-lg shadow-blue-500/20"
                  >
                    <Plus size={14} /> Book Office Hours
                  </button>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  {mentorshipSessions.map((sess) => (
                    <div key={sess.id} className="rounded-2xl border border-[#2a2a35] bg-[#111015] p-5 space-y-4">
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="text-base font-bold text-white">{sess.topic}</h3>
                          <p className="text-xs text-[#a0a0b0] mt-0.5">Mentor: {sess.mentor_name}</p>
                        </div>
                        <span className="rounded-full border border-blue-500/30 bg-blue-500/10 px-2.5 py-0.5 text-[10px] font-bold uppercase text-blue-400">
                          {sess.status}
                        </span>
                      </div>

                      <div className="flex items-center justify-between text-xs text-[#a0a0b0] border-t border-[#2a2a35] pt-3">
                        <span className="flex items-center gap-1.5">
                          <Clock size={13} className="text-blue-400" />
                          {new Date(sess.scheduled_at).toLocaleDateString()} at{' '}
                          {new Date(sess.scheduled_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                        {sess.meeting_url && (
                          <a
                            href={sess.meeting_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-blue-400 hover:text-blue-300 font-bold"
                          >
                            <Video size={13} />
                            <span>Join Video Call</span>
                            <ExternalLink size={11} />
                          </a>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* TAB 9: SKILL MATRIX & PPO PIPELINE */}
            {portalTab === 'evaluations' && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-lg font-bold text-white flex items-center gap-2">
                    <Target size={18} className="text-[#7727ff]" /> Technical Competency Matrix & PPO Status
                  </h2>
                  <p className="text-xs text-[#a0a0b0]">
                    Official milestone evaluations across 6 engineering pillars for Full-Time Junior Software Engineer conversion
                  </p>
                </div>

                {milestoneReviews.length === 0 ? (
                  <div className="rounded-3xl border border-[#2b2735] bg-[#111015] p-12 text-center">
                    <Target size={44} className="mx-auto text-[#606070] mb-3 opacity-40" />
                    <h3 className="text-sm font-bold text-white">First Milestone Evaluation Upcoming</h3>
                    <p className="mt-1 text-xs text-[#a0a0b0]">
                      Your 30-day technical check-in will assess architecture, problem-solving, and shipping velocity.
                    </p>
                  </div>
                ) : (
                  <div className="grid gap-5 sm:grid-cols-2">
                    {milestoneReviews.map((m) => {
                      const overallScore = (
                        (m.architecture + m.problem_solving + m.velocity + m.code_quality + m.ownership + m.communication) /
                        6
                      ).toFixed(1)

                      const pillars = [
                        { name: 'System Architecture', score: m.architecture },
                        { name: 'Problem Solving', score: m.problem_solving },
                        { name: 'Shipping Velocity', score: m.velocity },
                        { name: 'Code Quality', score: m.code_quality },
                        { name: 'Ownership & Initiative', score: m.ownership },
                        { name: 'Communication', score: m.communication },
                      ]

                      return (
                        <div key={m.id} className="rounded-2xl border border-[#2a2a35] bg-[#111015] p-5 space-y-4">
                          <div className="flex items-start justify-between">
                            <div>
                              <span className="rounded-full border border-purple-500/30 bg-purple-500/10 px-2.5 py-0.5 text-[10px] font-bold uppercase text-purple-300">
                                {m.milestone_type.replace('_', '-')} Review
                              </span>
                              <h3 className="text-base font-bold text-white mt-1.5">
                                Overall Index: {overallScore} / 10
                              </h3>
                              <p className="text-xs text-[#808095]">Evaluated by {m.reviewer_name}</p>
                            </div>
                            <span
                              className={`rounded-full border px-2.5 py-0.5 text-[10px] font-bold uppercase ${
                                m.ppo_recommendation === 'recommended'
                                  ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-400'
                                  : 'border-blue-500/30 bg-blue-500/10 text-blue-400'
                              }`}
                            >
                              PPO: {m.ppo_recommendation.replace('_', ' ')}
                            </span>
                          </div>

                          {/* Skill Bars */}
                          <div className="space-y-2 rounded-xl border border-[#2a2a35] bg-[#181622] p-3.5">
                            {pillars.map((p) => (
                              <div key={p.name} className="space-y-1">
                                <div className="flex justify-between text-[11px]">
                                  <span className="text-[#a0a0b0]">{p.name}</span>
                                  <span className="font-mono font-bold text-white">{p.score} / 10</span>
                                </div>
                                <div className="w-full bg-[#111015] h-1.5 rounded-full overflow-hidden">
                                  <div
                                    className="bg-gradient-to-r from-purple-500 to-emerald-400 h-full rounded-full"
                                    style={{ width: `${p.score * 10}%` }}
                                  />
                                </div>
                              </div>
                            ))}
                          </div>

                          <div className="rounded-xl border border-[#2a2a35] bg-[#16141e] p-3 text-xs text-[#d0ccda] italic leading-relaxed">
                            "{m.notes}"
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>
            )}

            {/* MODAL 1: REQUEST LEAVE */}
            {isLeaveModalOpen && (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
                <div className="w-full max-w-md rounded-3xl border border-[#302c3d] bg-[#111015] p-6 shadow-2xl space-y-4">
                  <div className="flex justify-between items-center pb-3 border-b border-[#211d2c]">
                    <h3 className="text-sm font-bold text-white flex items-center gap-2">
                      <CalendarRange size={16} className="text-[#a77aff]" /> Request Leave of Absence
                    </h3>
                    <button onClick={() => setIsLeaveModalOpen(false)} className="text-[#a0a0b0] hover:text-white">
                      <X size={16} />
                    </button>
                  </div>

                  <form onSubmit={handleLeaveSubmit} className="space-y-3 text-xs">
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[#a0a0b0] mb-1">Start Date *</label>
                        <input
                          type="date"
                          required
                          value={leaveStart}
                          onChange={(e) => setLeaveStart(e.target.value)}
                          className="w-full rounded-xl border border-[#2a2a35] bg-[#1a1722] p-2.5 text-white"
                        />
                      </div>
                      <div>
                        <label className="block text-[#a0a0b0] mb-1">End Date *</label>
                        <input
                          type="date"
                          required
                          value={leaveEnd}
                          onChange={(e) => setLeaveEnd(e.target.value)}
                          className="w-full rounded-xl border border-[#2a2a35] bg-[#1a1722] p-2.5 text-white"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[#a0a0b0] mb-1">Number of Days *</label>
                        <input
                          type="number"
                          min="1"
                          required
                          value={leaveDays}
                          onChange={(e) => setLeaveDays(Number(e.target.value))}
                          className="w-full rounded-xl border border-[#2a2a35] bg-[#1a1722] p-2.5 text-white"
                        />
                      </div>
                      <div>
                        <label className="block text-[#a0a0b0] mb-1">Leave Type *</label>
                        <select
                          value={leaveType}
                          onChange={(e) => setLeaveType(e.target.value as LeaveType)}
                          className="w-full rounded-xl border border-[#2a2a35] bg-[#1a1722] p-2.5 text-white"
                        >
                          <option value="casual">Casual Leave</option>
                          <option value="sick">Sick Leave</option>
                          <option value="exam">Exam / College Leave</option>
                          <option value="unpaid">Unpaid Leave</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-[#a0a0b0] mb-1">Reason for Absence *</label>
                      <textarea
                        required
                        rows={3}
                        value={leaveReason}
                        onChange={(e) => setLeaveReason(e.target.value)}
                        placeholder="Please provide details for squad planning..."
                        className="w-full rounded-xl border border-[#2a2a35] bg-[#1a1722] p-2.5 text-white"
                      />
                    </div>

                    <div className="flex justify-end gap-2 pt-2">
                      <button
                        type="button"
                        onClick={() => setIsLeaveModalOpen(false)}
                        className="rounded-xl border border-[#2a2a35] px-4 py-2 text-[#a0a0b0]"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={leaveSubmitting}
                        className="rounded-xl bg-[#6417ed] px-5 py-2 font-bold text-white hover:bg-[#7727ff]"
                      >
                        {leaveSubmitting ? 'Submitting...' : 'Submit Request'}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}

            {/* MODAL 2: DIGITAL PAYSLIP VOUCHER */}
            {selectedPayslipForVoucher && (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
                <div className="w-full max-w-lg rounded-3xl border border-[#3a3545] bg-[#111015] p-6 sm:p-8 shadow-2xl">
                  <div className="flex items-center justify-between pb-4 border-b border-[#22222d]">
                    <div className="flex items-center gap-2">
                      <span className="text-xl font-black">
                        <span className="text-[#7727ff]">DS</span>Softwares<span className="text-[#7727ff]">.</span>
                      </span>
                      <span className="rounded-md border border-[#7727ff]/40 bg-[#7727ff]/20 px-2 py-0.5 text-[10px] font-bold text-[#c8b4ff]">
                        Remittance Voucher
                      </span>
                    </div>
                    <button onClick={() => setSelectedPayslipForVoucher(null)} className="text-[#a0a0b0] hover:text-white">
                      <X size={18} />
                    </button>
                  </div>

                  <div className="mt-5 space-y-4 text-xs">
                    <div className="rounded-2xl border border-green-500/30 bg-green-500/10 p-4 text-center">
                      <CheckCircle2 size={32} className="mx-auto text-green-400 mb-2" />
                      <h4 className="text-sm font-bold text-green-300">Stipend Remittance Confirmed</h4>
                      <p className="text-[11px] text-[#a0a0b0] mt-0.5">
                        Billing Period: {selectedPayslipForVoucher.period_start} → {selectedPayslipForVoucher.period_end}
                      </p>
                    </div>

                    <div className="grid grid-cols-2 gap-3 rounded-xl border border-[#2a2a35] bg-[#181620] p-4 text-xs">
                      <div>
                        <span className="text-[#808095] block">Beneficiary:</span>
                        <span className="font-bold text-white text-sm">
                          {selectedPayslipForVoucher.interns?.full_name || internProfile.full_name}
                        </span>
                      </div>
                      <div>
                        <span className="text-[#808095] block">Payment Date:</span>
                        <span className="font-semibold text-white">
                          {selectedPayslipForVoucher.paid_at ? new Date(selectedPayslipForVoucher.paid_at).toLocaleDateString() : 'Pending'}
                        </span>
                      </div>
                    </div>

                    <div className="rounded-xl border border-[#2a2a35] overflow-hidden">
                      <div className="flex justify-between p-3 bg-[#181620] text-[#a0a0b0] border-b border-[#2a2a35]">
                        <span>Component Description</span>
                        <span>Amount (INR)</span>
                      </div>
                      <div className="divide-y divide-[#2a2a35]">
                        <div className="flex justify-between p-3 text-white">
                          <span>Base Internship Stipend</span>
                          <span>₹{Number(selectedPayslipForVoucher.gross).toLocaleString('en-IN')}</span>
                        </div>
                        <div className="flex justify-between p-3 text-rose-400">
                          <span>Adjustments / Leave Deductions</span>
                          <span>-₹{Number(selectedPayslipForVoucher.deductions).toLocaleString('en-IN')}</span>
                        </div>
                        <div className="flex justify-between p-3.5 bg-[#16141e] font-black text-sm text-emerald-400">
                          <span>Net Disbursed Payout</span>
                          <span>₹{Number(selectedPayslipForVoucher.net).toLocaleString('en-IN')}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="mt-6 flex justify-between items-center pt-4 border-t border-[#22222d]">
                    <span className="text-[10px] text-[#606070]">
                      DS Softwares Agency · Official Digital Payslip
                    </span>
                    <button
                      onClick={() => window.print()}
                      className="flex items-center gap-1.5 rounded-xl bg-white px-4 py-2 text-xs font-bold text-black hover:bg-slate-200"
                    >
                      <Printer size={13} /> Print / Save Voucher
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* MODAL 3: SUBMIT PULL REQUEST */}
            {isPrModalOpen && (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
                <div className="w-full max-w-md rounded-3xl border border-[#302c3d] bg-[#111015] p-6 shadow-2xl space-y-4">
                  <div className="flex justify-between items-center pb-3 border-b border-[#211d2c]">
                    <h3 className="text-sm font-bold text-white flex items-center gap-2">
                      <GitPullRequest size={16} className="text-[#a77aff]" /> Submit PR for Code Review
                    </h3>
                    <button onClick={() => setIsPrModalOpen(false)} className="text-[#a0a0b0] hover:text-white">
                      <X size={16} />
                    </button>
                  </div>

                  <form onSubmit={handlePrSubmit} className="space-y-3 text-xs">
                    <div>
                      <label className="block text-[#a0a0b0] mb-1">Pull Request Title *</label>
                      <input
                        type="text"
                        required
                        value={prTitle}
                        onChange={(e) => setPrTitle(e.target.value)}
                        placeholder="e.g. feat(auth): Add Supabase SSR OAuth flow"
                        className="w-full rounded-xl border border-[#2a2a35] bg-[#1a1722] p-2.5 text-white"
                      />
                    </div>

                    <div>
                      <label className="block text-[#a0a0b0] mb-1">GitHub PR URL *</label>
                      <input
                        type="url"
                        required
                        value={prUrl}
                        onChange={(e) => setPrUrl(e.target.value)}
                        className="w-full rounded-xl border border-[#2a2a35] bg-[#1a1722] p-2.5 text-white font-mono"
                      />
                    </div>

                    <div className="flex justify-end gap-2 pt-2">
                      <button
                        type="button"
                        onClick={() => setIsPrModalOpen(false)}
                        className="rounded-xl border border-[#2a2a35] px-4 py-2 text-[#a0a0b0]"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={prSubmitting}
                        className="rounded-xl bg-[#6417ed] px-5 py-2 font-bold text-white hover:bg-[#7727ff]"
                      >
                        {prSubmitting ? 'Submitting...' : 'Log PR for Review'}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}

            {/* MODAL 4: BOOK MENTORSHIP */}
            {isMentorshipModalOpen && (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
                <div className="w-full max-w-md rounded-3xl border border-[#302c3d] bg-[#111015] p-6 shadow-2xl space-y-4">
                  <div className="flex justify-between items-center pb-3 border-b border-[#211d2c]">
                    <h3 className="text-sm font-bold text-white flex items-center gap-2">
                      <Users size={16} className="text-blue-400" /> Book 1:1 Mentorship Office Hours
                    </h3>
                    <button onClick={() => setIsMentorshipModalOpen(false)} className="text-[#a0a0b0] hover:text-white">
                      <X size={16} />
                    </button>
                  </div>

                  <form onSubmit={handleMentorshipSubmit} className="space-y-3 text-xs">
                    <div>
                      <label className="block text-[#a0a0b0] mb-1">Discussion Topic *</label>
                      <input
                        type="text"
                        required
                        value={mentorTopic}
                        onChange={(e) => setMentorTopic(e.target.value)}
                        placeholder="e.g. Next.js Architecture guidance or PPO readiness"
                        className="w-full rounded-xl border border-[#2a2a35] bg-[#1a1722] p-2.5 text-white"
                      />
                    </div>

                    <div>
                      <label className="block text-[#a0a0b0] mb-1">Preferred Date & Time *</label>
                      <input
                        type="datetime-local"
                        required
                        value={mentorScheduledAt}
                        onChange={(e) => setMentorScheduledAt(e.target.value)}
                        className="w-full rounded-xl border border-[#2a2a35] bg-[#1a1722] p-2.5 text-white"
                      />
                    </div>

                    <div className="flex justify-end gap-2 pt-2">
                      <button
                        type="button"
                        onClick={() => setIsMentorshipModalOpen(false)}
                        className="rounded-xl border border-[#2a2a35] px-4 py-2 text-[#a0a0b0]"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={mentorSubmitting}
                        className="rounded-xl bg-blue-600 px-5 py-2 font-bold text-white hover:bg-blue-500"
                      >
                        {mentorSubmitting ? 'Booking...' : 'Confirm Office Hours'}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </main>
  )
}
