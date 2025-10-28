import { NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session) return new Response("Unauthorized", { status: 401 });

  const { financeStatus, UserID } = await req.json();
  const { id } = params;

  if (!["financeadmin", "manager"].includes(session.user.role)) {
    return new Response("Forbidden", { status: 403 });
  }

  const booking = await prisma.booking.findUnique({
    where: { id },
    select: {  isExsisting: true, financeStatus: true },
  });

  console.log(booking);
  

  if (!booking  || booking.isExsisting) {
    return new Response("Invalid booking", { status: 400 });
  }


  if (session.user.role === "financeadmin" && typeof booking.financeStatus === "string" && booking.financeStatus !== "finance-pending") {
    return new Response("Already processed", { status: 400 });
  }

  await prisma.booking.update({
    where: { id },
    data: { financeStatus },
  });

  return new Response(JSON.stringify({ success: true }), { status: 200 });
}