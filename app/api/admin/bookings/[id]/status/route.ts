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
    const { status, UserID } = body;

    if (!["pending", "confirmed", "cancelled"].includes(status)) {
      return NextResponse.json({ error: "Invalid status" }, { status: 400 });
    }

    // Get the existing booking
    const existingBooking = await prisma.booking.findUnique({
      where: { id: params.id },
    });

    if (!existingBooking) {
      return NextResponse.json({ error: "Booking not found" }, { status: 404 });
    }

    // Handle token adjustments based on status changes
    let tokenAdjustment = 0;

    if (existingBooking.status === "pending" && status === "cancelled") {
      // Refund tokens when cancelling a pending booking
      tokenAdjustment = existingBooking.tokensUsed;
    } else if (
      existingBooking.status === "confirmed" &&
      status === "cancelled"
    ) {
      // Refund tokens when cancelling a confirmed booking
      tokenAdjustment = existingBooking.tokensUsed;
    } else if (
      existingBooking.status === "cancelled" &&
      status === "confirmed"
    ) {
      // Deduct tokens when confirming a previously cancelled booking
      const tokenRecord = await prisma.user.findUnique({
        where: { id: UserID },
      });

      if (
        !tokenRecord ||
        tokenRecord.tokensAvailable < existingBooking.tokensUsed
      ) {
        return NextResponse.json(
          { error: "Insufficient tokens available" },
          { status: 400 }
        );
      }
      tokenAdjustment = -existingBooking.tokensUsed;
    }

    console.log(UserID);
    

    // Update booking status and adjust tokens in a transaction
    const result = await prisma.$transaction([
      prisma.booking.update({
        where: { id: params.id },
        data: { status },
        include: {
          boardroom: {
            include: {
              location: true,
            },
          },
        },
      }),
      // Adjust tokens if needed
      ...(tokenAdjustment !== 0 && UserID
        ? [
            prisma.user.update({
              where: { id: UserID },
              data: {
                tokensAvailable: { increment: tokenAdjustment },
                tokensUsed: { increment: -tokenAdjustment },
              },
            }),
          ]
        : []),
    ]);

    return NextResponse.json(result[0]);
  } catch (error) {
    console.error("Error updating booking status:", error);
    return NextResponse.json(
      { error: "Failed to update booking status" },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
