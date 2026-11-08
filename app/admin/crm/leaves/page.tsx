'use client'

import React, { useEffect, useState } from 'react'
import {
  CalendarRange,
  Check,
  CheckCircle2,
  Filter,
  Loader2,
  RefreshCw,
  Search,
  User,
  X,
  XCircle,
} from 'lucide-react'
import { fetchLeaves, updateLeaveStatus, LeaveRequest, LeaveStatus } from '@/lib/crm-supabase'

const leaveStatusStyles: Record<string, { bg: string; text: string; border: string }> = {
  pending: { bg: 'bg-amber-500/10', text: 'text-amber-400', border: 'border-amber-500/30' },
  approved: { bg: 'bg-emerald-500/10', text: 'text-emerald-400', border: 'border-emerald-500/30' },
  rejected: { bg: 'bg-rose-500/10', text: 'text-rose-400', border: 'border-rose-500/30' },
}

export default function CrmLeavesPage() {
  const [leaves, setLeaves] = useState<LeaveRequest[]>([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [searchTerm, setSearchTerm] = useState('')

  // Action state
  const [reviewingId, setReviewingId] = useState<string | null>(null)
  const [managerNote, setManagerNote] = useState('')
  const [targetStatus, setTargetStatus] = useState<LeaveStatus>('approved')
  const [saving, setSaving] = useState(false)

  const loadData = async () => {
    setLoading(true)
    try {
      const data = await fetchLeaves()
      setLeaves(data)
    } catch (err) {
      console.error('Failed to load leaves:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  const handleDecision = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!reviewingId) return
    setSaving(true)
    try {
      const updated = await updateLeaveStatus(reviewingId, targetStatus, managerNote)
      setLeaves((prev) =>
        prev.map((l) => (l.id === updated.id ? { ...l, status: updated.status, manager_notes: updated.manager_notes } : l))
      )
      setReviewingId(null)
      setManagerNote('')
    } catch (err: any) {
      alert(`Decision error: ${err.message}`)
    } finally {
      setSaving(false)
    }
  }

  const openDecisionModal = (id: string, status: LeaveStatus) => {
    setReviewingId(id)
    setTargetStatus(status)
    setManagerNote('')
  }

  const filtered = leaves.filter((l) => {
    if (statusFilter !== 'all' && l.status !== statusFilter) return false
    if (searchTerm) {
      const q = searchTerm.toLowerCase()
      const name = l.interns?.full_name?.toLowerCase() || ''
      const reason = l.reason.toLowerCase()
      if (!name.includes(q) && !reason.includes(q)) return false
    }
    return true
  })

  const pendingCount = leaves.filter((l) => l.status === 'pending').length
  const approvedUnpaidDays = leaves
    .filter((l) => l.status === 'approved' && l.leave_type === 'unpaid')
    .reduce((acc, curr) => acc + curr.days_count, 0)

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-white sm:text-2xl flex items-center gap-2.5">
            <CalendarRange size={24} className="text-[#7727ff]" />
            Leave & Attendance Management
          </h1>
          <p className="mt-1 text-xs text-[#a0a0b0]">
            Review intern absence requests. Approved unpaid leaves automatically calculate stipend deduction adjustments.
          </p>
        </div>

        <button
          onClick={loadData}
          disabled={loading}
          className="flex items-center gap-1.5 rounded-xl border border-[#2b2735] bg-[#16141c] px-3.5 py-2 text-xs font-semibold text-[#c8b4ff] hover:bg-[#6417ed] hover:text-white transition-all shadow-sm shrink-0"
        >
          <RefreshCw size={13} className={loading ? 'animate-spin' : ''} />
          <span>Refresh</span>
        </button>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-[#2b2735] bg-[#111015] p-5">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-[#8e8a99]">Pending Requests</span>
          <p className={`mt-2 text-2xl font-black ${pendingCount > 0 ? 'text-amber-400' : 'text-emerald-400'}`}>
            {pendingCount}
          </p>
          <p className="mt-1 text-[11px] text-[#8e8a99]">Awaiting squad manager approval</p>
        </div>

        <div className="rounded-2xl border border-[#2b2735] bg-[#111015] p-5">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-[#8e8a99]">Approved Unpaid Leaves</span>
          <p className="mt-2 text-2xl font-black text-rose-400">{approvedUnpaidDays} Days</p>
          <p className="mt-1 text-[11px] text-[#8e8a99]">Auto-deducted from monthly payslips</p>
        </div>

        <div className="rounded-2xl border border-[#2b2735] bg-[#111015] p-5">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-[#8e8a99]">Total Records</span>
          <p className="mt-2 text-2xl font-black text-[#c8b4ff]">{leaves.length}</p>
          <p className="mt-1 text-[11px] text-[#8e8a99]">Attendance records this cohort</p>
        </div>
      </div>

      {/* Controls */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={15} className="absolute left-3.5 top-3 text-[#8e8a99]" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by intern name or leave reason..."
            className="w-full rounded-xl border border-[#2b2735] bg-[#16141c] pl-10 pr-4 py-2 text-xs text-white placeholder-[#606075] focus:border-[#7727ff] focus:outline-none"
          />
        </div>

        <div className="flex gap-1.5 overflow-x-auto text-xs">
          {['all', 'pending', 'approved', 'rejected'].map((tab) => (
            <button
              key={tab}
              onClick={() => setStatusFilter(tab)}
              className={`rounded-xl px-3.5 py-2 font-semibold capitalize transition-all ${
                statusFilter === tab
                  ? 'bg-[#6417ed] text-white shadow-sm'
                  : 'border border-[#2b2735] bg-[#16141c] text-[#8e8a99] hover:text-white'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Leave Table */}
      <div className="rounded-2xl border border-[#2a2a35] bg-[#111015] p-6 shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex h-64 items-center justify-center">
            <Loader2 size={32} className="animate-spin text-[#7727ff]" />
            <span className="ml-3 text-xs text-[#a0a0b0]">Loading leave requests...</span>
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-12 text-center text-xs text-[#8e8a99]">No leave requests match your filter.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-[#211d2b] text-[11px] uppercase tracking-wider text-[#8e8a99]">
                  <th className="pb-3 font-semibold">Intern</th>
                  <th className="pb-3 font-semibold">Dates</th>
                  <th className="pb-3 font-semibold">Days</th>
                  <th className="pb-3 font-semibold">Type</th>
                  <th className="pb-3 font-semibold">Reason</th>
                  <th className="pb-3 font-semibold">Status</th>
                  <th className="pb-3 text-right font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1e1c26]">
                {filtered.map((l) => {
                  const style = leaveStatusStyles[l.status] || leaveStatusStyles.pending
                  return (
                    <tr key={l.id} className="hover:bg-[#16141c]">
                      <td className="py-3.5 font-bold text-white flex items-center gap-2">
                        <span className="flex size-6 items-center justify-center rounded-full bg-[#7727ff] text-[10px] text-white font-bold">
                          {l.interns?.full_name?.[0] || 'I'}
                        </span>
                        {l.interns?.full_name || 'Intern'}
                      </td>
                      <td className="py-3.5 text-[#d0ccda]">
                        {l.start_date} to {l.end_date}
                      </td>
                      <td className="py-3.5 font-bold text-white">{l.days_count}</td>
                      <td className="py-3.5 uppercase text-[10px] font-bold text-[#a77aff]">{l.leave_type}</td>
                      <td className="py-3.5 text-[#a0a0b0] max-w-xs truncate" title={l.reason}>
                        {l.reason}
                      </td>
                      <td className="py-3.5">
                        <span className={`inline-flex items-center rounded-md border px-2 py-0.5 text-[10px] font-bold uppercase ${style.bg} ${style.text} ${style.border}`}>
                          {l.status}
                        </span>
                      </td>
                      <td className="py-3.5 text-right">
                        {l.status === 'pending' ? (
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => openDecisionModal(l.id, 'approved')}
                              className="rounded-lg bg-emerald-500/20 border border-emerald-500/30 px-2.5 py-1 text-[11px] font-bold text-emerald-300 hover:bg-emerald-500/30"
                            >
                              Approve
                            </button>
                            <button
                              onClick={() => openDecisionModal(l.id, 'rejected')}
                              className="rounded-lg bg-rose-500/20 border border-rose-500/30 px-2.5 py-1 text-[11px] font-bold text-rose-300 hover:bg-rose-500/30"
                            >
                              Reject
                            </button>
                          </div>
                        ) : (
                          <span className="text-[11px] text-[#606070] italic">Decided</span>
                        )}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* DECISION MODAL */}
      {reviewingId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-3xl border border-[#302c3d] bg-[#111015] p-6 shadow-2xl space-y-4">
            <div className="flex justify-between items-center pb-3 border-b border-[#211d2c]">
              <h3 className="text-sm font-bold text-white">
                Confirm Leave {targetStatus === 'approved' ? 'Approval' : 'Rejection'}
              </h3>
              <button onClick={() => setReviewingId(null)} className="text-[#a0a0b0] hover:text-white">
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleDecision} className="space-y-4 text-xs">
              <div>
                <label className="block text-[#a0a0b0] mb-1 font-semibold">Manager Feedback / Remarks</label>
                <textarea
                  rows={3}
                  value={managerNote}
                  onChange={(e) => setManagerNote(e.target.value)}
                  placeholder="e.g. Approved. Please ensure sprint handoff is communicated to squad teammates."
                  className="w-full rounded-xl border border-[#2a2a35] bg-[#181622] p-3 text-xs text-white focus:border-[#7727ff] focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setReviewingId(null)}
                  className="rounded-xl border border-[#2a2a35] px-4 py-2 text-[#a0a0b0]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className={`rounded-xl px-5 py-2 font-bold text-white ${
                    targetStatus === 'approved' ? 'bg-emerald-600 hover:bg-emerald-500' : 'bg-rose-600 hover:bg-rose-500'
                  }`}
                >
                  {saving ? 'Processing...' : targetStatus === 'approved' ? 'Confirm Approval' : 'Confirm Rejection'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
