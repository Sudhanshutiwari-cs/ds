'use client'

import React, { useEffect, useState } from 'react'
import {
  ArrowLeft,
  Briefcase,
  CheckCircle2,
  FileText,
  GraduationCap,
  Loader2,
  Paperclip,
  Rocket,
  Send,
  Sparkles,
  UploadCloud,
  X,
} from 'lucide-react'
import { crmSupabase, submitApplication, Program } from '@/lib/crm-supabase'

export default function ApplyPage() {
  const [programs, setPrograms] = useState<Program[]>([])
  const [loadingPrograms, setLoadingPrograms] = useState(true)

  // Form State
  const [formData, setFormData] = useState({
    applicantName: '',
    email: '',
    phone: '',
    programId: '',
    coverLetter: '',
  })
  const [resumeFile, setResumeFile] = useState<File | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitSuccess, setSubmitSuccess] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  // Fetch active programs from Supabase
  useEffect(() => {
    async function loadPrograms() {
      try {
        const { data, error } = await crmSupabase
          .from('programs')
          .select('*')
          .eq('is_active', true)
          .order('created_at', { ascending: false })

        if (error) {
          console.warn('Error loading programs:', error.message)
        } else if (data && data.length > 0) {
          setPrograms(data)
          setFormData((prev) => ({ ...prev, programId: data[0].id }))
        }
      } catch (err) {
        console.error('Failed to fetch programs:', err)
      } finally {
        setLoadingPrograms(false)
      }
    }
    loadPrograms()
  }, [])

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0]
      if (file.size > 10 * 1024 * 1024) {
        setErrorMessage('Resume file size must be less than 10MB')
        return
      }
      setResumeFile(file)
      setErrorMessage(null)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setErrorMessage(null)

    try {
      if (!formData.applicantName || !formData.email) {
        throw new Error('Please fill in your name and email address.')
      }

      // If no program exists in DB, ensure we either pick one or create a default fallback
      let effectiveProgramId = formData.programId
      if (!effectiveProgramId) {
        // Try to fetch or create a default program
        const { data: existing } = await crmSupabase.from('programs').select('id').limit(1).maybeSingle()
        if (existing?.id) {
          effectiveProgramId = existing.id
        } else {
          const { data: newProg, error: progErr } = await crmSupabase
            .from('programs')
            .insert([
              {
                title: 'Full-Stack Software Engineering Internship',
                department: 'Engineering',
                is_active: true,
              },
            ])
            .select()
            .single()

          if (!progErr && newProg) {
            effectiveProgramId = newProg.id
          } else {
            throw new Error('Please select an internship program to apply for.')
          }
        }
      }

      await submitApplication({
        programId: effectiveProgramId,
        applicantName: formData.applicantName,
        email: formData.email,
        phone: formData.phone,
        coverLetter: formData.coverLetter,
        resumeFile: resumeFile || undefined,
      })

      setSubmitSuccess(true)
    } catch (err: any) {
      console.error('Submission failed:', err)
      setErrorMessage(err.message || 'Failed to submit application. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <main className="min-h-screen bg-[#050506] font-sans text-[#f7f5ff] selection:bg-[#7727ff]">
      {/* Header */}
      <header className="mx-auto flex h-20 max-w-5xl items-center justify-between px-4 sm:h-24 sm:px-6">
        <a href="/" aria-label="DS Softwares home" className="text-xl font-black tracking-[-0.04em] sm:text-2xl">
          <span className="text-[#7727ff]">DS</span>Softwares<span className="text-[#7727ff]">.</span>
        </a>
        <a
          href="/"
          className="inline-flex items-center gap-2 text-xs font-bold text-[#aaa6b5] transition-colors hover:text-[#f7f5ff] sm:text-sm"
        >
          <ArrowLeft size={16} /> Back to Home
        </a>
      </header>

      {/* Main Container */}
      <div className="relative mx-auto max-w-3xl px-4 pb-24 pt-6 sm:px-6 sm:pt-10">
        {/* Ambient Glow */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute left-1/2 top-0 h-96 w-4/5 -translate-x-1/2 bg-[radial-gradient(ellipse_at_center,#7727ff45,transparent_70%)] blur-3xl"
        />

        {/* Title & Headline */}
        <div className="relative text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-[#7727ff55] bg-[#7727ff15] px-4 py-1.5 text-xs font-bold uppercase tracking-[0.2em] text-[#b58cff]">
            <GraduationCap size={14} className="text-[#a77aff]" /> Internship Program 2026
          </div>

          <h1 className="mt-5 text-balance text-3xl font-black tracking-tight sm:text-4xl lg:text-5xl">
            Build real software.{' '}
            <span className="bg-gradient-to-r from-[#a77aff] via-[#f7f5ff] to-[#7727ff] bg-clip-text text-transparent">
              Accelerate your craft.
            </span>
          </h1>

          <p className="mx-auto mt-4 max-w-xl text-sm leading-relaxed text-[#c2becb] sm:text-base">
            Work directly with senior engineers on client-facing applications, generative AI workflows, and cloud
            infrastructure.
          </p>
        </div>

        {/* Application Box */}
        <div className="relative mt-10 rounded-3xl border border-[#3f3b49] bg-[#111013]/90 p-6 shadow-2xl backdrop-blur-xl sm:p-10">
          {submitSuccess ? (
            <div className="py-12 text-center">
              <div className="mx-auto flex size-16 items-center justify-center rounded-2xl border border-[#22c55e]/30 bg-[#22c55e]/15 text-[#22c55e] shadow-[0_0_30px_#22c55e33]">
                <CheckCircle2 size={32} />
              </div>

              <h2 className="mt-6 text-2xl font-black text-white sm:text-3xl">Application Received!</h2>
              <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-[#aaa6b5]">
                Thank you for applying, <strong className="text-white">{formData.applicantName}</strong>. Our engineering
                mentors review applications on a rolling basis. If your profile matches, we will reach out to{' '}
                <span className="text-[#a77aff]">{formData.email}</span> within 3-5 business days.
              </p>

              <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
                <button
                  onClick={() => {
                    setSubmitSuccess(false)
                    setFormData({
                      applicantName: '',
                      email: '',
                      phone: '',
                      programId: programs[0]?.id || '',
                      coverLetter: '',
                    })
                    setResumeFile(null)
                  }}
                  className="rounded-xl border border-[#3f3b49] bg-[#1a1722] px-5 py-2.5 text-xs font-bold text-[#f7f5ff] transition-all hover:bg-[#252230]"
                >
                  Submit Another Application
                </button>
                <a
                  href="/"
                  className="rounded-xl bg-[#6417ed] px-6 py-2.5 text-xs font-bold text-white transition-all hover:bg-[#7727ff]"
                >
                  Return to Home
                </a>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              {errorMessage && (
                <div className="rounded-xl border border-rose-500/30 bg-rose-500/10 p-4 text-xs font-medium text-rose-300">
                  {errorMessage}
                </div>
              )}

              {/* Program Selector */}
              <div>
                <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-[#aaa6b5]">
                  Select Program *
                </label>
                {loadingPrograms ? (
                  <div className="flex h-12 items-center gap-2 rounded-xl border border-[#2b2735] bg-[#18161f] px-4 text-xs text-[#8e8a99]">
                    <Loader2 size={16} className="animate-spin text-[#7727ff]" /> Loading available programs...
                  </div>
                ) : programs.length > 0 ? (
                  <div className="grid gap-2 sm:grid-cols-2">
                    {programs.map((prog) => {
                      const isSelected = formData.programId === prog.id
                      return (
                        <button
                          key={prog.id}
                          type="button"
                          onClick={() => setFormData({ ...formData, programId: prog.id })}
                          className={`flex flex-col items-start rounded-2xl border p-4 text-left transition-all ${
                            isSelected
                              ? 'border-[#7727ff] bg-[#6417ed]/20 shadow-[0_0_15px_#7727ff44]'
                              : 'border-[#2b2735] bg-[#16141c] hover:border-[#433e50]'
                          }`}
                        >
                          <div className="flex w-full items-center justify-between">
                            <span className="text-xs font-bold text-[#a77aff]">{prog.department || 'Engineering'}</span>
                            {isSelected && <span className="size-2 rounded-full bg-[#7727ff]" />}
                          </div>
                          <h3 className="mt-1 text-sm font-bold text-white">{prog.title}</h3>
                          {prog.description && (
                            <p className="mt-1 line-clamp-2 text-xs text-[#aaa6b5]">{prog.description}</p>
                          )}
                        </button>
                      )
                    })}
                  </div>
                ) : (
                  <div className="rounded-xl border border-[#7727ff]/40 bg-[#6417ed]/15 p-4 text-xs text-[#d0b8ff]">
                    <strong className="block text-sm font-bold text-white">Full-Stack Software Engineering</strong>
                    Default program selected. You can apply directly.
                  </div>
                )}
              </div>

              {/* Personal Details */}
              <div className="grid gap-5 sm:grid-cols-2">
                <div>
                  <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-[#aaa6b5]">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.applicantName}
                    onChange={(e) => setFormData({ ...formData, applicantName: e.target.value })}
                    placeholder="e.g. Rahul Sharma"
                    className="w-full rounded-xl border border-[#2b2735] bg-[#18161f] px-4 py-3 text-sm text-white placeholder-[#605d6a] transition-all focus:border-[#7727ff] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-[#aaa6b5]">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="you@example.com"
                    className="w-full rounded-xl border border-[#2b2735] bg-[#18161f] px-4 py-3 text-sm text-white placeholder-[#605d6a] transition-all focus:border-[#7727ff] focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-[#aaa6b5]">
                  Phone Number
                </label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="+91 98765 43210"
                  className="w-full rounded-xl border border-[#2b2735] bg-[#18161f] px-4 py-3 text-sm text-white placeholder-[#605d6a] transition-all focus:border-[#7727ff] focus:outline-none"
                />
              </div>

              {/* Resume Upload */}
              <div>
                <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-[#aaa6b5]">
                  Resume / CV (PDF, DOCX)
                </label>
                <div className="relative flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-[#3a3545] bg-[#16141c] p-6 transition-all hover:border-[#7727ff88]">
                  <input
                    type="file"
                    accept=".pdf,.doc,.docx"
                    onChange={handleFileChange}
                    className="absolute inset-0 cursor-pointer opacity-0"
                  />
                  <UploadCloud size={28} className="text-[#a77aff]" />
                  <p className="mt-2 text-xs font-bold text-white">
                    {resumeFile ? resumeFile.name : 'Click or drag your resume to upload'}
                  </p>
                  <p className="mt-1 text-[11px] text-[#8e8a99]">PDF or DOCX up to 10MB</p>

                  {resumeFile && (
                    <div className="mt-3 flex items-center gap-2 rounded-lg bg-[#252230] px-3 py-1.5 text-xs text-[#d0ccda]">
                      <Paperclip size={13} className="text-[#a77aff]" />
                      <span className="truncate max-w-[200px]">{resumeFile.name}</span>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation()
                          setResumeFile(null)
                        }}
                        className="ml-1 text-[#aaa6b5] hover:text-white"
                      >
                        <X size={13} />
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Cover Letter / Notes */}
              <div>
                <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-[#aaa6b5]">
                  Brief Intro & Why DS Softwares?
                </label>
                <textarea
                  rows={4}
                  value={formData.coverLetter}
                  onChange={(e) => setFormData({ ...formData, coverLetter: e.target.value })}
                  placeholder="Tell us about the tech stacks you enjoy, projects you've built, or what you want to learn..."
                  className="w-full rounded-xl border border-[#2b2735] bg-[#18161f] px-4 py-3 text-sm text-white placeholder-[#605d6a] transition-all focus:border-[#7727ff] focus:outline-none"
                />
              </div>

              {/* Submit CTA */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="group inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#6417ed] py-3.5 text-sm font-bold text-white shadow-[0_0_25px_#7727ff55] transition-all hover:bg-[#7727ff] disabled:opacity-50"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 size={18} className="animate-spin" /> Uploading & Submitting...
                  </>
                ) : (
                  <>
                    Submit Application <Send size={16} className="transition-transform group-hover:translate-x-1" />
                  </>
                )}
              </button>
            </form>
          )}
        </div>
      </div>
    </main>
  )
}
