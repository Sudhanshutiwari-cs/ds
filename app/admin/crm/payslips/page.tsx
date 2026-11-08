'use client'

import React, { useEffect, useState } from 'react'
import {
  AlertTriangle,
  Banknote,
  Calendar,
  CheckCircle2,
  Clock,
  Coins,
  Download,
  Eye,
  FileCheck,
  FileText,
  Filter,
  Loader2,
  Plus,
  Printer,
  Receipt,
  RefreshCw,
  Search,
  Sliders,
  User,
  Users,
  X,
} from 'lucide-react'
import {
  fetchSalaryStructures,
  setSalaryStructure,
  fetchPayslips,
  generatePayslip,
  updatePayslipStatus,
  fetchInterns,
  fetchApprovedUnpaidLeaveDays,
  SalaryStructure,
  Payslip,
  PayslipStatus,
  PayCycleType,
  Intern,
} from '@/lib/crm-supabase'

const statusStyles: Record<PayslipStatus, { bg: string; text: string; border: string }> = {
  pending: { bg: 'bg-amber-500/10', text: 'text-amber-400', border: 'border-amber-500/30' },
  processing: { bg: 'bg-blue-500/10', text: 'text-blue-400', border: 'border-blue-500/30' },
  paid: { bg: 'bg-emerald-500/10', text: 'text-emerald-400', border: 'border-emerald-500/30' },
}

export default function CrmPayslipsPage() {
  const [activeTab, setActiveTab] = useState<'payslips' | 'structures'>('payslips')
  const [loading, setLoading] = useState(true)

  // Data
  const [payslips, setPayslips] = useState<Payslip[]>([])
  const [structures, setStructures] = useState<SalaryStructure[]>([])
  const [interns, setInterns] = useState<Intern[]>([])

  // Filters
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [searchTerm, setSearchTerm] = useState('')

  // Modals
  const [isGenerateModalOpen, setIsGenerateModalOpen] = useState(false)
  const [isStructureModalOpen, setIsStructureModalOpen] = useState(false)
  const [selectedPayslipForVoucher, setSelectedPayslipForVoucher] = useState<Payslip | null>(null)
  const [saving, setSaving] = useState(false)

  // Generate Payslip Form
  const [payslipForm, setPayslipForm] = useState<{
    internId: string
    periodStart: string
    periodEnd: string
    gross: number
    deductions: number
    status: PayslipStatus
  }>({
    internId: '',
    periodStart: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().substring(0, 10),
    periodEnd: new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).toISOString().substring(0, 10),
    gross: 15000,
    deductions: 0,
    status: 'paid',
  })

  // Leave & Attendance Automated Deduction State
  const [unpaidLeaveDays, setUnpaidLeaveDays] = useState(0)
  const [checkingLeaves, setCheckingLeaves] = useState(false)

  // Structure Form
  const [structureForm, setStructureForm] = useState<{
    internId: string
    baseAmount: number
    payCycle: PayCycleType
    effectiveFrom: string
  }>({
    internId: '',
    baseAmount: 15000,
    payCycle: 'monthly',
    effectiveFrom: new Date().toISOString().substring(0, 10),
  })

  const loadData = async () => {
    setLoading(true)
    try {
      const [payslipsData, structuresData, internsData] = await Promise.all([
        fetchPayslips(),
        fetchSalaryStructures(),
        fetchInterns(),
      ])

      setPayslips(payslipsData)
      setStructures(structuresData)
      setInterns(internsData)

      if (internsData.length > 0 && !payslipForm.internId) {
        setPayslipForm((prev) => ({ ...prev, internId: internsData[0].user_id }))
        setStructureForm((prev) => ({ ...prev, internId: internsData[0].user_id }))
      }
    } catch (err) {
      console.error('Failed to load payroll data:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  // Auto-check unpaid leaves whenever intern or period changes
  useEffect(() => {
    if (payslipForm.internId && payslipForm.periodStart && payslipForm.periodEnd) {
      setCheckingLeaves(true)
      fetchApprovedUnpaidLeaveDays(payslipForm.internId, payslipForm.periodStart, payslipForm.periodEnd)
        .then((days) => setUnpaidLeaveDays(days))
        .catch(() => setUnpaidLeaveDays(0))
        .finally(() => setCheckingLeaves(false))
    } else {
      setUnpaidLeaveDays(0)
    }
  }, [payslipForm.internId, payslipForm.periodStart, payslipForm.periodEnd])

  // Auto-fill gross amount based on intern structure
  const handleInternSelectForPayslip = (internId: string) => {
    const existing = structures.find((s) => s.intern_id === internId)
    setPayslipForm((prev) => ({
      ...prev,
      internId,
      gross: existing ? Number(existing.base_amount) : prev.gross,
    }))
  }

  // Generate Payslip
  const handleGenerateSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!payslipForm.internId || !payslipForm.periodStart || !payslipForm.periodEnd) {
      alert('Please fill in all required period dates.')
      return
    }

    setSaving(true)
    try {
      const created = await generatePayslip({
        internId: payslipForm.internId,
        periodStart: payslipForm.periodStart,
        periodEnd: payslipForm.periodEnd,
        gross: Number(payslipForm.gross),
        deductions: Number(payslipForm.deductions) || 0,
        status: payslipForm.status,
      })

      setPayslips((prev) => [created, ...prev])
      setIsGenerateModalOpen(false)
      setSelectedPayslipForVoucher(created)
    } catch (err: any) {
      alert('Failed to generate payslip: ' + (err.message || err))
    } finally {
      setSaving(false)
    }
  }

  // Save Stipend Structure
  const handleStructureSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!structureForm.internId || !structureForm.baseAmount) return

    setSaving(true)
    try {
      await setSalaryStructure({
        internId: structureForm.internId,
        baseAmount: Number(structureForm.baseAmount),
        payCycle: structureForm.payCycle,
        effectiveFrom: structureForm.effectiveFrom,
      })

      setIsStructureModalOpen(false)
      await loadData()
    } catch (err: any) {
      alert('Failed to set salary structure: ' + (err.message || err))
    } finally {
      setSaving(false)
    }
  }

  // Update Status in Table
  const handleStatusChange = async (payslipId: string, newStatus: PayslipStatus) => {
    try {
      const updated = await updatePayslipStatus(payslipId, newStatus)
      setPayslips((prev) => prev.map((p) => (p.id === payslipId ? updated : p)))
    } catch (err: any) {
      alert('Failed to update status: ' + (err.message || err))
    }
  }

  // Filtered
  const filteredPayslips = payslips.filter((p) => {
    const matchesSearch =
      (p.interns?.full_name && p.interns.full_name.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (p.interns?.phone && p.interns.phone.includes(searchTerm))
    const matchesStatus = statusFilter === 'all' || p.status === statusFilter
    return matchesSearch && matchesStatus
  })

  // Quick Payroll Metrics
  const totalPaidOut = payslips
    .filter((p) => p.status === 'paid')
    .reduce((acc, curr) => acc + Number(curr.net), 0)

  const pendingDisbursals = payslips.filter((p) => p.status !== 'paid').length

  const monthlyCommitment = structures.reduce((acc, curr) => acc + Number(curr.base_amount), 0)

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col justify-between gap-4 rounded-2xl border border-[#2a2a35] bg-[#131318] p-5 sm:flex-row sm:items-center">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-2xl font-bold text-white">Stipends & Payslips Hub</h2>
            <span className="rounded-full border border-emerald-500/30 bg-emerald-500/15 px-2.5 py-0.5 text-xs font-semibold text-emerald-400">
              ₹ INR Payroll
            </span>
          </div>
          <p className="mt-1 text-sm text-[#a0a0b0]">
            Generate monthly stipend payslips, manage stipend structures, and track disbursals
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={() => setIsGenerateModalOpen(true)}
            disabled={interns.length === 0}
            className="flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-[#22c55e] to-[#16a34a] px-4 py-2 text-xs font-bold text-white shadow-lg shadow-emerald-500/20 transition-all hover:brightness-110 disabled:opacity-50"
          >
            <Plus size={15} />
            <span>Generate Payslip</span>
          </button>

          <button
            onClick={() => setIsStructureModalOpen(true)}
            disabled={interns.length === 0}
            className="flex items-center gap-1.5 rounded-xl border border-[#3a3545] bg-[#1a1a24] px-4 py-2 text-xs font-semibold text-white transition-all hover:bg-[#252532] disabled:opacity-50"
          >
            <Sliders size={14} className="text-[#a77aff]" />
            <span>Set Stipend Rate</span>
          </button>

          <button
            onClick={loadData}
            className="flex size-9 items-center justify-center rounded-xl border border-[#2a2a35] bg-[#1a1a24] text-[#a0a0b0] hover:text-white"
            title="Refresh"
          >
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
          </button>
        </div>
      </div>

      {/* Financial Metrics Cards */}
      <div className="grid gap-4 sm:grid-cols-4">
        <div className="rounded-2xl border border-[#2a2a35] bg-[#131318] p-5">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold uppercase tracking-wider text-[#a0a0b0]">Total Disbursed</p>
            <Coins size={16} className="text-emerald-400" />
          </div>
          <p className="mt-2 text-3xl font-black text-emerald-400">
            ₹{totalPaidOut.toLocaleString('en-IN')}
          </p>
        </div>

        <div className="rounded-2xl border border-[#2a2a35] bg-[#131318] p-5">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold uppercase tracking-wider text-[#a0a0b0]">Monthly Commitment</p>
            <Banknote size={16} className="text-[#a77aff]" />
          </div>
          <p className="mt-2 text-3xl font-black text-white">
            ₹{monthlyCommitment.toLocaleString('en-IN')}
          </p>
        </div>

        <div className="rounded-2xl border border-[#2a2a35] bg-[#131318] p-5">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold uppercase tracking-wider text-amber-400">Pending Payouts</p>
            <Clock size={16} className="text-amber-400" />
          </div>
          <p className="mt-2 text-3xl font-black text-amber-400">{pendingDisbursals}</p>
        </div>

        <div className="rounded-2xl border border-[#2a2a35] bg-[#131318] p-5">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold uppercase tracking-wider text-[#a0a0b0]">Issued Vouchers</p>
            <Receipt size={16} className="text-[#a77aff]" />
          </div>
          <p className="mt-2 text-3xl font-black text-white">{payslips.length}</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-[#2a2a35] gap-6 text-xs font-bold uppercase tracking-wider">
        <button
          onClick={() => setActiveTab('payslips')}
          className={`pb-3 transition-colors ${
            activeTab === 'payslips'
              ? 'border-b-2 border-emerald-400 text-emerald-400'
              : 'text-[#808095] hover:text-white'
          }`}
        >
          Payslips Register ({payslips.length})
        </button>
        <button
          onClick={() => setActiveTab('structures')}
          className={`pb-3 transition-colors ${
            activeTab === 'structures'
              ? 'border-b-2 border-[#7727ff] text-[#a77aff]'
              : 'text-[#808095] hover:text-white'
          }`}
        >
          Intern Stipend Rates ({structures.length})
        </button>
      </div>

      {/* TAB 1: PAYSLIPS REGISTER */}
      {activeTab === 'payslips' && (
        <div className="space-y-4">
          <div className="flex flex-col gap-3 rounded-2xl border border-[#2a2a35] bg-[#131318] p-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="relative flex-1 sm:max-w-xs">
              <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#a0a0b0]" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by intern name..."
                className="w-full rounded-xl border border-[#2a2a35] bg-[#1a1a24] py-2 pl-9 pr-3 text-xs text-white placeholder-[#606070] focus:border-emerald-500 focus:outline-none"
              />
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-semibold text-[#808095]">Status:</span>
              {(['all', 'paid', 'pending', 'processing'] as const).map((s) => (
                <button
                  key={s}
                  onClick={() => setStatusFilter(s)}
                  className={`rounded-lg px-2.5 py-1 text-xs font-medium capitalize transition-all ${
                    statusFilter === s
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                      : 'border border-[#2a2a35] bg-[#1a1a24] text-[#a0a0b0] hover:text-white'
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          {loading ? (
            <div className="flex h-64 items-center justify-center rounded-2xl border border-[#2a2a35] bg-[#131318]">
              <Loader2 size={24} className="animate-spin text-emerald-400" />
              <span className="ml-3 text-sm text-[#a0a0b0]">Loading payslips...</span>
            </div>
          ) : filteredPayslips.length === 0 ? (
            <div className="rounded-2xl border border-[#2a2a35] bg-[#131318] p-12 text-center">
              <Receipt size={44} className="mx-auto mb-3 text-[#a0a0b0] opacity-40" />
              <h3 className="text-base font-semibold text-white">No Payslips Issued Yet</h3>
              <p className="mt-1 text-xs text-[#a0a0b0]">
                Generate your first monthly stipend payslip for active interns.
              </p>
              <button
                onClick={() => setIsGenerateModalOpen(true)}
                disabled={interns.length === 0}
                className="mt-5 inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#22c55e] to-[#16a34a] px-4 py-2 text-xs font-bold text-white hover:brightness-110 disabled:opacity-50"
              >
                <Plus size={15} /> Generate First Payslip
              </button>
            </div>
          ) : (
            <div className="overflow-hidden rounded-2xl border border-[#2a2a35] bg-[#131318]">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="border-b border-[#2a2a35] bg-[#16161d] text-[#808095]">
                    <tr>
                      <th className="px-5 py-3.5 font-semibold">Intern</th>
                      <th className="px-5 py-3.5 font-semibold">Pay Period</th>
                      <th className="px-5 py-3.5 font-semibold">Gross</th>
                      <th className="px-5 py-3.5 font-semibold">Deductions</th>
                      <th className="px-5 py-3.5 font-semibold">Net Payout</th>
                      <th className="px-5 py-3.5 font-semibold">Status</th>
                      <th className="px-5 py-3.5 font-semibold text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#2a2a35]">
                    {filteredPayslips.map((slip) => {
                      const style = statusStyles[slip.status] || statusStyles.pending

                      return (
                        <tr key={slip.id} className="transition-colors hover:bg-[#1a1a24]/50">
                          <td className="px-5 py-4">
                            <span className="font-bold text-white">{slip.interns?.full_name || 'Intern'}</span>
                            {slip.interns?.phone && (
                              <p className="text-[11px] text-[#808095] mt-0.5">{slip.interns.phone}</p>
                            )}
                          </td>

                          <td className="px-5 py-4 text-[#d0ccda]">
                            {new Date(slip.period_start).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                            })}{' '}
                            -{' '}
                            {new Date(slip.period_end).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric',
                            })}
                          </td>

                          <td className="px-5 py-4 text-[#a0a0b0]">
                            ₹{Number(slip.gross).toLocaleString('en-IN')}
                          </td>

                          <td className="px-5 py-4 text-rose-400">
                            -₹{Number(slip.deductions).toLocaleString('en-IN')}
                          </td>

                          <td className="px-5 py-4">
                            <span className="text-sm font-bold text-emerald-400">
                              ₹{Number(slip.net).toLocaleString('en-IN')}
                            </span>
                          </td>

                          <td className="px-5 py-4">
                            <span
                              className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-[10px] font-bold capitalize ${style.bg} ${style.text} ${style.border}`}
                            >
                              {slip.status}
                            </span>
                          </td>

                          <td className="px-5 py-4 text-right">
                            <div className="flex items-center justify-end gap-2">
                              {slip.status !== 'paid' && (
                                <button
                                  onClick={() => handleStatusChange(slip.id, 'paid')}
                                  className="rounded-lg bg-emerald-500/15 border border-emerald-500/30 px-2.5 py-1 text-[11px] font-bold text-emerald-300 hover:bg-emerald-500/25"
                                >
                                  Mark Paid
                                </button>
                              )}

                              <button
                                onClick={() => setSelectedPayslipForVoucher(slip)}
                                className="inline-flex items-center gap-1 rounded-lg border border-[#3a3545] bg-[#1a1722] px-2.5 py-1 text-[11px] font-semibold text-[#a77aff] hover:bg-[#252230]"
                              >
                                <Eye size={12} /> Voucher
                              </button>
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
        </div>
      )}

      {/* TAB 2: STIPEND STRUCTURES */}
      {activeTab === 'structures' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center bg-[#131318] p-4 rounded-2xl border border-[#2a2a35]">
            <p className="text-xs text-[#a0a0b0]">
              Base stipend rates configured for interns. These rates auto-fill when generating monthly payslips.
            </p>
            <button
              onClick={() => setIsStructureModalOpen(true)}
              className="flex items-center gap-1.5 rounded-xl bg-[#6417ed] px-4 py-2 text-xs font-bold text-white hover:bg-[#7727ff]"
            >
              <Plus size={14} /> Set Intern Stipend
            </button>
          </div>

          <div className="overflow-hidden rounded-2xl border border-[#2a2a35] bg-[#131318]">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-[#2a2a35] bg-[#16161d] text-[#808095]">
                <tr>
                  <th className="px-5 py-3.5 font-semibold">Intern</th>
                  <th className="px-5 py-3.5 font-semibold">Base Stipend Amount</th>
                  <th className="px-5 py-3.5 font-semibold">Pay Cycle</th>
                  <th className="px-5 py-3.5 font-semibold">Effective Date</th>
                  <th className="px-5 py-3.5 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#2a2a35]">
                {structures.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="p-8 text-center text-[#808095]">
                      No stipend structures configured. Click "Set Intern Stipend" to configure.
                    </td>
                  </tr>
                ) : (
                  structures.map((st) => (
                    <tr key={st.id} className="transition-colors hover:bg-[#1a1a24]/50">
                      <td className="px-5 py-4 font-bold text-white">
                        {st.interns?.full_name || 'Intern'}
                      </td>
                      <td className="px-5 py-4 text-emerald-400 font-bold text-sm">
                        ₹{Number(st.base_amount).toLocaleString('en-IN')}
                      </td>
                      <td className="px-5 py-4 text-[#a0a0b0] capitalize">{st.pay_cycle}</td>
                      <td className="px-5 py-4 text-[#808095]">{st.effective_from}</td>
                      <td className="px-5 py-4 text-right">
                        <button
                          onClick={() => {
                            setStructureForm({
                              internId: st.intern_id,
                              baseAmount: Number(st.base_amount),
                              payCycle: st.pay_cycle,
                              effectiveFrom: st.effective_from,
                            })
                            setIsStructureModalOpen(true)
                          }}
                          className="rounded-lg border border-[#3a3545] bg-[#1a1722] px-3 py-1 text-xs font-semibold text-[#a77aff] hover:bg-[#252230]"
                        >
                          Edit Rate
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* MODAL 1: GENERATE PAYSLIP */}
      {isGenerateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl border border-[#3a3545] bg-[#131318] p-6 shadow-2xl">
            <div className="flex items-center justify-between pb-4 border-b border-[#2a2a35]">
              <h3 className="text-base font-bold text-white">Generate Intern Payslip</h3>
              <button onClick={() => setIsGenerateModalOpen(false)} className="text-[#a0a0b0] hover:text-white">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleGenerateSubmit} className="mt-5 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[#a0a0b0] mb-1">Select Intern *</label>
                <select
                  required
                  value={payslipForm.internId}
                  onChange={(e) => handleInternSelectForPayslip(e.target.value)}
                  className="w-full rounded-xl border border-[#2a2a35] bg-[#1a1a24] px-3.5 py-2.5 text-xs text-white focus:border-emerald-500 focus:outline-none"
                >
                  {interns.map((intern) => (
                    <option key={intern.user_id} value={intern.user_id}>
                      {intern.full_name} ({intern.teams?.name || 'Squad'})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[#a0a0b0] mb-1">Period Start *</label>
                  <input
                    type="date"
                    required
                    value={payslipForm.periodStart}
                    onChange={(e) => setPayslipForm({ ...payslipForm, periodStart: e.target.value })}
                    className="w-full rounded-xl border border-[#2a2a35] bg-[#1a1a24] px-3.5 py-2.5 text-xs text-white focus:border-emerald-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#a0a0b0] mb-1">Period End *</label>
                  <input
                    type="date"
                    required
                    value={payslipForm.periodEnd}
                    onChange={(e) => setPayslipForm({ ...payslipForm, periodEnd: e.target.value })}
                    className="w-full rounded-xl border border-[#2a2a35] bg-[#1a1a24] px-3.5 py-2.5 text-xs text-white focus:border-emerald-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[#a0a0b0] mb-1">Gross Stipend (₹) *</label>
                  <input
                    type="number"
                    required
                    value={payslipForm.gross}
                    onChange={(e) => setPayslipForm({ ...payslipForm, gross: Number(e.target.value) })}
                    className="w-full rounded-xl border border-[#2a2a35] bg-[#1a1a24] px-3.5 py-2.5 text-xs text-white focus:border-emerald-500 focus:outline-none"
                  />
                </div>
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-xs font-semibold text-[#a0a0b0]">Deductions (₹)</label>
                    {checkingLeaves && (
                      <span className="text-[10px] text-[#a0a0b0] flex items-center gap-1">
                        <Loader2 size={10} className="animate-spin" /> Leaves...
                      </span>
                    )}
                  </div>
                  <input
                    type="number"
                    value={payslipForm.deductions}
                    onChange={(e) => setPayslipForm({ ...payslipForm, deductions: Number(e.target.value) })}
                    className="w-full rounded-xl border border-[#2a2a35] bg-[#1a1a24] px-3.5 py-2.5 text-xs text-white focus:border-emerald-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* Unpaid Leave Auto-Deduction Notification */}
              {unpaidLeaveDays > 0 && (
                <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-3.5 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-amber-300 flex items-center gap-1.5">
                      <AlertTriangle size={14} className="text-amber-400" />
                      Attendance Alert: {unpaidLeaveDays} Unpaid Leave Day(s)
                    </span>
                    <span className="text-xs font-mono font-bold text-amber-400">
                      ₹{Math.round((payslipForm.gross / 30) * unpaidLeaveDays).toLocaleString('en-IN')}
                    </span>
                  </div>
                  <p className="text-[11px] text-[#d0ccda] leading-relaxed">
                    Intern took {unpaidLeaveDays} approved unpaid leave day(s) during this cycle. Recommended pro-rated deduction is ₹{Math.round((payslipForm.gross / 30) * unpaidLeaveDays).toLocaleString('en-IN')}.
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      const rec = Math.round((payslipForm.gross / 30) * unpaidLeaveDays)
                      setPayslipForm((prev) => ({ ...prev, deductions: rec }))
                    }}
                    className="w-full text-center rounded-lg bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 py-1.5 text-xs font-semibold text-amber-200 transition-colors"
                  >
                    Apply Auto-Deduction (-₹{Math.round((payslipForm.gross / 30) * unpaidLeaveDays).toLocaleString('en-IN')})
                  </button>
                </div>
              )}

              {/* Net Payout Preview */}
              <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-3.5 flex items-center justify-between">
                <span className="text-xs font-semibold text-emerald-400">Net Disbursal Amount:</span>
                <span className="text-base font-black text-emerald-300">
                  ₹{Math.max(0, Number(payslipForm.gross) - Number(payslipForm.deductions)).toLocaleString('en-IN')}
                </span>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#a0a0b0] mb-1">Disbursal Status</label>
                <select
                  value={payslipForm.status}
                  onChange={(e) => setPayslipForm({ ...payslipForm, status: e.target.value as PayslipStatus })}
                  className="w-full rounded-xl border border-[#2a2a35] bg-[#1a1a24] px-3.5 py-2.5 text-xs text-white focus:border-emerald-500 focus:outline-none"
                >
                  <option value="paid">Paid (Disbursed)</option>
                  <option value="processing">Processing</option>
                  <option value="pending">Pending Approval</option>
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setIsGenerateModalOpen(false)}
                  className="rounded-xl border border-[#2a2a35] px-4 py-2 text-xs font-semibold text-[#a0a0b0] hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="rounded-xl bg-gradient-to-r from-[#22c55e] to-[#16a34a] px-5 py-2 text-xs font-bold text-white hover:brightness-110 disabled:opacity-50"
                >
                  {saving ? 'Generating...' : 'Issue Payslip'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: CONFIGURE STIPEND RATE */}
      {isStructureModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl border border-[#3a3545] bg-[#131318] p-6 shadow-2xl">
            <div className="flex items-center justify-between pb-4 border-b border-[#2a2a35]">
              <h3 className="text-base font-bold text-white">Configure Intern Stipend Rate</h3>
              <button onClick={() => setIsStructureModalOpen(false)} className="text-[#a0a0b0] hover:text-white">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleStructureSubmit} className="mt-5 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[#a0a0b0] mb-1">Select Intern *</label>
                <select
                  required
                  value={structureForm.internId}
                  onChange={(e) => setStructureForm({ ...structureForm, internId: e.target.value })}
                  className="w-full rounded-xl border border-[#2a2a35] bg-[#1a1a24] px-3.5 py-2.5 text-xs text-white focus:border-[#7727ff] focus:outline-none"
                >
                  {interns.map((intern) => (
                    <option key={intern.user_id} value={intern.user_id}>
                      {intern.full_name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#a0a0b0] mb-1">Base Stipend Amount (₹) *</label>
                <input
                  type="number"
                  required
                  value={structureForm.baseAmount}
                  onChange={(e) => setStructureForm({ ...structureForm, baseAmount: Number(e.target.value) })}
                  className="w-full rounded-xl border border-[#2a2a35] bg-[#1a1a24] px-3.5 py-2.5 text-xs text-white focus:border-[#7727ff] focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[#a0a0b0] mb-1">Pay Cycle</label>
                  <select
                    value={structureForm.payCycle}
                    onChange={(e) => setStructureForm({ ...structureForm, payCycle: e.target.value as PayCycleType })}
                    className="w-full rounded-xl border border-[#2a2a35] bg-[#1a1a24] px-3.5 py-2.5 text-xs text-white focus:border-[#7727ff] focus:outline-none"
                  >
                    <option value="monthly">Monthly</option>
                    <option value="biweekly">Bi-weekly</option>
                    <option value="weekly">Weekly</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#a0a0b0] mb-1">Effective Date</label>
                  <input
                    type="date"
                    required
                    value={structureForm.effectiveFrom}
                    onChange={(e) => setStructureForm({ ...structureForm, effectiveFrom: e.target.value })}
                    className="w-full rounded-xl border border-[#2a2a35] bg-[#1a1a24] px-3.5 py-2.5 text-xs text-white focus:border-[#7727ff] focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setIsStructureModalOpen(false)}
                  className="rounded-xl border border-[#2a2a35] px-4 py-2 text-xs font-semibold text-[#a0a0b0] hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="rounded-xl bg-[#6417ed] px-5 py-2 text-xs font-bold text-white hover:bg-[#7727ff] disabled:opacity-50"
                >
                  {saving ? 'Saving...' : 'Save Rate'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: DIGITAL PAYSLIP VOUCHER (PRINTABLE) */}
      {selectedPayslipForVoucher && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-3xl border border-[#3a3545] bg-[#111015] p-6 sm:p-8 shadow-2xl">
            <div className="flex items-center justify-between pb-4 border-b border-[#22222d]">
              <div className="flex items-center gap-2">
                <span className="text-xl font-black">
                  <span className="text-[#7727ff]">DS</span>Softwares<span className="text-[#7727ff]">.</span>
                </span>
                <span className="rounded-md border border-[#7727ff]/40 bg-[#7727ff]/20 px-2 py-0.5 text-[10px] font-bold text-[#c8b4ff]">
                  Official Stipend Voucher
                </span>
              </div>
              <button
                onClick={() => setSelectedPayslipForVoucher(null)}
                className="text-[#a0a0b0] hover:text-white"
              >
                <X size={18} />
              </button>
            </div>

            {/* Voucher Body */}
            <div className="mt-6 space-y-5 text-xs">
              <div className="flex justify-between items-start bg-[#181622] p-4 rounded-2xl border border-[#2b2735]">
                <div>
                  <p className="text-[10px] uppercase font-bold text-[#808095]">Paid To</p>
                  <p className="text-sm font-bold text-white mt-0.5">
                    {selectedPayslipForVoucher.interns?.full_name || 'Intern'}
                  </p>
                  <p className="text-[11px] text-[#8e8a99] mt-0.5">
                    ID: {selectedPayslipForVoucher.intern_id.substring(0, 13)}...
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-[10px] uppercase font-bold text-[#808095]">Disbursal Status</p>
                  <span className="mt-1 inline-flex items-center rounded-full bg-emerald-500/20 px-2.5 py-0.5 text-[11px] font-bold text-emerald-300">
                    {selectedPayslipForVoucher.status.toUpperCase()}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 text-xs">
                <div>
                  <span className="text-[#808095] block">Pay Period:</span>
                  <span className="font-semibold text-white">
                    {selectedPayslipForVoucher.period_start} to {selectedPayslipForVoucher.period_end}
                  </span>
                </div>
                <div>
                  <span className="text-[#808095] block">Payment Date:</span>
                  <span className="font-semibold text-white">
                    {selectedPayslipForVoucher.paid_at
                      ? new Date(selectedPayslipForVoucher.paid_at).toLocaleDateString()
                      : 'Pending'}
                  </span>
                </div>
              </div>

              {/* Breakdown Table */}
              <div className="rounded-xl border border-[#2a2a35] overflow-hidden">
                <div className="flex justify-between p-3 bg-[#181620] text-[#a0a0b0] border-b border-[#2a2a35]">
                  <span>Item Description</span>
                  <span>Amount (INR)</span>
                </div>
                <div className="divide-y divide-[#2a2a35]">
                  <div className="flex justify-between p-3 text-white">
                    <span>Base Internship Stipend</span>
                    <span>₹{Number(selectedPayslipForVoucher.gross).toLocaleString('en-IN')}</span>
                  </div>
                  <div className="flex justify-between p-3 text-rose-400">
                    <span>Statutory / Leave Deductions</span>
                    <span>-₹{Number(selectedPayslipForVoucher.deductions).toLocaleString('en-IN')}</span>
                  </div>
                  <div className="flex justify-between p-3.5 bg-[#16141e] font-black text-sm text-emerald-400">
                    <span>Net Disbursed Payout</span>
                    <span>₹{Number(selectedPayslipForVoucher.net).toLocaleString('en-IN')}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Voucher Footer */}
            <div className="mt-6 flex justify-between items-center pt-4 border-t border-[#22222d]">
              <span className="text-[10px] text-[#606070]">
                DS Softwares Agency · Verified Digital Payslip
              </span>
              <button
                onClick={() => window.print()}
                className="flex items-center gap-1.5 rounded-xl bg-white px-4 py-2 text-xs font-bold text-black hover:bg-slate-200"
              >
                <Printer size={13} /> Print Voucher
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
