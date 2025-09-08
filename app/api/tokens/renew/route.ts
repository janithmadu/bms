import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'


export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions)
  try {
    // This endpoint should be called by a cron job monthly
    // You can secure it with an API key or webhook secret

     if (!session || session.user.role !== "admin") {
          return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }
    
    const tokenRecord = await prisma.token.update({
      where: { id: 'singleton' },
      data: {
        availableCount: { set: prisma.raw('initial_count') },
        tokensUsedThisMonth: 0,
        lastRenewalDate: new Date()
      }
    })

    return NextResponse.json({ 
      message: 'Tokens renewed successfully',
      tokenRecord 
    })
  } catch (error) {
    console.error('Error renewing tokens:', error)
    return NextResponse.json(
      { error: 'Failed to renew tokens' },
      { status: 500 }
    )
  }
}