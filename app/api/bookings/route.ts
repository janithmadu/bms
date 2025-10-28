import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { Prisma, User } from "@prisma/client";
import { sendBookingReceivedEmail } from "@/lib/mailer";

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
      Price,
    } = body;

    // Calculate duration in hours
    const start = new Date(startTime);
    const end = new Date(endTime);
    const duration = (end.getTime() - start.getTime()) / (1000 * 60 * 60);
    const tokensUsed = Math.ceil(duration);

    // Get current token status (OUTSIDE transaction - fast read)
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

    // ✅ OPTIMIZED TRANSACTION - INCREASE TIMEOUT TO 10s
    const result = await prisma.$transaction(
      async (tx: Prisma.TransactionClient) => {
        // 1. Create booking FIRST (minimal data)
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
            financeStatus:isExistingUser ? "finance-approve" : "finance-pending",
            booker: { connect: { id: bookerId ?? "7Wcpw" } },
            boardroom: { connect: { id: boardroomId ?? "" } },
          },
        });

        // 2. Update user tokens if needed (simple update)
        if (isExistingUser && UserID) {
          await tx.user.update({
            where: { id: UserID },
            data: {
              tokensAvailable: { decrement: tokensUsed },
              tokensUsed: { increment: tokensUsed },
            },
          });
        }

        // 3. Return booking ID - NO findUnique in transaction!
        return { id: booking.id };
      },
      {
        // ✅ INCREASE TIMEOUT TO 10 SECONDS
        maxWait: 5000,
        timeout: 10000,
      }
    );

    // ✅ FETCH COMPLETE DATA OUTSIDE TRANSACTION (no timeout risk)
    const completeBooking = await prisma.booking.findUnique({
      where: { id: result.id },
      include: {
        boardroom: {
          include: {
            location: true,
          },
        },
      },
    });

    if (!completeBooking) {
      return NextResponse.json(
        { error: "Booking created but could not retrieve details" },
        { status: 500 }
      );
    }

    // ---- 5. SEND "BOOKING RECEIVED" EMAIL (non-blocking) ------------------
    (async () => {
      try {
        await sendBookingReceivedEmail({
          to: bookerEmail,
          bookerName,
          eventTitle,
          date: completeBooking.date.toISOString(),
          startTime: completeBooking.startTime.toISOString(),
          endTime: completeBooking.endTime.toISOString(),
          boardroomName: completeBooking.boardroom.name,
          locationName: completeBooking.boardroom.location.name,
        });
        console.log(`Booking received email sent to ${bookerEmail}`);
      } catch (mailErr) {
        console.error(`Failed to send email to ${bookerEmail}:`, mailErr);
        // Optional: Save to NotificationLog table for retry
      }
    })();

    return NextResponse.json(completeBooking);
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
