import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import bcrypt from "bcryptjs";
import shortid from 'shortid';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (
      !session ||
      (session.user.role !== "admin" && session.user.role !== "manager")
    ) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    let users;

    if (session.user.role === "manager") {
      users = await prisma.user.findMany({
        where: {
          role: {
            in: ["manager", "user"], // include both roles
          },
        },
        select: {
          id: true,
          email: true,
          name: true,
          password: true,
          role: true,
          emailVerified: false,
          userLocations: {
            select: {
              location: {
                select: {
                  id: true,
                  name: true,
                },
              },
            },
          },
        },
        orderBy: {
          createdAt: "desc",
        },
      });
    } else {
      users = await prisma.user.findMany({
        select: {
          id: true,
          email: true,
          name: true,
          password: true,
          role: true,
          emailVerified: false,
          userLocations: {
            select: {
              location: {
                select: {
                  id: true,
                  name: true,
                },
              },
            },
          },
        },
        orderBy: {
          createdAt: "desc",
        },
      });
    }

    return NextResponse.json(users);
  } catch (error) {
    // console.error("Error fetching users:", error);
    return NextResponse.json(
      { error: "Failed to fetch users" },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (
      !session ||
      (session.user.role !== "admin" && session.user.role !== "manager")
    ) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { name, email, password, role, status, locationIds } = body;

    if (role === "admin" && session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "User with this email already exists" },
        { status: 400 }
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create user with location assignments
    const user = await prisma.user.create({
      data: {
        id:shortid.generate().slice(0, 5),
        name,
        email,
        password: hashedPassword,
        tokensAvailable:40,
        role,
        status,
        userLocations: {
          create: locationIds.map((locationId: string) => ({
            locationId,
          })),
        },
      },
      include: {
        userLocations: {
          include: {
            location: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
    });

    return NextResponse.json(user);
  } catch (error) {
    console.error("Error creating user:", error);
    return NextResponse.json(
      { error: "Failed to create user" },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
