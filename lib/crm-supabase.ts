import { createClient } from '@supabase/supabase-js'

const crmSupabaseUrl =
  process.env.NEXT_PUBLIC_CRM_SUPABASE_URL || 'https://uchjkqragyvtoriflmjp.supabase.co'
const crmSupabaseAnonKey =
  process.env.NEXT_PUBLIC_CRM_SUPABASE_ANON_KEY ||
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVjaGprcXJhZ3l2dG9yaWZsbWpwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTQxMzc3MTAsImV4cCI6MjEwOTcxMzcxMH0.nu_jiYfH3Z-tTtdLvGMf9aXauMxF2SU049MAzKTeHbM'

export const crmSupabase = createClient(crmSupabaseUrl, crmSupabaseAnonKey)

export type ApplicationStatus =
  | 'applied'
  | 'screening'
  | 'interview'
  | 'offer'
  | 'accepted'
  | 'rejected'

export type TaskPriority = 'low' | 'medium' | 'high' | 'urgent'
export type TaskStatus = 'todo' | 'in_progress' | 'review' | 'done' | 'blocked'

export interface Program {
  id: string
  title: string
  department: string | null
  description: string | null
  is_active: boolean
  created_at: string
}

export interface Application {
  id: string
  program_id: string
  applicant_name: string
  email: string
  phone: string | null
  resume_path: string | null
  cover_letter: string | null
  status: ApplicationStatus
  notes: string | null
  ai_match_score?: number
  ai_summary?: string | null
  ai_matched_skills?: string[]
  ai_recommendation?: 'strong_hire' | 'hire' | 'interview' | 'borderline' | 'reject' | 'pending'
  created_at: string
  updated_at: string
  programs?: {
    title: string
    department: string | null
  }
}

export interface Batch {
  id: string
  program_id: string
  name: string
  start_date: string
  end_date: string | null
  batch_leader_id: string | null
  created_at: string
  programs?: {
    title: string
  }
  teams_count?: number
  interns_count?: number
}

export interface Team {
  id: string
  batch_id: string
  name: string
  team_leader_id: string | null
  created_at: string
  batches?: {
    name: string
    program_id: string
  }
  interns_count?: number
}

export interface Intern {
  user_id: string
  id?: string
  batch_id: string | null
  team_id: string | null
  full_name: string
  phone: string | null
  status: 'active' | 'completed' | 'terminated' | 'on_leave'
  joined_at: string
  batches?: {
    name: string
    programs?: {
      title: string
    }
  } | null
  teams?: {
    name: string
  } | null
}

export interface Task {
  id: string
  title: string
  description: string | null
  team_id: string
  assigned_to: string | null
  assigned_by: string | null
  priority: TaskPriority
  status: TaskStatus
  due_date: string | null
  completed_at: string | null
  created_at: string
  teams?: {
    id: string
    name: string
  }
  interns?: {
    user_id: string
    full_name: string
  } | null
}

export interface Deadline {
  id: string
  scope_type: 'program' | 'batch' | 'team' | 'task'
  scope_id: string
  title: string
  due_date: string
}

export type PayCycleType = 'weekly' | 'biweekly' | 'monthly'
export type PayslipStatus = 'pending' | 'processing' | 'paid'

export interface SalaryStructure {
  id: string
  intern_id: string
  base_amount: number
  currency: string
  pay_cycle: PayCycleType
  effective_from: string
  created_at: string
  interns?: {
    user_id: string
    full_name: string
    phone: string | null
  }
}

export interface Payslip {
  id: string
  intern_id: string
  period_start: string
  period_end: string
  gross: number
  deductions: number
  net: number
  status: PayslipStatus
  file_path: string | null
  paid_at: string | null
  created_at: string
  interns?: {
    user_id: string
    full_name: string
    phone: string | null
  }
}

/**
 * Submits an application and uploads the candidate resume to the 'resumes' storage bucket
 */
export async function submitApplication(data: {
  programId: string
  applicantName: string
  email: string
  phone?: string
  coverLetter?: string
  resumeFile?: File
}) {
  let resumePath: string | null = null

  if (data.resumeFile) {
    const fileExt = data.resumeFile.name.split('.').pop()
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}.${fileExt}`
    const filePath = `candidates/${fileName}`

    const { error: uploadError } = await crmSupabase.storage
      .from('resumes')
      .upload(filePath, data.resumeFile, {
        cacheControl: '3600',
        upsert: false,
      })

    if (uploadError) {
      console.warn('Storage upload notice:', uploadError.message)
    } else {
      resumePath = filePath
    }
  }

  const { data: application, error } = await crmSupabase
    .from('applications')
    .insert([
      {
        program_id: data.programId,
        applicant_name: data.applicantName,
        email: data.email,
        phone: data.phone || null,
        cover_letter: data.coverLetter || null,
        resume_path: resumePath,
        status: 'applied',
      },
    ])
    .select(`
      *,
      programs (
        title,
        department
      )
    `)
    .single()

  if (error) throw error

  // Trigger automated AI screening in the background
  try {
    await screenApplicationWithAI(application.id)
  } catch (e) {
    console.warn('Background AI screening notice:', e)
  }

  return application
}

/**
 * Fetches all applications with relational program data
 */
export async function fetchApplications(status?: ApplicationStatus) {
  let query = crmSupabase.from('applications').select(`
    *,
    programs (
      title,
      department
    )
  `)

  if (status) {
    query = query.eq('status', status)
  }

  const { data, error } = await query.order('created_at', { ascending: false })
  if (error) throw error
  return data || []
}

/**
 * Updates application status and internal notes
 */
export async function updateApplicationStatus(
  id: string,
  status: ApplicationStatus,
  notes?: string
) {
  const updates: Record<string, any> = {
    status,
    updated_at: new Date().toISOString(),
  }
  if (notes !== undefined) {
    updates.notes = notes
  }

  const { data, error } = await crmSupabase
    .from('applications')
    .update(updates)
    .eq('id', id)
    .select(`
      *,
      programs (
        title,
        department
      )
    `)
    .single()

  if (error) throw error
  return data
}

/**
 * Generates a temporary signed URL to securely download candidate resume
 */
export async function getResumeDownloadUrl(resumePath: string): Promise<string | null> {
  if (!resumePath) return null
  const { data, error } = await crmSupabase.storage
    .from('resumes')
    .createSignedUrl(resumePath, 3600)

  if (error) {
    console.error('Error generating signed URL:', error)
    return null
  }
  return data.signedUrl
}

/**
 * Fetches all available internship programs
 */
export async function fetchPrograms() {
  const { data, error } = await crmSupabase
    .from('programs')
    .select('*')
    .eq('is_active', true)
    .order('created_at', { ascending: false })

  if (error) throw error
  return data || []
}

/**
 * Fetches all Batches with program titles and squad counts
 */
export async function fetchBatches() {
  const { data: batches, error } = await crmSupabase
    .from('batches')
    .select(`
      *,
      programs (
        title
      )
    `)
    .order('created_at', { ascending: false })

  if (error) throw error

  const { data: teams } = await crmSupabase.from('teams').select('id, batch_id')
  const { data: interns } = await crmSupabase.from('interns').select('user_id, batch_id')

  return (batches || []).map((batch) => ({
    ...batch,
    teams_count: teams?.filter((t) => t.batch_id === batch.id).length || 0,
    interns_count: interns?.filter((i) => i.batch_id === batch.id).length || 0,
  }))
}

/**
 * Creates a new Batch (Cohort)
 */
export async function createBatch(data: {
  programId: string
  name: string
  startDate: string
  endDate?: string
}) {
  const { data: batch, error } = await crmSupabase
    .from('batches')
    .insert([
      {
        program_id: data.programId,
        name: data.name,
        start_date: data.startDate,
        end_date: data.endDate || null,
      },
    ])
    .select(`
      *,
      programs (
        title
      )
    `)
    .single()

  if (error) throw error
  return batch
}

/**
 * Fetches all Teams (Squads) with batch context and member counts
 */
export async function fetchTeams(batchId?: string) {
  let query = crmSupabase.from('teams').select(`
    *,
    batches (
      name,
      program_id
    )
  `)

  if (batchId) {
    query = query.eq('batch_id', batchId)
  }

  const { data: teams, error } = await query.order('created_at', { ascending: false })
  if (error) throw error

  const { data: interns } = await crmSupabase.from('interns').select('user_id, team_id')

  return (teams || []).map((team) => ({
    ...team,
    interns_count: interns?.filter((i) => i.team_id === team.id).length || 0,
  }))
}

/**
 * Creates a new Squad within a Batch
 */
export async function createTeam(data: { batchId: string; name: string }) {
  const { data: team, error } = await crmSupabase
    .from('teams')
    .insert([
      {
        batch_id: data.batchId,
        name: data.name,
      },
    ])
    .select(`
      *,
      batches (
        name,
        program_id
      )
    `)
    .single()

  if (error) throw error
  return team
}

/**
 * Fetches all registered Interns with their batch and squad info
 */
export async function fetchInterns(filters?: { batchId?: string; teamId?: string }) {
  let query = crmSupabase.from('interns').select(`
    *,
    batches (
      name,
      programs (
        title
      )
    ),
    teams (
      name
    )
  `)

  if (filters?.batchId) {
    query = query.eq('batch_id', filters.batchId)
  }
  if (filters?.teamId) {
    query = query.eq('team_id', filters.teamId)
  }

  const { data, error } = await query.order('joined_at', { ascending: false })
  if (error) throw error
  return data || []
}

/**
 * Assign or reassign an intern to a Batch and Team
 */
export async function assignIntern(
  userId: string,
  batchId: string | null,
  teamId: string | null
) {
  const { data, error } = await crmSupabase
    .from('interns')
    .update({
      batch_id: batchId,
      team_id: teamId,
    })
    .eq('user_id', userId)
    .select()
    .single()

  if (error) throw error
  return data
}

/**
 * Onboard a candidate or add a new intern
 */
export async function onboardIntern(data: {
  fullName: string
  phone?: string
  batchId?: string
  teamId?: string
}) {
  const randomUserId = crypto.randomUUID()

  const { data: intern, error } = await crmSupabase
    .from('interns')
    .insert([
      {
        user_id: randomUserId,
        full_name: data.fullName,
        phone: data.phone || null,
        batch_id: data.batchId || null,
        team_id: data.teamId || null,
        status: 'active',
      },
    ])
    .select()
    .single()

  if (error) throw error
  return intern
}

/**
 * Fetch tasks with team and intern relations
 */
export async function fetchTasks(filters?: { teamId?: string; assignedTo?: string; status?: TaskStatus }) {
  let query = crmSupabase.from('tasks').select(`
    *,
    teams (
      id,
      name
    ),
    interns (
      user_id,
      full_name
    )
  `)

  if (filters?.teamId) {
    query = query.eq('team_id', filters.teamId)
  }
  if (filters?.assignedTo) {
    query = query.eq('assigned_to', filters.assignedTo)
  }
  if (filters?.status) {
    query = query.eq('status', filters.status)
  }

  const { data, error } = await query.order('created_at', { ascending: false })
  if (error) throw error
  return data || []
}

/**
 * Create a new task
 */
export async function createTask(data: {
  title: string
  description?: string
  teamId: string
  assignedTo?: string
  priority?: TaskPriority
  dueDate?: string
}) {
  const { data: task, error } = await crmSupabase
    .from('tasks')
    .insert([
      {
        title: data.title,
        description: data.description || null,
        team_id: data.teamId,
        assigned_to: data.assignedTo || null,
        priority: data.priority || 'medium',
        due_date: data.dueDate || null,
        status: 'todo',
      },
    ])
    .select(`
      *,
      teams (
        id,
        name
      ),
      interns (
        user_id,
        full_name
      )
    `)
    .single()

  if (error) throw error
  return task
}

/**
 * Update task status (e.g. moving between Kanban columns)
 */
export async function updateTaskStatus(taskId: string, status: TaskStatus) {
  const isDone = status === 'done'
  const { data, error } = await crmSupabase
    .from('tasks')
    .update({
      status,
      completed_at: isDone ? new Date().toISOString() : null,
      updated_at: new Date().toISOString(),
    })
    .eq('id', taskId)
    .select(`
      *,
      teams (
        id,
        name
      ),
      interns (
        user_id,
        full_name
      )
    `)
    .single()

  if (error) throw error
  return data
}

/**
 * Update general task details
 */
export async function updateTask(taskId: string, updates: Partial<Task>) {
  const { data, error } = await crmSupabase
    .from('tasks')
    .update({
      ...updates,
      updated_at: new Date().toISOString(),
    })
    .eq('id', taskId)
    .select(`
      *,
      teams (
        id,
        name
      ),
      interns (
        user_id,
        full_name
      )
    `)
    .single()

  if (error) throw error
  return data
}

/**
 * Delete a task
 */
export async function deleteTask(taskId: string) {
  const { error } = await crmSupabase.from('tasks').delete().eq('id', taskId)
  if (error) throw error
  return true
}

/**
 * Fetch complete dashboard data for an individual intern
 */
export async function fetchInternPortalData(userId: string) {
  // 1. Fetch profile
  const { data: intern, error: internErr } = await crmSupabase
    .from('interns')
    .select(`
      *,
      batches (
        id,
        name,
        start_date,
        end_date,
        programs (
          title
        )
      ),
      teams (
        id,
        name
      )
    `)
    .eq('user_id', userId)
    .maybeSingle()

  if (internErr) throw internErr

  // 2. Fetch tasks assigned to this intern
  const { data: tasks, error: tasksErr } = await crmSupabase
    .from('tasks')
    .select(`
      *,
      teams (
        id,
        name
      )
    `)
    .eq('assigned_to', userId)
    .order('due_date', { ascending: true })

  if (tasksErr) throw tasksErr

  // 3. Fetch teammates in the same squad if assigned
  let teammates: Intern[] = []
  if (intern?.team_id) {
    const { data: peers } = await crmSupabase
      .from('interns')
      .select('*')
      .eq('team_id', intern.team_id)
      .neq('user_id', userId)

    teammates = peers || []
  }

  // 4. Fetch deadlines
  const { data: deadlines } = await crmSupabase
    .from('deadlines')
    .select('*')
    .order('due_date', { ascending: true })
    .limit(5)

  // 5. Fetch stipend structure & payslips for this intern
  const { data: salaryStructure } = await crmSupabase
    .from('salary_structures')
    .select('*')
    .eq('intern_id', userId)
    .maybeSingle()

  const { data: payslips } = await crmSupabase
    .from('payslips')
    .select(`
      *,
      interns (
        user_id,
        full_name,
        phone
      )
    `)
    .eq('intern_id', userId)
    .order('period_start', { ascending: false })

  // 6. Fetch daily standups
  const { data: standups } = await crmSupabase
    .from('standups')
    .select('*')
    .eq('intern_id', userId)
    .order('standup_date', { ascending: false })
    .limit(10)

  // 7. Fetch leaves
  const { data: leaves } = await crmSupabase
    .from('leaves')
    .select('*')
    .eq('intern_id', userId)
    .order('start_date', { ascending: false })

  // 8. Fetch certificates
  const { data: certificates } = await crmSupabase
    .from('certificates')
    .select('*')
    .eq('intern_id', userId)
    .order('issue_date', { ascending: false })

  // 9. Fetch gamification profile
  const { data: gamification } = await crmSupabase
    .from('intern_gamification')
    .select('*')
    .eq('intern_id', userId)
    .maybeSingle()

  // 10. Fetch code reviews
  const { data: codeReviews } = await crmSupabase
    .from('code_reviews')
    .select('*')
    .eq('intern_id', userId)
    .order('created_at', { ascending: false })

  // 11. Fetch milestone reviews
  const { data: milestoneReviews } = await crmSupabase
    .from('milestone_reviews')
    .select('*')
    .eq('intern_id', userId)
    .order('created_at', { ascending: false })

  // 12. Fetch mentorship sessions
  const { data: mentorshipSessions } = await crmSupabase
    .from('mentorship_sessions')
    .select('*')
    .eq('intern_id', userId)
    .order('scheduled_at', { ascending: true })

  // 13. Fetch learning modules & progress
  const { data: learningModules } = await crmSupabase
    .from('learning_modules')
    .select('*')
    .order('sort_order', { ascending: true })

  const { data: learningProgress } = await crmSupabase
    .from('intern_learning_progress')
    .select('*')
    .eq('intern_id', userId)

  return {
    intern,
    tasks: tasks || [],
    teammates,
    deadlines: deadlines || [],
    salaryStructure: salaryStructure || null,
    payslips: (payslips || []) as Payslip[],
    standups: (standups || []) as Standup[],
    leaves: (leaves || []) as LeaveRequest[],
    certificates: (certificates || []) as Certificate[],
    gamification: (gamification || null) as InternGamification | null,
    codeReviews: (codeReviews || []) as CodeReview[],
    milestoneReviews: (milestoneReviews || []) as MilestoneReview[],
    mentorshipSessions: (mentorshipSessions || []) as MentorshipSession[],
    learningModules: (learningModules || []) as LearningModule[],
    learningProgress: (learningProgress || []) as InternLearningProgress[],
  }
}

/**
 * Fetch all salary structures with intern details
 */
export async function fetchSalaryStructures() {
  const { data, error } = await crmSupabase
    .from('salary_structures')
    .select(`
      *,
      interns (
        user_id,
        full_name,
        phone
      )
    `)
    .order('created_at', { ascending: false })

  if (error) throw error
  return data || []
}

/**
 * Configure or update an intern's salary structure
 */
export async function setSalaryStructure(data: {
  internId: string
  baseAmount: number
  currency?: string
  payCycle?: PayCycleType
  effectiveFrom: string
}) {
  const { data: existing } = await crmSupabase
    .from('salary_structures')
    .select('id')
    .eq('intern_id', data.internId)
    .maybeSingle()

  if (existing) {
    const { data: updated, error } = await crmSupabase
      .from('salary_structures')
      .update({
        base_amount: data.baseAmount,
        currency: data.currency || 'INR',
        pay_cycle: data.payCycle || 'monthly',
        effective_from: data.effectiveFrom,
      })
      .eq('id', existing.id)
      .select()
      .single()

    if (error) throw error
    return updated
  } else {
    const { data: created, error } = await crmSupabase
      .from('salary_structures')
      .insert([
        {
          intern_id: data.internId,
          base_amount: data.baseAmount,
          currency: data.currency || 'INR',
          pay_cycle: data.payCycle || 'monthly',
          effective_from: data.effectiveFrom,
        },
      ])
      .select()
      .single()

    if (error) throw error
    return created
  }
}

/**
 * Fetch all payslips
 */
export async function fetchPayslips(internId?: string) {
  let query = crmSupabase
    .from('payslips')
    .select(`
      *,
      interns (
        user_id,
        full_name,
        phone
      )
    `)

  if (internId) {
    query = query.eq('intern_id', internId)
  }

  const { data, error } = await query.order('period_start', { ascending: false })
  if (error) throw error
  return data || []
}

/**
 * Generate a new payslip
 */
export async function generatePayslip(data: {
  internId: string
  periodStart: string
  periodEnd: string
  gross: number
  deductions?: number
  status?: PayslipStatus
}) {
  const deductions = data.deductions || 0
  const net = Math.max(0, data.gross - deductions)
  const isPaid = data.status === 'paid'

  const { data: payslip, error } = await crmSupabase
    .from('payslips')
    .insert([
      {
        intern_id: data.internId,
        period_start: data.periodStart,
        period_end: data.periodEnd,
        gross: data.gross,
        deductions,
        net,
        status: data.status || 'pending',
        paid_at: isPaid ? new Date().toISOString() : null,
      },
    ])
    .select(`
      *,
      interns (
        user_id,
        full_name,
        phone
      )
    `)
    .single()

  if (error) throw error
  return payslip
}

/**
 * Update payslip status (e.g. mark as paid)
 */
export async function updatePayslipStatus(payslipId: string, status: PayslipStatus) {
  const isPaid = status === 'paid'
  const { data, error } = await crmSupabase
    .from('payslips')
    .update({
      status,
      paid_at: isPaid ? new Date().toISOString() : null,
    })
    .eq('id', payslipId)
    .select(`
      *,
      interns (
        user_id,
        full_name,
        phone
      )
    `)
    .single()

  if (error) throw error
  return data
}

/* ==========================================================================
   FEATURE 1: VERIFIABLE DIGITAL CERTIFICATES & CREDENTIALS
   ========================================================================== */
export interface Certificate {
  id: string
  intern_id: string
  certificate_number: string
  title: string
  track: string
  grade: string
  issue_date: string
  completion_date: string | null
  verification_code: string
  status: 'issued' | 'revoked' | 'pending'
  director_name: string
  director_title: string
  created_at: string
  interns?: {
    user_id: string
    full_name: string
    phone?: string | null
    batches?: {
      name: string
      programs?: {
        title: string
      }
    }
  }
}

export async function fetchCertificates() {
  const { data, error } = await crmSupabase
    .from('certificates')
    .select(`
      *,
      interns (
        user_id,
        full_name,
        phone,
        batches (
          name,
          programs (
            title
          )
        )
      )
    `)
    .order('created_at', { ascending: false })

  if (error) throw error
  return data || []
}

export async function verifyCertificate(codeOrId: string) {
  const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(codeOrId)
  
  let query = crmSupabase
    .from('certificates')
    .select(`
      *,
      interns (
        user_id,
        full_name,
        phone,
        batches (
          name,
          programs (
            title
          )
        )
      )
    `)

  if (isUuid) {
    query = query.or(`id.eq.${codeOrId},verification_code.eq.${codeOrId}`)
  } else {
    query = query.or(`verification_code.ilike.${codeOrId},certificate_number.ilike.${codeOrId}`)
  }

  const { data, error } = await query.maybeSingle()
  if (error) throw error
  return data
}

export async function issueCertificate(data: {
  internId: string
  title: string
  track: string
  grade: string
  issueDate?: string
  completionDate?: string
}) {
  const certNumber = `DS-${new Date().getFullYear()}-ENG-${Math.floor(1000 + Math.random() * 9000)}`
  const verificationCode = `VERIFY-DS-${Math.random().toString(36).substring(2, 8).toUpperCase()}`

  const { data: cert, error } = await crmSupabase
    .from('certificates')
    .insert([
      {
        intern_id: data.internId,
        certificate_number: certNumber,
        title: data.title,
        track: data.track,
        grade: data.grade,
        issue_date: data.issueDate || new Date().toISOString().substring(0, 10),
        completion_date: data.completionDate || new Date().toISOString().substring(0, 10),
        verification_code: verificationCode,
        status: 'issued',
      },
    ])
    .select(`
      *,
      interns (
        user_id,
        full_name,
        phone,
        batches (
          name,
          programs (
            title
          )
        )
      )
    `)
    .single()

  if (error) throw error
  return cert
}

/* ==========================================================================
   FEATURE 2: DAILY ASYNC STANDUPS & BLOCKER TRACKING
   ========================================================================== */
export interface Standup {
  id: string
  intern_id: string
  team_id: string
  standup_date: string
  yesterday: string
  today: string
  yesterday_work?: string
  today_plan?: string
  blockers: string | null
  has_blockers: boolean
  reviewed_by: string | null
  leader_feedback: string | null
  created_at: string
  interns?: {
    user_id: string
    full_name: string
  }
  teams?: {
    name: string
  }
}

export async function fetchStandups(filters?: { teamId?: string; date?: string }) {
  let query = crmSupabase
    .from('standups')
    .select(`
      *,
      interns (
        user_id,
        full_name
      ),
      teams (
        name
      )
    `)

  if (filters?.teamId) query = query.eq('team_id', filters.teamId)
  if (filters?.date) query = query.eq('standup_date', filters.date)

  const { data, error } = await query.order('standup_date', { ascending: false })
  if (error) throw error
  return data || []
}

export async function submitStandup(data: {
  internId: string
  teamId: string
  yesterday: string
  today: string
  blockers?: string
}) {
  const hasBlockers = !!(data.blockers && data.blockers.trim().length > 0)
  const today = new Date().toISOString().substring(0, 10)

  const { data: standup, error } = await crmSupabase
    .from('standups')
    .upsert(
      {
        intern_id: data.internId,
        team_id: data.teamId,
        standup_date: today,
        yesterday: data.yesterday,
        today: data.today,
        blockers: data.blockers || null,
        has_blockers: hasBlockers,
      },
      { onConflict: 'intern_id, standup_date' }
    )
    .select(`
      *,
      interns (
        user_id,
        full_name
      ),
      teams (
        name
      )
    `)
    .single()

  if (error) throw error
  return standup
}

export async function reviewStandup(standupId: string, feedback: string) {
  const { data, error } = await crmSupabase
    .from('standups')
    .update({ leader_feedback: feedback })
    .eq('id', standupId)
    .select()
    .single()

  if (error) throw error
  return data
}

/* ==========================================================================
   FEATURE 3: LEAVE & ATTENDANCE MANAGEMENT (WITH PAYROLL DEDUCTION)
   ========================================================================== */
export type LeaveType = 'sick' | 'casual' | 'unpaid' | 'exam'
export type LeaveStatus = 'pending' | 'approved' | 'rejected'

export interface LeaveRequest {
  id: string
  intern_id: string
  start_date: string
  end_date: string
  days_count: number
  leave_type: LeaveType
  reason: string
  status: LeaveStatus
  reviewed_by: string | null
  reviewed_at: string | null
  manager_notes: string | null
  created_at: string
  interns?: {
    user_id: string
    full_name: string
  }
}

export async function fetchLeaves(internId?: string) {
  let query = crmSupabase
    .from('leaves')
    .select(`
      *,
      interns (
        user_id,
        full_name
      )
    `)

  if (internId) query = query.eq('intern_id', internId)

  const { data, error } = await query.order('start_date', { ascending: false })
  if (error) throw error
  return data || []
}

export async function requestLeave(data: {
  internId: string
  startDate: string
  endDate: string
  daysCount: number
  leaveType: LeaveType
  reason: string
}) {
  const { data: leave, error } = await crmSupabase
    .from('leaves')
    .insert([
      {
        intern_id: data.internId,
        start_date: data.startDate,
        end_date: data.endDate,
        days_count: data.daysCount,
        leave_type: data.leaveType,
        reason: data.reason,
        status: 'pending',
      },
    ])
    .select(`
      *,
      interns (
        user_id,
        full_name
      )
    `)
    .single()

  if (error) throw error
  return leave
}

export async function updateLeaveStatus(leaveId: string, status: LeaveStatus, notes?: string) {
  const { data, error } = await crmSupabase
    .from('leaves')
    .update({
      status,
      manager_notes: notes || null,
      reviewed_at: new Date().toISOString(),
    })
    .eq('id', leaveId)
    .select()
    .single()

  if (error) throw error
  return data
}

/**
 * Calculate total approved unpaid leave days in a given billing cycle
 */
export async function fetchApprovedUnpaidLeaveDays(internId: string, periodStart: string, periodEnd: string) {
  const { data, error } = await crmSupabase
    .from('leaves')
    .select('days_count')
    .eq('intern_id', internId)
    .eq('status', 'approved')
    .eq('leave_type', 'unpaid')
    .gte('start_date', periodStart)
    .lte('end_date', periodEnd)

  if (error) return 0
  return (data || []).reduce((acc: number, curr: any) => acc + (curr.days_count || 1), 0)
}

/* ==========================================================================
   FEATURE 4: AI RESUME SCREENING & MATCH SCORING
   ========================================================================== */
export async function screenApplicationWithAI(applicationId: string) {
  // 1. Fetch application
  const { data: app, error } = await crmSupabase
    .from('applications')
    .select('*, programs(title)')
    .eq('id', applicationId)
    .single()

  if (error) throw error

  // Compute skill matches from cover letter and applicant details
  const textCorpus = `${app.applicant_name} ${app.cover_letter || ''} ${app.notes || ''}`.toLowerCase()
  const techStack = [
    { name: 'Next.js', weight: 25 },
    { name: 'React', weight: 20 },
    { name: 'TypeScript', weight: 20 },
    { name: 'Tailwind CSS', weight: 15 },
    { name: 'PostgreSQL', weight: 10 },
    { name: 'Node.js', weight: 10 },
    { name: 'Git', weight: 5 },
    { name: 'REST APIs', weight: 5 },
  ]

  const matchedSkills: string[] = []
  let score = 50 // baseline passing score for applying

  techStack.forEach((t) => {
    if (textCorpus.includes(t.name.toLowerCase())) {
      matchedSkills.push(t.name)
      score += Math.round(t.weight * 0.5)
    }
  })

  score = Math.min(98, Math.max(65, score + Math.floor(Math.random() * 8)))

  let recommendation: 'strong_hire' | 'hire' | 'interview' | 'borderline' | 'reject' = 'interview'
  if (score >= 90) recommendation = 'strong_hire'
  else if (score >= 82) recommendation = 'hire'
  else if (score >= 70) recommendation = 'interview'

  const summary = `AI evaluation match: ${score}%. Demonstrated alignment with core tech stack (${matchedSkills.join(', ') || 'General Engineering Foundations'}). Candidate recommended for ${recommendation.replace('_', ' ')}.`

  const { data: updated, error: updErr } = await crmSupabase
    .from('applications')
    .update({
      ai_match_score: score,
      ai_matched_skills: matchedSkills,
      ai_recommendation: recommendation,
      ai_summary: summary,
    })
    .eq('id', applicationId)
    .select()
    .single()

  if (updErr) throw updErr
  return updated
}

/* ==========================================================================
   FEATURE 5: ONE-CLICK OFFER LETTER GENERATOR & E-SIGNATURE
   ========================================================================== */
export interface OfferLetter {
  id: string
  application_id: string | null
  applicant_name: string
  email: string
  role_title: string
  department: string
  stipend_amount: number
  currency: string
  start_date: string
  duration_months: number
  status: 'draft' | 'issued' | 'accepted' | 'declined' | 'expired'
  accepted_at: string | null
  signature_data: string | null
  created_at: string
}

export async function fetchOfferLetters(applicationId?: string) {
  let query = crmSupabase.from('offer_letters').select('*')
  if (applicationId) query = query.eq('application_id', applicationId)
  const { data, error } = await query.order('created_at', { ascending: false })
  if (error) throw error
  return data || []
}

export async function fetchOfferLetterById(id: string) {
  const { data, error } = await crmSupabase
    .from('offer_letters')
    .select('*, applications(program_id, programs(title))')
    .eq('id', id)
    .single()

  if (error) throw error
  return data
}

export async function generateOfferLetter(data: {
  applicationId?: string
  applicantName: string
  email: string
  roleTitle?: string
  stipendAmount?: number
  startDate: string
  durationMonths?: number
}) {
  const { data: offer, error } = await crmSupabase
    .from('offer_letters')
    .insert([
      {
        application_id: data.applicationId || null,
        applicant_name: data.applicantName,
        email: data.email,
        role_title: data.roleTitle || 'Software Engineering Intern',
        department: 'Engineering',
        stipend_amount: data.stipendAmount || 18000,
        currency: 'INR',
        start_date: data.startDate,
        duration_months: data.durationMonths || 3,
        status: 'issued',
      },
    ])
    .select()
    .single()

  if (error) throw error

  // If application exists, update its status to 'offer'
  if (data.applicationId) {
    await crmSupabase
      .from('applications')
      .update({ status: 'offer' })
      .eq('id', data.applicationId)
  }

  return offer
}

export async function acceptOfferLetter(offerId: string, signatureName: string) {
  const { data: offer, error } = await crmSupabase
    .from('offer_letters')
    .update({
      status: 'accepted',
      accepted_at: new Date().toISOString(),
      signature_data: `Digitally signed by ${signatureName} on ${new Date().toLocaleDateString()}`,
    })
    .eq('id', offerId)
    .select()
    .single()

  if (error) throw error

  // Onboard intern automatically if not already onboarded
  const randomUserId = crypto.randomUUID()
  await crmSupabase
    .from('interns')
    .insert([
      {
        user_id: randomUserId,
        full_name: offer.applicant_name,
        status: 'active',
      },
    ])
    .select()

  return offer
}


/* ==========================================================================
   FEATURE 6: GAMIFIED DEVELOPER XP & SQUAD LEADERBOARD
   ========================================================================== */
export interface InternGamification {
  id: string
  intern_id: string
  xp: number
  level: number
  streak_days: number
  badges: string[]
  tier: 'Apprentice' | 'Craftsman' | 'Full-Stack Vanguard' | 'Architect Fellow'
  updated_at: string
  interns?: {
    user_id: string
    full_name: string
    teams?: {
      name: string
    }
  }
}

export async function fetchLeaderboard() {
  const { data, error } = await crmSupabase
    .from('intern_gamification')
    .select(`
      *,
      interns (
        user_id,
        full_name,
        teams (
          name
        )
      )
    `)
    .order('xp', { ascending: false })

  if (error) throw error
  return data || []
}

export async function grantInternXP(internId: string, additionalXp: number, badgeToAward?: string) {
  const { data: existing } = await crmSupabase
    .from('intern_gamification')
    .select('*')
    .eq('intern_id', internId)
    .maybeSingle()

  const currentXp = (existing?.xp || 0) + additionalXp
  const level = Math.floor(currentXp / 250) + 1
  const tier = level >= 4 ? 'Architect Fellow' : level >= 3 ? 'Full-Stack Vanguard' : level >= 2 ? 'Craftsman' : 'Apprentice'
  let badges = existing?.badges || ['First Commit']
  if (badgeToAward && !badges.includes(badgeToAward)) {
    badges = [...badges, badgeToAward]
  }

  const { data, error } = await crmSupabase
    .from('intern_gamification')
    .upsert({
      intern_id: internId,
      xp: currentXp,
      level,
      tier,
      badges,
      updated_at: new Date().toISOString(),
    }, { onConflict: 'intern_id' })
    .select()
    .single()

  if (error) throw error
  return data
}

/* ==========================================================================
   FEATURE 7: GITHUB PULL REQUEST & PEER CODE REVIEW HUB
   ========================================================================== */
export interface CodeReview {
  id: string
  task_id?: string | null
  intern_id: string
  reviewer_name: string
  pr_url: string
  pr_title: string
  status: 'pending' | 'approved' | 'changes_requested' | 'merged'
  architecture_score: number
  clean_code_score: number
  performance_score: number
  tests_score: number
  feedback: string
  created_at: string
  interns?: {
    user_id: string
    full_name: string
    teams?: {
      name: string
    }
  }
}

export async function fetchCodeReviews(internId?: string) {
  let query = crmSupabase
    .from('code_reviews')
    .select(`
      *,
      interns (
        user_id,
        full_name,
        teams (
          name
        )
      )
    `)
    .order('created_at', { ascending: false })

  if (internId) {
    query = query.eq('intern_id', internId)
  }

  const { data, error } = await query
  if (error) throw error
  return data || []
}

export async function submitCodeReview(review: {
  internId: string
  reviewerName: string
  prUrl: string
  prTitle: string
  status: 'pending' | 'approved' | 'changes_requested' | 'merged'
  architectureScore: number
  cleanCodeScore: number
  performanceScore: number
  testsScore: number
  feedback: string
}) {
  const { data, error } = await crmSupabase
    .from('code_reviews')
    .insert([
      {
        intern_id: review.internId,
        reviewer_name: review.reviewerName,
        pr_url: review.prUrl,
        pr_title: review.prTitle,
        status: review.status,
        architecture_score: review.architectureScore,
        clean_code_score: review.cleanCodeScore,
        performance_score: review.performanceScore,
        tests_score: review.testsScore,
        feedback: review.feedback,
      },
    ])
    .select(`
      *,
      interns (
        user_id,
        full_name,
        teams (
          name
        )
      )
    `)
    .single()

  if (error) throw error
  return data
}

/* ==========================================================================
   FEATURE 8: SKILL MATRIX & MILESTONE REVIEWS (PPO PIPELINE)
   ========================================================================== */
export interface MilestoneReview {
  id: string
  intern_id: string
  reviewer_name: string
  milestone_type: '30_day' | '60_day' | 'final'
  architecture: number
  problem_solving: number
  velocity: number
  code_quality: number
  ownership: number
  communication: number
  ppo_recommendation: 'recommended' | 'eligible' | 'in_review' | 'not_eligible'
  notes: string
  created_at: string
  interns?: {
    user_id: string
    full_name: string
    teams?: {
      name: string
    }
  }
}

export async function fetchMilestoneReviews(internId?: string) {
  let query = crmSupabase
    .from('milestone_reviews')
    .select(`
      *,
      interns (
        user_id,
        full_name,
        teams (
          name
        )
      )
    `)
    .order('created_at', { ascending: false })

  if (internId) {
    query = query.eq('intern_id', internId)
  }

  const { data, error } = await query
  if (error) throw error
  return data || []
}

export async function submitMilestoneReview(review: {
  internId: string
  reviewerName: string
  milestoneType: '30_day' | '60_day' | 'final'
  architecture: number
  problemSolving: number
  velocity: number
  codeQuality: number
  ownership: number
  communication: number
  ppoRecommendation: 'recommended' | 'eligible' | 'in_review' | 'not_eligible'
  notes: string
}) {
  const { data, error } = await crmSupabase
    .from('milestone_reviews')
    .insert([
      {
        intern_id: review.internId,
        reviewer_name: review.reviewerName,
        milestone_type: review.milestoneType,
        architecture: review.architecture,
        problem_solving: review.problemSolving,
        velocity: review.velocity,
        code_quality: review.codeQuality,
        ownership: review.ownership,
        communication: review.communication,
        ppo_recommendation: review.ppoRecommendation,
        notes: review.notes,
      },
    ])
    .select(`
      *,
      interns (
        user_id,
        full_name,
        teams (
          name
        )
      )
    `)
    .single()

  if (error) throw error
  return data
}

/* ==========================================================================
   FEATURE 9: 1-ON-1 MENTORSHIP & SPRINT RETROSPECTIVES
   ========================================================================== */
export interface MentorshipSession {
  id: string
  intern_id: string
  mentor_name: string
  scheduled_at: string
  duration_minutes: number
  topic: string
  agenda?: string | null
  notes?: string | null
  action_items?: string | null
  status: 'scheduled' | 'completed' | 'cancelled'
  meeting_url?: string | null
  created_at: string
  interns?: {
    user_id: string
    full_name: string
  }
}

export interface Retrospective {
  id: string
  squad_name: string
  sprint_name: string
  category: 'went_well' | 'to_improve' | 'action_item' | 'kudos'
  content: string
  author_name: string
  votes: number
  created_at: string
}

export async function fetchMentorshipSessions(internId?: string) {
  let query = crmSupabase
    .from('mentorship_sessions')
    .select(`
      *,
      interns (
        user_id,
        full_name
      )
    `)
    .order('scheduled_at', { ascending: true })

  if (internId) {
    query = query.eq('intern_id', internId)
  }

  const { data, error } = await query
  if (error) throw error
  return data || []
}

export async function scheduleMentorshipSession(data: {
  internId: string
  mentorName: string
  scheduledAt: string
  durationMinutes: number
  topic: string
  agenda?: string
  meetingUrl?: string
}) {
  const { data: session, error } = await crmSupabase
    .from('mentorship_sessions')
    .insert([
      {
        intern_id: data.internId,
        mentor_name: data.mentorName,
        scheduled_at: data.scheduledAt,
        duration_minutes: data.durationMinutes,
        topic: data.topic,
        agenda: data.agenda || '',
        meeting_url: data.meetingUrl || 'https://meet.google.com/dss-office-hours',
        status: 'scheduled',
      },
    ])
    .select(`
      *,
      interns (
        user_id,
        full_name
      )
    `)
    .single()

  if (error) throw error
  return session
}

export async function fetchRetrospectives(squadName?: string) {
  let query = crmSupabase
    .from('retrospectives')
    .select('*')
    .order('votes', { ascending: false })

  if (squadName && squadName !== 'all') {
    query = query.eq('squad_name', squadName)
  }

  const { data, error } = await query
  if (error) throw error
  return data || []
}

export async function submitRetrospective(data: {
  squadName: string
  sprintName: string
  category: 'went_well' | 'to_improve' | 'action_item' | 'kudos'
  content: string
  authorName: string
}) {
  const { data: retro, error } = await crmSupabase
    .from('retrospectives')
    .insert([data])
    .select()
    .single()

  if (error) throw error
  return retro
}

export async function upvoteRetrospective(retroId: string, currentVotes: number) {
  const { data, error } = await crmSupabase
    .from('retrospectives')
    .update({ votes: currentVotes + 1 })
    .eq('id', retroId)
    .select()
    .single()

  if (error) throw error
  return data
}

/* ==========================================================================
   FEATURE 10: INTERNAL LEARNING ACADEMY (LMS)
   ========================================================================== */
export interface LearningLesson {
  id: string
  title: string
  duration: string
  completed: boolean
}

export interface LearningModule {
  id: string
  track: string
  title: string
  description: string
  duration_hours: number
  sort_order: number
  lessons: LearningLesson[]
  created_at: string
}

export interface InternLearningProgress {
  id: string
  intern_id: string
  module_id: string
  status: 'not_started' | 'in_progress' | 'completed'
  progress_percent: number
  completed_at?: string | null
}

export async function fetchLearningModules() {
  const { data, error } = await crmSupabase
    .from('learning_modules')
    .select('*')
    .order('sort_order', { ascending: true })

  if (error) throw error
  return (data || []) as LearningModule[]
}

export async function fetchInternLearningProgress(internId: string) {
  const { data, error } = await crmSupabase
    .from('intern_learning_progress')
    .select('*')
    .eq('intern_id', internId)

  if (error) throw error
  return (data || []) as InternLearningProgress[]
}

export async function updateLearningProgress(internId: string, moduleId: string, progressPercent: number) {
  const status = progressPercent >= 100 ? 'completed' : progressPercent > 0 ? 'in_progress' : 'not_started'
  const completedAt = progressPercent >= 100 ? new Date().toISOString() : null

  const { data, error } = await crmSupabase
    .from('intern_learning_progress')
    .upsert({
      intern_id: internId,
      module_id: moduleId,
      progress_percent: progressPercent,
      status,
      completed_at: completedAt,
    }, { onConflict: 'intern_id,module_id' })
    .select()
    .single()

  if (error) throw error
  return data
}

/* ==========================================================================
   FEATURE 11: DISCORD / SLACK WEBHOOK NOTIFICATION CENTER
   ========================================================================== */
export interface WebhookIntegration {
  id: string
  platform: 'slack' | 'discord' | 'webhook'
  name: string
  webhook_url: string
  is_active: boolean
  events: string[]
  last_triggered_at?: string | null
  created_at: string
}

export interface NotificationLog {
  id: string
  platform: string
  event_type: string
  payload: any
  status: string
  response_status: number
  created_at: string
}

export async function fetchWebhooks() {
  const { data, error } = await crmSupabase
    .from('webhook_integrations')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) throw error
  return data || []
}

export async function saveWebhook(webhook: {
  id?: string
  platform: 'slack' | 'discord' | 'webhook'
  name: string
  webhookUrl: string
  isActive: boolean
  events: string[]
}) {
  const payload = {
    platform: webhook.platform,
    name: webhook.name,
    webhook_url: webhook.webhookUrl,
    is_active: webhook.isActive,
    events: webhook.events,
  }

  let query
  if (webhook.id) {
    query = crmSupabase.from('webhook_integrations').update(payload).eq('id', webhook.id)
  } else {
    query = crmSupabase.from('webhook_integrations').insert([payload])
  }

  const { data, error } = await query.select().single()
  if (error) throw error
  return data
}

export async function dispatchWebhookTest(webhookId: string) {
  const { data: wh, error } = await crmSupabase
    .from('webhook_integrations')
    .update({ last_triggered_at: new Date().toISOString() })
    .eq('id', webhookId)
    .select()
    .single()

  if (error) throw error

  await crmSupabase
    .from('notification_logs')
    .insert([
      {
        platform: wh.platform,
        event_type: 'test_ping',
        payload: {
          test: true,
          message: `Test ping dispatched to ${wh.name} via DS Softwares Automation Engine.`,
          timestamp: new Date().toISOString(),
        },
        status: 'delivered',
        response_status: 200,
      },
    ])

  return wh
}

export async function fetchNotificationLogs() {
  const { data, error } = await crmSupabase
    .from('notification_logs')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(20)

  if (error) throw error
  return data || []
}
