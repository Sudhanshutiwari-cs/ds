import type { Metadata } from 'next'
import { ArrowLeft, Info } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Terms and Conditions',
  description: 'Terms governing use of the DS Softwares website and general digital services.',
}

const sections = [
  { title: '1. Acceptance of these terms', content: ['By accessing this website, you agree to these Terms and Conditions and our Privacy Policy. If you do not agree, please do not use the website. These website terms do not replace a signed proposal, statement of work, or services agreement, which will control if there is any conflict.'] },
  { title: '2. About our services', content: ['DS Softwares provides services that may include strategy, branding, user experience design, website and application development, custom software, automation, social media, content, cloud deployment, maintenance, and consulting.', 'Descriptions and examples on this website are general information only. The exact scope, deliverables, schedule, fees, acceptance process, and responsibilities for client work will be stated in a separate written agreement.'] },
  { title: '3. Proposals, fees, and payment', content: ['Unless a proposal states otherwise, estimates are based on the information available when prepared and may change if scope, assumptions, dependencies, or timelines change. Work outside an agreed scope may require a change order and additional fees.', 'Payment schedules, taxes, expenses, late-payment terms, deposits, and refund conditions will be defined in the applicable agreement or invoice. Clients are responsible for providing accurate billing details and paying undisputed amounts when due.'] },
  { title: '4. Client responsibilities', content: ['Clients must provide timely access to content, accounts, systems, personnel, feedback, and approvals reasonably needed to deliver the services. Clients are responsible for the accuracy, legality, and rights to materials they provide and for maintaining backups unless otherwise agreed.', 'Delays in client input or approvals may affect delivery dates and costs. Clients must not ask us to create or deploy content, software, or campaigns that violate law, third-party rights, platform rules, or generally accepted security practices.'] },
  { title: '5. Intellectual property', content: ['Each party retains ownership of materials, tools, methods, trademarks, software, and intellectual property it owned or developed independently before the engagement. Ownership and licensing of project deliverables will be specified in the applicable services agreement.', 'Unless agreed otherwise, DS Softwares may retain and reuse generalized knowledge, skills, non-confidential methods, frameworks, and tools that do not disclose client confidential information. We will not claim ownership of client trademarks or client-supplied content.'] },
  { title: '6. Third-party services', content: ['Projects may rely on third-party platforms, hosting providers, libraries, APIs, payment processors, social networks, or software. Their availability, features, terms, pricing, and security are controlled by those providers and may change. Clients may need to maintain separate accounts and licenses.', 'DS Softwares is not responsible for outages, changes, suspensions, data loss, or conduct caused by third-party services beyond our reasonable control.'] },
  { title: '7. Confidentiality and data', content: ['Where we receive confidential business information, we will use reasonable care and use it only to perform agreed services or as permitted by an applicable agreement. Additional confidentiality and data-processing obligations should be documented in writing when required.', 'Our handling of personal information through this website is described in our Privacy Policy. Client projects involving personal or regulated data may require separate security and processing terms.'] },
  { title: '8. Website use', content: ['You may use this website only for lawful purposes. You must not attempt to disrupt its operation, bypass security, introduce malicious code, scrape it abusively, impersonate others, infringe rights, or use content in a misleading or unauthorized manner.', 'Website content is provided for general information and may be updated without notice. You may not reproduce substantial website content or use DS Softwares branding without written permission.'] },
  { title: '9. Warranties and disclaimers', content: ['We aim to provide professional services with reasonable skill and care. Specific warranties, support commitments, and acceptance criteria will be stated in the applicable services agreement.', 'To the fullest extent permitted by law, this website is provided “as is” and “as available.” We do not warrant that it will always be uninterrupted, error-free, or suitable for a particular purpose. Nothing on this website guarantees specific commercial, marketing, ranking, revenue, or performance results.'] },
  { title: '10. Limitation of liability', content: ['To the fullest extent permitted by applicable law, DS Softwares will not be liable for indirect, incidental, special, consequential, or punitive losses arising from website use, including lost profits, revenue, opportunity, goodwill, or data. Any service-specific liability limits will be stated in the governing services agreement.', 'Nothing in these terms excludes liability that cannot lawfully be excluded or limited.'] },
  { title: '11. Termination', content: ['We may restrict access to this website for unlawful, harmful, or abusive activity. Termination, suspension, handover, and payment obligations for client projects are governed by the relevant services agreement. Provisions intended to survive termination—including payment, confidentiality, intellectual property, disclaimers, and liability terms—will remain effective.'] },
  { title: '12. Governing law and disputes', content: ['The governing law, courts, and dispute-resolution process for paid services should be stated in the applicable contract based on the parties and project location. Website-related questions or concerns should first be sent to hello@dssoftwares.in so the parties can attempt an informal resolution.'] },
  { title: '13. Changes and contact', content: ['We may revise these terms from time to time. Updated terms take effect when posted, unless otherwise stated. Continued use of the website after an update constitutes acceptance of the revised terms.', 'Questions about these terms may be sent to DS Softwares at hello@dssoftwares.in.'] },
]

export default function TermsPage() {
  return (
    <main className="min-h-screen bg-[#050506] px-4 pb-16 font-sans text-[#f7f5ff] selection:bg-[#7727ff] sm:px-6 sm:pb-24">
      <header className="mx-auto flex h-20 max-w-4xl items-center justify-between sm:h-24">
        <a href="/" aria-label="DS Softwares home" className="text-xl font-black tracking-[-0.04em] sm:text-2xl"><span className="text-[#7727ff]">DS</span>Softwares<span className="text-[#7727ff]">.</span></a>
        <a href="/" className="inline-flex items-center gap-2 text-sm font-bold text-[#aaa6b5] hover:text-[#f7f5ff]"><ArrowLeft size={17} /> Back home</a>
      </header>
      <article className="mx-auto max-w-4xl pt-10 sm:pt-16">
        <p className="text-sm font-bold uppercase tracking-[0.2em] text-[#9a5cff]">Legal</p>
        <h1 className="mt-5 break-words text-balance text-4xl font-black leading-tight tracking-[-0.045em] min-[380px]:text-5xl sm:text-6xl">Terms and Conditions</h1>
        <p className="mt-5 text-sm text-[#77727f]">Effective date: September 1, 2026</p>
        <p className="mt-8 max-w-3xl text-lg leading-relaxed text-[#c2becb]">These terms govern access to the DS Softwares website and provide a general framework for our digital services. Specific client work is governed by a separate written agreement.</p>
        <aside className="mt-8 flex items-start gap-3 rounded-2xl border border-[#514d57] bg-[#111013] p-4 text-sm leading-relaxed text-[#aaa6b5] sm:gap-4 sm:p-5"><Info className="mt-0.5 shrink-0 text-[#9a5cff]" size={20} /><p>This is a general informational template and is not legal advice. It should be reviewed and adapted by qualified counsel for DS Softwares&apos; legal entity, location, services, and contracting practices before publication.</p></aside>
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
