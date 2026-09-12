'use client'

import React from 'react'
import Link from 'next/link'
import {
  FolderKanban,
  Wrench,
  Inbox,
  Newspaper,
  Users2,
  Sparkles,
  Plus,
  ExternalLink,
  ArrowUpRight,
  Download,
  Building2,
  Code2,
  TrendingUp,
  Mail,
  CheckCircle2,
  ArrowRight
} from 'lucide-react'
import { useAdmin } from '@/components/admin/AdminContext'
import { exportContactsToCSV, serviceIconMap } from '@/components/admin/types'

export default function AdminDashboardPage() {
  const {
    projects,
    services,
    testimonials,
    blogPosts,
    contacts,
    teamMembers,
    openCreateModal
  } = useAdmin()

  const publishedProjects = projects.filter(p => p.is_published).length
  const draftProjects = projects.filter(p => !p.is_published).length
  const newContacts = contacts.filter(c => !c.is_read).length
  const activeServicesCount = services.length

  const stats = [
    {
      label: 'Total Projects',
      value: projects.length,
      icon: FolderKanban,
      color: '#a77aff',
      bg: 'from-purple-500/20 to-purple-600/10',
      trend: `${publishedProjects} Live / ${draftProjects} Drafts`
    },
    {
      label: 'Client Inquiries',
      value: contacts.length,
      icon: Inbox,
      color: '#4ade80',
      bg: 'from-emerald-500/20 to-emerald-600/10',
      trend: newContacts > 0 ? `${newContacts} New Unprocessed` : 'All Caught Up'
    },
    {
      label: 'Active Services',
      value: services.length,
      icon: Wrench,
      color: '#60a5fa',
      bg: 'from-blue-500/20 to-blue-600/10',
      trend: 'Public Catalog'
    },
    {
      label: 'Blog Articles',
      value: blogPosts.length,
      icon: Newspaper,
      color: '#f472b6',
      bg: 'from-pink-500/20 to-pink-600/10',
      trend: `${blogPosts.filter(b => b.status === 'published').length} Published`
    },
    {
      label: 'Team Members',
      value: teamMembers.length,
      icon: Users2,
      color: '#fbbf24',
      bg: 'from-amber-500/20 to-amber-600/10',
      trend: 'Core Engineers'
    },
  ]

  return (
    <div className="space-y-6">
      {/* Hero Welcome Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#7727ff] via-[#6417ed] to-[#40109a] p-6 sm:p-8 shadow-xl shadow-purple-950/20">
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: 'radial-gradient(circle at 20% 50%, white 1px, transparent 1px)',
            backgroundSize: '20px 20px'
          }}
        />
        <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-white/90 text-xs font-semibold backdrop-blur-md mb-3">
              <Sparkles size={13} className="text-[#f7f5ff]" /> DS Softwares Command Center
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-white">Welcome back, Admin 👋</h2>
            <p className="text-white/80 text-sm mt-1 max-w-xl">
              Monitor client inquiries, curate project case studies, and manage public agency offerings in real-time.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={() => openCreateModal('projects')}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-white text-[#19063d] rounded-xl text-xs sm:text-sm font-bold shadow-lg hover:bg-[#f0eaff] transition-all"
            >
              <Plus size={15} /> New Project
            </button>
            <button
              onClick={() => openCreateModal('services')}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-white/15 hover:bg-white/25 text-white border border-white/20 rounded-xl text-xs sm:text-sm font-bold backdrop-blur-md transition-all"
            >
              <Plus size={15} /> New Service
            </button>
            <a
              href="/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-black/20 hover:bg-black/35 text-white border border-white/10 rounded-xl text-xs sm:text-sm font-bold backdrop-blur-md transition-all"
            >
              <ExternalLink size={14} /> Live Site
            </a>
          </div>
        </div>
      </div>

      {/* Stats KPI Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        {stats.map((stat) => {
          const Icon = stat.icon
          return (
            <div key={stat.label} className="bg-[#131318] rounded-2xl border border-[#2a2a35] p-5 hover:border-[#7727ff]/50 transition-all group">
              <div className="flex items-center justify-between mb-3">
                <div className={`p-2.5 rounded-xl bg-gradient-to-br ${stat.bg} group-hover:scale-110 transition-transform`}>
                  <Icon size={18} style={{ color: stat.color }} />
                </div>
                <span className="text-[11px] font-semibold text-[#8e8a99]">{stat.trend}</span>
              </div>
              <h3 className="text-2xl sm:text-3xl font-black text-[#f7f5ff]">{stat.value}</h3>
              <p className="text-xs text-[#a0a0b0] mt-1 font-medium">{stat.label}</p>
            </div>
          )
        })}
      </div>

      {/* Quick Action Navigation Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Link
          href="/admin/projects"
          className="bg-[#131318] rounded-2xl border border-[#2a2a35] p-5 text-left hover:border-[#7727ff]/60 transition-all group block"
        >
          <div className="flex items-center justify-between mb-2">
            <FolderKanban size={22} className="text-[#7727ff] group-hover:scale-110 transition-transform" />
            <ArrowUpRight size={16} className="text-[#a0a0b0] group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
          </div>
          <h3 className="font-bold text-sm sm:text-base text-white">Portfolio Projects</h3>
          <p className="text-xs text-[#a0a0b0] mt-1">Manage case studies & metrics</p>
          <div className="mt-3 flex gap-2">
            <span className="px-2 py-0.5 text-[10px] font-bold bg-purple-500/20 text-purple-400 rounded-full">{publishedProjects} Live</span>
            <span className="px-2 py-0.5 text-[10px] font-bold bg-gray-500/20 text-gray-400 rounded-full">{draftProjects} Drafts</span>
          </div>
        </Link>

        <Link
          href="/admin/services"
          className="bg-[#131318] rounded-2xl border border-[#2a2a35] p-5 text-left hover:border-[#7727ff]/60 transition-all group block"
        >
          <div className="flex items-center justify-between mb-2">
            <Wrench size={22} className="text-[#a77aff] group-hover:scale-110 transition-transform" />
            <ArrowUpRight size={16} className="text-[#a0a0b0] group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
          </div>
          <h3 className="font-bold text-sm sm:text-base text-white">Agency Services</h3>
          <p className="text-xs text-[#a0a0b0] mt-1">Manage public service catalog</p>
          <div className="mt-3 flex gap-2">
            <span className="px-2 py-0.5 text-[10px] font-bold bg-indigo-500/20 text-indigo-400 rounded-full">{activeServicesCount} Active</span>
          </div>
        </Link>

        <Link
          href="/admin/contacts"
          className="bg-[#131318] rounded-2xl border border-[#2a2a35] p-5 text-left hover:border-[#7727ff]/60 transition-all group block"
        >
          <div className="flex items-center justify-between mb-2">
            <Inbox size={22} className="text-[#4ade80] group-hover:scale-110 transition-transform" />
            <ArrowUpRight size={16} className="text-[#a0a0b0] group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
          </div>
          <h3 className="font-bold text-sm sm:text-base text-white">Client Inbox</h3>
          <p className="text-xs text-[#a0a0b0] mt-1">Incoming project inquiries</p>
          <div className="mt-3 flex gap-2">
            <span className="px-2 py-0.5 text-[10px] font-bold bg-green-500/20 text-green-400 rounded-full">{newContacts} Unprocessed</span>
          </div>
        </Link>

        <button
          onClick={() => exportContactsToCSV(contacts)}
          className="bg-[#131318] rounded-2xl border border-[#2a2a35] p-5 text-left hover:border-[#7727ff]/60 transition-all group block w-full"
        >
          <div className="flex items-center justify-between mb-2">
            <Download size={22} className="text-[#fbbf24] group-hover:scale-110 transition-transform" />
            <ArrowUpRight size={16} className="text-[#a0a0b0] group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
          </div>
          <h3 className="font-bold text-sm sm:text-base text-white">Export Leads (CSV)</h3>
          <p className="text-xs text-[#a0a0b0] mt-1">Download complete lead database</p>
          <div className="mt-3 flex gap-2">
            <span className="px-2 py-0.5 text-[10px] font-bold bg-yellow-500/20 text-yellow-400 rounded-full">1-Click Export</span>
          </div>
        </button>
      </div>

      {/* Dual Column Section: Recent Inquiries & Services Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Recent Inquiries (Left 7 Cols) */}
        <div className="lg:col-span-7 bg-[#131318] rounded-3xl border border-[#2a2a35] p-6">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="font-bold text-base sm:text-lg text-white">Recent Inquiries & Leads</h3>
              <p className="text-xs text-[#a0a0b0]">Latest submissions from your contact funnel</p>
            </div>
            <Link
              href="/admin/contacts"
              className="text-xs font-bold text-[#a77aff] hover:text-white transition-colors"
            >
              View All ({contacts.length}) →
            </Link>
          </div>

          {contacts.length > 0 ? (
            <div className="space-y-3">
              {contacts.slice(0, 5).map((c: any) => (
                <div
                  key={c.id}
                  className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-xl bg-[#181820] border border-[#252532] hover:border-[#7727ff]/50 transition-colors"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-semibold text-sm text-white truncate">{c.name}</p>
                      {c.company && (
                        <span className="inline-flex items-center gap-1 text-[11px] text-[#a0a0b0]">
                          <Building2 size={11} /> {c.company}
                        </span>
                      )}
                    </div>
                    <div className="flex flex-wrap items-center gap-2 mt-1">
                      <span className="text-[11px] text-[#808090]">{c.email}</span>
                      {c.project_type && (
                        <span className="px-1.5 py-0.5 text-[10px] rounded bg-[#7727ff]/15 text-[#a77aff] font-medium border border-[#7727ff]/20">
                          {c.project_type}
                        </span>
                      )}
                      {c.budget_range && (
                        <span className="px-1.5 py-0.5 text-[10px] rounded bg-emerald-500/10 text-emerald-400 font-medium">
                          {c.budget_range}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <a
                      href={`mailto:${c.email}?subject=Regarding%20your%20inquiry%20with%20DS%20Softwares&body=Hi%20${encodeURIComponent(c.name)},%0D%0A%0D%0AThank%20you%20for%20reaching%20out%20to%20DS%20Softwares.%20`}
                      className="px-3 py-1.5 rounded-lg bg-[#7727ff]/20 hover:bg-[#7727ff]/30 text-[#a77aff] text-xs font-semibold border border-[#7727ff]/30 transition-colors"
                    >
                      Reply
                    </a>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-12 text-center text-[#808090]">
              <Inbox size={32} className="mx-auto mb-2 opacity-50" />
              <p className="text-sm">No inquiries yet. New submissions will appear here.</p>
            </div>
          )}
        </div>

        {/* Services Snapshot (Right 5 Cols) */}
        <div className="lg:col-span-5 bg-[#131318] rounded-3xl border border-[#2a2a35] p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-5">
              <div>
                <h3 className="font-bold text-base sm:text-lg text-white">Public Services</h3>
                <p className="text-xs text-[#a0a0b0]">Catalog displayed on /services</p>
              </div>
              <Link
                href="/admin/services"
                className="text-xs font-bold text-[#a77aff] hover:text-white transition-colors"
              >
                Manage →
              </Link>
            </div>

            <div className="space-y-2.5">
              {services.slice(0, 4).map((s: any) => {
                const IconComp = (s.icon && serviceIconMap[s.icon]) || Wrench
                return (
                  <div
                    key={s.id}
                    className="flex items-center justify-between p-3 rounded-xl bg-[#181820] border border-[#252532]"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="size-8 rounded-lg bg-[#7727ff]/15 border border-[#7727ff]/30 text-[#a77aff] flex items-center justify-center shrink-0">
                        <IconComp size={16} />
                      </div>
                      <div className="truncate">
                        <p className="text-xs font-semibold text-white truncate">{s.name}</p>
                        <p className="text-[10px] text-[#808090]">Order #{s.sort_order ?? 0}</p>
                      </div>
                    </div>
                    <a
                      href={`/services#${s.name?.toLowerCase().replace(/\s+/g, '-')}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[#808090] hover:text-[#a77aff] p-1 transition-colors"
                      title="Preview on live site"
                    >
                      <ExternalLink size={13} />
                    </a>
                  </div>
                )
              })}
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-[#2a2a35]">
            <a
              href="/services"
              target="_blank"
              rel="noopener noreferrer"
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-[#1a1a24] hover:bg-[#252533] border border-[#2a2a35] text-xs font-semibold text-white transition-colors"
            >
              <span>View Full Services Page</span>
              <ExternalLink size={13} />
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}