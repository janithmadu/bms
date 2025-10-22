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
      phoneNumber,
      Price
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
    if (tokenRecord.availableCount < tokensUsed && isExistingUser === true) {
      return NextResponse.json(
        { error: "Insufficient tokens available" },
        { status: 400 }
      );
    }


    // Execute transaction without mixing different return types
    const result = await prisma.$transaction(async (tx) => {
      // Create booking first
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
          UserID: UserID ?? "",
          isExsisting: isExistingUser ? true : false,
          price: Price ?? "0",
          status: "pending",
          phoneNumber,
          booker: {
            connect: { id: bookerId ?? "7Wcpw" }, // ✅ relation way
          },

          // ✅ Fix: connect boardroom relation instead of boardroomId
          boardroom: {
            connect: { id: boardroomId ?? "" },
          },
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
