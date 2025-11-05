import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export async function GET() {
  try {
    const branding = await prisma.$queryRaw`
      SELECT * FROM branding WHERE id = 'default' LIMIT 1
    ` as any[]

    if (branding.length === 0) {
      // Return default branding if none exists
      return NextResponse.json({
        id: 'default',
        logoUrl: null,
        companyName: 'BookingHub',
        primaryColor: '#3b82f6',
        secondaryColor: '#6366f1',
        accentColor: '#8b5cf6',
        backgroundColor: '#ffffff',
        textColor: '#1e293b',
        cardColor: '#ffffff',
        borderColor: '#e2e8f0',
        successColor: '#10b981',
        warningColor: '#f59e0b',
        errorColor: '#ef4444'
      })
    }

    return NextResponse.json(branding[0])
  } catch (error) {
    console.error('Error fetching public branding:', error)
    return NextResponse.json(
      { error: 'Failed to fetch branding' },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
}