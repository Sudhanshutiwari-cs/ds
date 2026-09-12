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
  full_description: string | null
  visit_url: string | null
  challenge: string | null
  solution: string | null
  results: string | null
  tech_stack: string[]
  is_published: boolean
  is_featured: boolean
  created_at: string
  updated_at: string
}

interface Service {
  id: string
  name: string
  description: string | null
  icon: string | null
  sort_order: number
  created_at: string
}

interface Testimonial {
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

interface Metric {
  id: string
  project_id: string
  metrics_data: {
    metrics: Array<{
      label?: string
      value?: string | number
      prefix?: string
      suffix?: string
      description?: string
    }>
  }
  display_type: 'grid' | 'list' | 'single' | 'carousel'
  sort_order: number
  created_at: string
}

interface SiteSettings {
  id: string
  setting_key: string
  setting_value: {
    rating?: string
    headline?: string
    trusted_by?: string[]
    cta_primary?: string
    description?: string
    subheadline?: string
    review_count?: string
    cta_secondary?: string
    stats?: Array<{
      label?: string
      number?: string
    }>
    [key: string]: any
  }
  description: string | null
  is_active: boolean
  updated_at: string
}

interface TestimonialDisplay {
  quote_text: string
  author_name: string
  author_title: string | null
  author_company: string | null
  rating: number | null
}

interface ProjectDisplay {
  tag: string
  title: string
  text: string
  slug: string
  icon: any
  metrics?: Array<{ label: string; value: string | number }>
}

interface StatsDisplay {
  number: string
  label: string
}

const iconMap: Record<string, any> = {
  'Code2': Code2,
  'Bot': Bot,
  'Braces': Braces,
  'Cloud': Cloud,
  'Globe2': Globe2,
  'Layers3': Layers3,
  'Palette': Palette,
  'ShieldCheck': ShieldCheck,
  'Smartphone': Smartphone,
  'Sparkles': Sparkles,
  'BarChart3': BarChart3,
}

const categoryIconMap: Record<string, any> = {
  'FINTECH': BarChart3,
  'E-COMMERCE': Layers3,
  'ARTIFICIAL INTELLIGENCE': Sparkles,
  'SAAS': Cloud,
  'HEALTHCARE': ShieldCheck,
  'EDUCATION': Globe2,
  'REAL_ESTATE': Layers3,
  'LOGISTICS': Braces,
  'BEAUTY': Palette,
  'AUTOMOTIVE': Smartphone,
  'NON_PROFIT': Globe2,
}

// Default stats as fallback
const defaultStats: StatsDisplay[] = [
  { number: '10+', label: 'Years of Tech Expertise' },
  { number: '02', label: 'Transparent Agile Process' },
  { number: '03', label: 'Dedicated Full-Stack Teams' },
  { number: '24/7', label: 'Support & Maintenance' },
]

export default function Page() {
  const [menuOpen, setMenuOpen] = useState(false)
  const [projects, setProjects] = useState<Project[]>([])
  const [services, setServices] = useState<Service[]>([])
  const [testimonials, setTestimonials] = useState<TestimonialDisplay[]>([])
  const [siteSettings, setSiteSettings] = useState<any>(null)
  const [stats, setStats] = useState<StatsDisplay[]>(defaultStats)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Fetch all data from Supabase
  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true)
        
        // Fetch all site settings
        const { data: settingsData, error: settingsError } = await supabase
          .from('site_settings')
          .select('*')
          .eq('is_active', true)

        if (settingsError) throw settingsError

        console.log('All settings data:', settingsData) // Debug log

        if (settingsData && settingsData.length > 0) {
          // Merge all settings into one object
          const mergedSettings: any = {}
          
          settingsData.forEach((setting: SiteSettings) => {
            console.log('Processing setting:', setting.setting_key, setting.setting_value) // Debug log
            
            if (setting.setting_value) {
              // If setting_value is an array (like your stats data)
              if (Array.isArray(setting.setting_value)) {
                // Check if this is the stats/trust data
                if (setting.setting_key.toLowerCase().includes('trust') || 
                    setting.setting_key.toLowerCase().includes('stats') ||
                    setting.setting_key.toLowerCase().includes('landing')) {
                  mergedSettings.stats = setting.setting_value
                } else {
                  mergedSettings[setting.setting_key] = setting.setting_value
                }
              }
              // If setting_value is an object
              else if (typeof setting.setting_value === 'object') {
                // Check if the object itself contains stats
                if (setting.setting_value.stats) {
                  mergedSettings.stats = setting.setting_value.stats
                }
                Object.assign(mergedSettings, setting.setting_value)
              }
              // If it's a primitive value
              else {
                mergedSettings[setting.setting_key] = setting.setting_value
              }
            }
          })
          
          setSiteSettings(mergedSettings)
          
          // Set stats from settings if available
          if (mergedSettings.stats && Array.isArray(mergedSettings.stats)) {
            const formattedStats = mergedSettings.stats
              .filter((stat: any) => stat && (stat.label || stat.number))
              .map((stat: any) => ({
                number: stat.number || stat.value || '',
                label: stat.label || stat.title || '',
              }))
            
            if (formattedStats.length > 0) {
              setStats(formattedStats)
              console.log('Stats loaded from DB:', formattedStats) // Debug log
            }
          }
          
          console.log('Merged settings:', mergedSettings) // Debug log
        }

        // Fetch published projects with related data
        const { data: projectsData, error: projectsError } = await supabase
          .from('projects')
          .select(`
            *,
            metrics (*),
            testimonials (*),
            media_assets (*)
          `)
          .eq('is_published', true)
          .order('is_featured', { ascending: false })
          .order('created_at', { ascending: false })
          .limit(3)

        if (projectsError) throw projectsError

        if (projectsData) {
          setProjects(projectsData)
          
          // Extract testimonials from projects
          const allTestimonials: TestimonialDisplay[] = []
          projectsData.forEach((project: any) => {
            if (project.testimonials) {
              project.testimonials.forEach((testimonial: Testimonial) => {
                allTestimonials.push({
                  quote_text: testimonial.quote_text,
                  author_name: testimonial.author_name,
                  author_title: testimonial.author_title,
                  author_company: testimonial.author_company,
                  rating: testimonial.rating,
                })
              })
            }
          })
          if (allTestimonials.length > 0) {
            setTestimonials(allTestimonials.slice(0, 3))
          }
        }

        // Fetch services
        const { data: servicesData, error: servicesError } = await supabase
          .from('services')
          .select('*')
          .order('sort_order', { ascending: true })

        if (servicesError) throw servicesError

        if (servicesData) {
          setServices(servicesData)
        }

        // Fetch featured testimonials if no project testimonials found
        if (testimonials.length === 0) {
          const { data: featuredTestimonials, error: testimonialsError } = await supabase
            .from('testimonials')
            .select('*')
            .eq('is_featured', true)
            .limit(3)

          if (testimonialsError) throw testimonialsError

          if (featuredTestimonials) {
            setTestimonials(
              featuredTestimonials.map((t: Testimonial) => ({
                quote_text: t.quote_text,
                author_name: t.author_name,
                author_title: t.author_title,
                author_company: t.author_company,
                rating: t.rating,
              }))
            )
          }
        }

      } catch (err) {
        console.error('Error fetching data:', err)
        setError(err instanceof Error ? err.message : 'Failed to fetch data')
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  // Transform projects for display with metrics
  const displayProjects: ProjectDisplay[] = projects.map((project: any) => {
    const projectMetrics = project.metrics?.flatMap((m: any) => 
      m.metrics_data?.metrics || []
    ).slice(0, 3)

    return {
      tag: project.category.replace(/_/g, ' ').toUpperCase(),
      title: project.title,
      text: project.short_description || project.hero_headline,
      slug: project.slug,
      icon: categoryIconMap[project.category] || Code2,
      metrics: projectMetrics?.map((metric: any) => ({
        label: metric.label || '',
        value: metric.value || '',
      })),
    }
  })

  if (loading) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-[#050506] text-[#f7f5ff]">
        <div className="text-center">
          <div className="text-4xl font-black mb-4">
            <span className="text-[#7727ff]">DS</span>Softwares<span className="text-[#7727ff]">.</span>
          </div>
          <p className="text-[#aaa6b5]">Loading...</p>
        </div>
      </main>
    )
  }

  if (error) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-[#050506] text-[#f7f5ff]">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Error Loading Data</h1>
          <p className="text-[#aaa6b5]">{error}</p>
        </div>
      </main>
    )
  }

  // Get values from your actual data structure
  const headline = siteSettings?.headline || 'Digital products. Real growth.'
  const subheadline = siteSettings?.subheadline || 'Innovating Tomorrow. Building Today.'
  const description = siteSettings?.description || ''
  const ctaPrimary = siteSettings?.cta_primary || 'Get a Free Consultation'
  const ctaSecondary = siteSettings?.cta_secondary || 'See Our Work'
  const rating = siteSettings?.rating || '4.9/5'
  const reviewCount = siteSettings?.review_count || '1,200+'
  const trustedBy = siteSettings?.trusted_by || []

  // Split subheadline for display if needed
  const subheadlineParts = subheadline.split('. ')
  const heroHeadline = subheadlineParts[0] || 'Innovating Tomorrow.'
  const heroSubheadline = subheadlineParts[1]?.replace('.', '') || 'Building Today.'

  return (
    <main className="min-h-screen overflow-hidden bg-[#050506] font-sans text-[#f7f5ff] selection:bg-[#7428ff] selection:text-[#f7f5ff]">
      <style jsx global>{`
        html { scroll-behavior: smooth; background: #050506; }
        body { margin: 0; background: #050506; }
        @keyframes rise { from { opacity: 0; transform: translateY(22px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes halo-breathe { 0%, 100% { transform: scale(.98); filter: blur(1px); opacity: .88; } 50% { transform: scale(1.025); filter: blur(3px); opacity: 1; } }
        @keyframes halo-drift { 0%, 100% { background-position: 50% 50%; } 50% { background-position: 58% 44%; } }
        @keyframes shimmer { 0% { background-position: 200% center; } 100% { background-position: -200% center; } }
        @keyframes hero-float { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-12px); } }
        @keyframes button-pulse { 0%, 100% { box-shadow: 0 0 20px #6417ed66; } 50% { box-shadow: 0 0 42px #8b4cffaa; } }
        @keyframes panel-float { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-7px); } }
        .hero-halo { translate: -50% 0; transform-origin: center; animation: halo-breathe 4s ease-in-out infinite, halo-drift 7s ease-in-out infinite; background-size: 130% 130%; }
        .hero-copy { animation: hero-float 5s ease-in-out 1.3s infinite; }
        .hero-primary-button { animation: button-pulse 2.5s ease-in-out infinite; }
        .hero-panel { animation: panel-float 4s ease-in-out 1.5s infinite; }
        .hero-reveal { animation: rise .9s cubic-bezier(.2,.8,.2,1) both; }
        .hero-panel.hero-reveal { animation: rise .9s cubic-bezier(.2,.8,.2,1) .55s both, panel-float 4s ease-in-out 1.5s infinite; }
        .hero-delay-1 { animation-delay: .12s; }
        .hero-delay-2 { animation-delay: .26s; }
        .hero-delay-3 { animation-delay: .4s; }
        .hero-delay-4 { animation-delay: .55s; }
        .hero-gradient-text { color: transparent; background: linear-gradient(90deg,#a77aff 0%,#f7f5ff 45%,#7727ff 75%,#a77aff 100%); background-size: 200% auto; background-clip: text; -webkit-background-clip: text; animation: shimmer 5s linear infinite; }
        @media (prefers-reduced-motion: reduce) { .hero-halo, .hero-copy, .hero-primary-button, .hero-panel, .hero-reveal, .hero-gradient-text { animation: none; } .hero-reveal { opacity: 1; transform: none; } }
      `}</style>

      <header className="absolute inset-x-0 top-0 z-50 mx-auto flex h-20 max-w-6xl items-center justify-between px-4 sm:h-24 sm:px-6 lg:px-8">
        <a href="#home" aria-label="DS Softwares home" className="text-xl font-black tracking-[-0.04em] sm:text-2xl">
          <span className="text-[#7727ff]">DS</span>Softwares<span className="text-[#7727ff]">.</span>
        </a>
        <nav aria-label="Primary navigation" className="hidden items-center gap-9 text-sm font-medium text-[#aaa6b5] md:flex">
          <a className="transition-colors hover:text-[#f7f5ff]" href="#home">Home</a>
          <a className="transition-colors hover:text-[#f7f5ff]" href="/services">Services</a>
          <a className="transition-colors hover:text-[#f7f5ff]" href="#work">Work</a>
          {testimonials.length > 0 && (
            <a className="transition-colors hover:text-[#f7f5ff]" href="#testimonials">Testimonials</a>
          )}
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
            <a href="/services" onClick={() => setMenuOpen(false)}>Services</a>
            <a href="#work" onClick={() => setMenuOpen(false)}>Work</a>
            {testimonials.length > 0 && (
              <a href="#testimonials" onClick={() => setMenuOpen(false)}>Testimonials</a>
            )}
            <a href="/about" onClick={() => setMenuOpen(false)}>About</a>
            <a href="/contact" onClick={() => setMenuOpen(false)} className="font-bold text-[#9a5cff]">Start a project</a>
          </nav>
        )}
      </header>

      <section id="home" className="relative flex min-h-[950px] sm:min-h-[900px] lg:min-h-[860px] flex-col items-center px-4 pt-36 text-center min-[380px]:pt-40 sm:px-6 sm:pt-48 lg:pt-52">
        <div aria-hidden="true" className="hero-halo pointer-events-none absolute left-1/2 top-28 h-[500px] w-[760px] rounded-[50%] border-[16px] border-[#efe9ff] bg-[radial-gradient(ellipse_at_center,#6d1fff_0%,#251047_46%,#09080b_70%)] shadow-[0_0_65px_20px_#7727ff,0_0_26px_8px_#f1e9ff] sm:top-32 sm:h-[570px] sm:w-[1000px] sm:border-[20px] lg:top-36 lg:h-[610px] lg:w-[1180px] lg:border-[24px]" />
        <div className="hero-copy relative z-10 max-w-4xl">
          <p className="hero-reveal mb-5 text-sm font-bold uppercase tracking-[0.22em] text-[#a77aff]">{headline}</p>
          <h1 className="hero-reveal hero-delay-1 text-balance text-4xl font-black leading-[1.08] tracking-[-0.045em] min-[380px]:text-5xl sm:text-6xl lg:text-7xl">
            {heroHeadline}.<br />Building <span className="hero-gradient-text">{heroSubheadline}.</span>
          </h1>
          <p className="hero-reveal hero-delay-2 mx-auto mt-7 max-w-2xl text-pretty text-base leading-relaxed text-[#c2becb] sm:text-lg">
            {description}
          </p>
          <div className="hero-reveal hero-delay-3 mt-9 flex flex-col justify-center gap-3 sm:flex-row">
            <a href="/contact" className="hero-primary-button rounded-lg bg-[#6417ed] px-7 py-4 text-sm font-bold transition-transform hover:-translate-y-0.5">{ctaPrimary}</a>
            <a href="#work" className="rounded-lg border border-[#817b89] bg-[#111013]/70 px-7 py-4 text-sm font-bold transition-colors hover:border-[#f7f5ff]">{ctaSecondary}</a>
          </div>
        </div>
        <div className="hero-panel hero-reveal hero-delay-4 absolute bottom-2 sm:bottom-6 lg:bottom-8 z-20 grid w-[calc(100%-2rem)] max-w-5xl grid-cols-2 items-center gap-4 rounded-2xl border border-[#716d78] bg-[#111013]/95 px-4 py-5 text-left shadow-2xl sm:grid-cols-4 sm:gap-6 sm:px-7 sm:py-6 lg:grid-cols-5">
          <div className="col-span-2 flex items-center gap-5 border-[#5b5662] lg:col-span-1 lg:border-r">
            <div>
              <div className="flex text-[#f6ce46]">{[1,2,3,4,5].map(n => <Star key={n} size={11} fill="currentColor" />)}</div>
              <p className="mt-1 text-xs text-[#aaa6b5]">Rated {rating} by</p>
              <strong className="text-3xl">{reviewCount}</strong>
            </div>
          </div>
          {trustedBy.map((name: string) => (
            <div key={name} className="flex items-center gap-2 text-lg font-bold text-[#d7d3de]">{name}</div>
          ))}
        </div>
      </section>

      {/* Services Section */}
      <section id="services" className="relative px-4 py-20 sm:px-6 sm:py-24 lg:py-28">
        <div aria-hidden="true" className="absolute -left-52 top-0 h-full w-96 bg-[#3b0c85] opacity-30 blur-3xl" />
        <div className="relative mx-auto max-w-7xl">
          <div className="text-center px-4 sm:px-6">
            <h2 className="text-balance text-3xl font-extrabold tracking-tight sm:text-4xl lg:text-5xl">Everything your brand needs. <span className="text-[#7727ff]">One team.</span></h2>
            <p className="mx-auto mt-4 max-w-2xl text-sm sm:text-base text-[#aaa6b5]">From the first idea to launch and ongoing growth, we handle your complete digital journey.</p>
          </div>
          <div className="mt-14 grid gap-4 sm:gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
            {services.map((service, index) => {
              const ServiceIcon = service.icon && iconMap[service.icon] ? iconMap[service.icon] : Code2
              return (
                <article key={service.id} className={`group flex min-h-52 flex-col justify-between rounded-2xl border p-6 sm:p-7 transition-transform hover:-translate-y-1 ${index === 1 ? 'border-[#8b4cff] bg-[linear-gradient(135deg,#4c0bc7,#7a18f5)] shadow-[0_18px_60px_#6417ed35]' : 'border-[#514d57] bg-[#111013]'}`}>
                  <div className="flex items-start justify-between">
                    <ServiceIcon size={32} strokeWidth={1.8} className={index === 1 ? 'text-[#f7f5ff]' : 'text-[#7727ff]'} />
                  </div>
                  <div>
                    <h3 className="max-w-full sm:max-w-52 text-lg font-bold leading-tight">{service.name}</h3>
                    <p className={`mt-3 text-sm leading-relaxed ${index === 1 ? 'text-[#e7dcff]' : 'text-[#aaa6b5]'}`}>
                      {service.description || `${service.name} services tailored to your needs.`}
                    </p>
                  </div>
                </article>
              )
            })}
          </div>
          <div className="mt-12 text-center">
            <a
              href="/services"
              className="inline-flex items-center gap-2 rounded-lg bg-[#6417ed] px-6 sm:px-8 py-3 sm:py-4 text-sm font-bold transition-colors hover:bg-[#7727ff]"
            >
              Explore All Services & Capabilities <ArrowUpRight size={17} />
            </a>
          </div>
        </div>
      </section>

      {/* About Section - Dynamic Stats from Database */}
      <section id="about" className="bg-[linear-gradient(110deg,#1f075c,#40109a)] px-4 py-20 sm:px-6 sm:py-24">
        <div className="mx-auto max-w-7xl text-center">
          <h2 className="text-3xl font-extrabold tracking-tight sm:text-4xl lg:text-5xl">Built on Trust. Driven by Results.</h2>
          <p className="mx-auto mt-4 max-w-xl text-sm sm:text-base text-[#c9bee1]">We don&apos;t just deliver work — we build long-term partnerships grounded in speed, clarity, and outcomes.</p>
          <div className="mt-12 grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
            {stats.map((stat, index) => (
              <article key={index} className="min-h-48 rounded-2xl border border-[#8970bd] bg-[#2d0c75]/45 p-5 sm:p-6 text-left">
                <div className="flex items-start justify-between">
                  <span className="text-3xl sm:text-4xl lg:text-5xl font-extrabold">{stat.number}</span>
                </div>
                <h3 className="mt-6 sm:mt-8 text-base sm:text-lg lg:text-xl font-bold leading-snug">{stat.label}</h3>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Work Section */}
      <section id="work" className="relative px-4 py-20 sm:px-6 sm:py-24 lg:py-28">
        <div aria-hidden="true" className="absolute -right-44 inset-y-0 w-96 bg-[#3b0c85] opacity-25 blur-3xl" />
        <div className="relative mx-auto max-w-7xl text-center">
          <h2 className="text-3xl font-extrabold tracking-tight sm:text-4xl lg:text-5xl">Real Impact. <span className="text-[#7727ff]">Proven Results.</span></h2>
          <p className="mx-auto mt-4 max-w-xl text-sm sm:text-base text-[#aaa6b5]">Explore how we&apos;ve helped startups and established businesses launch, scale, and stand out.</p>
          <div className="mt-14 grid gap-4 sm:gap-6 text-left grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
            {displayProjects.map(({ tag, title, text, slug, icon: Icon, metrics }) => (
              <a 
                aria-label={`View ${title} case study`} 
                href={`/projects/${slug}`} 
                key={slug} 
                className="group rounded-2xl border border-[#514d57] bg-[#111013] p-5 sm:p-7 transition-all hover:-translate-y-1 hover:border-[#7727ff] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#9a5cff]"
              >
                <div className="mb-8 sm:mb-10 flex items-start justify-between">
                  <Icon size={24} className="text-[#7727ff]" />
                  <ArrowUpRight size={20} className="text-[#716d78] transition-colors group-hover:text-[#9a5cff]" />
                </div>
                <p className="text-xs font-bold tracking-[0.18em] text-[#7727ff]">{tag}</p>
                <h3 className="mt-4 sm:mt-5 text-lg sm:text-xl font-bold">{title}</h3>
                <p className="mt-3 text-sm leading-relaxed text-[#aaa6b5]">{text}</p>
                
                {metrics && metrics.length > 0 && (
                  <div className="mt-4 flex flex-wrap gap-2">
                    {metrics.map((metric, index) => (
                      <span key={index} className="inline-flex items-center gap-1 rounded-full bg-[#6417ed20] px-3 py-1 text-xs font-semibold text-[#a77aff]">
                        <strong>{metric.value}</strong> {metric.label}
                      </span>
                    ))}
                  </div>
                )}
                
                <span className="mt-6 inline-flex items-center gap-2 text-sm font-bold text-[#d7d3de]">
                  View case study 
                  <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
                </span>
              </a>
            ))}
          </div>
          <a href="/projects" className="mt-12 inline-flex items-center gap-2 rounded-lg bg-[#6417ed] px-6 sm:px-8 py-3 sm:py-4 text-sm font-bold transition-colors hover:bg-[#7727ff]">
            Explore Case Studies <ArrowUpRight size={17} />
          </a>
        </div>
      </section>

      {/* Testimonials Section */}
      {testimonials.length > 0 && (
        <section id="testimonials" className="px-4 py-20 sm:px-6 sm:py-24 bg-[#111013]">
          <div className="mx-auto max-w-7xl text-center">
            <h2 className="text-3xl font-extrabold tracking-tight sm:text-4xl lg:text-5xl">What Our <span className="text-[#7727ff]">Clients Say</span></h2>
            <div className="mt-12 grid gap-4 sm:gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
              {testimonials.map((testimonial, index) => (
                <article key={index} className="rounded-2xl border border-[#514d57] bg-[#1a191d] p-5 sm:p-7 text-left">
                  {testimonial.rating && (
                    <div className="mb-4 flex text-[#f6ce46]">
                      {[1,2,3,4,5].map(n => (
                        <Star key={n} size={16} fill={n <= testimonial.rating! ? "currentColor" : "none"} />
                      ))}
                    </div>
                  )}
                  <p className="text-sm leading-relaxed text-[#c2becb]">"{testimonial.quote_text}"</p>
                  <div className="mt-6">
                    <p className="font-bold">{testimonial.author_name}</p>
                    {(testimonial.author_title || testimonial.author_company) && (
                      <p className="text-sm text-[#aaa6b5]">
                        {testimonial.author_title}
                        {testimonial.author_title && testimonial.author_company && ' · '}
                        {testimonial.author_company}
                      </p>
                    )}
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Contact Section */}
      <section id="contact" className="px-4 py-20 sm:px-6 sm:py-24 lg:py-28 text-center">
        <Globe2 className="mx-auto text-[#7727ff]" size={32} />
        <h2 className="mx-auto mt-6 max-w-3xl text-balance text-3xl font-black tracking-tight sm:text-4xl lg:text-5xl">
          Have an idea? Let&apos;s make it impossible to ignore.
        </h2>
        <p className="mx-auto mt-5 max-w-xl text-sm sm:text-base text-[#aaa6b5]">
          Tell us what you&apos;re building. We&apos;ll bring the strategy, design, development, and growth expertise.
        </p>
        <a href="/contact" className="mt-9 inline-flex items-center gap-2 rounded-lg bg-[#6417ed] px-6 sm:px-8 py-3 sm:py-4 font-bold hover:bg-[#7727ff]">
          Start a Project
        </a>
      </section>

      {/* Footer */}
      <footer className="border-t border-[#211d27] bg-[#09080b] px-4 py-12 sm:px-6 sm:py-16">
        <div className="mx-auto max-w-7xl">
          <div className="flex flex-col justify-between gap-8 border-b border-[#211d27] pb-10 sm:gap-10 sm:pb-12 lg:flex-row lg:items-end">
            <div className="max-w-xl">
              <a href="/" aria-label="DS Softwares home" className="text-2xl font-black tracking-[-0.04em]">
                <span className="text-[#7727ff]">DS</span>Softwares<span className="text-[#7727ff]">.</span>
              </a>
              <h2 className="mt-5 text-balance text-2xl font-black tracking-tight min-[380px]:text-3xl sm:mt-6 sm:text-4xl">
                Digital work that earns attention and drives growth.
              </h2>
              <p className="mt-4 max-w-lg text-sm leading-relaxed text-[#aaa6b5]">
                {description}
              </p>
            </div>
            <a href="/contact" className="inline-flex w-full items-center justify-center rounded-lg bg-[#6417ed] px-7 py-4 text-sm font-bold transition-colors hover:bg-[#7727ff] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#9a5cff] sm:w-fit">
              Start a project →
            </a>
          </div>
          <div className="grid gap-8 sm:gap-10 py-12 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#9a5cff]">Services</p>
              <div className="mt-5 flex flex-col gap-3 text-sm text-[#aaa6b5]">
                <a className="hover:text-[#f7f5ff]" href="/services#custom-software">Custom software</a>
                <a className="hover:text-[#f7f5ff]" href="/services#ai-automation">AI & Automation</a>
                <a className="hover:text-[#f7f5ff]" href="/services#cloud-devops">Cloud & DevOps</a>
                <a className="hover:text-[#f7f5ff]" href="/services#branding-uiux">Branding & UI/UX</a>
                <a className="hover:text-[#f7f5ff]" href="/services#web-mobile-apps">Web & Mobile Apps</a>
                <a className="hover:text-[#f7f5ff]" href="/services#social-media-growth">Social media</a>
              </div>
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#9a5cff]">Company</p>
              <div className="mt-5 flex flex-col gap-3 text-sm text-[#aaa6b5]">
                <a className="hover:text-[#f7f5ff]" href="/about">About us</a>
                <a className="hover:text-[#f7f5ff]" href="/#work">Our work</a>
                <a className="hover:text-[#f7f5ff]" href="/contact">Contact us</a>
              </div>
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#9a5cff]">Legal</p>
              <div className="mt-5 flex flex-col gap-3 text-sm text-[#aaa6b5]">
                <a className="hover:text-[#f7f5ff]" href="/privacy-policy">Privacy policy</a>
                <a className="hover:text-[#f7f5ff]" href="/terms-and-conditions">Terms & conditions</a>
              </div>
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#9a5cff]">Get in touch</p>
              <div className="mt-5 flex flex-col gap-3 text-sm text-[#aaa6b5]">
                <a className="break-all hover:text-[#f7f5ff]" href="mailto:hello@dssoftwares.in">hello@dssoftwares.in</a>
                <a className="hover:text-[#f7f5ff]" href="tel:+919956688553">+91 99566 88553</a>
                <p>Available worldwide</p>
                <p>Mon–Fri · 9:00–18:00</p>
              </div>
            </div>
          </div>
          <div className="flex flex-col justify-between gap-3 border-t border-[#211d27] pt-7 text-xs text-[#77727f] sm:flex-row">
            <p>© 2026 DS Softwares. All rights reserved.</p>
            <p>Websites · Software · Social Media · Branding</p>
          </div>
        </div>
      </footer>
    </main>
  )
}