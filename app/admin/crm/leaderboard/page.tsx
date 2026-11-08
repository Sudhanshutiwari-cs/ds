'use client'

import React, { useEffect, useState } from 'react'
import {
  Award,
  Crown,
  Flame,
  Medal,
  Plus,
  RefreshCw,
  Search,
  Shield,
  Sparkles,
  Trophy,
  User,
  X,
  Zap,
} from 'lucide-react'
import {
  fetchLeaderboard,
  grantInternXP,
  fetchInterns,
  InternGamification,
  Intern,
} from '@/lib/crm-supabase'

const tierColors: Record<string, { bg: string; text: string; border: string }> = {
  'Apprentice': { bg: 'bg-blue-500/10', text: 'text-blue-400', border: 'border-blue-500/30' },
  'Craftsman': { bg: 'bg-emerald-500/10', text: 'text-emerald-400', border: 'border-emerald-500/30' },
  'Full-Stack Vanguard': { bg: 'bg-purple-500/10', text: 'text-purple-400', border: 'border-purple-500/30' },
  'Architect Fellow': { bg: 'bg-amber-500/10', text: 'text-amber-400', border: 'border-amber-500/30' },
}

export default function CrmLeaderboardPage() {
  const [leaderboard, setLeaderboard] = useState<InternGamification[]>([])
  const [interns, setInterns] = useState<Intern[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')

  // Award XP Modal
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [awarding, setAwarding] = useState(false)
  const [form, setForm] = useState({
    internId: '',
    xpAmount: 50,
    badge: 'Clean Code Ninja',
  })

  const loadData = async () => {
    setLoading(true)
    try {
      const [boardData, internsData] = await Promise.all([
        fetchLeaderboard(),
        fetchInterns(),
      ])
      setLeaderboard(boardData)
      setInterns(internsData)

      if (internsData.length > 0 && !form.internId) {
        setForm((prev) => ({ ...prev, internId: internsData[0].user_id }))
      }
    } catch (err) {
      console.error('Failed to load leaderboard:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  const handleAwardSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.internId) return

    setAwarding(true)
    try {
      const updated = await grantInternXP(form.internId, Number(form.xpAmount), form.badge)
      setLeaderboard((prev) =>
        prev
          .map((item) => (item.intern_id === form.internId ? { ...item, ...updated } : item))
          .sort((a, b) => b.xp - a.xp)
      )
      setIsModalOpen(false)
    } catch (err: any) {
      alert(`Failed to grant XP: ${err.message}`)
    } finally {
      setAwarding(false)
    }
  }

  const filtered = leaderboard.filter((item) => {
    const name = item.interns?.full_name?.toLowerCase() || ''
    const squad = item.interns?.teams?.name?.toLowerCase() || ''
    const q = searchTerm.toLowerCase()
    return name.includes(q) || squad.includes(q)
  })

  const topThree = leaderboard.slice(0, 3)

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col justify-between gap-4 rounded-2xl border border-[#2a2a35] bg-[#131318] p-5 sm:flex-row sm:items-center">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-2xl font-bold text-white">Developer XP & Squad Leaderboard</h2>
            <span className="rounded-full border border-amber-500/30 bg-amber-500/10 px-2.5 py-0.5 text-xs font-semibold text-amber-300 flex items-center gap-1">
              <Trophy size={13} />
              Sprint Gamification Engine
            </span>
          </div>
          <p className="mt-1 text-sm text-[#a0a0b0]">
            Track intern shipping velocity, standup consistency, streak multipliers, and unlockable developer badges
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={loadData}
            className="flex items-center gap-2 rounded-xl border border-[#2a2a35] bg-[#1a1a24] px-3.5 py-2 text-xs font-medium text-white transition-all hover:bg-[#252532]"
            title="Refresh rankings"
          >
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
            <span>Sync</span>
          </button>

          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 px-4 py-2 text-xs font-bold text-black shadow-lg shadow-amber-500/20 hover:brightness-110"
          >
            <Plus size={15} />
            <span>Grant XP & Badges</span>
          </button>
        </div>
      </div>

      {/* Podium Cards (Top 3) */}
      {topThree.length > 0 && (
        <div className="grid gap-4 sm:grid-cols-3">
          {topThree.map((item, index) => {
            const isGold = index === 0
            const isSilver = index === 1
            const badgeIcon = isGold ? <Crown size={22} className="text-amber-400" /> : isSilver ? <Medal size={22} className="text-slate-300" /> : <Medal size={22} className="text-amber-600" />
            const glowClass = isGold ? 'border-amber-500/40 bg-gradient-to-b from-amber-500/10 to-[#131318]' : 'border-[#2a2a35] bg-[#131318]'

            return (
              <div key={item.id} className={`rounded-2xl border p-5 relative overflow-hidden ${glowClass}`}>
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[#a0a0b0]">
                    Rank #{index + 1}
                  </span>
                  {badgeIcon}
                </div>

                <div className="mt-3">
                  <h3 className="text-lg font-bold text-white">{item.interns?.full_name || 'Intern'}</h3>
                  <p className="text-xs text-[#a0a0b0]">{item.interns?.teams?.name || 'Squad Alpha'}</p>
                </div>

                <div className="mt-4 flex items-center justify-between pt-3 border-t border-[#2a2a35]">
                  <div>
                    <span className="text-xs text-[#808095]">Total Score</span>
                    <p className="text-2xl font-black text-amber-300">{item.xp} <span className="text-xs font-normal text-[#a0a0b0]">XP</span></p>
                  </div>
                  <div className="text-right">
                    <span className="text-xs text-[#808095]">Level {item.level}</span>
                    <p className="text-xs font-semibold text-purple-300">{item.tier}</p>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Search and Filters */}
      <div className="flex items-center justify-between rounded-2xl border border-[#2a2a35] bg-[#131318] p-4">
        <div className="relative flex-1 max-w-md">
          <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#a0a0b0]" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by intern name or squad..."
            className="w-full rounded-xl border border-[#2a2a35] bg-[#1a1a24] py-2 pl-9 pr-3 text-xs text-white placeholder-[#606070] focus:border-[#7727ff] focus:outline-none"
          />
        </div>
        <p className="text-xs text-[#808095] hidden sm:block">
          Streak Multiplier: +10% XP per 3-day consecutive standup submission
        </p>
      </div>

      {/* Leaderboard Table */}
      <div className="overflow-hidden rounded-2xl border border-[#2a2a35] bg-[#131318]">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-[#2a2a35] bg-[#16161d] text-[#808095]">
              <tr>
                <th className="px-5 py-3.5 font-semibold">Rank</th>
                <th className="px-5 py-3.5 font-semibold">Intern / Squad</th>
                <th className="px-5 py-3.5 font-semibold">Tier & Level</th>
                <th className="px-5 py-3.5 font-semibold">Experience (XP)</th>
                <th className="px-5 py-3.5 font-semibold">Streak</th>
                <th className="px-5 py-3.5 font-semibold">Badges Earned</th>
                <th className="px-5 py-3.5 font-semibold text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#2a2a35]">
              {filtered.map((item, idx) => {
                const style = tierColors[item.tier] || tierColors['Apprentice']
                const nextLevelXp = item.level * 250
                const currentLevelXp = (item.level - 1) * 250
                const progressPct = Math.min(100, Math.max(10, Math.round(((item.xp - currentLevelXp) / 250) * 100)))

                return (
                  <tr key={item.id} className="transition-colors hover:bg-[#1a1a24]/50">
                    <td className="px-5 py-4 font-mono font-bold text-white text-sm">
                      {idx === 0 ? '🥇 #1' : idx === 1 ? '🥈 #2' : idx === 2 ? '🥉 #3' : `#${idx + 1}`}
                    </td>

                    <td className="px-5 py-4">
                      <div className="font-bold text-white flex items-center gap-2">
                        <User size={13} className="text-[#a77aff]" />
                        {item.interns?.full_name || 'Intern'}
                      </div>
                      <span className="text-[11px] text-[#808095] mt-0.5 block">
                        {item.interns?.teams?.name || 'Squad Alpha'}
                      </span>
                    </td>

                    <td className="px-5 py-4">
                      <span
                        className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-[11px] font-bold ${style.bg} ${style.text} ${style.border}`}
                      >
                        {item.tier} (Lvl {item.level})
                      </span>
                      <div className="w-24 bg-[#1f1e26] h-1.5 rounded-full mt-1.5 overflow-hidden">
                        <div className="bg-gradient-to-r from-purple-500 to-amber-400 h-full rounded-full" style={{ width: `${progressPct}%` }} />
                      </div>
                    </td>

                    <td className="px-5 py-4 font-bold text-amber-300 font-mono text-sm">
                      {item.xp} <span className="text-[10px] text-[#a0a0b0] font-normal">XP</span>
                    </td>

                    <td className="px-5 py-4">
                      <span className="inline-flex items-center gap-1 rounded-lg bg-orange-500/10 border border-orange-500/30 px-2 py-0.5 text-orange-400 font-semibold text-[11px]">
                        <Flame size={12} className="text-orange-400 animate-pulse" />
                        {item.streak_days} Days
                      </span>
                    </td>

                    <td className="px-5 py-4">
                      <div className="flex flex-wrap gap-1 max-w-xs">
                        {(item.badges || []).map((b) => (
                          <span
                            key={b}
                            className="rounded-md border border-[#3a3545] bg-[#1a1722] px-2 py-0.5 text-[10px] text-purple-300 font-medium"
                          >
                            ⭐ {b}
                          </span>
                        ))}
                      </div>
                    </td>

                    <td className="px-5 py-4 text-right">
                      <button
                        onClick={() => {
                          setForm({ internId: item.intern_id, xpAmount: 50, badge: 'Sprint Champion' })
                          setIsModalOpen(true)
                        }}
                        className="rounded-lg border border-[#3a3545] bg-[#1a1722] px-2.5 py-1 text-[11px] font-semibold text-amber-300 hover:bg-[#252230] transition-colors"
                      >
                        + Grant XP
                      </button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* AWARD XP MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl border border-amber-500/30 bg-[#131318] p-6 shadow-2xl">
            <div className="flex items-center justify-between pb-4 border-b border-[#2a2a35]">
              <div className="flex items-center gap-2">
                <div className="rounded-xl bg-amber-500/20 p-2 text-amber-400">
                  <Zap size={18} />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">Award Developer XP & Badges</h3>
                  <p className="text-xs text-[#a0a0b0]">Reward intern achievements and milestone shipping</p>
                </div>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="text-[#a0a0b0] hover:text-white">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleAwardSubmit} className="mt-5 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[#a0a0b0] mb-1">Select Intern *</label>
                <select
                  required
                  value={form.internId}
                  onChange={(e) => setForm({ ...form, internId: e.target.value })}
                  className="w-full rounded-xl border border-[#2a2a35] bg-[#1a1a24] px-3.5 py-2.5 text-xs text-white focus:border-amber-500 focus:outline-none"
                >
                  {interns.map((i) => (
                    <option key={i.user_id} value={i.user_id}>
                      {i.full_name} ({i.teams?.name || 'Squad'})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#a0a0b0] mb-1">XP Points to Grant *</label>
                <div className="grid grid-cols-4 gap-2">
                  {[25, 50, 100, 250].map((amt) => (
                    <button
                      key={amt}
                      type="button"
                      onClick={() => setForm({ ...form, xpAmount: amt })}
                      className={`rounded-xl border py-2 text-xs font-bold transition-all ${
                        form.xpAmount === amt
                          ? 'border-amber-500 bg-amber-500/20 text-amber-300'
                          : 'border-[#2a2a35] bg-[#1a1a24] text-[#a0a0b0] hover:text-white'
                      }`}
                    >
                      +{amt} XP
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#a0a0b0] mb-1">Unlock Badge (Optional)</label>
                <select
                  value={form.badge}
                  onChange={(e) => setForm({ ...form, badge: e.target.value })}
                  className="w-full rounded-xl border border-[#2a2a35] bg-[#1a1a24] px-3.5 py-2.5 text-xs text-white focus:border-amber-500 focus:outline-none"
                >
                  <option value="Clean Code Ninja">🥷 Clean Code Ninja (Architecture Excellence)</option>
                  <option value="Sprint Champion">🏆 Sprint Champion (Zero Incomplete Tasks)</option>
                  <option value="Bug Hunter">🐞 Bug Hunter (High QA Resolution Rate)</option>
                  <option value="Night Owl Committer">🌙 Night Owl Committer (Late Night Fix)</option>
                  <option value="Peer Mentor">🤝 Peer Mentor (Helped Fellow Interns)</option>
                </select>
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
                  disabled={awarding}
                  className="rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 px-5 py-2 text-xs font-bold text-black hover:brightness-110 disabled:opacity-50"
                >
                  {awarding ? 'Granting...' : 'Confirm XP Grant'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
