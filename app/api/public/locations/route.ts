import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
export const revalidate = 0
export const dynamic = 'force-dynamic'
export async function GET(req: Request) {
  try {
    // Extract userId from query params

    const locations = await prisma.location.findMany({
      include: {
        boardrooms: {
          select: {
            id: true,
            name: true,
            capacity: true,
            imageUrl: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    

    return NextResponse.json(locations);
  } catch (error) {
    console.error("Error fetching locations:", error);
    return NextResponse.json(
      { error: "Failed to fetch locations" },
      { status: 500 }
    );
  }
  
}
