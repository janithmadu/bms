import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    const { UserID } = await request.json();

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const booking = await prisma.booking.findUnique({
      where: { id: params.id },
    });


    if (!booking) {
      return NextResponse.json({ error: "Booking not found" }, { status: 404 });
    }

    if (booking.status !== "pending") {
      return NextResponse.json(
        { error: "Only pending bookings can be rejected" },
        { status: 400 }
      );
    }

    
    

    // Reject booking and refund tokens
    await prisma.$transaction([
      prisma.booking.update({
        where: { id: params.id },
        data: { status: "cancelled" },
      }),
    prisma.user.update({
        where: { id: UserID },
        data: {
          tokensAvailable: { increment: booking.tokensUsed },
          tokensUsed: { decrement: booking.tokensUsed },
        },
      }),
    ]);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error rejecting booking:", error);
    return NextResponse.json(
      { error: "Failed to reject booking" },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
