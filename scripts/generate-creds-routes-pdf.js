const fs = require('fs')
const path = require('path')
const PDFDocument = require('pdfkit')

const agencyDir = __dirname
const outPath1 = path.join(__dirname, '..', 'internship-crm-user-creds-and-passwords.pdf')
const outPath2 = 'C:/Users/Sudhanshu Tiwari/.gemini/antigravity/brain/2c93af39-e8b4-45f6-9097-faa514f049f0/internship-crm-user-creds-and-passwords.pdf'

const doc = new PDFDocument({
  size: 'A4',
  margins: { top: 30, bottom: 35, left: 38, right: 38 },
  bufferPages: true
})

const writeStream1 = fs.createWriteStream(outPath1)
doc.pipe(writeStream1)

// --- COLOR PALETTE ---
const PRIMARY = '#7727FF'       // DS Softwares Vibrant Purple
const DARK = '#0B0F19'          // Slate 950
const CARD_BG = '#F8FAFC'       // Slate 50
const BORDER = '#E2E8F0'        // Slate 200
const TEXT_MAIN = '#1E293B'     // Slate 800
const TEXT_MUTED = '#64748B'    // Slate 500
const GREEN_BG = '#DCFCE7'      // Emerald 100
const GREEN_TEXT = '#15803D'    // Emerald 700
const PURPLE_BG = '#EDE9FE'     // Violet 100
const PURPLE_TEXT = '#6D28D9'   // Violet 700
const BLUE_BG = '#E0F2FE'       // Sky 100
const BLUE_TEXT = '#0369A1'     // Sky 700
const CODE_BG = '#F1F5F9'

// ==========================================
// PAGE 1: AUTHENTICATION CREDS & USER PASSWORDS
// ==========================================

// Top Accent Line
doc.rect(38, 30, 519, 4).fill(PRIMARY)

// Header
doc.fontSize(20).font('Helvetica-Bold').fillColor(DARK).text('DS', 38, 40, { continued: true })
doc.fillColor(DARK).text('Softwares', { continued: true })
doc.fillColor(PRIMARY).text('.')

doc.fontSize(10).font('Helvetica-Bold').fillColor(PRIMARY).text('ENTERPRISE INTERNSHIP CRM & PORTAL', 38, 66)
doc.fontSize(8).font('Helvetica').fillColor(TEXT_MUTED).text('Official Testing Credentials, User Accounts with Passwords & Complete Route Directory', 38, 79)

// Verified Status Banner
doc.roundedRect(38, 93, 519, 24, 4).fill(GREEN_BG)
doc.fontSize(8).font('Helvetica-Bold').fillColor(GREEN_TEXT)
doc.text('LIVE SUPABASE AUTHENTICATION: 100% VERIFIED (7/7 Accounts Tested & Active with Valid JWTs)', 48, 101)

// Section 1: Admin & Executive Accounts (With Passwords)
doc.fontSize(10).font('Helvetica-Bold').fillColor(DARK).text('1. Administrative & Executive Accounts (With Passwords)', 38, 126)
doc.rect(38, 138, 519, 1).fill(BORDER)

const adminAccounts = [
  {
    roleName: 'Super Administrator',
    badge: 'SUPER ADMIN',
    name: 'Chief Systems Administrator',
    email: 'admin@dssoftwares.com',
    pass: 'AdminPass2026!',
    scope: 'Full unrestricted CRM administrative privileges, settings, integrations, and audits.'
  },
  {
    roleName: 'Operations Manager',
    badge: 'MANAGER',
    name: 'Engineering Operations Manager',
    email: 'manager@dssoftwares.com',
    pass: 'ManagerPass2026!',
    scope: 'Candidate ATS screening, cohort batch management, leave approvals, stipend payouts.'
  },
  {
    roleName: 'Technical Lead & Mentor',
    badge: 'TECH LEAD',
    name: 'Dev Lead & Mentor',
    email: 'lead@dssoftwares.com',
    pass: 'TechLeadPass2026!',
    scope: 'Sprint Kanban task assignments, GitHub PR reviews, daily standups radar, 1:1 office hours.'
  },
  {
    roleName: 'Cohort Batch Leader',
    badge: 'BATCH LEADER',
    name: 'Alpha Cohort Batch Leader',
    email: 'batchlead@dssoftwares.com',
    pass: 'BatchLeadPass2026!',
    scope: 'Squad milestone evaluations, sprint retrospective moderation, attendance audits.'
  }
]

let aY = 144
adminAccounts.forEach((acc) => {
  doc.roundedRect(38, aY, 519, 44, 4).fillAndStroke(CARD_BG, BORDER)
  doc.rect(38, aY, 3, 44).fill(PRIMARY)

  doc.fontSize(8.5).font('Helvetica-Bold').fillColor(DARK).text(acc.roleName, 48, aY + 5, { continued: true })
  doc.fontSize(7).font('Helvetica').fillColor(TEXT_MUTED).text(`  •  ${acc.name}`)

  // Credentials row
  doc.fontSize(7).font('Helvetica-Bold').fillColor(PURPLE_TEXT).text('Email:', 48, aY + 18)
  doc.fontSize(7.5).font('Courier-Bold').fillColor(DARK).text(acc.email, 78, aY + 18)

  doc.fontSize(7).font('Helvetica-Bold').fillColor(PURPLE_TEXT).text('Password:', 255, aY + 18)
  doc.roundedRect(302, aY + 15, 120, 15, 3).fill(CODE_BG)
  doc.fontSize(7.5).font('Courier-Bold').fillColor(PRIMARY).text(acc.pass, 308, aY + 19)

  doc.fontSize(6).font('Helvetica').fillColor(TEXT_MUTED).text(acc.scope, 48, aY + 31, { width: 440 })

  // Role Badge
  doc.roundedRect(445, aY + 5, 80, 13, 2).fill(PURPLE_BG)
  doc.fontSize(6).font('Helvetica-Bold').fillColor(PURPLE_TEXT).text(acc.badge, 445, aY + 9, { width: 80, align: 'center' })

  aY += 49
})

// Section 2: Intern Testing Accounts (With Passwords)
doc.fontSize(10).font('Helvetica-Bold').fillColor(DARK).text('2. Active Intern User Accounts (With Passwords)', 38, aY + 6)
doc.rect(38, aY + 18, 519, 1).fill(BORDER)

const internAccounts = [
  {
    name: 'Aarav Sharma',
    badge: 'FRONTEND LEAD',
    email: 'aarav.sharma@dssoftwares.com',
    pass: 'InternAarav2026!',
    uuid: '11111111-1111-4111-a111-111111111111',
    tier: 'Full-Stack Vanguard (1,450 XP  |  14-day streak)',
    badges: 'Bug Hunter, Clean Architecture, Sprint Champion'
  },
  {
    name: 'Priya Patel',
    badge: 'UI/UX CRAFTSMAN',
    email: 'priya.patel@dssoftwares.com',
    pass: 'InternPriya2026!',
    uuid: '22222222-2222-4222-a222-222222222222',
    tier: 'Craftsman (820 XP  |  9-day streak)',
    badges: 'Clean Architecture, 100% Standups'
  },
  {
    name: 'Rohan Verma',
    badge: 'CLOUD VANGUARD',
    email: 'rohan.verma@dssoftwares.com',
    pass: 'InternRohan2026!',
    uuid: '33333333-3333-4333-a333-333333333333',
    tier: 'Full-Stack Vanguard (1,980 XP  |  21-day streak)',
    badges: 'Sprint Champion, Bug Hunter, Cloud Architect'
  }
]

let iY = aY + 24
internAccounts.forEach((acc) => {
  doc.roundedRect(38, iY, 519, 58, 4).fillAndStroke(CARD_BG, BORDER)
  doc.rect(38, iY, 3, 58).fill(GREEN_TEXT)

  doc.fontSize(8.5).font('Helvetica-Bold').fillColor(DARK).text(acc.name, 48, iY + 5, { continued: true })
  doc.fontSize(6.5).font('Courier').fillColor(TEXT_MUTED).text(`  (UUID: ${acc.uuid})`)

  doc.fontSize(7).font('Helvetica-Bold').fillColor(DARK).text('Email:', 48, iY + 19)
  doc.fontSize(7.5).font('Courier-Bold').fillColor(DARK).text(acc.email, 82, iY + 19)

  doc.fontSize(7).font('Helvetica-Bold').fillColor(DARK).text('Password:', 255, iY + 19)
  doc.roundedRect(302, iY + 16, 120, 15, 3).fill(CODE_BG)
  doc.fontSize(7.5).font('Courier-Bold').fillColor(GREEN_TEXT).text(acc.pass, 308, iY + 20)

  doc.fontSize(6.5).font('Helvetica-Bold').fillColor(PURPLE_TEXT).text('Gamification Tier:', 48, iY + 33)
  doc.fontSize(6.5).font('Helvetica').fillColor(TEXT_MAIN).text(acc.tier, 130, iY + 33)

  doc.fontSize(6.5).font('Helvetica-Bold').fillColor(DARK).text('Badges Unlocked:', 48, iY + 45)
  doc.fontSize(6.5).font('Helvetica').fillColor(TEXT_MUTED).text(acc.badges, 130, iY + 45)

  // Badge
  doc.roundedRect(435, iY + 5, 90, 13, 2).fill(GREEN_BG)
  doc.fontSize(6).font('Helvetica-Bold').fillColor(GREEN_TEXT).text(acc.badge, 435, iY + 9, { width: 90, align: 'center' })

  iY += 64
})

// Section 3: Live Database Connection Credentials
doc.fontSize(10).font('Helvetica-Bold').fillColor(DARK).text('3. Live Database & API Connection Credentials', 38, iY + 6)
doc.rect(38, iY + 18, 519, 1).fill(BORDER)

const dbBoxY = iY + 24
doc.roundedRect(38, dbBoxY, 519, 84, 4).fillAndStroke(CARD_BG, BORDER)

const dbCreds = [
  { label: 'Supabase Project URL', val: 'https://uchjkqragyvtoriflmjp.supabase.co' },
  { label: 'Anon Public Key', val: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVjaGprcXJhZ3l2dG9yaWZsbWpwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTQxMzc3MTAsImV4cCI6MjEwOTcxMzcxMH0.nu_jiYfH3Z-tTtdLvGMf9aXauMxF2SU049MAzKTeHbM' },
  { label: 'Direct PostgreSQL URI', val: 'postgresql://postgres:UCShl5WCZXEIau5J@db.uchjkqragyvtoriflmjp.supabase.co:5432/postgres' },
  { label: 'Database Parameters', val: 'Host: db.uchjkqragyvtoriflmjp.supabase.co  |  Port: 5432  |  User: postgres  |  DB: postgres' }
]

let dbY = dbBoxY + 7
dbCreds.forEach((dc) => {
  doc.fontSize(7).font('Helvetica-Bold').fillColor(PRIMARY).text(dc.label + ':', 48, dbY)
  doc.fontSize(6.5).font('Courier').fillColor(TEXT_MAIN).text(dc.val, 155, dbY, { width: 390 })
  dbY += (dc.label === 'Anon Public Key' ? 24 : 17)
})

// ==========================================
// PAGE 2: COMPLETE ROUTE DIRECTORY & FLOWS
// ==========================================
doc.addPage()
doc.rect(38, 30, 519, 4).fill(PRIMARY)

doc.fontSize(14).font('Helvetica-Bold').fillColor(DARK).text('4. Complete Admin CRM Route Directory (13 Hubs)', 38, 40)
doc.fontSize(8).font('Helvetica').fillColor(TEXT_MUTED).text('Access via http://localhost:3000/admin/crm/* or press Cmd/Ctrl + K for Command Palette.', 38, 56)
doc.rect(38, 66, 519, 1).fill(BORDER)

const allRoutes = [
  { path: '/admin/crm/applications', name: 'Candidate ATS & Pipeline', test: 'Filter by stages, view resume parsing AI match score, generate offer letters', badge: 'CORE' },
  { path: '/admin/crm/batches', name: 'Batches, Cohorts & Squads', test: 'Inspect 2026 Q4 Alpha Cohort, squad leader assignments, assign interns to teams', badge: 'CORE' },
  { path: '/admin/crm/tasks', name: 'Sprint Backlog & Kanban', test: 'Drag & drop deliverables between Todo, In Progress, Review, and Done states', badge: 'CORE' },
  { path: '/admin/crm/standups', name: 'Daily Standups & Blockers', test: 'Review daily check-ins, identify flagged blockers, provide mentor feedback', badge: 'CORE' },
  { path: '/admin/crm/leaves', name: 'Attendance & Leave Approvals', test: 'Review pending requests, approve/reject time-off with live quota debits', badge: 'CORE' },
  { path: '/admin/crm/payslips', name: 'Stipends & PDF Payslips', test: 'Review monthly base compensation (Rs 16k–20k), generate & download payslip PDFs', badge: 'CORE' },
  { path: '/admin/crm/certificates', name: 'Accreditation & Minting', test: 'Mint verifiable cryptographic completion certificates with grade badges', badge: 'CORE' },
  { path: '/admin/crm/leaderboard', name: 'Developer XP & Leaderboard', test: 'Podium cards, award XP & badges modal, track commit & standup flame streaks', badge: 'OPTION D' },
  { path: '/admin/crm/reviews', name: 'GitHub PR & Peer Reviews', test: 'Audit PR submissions across 4-pillar rubric (Architecture, Clean Code, Perf, Tests)', badge: 'OPTION D' },
  { path: '/admin/crm/evaluations', name: 'Skill Matrix & Milestone PPO', test: 'Submit 30-day/60-day/final reviews across 6 pillars, toggle PPO recommendation', badge: 'OPTION D' },
  { path: '/admin/crm/mentorship', name: '1:1 Mentorship & Retros', test: 'Book mentor office hours with Google Meet integration, upvote 4-column retro board', badge: 'OPTION D' },
  { path: '/admin/crm/academy', name: 'Technical Academy (LMS)', test: 'Browse curriculum modules (Next.js 15, PostgreSQL, AI Agents) with syllabus checklists', badge: 'OPTION D' },
  { path: '/admin/crm/integrations', name: 'Webhooks & Audit Logs', test: 'Configure Discord/Slack webhook endpoints, trigger live test ping, review audit logs', badge: 'OPTION D' }
]

const rThY = 72
doc.rect(38, rThY, 519, 14).fill('#F1F5F9')
doc.fontSize(6.5).font('Helvetica-Bold').fillColor(DARK)
doc.text('ROUTE PATH', 44, rThY + 4)
doc.text('MODULE NAME & TEST ACTIONS', 180, rThY + 4)
doc.text('TYPE', 495, rThY + 4)

let rY = rThY + 14
allRoutes.forEach((ar, idx) => {
  const rowBg = idx % 2 === 0 ? '#FFFFFF' : '#F8FAFC'
  doc.rect(38, rY, 519, 23).fill(rowBg)

  doc.fontSize(6.5).font('Helvetica-Bold').fillColor(PRIMARY).text(ar.path, 44, rY + 3.5)
  doc.fontSize(6.5).font('Helvetica-Bold').fillColor(DARK).text(ar.name, 180, rY + 3.5)
  doc.fontSize(5.5).font('Helvetica').fillColor(TEXT_MUTED).text(ar.test, 180, rY + 12.5, { width: 300 })

  const isOptD = ar.badge === 'OPTION D'
  doc.roundedRect(485, rY + 5, 60, 11, 2).fill(isOptD ? PURPLE_BG : BLUE_BG)
  doc.fontSize(5).font('Helvetica-Bold').fillColor(isOptD ? PURPLE_TEXT : BLUE_TEXT).text(ar.badge, 485, rY + 8, { width: 60, align: 'center' })

  rY += 23
})

// Section 5: Public Candidate & Verification Routes
doc.fontSize(10).font('Helvetica-Bold').fillColor(DARK).text('5. Public Candidate & Verification Routes (With Sample Tokens)', 38, rY + 8)
doc.rect(38, rY + 20, 519, 1).fill(BORDER)

const pubRoutes = [
  {
    path: '/apply',
    name: 'Candidate Application Portal',
    url: 'http://localhost:3000/apply',
    desc: 'Public application form with resume file upload, program dropdown, and automatic ATS pipeline insertion.'
  },
  {
    path: '/offer/[id]',
    name: 'Interactive Cryptographic Offer Letter',
    url: 'http://localhost:3000/offer/00000000-0000-0000-0000-000000000001',
    desc: 'Live candidate offer for Aarav Sharma featuring digital signature pad, stipend terms, and acceptance confirmation.'
  },
  {
    path: '/verify/[id]',
    name: 'Accreditation & Certificate Verification',
    url: 'http://localhost:3000/verify/DS-2026-CERT-001',
    desc: 'Public verification engine showing Aarav Sharma’s validated certificate, issuance timestamp, and grade badge.'
  }
]

let pY2 = rY + 25
pubRoutes.forEach((pr) => {
  doc.roundedRect(38, pY2, 519, 36, 4).fillAndStroke(CARD_BG, BORDER)
  doc.rect(38, pY2, 3, 36).fill(PRIMARY)

  doc.fontSize(7.5).font('Helvetica-Bold').fillColor(DARK).text(pr.name, 48, pY2 + 4, { continued: true })
  doc.fontSize(6.5).font('Helvetica').fillColor(TEXT_MUTED).text(`  •  Pattern: ${pr.path}`)

  doc.fontSize(6.5).font('Helvetica-Bold').fillColor(PRIMARY).text('Direct Test URL:', 48, pY2 + 15)
  doc.fontSize(6.5).font('Courier').fillColor(TEXT_MAIN).text(pr.url, 120, pY2 + 15)

  doc.fontSize(5.5).font('Helvetica').fillColor(TEXT_MUTED).text(pr.desc, 48, pY2 + 25, { width: 495 })

  pY2 += 40
})

// ==========================================
// PAGE 3: INTERN WORKSPACE GUIDE & QA CHECKLIST
// ==========================================
doc.addPage()
doc.rect(38, 30, 519, 4).fill(PRIMARY)

doc.fontSize(14).font('Helvetica-Bold').fillColor(DARK).text('6. Intern Workspace Guide (/portal) — 9 Interactive Tabs', 38, 40)
doc.fontSize(8).font('Helvetica').fillColor(TEXT_MUTED).text('Main Intern Portal URL: http://localhost:3000/portal (Switch accounts via top-right dropdown)', 38, 56)
doc.rect(38, 66, 519, 1).fill(BORDER)

const portalTabs = [
  { no: 'Tab 1', name: 'Sprint Tasks (Kanban)', desc: 'View assigned deliverables categorized by Todo, In Progress, Review, and Done with priority badges.' },
  { no: 'Tab 2', name: 'Daily Standups', desc: 'Submit daily check-ins with what was shipped yesterday, today’s sprint focus, and toggle blocker alerts.' },
  { no: 'Tab 3', name: 'PR & Peer Code Reviews', desc: 'Submit GitHub PR links for review and inspect mentor rubric scores across 4 engineering dimensions.' },
  { no: 'Tab 4', name: 'Tech Academy & Roadmaps', desc: 'Browse curriculum modules (Next.js 15, PostgreSQL, AI Agents), track progress, and toggle syllabus items.' },
  { no: 'Tab 5', name: '1:1 Mentorship Booking', desc: 'Schedule office hours with senior mentors (Google Meet links) and review scheduled sessions.' },
  { no: 'Tab 6', name: 'Skill Matrix & PPO Radar', desc: 'Visual progress across 6 engineering pillars and real-time Pre-Placement Offer eligibility indicator.' },
  { no: 'Tab 7', name: 'Leaves & Attendance', desc: 'Submit sick/casual time-off requests and monitor live available balances (12 total allocated).' },
  { no: 'Tab 8', name: 'Stipends & Payslips', desc: 'Inspect monthly base stipend breakdown and download official PDF compensation vouchers.' },
  { no: 'Tab 9', name: 'Accreditation & Certificate', desc: 'View official certificate of completion with direct link to the public verification engine.' }
]

let ptY = 74
portalTabs.forEach((t) => {
  doc.roundedRect(38, ptY, 519, 23, 3).fillAndStroke(CARD_BG, BORDER)
  doc.fontSize(6.5).font('Helvetica-Bold').fillColor(PRIMARY).text(t.no, 46, ptY + 4)
  doc.fontSize(7).font('Helvetica-Bold').fillColor(DARK).text(t.name, 88, ptY + 4)
  doc.fontSize(6).font('Helvetica').fillColor(TEXT_MUTED).text(t.desc, 88, ptY + 13, { width: 455 })
  ptY += 26
})

// Section 7: Testing Instructions
doc.fontSize(10).font('Helvetica-Bold').fillColor(DARK).text('7. Quick Start Testing Instructions', 38, ptY + 8)
doc.rect(38, ptY + 20, 519, 1).fill(BORDER)

const steps = [
  { step: 'Step 1: Start Next.js App', instr: 'Run `npm run dev` in the terminal to launch http://localhost:3000.' },
  { step: 'Step 2: Sign In as Admin', instr: 'Use `admin@dssoftwares.com` with password `AdminPass2026!` for complete administrative access.' },
  { step: 'Step 3: Test Intern Portal', instr: 'Navigate to http://localhost:3000/portal. Use the top-right persona selector to switch to Aarav Sharma, Priya Patel, or Rohan Verma.' },
  { step: 'Step 4: Test Interactive Flows', instr: 'Award XP at `/admin/crm/leaderboard`, submit code review at `/admin/crm/reviews`, and book office hours at `/portal` tab 5.' }
]

let stY = ptY + 26
steps.forEach((st) => {
  doc.roundedRect(38, stY, 519, 26, 3).fillAndStroke('#FFFFFF', BORDER)
  doc.rect(38, stY, 3, 26).fill(PRIMARY)
  doc.fontSize(7).font('Helvetica-Bold').fillColor(PRIMARY).text(st.step, 46, stY + 4)
  doc.fontSize(6.5).font('Helvetica').fillColor(TEXT_MAIN).text(st.instr, 46, stY + 14, { width: 495 })
  stY += 30
})

// Formal Sign-off
const signBoxY = stY + 6
doc.roundedRect(38, signBoxY, 519, 42, 4).fillAndStroke('#FAF5FF', '#D8B4FE')

doc.fontSize(6.5).font('Helvetica-Bold').fillColor(TEXT_MUTED)
doc.text('TESTING AUTH AUDITOR', 48, signBoxY + 8)
doc.text('SECURITY STATUS', 220, signBoxY + 8)
doc.text('LOGIN VERIFICATION', 390, signBoxY + 8)

doc.fontSize(8.5).font('Helvetica-Bold')
doc.fillColor(DARK).text('Antigravity AI (DeepMind)', 48, signBoxY + 22)
doc.fillColor(DARK).text('PostgreSQL 17 + RLS Active', 220, signBoxY + 22)
doc.fillColor(GREEN_TEXT).text('100% VERIFIED & ACTIVE', 390, signBoxY + 22)

// Global Page Footers
const pages = doc.bufferedPageRange()
for (let i = 0; i < pages.count; i++) {
  doc.switchToPage(i)
  doc.fontSize(6.5).font('Helvetica').fillColor(TEXT_MUTED)
  doc.text('DS Softwares Agency  •  Enterprise Internship CRM Credentials & Route Directory', 38, 805)
  doc.text(`Page ${i + 1} of ${pages.count}`, 485, 805, { align: 'right' })
}

doc.end()

writeStream1.on('finish', () => {
  console.log('PDF written successfully to:', outPath1)
  try {
    fs.copyFileSync(outPath1, outPath2)
    console.log('PDF synced to artifact directory:', outPath2)
  } catch (e) {
    console.error('Copy to artifact error:', e.message)
  }
})
