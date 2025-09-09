import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export async function GET() {
  try {
    let tokenRecord = await prisma.token.findUnique({
      where: { id: 'singleton' }
    })

    if (!tokenRecord) {
      tokenRecord = await prisma.token.create({
        data: { id: 'singleton' }
      })
    }

    return NextResponse.json(tokenRecord)
  } catch (error) {
    console.error('Error fetching tokens:', error)
    return NextResponse.json(
      { error: 'Failed to fetch tokens' },
      { status: 500 }
    )
  }
  finally{
    await prisma.$disconnect()
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { initialCount, additionalTokens } = body

    let updateData: any = {}

    if (initialCount !== undefined) {
      updateData.initialCount = initialCount
    }

    if (additionalTokens !== undefined) {
      updateData.availableCount = { increment: additionalTokens }
    }

    const tokenRecord = await prisma.token.update({
      where: { id: 'singleton' },
      data: updateData
    })

    return NextResponse.json(tokenRecord)
  } catch (error) {
    console.error('Error updating tokens:', error)
    return NextResponse.json(
      { error: 'Failed to update tokens' },
      { status: 500 }
    )
  }
  finally{
    await prisma.$disconnect()
  }
}