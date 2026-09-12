'use client'

import React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Command, X, User, LogOut } from 'lucide-react'
import { navigationSections } from './types'
import { useAdmin } from './AdminContext'

export default function AdminSidebar() {
  const pathname = usePathname()
  const { sidebarOpen, setSidebarOpen, handleLogout, newContactsCount } = useAdmin()

  return (
    <>
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-72 bg-[#131318] border-r border-[#2a2a35] transform transition-transform duration-300 ease-in-out ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } lg:translate-x-0 flex flex-col`}
      >
        {/* Brand Header */}
        <div className="flex items-center justify-between h-16 px-6 border-b border-[#2a2a35] bg-gradient-to-r from-[#1a1a24] to-[#131318]">
          <Link href="/admin" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#7727ff] to-[#6417ed] flex items-center justify-center shadow-lg shadow-purple-500/20 group-hover:scale-105 transition-transform">
              <Command size={20} className="text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold">
                <span className="text-[#a77aff]">DS</span> <span className="bg-gradient-to-r from-[#667eea] to-[#764ba2] bg-clip-text text-transparent">Admin</span>
              </h1>
              <p className="text-xs text-[#a0a0b0]">Portfolio & Agency Hub</p>
            </div>
          </Link>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden p-2 rounded-lg hover:bg-[#1a1a24] text-[#a0a0b0] hover:text-white transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* User Profile Summary */}
        <div className="p-4 border-b border-[#2a2a35] bg-[#1a1a24]/50">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#7727ff] to-[#6417ed] flex items-center justify-center shadow-inner">
                <User size={18} className="text-white" />
              </div>
              <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-[#131318]" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate">Admin User</p>
              <p className="text-xs text-[#a0a0b0] truncate">admin@dssoftwares.in</p>
            </div>
          </div>
        </div>

        {/* Navigation Sections */}
        <nav className="flex-1 p-4 space-y-5 overflow-y-auto scrollbar-thin">
          {navigationSections.map((section) => (
            <div key={section.title}>
              <p className="px-4 mb-2 text-xs font-semibold text-[#808095] uppercase tracking-wider">
                {section.title}
              </p>
              <div className="space-y-1">
                {section.items.map((item) => {
                  const isActive =
                    item.href === '/admin'
                      ? pathname === '/admin'
                      : pathname === item.href || pathname.startsWith(item.href + '/')
                  const Icon = item.icon

                  return (
                    <Link
                      key={item.id}
                      href={item.href}
                      onClick={() => setSidebarOpen(false)}
                      className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all group relative ${
                        isActive
                          ? 'bg-gradient-to-r from-[#7727ff] to-[#6417ed] text-white shadow-lg shadow-purple-500/20'
                          : 'text-[#a0a0b0] hover:bg-[#1a1a24] hover:text-white'
                      }`}
                    >
                      <Icon
                        size={18}
                        className={isActive ? 'text-white' : 'text-[#a0a0b0] group-hover:text-white'}
                      />
                      <span>{item.label}</span>

                      {item.id === 'contacts' && newContactsCount > 0 && (
                        <span className="ml-auto px-2 py-0.5 text-xs bg-red-500 text-white font-bold rounded-full animate-pulse">
                          {newContactsCount}
                        </span>
                      )}

                      {isActive && (
                        <span className="absolute right-2 top-1/2 -translate-y-1/2 w-1.5 h-5 bg-white rounded-full" />
                      )}
                    </Link>
                  )
                })}
              </div>
            </div>
          ))}
        </nav>

        {/* Sidebar Footer with Logout */}
        <div className="p-4 border-t border-[#2a2a35] bg-[#1a1a24]/50">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-colors"
          >
            <LogOut size={16} />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Mobile Drawer Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </>
  )
}
