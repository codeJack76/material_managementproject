import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

interface RouteParams {
  params: Promise<{ id: string }>;
}

// GET /api/schools/[id] - Get a single school
export async function GET(request: Request, { params }: RouteParams) {
  try {
    const { id } = await params;

    const school = await prisma.school.findUnique({
      where: { id },
      include: {
        issuances: {
          include: {
            material: true,
            user: {
              select: { id: true, username: true },
            },
            completedIssuance: true,
          },
          orderBy: { issuedAt: "desc" },
          take: 20,
        },
        _count: {
          select: { issuances: true },
        },
      },
    });

    if (!school) {
      return NextResponse.json(
        { success: false, message: "School not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: school,
    });
  } catch (error) {
    console.error("Error fetching school:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch school" },
      { status: 500 }
    );
  }
}

// PUT /api/schools/[id] - Update a school
export async function PUT(request: Request, { params }: RouteParams) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { schoolname, schooltype, municipality, congressionalDistrict, zone } = body;

    // Check if school exists
    const existingSchool = await prisma.school.findUnique({
      where: { id },
    });

    if (!existingSchool) {
      return NextResponse.json(
        { success: false, message: "School not found" },
        { status: 404 }
      );
    }

    // Check for duplicate if name or municipality changed
    if (schoolname || municipality) {
      const duplicateSchool = await prisma.school.findFirst({
        where: {
          id: { not: id },
          schoolname: { equals: schoolname || existingSchool.schoolname, mode: "insensitive" },
          municipality: {
            equals: municipality || existingSchool.municipality,
            mode: "insensitive",
          },
        },
      });

      if (duplicateSchool) {
        return NextResponse.json(
          {
            success: false,
            message: "A school with this name already exists in this municipality",
          },
          { status: 400 }
        );
      }
    }

    const school = await prisma.school.update({
      where: { id },
      data: {
        ...(schoolname !== undefined && { schoolname }),
        ...(schooltype !== undefined && { schooltype }),
        ...(municipality !== undefined && { municipality }),
        ...(congressionalDistrict !== undefined && {
          congressionalDistrict: parseInt(congressionalDistrict),
        }),
        ...(zone !== undefined && { zone }),
      },
    });

    return NextResponse.json({
      success: true,
      data: school,
    });
  } catch (error) {
    console.error("Error updating school:", error);
    return NextResponse.json(
      { success: false, message: "Failed to update school" },
      { status: 500 }
    );
  }
}

// DELETE /api/schools/[id] - Delete a school
export async function DELETE(request: Request, { params }: RouteParams) {
  try {
    const { id } = await params;

    // Check if school exists
    const existingSchool = await prisma.school.findUnique({
      where: { id },
      include: {
        _count: {
          select: { issuances: true },
        },
      },
    });

    if (!existingSchool) {
      return NextResponse.json(
        { success: false, message: "School not found" },
        { status: 404 }
      );
    }

    // Warn if school has issuances
    if (existingSchool._count.issuances > 0) {
      return NextResponse.json(
        {
          success: false,
          message: `Cannot delete school with ${existingSchool._count.issuances} existing issuance(s). Delete the issuances first.`,
        },
        { status: 400 }
      );
    }

    await prisma.school.delete({
      where: { id },
    });

    return NextResponse.json({
      success: true,
      message: "School deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting school:", error);
    return NextResponse.json(
      { success: false, message: "Failed to delete school" },
      { status: 500 }
    );
  }
}
