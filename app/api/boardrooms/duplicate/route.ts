import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import {  Prisma } from "@prisma/client";

export async function POST(request: NextRequest) {
  try {
    const { originalBoardroomId, locationId, newName } = await request.json();

    // Validate input
    if (!originalBoardroomId || !locationId || !newName) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Fetch original boardroom with all fields
    const originalBoardroom = await prisma.boardroom.findUnique({
      where: { id: originalBoardroomId },
    });

    if (!originalBoardroom) {
      return NextResponse.json(
        { error: "Original boardroom not found" },
        { status: 404 }
      );
    }

    // Verify the original boardroom belongs to the target location
    if (originalBoardroom.locationId !== locationId) {
      return NextResponse.json(
        { error: "Boardroom does not belong to this location" },
        { status: 403 }
      );
    }

    // ✅ FIXED: Explicitly cast Json fields to InputJsonValue
    const duplicateBoardroom = await prisma.boardroom.create({
      data: {
        name: newName,
        description: originalBoardroom.description,
        dimensions: originalBoardroom.dimensions,
        capacity: originalBoardroom.capacity,
        imageUrl: originalBoardroom.imageUrl,
        // Convert JsonValue to InputJsonValue
        facilities: originalBoardroom.facilities as Prisma.InputJsonValue,
        pricingOptions: originalBoardroom.pricingOptions as Prisma.InputJsonValue,
        locationId: locationId,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    });

    return NextResponse.json({
      ...duplicateBoardroom,
      message: "Boardroom duplicated successfully",
    });

  } catch (error) {
    console.error("Duplicate boardroom error:", error);
    return NextResponse.json(
      { error: "Failed to duplicate boardroom" },
      { status: 500 }
    );
  }
}