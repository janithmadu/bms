// app/api/users/tokens/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

// GET all users with their token information
export async function GET() {
  try {
    const session = await getServerSession(authOptions)

    // if (!session || session.user.role !== "admin") {
    //   return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    // }

    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        tokensAvailable: true,
        tokensUsed: true,
        tokenLimit: true,
        lastTokenReset: true,
      },
      orderBy: {
        name: 'asc'
      }
    })

    return NextResponse.json(users)
  } catch (error) {
    console.error('Error fetching users:', error)
    return NextResponse.json(
      { error: 'Failed to fetch users' },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
}

// PUT to update user tokens
export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { userId, additionalTokens, newTokenLimit } = body

    let updateData: any = {}

    if (additionalTokens !== undefined && additionalTokens > 0) {
      updateData.tokensAvailable = { increment: additionalTokens }
    }

    if (newTokenLimit !== undefined) {
      updateData.tokenLimit = newTokenLimit
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: updateData,
      select: {
        id: true,
        name: true,
        email: true,
        tokensAvailable: true,
        tokensUsed: true,
        tokenLimit: true,
        lastTokenReset: true,
      }
    })

    return NextResponse.json(updatedUser)
  } catch (error) {
    console.error('Error updating user tokens:', error)
    return NextResponse.json(
      { error: 'Failed to update user tokens' },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
}

// POST to reset all user tokens (monthly renewal)
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Reset tokens for all users
    await prisma.user.updateMany({
      data: {
        tokensAvailable: { set: 0 },
        tokensUsed: { set: 0 },
        lastTokenReset: new Date(),
      }
    })

    // Update global token record if you're keeping it
    await prisma.token.upsert({
      where: { id: 'singleton' },
      update: {
        lastRenewalDate: new Date(),
      },
      create: {
        id: 'singleton',
        lastRenewalDate: new Date(),
      }
    })

    return NextResponse.json({ message: 'All user tokens reset successfully' })
  } catch (error) {
    console.error('Error resetting tokens:', error)
    return NextResponse.json(
      { error: 'Failed to reset tokens' },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
}