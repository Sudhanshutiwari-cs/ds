'use client'

import React, { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  Banknote,
  Briefcase,
  Calendar,
  CheckCircle2,
  Clock,
  Download,
  FileCheck,
  FileText,
  Loader2,
  Printer,
  ShieldCheck,
  Sparkles,
} from 'lucide-react'
import { fetchOfferLetterById, acceptOfferLetter, OfferLetter } from '@/lib/crm-supabase'

export default function CandidateOfferLetterPage() {
  const params = useParams()
  const router = useRouter()
  const id = params?.id as string

  const [offer, setOffer] = useState<OfferLetter | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [signatureName, setSignatureName] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [justAccepted, setJustAccepted] = useState(false)

  useEffect(() => {
    async function loadOffer() {
      if (!id) return
      setLoading(true)
      try {
        const data = await fetchOfferLetterById(id)
        if (data) {
          setOffer(data)
          setSignatureName(data.applicant_name)
        } else {
          setError('Offer letter not found.')
        }
      } catch (err: any) {
        setError(err.message || 'Failed to load offer letter.')
      } finally {
        setLoading(false)
      }
    }
    loadOffer()
  }, [id])

  const handleAccept = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!offer || !signatureName.trim()) return
    setSubmitting(true)
    try {
      const updated = await acceptOfferLetter(offer.id, signatureName.trim())
      setOffer(updated)
      setJustAccepted(true)
    } catch (err: any) {
      alert(`Acceptance error: ${err.message}`)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <main className="min-h-screen bg-[#050506] font-sans text-white flex flex-col justify-between selection:bg-[#7727ff] py-6 px-4 sm:px-6">
      {/* Top Navbar */}
      <header className="mx-auto flex h-16 w-full max-w-4xl items-center justify-between border-b border-[#211d2b] pb-4">
        <Link href="/" className="text-lg font-black tracking-[-0.04em]">
          <span className="text-[#7727ff]">DS</span>Softwares<span className="text-[#7727ff]">.</span>
        </Link>
        <span className="flex items-center gap-1.5 rounded-full border border-[#7727ff]/40 bg-[#7727ff]/15 px-3 py-1 text-xs font-bold text-[#c8b4ff]">
          Official Internship Offer
        </span>
      </header>

      {/* Main Content */}
      <div className="mx-auto my-8 w-full max-w-3xl">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-24">
            <Loader2 size={36} className="animate-spin text-[#7727ff]" />
            <p className="mt-4 text-xs text-[#a0a0b0]">Retrieving your official appointment document...</p>
          </div>
        ) : error || !offer ? (
          <div className="mx-auto max-w-md rounded-3xl border border-rose-500/30 bg-[#160b11] p-8 text-center shadow-2xl">
            <h2 className="text-xl font-bold text-white">Offer Letter Not Found</h2>
            <p className="mt-2 text-xs text-[#a0a0b0]">
              {error || 'This appointment letter does not exist or has expired.'}
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Status Alert */}
            {offer.status === 'accepted' ? (
              <div className="rounded-2xl border border-green-500/40 bg-green-950/20 p-4 text-xs text-green-300 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CheckCircle2 size={18} className="text-green-400 shrink-0" />
                  <span>
                    <strong>Offer Accepted & Validated!</strong> {offer.signature_data}
                  </span>
                </div>
                <Link
                  href="/portal"
                  className="rounded-xl bg-green-500 px-3.5 py-1.5 font-bold text-black hover:bg-green-400 transition-all shadow shrink-0"
                >
                  Go to Intern Portal &rarr;
                </Link>
              </div>
            ) : (
              <div className="rounded-2xl border border-[#7727ff]/30 bg-[#161224] p-4 text-xs text-[#c8b4ff] flex items-center justify-between">
                <span>Please review your appointment terms and electronically sign below to accept.</span>
                <button
                  onClick={() => window.print()}
                  className="flex items-center gap-1.5 rounded-xl border border-[#3b344c] bg-[#1a1728] px-3 py-1 text-xs font-semibold text-white hover:bg-white hover:text-black transition-all"
                >
                  <Printer size={12} /> Print PDF
                </button>
              </div>
            )}

            {/* Document Sheet */}
            <div className="rounded-3xl border border-[#2b2738] bg-[#0f0e15] p-8 sm:p-12 shadow-2xl space-y-6 text-xs sm:text-sm text-[#d0ccda] leading-relaxed">
              {/* Letterhead */}
              <div className="flex flex-col sm:flex-row justify-between items-start gap-4 pb-6 border-b border-[#211d2b]">
                <div>
                  <div className="text-2xl font-black tracking-tight text-white">
                    <span className="text-[#7727ff]">DS</span>Softwares<span className="text-[#7727ff]">.</span>
                  </div>
                  <p className="text-[11px] text-[#8e8a99] mt-0.5">Engineering & Product Development Agency</p>
                  <p className="text-[11px] text-[#8e8a99]">www.dssoftwares.in &middot; hello@dssoftwares.in</p>
                </div>
                <div className="sm:text-right text-xs text-[#8e8a99]">
                  <p>Date: {new Date(offer.created_at).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</p>
                  <p className="font-mono mt-0.5">Ref: DS-OFFER-{offer.id.substring(0, 8).toUpperCase()}</p>
                </div>
              </div>

              {/* Salutation */}
              <div>
                <p className="font-semibold text-white">Dear {offer.applicant_name},</p>
                <p className="mt-2">
                  Following your recent evaluation and portfolio assessment, we are thrilled to offer you the position of{' '}
                  <strong className="text-white">{offer.role_title}</strong> at DS Softwares Agency in our{' '}
                  <strong className="text-white">{offer.department}</strong> division.
                </p>
              </div>

              {/* Core Offer Parameters Box */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 rounded-2xl border border-[#262232] bg-[#14121d] p-4 text-xs">
                <div>
                  <span className="text-[10px] uppercase font-bold text-[#8e8a99] block">Remuneration / Stipend</span>
                  <span className="text-base font-black text-emerald-400 mt-1 block">
                    ₹{Number(offer.stipend_amount).toLocaleString('en-IN')}{' '}
                    <span className="text-xs font-normal text-[#8e8a99]">/ month</span>
                  </span>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-[#8e8a99] block">Program Duration</span>
                  <span className="text-base font-bold text-white mt-1 block">
                    {offer.duration_months} Months
                  </span>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-[#8e8a99] block">Official Start Date</span>
                  <span className="text-base font-bold text-white mt-1 block">
                    {new Date(offer.start_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </span>
                </div>
              </div>

              {/* Terms Section */}
              <div className="space-y-3">
                <h3 className="text-xs font-bold uppercase tracking-wider text-white">Terms of Internship:</h3>
                <ul className="list-disc pl-5 space-y-1.5 text-xs text-[#a0a0b0]">
                  <li>
                    <strong className="text-white">Hands-on Production Code:</strong> You will contribute directly to client projects, Next.js web applications, and database architectures within an assigned engineering squad.
                  </li>
                  <li>
                    <strong className="text-white">Agile Sprints & Mentorship:</strong> You will participate in sprint task Kanban tracking, async daily standups, and regular code reviews with senior engineering leads.
                  </li>
                  <li>
                    <strong className="text-white">Accreditation:</strong> Upon successful tenure, you will receive an official verifiable digital credential and letter of recommendation.
                  </li>
                </ul>
              </div>

              {/* Signatures & Acceptance Box */}
              <div className="pt-6 border-t border-[#211d2b]">
                {offer.status === 'accepted' ? (
                  <div className="rounded-2xl border border-green-500/30 bg-[#0d1a13] p-5 text-center">
                    <CheckCircle2 size={28} className="mx-auto text-green-400 mb-2" />
                    <h4 className="text-sm font-bold text-white">Offer Accepted & Signed</h4>
                    <p className="mt-1 text-xs text-[#a0a0b0] font-mono">{offer.signature_data}</p>
                  </div>
                ) : (
                  <form onSubmit={handleAccept} className="rounded-2xl border border-[#3b344c] bg-[#161322] p-5 space-y-4">
                    <div>
                      <h4 className="text-xs font-bold uppercase tracking-wider text-white flex items-center gap-2">
                        <Sparkles size={14} className="text-[#a77aff]" /> Electronic Acceptance Signature
                      </h4>
                      <p className="text-xs text-[#a0a0b0] mt-1">
                        Please type your full legal name below to execute this appointment agreement.
                      </p>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-[#8e8a99] mb-1">Full Legal Name</label>
                      <input
                        type="text"
                        required
                        value={signatureName}
                        onChange={(e) => setSignatureName(e.target.value)}
                        placeholder="e.g. Ananya Sen"
                        className="w-full rounded-xl border border-[#363046] bg-[#0c0a13] px-3.5 py-2.5 text-xs text-white focus:border-[#7727ff] focus:outline-none"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={submitting}
                      className="w-full rounded-xl bg-[#6417ed] py-3 text-xs font-bold text-white hover:bg-[#7727ff] transition-all shadow-lg shadow-[#7727ff]/25 disabled:opacity-50"
                    >
                      {submitting ? 'Confirming Acceptance...' : 'Accept Offer & Join Engineering Squad'}
                    </button>
                  </form>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <footer className="border-t border-[#1a1724] py-6 text-center text-xs text-[#606070]">
        DS Softwares Agency &middot; Human Resources &amp; Talent Acquisition
      </footer>
    </main>
  )
}
