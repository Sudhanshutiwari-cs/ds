import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Intern Portal | DS Softwares',
  description: 'Intern workspace for sprint tasks, squad collaboration, and project deadlines.',
}

export default function PortalLayout({ children }: { children: React.ReactNode }) {
  return children
}
