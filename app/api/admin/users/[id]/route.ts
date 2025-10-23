import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import bcrypt from 'bcryptjs'
import { Prisma } from '@prisma/client'

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
  if (
      !session ||
      (session.user.role !== "admin" && session.user.role !== "manager")
    ) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json()
    const { name, email, password, role, status, locationIds } = body

        if (role === "admin" && session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if email is already taken by another user
    const existingUser = await prisma.user.findFirst({
      where: {
        email,
        id: { not: params.id }
      }
    })

    if (existingUser) {
      return NextResponse.json(
        { error: 'Email is already taken by another user' },
        { status: 400 }
      )
    }

    // Prepare update data
    const updateData: any = {
      name,
      email,
      role,
      status
    }

    // Only update password if provided
    if (password) {
      updateData.password = await bcrypt.hash(password, 12)
    }

    // Update user and location assignments in a transaction
    const user = await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      // Update user basic info
      const updatedUser = await tx.user.update({
        where: { id: params.id },
        data: updateData
      })

      // Delete existing location assignments
      await tx.userLocation.deleteMany({
        where: { userId: params.id }
      })

      // Create new location assignments
      if (locationIds && locationIds.length > 0) {
        await tx.userLocation.createMany({
          data: locationIds.map((locationId: string) => ({
            userId: params.id,
            locationId
          }))
        })
      }

      // Return user with location assignments
      return await tx.user.findUnique({
        where: { id: params.id },
        include: {
          userLocations: {
            include: {
              location: {
                select: {
                  id: true,
                  name: true
                }
              }
            }
          }
        }
      })
    })

    return NextResponse.json(user)
  } catch (error) {
    console.error('Error updating user:', error)
    return NextResponse.json(
      { error: 'Failed to update user' },
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
    
if (
      !session ||
      (session.user.role !== "admin" && session.user.role !== "manager")
    ) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const getUser = await prisma.user.findUnique({
      where:{
        id:params.id
      },
      select:{
        role:true
      }
    })

    if(getUser?.role === "admin" &&  session.user.role === "manager"){
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }



    // Don't allow deleting the current user
    if (session.user.id === params.id) {
      return NextResponse.json(
        { error: 'Cannot delete your own account' },
        { status: 400 }
      )
    }
    

    await prisma.user.delete({
      where: { id: params.id }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting user:', error)
    return NextResponse.json(
      { error: 'Failed to delete user' },
      { status: 500 }
    )
  }
  finally{
    await prisma.$disconnect()
  }
}