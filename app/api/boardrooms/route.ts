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
    const { 
      name, 
      description, 
      dimensions, 
      capacity, 
      imageUrl, 
      facilities, 
      pricingOptions, 
      locationId 
    } = body


    

    const boardroom = await prisma.boardroom.create({
      data: {
        name,
        description,
        dimensions,
        capacity: parseInt(capacity),
        imageUrl,
        facilities: Array.isArray(facilities) ? facilities : [],
        pricingOptions: Array.isArray(pricingOptions) ? pricingOptions : [],
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
  } finally {
    await prisma.$disconnect()
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
    const { 
      name, 
      description, 
      dimensions, 
      capacity, 
      imageUrl, 
      facilities, 
      pricingOptions 
    } = body


    

    const boardroom = await prisma.boardroom.update({
      where: { id: params.id },
      data: {
        name,
        description,
        dimensions,
        capacity: parseInt(capacity),
        imageUrl,
        facilities: Array.isArray(facilities) ? facilities : [],
        pricingOptions: Array.isArray(pricingOptions) ? pricingOptions : [],
      },
    })

    return NextResponse.json(boardroom)
  } catch (error) {
    console.error('Error updating boardroom:', error)
    return NextResponse.json(
      { error: 'Failed to update boardroom' },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const boardroom = await prisma.boardroom.findUnique({
      where: { id: params.id },
      include: {
        location: true,
        bookings: true,
      },
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
  } finally {
    await prisma.$disconnect()
  }
}