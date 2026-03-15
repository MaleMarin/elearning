'use client'

import { DashboardShell } from '@/components/dashboard/DashboardShell'

interface RetosShellProps {
  children: React.ReactNode
}

export default function RetosShell({ children }: RetosShellProps) {
  return (
    <DashboardShell subtitle="// Retos del grupo · Grupo 2026-A">
      {children}
    </DashboardShell>
  )
}
