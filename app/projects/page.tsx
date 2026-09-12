'use client'

import {
  ArrowLeft,
  ArrowRight,
  ArrowUpRight,
  BarChart3,
  Bot,
  Braces,
  Cloud,
  Code2,
  Globe2,
  Layers3,
  Menu,
  Palette,
  ShieldCheck,
  Smartphone,
  Sparkles,
  Star,
  X,
  Search,
  Filter,
} from 'lucide-react'
import { useEffect, useState } from 'react'
import { createClient } from '@supabase/supabase-js'

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

// Types based on your schema
interface Project {
  id: string
  slug: string
  client_name: string
  title: string
  category: string
  hero_headline: string
  short_description: string | null
  visit_url: string | null
  is_published: boolean
  created_at: string
  updated_at: string
}

interface MediaAsset {
  id: string
  project_id: string
  bucket_name: string
  file_path: string
  alt_text: string | null
  mime_type: string | null
  sort_order: number
}

// Static fallback projects
const fallbackProjects = [
  {
    id: '1',
    slug: 'fintech-dashboard',
    client_name: 'FinTech Corp',
    title: 'Fintech Dashboard',
    category: 'FINTECH',
    hero_headline: 'Streamlined user analytics and real-time transactions.',
    short_description: 'Streamlined user analytics and real-time transactions.',
    visit_url: 'https://example.com',
    is_published: true,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
  },
  {
    id: '2',
    slug: 'ecommerce-platform',
    client_name: 'ShopEase',
    title: 'E-commerce Platform',
    category: 'E-COMMERCE',
    hero_headline: '300% increase in conversion through custom storefront.',
    short_description: '300% increase in conversion through custom storefront.',
    visit_url: 'https://example.com',
    is_published: true,
    created_at: '2024-01-02T00:00:00Z',
    updated_at: '2024-01-02T00:00:00Z',
  },
  {
    id: '3',
    slug: 'ai-support-tool',
    client_name: 'TechAI',
    title: 'AI-Powered Tool',
    category: 'AI',
    hero_headline: 'Reduced support tickets by 40% using predictive models.',
    short_description: 'Reduced support tickets by 40% using predictive models.',
    visit_url: 'https://example.com',
    is_published: true,
    created_at: '2024-01-03T00:00:00Z',
    updated_at: '2024-01-03T00:00:00Z',
  },
  {
    id: '4',
    slug: 'cloud-migration',
    client_name: 'DataFlow',
    title: 'Cloud Migration Suite',
    category: 'CLOUD',
    hero_headline: 'Seamless migration to AWS with zero downtime.',
    short_description: 'Seamless migration to AWS with zero downtime.',
    visit_url: 'https://example.com',
    is_published: true,
    created_at: '2024-01-04T00:00:00Z',
    updated_at: '2024-01-04T00:00:00Z',
  },
  {
    id: '5',
    slug: 'mobile-banking',
    client_name: 'BankGo',
    title: 'Mobile Banking App',
    category: 'MOBILE',
    hero_headline: 'Secure mobile banking with biometric authentication.',
    short_description: 'Secure mobile banking with biometric authentication.',
    visit_url: 'https://example.com',
    is_published: true,
    created_at: '2024-01-05T00:00:00Z',
    updated_at: '2024-01-05T00:00:00Z',
  },
  {
    id: '6',
    slug: 'brand-identity',
    client_name: 'Lumina',
    title: 'Brand Identity System',
    category: 'BRANDING',
    hero_headline: 'Complete brand overhaul with 200% brand recognition increase.',
    short_description: 'Complete brand overhaul with 200% brand recognition increase.',
    visit_url: 'https://example.com',
    is_published: true,
    created_at: '2024-01-06T00:00:00Z',
    updated_at: '2024-01-06T00:00:00Z',
  },
  {
    id: '7',
    slug: 'healthcare-platform',
    client_name: 'MediCare',
    title: 'Healthcare Platform',
    category: 'TECH',
    hero_headline: 'HIPAA-compliant telemedicine platform serving 100k+ patients.',
    short_description: 'HIPAA-compliant telemedicine platform serving 100k+ patients.',
    visit_url: 'https://example.com',
    is_published: true,
    created_at: '2024-01-07T00:00:00Z',
    updated_at: '2024-01-07T00:00:00Z',
  },
  {
    id: '8',
    slug: 'social-media-dashboard',
    client_name: 'SocialPulse',
    title: 'Social Media Dashboard',
    category: 'AI',
    hero_headline: 'AI-powered social media analytics and scheduling.',
    short_description: 'AI-powered social media analytics and scheduling.',
    visit_url: 'https://example.com',
    is_published: true,
    created_at: '2024-01-08T00:00:00Z',
    updated_at: '2024-01-08T00:00:00Z',
  },
  {
    id: '9',
    slug: 'logistics-tracker',
    client_name: 'ShipFast',
    title: 'Logistics Tracking System',
    category: 'TECH',
    hero_headline: 'Real-time logistics tracking with predictive delivery times.',
    short_description: 'Real-time logistics tracking with predictive delivery times.',
    visit_url: 'https://example.com',
    is_published: true,
    created_at: '2024-01-09T00:00:00Z',
    updated_at: '2024-01-09T00:00:00Z',
  },
]

const iconMapByCategory: Record<string, any> = {
  'FINTECH': BarChart3,
  'E-COMMERCE': Layers3,
  'AI': Sparkles,
  'TECH': Code2,
  'CLOUD': Cloud,
  'MOBILE': Smartphone,
  'BRANDING': Palette,
  'SOFTWARE': Code2,
  'AUTOMATION': Bot,
  'SECURITY': ShieldCheck,
  'DEFAULT': Code2,
}

const categories = [
  'All',
  'FINTECH',
  'E-COMMERCE',
  'AI',
  'TECH',
  'CLOUD',
  'MOBILE',
  'BRANDING',
]

export default function ProjectsPage() {
  const [menuOpen, setMenuOpen] = useState(false)
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedCategory, setSelectedCategory] = useState('All')
  const [searchTerm, setSearchTerm] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const projectsPerPage = 9

  // Fetch projects from Supabase
  useEffect(() => {
    async function fetchProjects() {
      try {
        setLoading(true)
        
        // Fetch all published projects
        const { data: projectsData, error: projectsError } = await supabase
          .from('projects')
          .select('*')
          .eq('is_published', true)
          .order('created_at', { ascending: false })

        if (projectsError) throw projectsError

        if (projectsData && projectsData.length > 0) {
          setProjects(projectsData)
        } else {
          // Use fallback data if no projects in database
          setProjects(fallbackProjects)
        }
      } catch (err) {
        console.error('Error fetching projects:', err)
        setError(err instanceof Error ? err.message : 'Failed to fetch projects')
        // Use fallback data on error
        setProjects(fallbackProjects)
      } finally {
        setLoading(false)
      }
    }

    fetchProjects()
  }, [])

  // Filter projects based on category and search
  const filteredProjects = projects.filter(project => {
    const matchesCategory = selectedCategory === 'All' || project.category === selectedCategory
    const matchesSearch = 
      project.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      project.client_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      project.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (project.short_description || '').toLowerCase().includes(searchTerm.toLowerCase())
    
    return matchesCategory && matchesSearch
  })

  // Pagination
  const totalPages = Math.ceil(filteredProjects.length / projectsPerPage)
  const startIndex = (currentPage - 1) * projectsPerPage
  const paginatedProjects = filteredProjects.slice(startIndex, startIndex + projectsPerPage)

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1)
  }, [selectedCategory, searchTerm])

  const getProjectIcon = (category: string) => {
    return iconMapByCategory[category.toUpperCase()] || iconMapByCategory.DEFAULT
  }

  return (
    <main className="min-h-screen overflow-hidden bg-[#050506] font-sans text-[#f7f5ff] selection:bg-[#7428ff] selection:text-[#f7f5ff]">
      <style jsx global>{`
        html { scroll-behavior: smooth; background: #050506; }
        body { margin: 0; background: #050506; }
        @keyframes rise { from { opacity: 0; transform: translateY(22px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes shimmer { 0% { background-position: 200% center; } 100% { background-position: -200% center; } }
        .hero-gradient-text { color: transparent; background: linear-gradient(90deg,#a77aff 0%,#f7f5ff 45%,#7727ff 75%,#a77aff 100%); background-size: 200% auto; background-clip: text; -webkit-background-clip: text; animation: shimmer 5s linear infinite; }
        .fade-in { animation: rise .6s cubic-bezier(.2,.8,.2,1) both; }
        @media (prefers-reduced-motion: reduce) { .fade-in { animation: none; opacity: 1; transform: none; } }
      `}</style>

      {/* Header */}
      <header className="fixed inset-x-0 top-0 z-50 mx-auto flex h-20 max-w-6xl items-center justify-between px-4 sm:h-24 sm:px-6 lg:px-8 bg-[#050506]/80 backdrop-blur-xl border-b border-[#211d27]">
        <a href="/" aria-label="DS Softwares home" className="text-xl font-black tracking-[-0.04em] sm:text-2xl">
          <span className="text-[#7727ff]">DS</span>Softwares<span className="text-[#7727ff]">.</span>
        </a>
        <nav aria-label="Primary navigation" className="hidden items-center gap-9 text-sm font-medium text-[#aaa6b5] md:flex">
          <a className="transition-colors hover:text-[#f7f5ff]" href="/">Home</a>
          <a className="transition-colors hover:text-[#f7f5ff]" href="/services">Services</a>
          <a className="transition-colors hover:text-[#f7f5ff] text-[#f7f5ff]" href="/projects">Work</a>
          <a className="transition-colors hover:text-[#f7f5ff]" href="/about">About</a>
        </nav>
        <div className="hidden items-center gap-3 md:flex">
          <a href="/contact" className="rounded-lg border border-[#6d6877] px-5 py-3 text-sm font-semibold transition-colors hover:border-[#f7f5ff]">Request a Demo</a>
          <a href="/contact" className="rounded-lg bg-[#6417ed] px-6 py-3 text-sm font-semibold transition-colors hover:bg-[#7727ff]">Get Started</a>
        </div>
        <button onClick={() => setMenuOpen(!menuOpen)} className="rounded-lg border border-[#6d6877] p-2 md:hidden" aria-expanded={menuOpen} aria-label="Toggle navigation">
          {menuOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
        {menuOpen && (
          <nav className="absolute left-4 right-4 top-16 flex flex-col gap-1 rounded-xl border border-[#3f3b49] bg-[#111013] p-3 text-sm shadow-2xl sm:left-6 sm:right-6 sm:top-20 md:hidden">
            <a href="/" onClick={() => setMenuOpen(false)}>Home</a>
            <a href="/services" onClick={() => setMenuOpen(false)}>Services</a>
            <a href="/projects" onClick={() => setMenuOpen(false)} className="font-bold text-[#9a5cff]">Work</a>
            <a href="/about" onClick={() => setMenuOpen(false)}>About</a>
            <a href="/contact" onClick={() => setMenuOpen(false)} className="font-bold text-[#9a5cff]">Start a project</a>
          </nav>
        )}
      </header>

      {/* Hero Section */}
      <section className="relative px-4 pt-32 pb-16 text-center sm:px-6 sm:pt-40 sm:pb-20">
        <div aria-hidden="true" className="absolute inset-0 overflow-hidden">
          <div className="absolute left-1/2 top-0 h-[400px] w-[800px] -translate-x-1/2 rounded-full bg-[#6417ed]/20 blur-3xl" />
        </div>
        <div className="relative z-10 mx-auto max-w-4xl">
          <p className="fade-in mb-5 text-sm font-bold uppercase tracking-[0.22em] text-[#a77aff]">Our Portfolio</p>
          <h1 className="fade-in text-balance text-4xl font-black leading-[1.08] tracking-[-0.045em] sm:text-5xl lg:text-6xl" style={{ animationDelay: '0.1s' }}>
            Real Projects. <span className="hero-gradient-text">Real Results.</span>
          </h1>
          <p className="fade-in mx-auto mt-6 max-w-2xl text-pretty text-base leading-relaxed text-[#c2becb] sm:text-lg" style={{ animationDelay: '0.2s' }}>
            Explore our latest work and see how we've helped businesses transform their digital presence.
          </p>
        </div>
      </section>

      {/* Filters Section */}
      <section className="relative px-4 pb-8 sm:px-6">
        <div className="mx-auto max-w-6xl">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            {/* Search */}
            <div className="relative w-full lg:max-w-xs">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[#716d78]" size={20} />
              <input
                type="text"
                placeholder="Search projects..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full rounded-lg border border-[#514d57] bg-[#111013] py-3 pl-12 pr-4 text-sm text-[#f7f5ff] placeholder-[#716d78] focus:border-[#7727ff] focus:outline-none focus:ring-1 focus:ring-[#7727ff]"
              />
            </div>

            {/* Category Filters */}
            <div className="flex flex-wrap gap-2">
              {categories.map((category) => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`rounded-lg px-4 py-2 text-sm font-semibold transition-all ${
                    selectedCategory === category
                      ? 'bg-[#6417ed] text-[#f7f5ff]'
                      : 'border border-[#514d57] bg-[#111013] text-[#aaa6b5] hover:border-[#7727ff] hover:text-[#f7f5ff]'
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Projects Grid */}
      <section className="relative px-4 py-12 sm:px-6">
        <div aria-hidden="true" className="absolute -right-44 inset-y-0 w-96 bg-[#3b0c85] opacity-25 blur-3xl" />
        <div className="relative mx-auto max-w-6xl">
          {loading ? (
            <div className="flex min-h-[400px] items-center justify-center">
              <div className="text-center">
                <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-4 border-[#6417ed] border-t-transparent" />
                <p className="text-[#aaa6b5]">Loading projects...</p>
              </div>
            </div>
          ) : error ? (
            <div className="flex min-h-[400px] items-center justify-center">
              <div className="text-center">
                <p className="text-red-400 mb-2">Error loading projects</p>
                <p className="text-[#aaa6b5] text-sm">{error}</p>
              </div>
            </div>
          ) : filteredProjects.length === 0 ? (
            <div className="flex min-h-[400px] items-center justify-center">
              <div className="text-center">
                <p className="text-2xl font-bold text-[#f7f5ff]">No projects found</p>
                <p className="mt-2 text-[#aaa6b5]">Try adjusting your filters or search terms</p>
              </div>
            </div>
          ) : (
            <>
              <div className="grid gap-4 text-left md:grid-cols-2 lg:grid-cols-3">
                {paginatedProjects.map((project, index) => {
                  const Icon = getProjectIcon(project.category)
                  return (
                    <a
                      aria-label={`View ${project.title} case study`}
                      href={`/projects/${project.slug}`}
                      key={project.id}
                      className="group fade-in flex flex-col rounded-2xl border border-[#514d57] bg-[#111013] p-7 transition-all hover:-translate-y-1 hover:border-[#7727ff] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#9a5cff]"
                      style={{ animationDelay: `${index * 0.05}s` }}
                    >
                      <div className="mb-8 flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          <div className="rounded-lg bg-[#6417ed]/10 p-2">
                            <Icon size={24} className="text-[#7727ff]" />
                          </div>
                          <span className="text-xs font-bold text-[#716d78]">{project.client_name}</span>
                        </div>
                        <ArrowUpRight size={22} className="text-[#716d78] transition-colors group-hover:text-[#9a5cff]" />
                      </div>
                      
                      <p className="text-xs font-bold tracking-[0.18em] text-[#7727ff]">{project.category}</p>
                      <h2 className="mt-3 text-xl font-bold leading-tight">{project.title}</h2>
                      <p className="mt-3 flex-1 text-sm leading-relaxed text-[#aaa6b5]">
                        {project.short_description || project.hero_headline}
                      </p>
                      
                      <div className="mt-6 flex items-center justify-between">
                        <span className="inline-flex items-center gap-2 text-sm font-bold text-[#d7d3de]">
                          View case study
                          <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
                        </span>
                        <span className="text-xs text-[#716d78]">
                          {new Date(project.created_at).toLocaleDateString('en-US', { 
                            month: 'short', 
                            year: 'numeric' 
                          })}
                        </span>
                      </div>
                    </a>
                  )
                })}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="mt-12 flex items-center justify-center gap-4">
                  <button
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                    className="rounded-lg border border-[#514d57] bg-[#111013] p-3 transition-colors hover:border-[#7727ff] disabled:opacity-50 disabled:cursor-not-allowed"
                    aria-label="Previous page"
                  >
                    <ArrowLeft size={20} />
                  </button>
                  
                  <div className="flex items-center gap-2">
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                      <button
                        key={page}
                        onClick={() => setCurrentPage(page)}
                        className={`rounded-lg px-4 py-2 text-sm font-semibold transition-all ${
                          currentPage === page
                            ? 'bg-[#6417ed] text-[#f7f5ff]'
                            : 'border border-[#514d57] bg-[#111013] text-[#aaa6b5] hover:border-[#7727ff] hover:text-[#f7f5ff]'
                        }`}
                      >
                        {page}
                      </button>
                    ))}
                  </div>
                  
                  <button
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                    disabled={currentPage === totalPages}
                    className="rounded-lg border border-[#514d57] bg-[#111013] p-3 transition-colors hover:border-[#7727ff] disabled:opacity-50 disabled:cursor-not-allowed"
                    aria-label="Next page"
                  >
                    <ArrowRight size={20} />
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="border-t border-[#211d27] px-6 py-20 text-center">
        <Globe2 className="mx-auto text-[#7727ff]" size={36} />
        <h2 className="mx-auto mt-6 max-w-3xl text-balance text-4xl font-black tracking-tight sm:text-5xl">
          Have a project in mind?
        </h2>
        <p className="mx-auto mt-5 max-w-xl text-[#aaa6b5]">
          Let's discuss how we can help you achieve your digital goals.
        </p>
        <a
          href="/contact"
          className="mt-9 inline-flex items-center gap-2 rounded-lg bg-[#6417ed] px-8 py-4 font-bold hover:bg-[#7727ff]"
        >
          Start a Project <ArrowUpRight size={19} />
        </a>
      </section>
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
              <div><p className="text-xs font-bold uppercase tracking-[0.18em] text-[#9a5cff]">Services</p><div className="mt-5 flex flex-col gap-3 text-sm text-[#aaa6b5]"><a className="hover:text-[#f7f5ff]" href="/services#custom-software">Custom software</a><a className="hover:text-[#f7f5ff]" href="/services#ai-automation">AI & Automation</a><a className="hover:text-[#f7f5ff]" href="/services#web-mobile-apps">Web & Mobile Apps</a><a className="hover:text-[#f7f5ff]" href="/services#branding-uiux">Branding & UI/UX</a><a className="hover:text-[#f7f5ff]" href="/services#social-media-growth">Social media</a></div></div>
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