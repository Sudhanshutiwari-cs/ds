'use client'

import React, { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import {
  Award,
  Calendar,
  CheckCircle2,
  ExternalLink,
  GraduationCap,
  Loader2,
  Printer,
  ShieldAlert,
  ShieldCheck,
  User,
} from 'lucide-react'
import { verifyCertificate, Certificate } from '@/lib/crm-supabase'

export default function CertificateVerificationPage() {
  const params = useParams()
  const code = params?.id as string

  const [cert, setCert] = useState<Certificate | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  useEffect(() => {
    async function loadCert() {
      if (!code) return
      setLoading(true)
      try {
        const decoded = decodeURIComponent(code)
        const found = await verifyCertificate(decoded)
        if (found) {
          setCert(found)
        } else {
          setError(true)
        }
      } catch (err) {
        console.error('Verification error:', err)
        setError(true)
      } finally {
        setLoading(false)
      }
    }
    loadCert()
  }, [code])

  return (
    <main className="min-h-screen bg-[#050506] font-sans text-white flex flex-col justify-between selection:bg-[#7727ff] py-6 px-4 sm:px-6">
      {/* Top Navbar */}
      <header className="mx-auto flex h-16 w-full max-w-5xl items-center justify-between border-b border-[#211d2b] pb-4">
        <Link href="/" className="text-lg font-black tracking-[-0.04em]">
          <span className="text-[#7727ff]">DS</span>Softwares<span className="text-[#7727ff]">.</span>
        </Link>
        <Link
          href="/verify"
          className="rounded-xl border border-[#2b2735] bg-[#121118] px-3.5 py-1.5 text-xs font-semibold text-[#a0a0b0] hover:text-white"
        >
          Verify Another
        </Link>
      </header>

      {/* Main Container */}
      <div className="mx-auto my-10 w-full max-w-4xl">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-24">
            <Loader2 size={36} className="animate-spin text-[#7727ff]" />
            <p className="mt-4 text-xs text-[#a0a0b0]">Cryptographically verifying credential on Supabase registry...</p>
          </div>
        ) : error || !cert ? (
          <div className="mx-auto max-w-md rounded-3xl border border-rose-500/30 bg-[#160b11] p-8 text-center shadow-2xl">
            <div className="mx-auto flex size-14 items-center justify-center rounded-2xl bg-rose-500/20 text-rose-400 mb-4">
              <ShieldAlert size={28} />
            </div>
            <h2 className="text-xl font-bold text-white">Credential Not Found</h2>
            <p className="mt-2 text-xs text-[#a0a0b0] leading-relaxed">
              No verified certificate matches identifier <code className="text-rose-300 font-bold">{code}</code>. It may have expired, been revoked, or the code was mistyped.
            </p>
            <Link
              href="/verify"
              className="mt-6 inline-block rounded-xl bg-[#6417ed] px-5 py-2.5 text-xs font-bold text-white hover:bg-[#7727ff]"
            >
              Search Again
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Status Ribbon */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 rounded-2xl border border-green-500/30 bg-green-950/20 px-5 py-3 text-xs">
              <div className="flex items-center gap-2 text-green-300 font-semibold">
                <CheckCircle2 size={16} className="text-green-400" />
                <span>Verified Authenticity &middot; Official Record Issued by DS Softwares Agency</span>
              </div>
              <button
                onClick={() => window.print()}
                className="flex items-center gap-1.5 rounded-xl bg-white px-3.5 py-1.5 text-xs font-bold text-black hover:bg-slate-200 transition-all shadow"
              >
                <Printer size={13} /> Print / Save Certificate
              </button>
            </div>

            {/* Certificate Canvas / Card */}
            <div
              id="printable-certificate"
              className="relative overflow-hidden rounded-3xl border-2 border-[#7727ff]/40 bg-gradient-to-b from-[#111018] via-[#0d0c13] to-[#121019] p-8 sm:p-14 shadow-2xl text-center"
            >
              {/* Background ambient accents */}
              <div
                aria-hidden="true"
                className="pointer-events-none absolute -left-20 -top-20 size-72 rounded-full bg-[#7727ff15] blur-3xl"
              />
              <div
                aria-hidden="true"
                className="pointer-events-none absolute -right-20 -bottom-20 size-72 rounded-full bg-[#6417ed15] blur-3xl"
              />

              {/* Certificate Inner Border */}
              <div className="rounded-2xl border border-[#2b2738] p-6 sm:p-10 relative">
                {/* Header Branding */}
                <div className="flex justify-center items-center gap-2 mb-2">
                  <span className="text-2xl font-black tracking-[-0.03em]">
                    <span className="text-[#7727ff]">DS</span>Softwares<span className="text-[#7727ff]">.</span>
                  </span>
                </div>
                <p className="text-[10px] uppercase font-bold tracking-[0.25em] text-[#8e8a99]">
                  Agency Engineering Accreditation
                </p>

                <h1 className="mt-8 text-2xl font-black text-white sm:text-4xl tracking-tight">
                  Certificate of Completion
                </h1>
                <p className="mt-2 text-xs uppercase tracking-widest text-[#a77aff] font-bold">
                  {cert.title}
                </p>

                {/* Recipient */}
                <p className="mt-8 text-xs text-[#8e8a99]">This is to proudly certify that</p>
                <div className="mt-2 inline-block border-b-2 border-[#7727ff] pb-1 px-8">
                  <h2 className="text-2xl font-extrabold text-white sm:text-3xl">
                    {cert.interns?.full_name || 'Software Engineering Intern'}
                  </h2>
                </div>

                {/* Citation */}
                <p className="mx-auto mt-6 max-w-xl text-xs sm:text-sm text-[#c8b4ff] leading-relaxed">
                  has successfully completed the intensive internship program in{' '}
                  <strong className="text-white font-bold">{cert.track}</strong>, demonstrating exceptional engineering standards, squad leadership, and problem-solving excellence awarded with{' '}
                  <span className="rounded-md bg-[#7727ff]/20 px-2 py-0.5 font-bold text-white border border-[#7727ff]/40">
                    {cert.grade}
                  </span>.
                </p>

                {/* Details Grid */}
                <div className="mt-10 grid grid-cols-2 sm:grid-cols-4 gap-4 border-t border-b border-[#242030] py-4 text-xs">
                  <div>
                    <span className="block text-[10px] uppercase text-[#8e8a99]">Credential ID</span>
                    <strong className="font-mono font-bold text-white mt-0.5 block">{cert.certificate_number}</strong>
                  </div>
                  <div>
                    <span className="block text-[10px] uppercase text-[#8e8a99]">Cohort</span>
                    <strong className="font-bold text-white mt-0.5 block">{cert.interns?.batches?.name || '2026 Q4 Alpha'}</strong>
                  </div>
                  <div>
                    <span className="block text-[10px] uppercase text-[#8e8a99]">Issue Date</span>
                    <strong className="font-bold text-white mt-0.5 block">
                      {new Date(cert.issue_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </strong>
                  </div>
                  <div>
                    <span className="block text-[10px] uppercase text-[#8e8a99]">Verification Code</span>
                    <strong className="font-mono text-[#a77aff] font-bold mt-0.5 block">{cert.verification_code}</strong>
                  </div>
                </div>

                {/* Signatures */}
                <div className="mt-10 flex flex-col sm:flex-row justify-between items-center gap-6 pt-4">
                  <div className="text-center sm:text-left">
                    <div className="text-xs text-[#8e8a99] font-mono">Digitally Verified &bull; SHA-256</div>
                    <div className="text-[11px] text-[#606070] mt-0.5">https://dssoftwares.in/verify/{cert.verification_code}</div>
                  </div>

                  <div className="text-center sm:text-right">
                    <div className="border-t border-[#7727ff]/60 pt-1 min-w-[200px]">
                      <p className="text-xs font-bold text-white">{cert.director_name}</p>
                      <p className="text-[10px] text-[#8e8a99]">{cert.director_title}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <footer className="border-t border-[#1a1724] py-6 text-center text-xs text-[#606070]">
        DS Softwares Agency &middot; Verifiable Digital Credentials &middot; Verified on Supabase PostgreSQL
      </footer>
    </main>
  )
}
