import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      eventTitle,
      bookerName,
      bookerEmail,
      date,
      startTime,
      endTime,
      boardroomId,
      isExistingUser,
      UserID,
      bookerId,
      phoneNumber
    } = body;

    // Calculate duration in hours
    const start = new Date(startTime);
    const end = new Date(endTime);
    const duration = (end.getTime() - start.getTime()) / (1000 * 60 * 60);
    const tokensUsed = Math.ceil(duration);

    // Get current token status
    let tokenRecord = await prisma.token.findUnique({
      where: { id: "singleton" },
    });

    if (!tokenRecord) {
      tokenRecord = await prisma.token.create({
        data: { id: "singleton" },
      });
    }

    // Check if enough tokens are available
    if (tokenRecord.availableCount < tokensUsed) {
      return NextResponse.json(
        { error: "Insufficient tokens available" },
        { status: 400 }
      );
    }

    // Check for conflicts
    const conflictingBooking = await prisma.booking.findFirst({
      where: {
        boardroomId,
        status: { in: ["confirmed", "pending"] },
        OR: [
          {
            AND: [{ startTime: { lte: start } }, { endTime: { gt: start } }],
          },
          {
            AND: [{ startTime: { lt: end } }, { endTime: { gte: end } }],
          },
          {
            AND: [{ startTime: { gte: start } }, { endTime: { lte: end } }],
          },
        ],
      },
    });

    if (conflictingBooking) {
      return NextResponse.json(
        { error: "Time slot is already booked" },
        { status: 400 }
      );
    }
    console.log(isExistingUser);
    
    // Execute transaction without mixing different return types
    const result = await prisma.$transaction(async (tx) => {
      // Create booking first (without include to keep return type simple)
      const booking = await tx.booking.create({
        data: {
          eventTitle,
          bookerName,
          bookerEmail,
          date: new Date(date),
          startTime: start,
          endTime: end,
          duration,
          tokensUsed,
          UserID: UserID,
          isExsisting:isExistingUser ? true : false,
          bookerId: bookerId,
          status: "pending",
          boardroomId,
          phoneNumber
        },
      });

      // Update user tokens if user exists
      if (isExistingUser && UserID) {
        await tx.user.update({
          where: { id: UserID },
          data: {
            tokensAvailable: { decrement: tokensUsed },
            tokensUsed: { increment: tokensUsed },
          },
        });
      }

      // Now fetch the complete booking with relationships
      const completeBooking = await tx.booking.findUnique({
        where: { id: booking.id },
        include: {
          boardroom: {
            include: {
              location: true,
            },
          },
        },
      });

      return completeBooking;
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error("Error creating booking:", error);
    return NextResponse.json(
      { error: "Failed to create booking" },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
