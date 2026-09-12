'use client'

import React from 'react'
import { AdminProvider } from '@/components/admin/AdminContext'
import AdminAuthGuard from '@/components/admin/AdminAuthGuard'

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <AdminProvider>
      <AdminAuthGuard>
        {children}
      </AdminAuthGuard>
    </AdminProvider>
  )
}