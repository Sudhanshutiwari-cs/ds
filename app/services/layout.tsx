import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Services | DS Softwares',
  description:
    'Explore full-spectrum digital services by DS Softwares: Custom Software Development, AI & Automation, Cloud Solutions, Branding & UI/UX Design, Web & Mobile Applications, and Social Media Growth.',
}

export default function ServicesLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
