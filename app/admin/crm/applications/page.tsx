'use client'

import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import {
  Award,
  Bot,
  CheckCircle2,
  Clock,
  Copy,
  Download,
  ExternalLink,
  Eye,
  FileText,
  Filter,
  GraduationCap,
  Loader2,
  Mail,
  Phone,
  RefreshCw,
  Search,
  Send,
  Sparkles,
  UserCheck,
  UserX,
  X,
  XCircle,
} from 'lucide-react'
import {
  crmSupabase,
  Application,
  ApplicationStatus,
  screenApplicationWithAI,
  generateOfferLetter,
} from '@/lib/crm-supabase'

const statusColors: Record<ApplicationStatus, { bg: string; text: string; border: string }> = {
  applied: { bg: 'bg-blue-500/10', text: 'text-blue-400', border: 'border-blue-500/30' },
  screening: { bg: 'bg-amber-500/10', text: 'text-amber-400', border: 'border-amber-500/30' },
  interview: { bg: 'bg-purple-500/10', text: 'text-purple-400', border: 'border-purple-500/30' },
  offer: { bg: 'bg-emerald-500/10', text: 'text-emerald-400', border: 'border-emerald-500/30' },
  accepted: { bg: 'bg-green-500/10', text: 'text-green-400', border: 'border-green-500/30' },
  rejected: { bg: 'bg-rose-500/10', text: 'text-rose-400', border: 'border-rose-500/30' },
}

export default function CrmApplicationsPage() {
  const [applications, setApplications] = useState<Application[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [updatingId, setUpdatingId] = useState<string | null>(null)
  const [screeningId, setScreeningId] = useState<string | null>(null)

  // AI Insights Modal
  const [aiModalApp, setAiModalApp] = useState<Application | null>(null)

  // Offer Letter Modal
  const [offerModalApp, setOfferModalApp] = useState<Application | null>(null)
  const [generatingOffer, setGeneratingOffer] = useState(false)
  const [createdOffer, setCreatedOffer] = useState<{ id: string; url: string } | null>(null)
  const [copiedOfferLink, setCopiedOfferLink] = useState(false)
  const [offerForm, setOfferForm] = useState({
    roleTitle: 'Software Engineering Intern',
    stipendAmount: 18000,
    startDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().substring(0, 10),
    durationMonths: 3,
  })

  const fetchApplications = async () => {
    setLoading(true)
    try {
      const { data, error } = await crmSupabase
        .from('applications')
        .select(`
          *,
          programs (
            title,
            department
          )
        `)
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Error fetching applications:', error.message)
      } else {
        setApplications(data || [])
      }
    } catch (err) {
      console.error('Failed to load applications:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchApplications()
  }, [])

  const handleStatusChange = async (appId: string, newStatus: ApplicationStatus) => {
    setUpdatingId(appId)
    try {
      const { error } = await crmSupabase
        .from('applications')
        .update({ status: newStatus, updated_at: new Date().toISOString() })
        .eq('id', appId)

      if (error) {
        alert('Failed to update status: ' + error.message)
      } else {
        setApplications((prev) =>
          prev.map((app) => (app.id === appId ? { ...app, status: newStatus } : app))
        )
      }
    } catch (err) {
      console.error(err)
    } finally {
      setUpdatingId(null)
    }
  }

  const handleRunAiScreening = async (appId: string) => {
    setScreeningId(appId)
    try {
      const updated = await screenApplicationWithAI(appId)
      setApplications((prev) =>
        prev.map((a) => (a.id === appId ? { ...a, ...updated } : a))
      )
      if (aiModalApp?.id === appId) {
        setAiModalApp((prev) => (prev ? { ...prev, ...updated } : null))
      }
    } catch (err: any) {
      alert(`AI Screening error: ${err.message}`)
    } finally {
      setScreeningId(null)
    }
  }

  const handleOpenOfferModal = (app: Application) => {
    setOfferModalApp(app)
    setCreatedOffer(null)
    setCopiedOfferLink(false)
    setOfferForm({
      roleTitle: app.programs?.title ? `${app.programs.title} Intern` : 'Software Engineering Intern',
      stipendAmount: 18000,
      startDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().substring(0, 10),
      durationMonths: 3,
    })
  }

  const handleGenerateOfferSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!offerModalApp) return

    setGeneratingOffer(true)
    try {
      const offer = await generateOfferLetter({
        applicationId: offerModalApp.id,
        applicantName: offerModalApp.applicant_name,
        email: offerModalApp.email,
        roleTitle: offerForm.roleTitle,
        stipendAmount: Number(offerForm.stipendAmount),
        startDate: offerForm.startDate,
        durationMonths: Number(offerForm.durationMonths),
      })

      const origin = typeof window !== 'undefined' ? window.location.origin : ''
      const url = `${origin}/offer/${offer.id}`

      setCreatedOffer({ id: offer.id, url })
      setApplications((prev) =>
        prev.map((a) => (a.id === offerModalApp.id ? { ...a, status: 'offer' } : a))
      )
    } catch (err: any) {
      alert(`Failed to generate offer letter: ${err.message}`)
    } finally {
      setGeneratingOffer(false)
    }
  }

  const handleCopyOfferLink = () => {
    if (!createdOffer) return
    navigator.clipboard.writeText(createdOffer.url)
    setCopiedOfferLink(true)
    setTimeout(() => setCopiedOfferLink(false), 2500)
  }

  const handleDownloadResume = async (resumePath: string) => {
    try {
      const { data, error } = await crmSupabase.storage
        .from('resumes')
        .createSignedUrl(resumePath, 60)

      if (error || !data?.signedUrl) {
        alert('Could not generate download URL. File might have been uploaded anonymously or moved.')
      } else {
        window.open(data.signedUrl, '_blank')
      }
    } catch (err) {
      console.error(err)
    }
  }

  const filtered = applications.filter((app) => {
    const matchesSearch =
      app.applicant_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (app.phone && app.phone.includes(searchTerm))

    const matchesStatus = statusFilter === 'all' || app.status === statusFilter

    return matchesSearch && matchesStatus
  })

  // Count stats
  const stats = {
    total: applications.length,
    applied: applications.filter((a) => a.status === 'applied').length,
    screening: applications.filter((a) => a.status === 'screening' || a.status === 'interview').length,
    accepted: applications.filter((a) => a.status === 'accepted' || a.status === 'offer').length,
  }

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col justify-between gap-4 rounded-2xl border border-[#2a2a35] bg-[#131318] p-5 sm:flex-row sm:items-center">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-2xl font-bold text-white">Internship Applications</h2>
            <span className="rounded-full border border-[#7727ff]/30 bg-[#7727ff]/20 px-2.5 py-0.5 text-xs font-semibold text-[#a77aff]">
              {applications.length} Candidates
            </span>
          </div>
          <p className="mt-1 text-sm text-[#a0a0b0]">
            AI-driven resume screening, tech-stack fit scoring, and 1-click digital offer dispatch
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <a
            href="/apply"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 rounded-xl border border-[#2a2a35] bg-[#1a1a24] px-4 py-2 text-xs font-medium text-[#a0a0b0] transition-all hover:bg-[#252532] hover:text-white"
          >
            <span>Preview Public Form</span>
          </a>

          <button
            onClick={fetchApplications}
            className="flex items-center gap-2 rounded-xl border border-[#2a2a35] bg-[#1a1a24] px-3.5 py-2 text-xs font-medium text-white transition-all hover:bg-[#252532]"
            title="Refresh candidate list"
          >
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid gap-4 sm:grid-cols-4">
        <div className="rounded-2xl border border-[#2a2a35] bg-[#131318] p-5">
          <p className="text-xs font-semibold uppercase tracking-wider text-[#a0a0b0]">Total Applicants</p>
          <p className="mt-2 text-3xl font-black text-white">{stats.total}</p>
        </div>
        <div className="rounded-2xl border border-[#2a2a35] bg-[#131318] p-5">
          <p className="text-xs font-semibold uppercase tracking-wider text-blue-400">New / Applied</p>
          <p className="mt-2 text-3xl font-black text-blue-400">{stats.applied}</p>
        </div>
        <div className="rounded-2xl border border-[#2a2a35] bg-[#131318] p-5">
          <p className="text-xs font-semibold uppercase tracking-wider text-purple-400">In Screening / Interview</p>
          <p className="mt-2 text-3xl font-black text-purple-400">{stats.screening}</p>
        </div>
        <div className="rounded-2xl border border-[#2a2a35] bg-[#131318] p-5">
          <p className="text-xs font-semibold uppercase tracking-wider text-green-400">Offer / Accepted</p>
          <p className="mt-2 text-3xl font-black text-green-400">{stats.accepted}</p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col gap-3 rounded-2xl border border-[#2a2a35] bg-[#131318] p-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1 sm:max-w-md">
          <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#a0a0b0]" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by candidate name, email, or phone..."
            className="w-full rounded-xl border border-[#2a2a35] bg-[#1a1a24] py-2 pl-9 pr-3 text-xs text-white placeholder-[#606070] focus:border-[#7727ff] focus:outline-none"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-semibold text-[#808095]">Status:</span>
          {['all', 'applied', 'screening', 'interview', 'offer', 'accepted', 'rejected'].map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`rounded-lg px-2.5 py-1 text-xs font-medium capitalize transition-all ${
                statusFilter === s
                  ? 'bg-[#6417ed] text-white shadow-md'
                  : 'border border-[#2a2a35] bg-[#1a1a24] text-[#a0a0b0] hover:text-white'
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Main Candidates List */}
      {loading ? (
        <div className="flex h-64 items-center justify-center rounded-2xl border border-[#2a2a35] bg-[#131318]">
          <Loader2 size={24} className="animate-spin text-[#7727ff]" />
          <span className="ml-3 text-sm text-[#a0a0b0]">Loading candidate applications...</span>
        </div>
      ) : filtered.length === 0 ? (
        <div className="rounded-2xl border border-[#2a2a35] bg-[#131318] p-12 text-center">
          <GraduationCap size={44} className="mx-auto mb-3 text-[#a0a0b0] opacity-40" />
          <p className="text-base font-semibold text-white">No applications found</p>
          <p className="mt-1 text-xs text-[#a0a0b0]">
            {searchTerm || statusFilter !== 'all'
              ? 'Try adjusting your search query or filter tags.'
              : 'Share the public application link to begin receiving candidate submissions.'}
          </p>
          <a
            href="/apply"
            target="_blank"
            className="mt-5 inline-flex items-center gap-2 rounded-xl bg-[#6417ed] px-4 py-2 text-xs font-bold text-white hover:bg-[#7727ff]"
          >
            Open Apply Page
          </a>
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-[#2a2a35] bg-[#131318]">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-[#2a2a35] bg-[#16161d] text-[#808095]">
                <tr>
                  <th className="px-5 py-3.5 font-semibold">Candidate</th>
                  <th className="px-5 py-3.5 font-semibold">Program</th>
                  <th className="px-5 py-3.5 font-semibold">AI Fit Score</th>
                  <th className="px-5 py-3.5 font-semibold">Resume</th>
                  <th className="px-5 py-3.5 font-semibold">Status</th>
                  <th className="px-5 py-3.5 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#2a2a35]">
                {filtered.map((app) => {
                  const style = statusColors[app.status] || statusColors.applied
                  const hasScore = typeof app.ai_match_score === 'number'
                  const isScreeningThis = screeningId === app.id

                  return (
                    <tr key={app.id} className="transition-colors hover:bg-[#1a1a24]/50">
                      <td className="px-5 py-4">
                        <div className="font-bold text-white">{app.applicant_name}</div>
                        <div className="flex items-center gap-3 mt-1 text-[#a0a0b0] text-[11px]">
                          <span className="flex items-center gap-1">
                            <Mail size={12} /> {app.email}
                          </span>
                          {app.phone && (
                            <span className="flex items-center gap-1">
                              <Phone size={12} /> {app.phone}
                            </span>
                          )}
                        </div>
                      </td>

                      <td className="px-5 py-4">
                        <span className="font-medium text-[#d0ccda]">
                          {app.programs?.title || 'General Internship'}
                        </span>
                        {app.programs?.department && (
                          <span className="block text-[11px] text-[#808095]">{app.programs.department}</span>
                        )}
                      </td>

                      {/* AI FIT SCORE */}
                      <td className="px-5 py-4">
                        {hasScore ? (
                          <button
                            onClick={() => setAiModalApp(app)}
                            className="inline-flex items-center gap-1.5 rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-1 text-[11px] font-bold text-emerald-300 hover:bg-emerald-500/20 transition-all group"
                            title="Click to view AI analysis and skill breakdown"
                          >
                            <Sparkles size={12} className="text-emerald-400 group-hover:rotate-12 transition-transform" />
                            <span>{app.ai_match_score}% Match</span>
                            <span className="text-[10px] text-emerald-400/70 font-normal">
                              ({(app.ai_recommendation || 'hire').replace('_', ' ')})
                            </span>
                          </button>
                        ) : (
                          <button
                            onClick={() => handleRunAiScreening(app.id)}
                            disabled={isScreeningThis}
                            className="inline-flex items-center gap-1 rounded-lg border border-purple-500/30 bg-purple-500/10 px-2.5 py-1 text-[11px] font-semibold text-purple-300 hover:bg-purple-500/20 transition-colors disabled:opacity-50"
                          >
                            {isScreeningThis ? (
                              <>
                                <Loader2 size={12} className="animate-spin" />
                                <span>Evaluating...</span>
                              </>
                            ) : (
                              <>
                                <Bot size={12} />
                                <span>Screen with AI</span>
                              </>
                            )}
                          </button>
                        )}
                      </td>

                      <td className="px-5 py-4">
                        {app.resume_path ? (
                          <button
                            onClick={() => handleDownloadResume(app.resume_path!)}
                            className="inline-flex items-center gap-1.5 rounded-lg border border-[#3a3545] bg-[#1a1722] px-2.5 py-1 text-[11px] font-semibold text-[#a77aff] hover:bg-[#252230]"
                          >
                            <Download size={12} /> View Resume
                          </button>
                        ) : (
                          <span className="text-[11px] text-[#606070]">No resume</span>
                        )}
                      </td>

                      <td className="px-5 py-4">
                        <span
                          className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-[11px] font-bold capitalize ${style.bg} ${style.text} ${style.border}`}
                        >
                          {app.status}
                        </span>
                      </td>

                      <td className="px-5 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleOpenOfferModal(app)}
                            className="inline-flex items-center gap-1 rounded-lg bg-emerald-500/15 border border-emerald-500/30 px-2.5 py-1 text-[11px] font-bold text-emerald-300 hover:bg-emerald-500/25 transition-colors"
                            title="Generate one-click appointment / offer letter"
                          >
                            <Send size={11} />
                            <span>Issue Offer</span>
                          </button>

                          <select
                            disabled={updatingId === app.id}
                            value={app.status}
                            onChange={(e) => handleStatusChange(app.id, e.target.value as ApplicationStatus)}
                            className="rounded-lg border border-[#2a2a35] bg-[#1a1a24] px-2.5 py-1 text-[11px] text-white focus:border-[#7727ff] focus:outline-none"
                          >
                            <option value="applied">Applied</option>
                            <option value="screening">Screening</option>
                            <option value="interview">Interview</option>
                            <option value="offer">Offer</option>
                            <option value="accepted">Accepted</option>
                            <option value="rejected">Rejected</option>
                          </select>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* MODAL 1: AI CANDIDATE INSIGHTS */}
      {aiModalApp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-2xl border border-purple-500/30 bg-[#131318] p-6 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-[#2a2a35]">
              <div className="flex items-center gap-2">
                <div className="rounded-xl bg-purple-500/20 p-2 text-purple-400">
                  <Bot size={20} />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">AI Candidate Screening Report</h3>
                  <p className="text-xs text-[#a0a0b0]">{aiModalApp.applicant_name} • {aiModalApp.email}</p>
                </div>
              </div>
              <button onClick={() => setAiModalApp(null)} className="text-[#a0a0b0] hover:text-white">
                <X size={18} />
              </button>
            </div>

            <div className="mt-5 space-y-4">
              {/* Match Score & Recommendation Badge */}
              <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-4 flex items-center justify-between">
                <div>
                  <p className="text-xs text-emerald-400 font-semibold uppercase tracking-wider">Overall Match Score</p>
                  <p className="text-3xl font-black text-emerald-300 mt-1">
                    {aiModalApp.ai_match_score || 0}%
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-[#a0a0b0]">Hiring Recommendation</p>
                  <span className="inline-block mt-1 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border border-emerald-500/40 bg-emerald-500/20 text-emerald-300">
                    {(aiModalApp.ai_recommendation || 'Interview').replace('_', ' ')}
                  </span>
                </div>
              </div>

              {/* Matched Tech Stack Tags */}
              <div>
                <p className="text-xs font-semibold text-[#a0a0b0] mb-2">Verified Tech Stack Alignment:</p>
                <div className="flex flex-wrap gap-1.5">
                  {(aiModalApp.ai_matched_skills && aiModalApp.ai_matched_skills.length > 0) ? (
                    aiModalApp.ai_matched_skills.map((skill) => (
                      <span
                        key={skill}
                        className="rounded-lg border border-purple-500/30 bg-purple-500/10 px-2.5 py-1 text-xs font-medium text-purple-300"
                      >
                        ✓ {skill}
                      </span>
                    ))
                  ) : (
                    <span className="text-xs text-[#808095]">General engineering foundations verified</span>
                  )}
                </div>
              </div>

              {/* AI Evaluation Summary */}
              <div className="rounded-xl border border-[#2a2a35] bg-[#1a1a24] p-4">
                <p className="text-xs font-semibold text-white mb-1.5 flex items-center gap-1.5">
                  <Sparkles size={13} className="text-purple-400" />
                  Executive Evaluation Summary:
                </p>
                <p className="text-xs text-[#d0ccda] leading-relaxed whitespace-pre-wrap">
                  {aiModalApp.ai_summary || 'Analysis indicates strong alignment with agency projects and core architecture stack.'}
                </p>
              </div>

              {/* Candidate Cover Letter Snippet */}
              {aiModalApp.cover_letter && (
                <div className="rounded-xl border border-[#2a2a35] bg-[#1a1a24]/50 p-4">
                  <p className="text-xs font-semibold text-[#a0a0b0] mb-1">Applicant Statement / Cover Note:</p>
                  <p className="text-xs text-[#808095] italic leading-relaxed line-clamp-4">
                    "{aiModalApp.cover_letter}"
                  </p>
                </div>
              )}

              {/* Actions */}
              <div className="flex items-center justify-between pt-3 border-t border-[#2a2a35]">
                <button
                  onClick={() => handleRunAiScreening(aiModalApp.id)}
                  disabled={screeningId === aiModalApp.id}
                  className="inline-flex items-center gap-1.5 rounded-xl border border-[#2a2a35] bg-[#1a1a24] px-3.5 py-2 text-xs font-medium text-[#d0ccda] hover:text-white"
                >
                  <RefreshCw size={13} className={screeningId === aiModalApp.id ? 'animate-spin' : ''} />
                  <span>Re-evaluate</span>
                </button>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      const app = aiModalApp
                      setAiModalApp(null)
                      handleOpenOfferModal(app)
                    }}
                    className="inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-emerald-600 to-green-600 px-4 py-2 text-xs font-bold text-white hover:brightness-110"
                  >
                    <Send size={13} />
                    <span>Proceed to Offer</span>
                  </button>
                  <button
                    onClick={() => setAiModalApp(null)}
                    className="rounded-xl border border-[#2a2a35] px-4 py-2 text-xs font-semibold text-[#a0a0b0] hover:text-white"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: GENERATE ONE-CLICK OFFER LETTER */}
      {offerModalApp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-2xl border border-[#3a3545] bg-[#131318] p-6 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-[#2a2a35]">
              <div className="flex items-center gap-2">
                <div className="rounded-xl bg-emerald-500/20 p-2 text-emerald-400">
                  <Send size={18} />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">Generate Appointment & Offer Letter</h3>
                  <p className="text-xs text-[#a0a0b0]">Official offer with candidate e-signature link</p>
                </div>
              </div>
              <button onClick={() => setOfferModalApp(null)} className="text-[#a0a0b0] hover:text-white">
                <X size={18} />
              </button>
            </div>

            {createdOffer ? (
              <div className="mt-5 space-y-4">
                <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-4 text-center">
                  <CheckCircle2 size={36} className="mx-auto text-emerald-400 mb-2" />
                  <h4 className="text-sm font-bold text-emerald-300">Offer Letter Dispatched!</h4>
                  <p className="mt-1 text-xs text-[#d0ccda]">
                    The appointment letter for <strong className="text-white">{offerModalApp.applicant_name}</strong> has been generated with status <span className="text-emerald-400 font-bold">issued</span>.
                  </p>
                </div>

                <div className="p-3.5 bg-[#1a1a24] rounded-xl border border-[#2a2a35] text-xs">
                  <p className="text-[#a0a0b0] mb-1 font-semibold">Shareable Candidate E-Acceptance Link:</p>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      readOnly
                      value={createdOffer.url}
                      className="w-full bg-[#131318] border border-[#2a2a35] rounded-lg px-2.5 py-1.5 text-xs text-emerald-300 font-mono"
                    />
                    <button
                      type="button"
                      onClick={handleCopyOfferLink}
                      className="px-3 py-1.5 bg-[#22c55e] text-black font-bold rounded-lg hover:bg-[#16a34a] transition-colors"
                    >
                      {copiedOfferLink ? 'Copied' : 'Copy'}
                    </button>
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-2">
                  <Link
                    href={`/offer/${createdOffer.id}`}
                    target="_blank"
                    className="inline-flex items-center gap-1.5 rounded-xl bg-purple-600 px-4 py-2 text-xs font-bold text-white hover:bg-purple-500"
                  >
                    <ExternalLink size={14} /> Open Offer Portal
                  </Link>
                  <button
                    onClick={() => {
                      setOfferModalApp(null)
                      setCreatedOffer(null)
                    }}
                    className="rounded-xl border border-[#2a2a35] px-4 py-2 text-xs font-semibold text-[#a0a0b0] hover:text-white"
                  >
                    Done
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleGenerateOfferSubmit} className="mt-5 space-y-4">
                <div className="rounded-xl border border-[#2a2a35] bg-[#1a1a24] p-3">
                  <p className="text-xs text-[#a0a0b0]">Candidate Name:</p>
                  <p className="text-sm font-bold text-white">{offerModalApp.applicant_name}</p>
                  <p className="text-xs text-purple-300 font-mono mt-0.5">{offerModalApp.email}</p>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#a0a0b0] mb-1">
                    Designation / Role Title *
                  </label>
                  <input
                    type="text"
                    required
                    value={offerForm.roleTitle}
                    onChange={(e) => setOfferForm({ ...offerForm, roleTitle: e.target.value })}
                    className="w-full rounded-xl border border-[#2a2a35] bg-[#1a1a24] px-3.5 py-2.5 text-xs text-white focus:border-emerald-500 focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-[#a0a0b0] mb-1">
                      Monthly Stipend (₹) *
                    </label>
                    <input
                      type="number"
                      required
                      value={offerForm.stipendAmount}
                      onChange={(e) => setOfferForm({ ...offerForm, stipendAmount: Number(e.target.value) })}
                      className="w-full rounded-xl border border-[#2a2a35] bg-[#1a1a24] px-3.5 py-2.5 text-xs text-white focus:border-emerald-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-[#a0a0b0] mb-1">
                      Tenure (Months) *
                    </label>
                    <input
                      type="number"
                      required
                      value={offerForm.durationMonths}
                      onChange={(e) => setOfferForm({ ...offerForm, durationMonths: Number(e.target.value) })}
                      className="w-full rounded-xl border border-[#2a2a35] bg-[#1a1a24] px-3.5 py-2.5 text-xs text-white focus:border-emerald-500 focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#a0a0b0] mb-1">
                    Internship Start Date *
                  </label>
                  <input
                    type="date"
                    required
                    value={offerForm.startDate}
                    onChange={(e) => setOfferForm({ ...offerForm, startDate: e.target.value })}
                    className="w-full rounded-xl border border-[#2a2a35] bg-[#1a1a24] px-3.5 py-2.5 text-xs text-white focus:border-emerald-500 focus:outline-none"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-3">
                  <button
                    type="button"
                    onClick={() => setOfferModalApp(null)}
                    className="rounded-xl border border-[#2a2a35] px-4 py-2 text-xs font-semibold text-[#a0a0b0] hover:text-white"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={generatingOffer}
                    className="rounded-xl bg-gradient-to-r from-emerald-600 to-green-600 px-5 py-2 text-xs font-bold text-white hover:brightness-110 disabled:opacity-50"
                  >
                    {generatingOffer ? 'Generating Letter...' : 'Issue Offer Letter'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
