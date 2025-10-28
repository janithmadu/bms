// app/api/bookings/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import {
  sendBookingConfirmedEmail,
  sendBookingCancelledEmail,
  sendBookingReconfirmedEmail,
} from "@/lib/mailer";

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);


    if (!session || session.user.role !== "admin" && session.user.role !== "manager") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { status, UserID } = body;

    if (!["pending", "confirmed", "cancelled"].includes(status)) {
      return NextResponse.json({ error: "Invalid status" }, { status: 400 });
    }

    // Fetch booking with relations
    const existingBooking = await prisma.booking.findUnique({
      where: { id: params.id },
      include: {
        boardroom: { include: { location: true } },
      },
    });

    if (!existingBooking) {
      return NextResponse.json({ error: "Booking not found" }, { status: 404 });
    }

    const fromStatus = existingBooking.status;
    const toStatus = status;

    // === TOKEN LOGIC ===
    let tokenAdjustment = 0;
    let needsTokenCheck = false;

    if (fromStatus === "pending" && toStatus === "cancelled") {
      tokenAdjustment = existingBooking.tokensUsed; // refund
    } else if (fromStatus === "confirmed" && toStatus === "cancelled") {
      tokenAdjustment = existingBooking.tokensUsed; // refund
    } else if (fromStatus === "cancelled" && toStatus === "confirmed") {
      needsTokenCheck = true;
      tokenAdjustment = -existingBooking.tokensUsed; // deduct
    }

    // === VALIDATE TOKENS IF DEDUCTING ===
    if (needsTokenCheck && UserID) {
      const user = await prisma.user.findUnique({
        where: { id: UserID },
        select: { tokensAvailable: true },
      });

      if (!user || user.tokensAvailable < existingBooking.tokensUsed) {
        return NextResponse.json(
          { error: "Insufficient tokens available" },
          { status: 400 }
        );
      }
    }

    // === TRANSACTION: Update booking + tokens ===
    const operations: any[] = [
      prisma.booking.update({
        where: { id: params.id },
        data: { status },
        include: {
          boardroom: { include: { location: true } },
        },
      }),
    ];

    if (tokenAdjustment !== 0 && UserID) {
      operations.push(
        prisma.user.update({
          where: { id: UserID },
          data: {
            tokensAvailable: { increment: tokenAdjustment },
            tokensUsed: { increment: -tokenAdjustment },
          },
        })
      );
    }

    const [updatedBooking] = await prisma.$transaction(operations);

    // === SEND EMAIL BASED ON TRANSITION ===
    const emailData = {
      to: existingBooking.bookerEmail,
      bookerName: existingBooking.bookerName,
      eventTitle: existingBooking.eventTitle,
      date: existingBooking.date.toISOString(),
      startTime: existingBooking.startTime.toISOString(),
      endTime: existingBooking.endTime.toISOString(),
      boardroomName: existingBooking.boardroom.name,
      locationName: existingBooking.boardroom.location.name,
    };

    (async () => {
      try {
        if (toStatus === "confirmed" && fromStatus === "pending") {
          await sendBookingConfirmedEmail(emailData);
          console.log("Confirmed email sent");
        } else if (toStatus === "cancelled" && ["pending", "confirmed"].includes(fromStatus)) {
          await sendBookingCancelledEmail(emailData);
          console.log("Cancelled email sent");
        } else if (toStatus === "confirmed" && fromStatus === "cancelled") {
          await sendBookingReconfirmedEmail(emailData);
          console.log("Re-confirmed email sent");
        }
      } catch (err) {
        console.error("Email send failed:", err);
      }
    })();

    return NextResponse.json(updatedBooking);

  } catch (error: any) {
    console.error("Error updating booking status:", error);
    return NextResponse.json(
      { error: "Failed to update booking", details: error.message },
      { status: 500 }
    );
  }
}