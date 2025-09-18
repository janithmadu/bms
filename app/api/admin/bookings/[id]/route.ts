import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const {
      eventTitle,
      bookerName,
      bookerEmail,
      date,
      startTime,
      endTime,
      boardroomId,
    } = body;

    // Calculate duration and tokens
    const start = new Date(startTime);
    const end = new Date(endTime);
    const duration = (end.getTime() - start.getTime()) / (1000 * 60 * 60);
    const tokensUsed = Math.ceil(duration);

    // Get the existing booking to check token difference
    const existingBooking = await prisma.booking.findUnique({
      where: { id: params.id },
    });

    if (!existingBooking) {
      return NextResponse.json({ error: "Booking not found" }, { status: 404 });
    }

    const tokenDifference = tokensUsed - existingBooking.tokensUsed;

    // Check for conflicts (excluding current booking)
    const conflictingBooking = await prisma.booking.findFirst({
      where: {
        id: { not: params.id },
        boardroomId,
        status: { in: ["confirmed", "pending"] }, // Block both confirmed and pending bookings
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
        { error: "Time slot conflicts with another booking" },
        { status: 400 }
      );
    }

    // If more tokens are needed, check availability
    if (tokenDifference > 0) {
      const tokenRecord = await prisma.token.findUnique({
        where: { id: "singleton" },
      });

      if (!tokenRecord || tokenRecord.availableCount < tokenDifference) {
        return NextResponse.json(
          { error: "Insufficient tokens available for this change" },
          { status: 400 }
        );
      }
    }

    // Update booking and adjust tokens
    const result = await prisma.$transaction([
      prisma.booking.update({
        where: { id: params.id },
        data: {
          eventTitle,
          bookerName,
          bookerEmail,
          date: new Date(date),
          startTime: start,
          endTime: end,
          duration,
          tokensUsed,
          boardroomId,
        },
        include: {
          boardroom: {
            include: {
              location: true,
            },
          },
        },
      }),
      // Adjust tokens if needed
      ...(tokenDifference !== 0
        ? [
            prisma.token.update({
              where: { id: "singleton" },
              data: {
                availableCount: { increment: -tokenDifference },
                tokensUsedThisMonth: { increment: tokenDifference },
              },
            }),
          ]
        : []),
    ]);

    return NextResponse.json(result[0]);
  } catch (error) {
    console.error("Error updating booking:", error);
    return NextResponse.json(
      { error: "Failed to update booking" },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get the booking to refund tokens
    const booking = await prisma.booking.findUnique({
      where: { id: params.id },
    });


    const { UserID } = await request.json();

    if (!booking) {
      return NextResponse.json({ error: "Booking not found" }, { status: 404 });
    }

    // Cancel booking and refund tokens
    await prisma.$transaction(async (tx) => {
      await tx.booking.delete({
        where: { id: params.id },
      });

      if (booking.status === "cancelled" && !UserID) {
        return;
      } else {
        await tx.user.update({
          where: { id: UserID },
          data: {
            tokensAvailable: { increment: booking.tokensUsed },
            tokensUsed: { decrement: booking.tokensUsed },
          },
        });
      }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error cancelling booking:", error);
    return NextResponse.json(
      { error: "Failed to cancel booking" },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
