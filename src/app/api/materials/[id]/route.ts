import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

interface RouteParams {
  params: Promise<{ id: string }>;
}

// Helper function to extract grade level number from string like "Grade 7"
function parseGradeLevelNumber(gradeLevel: string): number {
  const match = gradeLevel.match(/\d+/);
  return match ? parseInt(match[0]) : 0;
}

// GET /api/materials/[id] - Get a single material
export async function GET(request: Request, { params }: RouteParams) {
  try {
    const { id } = await params;

    const material = await prisma.material.findUnique({
      where: { id },
      include: {
        subject: true,
        issuances: {
          include: {
            school: true,
            user: {
              select: { id: true, username: true },
            },
          },
          orderBy: { issuedAt: "desc" },
          take: 10,
        },
      },
    });

    if (!material) {
      return NextResponse.json(
        { success: false, message: "Material not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        ...material,
        name: material.title,
        gradeLevel: parseGradeLevelNumber(material.gradeLevel),
      },
    });
  } catch (error) {
    console.error("Error fetching material:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch material" },
      { status: 500 }
    );
  }
}

// PUT /api/materials/[id] - Update a material
export async function PUT(request: Request, { params }: RouteParams) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { name, gradeLevel, quantity, source, subjectId } = body;

    // Check if material exists
    const existingMaterial = await prisma.material.findUnique({
      where: { id },
    });

    if (!existingMaterial) {
      return NextResponse.json(
        { success: false, message: "Material not found" },
        { status: 404 }
      );
    }

    // Validate grade level if provided
    const gradeLevelNum = gradeLevel !== undefined 
      ? (typeof gradeLevel === 'string' ? parseInt(gradeLevel) : gradeLevel)
      : undefined;
    
    if (gradeLevelNum !== undefined && (gradeLevelNum < 1 || gradeLevelNum > 12)) {
      return NextResponse.json(
        { success: false, message: "Grade level must be between 1 and 12" },
        { status: 400 }
      );
    }

    // Validate subject if provided and get education stage
    let educationStage = existingMaterial.educationStage;
    if (subjectId) {
      const subject = await prisma.subject.findUnique({
        where: { id: subjectId },
      });

      if (!subject) {
        return NextResponse.json(
          { success: false, message: "Subject not found" },
          { status: 404 }
        );
      }
      educationStage = subject.educationStage;
    }

    const material = await prisma.material.update({
      where: { id },
      data: {
        ...(name !== undefined && { title: name }),
        ...(gradeLevelNum !== undefined && { gradeLevel: `Grade ${gradeLevelNum}` }),
        ...(quantity !== undefined && { quantity }),
        ...(source !== undefined && { source }),
        ...(subjectId !== undefined && { subjectId, educationStage }),
      },
      include: {
        subject: true,
      },
    });

    return NextResponse.json({
      success: true,
      data: {
        ...material,
        name: material.title,
        gradeLevel: parseGradeLevelNumber(material.gradeLevel),
      },
    });
  } catch (error) {
    console.error("Error updating material:", error);
    return NextResponse.json(
      { success: false, message: "Failed to update material" },
      { status: 500 }
    );
  }
}

// DELETE /api/materials/[id] - Delete a material
export async function DELETE(request: Request, { params }: RouteParams) {
  try {
    const { id } = await params;

    // Check if material exists
    const existingMaterial = await prisma.material.findUnique({
      where: { id },
    });

    if (!existingMaterial) {
      return NextResponse.json(
        { success: false, message: "Material not found" },
        { status: 404 }
      );
    }

    await prisma.material.delete({
      where: { id },
    });

    return NextResponse.json({
      success: true,
      message: "Material deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting material:", error);
    return NextResponse.json(
      { success: false, message: "Failed to delete material" },
      { status: 500 }
    );
  }
}
