'use client'

import React, { useEffect, useState } from 'react'
import {
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  Calendar,
  CheckCircle2,
  CheckSquare,
  Clock,
  Filter,
  Layers,
  Loader2,
  MoreVertical,
  Plus,
  RefreshCw,
  Search,
  Trash2,
  User,
  Users,
  X,
} from 'lucide-react'
import {
  crmSupabase,
  fetchTasks,
  createTask,
  updateTaskStatus,
  updateTask,
  deleteTask,
  fetchTeams,
  fetchInterns,
  Task,
  TaskPriority,
  TaskStatus,
  Team,
  Intern,
} from '@/lib/crm-supabase'

const columns: { id: TaskStatus; label: string; bg: string; border: string; accent: string }[] = [
  { id: 'todo', label: 'To Do', bg: 'bg-blue-500/10', border: 'border-blue-500/30', accent: 'text-blue-400' },
  { id: 'in_progress', label: 'In Progress', bg: 'bg-[#7727ff]/10', border: 'border-[#7727ff]/30', accent: 'text-[#a77aff]' },
  { id: 'review', label: 'In Review', bg: 'bg-amber-500/10', border: 'border-amber-500/30', accent: 'text-amber-400' },
  { id: 'done', label: 'Completed', bg: 'bg-emerald-500/10', border: 'border-emerald-500/30', accent: 'text-emerald-400' },
]

const priorityColors: Record<TaskPriority, { bg: string; text: string; dot: string }> = {
  urgent: { bg: 'bg-red-500/15', text: 'text-red-400', dot: 'bg-red-400' },
  high: { bg: 'bg-orange-500/15', text: 'text-orange-400', dot: 'bg-orange-400' },
  medium: { bg: 'bg-purple-500/15', text: 'text-[#c8b4ff]', dot: 'bg-[#a77aff]' },
  low: { bg: 'bg-slate-500/15', text: 'text-slate-400', dot: 'bg-slate-400' },
}

export default function CrmTasksPage() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [teams, setTeams] = useState<Team[]>([])
  const [interns, setInterns] = useState<Intern[]>([])
  const [loading, setLoading] = useState(true)

  // Filters
  const [selectedTeamFilter, setSelectedTeamFilter] = useState<string>('all')
  const [selectedPriorityFilter, setSelectedPriorityFilter] = useState<string>('all')
  const [searchQuery, setSearchQuery] = useState('')

  // Modals
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [selectedTask, setSelectedTask] = useState<Task | null>(null)
  const [saving, setSaving] = useState(false)

  // Form State
  const [taskForm, setTaskForm] = useState<{
    title: string
    description: string
    teamId: string
    assignedTo: string
    priority: TaskPriority
    dueDate: string
  }>({
    title: '',
    description: '',
    teamId: '',
    assignedTo: '',
    priority: 'medium',
    dueDate: '',
  })

  const loadData = async () => {
    setLoading(true)
    try {
      const [tasksData, teamsData, internsData] = await Promise.all([
        fetchTasks(),
        fetchTeams(),
        fetchInterns(),
      ])

      setTasks(tasksData)
      setTeams(teamsData)
      setInterns(internsData)

      if (teamsData.length > 0 && !taskForm.teamId) {
        setTaskForm((prev) => ({ ...prev, teamId: teamsData[0].id }))
      }
    } catch (err) {
      console.error('Failed to load tasks data:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  // Create Task
  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!taskForm.title || !taskForm.teamId) {
      alert('Please fill in task title and select a squad.')
      return
    }

    setSaving(true)
    try {
      const newTask = await createTask({
        title: taskForm.title,
        description: taskForm.description,
        teamId: taskForm.teamId,
        assignedTo: taskForm.assignedTo || undefined,
        priority: taskForm.priority,
        dueDate: taskForm.dueDate || undefined,
      })

      setTasks((prev) => [newTask, ...prev])
      setIsCreateModalOpen(false)
      setTaskForm({
        title: '',
        description: '',
        teamId: teams[0]?.id || '',
        assignedTo: '',
        priority: 'medium',
        dueDate: '',
      })
    } catch (err: any) {
      alert('Failed to create task: ' + (err.message || err))
    } finally {
      setSaving(false)
    }
  }

  // Move Column / Change Status (Optimistic)
  const handleMoveStatus = async (taskId: string, targetStatus: TaskStatus) => {
    // 1. Optimistic Update
    setTasks((prev) =>
      prev.map((t) => (t.id === taskId ? { ...t, status: targetStatus } : t))
    )

    try {
      await updateTaskStatus(taskId, targetStatus)
    } catch (err) {
      console.error('Failed to sync task status:', err)
      // Revert if error
      await loadData()
    }
  }

  // Delete Task
  const handleDeleteTask = async (taskId: string) => {
    if (!confirm('Are you sure you want to delete this task?')) return
    setTasks((prev) => prev.filter((t) => t.id !== taskId))
    try {
      await deleteTask(taskId)
    } catch (err: any) {
      alert('Failed to delete task: ' + (err.message || err))
      await loadData()
    }
  }

  // Open Edit Modal
  const openEditModal = (task: Task) => {
    setSelectedTask(task)
    setTaskForm({
      title: task.title,
      description: task.description || '',
      teamId: task.team_id,
      assignedTo: task.assigned_to || '',
      priority: task.priority,
      dueDate: task.due_date ? task.due_date.substring(0, 10) : '',
    })
    setIsEditModalOpen(true)
  }

  // Save Edit
  const handleUpdateTask = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedTask) return
    setSaving(true)
    try {
      const updated = await updateTask(selectedTask.id, {
        title: taskForm.title,
        description: taskForm.description || null,
        team_id: taskForm.teamId,
        assigned_to: taskForm.assignedTo || null,
        priority: taskForm.priority,
        due_date: taskForm.dueDate || null,
      })

      setTasks((prev) => prev.map((t) => (t.id === selectedTask.id ? updated : t)))
      setIsEditModalOpen(false)
      setSelectedTask(null)
    } catch (err: any) {
      alert('Failed to update task: ' + (err.message || err))
    } finally {
      setSaving(false)
    }
  }

  // Filtered Tasks
  const filteredTasks = tasks.filter((task) => {
    const matchesSearch =
      task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (task.description && task.description.toLowerCase().includes(searchQuery.toLowerCase()))

    const matchesTeam = selectedTeamFilter === 'all' || task.team_id === selectedTeamFilter
    const matchesPriority = selectedPriorityFilter === 'all' || task.priority === selectedPriorityFilter

    return matchesSearch && matchesTeam && matchesPriority
  })

  // Quick stats
  const totalCount = tasks.length
  const doneCount = tasks.filter((t) => t.status === 'done').length
  const progressPct = totalCount > 0 ? Math.round((doneCount / totalCount) * 100) : 0

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col justify-between gap-4 rounded-2xl border border-[#2a2a35] bg-[#131318] p-5 sm:flex-row sm:items-center">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-2xl font-bold text-white">Internship Task Board</h2>
            <span className="rounded-full border border-[#7727ff]/30 bg-[#7727ff]/20 px-2.5 py-0.5 text-xs font-semibold text-[#a77aff]">
              {tasks.length} Total Tasks
            </span>
          </div>
          <p className="mt-1 text-sm text-[#a0a0b0]">
            Sprint planning, task assignments, and progress tracking across all intern squads
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={() => setIsCreateModalOpen(true)}
            disabled={teams.length === 0}
            className="flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-[#7727ff] to-[#6417ed] px-4 py-2 text-xs font-bold text-white shadow-lg shadow-purple-500/20 transition-all hover:brightness-110 disabled:opacity-50"
          >
            <Plus size={15} />
            <span>New Task</span>
          </button>

          <button
            onClick={loadData}
            className="flex size-9 items-center justify-center rounded-xl border border-[#2a2a35] bg-[#1a1a24] text-[#a0a0b0] hover:text-white"
            title="Refresh board"
          >
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
          </button>
        </div>
      </div>

      {/* Progress & Stats Bar */}
      <div className="flex flex-col justify-between gap-4 rounded-2xl border border-[#2a2a35] bg-[#131318] p-4 sm:flex-row sm:items-center">
        <div className="flex items-center gap-3">
          <div className="flex size-10 items-center justify-center rounded-xl border border-[#7727ff]/30 bg-[#7727ff]/15 text-[#a77aff]">
            <CheckSquare size={18} />
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-[#a0a0b0]">Sprint Velocity</p>
            <p className="text-sm font-bold text-white">
              {doneCount} of {totalCount} Tasks Completed ({progressPct}%)
            </p>
          </div>
        </div>

        <div className="w-full sm:w-64">
          <div className="h-2 w-full overflow-hidden rounded-full bg-[#1a1a24]">
            <div
              className="h-full bg-gradient-to-r from-[#7727ff] to-[#22c55e] transition-all duration-500"
              style={{ width: `${progressPct}%` }}
            />
          </div>
        </div>
      </div>

      {/* Filters and Search Bar */}
      <div className="flex flex-col gap-3 rounded-2xl border border-[#2a2a35] bg-[#131318] p-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1 sm:max-w-xs">
          <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#a0a0b0]" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search tasks..."
            className="w-full rounded-xl border border-[#2a2a35] bg-[#1a1a24] py-2 pl-9 pr-3 text-xs text-white placeholder-[#606070] focus:border-[#7727ff] focus:outline-none"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Squad Filter */}
          <div className="flex items-center gap-2 text-xs">
            <span className="font-semibold text-[#808095]">Squad:</span>
            <select
              value={selectedTeamFilter}
              onChange={(e) => setSelectedTeamFilter(e.target.value)}
              className="rounded-xl border border-[#2a2a35] bg-[#1a1a24] px-2.5 py-1.5 text-xs text-white focus:border-[#7727ff] focus:outline-none"
            >
              <option value="all">All Squads ({teams.length})</option>
              {teams.map((team) => (
                <option key={team.id} value={team.id}>
                  {team.name}
                </option>
              ))}
            </select>
          </div>

          {/* Priority Filter */}
          <div className="flex items-center gap-2 text-xs">
            <span className="font-semibold text-[#808095]">Priority:</span>
            <select
              value={selectedPriorityFilter}
              onChange={(e) => setSelectedPriorityFilter(e.target.value)}
              className="rounded-xl border border-[#2a2a35] bg-[#1a1a24] px-2.5 py-1.5 text-xs text-white focus:border-[#7727ff] focus:outline-none"
            >
              <option value="all">All Priorities</option>
              <option value="urgent">Urgent</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
          </div>
        </div>
      </div>

      {/* KANBAN BOARD COLUMNS */}
      {loading ? (
        <div className="flex h-64 items-center justify-center rounded-2xl border border-[#2a2a35] bg-[#131318]">
          <Loader2 size={24} className="animate-spin text-[#7727ff]" />
          <span className="ml-3 text-sm text-[#a0a0b0]">Loading Kanban cards...</span>
        </div>
      ) : teams.length === 0 ? (
        <div className="rounded-2xl border border-[#2a2a35] bg-[#131318] p-12 text-center">
          <Layers size={44} className="mx-auto mb-3 text-[#a0a0b0] opacity-40" />
          <h3 className="text-base font-semibold text-white">Create a Squad First</h3>
          <p className="mt-1 text-xs text-[#a0a0b0]">
            Tasks must be assigned to a team squad (e.g. Frontend, Backend). Please create a squad in Batches & Squads first.
          </p>
          <a
            href="/admin/crm/batches"
            className="mt-5 inline-flex items-center gap-2 rounded-xl bg-[#6417ed] px-4 py-2 text-xs font-bold text-white hover:bg-[#7727ff]"
          >
            Go to Batches & Squads
          </a>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {columns.map((col, colIdx) => {
            const colTasks = filteredTasks.filter((t) => t.status === col.id)

            return (
              <div
                key={col.id}
                className="flex flex-col rounded-2xl border border-[#2a2a35] bg-[#111015] p-3.5"
              >
                {/* Column Header */}
                <div className="flex items-center justify-between px-2 pb-3 border-b border-[#22222d]">
                  <div className="flex items-center gap-2">
                    <span className={`size-2.5 rounded-full ${col.bg} ${col.border} border`} />
                    <h3 className="text-xs font-bold uppercase tracking-wider text-white">{col.label}</h3>
                  </div>
                  <span className="rounded-full bg-[#1e1c24] px-2 py-0.5 text-[11px] font-bold text-[#a0a0b0]">
                    {colTasks.length}
                  </span>
                </div>

                {/* Column Tasks List */}
                <div className="mt-3 flex-1 space-y-3 overflow-y-auto max-h-[calc(100vh-320px)] scrollbar-none pr-0.5">
                  {colTasks.length === 0 ? (
                    <div className="rounded-xl border border-dashed border-[#26242e] p-6 text-center text-xs text-[#606070]">
                      No tasks in {col.label}
                    </div>
                  ) : (
                    colTasks.map((task) => {
                      const priority = priorityColors[task.priority] || priorityColors.medium
                      const isOverdue =
                        task.due_date &&
                        new Date(task.due_date) < new Date() &&
                        task.status !== 'done'

                      return (
                        <div
                          key={task.id}
                          className="group relative rounded-xl border border-[#2a2a35] bg-[#16141c] p-4 shadow-sm transition-all hover:border-[#7727ff]/60 hover:shadow-md"
                        >
                          {/* Priority & Team Tag */}
                          <div className="flex items-center justify-between gap-2">
                            <span
                              className={`inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${priority.bg} ${priority.text}`}
                            >
                              <span className={`size-1.5 rounded-full ${priority.dot}`} />
                              {task.priority}
                            </span>

                            <span className="truncate text-[10px] font-semibold text-[#8e8a99]">
                              {task.teams?.name || 'Squad'}
                            </span>
                          </div>

                          {/* Task Title */}
                          <h4
                            onClick={() => openEditModal(task)}
                            className="mt-2 text-xs font-bold text-white line-clamp-2 hover:text-[#a77aff] cursor-pointer"
                          >
                            {task.title}
                          </h4>

                          {/* Description snippet */}
                          {task.description && (
                            <p className="mt-1 text-[11px] text-[#a0a0b0] line-clamp-2 leading-relaxed">
                              {task.description}
                            </p>
                          )}

                          {/* Due Date & Assignee */}
                          <div className="mt-3 flex items-center justify-between pt-2.5 border-t border-[#22202a] text-[11px]">
                            {/* Assignee */}
                            <div className="flex items-center gap-1.5 text-[#d0ccda] truncate max-w-[130px]">
                              <span className="flex size-5 items-center justify-center rounded-full bg-[#7727ff]/20 text-[#a77aff] text-[10px] shrink-0">
                                <User size={10} />
                              </span>
                              <span className="truncate">{task.interns?.full_name || 'Unassigned'}</span>
                            </div>

                            {/* Due Date */}
                            {task.due_date && (
                              <span
                                className={`flex items-center gap-1 text-[10px] font-medium shrink-0 ${
                                  isOverdue ? 'text-red-400 font-bold' : 'text-[#8e8a99]'
                                }`}
                              >
                                <Calendar size={11} />
                                {new Date(task.due_date).toLocaleDateString('en-US', {
                                  month: 'short',
                                  day: 'numeric',
                                })}
                              </span>
                            )}
                          </div>

                          {/* Action Footer (Move Left/Right + Edit + Delete) */}
                          <div className="mt-3 flex items-center justify-between border-t border-[#201e28] pt-2 text-xs">
                            <div className="flex items-center gap-1">
                              {colIdx > 0 && (
                                <button
                                  onClick={() => handleMoveStatus(task.id, columns[colIdx - 1].id)}
                                  className="flex size-6 items-center justify-center rounded-md border border-[#2b2735] bg-[#1a1722] text-[#a0a0b0] hover:text-white"
                                  title={`Move to ${columns[colIdx - 1].label}`}
                                >
                                  <ArrowLeft size={11} />
                                </button>
                              )}
                              {colIdx < columns.length - 1 && (
                                <button
                                  onClick={() => handleMoveStatus(task.id, columns[colIdx + 1].id)}
                                  className="flex size-6 items-center justify-center rounded-md border border-[#2b2735] bg-[#1a1722] text-[#a0a0b0] hover:text-white"
                                  title={`Move to ${columns[colIdx + 1].label}`}
                                >
                                  <ArrowRight size={11} />
                                </button>
                              )}
                            </div>

                            <div className="flex items-center gap-1.5">
                              <button
                                onClick={() => openEditModal(task)}
                                className="text-[11px] text-[#a77aff] hover:underline"
                              >
                                Edit
                              </button>
                              <span className="text-[#3a3545]">·</span>
                              <button
                                onClick={() => handleDeleteTask(task.id)}
                                className="text-[11px] text-rose-400 hover:underline"
                              >
                                Delete
                              </button>
                            </div>
                          </div>
                        </div>
                      )
                    })
                  )}
                </div>

                {/* Quick Add Card to Column */}
                <button
                  onClick={() => {
                    setTaskForm((prev) => ({
                      ...prev,
                      teamId: teams[0]?.id || '',
                    }))
                    setIsCreateModalOpen(true)
                  }}
                  className="mt-3 flex w-full items-center justify-center gap-1 rounded-xl border border-dashed border-[#2a2a35] py-2 text-xs font-semibold text-[#808095] hover:border-[#7727ff]/50 hover:text-white"
                >
                  <Plus size={13} /> Add Task
                </button>
              </div>
            )
          })}
        </div>
      )}

      {/* MODAL 1: CREATE TASK */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-2xl border border-[#3a3545] bg-[#131318] p-6 shadow-2xl">
            <div className="flex items-center justify-between pb-4 border-b border-[#2a2a35]">
              <h3 className="text-base font-bold text-white">Create New Task</h3>
              <button onClick={() => setIsCreateModalOpen(false)} className="text-[#a0a0b0] hover:text-white">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreateTask} className="mt-5 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[#a0a0b0] mb-1">Task Title *</label>
                <input
                  type="text"
                  required
                  value={taskForm.title}
                  onChange={(e) => setTaskForm({ ...taskForm, title: e.target.value })}
                  placeholder="e.g. Implement OAuth2 Google Login in Next.js"
                  className="w-full rounded-xl border border-[#2a2a35] bg-[#1a1a24] px-3.5 py-2.5 text-xs text-white focus:border-[#7727ff] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#a0a0b0] mb-1">Description</label>
                <textarea
                  rows={3}
                  value={taskForm.description}
                  onChange={(e) => setTaskForm({ ...taskForm, description: e.target.value })}
                  placeholder="Include requirements, acceptance criteria, or API links..."
                  className="w-full rounded-xl border border-[#2a2a35] bg-[#1a1a24] px-3.5 py-2.5 text-xs text-white focus:border-[#7727ff] focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[#a0a0b0] mb-1">Assign to Squad *</label>
                  <select
                    required
                    value={taskForm.teamId}
                    onChange={(e) => setTaskForm({ ...taskForm, teamId: e.target.value, assignedTo: '' })}
                    className="w-full rounded-xl border border-[#2a2a35] bg-[#1a1a24] px-3.5 py-2.5 text-xs text-white focus:border-[#7727ff] focus:outline-none"
                  >
                    {teams.map((team) => (
                      <option key={team.id} value={team.id}>
                        {team.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#a0a0b0] mb-1">Assign Intern</label>
                  <select
                    value={taskForm.assignedTo}
                    onChange={(e) => setTaskForm({ ...taskForm, assignedTo: e.target.value })}
                    className="w-full rounded-xl border border-[#2a2a35] bg-[#1a1a24] px-3.5 py-2.5 text-xs text-white focus:border-[#7727ff] focus:outline-none"
                  >
                    <option value="">-- Unassigned --</option>
                    {interns
                      .filter((i) => !taskForm.teamId || i.team_id === taskForm.teamId)
                      .map((intern) => (
                        <option key={intern.user_id} value={intern.user_id}>
                          {intern.full_name}
                        </option>
                      ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[#a0a0b0] mb-1">Priority</label>
                  <select
                    value={taskForm.priority}
                    onChange={(e) => setTaskForm({ ...taskForm, priority: e.target.value as TaskPriority })}
                    className="w-full rounded-xl border border-[#2a2a35] bg-[#1a1a24] px-3.5 py-2.5 text-xs text-white focus:border-[#7727ff] focus:outline-none"
                  >
                    <option value="urgent">Urgent</option>
                    <option value="high">High</option>
                    <option value="medium">Medium</option>
                    <option value="low">Low</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#a0a0b0] mb-1">Due Date</label>
                  <input
                    type="date"
                    value={taskForm.dueDate}
                    onChange={(e) => setTaskForm({ ...taskForm, dueDate: e.target.value })}
                    className="w-full rounded-xl border border-[#2a2a35] bg-[#1a1a24] px-3.5 py-2.5 text-xs text-white focus:border-[#7727ff] focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="rounded-xl border border-[#2a2a35] px-4 py-2 text-xs font-semibold text-[#a0a0b0] hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="rounded-xl bg-[#6417ed] px-5 py-2 text-xs font-bold text-white hover:bg-[#7727ff] disabled:opacity-50"
                >
                  {saving ? 'Creating...' : 'Create Task'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: EDIT TASK */}
      {isEditModalOpen && selectedTask && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-2xl border border-[#3a3545] bg-[#131318] p-6 shadow-2xl">
            <div className="flex items-center justify-between pb-4 border-b border-[#2a2a35]">
              <h3 className="text-base font-bold text-white">Edit Task Details</h3>
              <button onClick={() => setIsEditModalOpen(false)} className="text-[#a0a0b0] hover:text-white">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleUpdateTask} className="mt-5 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[#a0a0b0] mb-1">Task Title *</label>
                <input
                  type="text"
                  required
                  value={taskForm.title}
                  onChange={(e) => setTaskForm({ ...taskForm, title: e.target.value })}
                  className="w-full rounded-xl border border-[#2a2a35] bg-[#1a1a24] px-3.5 py-2.5 text-xs text-white focus:border-[#7727ff] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#a0a0b0] mb-1">Description</label>
                <textarea
                  rows={3}
                  value={taskForm.description}
                  onChange={(e) => setTaskForm({ ...taskForm, description: e.target.value })}
                  className="w-full rounded-xl border border-[#2a2a35] bg-[#1a1a24] px-3.5 py-2.5 text-xs text-white focus:border-[#7727ff] focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[#a0a0b0] mb-1">Squad *</label>
                  <select
                    required
                    value={taskForm.teamId}
                    onChange={(e) => setTaskForm({ ...taskForm, teamId: e.target.value })}
                    className="w-full rounded-xl border border-[#2a2a35] bg-[#1a1a24] px-3.5 py-2.5 text-xs text-white focus:border-[#7727ff] focus:outline-none"
                  >
                    {teams.map((team) => (
                      <option key={team.id} value={team.id}>
                        {team.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#a0a0b0] mb-1">Assign Intern</label>
                  <select
                    value={taskForm.assignedTo}
                    onChange={(e) => setTaskForm({ ...taskForm, assignedTo: e.target.value })}
                    className="w-full rounded-xl border border-[#2a2a35] bg-[#1a1a24] px-3.5 py-2.5 text-xs text-white focus:border-[#7727ff] focus:outline-none"
                  >
                    <option value="">-- Unassigned --</option>
                    {interns.map((intern) => (
                      <option key={intern.user_id} value={intern.user_id}>
                        {intern.full_name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[#a0a0b0] mb-1">Priority</label>
                  <select
                    value={taskForm.priority}
                    onChange={(e) => setTaskForm({ ...taskForm, priority: e.target.value as TaskPriority })}
                    className="w-full rounded-xl border border-[#2a2a35] bg-[#1a1a24] px-3.5 py-2.5 text-xs text-white focus:border-[#7727ff] focus:outline-none"
                  >
                    <option value="urgent">Urgent</option>
                    <option value="high">High</option>
                    <option value="medium">Medium</option>
                    <option value="low">Low</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#a0a0b0] mb-1">Due Date</label>
                  <input
                    type="date"
                    value={taskForm.dueDate}
                    onChange={(e) => setTaskForm({ ...taskForm, dueDate: e.target.value })}
                    className="w-full rounded-xl border border-[#2a2a35] bg-[#1a1a24] px-3.5 py-2.5 text-xs text-white focus:border-[#7727ff] focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex justify-between items-center pt-3 border-t border-[#2a2a35]">
                <button
                  type="button"
                  onClick={() => handleDeleteTask(selectedTask.id)}
                  className="text-xs font-semibold text-rose-400 hover:underline"
                >
                  Delete Task
                </button>

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setIsEditModalOpen(false)}
                    className="rounded-xl border border-[#2a2a35] px-4 py-2 text-xs font-semibold text-[#a0a0b0] hover:text-white"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className="rounded-xl bg-[#6417ed] px-5 py-2 text-xs font-bold text-white hover:bg-[#7727ff] disabled:opacity-50"
                  >
                    {saving ? 'Saving...' : 'Update Task'}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
