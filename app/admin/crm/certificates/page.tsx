'use client'

import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import {
  Award,
  CheckCircle2,
  Copy,
  ExternalLink,
  FileCheck,
  Filter,
  GraduationCap,
  Loader2,
  Plus,
  Printer,
  RefreshCw,
  Search,
  ShieldCheck,
  User,
  X,
} from 'lucide-react'
import {
  fetchCertificates,
  issueCertificate,
  fetchInterns,
  Certificate,
  Intern,
} from '@/lib/crm-supabase'

export default function CrmCertificatesPage() {
  const [certificates, setCertificates] = useState<Certificate[]>([])
  const [interns, setInterns] = useState<Intern[]>([])
  const [loading, setLoading] = useState(true)

  // Filters
  const [searchTerm, setSearchTerm] = useState('')
  const [trackFilter, setTrackFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')

  // Issuance Modal
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [issuing, setIssuing] = useState(false)
  const [copiedId, setCopiedId] = useState<string | null>(null)
  const [newlyIssuedCert, setNewlyIssuedCert] = useState<Certificate | null>(null)

  // Issue Form State
  const [formData, setFormData] = useState({
    internId: '',
    title: 'Certificate of Internship Excellence',
    track: 'Full-Stack Web Development & Cloud Systems',
    grade: 'Distinction (Grade A+)',
    issueDate: new Date().toISOString().substring(0, 10),
    completionDate: new Date().toISOString().substring(0, 10),
  })

  const loadData = async () => {
    setLoading(true)
    try {
      const [certsData, internsData] = await Promise.all([
        fetchCertificates(),
        fetchInterns(),
      ])
      setCertificates(certsData)
      setInterns(internsData)

      if (internsData.length > 0 && !formData.internId) {
        setFormData((prev) => ({
          ...prev,
          internId: internsData[0].user_id,
        }))
      }
    } catch (err) {
      console.error('Failed to load certificates:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  const handleCopyLink = (codeOrId: string) => {
    const origin = typeof window !== 'undefined' ? window.location.origin : ''
    const url = `${origin}/verify/${codeOrId}`
    navigator.clipboard.writeText(url)
    setCopiedId(codeOrId)
    setTimeout(() => setCopiedId(null), 2500)
  }

  const handleIssueSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.internId) {
      alert('Please select an intern')
      return
    }

    setIssuing(true)
    try {
      const cert = await issueCertificate({
        internId: formData.internId,
        title: formData.title,
        track: formData.track,
        grade: formData.grade,
        issueDate: formData.issueDate,
        completionDate: formData.completionDate,
      })

      setCertificates((prev) => [cert, ...prev])
      setNewlyIssuedCert(cert)
    } catch (err: any) {
      alert(`Issuance failed: ${err.message}`)
    } finally {
      setIssuing(false)
    }
  }

  // Filtered certificates
  const filtered = certificates.filter((c) => {
    const internName = c.interns?.full_name?.toLowerCase() || ''
    const certNum = c.certificate_number?.toLowerCase() || ''
    const verifyCode = c.verification_code?.toLowerCase() || ''
    const track = c.track?.toLowerCase() || ''
    const q = searchTerm.toLowerCase()

    const matchesSearch =
      internName.includes(q) ||
      certNum.includes(q) ||
      verifyCode.includes(q) ||
      track.includes(q)

    const matchesTrack = trackFilter === 'all' || c.track === trackFilter
    const matchesStatus = statusFilter === 'all' || c.status === statusFilter

    return matchesSearch && matchesTrack && matchesStatus
  })

  // Unique tracks for filter
  const uniqueTracks = Array.from(new Set(certificates.map((c) => c.track).filter(Boolean)))

  // Stats
  const stats = {
    total: certificates.length,
    active: certificates.filter((c) => c.status === 'issued').length,
    distinction: certificates.filter((c) => c.grade.toLowerCase().includes('distinction') || c.grade.includes('A+')).length,
  }

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col justify-between gap-4 rounded-2xl border border-[#2a2a35] bg-[#131318] p-5 sm:flex-row sm:items-center">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-2xl font-bold text-white">Certificates & Credentials</h2>
            <span className="rounded-full border border-purple-500/30 bg-purple-500/10 px-2.5 py-0.5 text-xs font-semibold text-purple-300">
              Verifiable Blockchain-Ready IDs
            </span>
          </div>
          <p className="mt-1 text-sm text-[#a0a0b0]">
            Issue cryptographically verifiable internship completion certificates and Letters of Recommendation (LOR)
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Link
            href="/verify"
            target="_blank"
            className="flex items-center gap-1.5 rounded-xl border border-[#2a2a35] bg-[#1a1a24] px-4 py-2 text-xs font-medium text-[#a0a0b0] transition-all hover:bg-[#252532] hover:text-white"
          >
            <ShieldCheck size={14} className="text-emerald-400" />
            <span>Public Verify Portal</span>
            <ExternalLink size={12} />
          </Link>

          <button
            onClick={loadData}
            className="flex items-center gap-2 rounded-xl border border-[#2a2a35] bg-[#1a1a24] px-3.5 py-2 text-xs font-medium text-white transition-all hover:bg-[#252532]"
            title="Refresh certificates"
          >
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
            <span>Sync</span>
          </button>

          <button
            onClick={() => {
              setNewlyIssuedCert(null)
              setIsModalOpen(true)
            }}
            className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#7727ff] to-[#6417ed] px-4 py-2 text-xs font-bold text-white shadow-lg shadow-purple-500/20 hover:brightness-110"
          >
            <Plus size={15} />
            <span>Issue Certificate</span>
          </button>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-[#2a2a35] bg-[#131318] p-5">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold uppercase tracking-wider text-[#a0a0b0]">
              Total Issued
            </p>
            <Award size={18} className="text-purple-400" />
          </div>
          <p className="mt-2 text-3xl font-black text-white">{stats.total}</p>
          <p className="mt-1 text-xs text-[#808095]">Accredited credentials in registry</p>
        </div>

        <div className="rounded-2xl border border-[#2a2a35] bg-[#131318] p-5">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold uppercase tracking-wider text-emerald-400">
              Active & Verified
            </p>
            <CheckCircle2 size={18} className="text-emerald-400" />
          </div>
          <p className="mt-2 text-3xl font-black text-emerald-400">{stats.active}</p>
          <p className="mt-1 text-xs text-[#808095]">Publicly searchable credentials</p>
        </div>

        <div className="rounded-2xl border border-[#2a2a35] bg-[#131318] p-5">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold uppercase tracking-wider text-amber-400">
              Distinctions & Honors
            </p>
            <GraduationCap size={18} className="text-amber-400" />
          </div>
          <p className="mt-2 text-3xl font-black text-amber-400">{stats.distinction}</p>
          <p className="mt-1 text-xs text-[#808095]">Grade A+ & Outstanding tier</p>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col gap-3 rounded-2xl border border-[#2a2a35] bg-[#131318] p-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1 sm:max-w-md">
          <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#a0a0b0]" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by intern, credential number (DS-...), or track..."
            className="w-full rounded-xl border border-[#2a2a35] bg-[#1a1a24] py-2 pl-9 pr-3 text-xs text-white placeholder-[#606070] focus:border-[#7727ff] focus:outline-none"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-semibold text-[#808095]">Track:</span>
          <select
            value={trackFilter}
            onChange={(e) => setTrackFilter(e.target.value)}
            className="rounded-lg border border-[#2a2a35] bg-[#1a1a24] px-2.5 py-1 text-xs text-white focus:border-[#7727ff] focus:outline-none max-w-xs truncate"
          >
            <option value="all">All Tracks</option>
            {uniqueTracks.map((tr) => (
              <option key={tr} value={tr}>
                {tr}
              </option>
            ))}
          </select>

          <span className="text-xs font-semibold text-[#808095] ml-2">Status:</span>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="rounded-lg border border-[#2a2a35] bg-[#1a1a24] px-2.5 py-1 text-xs text-white focus:border-[#7727ff] focus:outline-none"
          >
            <option value="all">All</option>
            <option value="issued">Issued</option>
            <option value="revoked">Revoked</option>
          </select>
        </div>
      </div>

      {/* Registry Table */}
      {loading ? (
        <div className="flex h-64 items-center justify-center rounded-2xl border border-[#2a2a35] bg-[#131318]">
          <Loader2 size={24} className="animate-spin text-[#7727ff]" />
          <span className="ml-3 text-sm text-[#a0a0b0]">Loading certificate registry...</span>
        </div>
      ) : filtered.length === 0 ? (
        <div className="rounded-2xl border border-[#2a2a35] bg-[#131318] p-12 text-center">
          <Award size={44} className="mx-auto mb-3 text-[#a0a0b0] opacity-40" />
          <p className="text-base font-semibold text-white">No certificates found</p>
          <p className="mt-1 text-xs text-[#a0a0b0]">
            {searchTerm || trackFilter !== 'all' || statusFilter !== 'all'
              ? 'Try clearing filters or search keywords.'
              : 'Issue your first completion credential using the button above.'}
          </p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-[#2a2a35] bg-[#131318]">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-[#2a2a35] bg-[#16161d] text-[#808095]">
                <tr>
                  <th className="px-5 py-3.5 font-semibold">Intern / Recipient</th>
                  <th className="px-5 py-3.5 font-semibold">Credential ID & Code</th>
                  <th className="px-5 py-3.5 font-semibold">Specialization Track</th>
                  <th className="px-5 py-3.5 font-semibold">Honors Grade</th>
                  <th className="px-5 py-3.5 font-semibold">Issued Date</th>
                  <th className="px-5 py-3.5 font-semibold">Status</th>
                  <th className="px-5 py-3.5 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#2a2a35]">
                {filtered.map((cert) => {
                  const isCopied = copiedId === cert.verification_code || copiedId === cert.id
                  return (
                    <tr key={cert.id} className="transition-colors hover:bg-[#1a1a24]/50">
                      <td className="px-5 py-4">
                        <div className="font-bold text-white flex items-center gap-2">
                          <User size={13} className="text-[#a77aff]" />
                          {cert.interns?.full_name || 'Intern'}
                        </div>
                        <div className="text-[11px] text-[#808095] mt-0.5">
                          {cert.interns?.batches?.name || 'Cohort'} • {cert.interns?.batches?.programs?.title || 'Program'}
                        </div>
                      </td>

                      <td className="px-5 py-4">
                        <div className="font-mono font-semibold text-purple-300">
                          {cert.certificate_number}
                        </div>
                        <div className="text-[10px] font-mono text-[#808095] mt-0.5">
                          Code: {cert.verification_code}
                        </div>
                      </td>

                      <td className="px-5 py-4 text-[#d0ccda] max-w-xs truncate">
                        {cert.track}
                      </td>

                      <td className="px-5 py-4">
                        <span className="rounded-md border border-amber-500/30 bg-amber-500/10 px-2 py-0.5 font-semibold text-amber-300 text-[11px]">
                          {cert.grade}
                        </span>
                      </td>

                      <td className="px-5 py-4 text-[#a0a0b0]">
                        {new Date(cert.issue_date).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })}
                      </td>

                      <td className="px-5 py-4">
                        <span
                          className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase ${
                            cert.status === 'issued'
                              ? 'border border-emerald-500/30 bg-emerald-500/10 text-emerald-400'
                              : 'border border-rose-500/30 bg-rose-500/10 text-rose-400'
                          }`}
                        >
                          <span
                            className={`h-1.5 w-1.5 rounded-full ${
                              cert.status === 'issued' ? 'bg-emerald-400' : 'bg-rose-400'
                            }`}
                          />
                          {cert.status}
                        </span>
                      </td>

                      <td className="px-5 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleCopyLink(cert.verification_code)}
                            className="inline-flex items-center gap-1 rounded-lg border border-[#3a3545] bg-[#1a1722] px-2.5 py-1 text-[11px] font-medium text-[#d0ccda] hover:bg-[#252230] transition-colors"
                            title="Copy public verification link"
                          >
                            {isCopied ? (
                              <>
                                <CheckCircle2 size={12} className="text-emerald-400" />
                                <span className="text-emerald-400">Copied</span>
                              </>
                            ) : (
                              <>
                                <Copy size={12} />
                                <span>Copy Link</span>
                              </>
                            )}
                          </button>

                          <Link
                            href={`/verify/${cert.verification_code}`}
                            target="_blank"
                            className="inline-flex items-center gap-1 rounded-lg border border-purple-500/30 bg-purple-500/10 px-2.5 py-1 text-[11px] font-semibold text-purple-300 hover:bg-purple-500/20 transition-colors"
                          >
                            <ExternalLink size={12} />
                            <span>Preview</span>
                          </Link>
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

      {/* ISSUANCE MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-2xl border border-[#3a3545] bg-[#131318] p-6 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-[#2a2a35]">
              <div className="flex items-center gap-2">
                <div className="rounded-lg bg-purple-500/10 p-2 text-purple-400">
                  <Award size={18} />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">Issue Official Internship Certificate</h3>
                  <p className="text-xs text-[#a0a0b0]">Accredit an intern with a public verifiable certificate</p>
                </div>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-[#a0a0b0] hover:text-white"
              >
                <X size={18} />
              </button>
            </div>

            {newlyIssuedCert ? (
              <div className="mt-5 space-y-4">
                <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-4 text-center">
                  <CheckCircle2 size={36} className="mx-auto text-emerald-400 mb-2" />
                  <h4 className="text-sm font-bold text-emerald-300">Certificate Successfully Issued!</h4>
                  <p className="mt-1 text-xs text-[#d0ccda]">
                    Credential Number: <strong className="text-white font-mono">{newlyIssuedCert.certificate_number}</strong>
                  </p>
                  <p className="text-xs text-[#d0ccda]">
                    Verification Code: <strong className="text-emerald-400 font-mono">{newlyIssuedCert.verification_code}</strong>
                  </p>
                </div>

                <div className="p-3 bg-[#1a1a24] rounded-xl border border-[#2a2a35] text-xs">
                  <p className="text-[#a0a0b0] mb-1 font-semibold">Direct Verification URL:</p>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      readOnly
                      value={typeof window !== 'undefined' ? `${window.location.origin}/verify/${newlyIssuedCert.verification_code}` : ''}
                      className="w-full bg-[#131318] border border-[#2a2a35] rounded-lg px-2.5 py-1.5 text-xs text-purple-300 font-mono"
                    />
                    <button
                      type="button"
                      onClick={() => handleCopyLink(newlyIssuedCert.verification_code)}
                      className="px-3 py-1.5 bg-[#6417ed] text-white rounded-lg font-semibold hover:bg-[#7727ff]"
                    >
                      Copy
                    </button>
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-2">
                  <Link
                    href={`/verify/${newlyIssuedCert.verification_code}`}
                    target="_blank"
                    className="inline-flex items-center gap-1.5 rounded-xl bg-purple-600 px-4 py-2 text-xs font-bold text-white hover:bg-purple-500"
                  >
                    <ExternalLink size={14} /> View Certificate
                  </Link>
                  <button
                    onClick={() => {
                      setNewlyIssuedCert(null)
                      setIsModalOpen(false)
                    }}
                    className="rounded-xl border border-[#2a2a35] px-4 py-2 text-xs font-semibold text-[#a0a0b0] hover:text-white"
                  >
                    Done
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleIssueSubmit} className="mt-5 space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-[#a0a0b0] mb-1">
                    Select Intern *
                  </label>
                  <select
                    required
                    value={formData.internId}
                    onChange={(e) => setFormData({ ...formData, internId: e.target.value })}
                    className="w-full rounded-xl border border-[#2a2a35] bg-[#1a1a24] px-3.5 py-2.5 text-xs text-white focus:border-[#7727ff] focus:outline-none"
                  >
                    {interns.map((intern) => (
                      <option key={intern.user_id} value={intern.user_id}>
                        {intern.full_name} ({intern.teams?.name || 'Squad'})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#a0a0b0] mb-1">
                    Certificate Title
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="e.g. Certificate of Internship Excellence"
                    className="w-full rounded-xl border border-[#2a2a35] bg-[#1a1a24] px-3.5 py-2.5 text-xs text-white focus:border-[#7727ff] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#a0a0b0] mb-1">
                    Track & Specialization
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.track}
                    onChange={(e) => setFormData({ ...formData, track: e.target.value })}
                    placeholder="e.g. Full-Stack Web Development & Cloud Systems"
                    className="w-full rounded-xl border border-[#2a2a35] bg-[#1a1a24] px-3.5 py-2.5 text-xs text-white focus:border-[#7727ff] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#a0a0b0] mb-1">
                    Honors Grade
                  </label>
                  <select
                    value={formData.grade}
                    onChange={(e) => setFormData({ ...formData, grade: e.target.value })}
                    className="w-full rounded-xl border border-[#2a2a35] bg-[#1a1a24] px-3.5 py-2.5 text-xs text-white focus:border-[#7727ff] focus:outline-none"
                  >
                    <option value="Distinction (Grade A+)">Distinction (Grade A+)</option>
                    <option value="First Class with Distinction">First Class with Distinction</option>
                    <option value="Excellence (Grade A)">Excellence (Grade A)</option>
                    <option value="Merit (Grade B+)">Merit (Grade B+)</option>
                    <option value="Pass with Commendation">Pass with Commendation</option>
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-[#a0a0b0] mb-1">
                      Issue Date
                    </label>
                    <input
                      type="date"
                      required
                      value={formData.issueDate}
                      onChange={(e) => setFormData({ ...formData, issueDate: e.target.value })}
                      className="w-full rounded-xl border border-[#2a2a35] bg-[#1a1a24] px-3.5 py-2.5 text-xs text-white focus:border-[#7727ff] focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-[#a0a0b0] mb-1">
                      Completion Date
                    </label>
                    <input
                      type="date"
                      required
                      value={formData.completionDate}
                      onChange={(e) => setFormData({ ...formData, completionDate: e.target.value })}
                      className="w-full rounded-xl border border-[#2a2a35] bg-[#1a1a24] px-3.5 py-2.5 text-xs text-white focus:border-[#7727ff] focus:outline-none"
                    />
                  </div>
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
                    disabled={issuing}
                    className="rounded-xl bg-gradient-to-r from-[#7727ff] to-[#6417ed] px-5 py-2 text-xs font-bold text-white hover:brightness-110 disabled:opacity-50"
                  >
                    {issuing ? 'Issuing Credential...' : 'Sign & Issue Certificate'}
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
