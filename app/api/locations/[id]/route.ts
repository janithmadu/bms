import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get("userId")
    const role = searchParams.get("role")


    
    // ✅ check user access using userId + locationId
    const checkUserHasAccessToLocations = await prisma.user.findFirst({
      where: {
        id: userId || "", // enforce user match
        userLocations: {
          some: {
            locationId: params.id,
          },
        },
      },
    })


    console.log(checkUserHasAccessToLocations);
    



    

    if (!checkUserHasAccessToLocations && role !== "admin") {
      return NextResponse.json(
        { error: "Unauthorized access" },
        { status: 403 }
      )
    }

    const location = await prisma.location.findUnique({
      where: { id: params.id },
      include: {
        boardrooms: {
          include: {
            _count: { select: { bookings: true } },
          },
        },
      },
    })

    if (!location) {
      return NextResponse.json({ error: "Location not found" }, { status: 404 })
    }

    return NextResponse.json(location)
  } catch (error) {
    // console.error("Error fetching location:", error)
    return NextResponse.json(
      { error: "Failed to fetch location" },
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
    const { name, address, description, imageUrl } = body

    const location = await prisma.location.update({
      where: { id: params.id },
      data: {
        name,
        address,
        description,
        imageUrl,
      },
    })

    return NextResponse.json(location)
  } catch (error) {
    console.error('Error updating location:', error)
    return NextResponse.json(
      { error: 'Failed to update location' },
      { status: 500 }
    )
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

    await prisma.location.delete({
      where: { id: params.id },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting location:', error)
    return NextResponse.json(
      { error: 'Failed to delete location' },
      { status: 500 }
    )
  }
}