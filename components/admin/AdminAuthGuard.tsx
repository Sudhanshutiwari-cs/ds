'use client'

import React from 'react'
import {
  Lock,
  Mail,
  Eye,
  EyeOff,
  LogIn,
  AlertCircle,
  Loader2,
  Command,
  ShieldCheck,
  CheckCircle2
} from 'lucide-react'
import { useAdmin } from './AdminContext'
import AdminSidebar from './AdminSidebar'
import AdminHeader from './AdminHeader'
import AdminModal from './AdminModal'
import CommandPalette from './CommandPalette'

export default function AdminAuthGuard({ children }: { children: React.ReactNode }) {
  const {
    isAuthenticated,
    loginEmail,
    setLoginEmail,
    loginPassword,
    setLoginPassword,
    showPassword,
    setShowPassword,
    loginError,
    isLoggingIn,
    handleLogin,
    success
  } = useAdmin()

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#0a0a0f] text-white flex items-center justify-center p-4 relative overflow-hidden">
        {/* Background glow halos */}
        <div className="absolute top-1/4 -left-20 w-96 h-96 bg-[#7727ff]/15 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute bottom-1/4 -right-20 w-96 h-96 bg-[#6417ed]/15 rounded-full blur-[120px] pointer-events-none" />

        <div className="relative w-full max-w-md">
          {/* Brand Card */}
          <div className="bg-[#131318]/90 backdrop-blur-xl border border-[#2a2a35] rounded-3xl p-8 shadow-2xl">
            <div className="text-center mb-8">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#7727ff] to-[#6417ed] flex items-center justify-center mx-auto mb-4 shadow-xl shadow-purple-500/25">
                <Command size={28} className="text-white" />
              </div>
              <h1 className="text-2xl font-bold tracking-tight text-white">
                <span className="text-[#a77aff]">DS</span> Softwares
              </h1>
              <p className="text-xs text-[#a0a0b0] mt-1">Agency Management & Control Suite</p>
            </div>

            {/* Error Message */}
            {loginError && (
              <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs flex items-center gap-3">
                <AlertCircle size={16} className="shrink-0" />
                <span>{loginError}</span>
              </div>
            )}

            {/* Success Message */}
            {success && (
              <div className="mb-6 p-4 rounded-xl bg-green-500/10 border border-green-500/20 text-green-400 text-xs flex items-center gap-3">
                <CheckCircle2 size={16} className="shrink-0" />
                <span>{success}</span>
              </div>
            )}

            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[#a0a0b0] mb-2">
                  Admin Email
                </label>
                <div className="relative">
                  <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#808090]" />
                  <input
                    type="email"
                    required
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    placeholder="admin@dssoftwares.in"
                    className="w-full pl-10 pr-4 py-3 bg-[#1a1a24] border border-[#2a2a35] rounded-xl text-sm text-white focus:outline-none focus:border-[#7727ff] transition-colors placeholder-[#505060]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#a0a0b0] mb-2">
                  Password
                </label>
                <div className="relative">
                  <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#808090]" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    placeholder="Enter password"
                    className="w-full pl-10 pr-10 py-3 bg-[#1a1a24] border border-[#2a2a35] rounded-xl text-sm text-white focus:outline-none focus:border-[#7727ff] transition-colors placeholder-[#505060]"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#808090] hover:text-white transition-colors"
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoggingIn}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-gradient-to-r from-[#7727ff] to-[#6417ed] hover:shadow-lg hover:shadow-purple-500/25 text-sm font-semibold text-white transition-all disabled:opacity-50 mt-2"
              >
                {isLoggingIn ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    <span>Signing in...</span>
                  </>
                ) : (
                  <>
                    <LogIn size={16} />
                    <span>Sign In to Admin</span>
                  </>
                )}
              </button>
            </form>

            <div className="mt-6 pt-6 border-t border-[#2a2a35]/60 text-center">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#1a1a24] border border-[#2a2a35] text-[11px] text-[#a0a0b0]">
                <ShieldCheck size={13} className="text-emerald-400" />
                <span>Protected Enterprise Session</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white">
      {/* Dedicated Modular Sidebar */}
      <AdminSidebar />

      {/* Main Admin Content Container */}
      <div className="lg:pl-72 flex flex-col min-h-screen">
        {/* Dedicated Modular Header */}
        <AdminHeader />

        {/* Dynamic Route Content */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full">
          {children}
        </main>
      </div>

      {/* Unified Multi-Entity Modal */}
      <AdminModal />

      {/* Global Command Palette */}
      <CommandPalette />
    </div>
  )
}
