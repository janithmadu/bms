"use client"

import { useEffect } from 'react'
import { useBrandingStore } from '@/stores/useBrandingStore'

export function BrandingProvider({ children }: { children: React.ReactNode }) {
  const { fetchBranding, applyBrandingToDOM } = useBrandingStore()

  useEffect(() => {
    // Fetch branding on app load
    fetchBranding()
  }, [fetchBranding])

  useEffect(() => {
    // Apply branding when component mounts
    applyBrandingToDOM()
  }, [applyBrandingToDOM])

  return <>{children}</>
}