import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { User } from '@prisma/client';

// Define the initial count value for token renewal
const INITIAL_COUNT = 1000; // Replace 1000 with your desired initial count


export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions)
  try {
    // This endpoint should be called by a cron job monthly
    // You can secure it with an API key or webhook secret

    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const users = await prisma.user.findMany()


    users.forEach(async (user:User) => {
      await prisma.user.update({
        where: { id: user.id },
        data: { tokenLimit: user.tokenLimit, tokensUsed: 0, tokensAvailable: user.tokenLimit }
      })
    }
    )



    return NextResponse.json({
      message: 'Tokens renewed successfully',
    })
  } catch (error) {
    console.error('Error renewing tokens:', error)
    return NextResponse.json(
      { error: 'Failed to renew tokens' },
      { status: 500 }
    )
  }
}