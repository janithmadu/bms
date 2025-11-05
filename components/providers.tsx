"use client"

import { SessionProvider } from 'next-auth/react'
import { Toaster } from '@/components/ui/sonner'
import { BrandingProvider } from '@/components/BrandingProvider'

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <BrandingProvider>
        {children}
        <Toaster position="top-right" />
      </BrandingProvider>
    </SessionProvider>
  )
}