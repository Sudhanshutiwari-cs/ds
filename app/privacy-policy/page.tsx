import type { Metadata } from 'next'
import { ArrowLeft, Info } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Privacy Policy',
  description: 'Learn how DS Softwares collects, uses, and protects personal information.',
}

const sections = [
  { title: '1. Information we collect', content: [
    'We may collect information you voluntarily provide when you contact us, request a proposal, enter into a services agreement, or communicate with our team. This may include your name, email address, telephone number, company name, billing details, and the content of your inquiry.',
    'Our website may also collect limited technical information automatically, such as browser type, device type, approximate location, referring pages, and usage data. We may use cookies or similar technologies where permitted by law.',
  ]},
  { title: '2. How we use information', content: [
    'We use personal information to respond to inquiries, prepare proposals, deliver contracted services, manage client relationships, process payments, maintain security, improve our website and services, and meet legal or regulatory obligations.',
    'We do not sell personal information. We will not use contact details for unrelated marketing without an appropriate legal basis or consent where required.',
  ]},
  { title: '3. Legal bases for processing', content: [
    'Depending on your location, we process information where necessary to perform a contract, take steps at your request before entering a contract, pursue legitimate business interests, comply with legal obligations, or act with your consent. You may withdraw consent at any time without affecting prior lawful processing.',
  ]},
  { title: '4. Sharing and service providers', content: [
    'We may share information with trusted providers that help us operate our business, including hosting, analytics, communication, payment, accounting, and project-management providers. They may use information only to perform services for us and must apply suitable safeguards.',
    'We may also disclose information when required by law, to protect rights or safety, in connection with a business transaction, or with your direction or consent.',
  ]},
  { title: '5. International transfers', content: [
    'DS Softwares works with clients and providers worldwide. Information may be processed outside your country. Where applicable, we use recognized safeguards for international transfers, such as contractual protections or adequacy mechanisms.',
  ]},
  { title: '6. Data retention and security', content: [
    'We retain personal information only as long as reasonably necessary for the purposes described in this policy, including contractual, accounting, dispute-resolution, and legal requirements.',
    'We use reasonable organizational and technical measures designed to protect information from unauthorized access, loss, misuse, or alteration. No online system can be guaranteed completely secure.',
  ]},
  { title: '7. Your privacy rights', content: [
    'Depending on applicable law, you may have rights to access, correct, delete, restrict, or object to processing of personal information, request portability, or withdraw consent. You may also have the right to complain to a relevant data-protection authority.',
    'To exercise a right, email hello@dssoftwares.in. We may need to verify your identity before completing a request.',
  ]},
  { title: '8. Cookies and third-party links', content: [
    'Our website may use essential and analytics technologies to operate and understand performance. You can manage cookies through your browser settings. Our pages may link to third-party websites; their privacy practices are governed by their own policies.',
  ]},
  { title: '9. Children’s privacy', content: [
    'Our services are intended for businesses and are not directed to children. We do not knowingly collect personal information from children. Please contact us if you believe a child has provided information to us.',
  ]},
  { title: '10. Changes and contact', content: [
    'We may update this policy to reflect changes in our services, practices, or legal obligations. The effective date above shows when it was last revised.',
    'For questions or privacy requests, contact DS Softwares at hello@dssoftwares.in.',
  ]},
]

export default function PrivacyPolicyPage() {
  return (
    <main className="min-h-screen bg-[#050506] px-4 pb-16 font-sans text-[#f7f5ff] selection:bg-[#7727ff] sm:px-6 sm:pb-24">
      <header className="mx-auto flex h-20 max-w-4xl items-center justify-between sm:h-24">
        <a href="/" aria-label="DS Softwares home" className="text-xl font-black tracking-[-0.04em] sm:text-2xl"><span className="text-[#7727ff]">DS</span>Softwares<span className="text-[#7727ff]">.</span></a>
        <a href="/" className="inline-flex items-center gap-2 text-sm font-bold text-[#aaa6b5] hover:text-[#f7f5ff]"><ArrowLeft size={17} /> Back home</a>
      </header>
      <article className="mx-auto max-w-4xl pt-10 sm:pt-16">
        <p className="text-sm font-bold uppercase tracking-[0.2em] text-[#9a5cff]">Legal</p>
        <h1 className="mt-5 break-words text-4xl font-black tracking-[-0.045em] min-[380px]:text-5xl sm:text-6xl">Privacy Policy</h1>
        <p className="mt-5 text-sm text-[#77727f]">Effective date: September 1, 2026</p>
        <p className="mt-8 max-w-3xl text-lg leading-relaxed text-[#c2becb]">This policy explains how DS Softwares (“we,” “us,” or “our”) handles personal information when you visit our website, contact us, or engage us to provide digital services.</p>
        <aside className="mt-8 flex items-start gap-3 rounded-2xl border border-[#514d57] bg-[#111013] p-4 text-sm leading-relaxed text-[#aaa6b5] sm:gap-4 sm:p-5"><Info className="mt-0.5 shrink-0 text-[#9a5cff]" size={20} /><p>This is a general informational template and is not legal advice. It should be reviewed and adapted by qualified counsel for DS Softwares&apos; actual practices, location, and applicable laws before publication.</p></aside>
        <div className="mt-12 flex flex-col gap-10 sm:mt-14 sm:gap-12">
          {sections.map((section) => <section key={section.title}><h2 className="text-2xl font-black tracking-tight">{section.title}</h2><div className="mt-4 flex flex-col gap-4">{section.content.map((paragraph) => <p key={paragraph} className="text-base leading-relaxed text-[#aaa6b5]">{paragraph}</p>)}</div></section>)}
        </div>
      </article>
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
