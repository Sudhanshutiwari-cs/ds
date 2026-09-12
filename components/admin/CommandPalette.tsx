'use client'

import React, { useState, useEffect, useMemo, useRef } from 'react'
import { useRouter } from 'next/navigation'
import {
  Search,
  X,
  FolderKanban,
  Wrench,
  Inbox,
  Newspaper,
  Users2,
  Settings,
  ExternalLink,
  ArrowRight,
  Sparkles
} from 'lucide-react'
import { useAdmin } from './AdminContext'

export default function CommandPalette() {
  const router = useRouter()
  const {
    commandPaletteOpen,
    setCommandPaletteOpen,
    projects,
    services,
    contacts,
    blogPosts,
    teamMembers
  } = useAdmin()

  const [search, setSearch] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  // Keyboard shortcut listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        setCommandPaletteOpen(prev => !prev)
      } else if (e.key === 'Escape') {
        setCommandPaletteOpen(false)
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [setCommandPaletteOpen])

  useEffect(() => {
    if (commandPaletteOpen) {
      setTimeout(() => inputRef.current?.focus(), 50)
    } else {
      setSearch('')
    }
  }, [commandPaletteOpen])

  const results = useMemo(() => {
    if (!search.trim()) {
      return {
        pages: [
          { name: 'Dashboard', href: '/admin', icon: Sparkles },
          { name: 'Projects', href: '/admin/projects', icon: FolderKanban },
          { name: 'Services', href: '/admin/services', icon: Wrench },
          { name: 'Client Inquiries', href: '/admin/contacts', icon: Inbox },
          { name: 'Blog Posts', href: '/admin/blog', icon: Newspaper },
          { name: 'Team Members', href: '/admin/team', icon: Users2 },
          { name: 'Site Settings', href: '/admin/settings', icon: Settings },
          { name: 'Live Website', href: '/', icon: ExternalLink, external: true },
        ],
        projects: [],
        services: [],
        contacts: [],
        blogPosts: [],
      }
    }

    const q = search.toLowerCase()

    return {
      pages: [],
      projects: projects.filter(p =>
        p.title?.toLowerCase().includes(q) ||
        p.client_name?.toLowerCase().includes(q) ||
        p.category?.toLowerCase().includes(q)
      ).slice(0, 4),
      services: services.filter(s =>
        s.name?.toLowerCase().includes(q) ||
        s.description?.toLowerCase().includes(q)
      ).slice(0, 4),
      contacts: contacts.filter(c =>
        c.name?.toLowerCase().includes(q) ||
        c.company?.toLowerCase().includes(q) ||
        c.email?.toLowerCase().includes(q) ||
        c.project_type?.toLowerCase().includes(q)
      ).slice(0, 4),
      blogPosts: blogPosts.filter(b =>
        b.title?.toLowerCase().includes(q) ||
        b.category?.toLowerCase().includes(q)
      ).slice(0, 4),
    }
  }, [search, projects, services, contacts, blogPosts])

  const handleSelect = (href: string, external?: boolean) => {
    setCommandPaletteOpen(false)
    if (external) {
      window.open(href, '_blank')
    } else {
      router.push(href)
    }
  }

  if (!commandPaletteOpen) return null

  const hasAnyResults =
    results.pages.length > 0 ||
    results.projects.length > 0 ||
    results.services.length > 0 ||
    results.contacts.length > 0 ||
    results.blogPosts.length > 0

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4 bg-black/70 backdrop-blur-md animate-in fade-in duration-150">
      <div
        className="fixed inset-0"
        onClick={() => setCommandPaletteOpen(false)}
      />

      <div className="relative w-full max-w-2xl bg-[#131318] border border-[#2a2a35] rounded-2xl shadow-2xl overflow-hidden z-10 animate-in zoom-in-95 duration-150">
        {/* Search Input */}
        <div className="flex items-center px-4 py-3.5 border-b border-[#2a2a35]">
          <Search size={18} className="text-[#a77aff] mr-3 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search projects, services, leads, articles... (Esc to close)"
            className="w-full bg-transparent border-none outline-none text-white text-sm placeholder-[#606075]"
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              className="p-1 rounded text-[#808090] hover:text-white"
            >
              <X size={16} />
            </button>
          )}
          <kbd className="hidden sm:inline-block ml-2 px-2 py-0.5 text-[10px] bg-[#1a1a24] border border-[#2a2a35] text-[#a0a0b0] rounded">
            ESC
          </kbd>
        </div>

        {/* Results Body */}
        <div className="max-h-96 overflow-y-auto p-3 space-y-4 scrollbar-thin">
          {!hasAnyResults ? (
            <div className="py-12 text-center text-[#808090]">
              <Search size={28} className="mx-auto mb-2 opacity-50" />
              <p className="text-sm">No results found for "{search}"</p>
            </div>
          ) : (
            <>
              {/* Quick Pages */}
              {results.pages.length > 0 && (
                <div>
                  <p className="px-3 pb-1 text-[11px] font-semibold text-[#808095] uppercase tracking-wider">
                    Quick Navigation
                  </p>
                  <div className="space-y-1">
                    {results.pages.map((p) => {
                      const Icon = p.icon
                      return (
                        <button
                          key={p.name}
                          onClick={() => handleSelect(p.href, p.external)}
                          className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-left text-sm text-[#d7d3de] hover:text-white hover:bg-[#1a1a24] transition-colors group"
                        >
                          <div className="flex items-center gap-2.5">
                            <Icon size={16} className="text-[#a77aff]" />
                            <span>{p.name}</span>
                          </div>
                          <ArrowRight size={14} className="text-[#808095] opacity-0 group-hover:opacity-100 transition-opacity" />
                        </button>
                      )
                    })}
                  </div>
                </div>
              )}

              {/* Projects */}
              {results.projects.length > 0 && (
                <div>
                  <p className="px-3 pb-1 text-[11px] font-semibold text-[#808095] uppercase tracking-wider">
                    Projects ({results.projects.length})
                  </p>
                  <div className="space-y-1">
                    {results.projects.map((item: any) => (
                      <button
                        key={item.id}
                        onClick={() => handleSelect('/admin/projects')}
                        className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-left text-sm text-[#d7d3de] hover:text-white hover:bg-[#1a1a24] transition-colors group"
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <FolderKanban size={16} className="text-[#a77aff] shrink-0" />
                          <div className="truncate">
                            <p className="font-medium text-white truncate">{item.title}</p>
                            <p className="text-[11px] text-[#808095]">{item.category} • {item.client_name}</p>
                          </div>
                        </div>
                        <ArrowRight size={14} className="text-[#808095] opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Services */}
              {results.services.length > 0 && (
                <div>
                  <p className="px-3 pb-1 text-[11px] font-semibold text-[#808095] uppercase tracking-wider">
                    Services ({results.services.length})
                  </p>
                  <div className="space-y-1">
                    {results.services.map((item: any) => (
                      <button
                        key={item.id}
                        onClick={() => handleSelect('/admin/services')}
                        className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-left text-sm text-[#d7d3de] hover:text-white hover:bg-[#1a1a24] transition-colors group"
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <Wrench size={16} className="text-[#a77aff] shrink-0" />
                          <div className="truncate">
                            <p className="font-medium text-white truncate">{item.name}</p>
                            <p className="text-[11px] text-[#808095] truncate">{item.description || 'Public service offering'}</p>
                          </div>
                        </div>
                        <ArrowRight size={14} className="text-[#808095] opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Contacts / Leads */}
              {results.contacts.length > 0 && (
                <div>
                  <p className="px-3 pb-1 text-[11px] font-semibold text-[#808095] uppercase tracking-wider">
                    Client Inquiries ({results.contacts.length})
                  </p>
                  <div className="space-y-1">
                    {results.contacts.map((item: any) => (
                      <button
                        key={item.id}
                        onClick={() => handleSelect('/admin/contacts')}
                        className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-left text-sm text-[#d7d3de] hover:text-white hover:bg-[#1a1a24] transition-colors group"
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <Inbox size={16} className="text-[#a77aff] shrink-0" />
                          <div className="truncate">
                            <p className="font-medium text-white truncate">{item.name} {item.company ? `(${item.company})` : ''}</p>
                            <p className="text-[11px] text-[#808095]">{item.email} • {item.project_type || 'General'}</p>
                          </div>
                        </div>
                        <ArrowRight size={14} className="text-[#808095] opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Blog Posts */}
              {results.blogPosts.length > 0 && (
                <div>
                  <p className="px-3 pb-1 text-[11px] font-semibold text-[#808095] uppercase tracking-wider">
                    Blog Posts ({results.blogPosts.length})
                  </p>
                  <div className="space-y-1">
                    {results.blogPosts.map((item: any) => (
                      <button
                        key={item.id}
                        onClick={() => handleSelect('/admin/blog')}
                        className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-left text-sm text-[#d7d3de] hover:text-white hover:bg-[#1a1a24] transition-colors group"
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <Newspaper size={16} className="text-[#a77aff] shrink-0" />
                          <div className="truncate">
                            <p className="font-medium text-white truncate">{item.title}</p>
                            <p className="text-[11px] text-[#808095]">{item.category} • {item.status}</p>
                          </div>
                        </div>
                        <ArrowRight size={14} className="text-[#808095] opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer info */}
        <div className="px-4 py-2.5 bg-[#1a1a24]/60 border-t border-[#2a2a35] flex items-center justify-between text-[11px] text-[#808090]">
          <span>Navigate with mouse or arrow keys</span>
          <span>DS Softwares Admin</span>
        </div>
      </div>
    </div>
  )
}
