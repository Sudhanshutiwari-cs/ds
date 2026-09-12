import type { Metadata } from 'next'
import { ArrowLeft, ArrowUpRight, Compass, Gauge, HeartHandshake, Layers3, Rocket, ShieldCheck } from 'lucide-react'

export const metadata: Metadata = {
  title: 'About',
  description: 'DS Softwares is a full-service digital agency building websites, software, brands, and social media growth for ambitious businesses.',
}

const metrics = [
  ['10+', 'Years of combined tech expertise'],
  ['150+', 'Projects shipped worldwide'],
  ['40+', 'Long-term client partnerships'],
  ['24/7', 'Support & maintenance coverage'],
]

const principles = [
  { icon: Compass, title: 'Strategy first', text: 'We start with your goals, not our tools. Every decision maps back to a measurable business outcome.' },
  { icon: Gauge, title: 'Speed with quality', text: 'Agile delivery and tight feedback loops let us ship fast without cutting corners on craft.' },
  { icon: HeartHandshake, title: 'True partnership', text: 'We work as an extension of your team with transparent communication at every step.' },
  { icon: ShieldCheck, title: 'Built to last', text: 'Secure, scalable, and maintainable foundations that grow with your business.' },
]

const capabilities = [
  ['Custom software & web apps', 'Scalable products engineered for performance and reliability.'],
  ['Branding & UI/UX design', 'Identities and interfaces that feel effortless and on-brand.'],
  ['Social media & content', 'Strategy and campaigns that convert attention into growth.'],
  ['Cloud & automation', 'Modern infrastructure and smart automation that reduce busywork.'],
]

const process = [
  ['01', 'Discover', 'We learn your business, users, and goals to define a sharp, focused scope.'],
  ['02', 'Design', 'We shape the experience with prototypes and clear, testable direction.'],
  ['03', 'Build', 'We develop in transparent sprints with continuous review and QA.'],
  ['04', 'Grow', 'We launch, measure, and keep improving with ongoing support.'],
]

export default function AboutPage() {
  return (
    <main className="min-h-screen overflow-hidden bg-[#050506] font-sans text-[#f7f5ff] selection:bg-[#7727ff]">
      <header className="mx-auto flex h-20 max-w-6xl items-center justify-between px-4 sm:h-24 sm:px-6 lg:px-8">
        <a href="/" aria-label="DS Softwares home" className="text-xl font-black tracking-[-0.04em] sm:text-2xl"><span className="text-[#7727ff]">DS</span>Softwares<span className="text-[#7727ff]">.</span></a>
        <a href="/" className="inline-flex items-center gap-2 text-sm font-bold text-[#aaa6b5] transition-colors hover:text-[#f7f5ff]"><ArrowLeft size={17} /> Back home</a>
      </header>

      <section className="relative px-4 pb-16 pt-12 sm:px-6 sm:pb-20 sm:pt-16 lg:pb-28 lg:pt-24">
        <div aria-hidden="true" className="pointer-events-none absolute left-1/2 top-0 h-96 w-3/4 -translate-x-1/2 bg-[radial-gradient(ellipse_at_center,#7727ff55,transparent_68%)] blur-3xl" />
        <div className="relative mx-auto max-w-4xl text-center">
          <p className="text-sm font-bold uppercase tracking-[0.22em] text-[#a77aff]">About DS Softwares</p>
          <h1 className="mt-5 text-balance text-4xl font-black leading-[1.08] tracking-[-0.045em] min-[380px]:text-5xl sm:mt-6 sm:text-6xl lg:text-7xl">One team for your entire digital journey.</h1>
          <p className="mx-auto mt-7 max-w-2xl text-pretty text-lg leading-relaxed text-[#c2becb]">We&apos;re a full-service software and creative agency helping businesses design, build, launch, and grow the products and brands that move them forward.</p>
        </div>
      </section>

      <section className="px-4 pb-16 sm:px-6 sm:pb-24">
        <div className="mx-auto grid max-w-6xl gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {metrics.map(([value, label]) => (
            <article key={label} className="rounded-2xl border border-[#514d57] bg-[#111013] p-5 sm:p-7">
              <strong className="text-4xl font-black text-[#9a5cff]">{value}</strong>
              <p className="mt-3 text-sm leading-relaxed text-[#aaa6b5]">{label}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="px-4 py-16 sm:px-6 sm:py-24">
        <div className="mx-auto grid max-w-6xl gap-14 lg:grid-cols-[1fr_1.15fr] lg:items-center">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.2em] text-[#9a5cff]">Our story</p>
            <h2 className="mt-5 text-balance text-4xl font-black tracking-tight sm:text-5xl">Founded to make great technology feel simple.</h2>
          </div>
          <div className="flex flex-col gap-5 text-lg leading-relaxed text-[#aaa6b5]">
            <p>DS Softwares started with a simple belief: businesses shouldn&apos;t have to juggle five vendors to get one great result. Design, development, branding, and marketing work best when they share a single vision.</p>
            <p>Today we partner with startups and established companies alike—shipping custom software, high-converting websites, memorable brands, and social media systems that actually drive growth. Whatever the challenge, our clients get one accountable team focused on outcomes.</p>
          </div>
        </div>
      </section>

      <section className="border-y border-[#211d27] px-6 py-24">
        <div className="mx-auto max-w-6xl">
          <div className="max-w-2xl">
            <p className="text-sm font-bold uppercase tracking-[0.2em] text-[#9a5cff]">What we believe</p>
            <h2 className="mt-4 text-4xl font-black tracking-tight sm:text-5xl">Principles that shape every project.</h2>
          </div>
          <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {principles.map(({ icon: Icon, title, text }) => (
              <article key={title} className="flex min-h-56 flex-col rounded-2xl border border-[#514d57] bg-[#111013] p-7 transition-transform hover:-translate-y-1">
                <Icon size={34} strokeWidth={1.8} className="text-[#7727ff]" />
                <h3 className="mt-6 text-lg font-bold">{title}</h3>
                <p className="mt-3 text-sm leading-relaxed text-[#aaa6b5]">{text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="px-4 py-16 sm:px-6 sm:py-24">
        <div className="mx-auto max-w-6xl">
          <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
            <div className="max-w-2xl">
              <p className="text-sm font-bold uppercase tracking-[0.2em] text-[#9a5cff]">What we do</p>
              <h2 className="mt-4 text-4xl font-black tracking-tight sm:text-5xl">Capabilities under one roof.</h2>
            </div>
            <a href="/services" className="inline-flex w-fit items-center gap-2 text-sm font-bold text-[#d7d3de] hover:text-[#f7f5ff]">Explore services <ArrowUpRight size={17} /></a>
          </div>
          <div className="mt-12 grid gap-4 md:grid-cols-2">
            {capabilities.map(([title, text]) => (
              <article key={title} className="flex items-start gap-5 rounded-2xl border border-[#514d57] bg-[#111013] p-7">
                <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-[#6417ed]"><Layers3 size={20} /></span>
                <div><h3 className="text-lg font-bold">{title}</h3><p className="mt-2 text-sm leading-relaxed text-[#aaa6b5]">{text}</p></div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="border-t border-[#211d27] px-6 py-24">
        <div className="mx-auto max-w-6xl">
          <div className="max-w-2xl">
            <p className="text-sm font-bold uppercase tracking-[0.2em] text-[#9a5cff]">How we work</p>
            <h2 className="mt-4 text-4xl font-black tracking-tight sm:text-5xl">A clear, transparent process.</h2>
          </div>
          <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {process.map(([number, title, text]) => (
              <article key={number} className="rounded-2xl border border-[#514d57] bg-[#111013] p-5 sm:p-7">
                <span className="text-4xl font-black text-[#7727ff]">{number}</span>
                <h3 className="mt-6 text-xl font-bold">{title}</h3>
                <p className="mt-3 text-sm leading-relaxed text-[#aaa6b5]">{text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="px-4 py-16 sm:px-6 sm:py-24">
        <div className="mx-auto flex max-w-6xl flex-col items-start justify-between gap-8 rounded-3xl border border-[#514d57] bg-[linear-gradient(110deg,#1f075c,#40109a)] p-8 sm:p-12 lg:flex-row lg:items-center">
          <div className="max-w-2xl">
            <Rocket size={34} className="text-[#b58cff]" />
            <h2 className="mt-6 text-balance text-4xl font-black tracking-tight sm:text-5xl">Let&apos;s build something worth talking about.</h2>
            <p className="mt-4 text-[#d0c5e7]">Tell us about your project and we&apos;ll map out the fastest path to results.</p>
          </div>
          <a href="/contact" className="inline-flex w-full shrink-0 items-center justify-center gap-2 rounded-lg bg-[#f7f5ff] px-8 py-4 text-sm font-bold text-[#1a0640] transition-transform hover:-translate-y-0.5 sm:w-fit">Get in touch <ArrowUpRight size={18} /></a>
        </div>
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
