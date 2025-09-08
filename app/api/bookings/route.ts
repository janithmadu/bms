import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { eventTitle, bookerName, bookerEmail, date, startTime, endTime, boardroomId } = body

    // Calculate duration in hours
    const start = new Date(startTime)
    const end = new Date(endTime)
    const duration = (end.getTime() - start.getTime()) / (1000 * 60 * 60)
    const tokensUsed = Math.ceil(duration)

    // Get current token status
    let tokenRecord = await prisma.token.findUnique({
      where: { id: 'singleton' }
    })

    if (!tokenRecord) {
      tokenRecord = await prisma.token.create({
        data: { id: 'singleton' }
      })
    }

    // Check if enough tokens are available
    if (tokenRecord.availableCount < tokensUsed) {
      return NextResponse.json(
        { error: 'Insufficient tokens available' },
        { status: 400 }
      )
    }

    // Check for conflicts
    const conflictingBooking = await prisma.booking.findFirst({
      where: {
        boardroomId,
        status: 'confirmed',
        OR: [
          {
            AND: [
              { startTime: { lte: start } },
              { endTime: { gt: start } }
            ]
          },
          {
            AND: [
              { startTime: { lt: end } },
              { endTime: { gte: end } }
            ]
          },
          {
            AND: [
              { startTime: { gte: start } },
              { endTime: { lte: end } }
            ]
          }
        ]
      }
    })

    if (conflictingBooking) {
      return NextResponse.json(
        { error: 'Time slot is already booked' },
        { status: 400 }
      )
    }

    // Create booking and update tokens in a transaction
    const result = await prisma.$transaction([
      prisma.booking.create({
        data: {
          eventTitle,
          bookerName,
          bookerEmail,
          date: new Date(date),
          startTime: start,
          endTime: end,
          duration,
          tokensUsed,
          status: 'pending', // All new bookings start as pending
          boardroomId,
        },
        include: {
          boardroom: {
            include: {
              location: true
            }
          }
        }
      }),
      prisma.token.update({
        where: { id: 'singleton' },
        data: {
          availableCount: { decrement: tokensUsed },
          tokensUsedThisMonth: { increment: tokensUsed }
        }
      })
    ])

    return NextResponse.json(result[0])
  } catch (error) {
    console.error('Error creating booking:', error)
    return NextResponse.json(
      { error: 'Failed to create booking' },
      { status: 500 }
    )
  }
}