import {
  LayoutDashboard,
  FolderKanban,
  Wrench,
  Quote,
  Newspaper,
  Inbox,
  Users2,
  Camera,
  Settings,
  HelpCircle,
  Code2,
  Sparkles,
  Cloud,
  Palette,
  Smartphone,
  TrendingUp,
  Bot,
  ShieldCheck,
  Database,
  Globe,
  Zap,
} from 'lucide-react'

// Types
export interface Project {
  id: string
  slug: string
  client_name: string
  title: string
  category: string
  hero_headline: string
  short_description: string | null
  full_description: string | null
  visit_url: string | null
  challenge: string | null
  solution: string | null
  results: string | null
  tech_stack: any
  is_published: boolean
  is_featured: boolean
  created_at: string
  updated_at: string
}

export interface MediaAsset {
  id?: string
  project_id?: string
  bucket_name: string
  file_path: string
  alt_text?: string
  mime_type?: string
  file_size?: number
  width?: number
  height?: number
  sort_order?: number
  created_at?: string
  publicUrl?: string
  name?: string
  metadata?: any
}

export interface SiteSettings {
  site_name: string
  site_description: string
  contact_email: string
  contact_phone: string
  address: string
  social_links: {
    linkedin?: string
    twitter?: string
    github?: string
    instagram?: string
    facebook?: string
    youtube?: string
  }
  seo_settings: {
    meta_title: string
    meta_description: string
    google_analytics_id: string
  }
}

export interface NavigationItem {
  id: string
  label: string
  href: string
  icon: any
}

export interface NavigationSection {
  title: string
  items: NavigationItem[]
}

// Navigation sections with dedicated App Router hrefs
export const navigationSections: NavigationSection[] = [
  {
    title: 'Overview',
    items: [
      { id: 'dashboard', label: 'Dashboard', href: '/admin', icon: LayoutDashboard },
    ]
  },
  {
    title: 'Content',
    items: [
      { id: 'projects', label: 'Projects', href: '/admin/projects', icon: FolderKanban },
      { id: 'blog', label: 'Blog Posts', href: '/admin/blog', icon: Newspaper },
      { id: 'testimonials', label: 'Testimonials', href: '/admin/testimonials', icon: Quote },
      { id: 'faqs', label: 'FAQs', href: '/admin/faqs', icon: HelpCircle },
      { id: 'media', label: 'Media Library', href: '/admin/media', icon: Camera },
    ]
  },
  {
    title: 'Management',
    items: [
      { id: 'services', label: 'Services', href: '/admin/services', icon: Wrench },
      { id: 'team', label: 'Team Members', href: '/admin/team', icon: Users2 },
      { id: 'contacts', label: 'Inbox', href: '/admin/contacts', icon: Inbox },
    ]
  },
  {
    title: 'Configuration',
    items: [
      { id: 'settings', label: 'Site Settings', href: '/admin/settings', icon: Settings },
    ]
  },
]

export const categories = [
  'FINTECH',
  'E-COMMERCE',
  'ARTIFICIAL INTELLIGENCE',
  'SAAS',
  'HEALTHCARE',
  'EDUCATION',
  'REAL_ESTATE',
  'LOGISTICS',
  'BEAUTY',
  'AUTOMOTIVE',
  'NON_PROFIT'
]

export const blogCategories = [
  'TECHNOLOGY',
  'DESIGN',
  'DEVELOPMENT',
  'BUSINESS',
  'INDUSTRY INSIGHTS',
  'TUTORIALS',
  'CASE STUDIES',
  'COMPANY NEWS'
]

export const contactStatuses = [
  'new',
  'contacted',
  'qualified',
  'proposal_sent',
  'won',
  'closed',
  'spam'
]

export const faqCategories = [
  'GENERAL',
  'SERVICES',
  'PRICING',
  'PROCESS',
  'TECHNICAL',
  'SUPPORT',
  'PARTNERSHIP'
]

export const sectionTypes = [
  'OVERVIEW',
  'CHALLENGE',
  'SOLUTION',
  'RESULTS',
  'TECH_STACK',
  'PROCESS',
  'QUOTE',
  'CUSTOM'
]

export const bucketNames = [
  'project-images',
  'project-media',
  'brand-assets',
  'team-photos',
  'project-documents',
  'project-videos'
]

export const SETTING_KEYS = {
  SITE_INFO: 'site_info',
  CONTACT_INFO: 'contact_info',
  SOCIAL_LINKS: 'social_links',
  SEO_SETTINGS: 'seo_settings'
}

export const availableServiceIcons = [
  { name: 'Code2', icon: Code2, label: 'Custom Software' },
  { name: 'Sparkles', icon: Sparkles, label: 'AI & Automation' },
  { name: 'Cloud', icon: Cloud, label: 'Cloud Solutions' },
  { name: 'Palette', icon: Palette, label: 'UI/UX & Branding' },
  { name: 'Smartphone', icon: Smartphone, label: 'Mobile & Web' },
  { name: 'TrendingUp', icon: TrendingUp, label: 'Growth / Social' },
  { name: 'Bot', icon: Bot, label: 'Bots & Workflows' },
  { name: 'ShieldCheck', icon: ShieldCheck, label: 'Security & QA' },
  { name: 'Database', icon: Database, label: 'Databases & APIs' },
  { name: 'Globe', icon: Globe, label: 'Web Platform' },
  { name: 'Wrench', icon: Wrench, label: 'Maintenance & Tools' },
  { name: 'Zap', icon: Zap, label: 'Speed & Optimization' },
]

export const serviceIconMap: Record<string, any> = {
  Code2,
  Sparkles,
  Cloud,
  Palette,
  Smartphone,
  TrendingUp,
  Bot,
  ShieldCheck,
  Database,
  Globe,
  Wrench,
  Zap,
}

export function exportContactsToCSV(contacts: any[]) {
  if (!contacts || contacts.length === 0) return
  const headers = ['Name', 'Email', 'Company', 'Phone', 'Project Type', 'Budget Range', 'Status', 'Date', 'Message']
  const csvRows = [headers.join(',')]
  contacts.forEach((c) => {
    const row = [
      `"${(c.name || '').replace(/"/g, '""')}"`,
      `"${(c.email || '').replace(/"/g, '""')}"`,
      `"${(c.company || '').replace(/"/g, '""')}"`,
      `"${(c.phone || '').replace(/"/g, '""')}"`,
      `"${(c.project_type || '').replace(/"/g, '""')}"`,
      `"${(c.budget_range || '').replace(/"/g, '""')}"`,
      `"${(c.status || '').replace(/"/g, '""')}"`,
      `"${c.created_at ? new Date(c.created_at).toISOString() : ''}"`,
      `"${(c.message || '').replace(/"/g, '""')}"`,
    ]
    csvRows.push(row.join(','))
  })
  const blob = new Blob([csvRows.join('\n')], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.setAttribute('href', url)
  link.setAttribute('download', `ds-softwares-leads-${new Date().toISOString().split('T')[0]}.csv`)
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}
