'use client'

import React, { useState } from 'react'
import { usePathname } from 'next/navigation'
import Link from 'next/link'
import {
  Menu,
  ExternalLink,
  RefreshCw,
  Search,
  Bell,
  User,
  ChevronDown,
  LogOut,
  Mail,
  CheckCircle2,
  AlertCircle
} from 'lucide-react'
import { useAdmin } from './AdminContext'

export default function AdminHeader() {
  const pathname = usePathname()
  const {
    setSidebarOpen,
    setCommandPaletteOpen,
    refreshData,
    isRefreshing,
    newContactsCount,
    contacts,
    handleLogout,
    error,
    success,
    setError,
    setSuccess
  } = useAdmin()

  const [notificationsOpen, setNotificationsOpen] = useState(false)
  const [userMenuOpen, setUserMenuOpen] = useState(false)

  // Map path to title
  const getPageTitle = (path: string) => {
    if (path === '/admin') return 'Dashboard'
    if (path.startsWith('/admin/projects')) return 'Projects'
    if (path.startsWith('/admin/services')) return 'Services'
    if (path.startsWith('/admin/testimonials')) return 'Testimonials'
    if (path.startsWith('/admin/blog')) return 'Blog Posts'
    if (path.startsWith('/admin/contacts')) return 'Client Inquiries'
    if (path.startsWith('/admin/team')) return 'Team Members'
    if (path.startsWith('/admin/faqs')) return 'FAQs'
    if (path.startsWith('/admin/media')) return 'Media Library'
    if (path.startsWith('/admin/settings')) return 'Site Settings'
    return 'Admin'
  }

  return (
    <>
      <header className="sticky top-0 z-30 bg-[#131318]/90 backdrop-blur-md border-b border-[#2a2a35]">
        <div className="flex items-center justify-between h-16 px-4 sm:px-6">
          {/* Left Title & Mobile Menu Toggle */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 rounded-xl hover:bg-[#1a1a24] text-[#a0a0b0] hover:text-white transition-colors"
              title="Open Navigation"
            >
              <Menu size={20} />
            </button>
            <div>
              <h2 className="text-lg font-bold text-white">{getPageTitle(pathname)}</h2>
              <p className="text-xs text-[#a0a0b0] hidden sm:block">Welcome back, Admin</p>
            </div>
          </div>

          {/* Right Action Icons */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Live Website Link */}
            <a
              href="/"
              target="_blank"
              rel="noopener noreferrer"
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#1a1a24] hover:bg-[#252533] border border-[#2a2a35] rounded-xl text-xs font-semibold text-[#d7d3de] hover:text-white transition-colors"
              title="Open live website in new tab"
            >
              <ExternalLink size={13} />
              <span>Live Site</span>
            </a>

            {/* Sync / Refresh Data Button */}
            <button
              onClick={refreshData}
              disabled={isRefreshing}
              className="p-2 rounded-xl bg-[#1a1a24] hover:bg-[#252533] border border-[#2a2a35] text-[#d7d3de] hover:text-white transition-all disabled:opacity-50"
              title="Sync latest data from Supabase"
            >
              <RefreshCw size={15} className={isRefreshing ? 'animate-spin text-[#a77aff]' : ''} />
            </button>

            {/* Quick Command Palette Button */}
            <button
              onClick={() => setCommandPaletteOpen(true)}
              className="flex items-center gap-2 px-3 py-1.5 bg-[#1a1a24] hover:bg-[#252533] border border-[#2a2a35] rounded-xl text-xs text-[#a0a0b0] hover:text-white transition-colors"
              title="Quick Search (Ctrl + K)"
            >
              <Search size={14} />
              <span className="hidden md:inline">Quick Search</span>
              <kbd className="hidden md:inline-block px-1.5 py-0.5 text-[10px] bg-[#2a2a35] text-[#a77aff] rounded font-mono">
                ⌘K
              </kbd>
            </button>

            {/* Notifications Dropdown */}
            <div className="relative">
              <button
                onClick={() => setNotificationsOpen(!notificationsOpen)}
                className="relative p-2 rounded-xl bg-[#1a1a24] hover:bg-[#252533] border border-[#2a2a35] text-[#a0a0b0] hover:text-white transition-colors"
                title="Notifications"
              >
                <Bell size={16} />
                {newContactsCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-[10px] font-bold text-white rounded-full flex items-center justify-center animate-pulse">
                    {newContactsCount}
                  </span>
                )}
              </button>

              {notificationsOpen && (
                <>
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setNotificationsOpen(false)}
                  />
                  <div className="absolute right-0 mt-2 w-80 bg-[#131318] border border-[#2a2a35] rounded-2xl shadow-2xl p-4 z-50 animate-in fade-in zoom-in-95 duration-150">
                    <div className="flex items-center justify-between pb-3 border-b border-[#2a2a35]">
                      <h4 className="font-semibold text-sm text-white">Notifications</h4>
                      <span className="text-xs text-[#a77aff] font-medium">{newContactsCount} unread</span>
                    </div>
                    <div className="mt-3 space-y-2 max-h-64 overflow-y-auto scrollbar-thin">
                      {contacts.filter((c: any) => !c.is_read).length === 0 ? (
                        <p className="text-xs text-[#a0a0b0] text-center py-4">No unread notifications</p>
                      ) : (
                        contacts.filter((c: any) => !c.is_read).slice(0, 5).map((contact: any) => (
                          <Link
                            key={contact.id}
                            href="/admin/contacts"
                            onClick={() => setNotificationsOpen(false)}
                            className="block p-2.5 rounded-xl hover:bg-[#1a1a24] transition-colors border border-transparent hover:border-[#2a2a35]"
                          >
                            <div className="flex items-center gap-2">
                              <Mail size={13} className="text-[#a77aff] shrink-0" />
                              <p className="text-xs font-medium text-white truncate">{contact.name}</p>
                            </div>
                            <p className="text-[11px] text-[#a0a0b0] truncate mt-0.5">
                              {contact.company ? `${contact.company}: ` : ''}{contact.message || 'New contact inquiry'}
                            </p>
                          </Link>
                        ))
                      )}
                    </div>
                    <div className="pt-3 mt-2 border-t border-[#2a2a35] text-center">
                      <Link
                        href="/admin/contacts"
                        onClick={() => setNotificationsOpen(false)}
                        className="text-xs text-[#a77aff] hover:underline"
                      >
                        View all inquiries
                      </Link>
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* User Profile Menu */}
            <div className="relative">
              <button
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                className="flex items-center gap-2 p-1.5 sm:px-3 sm:py-1.5 rounded-xl bg-[#1a1a24] hover:bg-[#252533] border border-[#2a2a35] transition-colors"
              >
                <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-[#7727ff] to-[#6417ed] flex items-center justify-center text-white">
                  <User size={14} />
                </div>
                <span className="hidden md:inline text-xs font-medium text-white">Admin</span>
                <ChevronDown size={14} className="text-[#a0a0b0]" />
              </button>

              {userMenuOpen && (
                <>
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setUserMenuOpen(false)}
                  />
                  <div className="absolute right-0 mt-2 w-56 bg-[#131318] border border-[#2a2a35] rounded-2xl shadow-2xl p-2 z-50 animate-in fade-in zoom-in-95 duration-150">
                    <div className="p-3 border-b border-[#2a2a35] mb-1">
                      <p className="text-xs font-semibold text-white">Admin User</p>
                      <p className="text-[11px] text-[#a0a0b0] truncate">admin@dssoftwares.in</p>
                    </div>
                    <Link
                      href="/admin/settings"
                      onClick={() => setUserMenuOpen(false)}
                      className="flex items-center gap-2 px-3 py-2 text-xs text-[#d7d3de] hover:text-white hover:bg-[#1a1a24] rounded-xl transition-colors"
                    >
                      Site Settings
                    </Link>
                    <a
                      href="/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 px-3 py-2 text-xs text-[#d7d3de] hover:text-white hover:bg-[#1a1a24] rounded-xl transition-colors"
                    >
                      View Live Website
                    </a>
                    <button
                      onClick={() => {
                        setUserMenuOpen(false)
                        handleLogout()
                      }}
                      className="w-full flex items-center gap-2 px-3 py-2 text-xs text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-xl transition-colors mt-1"
                    >
                      <LogOut size={13} />
                      <span>Logout</span>
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Global Toast Banners */}
        {error && (
          <div className="px-6 py-2 bg-red-500/10 border-t border-red-500/20 text-red-400 text-xs flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertCircle size={14} />
              <span>{error}</span>
            </div>
            <button onClick={() => setError(null)} className="text-red-400 hover:text-white">✕</button>
          </div>
        )}
        {success && (
          <div className="px-6 py-2 bg-green-500/10 border-t border-green-500/20 text-green-400 text-xs flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CheckCircle2 size={14} />
              <span>{success}</span>
            </div>
            <button onClick={() => setSuccess(null)} className="text-green-400 hover:text-white">✕</button>
          </div>
        )}
      </header>
    </>
  )
}
