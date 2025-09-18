import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Return user with location assignments
    const user = await prisma.user.findUnique({
      where: { id: params.id },
      select: {
        tokenLimit: true,
        tokensUsed: true,
        tokensAvailable: true,
      },
    });

    return NextResponse.json(user);
  } catch (error) {
    console.error("Error getting user tokens:", error);
    return NextResponse.json(
      { error: "Failed to getting user tokens" },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
