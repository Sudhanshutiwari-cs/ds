'use client'

import React, { useEffect, useState } from 'react'
import {
  Calendar,
  CheckCircle2,
  ChevronRight,
  FolderKanban,
  GraduationCap,
  Layers,
  Loader2,
  Plus,
  RefreshCw,
  Search,
  UserCheck,
  UserPlus,
  Users,
  X,
} from 'lucide-react'
import {
  crmSupabase,
  fetchBatches,
  createBatch,
  fetchTeams,
  createTeam,
  fetchInterns,
  assignIntern,
  onboardIntern,
  Batch,
  Team,
  Intern,
  Program,
} from '@/lib/crm-supabase'

export default function BatchesTeamsPage() {
  const [activeTab, setActiveTab] = useState<'batches' | 'teams' | 'interns'>('batches')
  const [loading, setLoading] = useState(true)

  // Data states
  const [batches, setBatches] = useState<Batch[]>([])
  const [teams, setTeams] = useState<Team[]>([])
  const [interns, setInterns] = useState<Intern[]>([])
  const [programs, setPrograms] = useState<Program[]>([])

  // Modal states
  const [isBatchModalOpen, setIsBatchModalOpen] = useState(false)
  const [isTeamModalOpen, setIsTeamModalOpen] = useState(false)
  const [isInternModalOpen, setIsInternModalOpen] = useState(false)
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false)
  const [selectedInternForAssign, setSelectedInternForAssign] = useState<Intern | null>(null)

  // Form states
  const [batchForm, setBatchForm] = useState({
    name: '',
    programId: '',
    startDate: '',
    endDate: '',
  })
  const [teamForm, setTeamForm] = useState({
    name: '',
    batchId: '',
  })
  const [internForm, setInternForm] = useState({
    fullName: '',
    phone: '',
    batchId: '',
    teamId: '',
  })
  const [assignForm, setAssignForm] = useState({
    batchId: '',
    teamId: '',
  })

  const [saving, setSaving] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')

  // Load all foundational data
  const loadData = async () => {
    setLoading(true)
    try {
      const [batchData, teamData, internData, programRes] = await Promise.all([
        fetchBatches(),
        fetchTeams(),
        fetchInterns(),
        crmSupabase.from('programs').select('*').eq('is_active', true),
      ])

      setBatches(batchData)
      setTeams(teamData)
      setInterns(internData)
      setPrograms(programRes.data || [])

      if (programRes.data && programRes.data.length > 0 && !batchForm.programId) {
        setBatchForm((prev) => ({ ...prev, programId: programRes.data[0].id }))
      }
      if (batchData && batchData.length > 0 && !teamForm.batchId) {
        setTeamForm((prev) => ({ ...prev, batchId: batchData[0].id }))
      }
    } catch (err) {
      console.error('Failed to load batches/teams:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  // Handle Batch Creation
  const handleCreateBatch = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!batchForm.name || !batchForm.startDate) return
    setSaving(true)
    try {
      let programId = batchForm.programId
      if (!programId) {
        // Fallback to first program if available or create a default
        const { data: firstProg } = await crmSupabase.from('programs').select('id').limit(1).maybeSingle()
        if (firstProg) {
          programId = firstProg.id
        } else {
          const { data: newProg } = await crmSupabase
            .from('programs')
            .insert([{ title: 'Engineering Internship Program', department: 'Engineering' }])
            .select()
            .single()
          programId = newProg?.id
        }
      }

      await createBatch({
        programId,
        name: batchForm.name,
        startDate: batchForm.startDate,
        endDate: batchForm.endDate || undefined,
      })

      setIsBatchModalOpen(false)
      setBatchForm({ name: '', programId: programs[0]?.id || '', startDate: '', endDate: '' })
      await loadData()
    } catch (err: any) {
      alert('Error creating batch: ' + (err.message || err))
    } finally {
      setSaving(false)
    }
  }

  // Handle Team Creation
  const handleCreateTeam = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!teamForm.name || !teamForm.batchId) {
      alert('Please select a batch and enter a team name.')
      return
    }
    setSaving(true)
    try {
      await createTeam({
        batchId: teamForm.batchId,
        name: teamForm.name,
      })

      setIsTeamModalOpen(false)
      setTeamForm({ name: '', batchId: batches[0]?.id || '' })
      await loadData()
    } catch (err: any) {
      alert('Error creating team: ' + (err.message || err))
    } finally {
      setSaving(false)
    }
  }

  // Handle Intern Onboarding
  const handleCreateIntern = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!internForm.fullName) return
    setSaving(true)
    try {
      await onboardIntern({
        fullName: internForm.fullName,
        phone: internForm.phone,
        batchId: internForm.batchId || undefined,
        teamId: internForm.teamId || undefined,
      })

      setIsInternModalOpen(false)
      setInternForm({ fullName: '', phone: '', batchId: '', teamId: '' })
      await loadData()
    } catch (err: any) {
      alert('Error onboarding intern: ' + (err.message || err))
    } finally {
      setSaving(false)
    }
  }

  // Handle Assignment Update
  const handleAssignSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedInternForAssign) return
    setSaving(true)
    try {
      await assignIntern(
        selectedInternForAssign.user_id,
        assignForm.batchId || null,
        assignForm.teamId || null
      )

      setIsAssignModalOpen(false)
      setSelectedInternForAssign(null)
      await loadData()
    } catch (err: any) {
      alert('Error updating assignment: ' + (err.message || err))
    } finally {
      setSaving(false)
    }
  }

  const openAssignModal = (intern: Intern) => {
    setSelectedInternForAssign(intern)
    setAssignForm({
      batchId: intern.batch_id || '',
      teamId: intern.team_id || '',
    })
    setIsAssignModalOpen(true)
  }

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col justify-between gap-4 rounded-2xl border border-[#2a2a35] bg-[#131318] p-5 sm:flex-row sm:items-center">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-2xl font-bold text-white">Batches & Teams Hub</h2>
            <span className="rounded-full border border-[#7727ff]/30 bg-[#7727ff]/20 px-2.5 py-0.5 text-xs font-semibold text-[#a77aff]">
              {batches.length} Batches · {teams.length} Teams
            </span>
          </div>
          <p className="mt-1 text-sm text-[#a0a0b0]">
            Organize accepted interns into cohorts, functional teams, and sprint squads
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={() => setIsBatchModalOpen(true)}
            className="flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-[#7727ff] to-[#6417ed] px-4 py-2 text-xs font-bold text-white shadow-lg shadow-purple-500/20 transition-all hover:brightness-110"
          >
            <Plus size={15} />
            <span>New Batch</span>
          </button>

          <button
            onClick={() => setIsTeamModalOpen(true)}
            disabled={batches.length === 0}
            className="flex items-center gap-1.5 rounded-xl border border-[#3a3545] bg-[#1a1a24] px-4 py-2 text-xs font-semibold text-white transition-all hover:bg-[#252532] disabled:opacity-40"
          >
            <Layers size={14} className="text-[#a77aff]" />
            <span>New Team</span>
          </button>

          <button
            onClick={() => setIsInternModalOpen(true)}
            className="flex items-center gap-1.5 rounded-xl border border-[#3a3545] bg-[#1a1a24] px-4 py-2 text-xs font-semibold text-white transition-all hover:bg-[#252532]"
          >
            <UserPlus size={14} className="text-[#a77aff]" />
            <span>Onboard Intern</span>
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

      {/* Navigation Tabs */}
      <div className="flex border-b border-[#2a2a35] gap-6 text-xs font-bold uppercase tracking-wider">
        <button
          onClick={() => setActiveTab('batches')}
          className={`pb-3 transition-colors ${
            activeTab === 'batches'
              ? 'border-b-2 border-[#7727ff] text-[#a77aff]'
              : 'text-[#808095] hover:text-white'
          }`}
        >
          Batches ({batches.length})
        </button>
        <button
          onClick={() => setActiveTab('teams')}
          className={`pb-3 transition-colors ${
            activeTab === 'teams'
              ? 'border-b-2 border-[#7727ff] text-[#a77aff]'
              : 'text-[#808095] hover:text-white'
          }`}
        >
          Teams & Squads ({teams.length})
        </button>
        <button
          onClick={() => setActiveTab('interns')}
          className={`pb-3 transition-colors ${
            activeTab === 'interns'
              ? 'border-b-2 border-[#7727ff] text-[#a77aff]'
              : 'text-[#808095] hover:text-white'
          }`}
        >
          Interns Directory ({interns.length})
        </button>
      </div>

      {/* TAB 1: BATCHES VIEW */}
      {activeTab === 'batches' && (
        <div className="space-y-4">
          {batches.length === 0 ? (
            <div className="rounded-2xl border border-[#2a2a35] bg-[#131318] p-12 text-center">
              <FolderKanban size={44} className="mx-auto mb-3 text-[#a0a0b0] opacity-40" />
              <h3 className="text-base font-semibold text-white">No Batches Created Yet</h3>
              <p className="mt-1 text-xs text-[#a0a0b0]">
                Create your first cohort (e.g. "Winter Batch 2026") to group interns and schedule teams.
              </p>
              <button
                onClick={() => setIsBatchModalOpen(true)}
                className="mt-5 inline-flex items-center gap-2 rounded-xl bg-[#6417ed] px-4 py-2 text-xs font-bold text-white hover:bg-[#7727ff]"
              >
                <Plus size={15} /> Create First Batch
              </button>
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {batches.map((batch) => {
                const batchTeams = teams.filter((t) => t.batch_id === batch.id)
                const batchInterns = interns.filter((i) => i.batch_id === batch.id)

                return (
                  <div
                    key={batch.id}
                    className="flex flex-col justify-between rounded-2xl border border-[#2a2a35] bg-[#131318] p-6 transition-all hover:border-[#7727ff]/50"
                  >
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="rounded-full border border-[#7727ff]/30 bg-[#7727ff]/15 px-2.5 py-0.5 text-[11px] font-bold text-[#a77aff]">
                          {batch.programs?.title || 'Internship Program'}
                        </span>
                        <span className="flex items-center gap-1 text-[11px] text-[#808095]">
                          <Calendar size={12} />
                          {new Date(batch.start_date).toLocaleDateString('en-US', {
                            month: 'short',
                            year: 'numeric',
                          })}
                        </span>
                      </div>

                      <h3 className="mt-3 text-lg font-bold text-white">{batch.name}</h3>

                      <div className="mt-4 flex items-center gap-4 text-xs text-[#a0a0b0]">
                        <span className="flex items-center gap-1.5 font-medium">
                          <Layers size={14} className="text-[#a77aff]" /> {batchTeams.length} Teams
                        </span>
                        <span className="flex items-center gap-1.5 font-medium">
                          <Users size={14} className="text-[#a77aff]" /> {batchInterns.length} Interns
                        </span>
                      </div>

                      {/* Team tags */}
                      <div className="mt-4 flex flex-wrap gap-1.5">
                        {batchTeams.length > 0 ? (
                          batchTeams.map((team) => (
                            <span
                              key={team.id}
                              className="rounded-lg border border-[#2a2a35] bg-[#1a1a24] px-2 py-0.5 text-[11px] text-[#d0ccda]"
                            >
                              {team.name}
                            </span>
                          ))
                        ) : (
                          <span className="text-[11px] text-[#606070] italic">No squads assigned yet</span>
                        )}
                      </div>
                    </div>

                    <div className="mt-6 border-t border-[#22222d] pt-4">
                      <button
                        onClick={() => {
                          setTeamForm({ name: '', batchId: batch.id })
                          setIsTeamModalOpen(true)
                        }}
                        className="inline-flex w-full items-center justify-center gap-1.5 rounded-xl border border-[#353042] bg-[#181622] py-2 text-xs font-semibold text-[#c8b4ff] hover:bg-[#252233]"
                      >
                        <Plus size={13} /> Add Squad to Batch
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: TEAMS VIEW */}
      {activeTab === 'teams' && (
        <div className="space-y-4">
          {teams.length === 0 ? (
            <div className="rounded-2xl border border-[#2a2a35] bg-[#131318] p-12 text-center">
              <Layers size={44} className="mx-auto mb-3 text-[#a0a0b0] opacity-40" />
              <h3 className="text-base font-semibold text-white">No Teams Found</h3>
              <p className="mt-1 text-xs text-[#a0a0b0]">
                Create functional squads (e.g. Frontend, Backend, AI Automation) under a batch.
              </p>
              <button
                onClick={() => setIsTeamModalOpen(true)}
                disabled={batches.length === 0}
                className="mt-5 inline-flex items-center gap-2 rounded-xl bg-[#6417ed] px-4 py-2 text-xs font-bold text-white hover:bg-[#7727ff] disabled:opacity-40"
              >
                <Plus size={15} /> Create Team
              </button>
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {teams.map((team) => {
                const teamInterns = interns.filter((i) => i.team_id === team.id)
                return (
                  <div
                    key={team.id}
                    className="flex flex-col justify-between rounded-2xl border border-[#2a2a35] bg-[#131318] p-6 transition-all hover:border-[#7727ff]/50"
                  >
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="rounded-full border border-[#2a2a35] bg-[#1a1a24] px-2.5 py-0.5 text-[11px] font-semibold text-[#a0a0b0]">
                          Batch: {team.batches?.name || 'Unassigned'}
                        </span>
                        <span className="flex items-center gap-1 text-[11px] text-[#a77aff] font-bold">
                          {teamInterns.length} Members
                        </span>
                      </div>

                      <h3 className="mt-3 text-lg font-bold text-white">{team.name}</h3>

                      <div className="mt-4 space-y-1.5">
                        <p className="text-[11px] font-semibold uppercase tracking-wider text-[#808095]">Assigned Interns:</p>
                        {teamInterns.length > 0 ? (
                          <div className="flex flex-wrap gap-1.5">
                            {teamInterns.map((intern) => (
                              <span
                                key={intern.user_id}
                                className="flex items-center gap-1 rounded-lg border border-[#353042] bg-[#16141c] px-2 py-0.5 text-xs text-[#d0ccda]"
                              >
                                <span className="size-1.5 rounded-full bg-[#22c55e]" />
                                {intern.full_name}
                              </span>
                            ))}
                          </div>
                        ) : (
                          <p className="text-xs text-[#606070] italic">No interns in this squad yet</p>
                        )}
                      </div>
                    </div>

                    <div className="mt-6 border-t border-[#22222d] pt-4">
                      <button
                        onClick={() => {
                          setActiveTab('interns')
                        }}
                        className="inline-flex w-full items-center justify-center gap-1.5 rounded-xl border border-[#353042] bg-[#181622] py-2 text-xs font-semibold text-[#c8b4ff] hover:bg-[#252233]"
                      >
                        Manage & Assign Interns <ChevronRight size={14} />
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      )}

      {/* TAB 3: INTERNS DIRECTORY */}
      {activeTab === 'interns' && (
        <div className="space-y-4">
          <div className="flex flex-col gap-3 rounded-2xl border border-[#2a2a35] bg-[#131318] p-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="relative flex-1 sm:max-w-md">
              <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#a0a0b0]" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search interns by name or phone..."
                className="w-full rounded-xl border border-[#2a2a35] bg-[#1a1a24] py-2 pl-9 pr-3 text-xs text-white placeholder-[#606070] focus:border-[#7727ff] focus:outline-none"
              />
            </div>

            <button
              onClick={() => setIsInternModalOpen(true)}
              className="flex items-center gap-1.5 rounded-xl bg-[#6417ed] px-4 py-2 text-xs font-bold text-white hover:bg-[#7727ff]"
            >
              <UserPlus size={14} />
              <span>Onboard Intern</span>
            </button>
          </div>

          {interns.length === 0 ? (
            <div className="rounded-2xl border border-[#2a2a35] bg-[#131318] p-12 text-center">
              <Users size={44} className="mx-auto mb-3 text-[#a0a0b0] opacity-40" />
              <h3 className="text-base font-semibold text-white">No Interns Registered Yet</h3>
              <p className="mt-1 text-xs text-[#a0a0b0]">
                Onboard new interns directly or accept candidates from the Applications portal.
              </p>
              <button
                onClick={() => setIsInternModalOpen(true)}
                className="mt-5 inline-flex items-center gap-2 rounded-xl bg-[#6417ed] px-4 py-2 text-xs font-bold text-white hover:bg-[#7727ff]"
              >
                <UserPlus size={15} /> Onboard First Intern
              </button>
            </div>
          ) : (
            <div className="overflow-hidden rounded-2xl border border-[#2a2a35] bg-[#131318]">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="border-b border-[#2a2a35] bg-[#16161d] text-[#808095]">
                    <tr>
                      <th className="px-5 py-3.5 font-semibold">Intern Name</th>
                      <th className="px-5 py-3.5 font-semibold">Assigned Batch</th>
                      <th className="px-5 py-3.5 font-semibold">Assigned Squad / Team</th>
                      <th className="px-5 py-3.5 font-semibold">Status</th>
                      <th className="px-5 py-3.5 font-semibold text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#2a2a35]">
                    {interns
                      .filter((i) =>
                        i.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        (i.phone && i.phone.includes(searchTerm))
                      )
                      .map((intern) => (
                        <tr key={intern.user_id} className="transition-colors hover:bg-[#1a1a24]/50">
                          <td className="px-5 py-4">
                            <span className="font-bold text-white">{intern.full_name}</span>
                            {intern.phone && <p className="text-[11px] text-[#808095] mt-0.5">{intern.phone}</p>}
                          </td>

                          <td className="px-5 py-4">
                            {intern.batches?.name ? (
                              <span className="font-medium text-[#c8b4ff]">{intern.batches.name}</span>
                            ) : (
                              <span className="text-[#606070] italic">Unassigned</span>
                            )}
                          </td>

                          <td className="px-5 py-4">
                            {intern.teams?.name ? (
                              <span className="inline-flex items-center gap-1 rounded-md border border-[#2a2a35] bg-[#16141c] px-2 py-0.5 font-medium text-white">
                                {intern.teams.name}
                              </span>
                            ) : (
                              <span className="text-[#606070] italic">No Squad</span>
                            )}
                          </td>

                          <td className="px-5 py-4">
                            <span className="inline-flex items-center gap-1 rounded-full border border-green-500/30 bg-green-500/10 px-2 py-0.5 text-[10px] font-bold text-green-400 capitalize">
                              <span className="size-1.5 rounded-full bg-green-400" />
                              {intern.status}
                            </span>
                          </td>

                          <td className="px-5 py-4 text-right">
                            <button
                              onClick={() => openAssignModal(intern)}
                              className="rounded-lg border border-[#3a3545] bg-[#1a1722] px-3 py-1 text-xs font-semibold text-[#a77aff] transition-all hover:bg-[#252230]"
                            >
                              Assign / Change
                            </button>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* MODAL 1: CREATE BATCH */}
      {isBatchModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl border border-[#3a3545] bg-[#131318] p-6 shadow-2xl">
            <div className="flex items-center justify-between pb-4 border-b border-[#2a2a35]">
              <h3 className="text-base font-bold text-white">Create New Batch / Cohort</h3>
              <button onClick={() => setIsBatchModalOpen(false)} className="text-[#a0a0b0] hover:text-white">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreateBatch} className="mt-5 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[#a0a0b0] mb-1">Batch Name *</label>
                <input
                  type="text"
                  required
                  value={batchForm.name}
                  onChange={(e) => setBatchForm({ ...batchForm, name: e.target.value })}
                  placeholder="e.g. Winter Cohort 2026"
                  className="w-full rounded-xl border border-[#2a2a35] bg-[#1a1a24] px-3.5 py-2.5 text-xs text-white focus:border-[#7727ff] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#a0a0b0] mb-1">Select Program *</label>
                <select
                  value={batchForm.programId}
                  onChange={(e) => setBatchForm({ ...batchForm, programId: e.target.value })}
                  className="w-full rounded-xl border border-[#2a2a35] bg-[#1a1a24] px-3.5 py-2.5 text-xs text-white focus:border-[#7727ff] focus:outline-none"
                >
                  {programs.map((prog) => (
                    <option key={prog.id} value={prog.id}>
                      {prog.title}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[#a0a0b0] mb-1">Start Date *</label>
                  <input
                    type="date"
                    required
                    value={batchForm.startDate}
                    onChange={(e) => setBatchForm({ ...batchForm, startDate: e.target.value })}
                    className="w-full rounded-xl border border-[#2a2a35] bg-[#1a1a24] px-3.5 py-2.5 text-xs text-white focus:border-[#7727ff] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#a0a0b0] mb-1">End Date</label>
                  <input
                    type="date"
                    value={batchForm.endDate}
                    onChange={(e) => setBatchForm({ ...batchForm, endDate: e.target.value })}
                    className="w-full rounded-xl border border-[#2a2a35] bg-[#1a1a24] px-3.5 py-2.5 text-xs text-white focus:border-[#7727ff] focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setIsBatchModalOpen(false)}
                  className="rounded-xl border border-[#2a2a35] px-4 py-2 text-xs font-semibold text-[#a0a0b0] hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="rounded-xl bg-[#6417ed] px-5 py-2 text-xs font-bold text-white hover:bg-[#7727ff] disabled:opacity-50"
                >
                  {saving ? 'Creating...' : 'Create Batch'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: CREATE TEAM */}
      {isTeamModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl border border-[#3a3545] bg-[#131318] p-6 shadow-2xl">
            <div className="flex items-center justify-between pb-4 border-b border-[#2a2a35]">
              <h3 className="text-base font-bold text-white">Create New Team / Squad</h3>
              <button onClick={() => setIsTeamModalOpen(false)} className="text-[#a0a0b0] hover:text-white">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreateTeam} className="mt-5 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[#a0a0b0] mb-1">Select Batch *</label>
                <select
                  required
                  value={teamForm.batchId}
                  onChange={(e) => setTeamForm({ ...teamForm, batchId: e.target.value })}
                  className="w-full rounded-xl border border-[#2a2a35] bg-[#1a1a24] px-3.5 py-2.5 text-xs text-white focus:border-[#7727ff] focus:outline-none"
                >
                  {batches.map((batch) => (
                    <option key={batch.id} value={batch.id}>
                      {batch.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#a0a0b0] mb-1">Squad Name *</label>
                <input
                  type="text"
                  required
                  value={teamForm.name}
                  onChange={(e) => setTeamForm({ ...teamForm, name: e.target.value })}
                  placeholder="e.g. Frontend Engineering Squad"
                  className="w-full rounded-xl border border-[#2a2a35] bg-[#1a1a24] px-3.5 py-2.5 text-xs text-white focus:border-[#7727ff] focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setIsTeamModalOpen(false)}
                  className="rounded-xl border border-[#2a2a35] px-4 py-2 text-xs font-semibold text-[#a0a0b0] hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="rounded-xl bg-[#6417ed] px-5 py-2 text-xs font-bold text-white hover:bg-[#7727ff] disabled:opacity-50"
                >
                  {saving ? 'Creating...' : 'Create Squad'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: ONBOARD INTERN */}
      {isInternModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl border border-[#3a3545] bg-[#131318] p-6 shadow-2xl">
            <div className="flex items-center justify-between pb-4 border-b border-[#2a2a35]">
              <h3 className="text-base font-bold text-white">Onboard New Intern</h3>
              <button onClick={() => setIsInternModalOpen(false)} className="text-[#a0a0b0] hover:text-white">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreateIntern} className="mt-5 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[#a0a0b0] mb-1">Full Name *</label>
                <input
                  type="text"
                  required
                  value={internForm.fullName}
                  onChange={(e) => setInternForm({ ...internForm, fullName: e.target.value })}
                  placeholder="e.g. Priyanshu Mehta"
                  className="w-full rounded-xl border border-[#2a2a35] bg-[#1a1a24] px-3.5 py-2.5 text-xs text-white focus:border-[#7727ff] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#a0a0b0] mb-1">Phone Number</label>
                <input
                  type="tel"
                  value={internForm.phone}
                  onChange={(e) => setInternForm({ ...internForm, phone: e.target.value })}
                  placeholder="+91 98765 43210"
                  className="w-full rounded-xl border border-[#2a2a35] bg-[#1a1a24] px-3.5 py-2.5 text-xs text-white focus:border-[#7727ff] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#a0a0b0] mb-1">Assign to Batch</label>
                <select
                  value={internForm.batchId}
                  onChange={(e) => setInternForm({ ...internForm, batchId: e.target.value, teamId: '' })}
                  className="w-full rounded-xl border border-[#2a2a35] bg-[#1a1a24] px-3.5 py-2.5 text-xs text-white focus:border-[#7727ff] focus:outline-none"
                >
                  <option value="">-- Select Batch (Optional) --</option>
                  {batches.map((batch) => (
                    <option key={batch.id} value={batch.id}>
                      {batch.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#a0a0b0] mb-1">Assign to Squad / Team</label>
                <select
                  value={internForm.teamId}
                  onChange={(e) => setInternForm({ ...internForm, teamId: e.target.value })}
                  className="w-full rounded-xl border border-[#2a2a35] bg-[#1a1a24] px-3.5 py-2.5 text-xs text-white focus:border-[#7727ff] focus:outline-none"
                >
                  <option value="">-- Select Team (Optional) --</option>
                  {teams
                    .filter((t) => !internForm.batchId || t.batch_id === internForm.batchId)
                    .map((team) => (
                      <option key={team.id} value={team.id}>
                        {team.name}
                      </option>
                    ))}
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setIsInternModalOpen(false)}
                  className="rounded-xl border border-[#2a2a35] px-4 py-2 text-xs font-semibold text-[#a0a0b0] hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="rounded-xl bg-[#6417ed] px-5 py-2 text-xs font-bold text-white hover:bg-[#7727ff] disabled:opacity-50"
                >
                  {saving ? 'Saving...' : 'Onboard Intern'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 4: ASSIGN INTERN */}
      {isAssignModalOpen && selectedInternForAssign && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl border border-[#3a3545] bg-[#131318] p-6 shadow-2xl">
            <div className="flex items-center justify-between pb-4 border-b border-[#2a2a35]">
              <div>
                <h3 className="text-base font-bold text-white">Assign Intern</h3>
                <p className="text-xs text-[#a0a0b0] mt-0.5">{selectedInternForAssign.full_name}</p>
              </div>
              <button onClick={() => setIsAssignModalOpen(false)} className="text-[#a0a0b0] hover:text-white">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleAssignSubmit} className="mt-5 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[#a0a0b0] mb-1">Select Batch</label>
                <select
                  value={assignForm.batchId}
                  onChange={(e) => setAssignForm({ ...assignForm, batchId: e.target.value, teamId: '' })}
                  className="w-full rounded-xl border border-[#2a2a35] bg-[#1a1a24] px-3.5 py-2.5 text-xs text-white focus:border-[#7727ff] focus:outline-none"
                >
                  <option value="">-- No Batch --</option>
                  {batches.map((batch) => (
                    <option key={batch.id} value={batch.id}>
                      {batch.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#a0a0b0] mb-1">Select Squad / Team</label>
                <select
                  value={assignForm.teamId}
                  onChange={(e) => setAssignForm({ ...assignForm, teamId: e.target.value })}
                  className="w-full rounded-xl border border-[#2a2a35] bg-[#1a1a24] px-3.5 py-2.5 text-xs text-white focus:border-[#7727ff] focus:outline-none"
                >
                  <option value="">-- No Team --</option>
                  {teams
                    .filter((t) => !assignForm.batchId || t.batch_id === assignForm.batchId)
                    .map((team) => (
                      <option key={team.id} value={team.id}>
                        {team.name}
                      </option>
                    ))}
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setIsAssignModalOpen(false)}
                  className="rounded-xl border border-[#2a2a35] px-4 py-2 text-xs font-semibold text-[#a0a0b0] hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="rounded-xl bg-[#6417ed] px-5 py-2 text-xs font-bold text-white hover:bg-[#7727ff] disabled:opacity-50"
                >
                  {saving ? 'Updating...' : 'Save Assignment'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
