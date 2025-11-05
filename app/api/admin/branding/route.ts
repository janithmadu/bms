import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export async function GET() {
  try {
    const branding = await prisma.branding.findUnique({
      where: { id: 'default' }
    })

    if (!branding) {
      // Create default branding if it doesn't exist
      const defaultBranding = await prisma.branding.create({
        data: {
          id: 'default',
          companyName: 'BookingHub'
        }
      })
      return NextResponse.json(defaultBranding)
    }

    return NextResponse.json(branding)
  } catch (error) {
    console.error('Error fetching branding:', error)
    return NextResponse.json(
      { error: 'Failed to fetch branding' },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const {
      logoUrl,
      companyName,
      primaryColor,
      secondaryColor,
      accentColor,
      backgroundColor,
      textColor,
      cardColor,
      borderColor,
      successColor,
      warningColor,
      errorColor
    } = body

    const updatedBranding = await prisma.branding.upsert({
      where: { id: 'default' },
      update: {
        logoUrl: logoUrl || null,
        companyName,
        primaryColor,
        secondaryColor,
        accentColor,
        backgroundColor,
        textColor,
        cardColor,
        borderColor,
        successColor,
        warningColor,
        errorColor,
        updatedAt: new Date()
      },
      create: {
        id: 'default',
        logoUrl: logoUrl || null,
        companyName,
        primaryColor,
        secondaryColor,
        accentColor,
        backgroundColor,
        textColor,
        cardColor,
        borderColor,
        successColor,
        warningColor,
        errorColor
      }
    })

    return NextResponse.json(updatedBranding)
  } catch (error) {
    console.error('Error updating branding:', error)
    return NextResponse.json(
      { error: 'Failed to update branding' },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
}