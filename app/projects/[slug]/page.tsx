// app/projects/[slug]/page.tsx
import type { Metadata } from 'next'
import { ArrowLeft, ArrowRight, ArrowUpRight, BarChart3, Bot, Check, Layers3, Quote, Sparkles } from 'lucide-react'
import { notFound } from 'next/navigation'
import { createClient } from '@supabase/supabase-js'
import { cache } from 'react'

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

// Updated type definitions matching your actual schema
type Project = {
  id: string
  slug: string
  client_name: string
  title: string
  category: string
  hero_headline: string
  short_description: string | null
  full_description: string | null
  challenge: string | null
  solution: string | null
  results: string | null
  tech_stack: string[] | string
  visit_url: string | null
  is_published: boolean
  is_featured: boolean
  created_at: string
  updated_at: string
  page_sections: PageSection[]
  metrics: Metric[]
  testimonials: Testimonial[]
  media_assets: MediaAsset[]
}

type PageSection = {
  id: string
  project_id: string
  section_type: 'OVERVIEW' | 'CHALLENGE' | 'SOLUTION' | 'RESULTS' | 'TECH_STACK' | 'PROCESS' | 'QUOTE' | 'CUSTOM'
  title: string | null
  body: string | null
  sort_order: number
  is_active: boolean
  created_at: string
  updated_at: string
}

type Metric = {
  id: string
  project_id: string
  metrics_data: {
    metrics: Array<{
      value: string
      label: string
    }>
  }
  display_type: 'grid' | 'list' | 'single' | 'carousel'
  sort_order: number
  created_at: string
}

type Testimonial = {
  id: string
  project_id: string
  quote_text: string
  author_name: string
  author_title: string | null
  author_company: string | null
  author_image_url: string | null
  rating: number | null
  is_featured: boolean
  created_at: string
}

type MediaAsset = {
  id: string
  project_id: string
  bucket_name: string
  file_path: string
  alt_text: string | null
  mime_type: string | null
  file_size: number | null
  width: number | null
  height: number | null
  sort_order: number
  created_at: string
}

type ProjectWithDetails = Project & {
  accent: string
  icon: typeof BarChart3
  visualTitle: string
  visualItems: Array<{ value: string; label: string }>
  tag: string
  summary: string
  description: string
  solution: string
  results: string
  quote: string
  person: string
  services: string[]
  techStack: string[]
  metrics: Array<{ value: string; label: string }>
  client?: string
  liveUrl?: string
}

// Cache the data fetching
const getProjectData = cache(async (slug: string) => {
  const { data: project, error } = await supabase
    .from('projects')
    .select(`
      *,
      page_sections (*),
      metrics (*),
      testimonials (*),
      media_assets (*)
    `)
    .eq('slug', slug)
    .eq('is_published', true)
    .single()

  if (error || !project) {
    return null
  }

  return project as Project
})

const getAllProjects = cache(async () => {
  const { data: projects, error } = await supabase
    .from('projects')
    .select(`
      *,
      page_sections (*),
      metrics (*),
      testimonials (*),
      media_assets (*)
    `)
    .eq('is_published', true)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching projects:', error)
    return []
  }

  return projects as Project[]
})

// Helper function to safely parse JSON
function safeJsonParse<T>(data: any, fallback: T): T {
  if (typeof data === 'string') {
    try {
      return JSON.parse(data) as T
    } catch {
      return fallback
    }
  }
  return (data as T) || fallback
}

// Map database project to UI format
function mapProjectToUI(project: Project): ProjectWithDetails {
  // Extract sections by type
  const getSectionBody = (sectionType: string): string => {
    const section = project.page_sections?.find(s => 
      s.section_type === sectionType && s.is_active
    )
    return section?.body || ''
  }

  const challengeSection = project.page_sections?.find(s => 
    s.section_type === 'CHALLENGE' && s.is_active
  )
  const solutionSection = project.page_sections?.find(s => 
    s.section_type === 'SOLUTION' && s.is_active
  )
  const resultsSection = project.page_sections?.find(s => 
    s.section_type === 'RESULTS' && s.is_active
  )

  // Get metrics in correct order
  const metrics = project.metrics
    ?.sort((a, b) => a.sort_order - b.sort_order)
    ?.flatMap(m => {
      const metricsData = safeJsonParse<{ metrics: Array<{ value: string; label: string }> }>(
        m.metrics_data, 
        { metrics: [] }
      )
      return metricsData.metrics || []
    }) || []

  // Parse tech stack (it's stored as JSONB in your schema)
  const techStack = safeJsonParse<string[]>(project.tech_stack, [])

  // Get first testimonial (prefer featured)
  const testimonial = project.testimonials?.find(t => t.is_featured) || 
                     project.testimonials?.[0]

  // Determine icon and accent based on category
  const iconMap: Record<string, typeof BarChart3> = {
    'FINTECH': BarChart3,
    'E-COMMERCE': Layers3,
    'ARTIFICIAL INTELLIGENCE': Bot,
    'SAAS': Bot,
    'HEALTHCARE': BarChart3,
    'EDUCATION': Layers3,
    'REAL_ESTATE': BarChart3,
    'LOGISTICS': Layers3,
    'BEAUTY': Sparkles,
    'AUTOMOTIVE': Layers3,
    'NON_PROFIT': Sparkles,
  }
  
  const accentMap: Record<string, string> = {
    'FINTECH': '#7727ff',
    'E-COMMERCE': '#d815dc',
    'ARTIFICIAL INTELLIGENCE': '#9a5cff',
    'SAAS': '#6366f1',
    'HEALTHCARE': '#10b981',
    'EDUCATION': '#f59e0b',
    'REAL_ESTATE': '#ef4444',
    'LOGISTICS': '#3b82f6',
    'BEAUTY': '#ec4899',
    'AUTOMOTIVE': '#f97316',
    'NON_PROFIT': '#14b8a6',
  }

  const category = project.category.toUpperCase()
  const icon = iconMap[category] || BarChart3
  const accent = accentMap[category] || '#7727ff'

  // Build visual items from metrics (for the visual section)
  const visualItems = metrics.slice(0, 3)

  return {
    ...project,
    tag: `${project.category.toUpperCase()} · CASE STUDY`,
    summary: project.short_description || project.hero_headline,
    description: challengeSection?.body || project.challenge || '',
    solution: solutionSection?.body || project.solution || '',
    results: resultsSection?.body || project.results || '',
    services: [], // Services need to be handled differently - see note below
    techStack,
    metrics: metrics as any,
    quote: testimonial?.quote_text || '',
    person: testimonial ? 
      `${testimonial.author_name}${testimonial.author_title ? `, ${testimonial.author_title}` : ''}${testimonial.author_company ? ` - ${testimonial.author_company}` : ''}` : '',
    accent,
    icon,
    visualTitle: project.title,
    visualItems,
    slug: project.slug,
    client: project.client_name,
    liveUrl: project.visit_url || '#',
  }
}

type Props = { params: Promise<{ slug: string }> }

export async function generateStaticParams() {
  const projects = await getAllProjects()
  return projects.map((project) => ({ slug: project.slug }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const project = await getProjectData(slug)
  
  if (!project) {
    return { title: 'Project Not Found | DS Softwares' }
  }
  
  return { 
    title: `${project.client_name} Case Study | DS Softwares`, 
    description: project.short_description || project.hero_headline 
  }
}

export default async function ProjectPage({ params }: Props) {
  const { slug } = await params
  const projectData = await getProjectData(slug)
  
  if (!projectData) {
    notFound()
  }

  const project = mapProjectToUI(projectData)
  const allProjects = await getAllProjects()
  const projectIndex = allProjects.findIndex((p) => p.slug === slug)
  
  // Handle case where there's only one project
  const nextProjectData = allProjects.length > 1 
    ? allProjects[(projectIndex + 1) % allProjects.length]
    : null
    
  const nextProject = nextProjectData ? mapProjectToUI(nextProjectData) : null
  const Icon = project.icon

  return (
    <main className="min-h-screen overflow-hidden bg-[#050506] font-sans text-[#f7f5ff] selection:bg-[#7727ff]">
      <header className="mx-auto flex h-20 max-w-6xl items-center justify-between px-4 sm:h-24 sm:px-6 lg:px-8">
        <a href="/" aria-label="DS Softwares home" className="text-xl font-black tracking-[-0.04em] sm:text-2xl">
          <span className="text-[#7727ff]">DS</span>Softwares<span className="text-[#7727ff]">.</span>
        </a>
        <a href="/#work" className="inline-flex items-center gap-2 text-sm font-bold text-[#aaa6b5] transition-colors hover:text-[#f7f5ff]">
          <ArrowLeft size={17} /> All projects
        </a>
      </header>

      <section className="relative px-4 pb-16 pt-12 sm:px-6 sm:pb-20 sm:pt-16 lg:pb-28 lg:pt-24">
        <div aria-hidden="true" className="pointer-events-none absolute left-1/2 top-0 h-96 w-3/4 -translate-x-1/2 bg-[radial-gradient(ellipse_at_center,#7727ff55,transparent_68%)] blur-3xl" />
        <div className="relative mx-auto max-w-6xl">
          <p className="text-sm font-bold tracking-[0.18em] text-[#9a5cff]">{project.tag}</p>
          <div className="mt-8 flex flex-col justify-between gap-10 lg:flex-row lg:items-end">
            <div className="min-w-0 max-w-4xl">
              <p className="mb-4 text-base font-bold text-[#aaa6b5] sm:mb-5 sm:text-lg">{project.client_name}</p>
              <h1 className="break-words text-balance text-4xl font-black leading-[1.08] tracking-[-0.045em] min-[380px]:text-5xl sm:text-6xl lg:text-7xl">
                {project.title}
              </h1>
            </div>
            {project.visit_url && (
              <a 
                href={project.visit_url} 
                target="_blank" 
                rel="noreferrer" 
                className="inline-flex w-full shrink-0 items-center justify-center gap-2 rounded-lg bg-[#6417ed] px-7 py-4 text-sm font-bold hover:bg-[#7727ff] sm:w-fit"
              >
                Visit project <ArrowUpRight size={18} />
              </a>
            )}
          </div>
          <p className="mt-10 max-w-3xl text-pretty text-lg leading-relaxed text-[#c2becb] sm:text-xl">
            {project.summary}
          </p>
        </div>
      </section>

      {project.metrics.length > 0 && (
        <section className="px-4 pb-16 sm:px-6 sm:pb-24">
          <div className="mx-auto grid max-w-6xl gap-4 sm:grid-cols-3">
            {project.metrics.map((metric: any, index) => (
              <article key={`${metric.label}-${index}`} className="rounded-2xl border border-[#514d57] bg-[#111013] p-7">
                <strong className="text-4xl font-black" style={{ color: project.accent }}>{metric.value}</strong>
                <p className="mt-2 text-sm text-[#aaa6b5]">{metric.label}</p>
              </article>
            ))}
          </div>
        </section>
      )}

      {(project.description || project.solution || project.results) && (
        <section className="px-4 py-16 sm:px-6 sm:py-24">
          <div className="mx-auto grid max-w-6xl gap-16 lg:grid-cols-[1fr_1.2fr]">
            {project.description && (
              <>
                <div>
                  <p className="text-sm font-bold uppercase tracking-[0.2em] text-[#9a5cff]">The challenge</p>
                  <h2 className="mt-5 text-3xl font-black tracking-tight sm:text-4xl">Complexity was getting in the way of growth.</h2>
                </div>
                <p className="text-lg leading-relaxed text-[#aaa6b5]">{project.description}</p>
              </>
            )}
            {project.solution && (
              <>
                <div>
                  <p className="text-sm font-bold uppercase tracking-[0.2em] text-[#9a5cff]">Our solution</p>
                  <h2 className="mt-5 text-3xl font-black tracking-tight sm:text-4xl">One clear system, designed around real work.</h2>
                </div>
                <p className="text-lg leading-relaxed text-[#aaa6b5]">{project.solution}</p>
              </>
            )}
            {project.results && (
              <>
                <div>
                  <p className="text-sm font-bold uppercase tracking-[0.2em] text-[#9a5cff]">The results</p>
                  <h2 className="mt-5 text-3xl font-black tracking-tight sm:text-4xl">Measurable impact that matters.</h2>
                </div>
                <p className="text-lg leading-relaxed text-[#aaa6b5]">{project.results}</p>
              </>
            )}
          </div>
        </section>
      )}

      {project.visualItems.length > 0 && (
        <section className="px-4 py-16 sm:px-6 sm:py-24">
          <div className="mx-auto max-w-6xl overflow-hidden rounded-3xl border border-[#514d57] bg-[#111013] p-6 sm:p-10">
            <div className="flex items-center justify-between border-b border-[#302c35] pb-7">
              <div>
                <p className="text-xs font-bold tracking-[0.18em] text-[#9a5cff]">LIVE PRODUCT VIEW</p>
                <h2 className="mt-2 text-2xl font-bold">{project.visualTitle}</h2>
              </div>
              <Icon size={34} style={{ color: project.accent }} />
            </div>
            <div className="mt-8 grid gap-5 md:grid-cols-[1.5fr_1fr]">
              <div className="min-h-64 rounded-2xl border border-[#514d57] bg-[linear-gradient(145deg,#17131d,#0b0910)] p-4 sm:min-h-80 sm:p-6">
                <div className="flex h-full flex-col justify-end rounded-xl p-4 sm:p-6" style={{ background: `linear-gradient(145deg, ${project.accent}22, ${project.accent}88)` }}>
                  <Sparkles size={30} />
                  <p className="mt-5 max-w-md text-3xl font-black">A focused interface built around the decisions that matter.</p>
                </div>
              </div>
              <div className="flex flex-col gap-4">
                {project.visualItems.map((item, index) => (
                  <div key={`${item.label}-${index}`} className="flex flex-1 items-center justify-between rounded-2xl border border-[#514d57] bg-[#0b0a0d] p-6">
                    <span className="text-sm text-[#aaa6b5]">{item.label}</span>
                    <strong className="text-2xl">{item.value}</strong>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      )}

      {project.techStack.length > 0 && (
        <section className="px-4 py-16 sm:px-6 sm:py-24 bg-[#0b0a0d]">
          <div className="mx-auto max-w-6xl">
            <p className="text-sm font-bold uppercase tracking-[0.2em] text-[#9a5cff]">Tech stack</p>
            <h2 className="mt-5 text-4xl font-black tracking-tight">Technologies we used</h2>
            <div className="mt-8 flex flex-wrap gap-3">
              {project.techStack.map((tech, index) => (
                <span key={`${tech}-${index}`} className="rounded-full border border-[#514d57] bg-[#111013] px-4 py-2 text-sm font-bold">
                  {tech}
                </span>
              ))}
            </div>
          </div>
        </section>
      )}

      {project.quote && (
        <section className="bg-[linear-gradient(110deg,#1f075c,#40109a)] px-6 py-24">
          <figure className="mx-auto max-w-4xl text-center">
            <Quote className="mx-auto text-[#b58cff]" size={40} />
            <blockquote className="mt-8 text-balance text-3xl font-black leading-tight sm:text-5xl">
              "{project.quote}"
            </blockquote>
            {project.person && (
              <figcaption className="mt-7 text-[#d0c5e7]">{project.person}</figcaption>
            )}
          </figure>
        </section>
      )}

      {nextProject && nextProject.slug !== slug && (
        <section className="px-4 py-16 sm:px-6 sm:py-24">
          <div className="mx-auto flex max-w-6xl flex-col justify-between gap-8 rounded-3xl border border-[#514d57] bg-[#111013] p-8 sm:p-12 lg:flex-row lg:items-end">
            <div>
              <p className="text-sm font-bold uppercase tracking-[0.2em] text-[#9a5cff]">Next case study</p>
              <h2 className="mt-4 max-w-2xl text-4xl font-black tracking-tight sm:text-5xl">{nextProject.title}</h2>
            </div>
            <a href={`/projects/${nextProject.slug}`} className="inline-flex shrink-0 items-center gap-3 rounded-lg bg-[#6417ed] px-7 py-4 text-sm font-bold hover:bg-[#7727ff]">
              View {nextProject.client_name} <ArrowRight size={18} />
            </a>
          </div>
        </section>

      )}
       <footer className="border-t border-[#211d27] bg-[#09080b] px-4 py-12 sm:px-6 sm:py-16">
          <div className="mx-auto max-w-6xl">
            <div className="flex flex-col justify-between gap-8 border-b border-[#211d27] pb-10 sm:gap-10 sm:pb-12 lg:flex-row lg:items-end">
              <div className="max-w-xl">
                <a href="/" aria-label="DS Softwares home" className="text-2xl font-black tracking-[-0.04em]"><span className="text-[#7727ff]">DS</span>Softwares<span className="text-[#7727ff]">.</span></a>
                <h2 className="mt-5 text-balance text-2xl font-black tracking-tight min-[380px]:text-3xl sm:mt-6 sm:text-4xl">Digital work that earns attention and drives growth.</h2>
                <p className="mt-4 max-w-lg text-sm leading-relaxed text-[#aaa6b5]">Strategy, design, development, social media, and long-term support—all from one accountable team.</p>
              </div>
              <a href="/contact" className="inline-flex w-full items-center justify-center rounded-lg bg-[#6417ed] px-7 py-4 text-sm font-bold transition-colors hover:bg-[#7727ff] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#9a5cff] sm:w-fit">Start a project →</a>
            </div>
            <div className="grid gap-10 py-12 sm:grid-cols-2 lg:grid-cols-4">
              <div><p className="text-xs font-bold uppercase tracking-[0.18em] text-[#9a5cff]">Services</p><div className="mt-5 flex flex-col gap-3 text-sm text-[#aaa6b5]"><a className="hover:text-[#f7f5ff]" href="/#services">Web development</a><a className="hover:text-[#f7f5ff]" href="/#services">Custom software</a><a className="hover:text-[#f7f5ff]" href="/#services">Branding & UI/UX</a><a className="hover:text-[#f7f5ff]" href="/#services">Social media</a></div></div>
              <div><p className="text-xs font-bold uppercase tracking-[0.18em] text-[#9a5cff]">Company</p><div className="mt-5 flex flex-col gap-3 text-sm text-[#aaa6b5]"><a className="hover:text-[#f7f5ff]" href="/about">About us</a><a className="hover:text-[#f7f5ff]" href="/#work">Our work</a><a className="hover:text-[#f7f5ff]" href="/contact">Contact us</a></div></div>
              <div><p className="text-xs font-bold uppercase tracking-[0.18em] text-[#9a5cff]">Legal</p><div className="mt-5 flex flex-col gap-3 text-sm text-[#aaa6b5]"><a className="hover:text-[#f7f5ff]" href="/privacy-policy">Privacy policy</a><a className="hover:text-[#f7f5ff]" href="/terms-and-conditions">Terms & conditions</a></div></div>
              <div><p className="text-xs font-bold uppercase tracking-[0.18em] text-[#9a5cff]">Get in touch</p><div className="mt-5 flex flex-col gap-3 text-sm text-[#aaa6b5]"><a className="break-all hover:text-[#f7f5ff]" href="mailto:hello@dssoftwares.in">hello@dssoftwares.in</a><a className="hover:text-[#f7f5ff]" href="tel:+919956688553">+91 99566 88553</a><p>Available worldwide</p><p>Mon–Fri · 9:00–18:00</p></div></div>
            </div>
            <div className="flex flex-col justify-between gap-3 border-t border-[#211d27] pt-7 text-xs text-[#77727f] sm:flex-row"><p>© 2026 DS Softwares. All rights reserved.</p><p>Websites · Software · Social Media · Branding</p></div>
          </div>
        </footer>
    </main>
  )
}