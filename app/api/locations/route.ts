import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET(req: Request) {
  try {
    // Extract userId from query params
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");
    const role = searchParams.get("role");
    if (!userId) {
      return NextResponse.json({ error: "Missing userId" }, { status: 400 });
    }

    let locations;
    if (role !== "admin") {
      locations = await prisma.location.findMany({
        where: {
          userLocations: {
            some: {
              userId: userId, // ✅ filter by userId in join table
            },
          },
        },
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
    } else {
      locations = await prisma.location.findMany({
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
    }


    

    return NextResponse.json(locations);
  } catch (error) {
    console.error("Error fetching locations:", error);
    return NextResponse.json(
      { error: "Failed to fetch locations" },
      { status: 500 }
    );
  }
  finally{
    await prisma.$disconnect()
  }
}

export async function POST(request: NextRequest) {
  
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if(session.user.role !== "admin"){
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 }); 
    }

    const body = await request.json();
    const { name, address, description, imageUrl } = body;

    const location = await prisma.location.create({
      data: {
        name,
        address,
        description,
        imageUrl,
      },
    });

    return NextResponse.json(location);
  } catch (error) {
    console.error("Error creating location:", error);
    return NextResponse.json(
      { error: "Failed to create location" },
      { status: 500 }
    );
  }
  finally{
    await prisma.$disconnect()
  }
}
