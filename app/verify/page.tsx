'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Award, CheckCircle2, Search, ShieldCheck } from 'lucide-react'

export default function VerifyPortalSearchPage() {
  const router = useRouter()
  const [code, setCode] = useState('')

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (code.trim()) {
      router.push(`/verify/${encodeURIComponent(code.trim())}`)
    }
  }

  return (
    <main className="min-h-screen bg-[#050506] font-sans text-white flex flex-col justify-between selection:bg-[#7727ff]">
      {/* Top Navbar */}
      <header className="border-b border-[#211d2b] bg-[#0c0b0f]/80 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
          <a href="/" className="text-lg font-black tracking-[-0.04em]">
            <span className="text-[#7727ff]">DS</span>Softwares<span className="text-[#7727ff]">.</span>
          </a>
          <span className="flex items-center gap-1.5 rounded-full border border-green-500/30 bg-green-500/10 px-3 py-1 text-xs font-bold text-green-400">
            <ShieldCheck size={14} /> Official Credential Registry
          </span>
        </div>
      </header>

      {/* Hero Section */}
      <div className="mx-auto max-w-2xl px-4 py-20 text-center">
        <div className="mx-auto flex size-16 items-center justify-center rounded-2xl border border-[#7727ff]/40 bg-[#7727ff]/15 text-[#a77aff] mb-6 shadow-xl">
          <Award size={32} />
        </div>

        <h1 className="text-3xl font-black sm:text-4xl">Verify Internship Credentials</h1>
        <p className="mt-3 text-sm text-[#a0a0b0] leading-relaxed">
          Verify digital completion certificates, engineering tracks, and letters of recommendation issued to DS Softwares alumni and interns.
        </p>

        {/* Verification Form */}
        <form onSubmit={handleSearch} className="mt-8 flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search size={18} className="absolute left-3.5 top-3.5 text-[#8e8a99]" />
            <input
              type="text"
              required
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="e.g. VERIFY-DS-AARAV-842 or DS-2026-ENG-0842"
              className="w-full rounded-2xl border border-[#2e2a3b] bg-[#121118] pl-10 pr-4 py-3 text-sm text-white placeholder-[#606075] focus:border-[#7727ff] focus:outline-none shadow-inner"
            />
          </div>
          <button
            type="submit"
            className="rounded-2xl bg-[#6417ed] px-7 py-3 text-sm font-bold text-white hover:bg-[#7727ff] transition-all shadow-lg shadow-[#7727ff]/20 shrink-0"
          >
            Verify Credential
          </button>
        </form>

        <div className="mt-6 flex flex-wrap items-center justify-center gap-4 text-xs text-[#8e8a99]">
          <span className="flex items-center gap-1"><CheckCircle2 size={13} className="text-green-400" /> Tamper-evident hash</span>
          <span className="flex items-center gap-1"><CheckCircle2 size={13} className="text-green-400" /> ISO/IEC verifiable</span>
          <span className="flex items-center gap-1"><CheckCircle2 size={13} className="text-green-400" /> University & Employer accepted</span>
        </div>

        {/* Example Quick Links */}
        <div className="mt-12 p-4 rounded-2xl border border-[#211d2b] bg-[#0c0b11] text-xs text-[#8e8a99]">
          <span className="text-[#a0a0b0] font-semibold">Demo verification credential: </span>
          <a
            href="/verify/VERIFY-DS-AARAV-842"
            className="text-[#a77aff] hover:underline font-mono ml-1 font-bold"
          >
            VERIFY-DS-AARAV-842
          </a>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-[#1a1724] py-6 text-center text-xs text-[#606070]">
        DS Softwares Agency · Digital Credential & Cryptographic Verification Authority
      </footer>
    </main>
  )
}
