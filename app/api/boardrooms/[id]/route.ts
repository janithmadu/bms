import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const boardroom = await prisma.boardroom.findUnique({
      where: { id: params.id },
      include: {
        location: true,
        bookings: {
          where: {
            status: { in: ['confirmed', 'pending'] }, // Show both confirmed and pending bookings
            date: {
              gte: new Date(new Date().setHours(0, 0, 0, 0))
            }
          },
          orderBy: { startTime: 'asc' }
        }
      }
    })

    if (!boardroom) {
      return NextResponse.json(
        { error: 'Boardroom not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(boardroom)
  } catch (error) {
    console.error('Error fetching boardroom:', error)
    return NextResponse.json(
      { error: 'Failed to fetch boardroom' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { name, description, dimensions, capacity, imageUrl, facilities,pricingOptions } = body

    const boardroom = await prisma.boardroom.update({
      where: { id: params.id },
      data: {
        name,
        description,
        dimensions,
        capacity: parseInt(capacity),
        imageUrl,
        pricingOptions :Array.isArray(pricingOptions) ? pricingOptions : [],
        facilities: Array.isArray(facilities) ? facilities : [],
      },
    })

    return NextResponse.json(boardroom)
  } catch (error) {
    console.error('Error updating boardroom:', error)
    return NextResponse.json(
      { error: 'Failed to update boardroom' },
      { status: 500 }
    )
  }
  finally{
    await prisma.$disconnect()
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    await prisma.boardroom.delete({
      where: { id: params.id },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting boardroom:', error)
    return NextResponse.json(
      { error: 'Failed to delete boardroom' },
      { status: 500 }
    )
  }
  finally{
    await prisma.$disconnect()
  }
}