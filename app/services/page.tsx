'use client'

import {
  ArrowLeft,
  ArrowRight,
  ArrowUpRight,
  Bot,
  Brain,
  CheckCircle2,
  ChevronDown,
  Cloud,
  Code2,
  Cpu,
  Database,
  Gauge,
  Globe2,
  Headphones,
  HelpCircle,
  Laptop,
  Layers3,
  Menu,
  Palette,
  Rocket,
  ShieldCheck,
  Smartphone,
  Sparkles,
  TrendingUp,
  Users,
  Wrench,
  X,
  Zap,
} from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://jyoznzzwpohxoleqjwtu.supabase.co',
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
)

interface ServiceItem {
  id: string
  name: string
  subtitle: string
  category: 'Software' | 'AI & ML' | 'Cloud' | 'Design' | 'Web & Mobile' | 'Growth'
  description: string
  icon: any
  capabilities: string[]
  technologies: string[]
  deliverables: string[]
  bestFor: string
  timeline: string
  startingAt: string
  contactParam: string
}

const detailedServices: ServiceItem[] = [
  {
    id: 'custom-software',
    name: 'Custom Software Development',
    subtitle: 'Bespoke engineering for high-load systems & complex business workflows',
    category: 'Software',
    description:
      'We engineer rock-solid, scalable backends, internal tools, and enterprise platforms custom-tailored to solve your specific operational bottlenecks.',
    icon: Code2,
    capabilities: [
      'End-to-end backend & distributed systems architecture',
      'High-throughput RESTful, GraphQL & gRPC APIs',
      'Relational & NoSQL database modeling and migrations',
      'Microservices orchestration & message queues (Kafka, RabbitMQ)',
      'Enterprise security, Role-Based Access Control (RBAC) & OAuth2',
      'Legacy system modernization & zero-downtime database cutovers',
    ],
    technologies: ['Node.js', 'Go', 'Python', 'TypeScript', 'PostgreSQL', 'Redis', 'Docker'],
    deliverables: [
      'Production-ready, thoroughly tested codebase',
      'Interactive API documentation (Swagger/OpenAPI)',
      'Database entity-relationship diagrams & migration scripts',
      'Containerized deployment configs (Docker / Compose)',
    ],
    bestFor: 'Growing companies outgrowing off-the-shelf software or replacing manual spreadsheets with unified automated software.',
    timeline: '4 – 12 weeks',
    startingAt: '₹75,000',
    contactParam: 'Custom software',
  },
  {
    id: 'ai-automation',
    name: 'AI & Automation Solutions',
    subtitle: 'Autonomous agents, custom LLMs & frictionless workflow automation',
    category: 'AI & ML',
    description:
      'Turn cutting-edge generative AI and predictive intelligence into real business leverage that slashes manual tasks and creates magical customer interactions.',
    icon: Sparkles,
    capabilities: [
      'Custom LLM application development with RAG (Retrieval-Augmented Generation)',
      'Autonomous AI agent workflows for customer support & sales pipeline',
      'Automated document extraction, OCR, & contract intelligence',
      'Predictive machine learning models & business analytics pipelines',
      'Seamless integration with OpenAI, Anthropic, Gemini, & open-source models',
      'Enterprise data privacy guardrails & local model inference setup',
    ],
    technologies: ['Python', 'Gemini API', 'OpenAI', 'LangChain', 'Supabase Vector', 'FastAPI', 'n8n'],
    deliverables: [
      'Fully integrated AI workflows & agents',
      'Vector search indexing pipelines for private company knowledge',
      'Real-time token usage & latency monitoring dashboard',
      'Custom admin moderation & evaluation dashboard',
    ],
    bestFor: 'Organizations looking to automate 40%+ of repetitive manual operations and build intelligent AI-first digital tools.',
    timeline: '3 – 8 weeks',
    startingAt: '₹60,000',
    contactParam: 'Custom software',
  },
  {
    id: 'cloud-devops',
    name: 'Cloud Solutions & DevOps',
    subtitle: 'Future-proof cloud infrastructure, automated CI/CD & 99.99% uptime',
    category: 'Cloud',
    description:
      'We design, optimize, and manage resilient cloud environments that scale effortlessly on demand while lowering cloud infrastructure expenditures.',
    icon: Cloud,
    capabilities: [
      'Multi-cloud architecture design (AWS, Google Cloud, Azure)',
      'Infrastructure as Code (Terraform, CloudFormation, Ansible)',
      'Automated CI/CD pipelines for zero-downtime deployments',
      'Container orchestration using Docker, Kubernetes (EKS/GKE), & ECS',
      'Global CDN configuration, Edge caching, & DDoS shielding (Cloudflare)',
      'Cloud cost optimization, automated backup & disaster recovery protocols',
    ],
    technologies: ['AWS', 'Google Cloud', 'Docker', 'Kubernetes', 'Terraform', 'GitHub Actions', 'Cloudflare'],
    deliverables: [
      'Version-controlled Infrastructure as Code (IaC) repository',
      'Automated CI/CD pipeline triggers with automated smoke tests',
      'Production monitoring & real-time alerting setup (Grafana/Datadog)',
      'Comprehensive security & vulnerability audit report',
    ],
    bestFor: 'Businesses transitioning from monolithic hosting to scalable cloud clusters, or seeking major cloud bill optimization.',
    timeline: '2 – 6 weeks',
    startingAt: '₹40,000',
    contactParam: 'Custom software',
  },
  {
    id: 'branding-uiux',
    name: 'Branding & UI/UX Design',
    subtitle: 'Human-centered digital experiences and visual identities that convert',
    category: 'Design',
    description:
      'We turn complex digital interactions into clean, intuitive, and memorable user experiences that elevate your brand and maximize retention.',
    icon: Palette,
    capabilities: [
      'Deep user research, competitor auditing & customer journey mapping',
      'Information architecture, wireframes, & clickable interactive prototypes',
      'Scalable design systems with tokens, reusable components, & style guides',
      'Complete brand identity suites: logos, typography, palettes, & guidelines',
      'Usability testing, conversion rate optimization (CRO), & accessibility audits',
      'High-fidelity motion design, micro-interactions, & illustration styling',
    ],
    technologies: ['Figma', 'Framer', 'Adobe CC', 'Design Tokens', 'Storybook', 'WCAG 2.1 AA'],
    deliverables: [
      'Production-ready Figma files with auto-layout and variant libraries',
      'Brand style guide & asset package (SVG, typography, vector assets)',
      'Interactive click-through prototype for user testing and stakeholder review',
      'Complete developer handoff specifications with CSS guidelines',
    ],
    bestFor: 'Founders building a new digital brand or existing companies requiring a redesign to drastically boost conversions.',
    timeline: '2 – 6 weeks',
    startingAt: '₹35,000',
    contactParam: 'Branding & UI/UX',
  },
  {
    id: 'web-mobile-apps',
    name: 'Web & Mobile Applications',
    subtitle: 'Lightning-fast web platforms & native-feel cross-platform mobile apps',
    category: 'Web & Mobile',
    description:
      'From responsive SaaS applications to cross-platform mobile apps on iOS and Android, we build blazing-fast interfaces with flawless performance.',
    icon: Smartphone,
    capabilities: [
      'Full-stack Next.js and React applications with server components',
      'Cross-platform iOS and Android apps with React Native & Expo',
      'Progressive Web Apps (PWA) with offline caching and background sync',
      'Custom headless e-commerce storefronts & subscription billing (Stripe)',
      'Sub-second load times, 95+ Core Web Vitals, and programmatic SEO',
      'Real-time features via WebSockets, server-sent events & push notifications',
    ],
    technologies: ['Next.js', 'React', 'React Native', 'Expo', 'Tailwind CSS', 'TypeScript', 'Supabase'],
    deliverables: [
      'Fully responsive, SEO-ready web application or compiled mobile binaries',
      'Stripe / payment gateway integration with automated invoice webhooks',
      'App Store & Google Play Store submission assistance',
      'Analytics & event tracking integration (Google Analytics, PostHog)',
    ],
    bestFor: 'Startups launching an MVP or enterprises requiring high-performance web and mobile products.',
    timeline: '3 – 10 weeks',
    startingAt: '₹50,000',
    contactParam: 'Website',
  },
  {
    id: 'social-media-growth',
    name: 'Social Media & Digital Growth',
    subtitle: 'High-converting content engines, paid advertising & organic reach',
    category: 'Growth',
    description:
      'We craft strategic content, run profitable paid customer acquisition campaigns, and build loyal online communities that translate directly into revenue.',
    icon: TrendingUp,
    capabilities: [
      'Full-funnel organic social media management and content calendars',
      'High-impact short-form video creation (Reels, Shorts, TikTok)',
      'High-ROAS paid ad campaign management across Meta, Google, & LinkedIn',
      'Audience segmentation, re-targeting funnels, & landing page conversion audits',
      'Influencer outreach partnerships & community growth hacking',
      'Transparent weekly reporting with ROAS, CAC, and lead volume dashboards',
    ],
    technologies: ['Meta Ads Manager', 'Google Ads', 'TikTok Ads', 'PostHog', 'Premiere Pro', 'After Effects'],
    deliverables: [
      'Monthly social content production calendar & ready-to-post creatives',
      'Ad campaign blueprints, targeted copy variations, & A/B test logs',
      'Real-time performance analytics dashboard & attribution reporting',
      'Bi-weekly strategic review calls with growth engineers',
    ],
    bestFor: 'Brands that want to scale customer acquisition, lower acquisition costs, and build an authentic, dominant market voice.',
    timeline: 'Monthly Retainer',
    startingAt: '₹25,000',
    contactParam: 'Social media',
  },
]

const categories = ['All', 'Software', 'AI & ML', 'Cloud', 'Design', 'Web & Mobile', 'Growth'] as const

const engagementModels = [
  {
    title: 'Dedicated Squad',
    badge: 'Most Popular for Scale',
    price: '₹1,50,000',
    period: '/ month',
    description: 'An autonomous, cross-functional team of senior engineers, product designers, and a technical lead dedicated solely to your product roadmap.',
    features: [
      'Full-time senior engineers & product designer',
      'Direct Slack/Teams channel with daily standups',
      'Flexible sprint priorities that adapt as you learn',
      'No long-term lock-in: month-to-month flexibility',
    ],
    highlight: true,
  },
  {
    title: 'Fixed-Price Project',
    badge: 'Best for Defined Scope',
    price: '₹45,000',
    period: '/ project starting',
    description: 'Ideal for MVPs, specific redesigns, or targeted software modules with clear requirements, fixed delivery timeline, and defined budget.',
    features: [
      'Detailed scope, milestones, and deliverables',
      'Fixed cost in INR with zero surprise overages',
      'Strict delivery deadline with phased sign-offs',
      '30-day post-launch warranty & bug-fix coverage',
    ],
    highlight: false,
  },
  {
    title: 'Growth & Maintenance Retainer',
    badge: 'Continuous Peace of Mind',
    price: '₹25,000',
    period: '/ month starting',
    description: 'Ongoing technical upkeep, security updates, feature enhancements, and growth support to keep your software performing at its peak.',
    features: [
      'Guaranteed monthly engineering & design hours',
      '24/7 uptime monitoring & priority incident response',
      'Regular security patches & dependency updates',
      'Continuous conversion rate optimization',
    ],
    highlight: false,
  },
]

const deliveryProcess = [
  {
    step: '01',
    title: 'Discovery & Strategy',
    text: 'We dive deep into your business objectives, target audience, and system requirements to formulate a lean, high-velocity roadmap with zero fluff.',
  },
  {
    step: '02',
    title: 'Architecture & Design',
    text: 'We build detailed technical blueprints, database schemas, and interactive Figma prototypes, validating usability before writing a single line of code.',
  },
  {
    step: '03',
    title: 'Agile Sprints & QA',
    text: 'We develop in focused 2-week sprints with continuous deployment to staging, comprehensive automated testing, and transparent progress updates.',
  },
  {
    step: '04',
    title: 'Launch & Scaled Growth',
    text: 'We orchestrate smooth production deployments, conduct load testing, and provide ongoing telemetry, optimization, and post-launch feature iteration.',
  },
]

const faqs = [
  {
    question: 'Are all project quotes and billing denominated in Indian Rupees (₹)?',
    answer:
      'Yes, all our project estimates, milestone invoices, and retainer billing are quoted in Indian Rupees (INR - ₹) with transparent scope breakdowns and GST compliance. For international clients, payments can be made via wire transfer or international cards with dynamic conversion to INR.',
  },
  {
    question: 'How quickly can we kick off a new project?',
    answer:
      'We can typically start within 3 to 7 business days following our initial discovery call and scope alignment. We maintain dedicated agile squads ready to mobilize quickly without extensive onboarding delays.',
  },
  {
    question: 'Who owns the source code and intellectual property?',
    answer:
      'You do. 100% of the intellectual property, source code, designs, documentation, and credentials belong entirely to you upon payment. We sign comprehensive NDAs and IP assignment agreements before work begins.',
  },
  {
    question: 'How do we communicate and track sprint progress?',
    answer:
      'We believe in radical transparency. You get direct access to your dedicated team via private Slack or Discord channels, regular video check-ins, live staging environments to test real code, and a shared board (Linear / Jira) for complete visibility.',
  },
  {
    question: 'Can you work with our existing codebase or internal team?',
    answer:
      'Yes! We frequently augment existing in-house teams or take over legacy codebases. We perform a rapid architectural and code quality audit during week one to safely integrate into your existing Git workflows and deployment pipelines.',
  },
  {
    question: 'What happens after the project launches?',
    answer:
      'We provide complimentary 30-day post-launch support with every project to ensure smooth real-world operation. Beyond that, most of our clients choose our ongoing Growth & Maintenance retainers for continuous feature shipping and 24/7 infrastructure monitoring.',
  },
]

export default function ServicesPage() {
  const [menuOpen, setMenuOpen] = useState(false)
  const [activeCategory, setActiveCategory] = useState<string>('All')
  const [openFaq, setOpenFaq] = useState<number | null>(0)
  const [dbServices, setDbServices] = useState<any[]>([])

  useEffect(() => {
    async function loadDbServices() {
      try {
        const { data } = await supabase.from('services').select('*').order('sort_order', { ascending: true })
        if (data && data.length > 0) {
          setDbServices(data)
        }
      } catch (e) {
        console.error('Error fetching services from DB:', e)
      }
    }
    loadDbServices()
  }, [])

  // Filter services by category
  const filteredServices = useMemo(() => {
    if (activeCategory === 'All') return detailedServices
    return detailedServices.filter((s) => s.category === activeCategory)
  }, [activeCategory])

  return (
    <main className="min-h-screen overflow-hidden bg-[#050506] font-sans text-[#f7f5ff] selection:bg-[#7727ff] selection:text-[#f7f5ff]">
      {/* Header */}
      <header className="mx-auto flex h-20 max-w-6xl items-center justify-between px-4 sm:h-24 sm:px-6 lg:px-8">
        <a href="/" aria-label="DS Softwares home" className="text-xl font-black tracking-[-0.04em] sm:text-2xl">
          <span className="text-[#7727ff]">DS</span>Softwares<span className="text-[#7727ff]">.</span>
        </a>

        <nav aria-label="Primary navigation" className="hidden items-center gap-8 text-sm font-medium text-[#aaa6b5] md:flex">
          <a className="transition-colors hover:text-[#f7f5ff]" href="/">
            Home
          </a>
          <a className="font-semibold text-[#a77aff] transition-colors" href="/services">
            Services
          </a>
          <a className="transition-colors hover:text-[#f7f5ff]" href="/projects">
            Work
          </a>
          <a className="transition-colors hover:text-[#f7f5ff]" href="/about">
            About
          </a>
          <a className="transition-colors hover:text-[#f7f5ff]" href="/contact">
            Contact
          </a>
        </nav>

        <div className="hidden items-center gap-3 md:flex">
          <a
            href="/contact"
            className="rounded-lg bg-[#6417ed] px-5 py-2.5 text-sm font-bold transition-all hover:bg-[#7727ff] hover:shadow-[0_0_25px_#7727ff66]"
          >
            Start a Project
          </a>
        </div>

        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="rounded-lg border border-[#6d6877] p-2 text-[#aaa6b5] hover:text-[#f7f5ff] md:hidden"
          aria-expanded={menuOpen}
          aria-label="Toggle navigation"
        >
          {menuOpen ? <X size={20} /> : <Menu size={20} />}
        </button>

        {menuOpen && (
          <nav className="absolute left-4 right-4 top-20 z-50 flex flex-col gap-2 rounded-xl border border-[#3f3b49] bg-[#111013] p-4 text-sm shadow-2xl md:hidden">
            <a href="/" onClick={() => setMenuOpen(false)} className="py-2 hover:text-[#7727ff]">
              Home
            </a>
            <a href="/services" onClick={() => setMenuOpen(false)} className="py-2 font-bold text-[#a77aff]">
              Services
            </a>
            <a href="/projects" onClick={() => setMenuOpen(false)} className="py-2 hover:text-[#7727ff]">
              Work
            </a>
            <a href="/about" onClick={() => setMenuOpen(false)} className="py-2 hover:text-[#7727ff]">
              About
            </a>
            <a
              href="/contact"
              onClick={() => setMenuOpen(false)}
              className="mt-2 rounded-lg bg-[#6417ed] py-2.5 text-center font-bold text-white hover:bg-[#7727ff]"
            >
              Start a Project
            </a>
          </nav>
        )}
      </header>

      {/* Hero Section */}
      <section className="relative px-4 pb-14 pt-10 sm:px-6 sm:pb-20 sm:pt-14 lg:pb-24 lg:pt-18">
        {/* Glow halo */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute left-1/2 top-0 h-[420px] w-4/5 -translate-x-1/2 bg-[radial-gradient(ellipse_at_center,#7727ff45,transparent_70%)] blur-3xl"
        />

        <div className="relative mx-auto max-w-4xl text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-[#7727ff55] bg-[#7727ff15] px-4 py-1.5 text-xs font-bold uppercase tracking-[0.2em] text-[#b58cff]">
            <Sparkles size={13} className="text-[#a77aff]" /> Full-Spectrum Digital Services
          </div>

          <h1 className="mt-6 text-balance text-4xl font-black leading-[1.1] tracking-[-0.045em] min-[400px]:text-5xl sm:text-6xl lg:text-7xl">
            Everything your business needs to <span className="bg-gradient-to-r from-[#a77aff] via-[#f7f5ff] to-[#7727ff] bg-clip-text text-transparent">build, launch & scale.</span>
          </h1>

          <p className="mx-auto mt-6 max-w-2xl text-pretty text-base leading-relaxed text-[#c2becb] sm:text-lg">
            From bespoke software engineering and generative AI to cloud architecture, high-converting design, and organic growth engines—all delivered by one accountable senior team.
          </p>

          {/* Quick jump anchor / stats summary */}
          <div className="mt-10 flex flex-wrap items-center justify-center gap-6 text-xs text-[#aaa6b5] sm:gap-10 sm:text-sm">
            <span className="inline-flex items-center gap-2">
              <CheckCircle2 size={16} className="text-[#7727ff]" /> Senior Full-Stack Engineers
            </span>
            <span className="inline-flex items-center gap-2">
              <CheckCircle2 size={16} className="text-[#7727ff]" /> 100% IP & Code Ownership
            </span>
            <span className="inline-flex items-center gap-2">
              <CheckCircle2 size={16} className="text-[#7727ff]" /> Agile 2-Week Sprints
            </span>
          </div>
        </div>
      </section>

      {/* Category Filter Pills */}
      <section className="sticky top-2 z-40 px-4 py-2 backdrop-blur-md">
        <div className="mx-auto flex max-w-5xl items-center justify-center gap-2 overflow-x-auto rounded-2xl border border-[#2b2735] bg-[#111013]/90 p-2 shadow-xl [scrollbar-width:none]">
          {categories.map((category) => {
            const isActive = activeCategory === category
            return (
              <button
                key={category}
                onClick={() => setActiveCategory(category)}
                className={`whitespace-nowrap rounded-xl px-4 py-2 text-xs font-bold transition-all sm:text-sm ${
                  isActive
                    ? 'bg-[#6417ed] text-white shadow-[0_0_18px_#6417ed88]'
                    : 'text-[#aaa6b5] hover:bg-[#1f1d24] hover:text-[#f7f5ff]'
                }`}
              >
                {category}
              </button>
            )
          })}
        </div>
      </section>

      {/* Detailed Services Grid */}
      <section className="px-4 py-12 sm:px-6 sm:py-16">
        <div className="mx-auto max-w-6xl space-y-10">
          {filteredServices.map((service) => {
            const Icon = service.icon

            return (
              <article
                id={service.id}
                key={service.id}
                className="group relative overflow-hidden rounded-3xl border border-[#3f3b49] bg-[#111013] p-6 transition-all hover:border-[#7727ff88] sm:p-10 lg:p-12"
              >
                {/* Glow accent */}
                <div
                  aria-hidden="true"
                  className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-[#6417ed18] blur-3xl transition-opacity group-hover:bg-[#6417ed30]"
                />

                <div className="grid gap-8 lg:grid-cols-12 lg:gap-12">
                  {/* Left column: Overview */}
                  <div className="lg:col-span-7">
                    <div className="flex flex-wrap items-center gap-3">
                      <span className="flex size-12 items-center justify-center rounded-2xl bg-[#6417ed25] text-[#9a5cff] border border-[#7727ff40]">
                        <Icon size={24} />
                      </span>
                      <span className="rounded-full bg-[#201d29] px-3.5 py-1 text-xs font-bold uppercase tracking-wider text-[#a77aff]">
                        {service.category}
                      </span>
                      <span className="text-xs text-[#7f7a8b]">Typical delivery: {service.timeline}</span>
                    </div>

                    <h2 className="mt-5 text-2xl font-black tracking-tight sm:text-3xl lg:text-4xl">{service.name}</h2>
                    <p className="mt-2 text-sm font-semibold text-[#a77aff] sm:text-base">{service.subtitle}</p>

                    <p className="mt-4 text-sm leading-relaxed text-[#c2becb] sm:text-base">{service.description}</p>

                    {/* Capabilities list */}
                    <div className="mt-8">
                      <h3 className="text-xs font-bold uppercase tracking-[0.16em] text-[#9a5cff]">What We Deliver</h3>
                      <ul className="mt-4 grid gap-3 sm:grid-cols-2">
                        {service.capabilities.map((cap, i) => (
                          <li key={i} className="flex items-start gap-2.5 text-xs sm:text-sm text-[#d0ccda]">
                            <CheckCircle2 size={16} className="mt-0.5 shrink-0 text-[#7727ff]" />
                            <span>{cap}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Target audience */}
                    <div className="mt-6 rounded-xl border border-[#2b2735] bg-[#09080b]/70 p-4">
                      <p className="text-xs font-bold uppercase tracking-wider text-[#aaa6b5]">Best Suited For:</p>
                      <p className="mt-1 text-xs leading-relaxed text-[#c2becb] sm:text-sm">{service.bestFor}</p>
                    </div>
                  </div>

                  {/* Right column: Deliverables, Tech Stack & Action */}
                  <div className="flex flex-col justify-between rounded-2xl border border-[#2a2633] bg-[#0c0b0f] p-6 sm:p-7 lg:col-span-5">
                    <div>
                      <h4 className="text-xs font-bold uppercase tracking-wider text-[#aaa6b5]">Core Deliverables</h4>
                      <ul className="mt-3 space-y-2.5">
                        {service.deliverables.map((item, idx) => (
                          <li key={idx} className="flex items-start gap-2 text-xs leading-relaxed text-[#c2becb]">
                            <span className="mt-1 size-1.5 shrink-0 rounded-full bg-[#7727ff]" />
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>

                      <h4 className="mt-7 text-xs font-bold uppercase tracking-wider text-[#aaa6b5]">Technologies & Tools</h4>
                      <div className="mt-3 flex flex-wrap gap-2">
                        {service.technologies.map((tech) => (
                          <span
                            key={tech}
                            className="rounded-lg border border-[#352f42] bg-[#16141c] px-2.5 py-1 text-xs font-medium text-[#d7d3de]"
                          >
                            {tech}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="mt-8 border-t border-[#25222d] pt-5">
                      <div className="mb-4 flex items-center justify-between text-xs">
                        <span className="text-[#8e8a99]">Starting investment:</span>
                        <span className="font-bold text-[#a77aff] text-sm">{service.startingAt}</span>
                      </div>
                      <a
                        href={`/contact?service=${encodeURIComponent(service.contactParam)}`}
                        className="group/btn inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#6417ed] px-5 py-3 text-sm font-bold text-white transition-all hover:bg-[#7727ff] hover:shadow-[0_0_25px_#7727ff66]"
                      >
                        Inquire about {service.name}
                        <ArrowRight size={16} className="transition-transform group-hover/btn:translate-x-1" />
                      </a>
                    </div>
                  </div>
                </div>
              </article>
            )
          })}
        </div>
      </section>

      {/* Engagement Models */}
      <section className="border-t border-[#211d27] bg-[#09080b] px-4 py-20 sm:px-6 sm:py-24">
        <div className="mx-auto max-w-6xl">
          <div className="text-center">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#9a5cff]">Flexible Collaboration</p>
            <h2 className="mt-3 text-3xl font-black tracking-tight sm:text-4xl lg:text-5xl">How we engage with you.</h2>
            <p className="mx-auto mt-4 max-w-xl text-sm leading-relaxed text-[#aaa6b5] sm:text-base">
              Choose the delivery model that fits your product stage, timeline, and internal engineering bandwidth.
            </p>
          </div>

          <div className="mt-14 grid gap-6 md:grid-cols-3">
            {engagementModels.map((model) => (
              <div
                key={model.title}
                className={`flex flex-col justify-between rounded-3xl border p-7 transition-all ${
                  model.highlight
                    ? 'border-[#7727ff] bg-[linear-gradient(135deg,#1f0a47,#340c77)] shadow-[0_12px_45px_#6417ed30]'
                    : 'border-[#3f3b49] bg-[#111013]'
                }`}
              >
                <div>
                  <div className="inline-flex rounded-full bg-[#7727ff25] px-3 py-1 text-xs font-bold text-[#b58cff]">
                    {model.badge}
                  </div>
                  <div className="mt-4 flex items-baseline gap-1.5">
                    <span className="text-3xl font-black tracking-tight text-white">{model.price}</span>
                    <span className="text-xs text-[#aaa6b5] font-medium">{model.period}</span>
                  </div>
                  <h3 className="mt-2 text-xl font-bold">{model.title}</h3>
                  <p className="mt-2 text-xs leading-relaxed text-[#c2becb] sm:text-sm">{model.description}</p>

                  <ul className="mt-6 space-y-3">
                    {model.features.map((feature, i) => (
                      <li key={i} className="flex items-start gap-2.5 text-xs text-[#d7d3de] sm:text-sm">
                        <CheckCircle2 size={16} className={`mt-0.5 shrink-0 ${model.highlight ? 'text-white' : 'text-[#7727ff]'}`} />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <a
                  href="/contact"
                  className={`mt-8 inline-flex w-full items-center justify-center rounded-xl py-3 text-xs font-bold transition-all sm:text-sm ${
                    model.highlight
                      ? 'bg-white text-[#19063d] hover:bg-[#f0eaff]'
                      : 'border border-[#55505e] bg-[#16141a] text-[#f7f5ff] hover:border-[#7727ff] hover:text-white'
                  }`}
                >
                  Choose {model.title}
                </a>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 4-Step Agile Delivery Workflow */}
      <section className="px-4 py-20 sm:px-6 sm:py-24 lg:py-28">
        <div className="mx-auto max-w-6xl">
          <div className="text-center">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#9a5cff]">Agile Execution</p>
            <h2 className="mt-3 text-3xl font-black tracking-tight sm:text-4xl lg:text-5xl">Our proven path to shipping.</h2>
            <p className="mx-auto mt-4 max-w-xl text-sm text-[#aaa6b5] sm:text-base">
              A disciplined, transparent delivery framework built over 150+ successful client deployments.
            </p>
          </div>

          <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {deliveryProcess.map((item) => (
              <div
                key={item.step}
                className="group relative rounded-2xl border border-[#3f3b49] bg-[#111013] p-7 transition-transform hover:-translate-y-1.5"
              >
                <span className="text-4xl font-black text-[#7727ff]">{item.step}</span>
                <h3 className="mt-4 text-lg font-bold text-[#f7f5ff]">{item.title}</h3>
                <p className="mt-3 text-xs leading-relaxed text-[#aaa6b5] sm:text-sm">{item.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Accordion */}
      <section className="border-t border-[#211d27] bg-[#08070a] px-4 py-20 sm:px-6 sm:py-24">
        <div className="mx-auto max-w-4xl">
          <div className="text-center">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#9a5cff]">Got Questions?</p>
            <h2 className="mt-3 text-3xl font-black tracking-tight sm:text-4xl lg:text-5xl">Frequently Asked Questions</h2>
            <p className="mx-auto mt-4 max-w-lg text-sm text-[#aaa6b5]">
              Everything you need to know about partnering with DS Softwares on your digital initiatives.
            </p>
          </div>

          <div className="mt-12 space-y-4">
            {faqs.map((faq, index) => {
              const isOpen = openFaq === index
              return (
                <div
                  key={index}
                  className="overflow-hidden rounded-2xl border border-[#312c3b] bg-[#111013] transition-colors"
                >
                  <button
                    onClick={() => setOpenFaq(isOpen ? null : index)}
                    className="flex w-full items-center justify-between p-6 text-left text-base font-bold text-[#f7f5ff] sm:text-lg"
                    aria-expanded={isOpen}
                  >
                    <span>{faq.question}</span>
                    <ChevronDown
                      size={20}
                      className={`shrink-0 text-[#7727ff] transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
                    />
                  </button>
                  {isOpen && (
                    <div className="border-t border-[#25212e] px-6 pb-6 pt-4 text-sm leading-relaxed text-[#aaa6b5]">
                      {faq.answer}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* CTA Banner */}
      <section className="px-4 py-16 sm:px-6 sm:py-24">
        <div className="mx-auto flex max-w-6xl flex-col items-start justify-between gap-8 rounded-3xl border border-[#514d57] bg-[linear-gradient(110deg,#1f075c,#40109a)] p-8 sm:p-12 lg:flex-row lg:items-center">
          <div className="max-w-2xl">
            <Rocket size={36} className="text-[#b58cff]" />
            <h2 className="mt-6 text-balance text-3xl font-black tracking-tight sm:text-4xl lg:text-5xl">
              Have a project in mind? Let&apos;s build it right.
            </h2>
            <p className="mt-4 text-sm leading-relaxed text-[#d0c5e7] sm:text-base">
              Share your goals, scope, or idea. We&apos;ll schedule an architecture consultation and deliver a transparent proposal within 48 hours.
            </p>
          </div>
          <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
            <a
              href="/contact"
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-white px-8 py-4 text-sm font-bold text-[#19063d] transition-all hover:bg-[#f0eaff] hover:shadow-xl sm:w-auto"
            >
              Get a Free Proposal <ArrowUpRight size={18} />
            </a>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-[#211d27] bg-[#09080b] px-4 py-12 sm:px-6 sm:py-16">
        <div className="mx-auto max-w-6xl">
          <div className="flex flex-col justify-between gap-8 border-b border-[#211d27] pb-10 sm:gap-10 sm:pb-12 lg:flex-row lg:items-end">
            <div className="max-w-xl">
              <a href="/" aria-label="DS Softwares home" className="text-2xl font-black tracking-[-0.04em]">
                <span className="text-[#7727ff]">DS</span>Softwares<span className="text-[#7727ff]">.</span>
              </a>
              <h2 className="mt-5 text-balance text-2xl font-black tracking-tight min-[380px]:text-3xl sm:mt-6 sm:text-4xl">
                Digital work that earns attention and drives growth.
              </h2>
              <p className="mt-4 max-w-lg text-sm leading-relaxed text-[#aaa6b5]">
                Strategy, design, custom engineering, cloud solutions, and performance growth—all from one accountable team.
              </p>
            </div>
            <a
              href="/contact"
              className="inline-flex w-full items-center justify-center rounded-lg bg-[#6417ed] px-7 py-4 text-sm font-bold transition-colors hover:bg-[#7727ff] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#9a5cff] sm:w-fit"
            >
              Start a project →
            </a>
          </div>

          <div className="grid gap-10 py-12 sm:grid-cols-2 lg:grid-cols-4">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#9a5cff]">Services</p>
              <div className="mt-5 flex flex-col gap-3 text-sm text-[#aaa6b5]">
                <a className="hover:text-[#f7f5ff]" href="/services#custom-software">
                  Custom Software
                </a>
                <a className="hover:text-[#f7f5ff]" href="/services#ai-automation">
                  AI & Automation
                </a>
                <a className="hover:text-[#f7f5ff]" href="/services#cloud-devops">
                  Cloud & DevOps
                </a>
                <a className="hover:text-[#f7f5ff]" href="/services#branding-uiux">
                  Branding & UI/UX
                </a>
                <a className="hover:text-[#f7f5ff]" href="/services#web-mobile-apps">
                  Web & Mobile Apps
                </a>
                <a className="hover:text-[#f7f5ff]" href="/services#social-media-growth">
                  Social Media Growth
                </a>
              </div>
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#9a5cff]">Company</p>
              <div className="mt-5 flex flex-col gap-3 text-sm text-[#aaa6b5]">
                <a className="hover:text-[#f7f5ff]" href="/about">
                  About us
                </a>
                <a className="hover:text-[#f7f5ff]" href="/projects">
                  Our work
                </a>
                <a className="hover:text-[#f7f5ff]" href="/services">
                  All services
                </a>
                <a className="hover:text-[#f7f5ff]" href="/contact">
                  Contact us
                </a>
              </div>
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#9a5cff]">Legal</p>
              <div className="mt-5 flex flex-col gap-3 text-sm text-[#aaa6b5]">
                <a className="hover:text-[#f7f5ff]" href="/privacy-policy">
                  Privacy policy
                </a>
                <a className="hover:text-[#f7f5ff]" href="/terms-and-conditions">
                  Terms & conditions
                </a>
              </div>
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#9a5cff]">Get in touch</p>
              <div className="mt-5 flex flex-col gap-3 text-sm text-[#aaa6b5]">
                <a className="break-all hover:text-[#f7f5ff]" href="mailto:hello@dssoftwares.in">
                  hello@dssoftwares.in
                </a>
                <a className="hover:text-[#f7f5ff]" href="tel:+919956688553">
                  +91 99566 88553
                </a>
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
