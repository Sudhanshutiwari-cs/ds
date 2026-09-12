'use client'

import React, { useState } from 'react'
import {
  HelpCircle,
  Plus,
  Edit,
  Trash2,
  ChevronDown,
  ChevronUp
} from 'lucide-react'
import { useAdmin } from '@/components/admin/AdminContext'
import { faqCategories } from '@/components/admin/types'

export default function AdminFAQsPage() {
  const { faqs, openCreateModal, openEditModal, handleDelete } = useAdmin()

  const [categoryFilter, setCategoryFilter] = useState('ALL')
  const [expandedId, setExpandedId] = useState<string | null>(null)

  const filteredFAQs = faqs.filter((faq: any) => {
    return categoryFilter === 'ALL' || faq.category === categoryFilter
  })

  return (
    <div className="space-y-6">
      {/* Header and Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#131318] p-5 rounded-2xl border border-[#2a2a35]">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-2xl font-bold text-white">Frequently Asked Questions</h2>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#7727ff]/20 text-[#a77aff] border border-[#7727ff]/30">
              {faqs.length} Total
            </span>
          </div>
          <p className="text-sm text-[#a0a0b0] mt-1">
            Manage agency FAQs shown on /services and /contact pages
          </p>
        </div>

        <button
          onClick={() => openCreateModal('faqs')}
          className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-[#7727ff] to-[#6417ed] rounded-xl hover:shadow-lg hover:shadow-purple-500/30 text-sm font-medium text-white transition-all"
        >
          <Plus size={16} />
          New FAQ
        </button>
      </div>

      {/* Category Pills */}
      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-thin">
        <button
          onClick={() => setCategoryFilter('ALL')}
          className={`px-4 py-2 rounded-xl text-xs font-medium transition-all whitespace-nowrap ${
            categoryFilter === 'ALL'
              ? 'bg-gradient-to-r from-[#7727ff] to-[#6417ed] text-white shadow-md shadow-purple-500/20'
              : 'bg-[#131318] text-[#a0a0b0] hover:bg-[#1a1a24] hover:text-white border border-[#2a2a35]'
          }`}
        >
          All ({faqs.length})
        </button>
        {faqCategories.map((cat) => {
          const count = faqs.filter((f: any) => f.category === cat).length
          if (count === 0) return null
          return (
            <button
              key={cat}
              onClick={() => setCategoryFilter(cat)}
              className={`px-4 py-2 rounded-xl text-xs font-medium transition-all whitespace-nowrap flex items-center gap-1.5 ${
                categoryFilter === cat
                  ? 'bg-gradient-to-r from-[#7727ff] to-[#6417ed] text-white shadow-md shadow-purple-500/20'
                  : 'bg-[#131318] text-[#a0a0b0] hover:bg-[#1a1a24] hover:text-white border border-[#2a2a35]'
              }`}
            >
              <span>{cat}</span>
              <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${categoryFilter === cat ? 'bg-white/20 text-white' : 'bg-[#2a2a35] text-[#808090]'}`}>
                {count}
              </span>
            </button>
          )
        })}
      </div>

      {/* FAQs List */}
      {faqs.length === 0 ? (
        <div className="bg-[#131318] rounded-2xl border border-[#2a2a35] p-12 text-center">
          <HelpCircle size={48} className="mx-auto text-[#a0a0b0] mb-4 opacity-50" />
          <p className="text-lg font-medium text-white">No FAQs added yet</p>
          <p className="text-sm text-[#a0a0b0] mt-1 mb-6">
            Add client questions and answers to reduce inquiries and provide upfront clarity.
          </p>
          <button
            onClick={() => openCreateModal('faqs')}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-[#7727ff] to-[#6417ed] rounded-xl text-sm font-medium text-white hover:shadow-lg hover:shadow-purple-500/30"
          >
            <Plus size={16} /> Create FAQ
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredFAQs.map((faq: any) => {
            const isExpanded = expandedId === faq.id

            return (
              <div
                key={faq.id}
                className="bg-[#131318] rounded-2xl border border-[#2a2a35] p-5 hover:border-[#7727ff]/40 transition-all group"
              >
                <div className="flex items-start justify-between gap-4">
                  <div
                    className="flex-1 cursor-pointer"
                    onClick={() => setExpandedId(isExpanded ? null : faq.id)}
                  >
                    <div className="flex items-center gap-2 mb-1.5">
                      <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-[#7727ff]/15 text-[#a77aff] border border-[#7727ff]/20">
                        {faq.category}
                      </span>
                      <span className="text-[11px] text-[#808090]">Order #{faq.sort_order ?? 0}</span>
                    </div>
                    <h3 className="font-semibold text-base text-white group-hover:text-[#a77aff] transition-colors">
                      {faq.question}
                    </h3>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => openEditModal('faqs', faq)}
                      className="p-1.5 rounded-lg bg-[#2a2a35] hover:bg-[#3a3a45] text-white transition-colors"
                      title="Edit FAQ"
                    >
                      <Edit size={13} />
                    </button>
                    <button
                      onClick={() => handleDelete('faqs', faq.id)}
                      className="p-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 transition-colors"
                      title="Delete FAQ"
                    >
                      <Trash2 size={13} />
                    </button>
                    <button
                      onClick={() => setExpandedId(isExpanded ? null : faq.id)}
                      className="p-1.5 rounded-lg text-[#808095] hover:text-white"
                    >
                      {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                    </button>
                  </div>
                </div>

                {isExpanded && (
                  <div className="mt-4 pt-4 border-t border-[#2a2a35]/60 text-sm text-[#c0c0d0] leading-relaxed whitespace-pre-wrap animate-in fade-in duration-150">
                    {faq.answer}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
