import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

interface RouteParams {
  params: Promise<{ id: string }>;
}

// POST /api/issuances/[id]/complete - Mark an issuance as completed
export async function POST(request: Request, { params }: RouteParams) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { receivedBy, remarks, deliveredAt } = body;

    console.log('Complete issuance request:', { id, receivedBy, remarks, deliveredAt });

    // Check if issuance exists
    const existingIssuance = await prisma.issuance.findUnique({
      where: { id },
      include: {
        completedIssuance: true,
        material: true,
        school: true,
      },
    });

    console.log('Existing issuance:', existingIssuance);

    if (!existingIssuance) {
      return NextResponse.json(
        { success: false, message: "Issuance not found" },
        { status: 404 }
      );
    }

    // Check if already completed
    if (existingIssuance.completedIssuance) {
      return NextResponse.json(
        { success: false, message: "Issuance is already completed" },
        { status: 400 }
      );
    }

    // Create completed issuance record with all required fields
    const completedIssuance = await prisma.completedIssuance.create({
      data: {
        issuanceId: id,
        materialId: existingIssuance.materialId,
        schoolId: existingIssuance.schoolId,
        quantity: existingIssuance.quantity,
        dateIssued: existingIssuance.issuedAt,
        deliveredAt: deliveredAt ? new Date(deliveredAt) : new Date(),
        receivedBy,
        remarks,
      },
      include: {
        issuance: {
          include: {
            material: {
              include: {
                subject: true,
              },
            },
            school: true,
            user: {
              select: { id: true, username: true },
            },
          },
        },
      },
    });

    console.log('Completed issuance created:', completedIssuance);

    return NextResponse.json({
      success: true,
      data: completedIssuance,
    });
  } catch (error) {
    console.error("Error completing issuance:", error);
    return NextResponse.json(
      { success: false, message: "Failed to complete issuance", error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
