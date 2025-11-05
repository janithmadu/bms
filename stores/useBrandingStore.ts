import { create } from 'zustand'

interface BrandingData {
  id: string
  logoUrl?: string
  companyName: string
  primaryColor: string
  secondaryColor: string
  accentColor: string
  backgroundColor: string
  textColor: string
  cardColor: string
  borderColor: string
  successColor: string
  warningColor: string
  errorColor: string
}

interface BrandingStore {
  branding: BrandingData | null
  loading: boolean
  fetchBranding: () => Promise<void>
  updateBranding: (data: Partial<BrandingData>) => Promise<void>
  applyBrandingToDOM: () => void
}

export const useBrandingStore = create<BrandingStore>((set, get) => ({
  branding: null,
  loading: false,

  fetchBranding: async () => {
    try {
      set({ loading: true })
      const response = await fetch('/api/public/branding', {
        cache: 'no-store'
      })
      const data = await response.json()
      set({ branding: data, loading: false })
      
      // Apply branding to DOM immediately after fetching
      setTimeout(() => {
        get().applyBrandingToDOM()
      }, 100)
    } catch (error) {
      console.error('Failed to fetch branding:', error)
      set({ loading: false })
    }
  },

  updateBranding: async (data: Partial<BrandingData>) => {
    try {
      set({ loading: true })
      const response = await fetch('/api/admin/branding', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })
      
      if (response.ok) {
        const updatedBranding = await response.json()
        set({ branding: updatedBranding, loading: false })
        get().applyBrandingToDOM()
        return updatedBranding
      } else {
        throw new Error('Failed to update branding')
      }
    } catch (error) {
      console.error('Failed to update branding:', error)
      set({ loading: false })
      throw error
    }
  },

  applyBrandingToDOM: () => {
    const { branding } = get()
    if (!branding) return

    const root = document.documentElement
    
    // Apply CSS custom properties
    root.style.setProperty('--primary', branding.primaryColor)
    root.style.setProperty('--secondary', branding.secondaryColor)
    root.style.setProperty('--accent', branding.accentColor)
    root.style.setProperty('--background', branding.backgroundColor)
    root.style.setProperty('--foreground', branding.textColor)
    root.style.setProperty('--card', branding.cardColor)
    root.style.setProperty('--border', branding.borderColor)
    root.style.setProperty('--success', branding.successColor)
    root.style.setProperty('--warning', branding.warningColor)
    root.style.setProperty('--error', branding.errorColor)

    // Apply additional color variations
    root.style.setProperty('--primary-foreground', '#ffffff')
    root.style.setProperty('--secondary-foreground', branding.textColor)
    root.style.setProperty('--card-foreground', branding.textColor)
    root.style.setProperty('--muted', branding.borderColor)
    root.style.setProperty('--muted-foreground', '#64748b')
    root.style.setProperty('--destructive', branding.errorColor)
    root.style.setProperty('--destructive-foreground', '#ffffff')
    root.style.setProperty('--input', branding.borderColor)
    root.style.setProperty('--ring', branding.primaryColor)
  }
}))