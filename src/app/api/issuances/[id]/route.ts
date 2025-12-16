import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

type TransactionClient = Parameters<Parameters<typeof prisma.$transaction>[0]>[0];

interface RouteParams {
  params: Promise<{ id: string }>;
}

// GET /api/issuances/[id] - Get a single issuance
export async function GET(request: Request, { params }: RouteParams) {
  try {
    const { id } = await params;

    const issuance = await prisma.issuance.findUnique({
      where: { id },
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
        completedIssuance: true,
      },
    });

    if (!issuance) {
      return NextResponse.json(
        { success: false, message: "Issuance not found" },
        { status: 404 }
      );
    }

    // Transform for frontend
    const transformedIssuance = {
      ...issuance,
      status: issuance.completedIssuance ? 'COMPLETED' : 'PENDING',
      dateIssued: issuance.issuedAt,
      school: {
        ...issuance.school,
        name: issuance.school.schoolname,
      },
    };

    return NextResponse.json({
      success: true,
      data: transformedIssuance,
    });
  } catch (error) {
    console.error("Error fetching issuance:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch issuance" },
      { status: 500 }
    );
  }
}

// PUT /api/issuances/[id] - Update an issuance (only if not completed)
export async function PUT(request: Request, { params }: RouteParams) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { quantity, remarks } = body;

    // Check if issuance exists
    const existingIssuance = await prisma.issuance.findUnique({
      where: { id },
      include: {
        material: true,
        completedIssuance: true,
      },
    });

    if (!existingIssuance) {
      return NextResponse.json(
        { success: false, message: "Issuance not found" },
        { status: 404 }
      );
    }

    // Cannot edit completed issuances
    if (existingIssuance.completedIssuance) {
      return NextResponse.json(
        { success: false, message: "Cannot edit a completed issuance" },
        { status: 400 }
      );
    }

    // If quantity is being changed, validate and adjust inventory
    if (quantity !== undefined && quantity !== existingIssuance.quantity) {
      const quantityDiff = quantity - existingIssuance.quantity;
      const material = existingIssuance.material;

      // If increasing quantity, check if enough stock
      if (quantityDiff > 0 && material.quantity < quantityDiff) {
        return NextResponse.json(
          {
            success: false,
            message: `Insufficient stock. Available: ${material.quantity}, Additional needed: ${quantityDiff}`,
          },
          { status: 400 }
        );
      }

      // Update in transaction
      const issuance = await prisma.$transaction(async (tx: TransactionClient) => {
        // Adjust material quantity
        await tx.material.update({
          where: { id: material.id },
          data: { quantity: { decrement: quantityDiff } },
        });

        // Update issuance
        return tx.issuance.update({
          where: { id },
          data: {
            ...(quantity !== undefined && { quantity }),
            ...(remarks !== undefined && { remarks }),
          },
          include: {
            material: { include: { subject: true } },
            school: true,
            user: { select: { id: true, username: true } },
          },
        });
      });

      // Transform for frontend
      const transformedIssuance = {
        ...issuance,
        status: 'PENDING',
        dateIssued: issuance.issuedAt,
        school: {
          ...issuance.school,
          name: issuance.school.schoolname,
        },
      };

      return NextResponse.json({
        success: true,
        data: transformedIssuance,
      });
    }

    // Only updating remarks
    const issuance = await prisma.issuance.update({
      where: { id },
      data: {
        ...(remarks !== undefined && { remarks }),
      },
      include: {
        material: { include: { subject: true } },
        school: true,
        user: { select: { id: true, username: true } },
      },
    });

    // Transform for frontend
    const transformedIssuance = {
      ...issuance,
      status: 'PENDING',
      dateIssued: issuance.issuedAt,
      school: {
        ...issuance.school,
        name: issuance.school.schoolname,
      },
    };

    return NextResponse.json({
      success: true,
      data: transformedIssuance,
    });
  } catch (error) {
    console.error("Error updating issuance:", error);
    return NextResponse.json(
      { success: false, message: "Failed to update issuance" },
      { status: 500 }
    );
  }
}

// DELETE /api/issuances/[id] - Delete an issuance (return quantity to inventory)
export async function DELETE(request: Request, { params }: RouteParams) {
  try {
    const { id } = await params;

    // Check if issuance exists
    const existingIssuance = await prisma.issuance.findUnique({
      where: { id },
      include: {
        completedIssuance: true,
      },
    });

    if (!existingIssuance) {
      return NextResponse.json(
        { success: false, message: "Issuance not found" },
        { status: 404 }
      );
    }

    // Cannot delete completed issuances
    if (existingIssuance.completedIssuance) {
      return NextResponse.json(
        { success: false, message: "Cannot delete a completed issuance" },
        { status: 400 }
      );
    }

    // Delete issuance and return quantity to inventory
    await prisma.$transaction(async (tx: TransactionClient) => {
      // Return quantity to material
      await tx.material.update({
        where: { id: existingIssuance.materialId },
        data: { quantity: { increment: existingIssuance.quantity } },
      });

      // Delete issuance
      await tx.issuance.delete({
        where: { id },
      });
    });

    return NextResponse.json({
      success: true,
      message: "Issuance deleted and quantity returned to inventory",
    });
  } catch (error) {
    console.error("Error deleting issuance:", error);
    return NextResponse.json(
      { success: false, message: "Failed to delete issuance" },
      { status: 500 }
    );
  }
}
