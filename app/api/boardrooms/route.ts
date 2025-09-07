import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { name, description, dimensions, capacity, imageUrl, facilities, locationId } = body

    const boardroom = await prisma.boardroom.create({
      data: {
        name,
        description,
        dimensions,
        capacity: parseInt(capacity),
        imageUrl,
        facilities: Array.isArray(facilities) ? facilities : [],
        locationId,
      },
    })

    return NextResponse.json(boardroom)
  } catch (error) {
    console.error('Error creating boardroom:', error)
    return NextResponse.json(
      { error: 'Failed to create boardroom' },
      { status: 500 }
    )
  }
}