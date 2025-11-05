import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export async function GET() {
  try {
    const branding = await prisma.$queryRaw`
      SELECT * FROM branding WHERE id = 'default' LIMIT 1
    ` as any[]

    if (branding.length === 0) {
      // Create default branding if it doesn't exist
      const defaultBranding = await prisma.$executeRaw`
        INSERT INTO branding (id, companyName) VALUES ('default', 'BookingHub')
        ON DUPLICATE KEY UPDATE companyName = companyName
      `
      
      const newBranding = await prisma.$queryRaw`
        SELECT * FROM branding WHERE id = 'default' LIMIT 1
      ` as any[]
      
      return NextResponse.json(newBranding[0])
    }

    return NextResponse.json(branding[0])
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

    const updatedBranding = await prisma.$executeRaw`
      UPDATE branding SET
        logoUrl = ${logoUrl || null},
        companyName = ${companyName},
        primaryColor = ${primaryColor},
        secondaryColor = ${secondaryColor},
        accentColor = ${accentColor},
        backgroundColor = ${backgroundColor},
        textColor = ${textColor},
        cardColor = ${cardColor},
        borderColor = ${borderColor},
        successColor = ${successColor},
        warningColor = ${warningColor},
        errorColor = ${errorColor},
        updatedAt = CURRENT_TIMESTAMP
      WHERE id = 'default'
    `

    const branding = await prisma.$queryRaw`
      SELECT * FROM branding WHERE id = 'default' LIMIT 1
    ` as any[]

    return NextResponse.json(branding[0])
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