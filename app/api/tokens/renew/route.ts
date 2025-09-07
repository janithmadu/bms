import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    // This endpoint should be called by a cron job monthly
    // You can secure it with an API key or webhook secret
    
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