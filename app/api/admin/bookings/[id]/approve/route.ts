import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const booking = await prisma.booking.findUnique({
      where: { id: params.id }
    })

    if (!booking) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 })
    }

    if (booking.status !== 'pending') {
      return NextResponse.json(
        { error: 'Only pending bookings can be approved' },
        { status: 400 }
      )
    }

    const updatedBooking = await prisma.booking.update({
      where: { id: params.id },
      data: { status: 'confirmed' },
      include: {
        boardroom: {
          include: {
            location: true
          }
        }
      }
    })

    return NextResponse.json(updatedBooking)
  } catch (error) {
    console.error('Error approving booking:', error)
    return NextResponse.json(
      { error: 'Failed to approve booking' },
      { status: 500 }
    )
  }
  finally{
      await prisma.$disconnect()
    }
}