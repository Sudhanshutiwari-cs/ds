import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Apply for Internship | DS Softwares',
  description: 'Apply for our engineering, design, and product internships. Build real-world products and accelerate your career.',
}

export default function ApplyLayout({ children }: { children: React.ReactNode }) {
  return children
}
