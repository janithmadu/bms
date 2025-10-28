// app/api/bookings/[id]/approve/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { sendBookingConfirmedEmail } from "@/lib/mailer";

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (
      !session ||
      (session.user.role !== "admin" && session.user.role !== "manager")
    ) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = params;

    const booking = await prisma.booking.findUnique({
      where: { id },
      include: { boardroom: { include: { location: true } } },
    });

    if (!booking)
      return NextResponse.json({ error: "Booking not found" }, { status: 404 });
    if (booking.status !== "pending") {
      return NextResponse.json(
        { error: "Only pending bookings can be approved" },
        { status: 400 }
      );
    }

    const updatedBooking = await prisma.booking.update({
      where: { id },
      data: { status: "confirmed" },
      include: { boardroom: { include: { location: true } } },
    });

    // SEND CONFIRMED EMAIL (non-blocking)
    (async () => {
      try {
        await sendBookingConfirmedEmail({
          to: booking.bookerEmail,
          bookerName: booking.bookerName,
          eventTitle: booking.eventTitle,
          date: booking.date.toISOString(),
          startTime: booking.startTime.toISOString(),
          endTime: booking.endTime.toISOString(),
          boardroomName: booking.boardroom.name,
          locationName: booking.boardroom.location.name,
        });
      } catch (err) {
        console.error("Failed to send confirmed email:", err);
      }
    })();

    return NextResponse.json(updatedBooking);
  } catch (error: any) {
    console.error("Approve booking error:", error);
    return NextResponse.json(
      { error: "Failed to approve booking" },
      { status: 500 }
    );
  }
}
