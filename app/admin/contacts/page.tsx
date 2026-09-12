'use client'

import React, { useState } from 'react'
import {
  Inbox,
  Search,
  Download,
  Mail,
  Phone,
  Calendar,
  Building2,
  Code2,
  TrendingUp,
  Copy,
  Check,
  Edit,
  Trash2
} from 'lucide-react'
import { useAdmin } from '@/components/admin/AdminContext'
import { contactStatuses, exportContactsToCSV } from '@/components/admin/types'

export default function AdminContactsPage() {
  const { contacts, openEditModal, handleDelete, handleStatusChange } = useAdmin()

  const [filter, setFilter] = useState('ALL')
  const [searchTerm, setSearchTerm] = useState('')
  const [copiedId, setCopiedId] = useState<string | null>(null)

  const handleCopyEmail = (contact: any) => {
    if (!contact.email) return
    navigator.clipboard.writeText(contact.email)
    setCopiedId(contact.id)
    setTimeout(() => setCopiedId(null), 2000)
  }

  const filteredContacts = contacts.filter((contact: any) => {
    const matchesFilter = filter === 'ALL' || contact.status === filter
    if (!matchesFilter) return false
    if (!searchTerm) return true
    const term = searchTerm.toLowerCase()
    return (
      contact.name?.toLowerCase().includes(term) ||
      contact.email?.toLowerCase().includes(term) ||
      contact.company?.toLowerCase().includes(term) ||
      contact.project_type?.toLowerCase().includes(term) ||
      contact.budget_range?.toLowerCase().includes(term) ||
      contact.message?.toLowerCase().includes(term) ||
      contact.phone?.toLowerCase().includes(term)
    )
  })

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'new':
      case 'NEW':
        return 'bg-blue-500/20 text-blue-400 border-blue-500/30'
      case 'contacted':
      case 'CONTACTED':
        return 'bg-purple-500/20 text-purple-400 border-purple-500/30'
      case 'qualified':
      case 'IN_DISCUSSION':
        return 'bg-amber-500/20 text-amber-400 border-amber-500/30'
      case 'proposal_sent':
      case 'PROPOSAL_SENT':
        return 'bg-indigo-500/20 text-indigo-400 border-indigo-500/30'
      case 'won':
      case 'CLOSED_WON':
        return 'bg-green-500/20 text-green-400 border-green-500/30'
      case 'closed':
      case 'CLOSED_LOST':
        return 'bg-red-500/20 text-red-400 border-red-500/30'
      default:
        return 'bg-gray-500/20 text-gray-400 border-gray-500/30'
    }
  }

  return (
    <div className="space-y-6">
      {/* Top Header & Search Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#131318] p-5 rounded-2xl border border-[#2a2a35]">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-2xl font-bold text-white">Client Inquiries & Leads</h2>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#7727ff]/20 text-[#a77aff] border border-[#7727ff]/30">
              {contacts.length} Total
            </span>
          </div>
          <p className="text-sm text-[#a0a0b0] mt-1">
            Track incoming project inquiries, review client requirements, and manage lead pipeline
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="relative min-w-[220px]">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#a0a0b0]" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search leads, company, budget..."
              className="w-full pl-9 pr-3 py-2 bg-[#1a1a24] border border-[#2a2a35] rounded-xl text-sm focus:outline-none focus:border-[#7727ff] text-white placeholder-[#606070]"
            />
          </div>

          <button
            onClick={() => exportContactsToCSV(filteredContacts)}
            disabled={filteredContacts.length === 0}
            className="flex items-center gap-2 px-4 py-2 bg-[#1a1a24] hover:bg-[#252532] border border-[#2a2a35] rounded-xl text-xs font-medium text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed hover:border-[#7727ff]/50"
            title="Export filtered inquiries to CSV"
          >
            <Download size={14} className="text-[#a77aff]" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-thin">
        <button
          onClick={() => setFilter('ALL')}
          className={`px-4 py-2 rounded-xl text-xs font-medium transition-all whitespace-nowrap ${
            filter === 'ALL'
              ? 'bg-gradient-to-r from-[#7727ff] to-[#6417ed] text-white shadow-md shadow-purple-500/20'
              : 'bg-[#131318] text-[#a0a0b0] hover:bg-[#1a1a24] hover:text-white border border-[#2a2a35]'
          }`}
        >
          All ({contacts.length})
        </button>
        {contactStatuses.map((status) => {
          const count = contacts.filter((c: any) => c.status === status).length
          return (
            <button
              key={status}
              onClick={() => setFilter(status)}
              className={`px-4 py-2 rounded-xl text-xs font-medium transition-all whitespace-nowrap flex items-center gap-1.5 ${
                filter === status
                  ? 'bg-gradient-to-r from-[#7727ff] to-[#6417ed] text-white shadow-md shadow-purple-500/20'
                  : 'bg-[#131318] text-[#a0a0b0] hover:bg-[#1a1a24] hover:text-white border border-[#2a2a35]'
              }`}
            >
              <span className="capitalize">{status.replace('_', ' ')}</span>
              <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${filter === status ? 'bg-white/20 text-white' : 'bg-[#2a2a35] text-[#808090]'}`}>
                {count}
              </span>
            </button>
          )
        })}
      </div>

      {/* Contacts List */}
      {contacts.length === 0 ? (
        <div className="bg-[#131318] rounded-2xl border border-[#2a2a35] p-12 text-center">
          <Inbox size={48} className="mx-auto text-[#a0a0b0] mb-4 opacity-50" />
          <p className="text-lg font-medium text-white">No contact inquiries yet</p>
          <p className="text-sm text-[#a0a0b0] mt-1">
            Inquiries submitted from your website contact form will appear here in real time.
          </p>
        </div>
      ) : filteredContacts.length === 0 ? (
        <div className="bg-[#131318] rounded-2xl border border-[#2a2a35] p-10 text-center text-[#a0a0b0]">
          <Search size={32} className="mx-auto mb-2 opacity-50" />
          <p>No inquiries match your current filter and search criteria</p>
          <button
            onClick={() => {
              setFilter('ALL')
              setSearchTerm('')
            }}
            className="mt-3 text-xs text-[#a77aff] hover:underline"
          >
            Reset filters
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredContacts.map((contact: any) => {
            const isCopied = copiedId === contact.id
            return (
              <div
                key={contact.id}
                className="bg-[#131318] rounded-2xl border border-[#2a2a35] p-6 hover:border-[#7727ff]/50 transition-all group"
              >
                <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-5">
                  <div className="flex-1 min-w-0">
                    {/* Header Row */}
                    <div className="flex flex-wrap items-center gap-3 mb-3">
                      <h3 className="font-semibold text-lg text-white group-hover:text-[#a77aff] transition-colors">
                        {contact.name}
                      </h3>
                      {!contact.is_read && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-blue-500/20 text-blue-400 border border-blue-500/30 flex items-center gap-1">
                          <span className="size-1.5 rounded-full bg-blue-400 animate-pulse" /> New Inquiry
                        </span>
                      )}
                      <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusBadge(contact.status)}`}>
                        {contact.status?.replace('_', ' ') || 'new'}
                      </span>
                    </div>

                    {/* Metadata Badges */}
                    <div className="flex flex-wrap items-center gap-3 text-xs text-[#a0a0b0] mb-4">
                      {contact.company && (
                        <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#1a1a24] border border-[#2a2a35] text-white">
                          <Building2 size={13} className="text-[#a77aff]" />
                          <span>{contact.company}</span>
                        </span>
                      )}
                      {contact.project_type && (
                        <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#1a1a24] border border-[#2a2a35] text-[#a77aff]">
                          <Code2 size={13} />
                          <span>{contact.project_type}</span>
                        </span>
                      )}
                      {contact.budget_range && (
                        <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-medium">
                          <TrendingUp size={13} />
                          <span>Budget: {contact.budget_range}</span>
                        </span>
                      )}
                      <span className="flex items-center gap-1.5 text-[#808090]">
                        <Calendar size={13} />
                        {new Date(contact.created_at).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}
                      </span>
                    </div>

                    {/* Contact Details Bar */}
                    <div className="flex flex-wrap items-center gap-4 text-xs text-[#a0a0b0] mb-3">
                      <div className="flex items-center gap-2">
                        <Mail size={13} className="text-[#a77aff]" />
                        <span className="text-white select-all">{contact.email}</span>
                        <button
                          onClick={() => handleCopyEmail(contact)}
                          className="p-1 rounded hover:bg-[#2a2a35] text-[#808090] hover:text-white transition-colors"
                          title="Copy Email"
                        >
                          {isCopied ? <Check size={12} className="text-green-400" /> : <Copy size={12} />}
                        </button>
                        {isCopied && <span className="text-[10px] text-green-400 font-medium">Copied!</span>}
                      </div>

                      {contact.phone && (
                        <a
                          href={`tel:${contact.phone}`}
                          className="flex items-center gap-1.5 hover:text-white transition-colors"
                          title="Call Phone"
                        >
                          <Phone size={13} className="text-[#a77aff]" />
                          <span>{contact.phone}</span>
                        </a>
                      )}
                    </div>

                    {/* Message Box */}
                    {contact.message && (
                      <div className="mt-3 p-3.5 rounded-xl bg-[#14141c] border border-[#252532] text-sm text-[#c0c0d0] leading-relaxed whitespace-pre-wrap">
                        {contact.message}
                      </div>
                    )}
                  </div>

                  {/* Actions Column */}
                  <div className="flex lg:flex-col items-end gap-2.5 shrink-0 pt-2 lg:pt-0 border-t lg:border-t-0 border-[#2a2a35]/60">
                    <select
                      value={contact.status}
                      onChange={(e) => handleStatusChange(contact.id, e.target.value)}
                      className="px-3 py-2 bg-[#1a1a24] border border-[#2a2a35] rounded-xl text-xs font-medium text-white focus:outline-none focus:border-[#7727ff] cursor-pointer"
                    >
                      {contactStatuses.map((status) => (
                        <option key={status} value={status}>
                          {status.replace('_', ' ')}
                        </option>
                      ))}
                    </select>

                    <div className="flex items-center gap-1.5">
                      {contact.email && (
                        <a
                          href={`mailto:${contact.email}?subject=Regarding%20your%20inquiry%20with%20DS%20Softwares&body=Hi%20${encodeURIComponent(contact.name)},%0D%0A%0D%0AThank%20you%20for%20reaching%20out%20to%20DS%20Softwares.%20`}
                          className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#7727ff]/20 hover:bg-[#7727ff]/30 text-[#a77aff] text-xs font-medium border border-[#7727ff]/30 transition-colors"
                          title="Send Email Reply"
                        >
                          <Mail size={13} />
                          <span>Reply</span>
                        </a>
                      )}

                      <button
                        onClick={() => openEditModal('contacts', contact)}
                        className="p-2 rounded-xl bg-[#2a2a35] hover:bg-[#3a3a45] text-white transition-colors"
                        title="Edit Contact"
                      >
                        <Edit size={14} />
                      </button>

                      <button
                        onClick={() => handleDelete('contacts', contact.id)}
                        className="p-2 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 transition-colors"
                        title="Delete Inquiry"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
