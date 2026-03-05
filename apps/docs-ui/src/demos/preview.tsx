'use client'

import type { ReactNode } from 'react'

interface PreviewProps {
  children: ReactNode
  className?: string
}

export function Preview({ children, className }: PreviewProps) {
  return (
    <div
      className={`not-prose mt-4 flex flex-wrap items-center gap-4 rounded-lg border border-border bg-background p-6 ${className ?? ''}`}
    >
      {children}
    </div>
  )
}
