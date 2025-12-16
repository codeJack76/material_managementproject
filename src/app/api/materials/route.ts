import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// Helper function to extract grade level number from string like "Grade 7"
function parseGradeLevelNumber(gradeLevel: string): number {
  const match = gradeLevel.match(/\d+/);
  return match ? parseInt(match[0]) : 0;
}

// GET /api/materials - Get all materials with filters
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search") || "";
    const gradeLevel = searchParams.get("gradeLevel");
    const subjectId = searchParams.get("subjectId");
    const educationStage = searchParams.get("educationStage");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const skip = (page - 1) * limit;

    // Build where clause
    const where: {
      title?: { contains: string; mode: "insensitive" };
      gradeLevel?: string;
      subjectId?: string;
      educationStage?: "ELEMENTARY" | "JUNIOR_HIGH" | "SENIOR_HIGH";
    } = {};

    if (search) {
      where.title = { contains: search, mode: "insensitive" };
    }
    if (gradeLevel) {
      where.gradeLevel = `Grade ${gradeLevel}`;
    }
    if (subjectId) {
      where.subjectId = subjectId;
    }
    if (educationStage) {
      where.educationStage = educationStage as "ELEMENTARY" | "JUNIOR_HIGH" | "SENIOR_HIGH";
    }

    // Get materials with pagination
    const [materials, total] = await Promise.all([
      prisma.material.findMany({
        where,
        include: {
          subject: true,
        },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      prisma.material.count({ where }),
    ]);

    // Transform data to match frontend expectations
    const transformedMaterials = materials.map((material) => ({
      ...material,
      name: material.title,
      gradeLevel: parseGradeLevelNumber(material.gradeLevel),
    }));

    return NextResponse.json({
      success: true,
      data: transformedMaterials,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching materials:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch materials" },
      { status: 500 }
    );
  }
}

// POST /api/materials - Create a new material
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, gradeLevel, quantity, source, subjectId } = body;

    // Validation
    if (!name || !gradeLevel || !subjectId) {
      return NextResponse.json(
        { success: false, message: "Name, grade level, and subject are required" },
        { status: 400 }
      );
    }

    const gradeLevelNum = typeof gradeLevel === 'string' ? parseInt(gradeLevel) : gradeLevel;
    if (gradeLevelNum < 1 || gradeLevelNum > 12) {
      return NextResponse.json(
        { success: false, message: "Grade level must be between 1 and 12" },
        { status: 400 }
      );
    }

    // Check if subject exists
    const subject = await prisma.subject.findUnique({
      where: { id: subjectId },
    });

    if (!subject) {
      return NextResponse.json(
        { success: false, message: "Subject not found" },
        { status: 404 }
      );
    }

    // Format grade level as string (e.g., "Grade 1")
    const gradeLevelString = `Grade ${gradeLevelNum}`;

    const material = await prisma.material.create({
      data: {
        title: name,
        gradeLevel: gradeLevelString,
        educationStage: subject.educationStage,
        quantity: quantity || 0,
        source,
        subjectId,
      },
      include: {
        subject: true,
      },
    });

    // Transform response to match frontend expectations
    return NextResponse.json({
      success: true,
      data: {
        ...material,
        name: material.title,
      },
    });
  } catch (error) {
    console.error("Error creating material:", error);
    return NextResponse.json(
      { success: false, message: "Failed to create material" },
      { status: 500 }
    );
  }
}
