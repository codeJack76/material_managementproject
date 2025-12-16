import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET /api/schools - Get all schools with filters
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search") || "";
    const type = searchParams.get("type");
    const municipality = searchParams.get("municipality");
    const congressionalDistrict = searchParams.get("congressionalDistrict");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const skip = (page - 1) * limit;

    // Build where clause
    const where: {
      schoolname?: { contains: string; mode: "insensitive" };
      schooltype?: "ELEMENTARY" | "SECONDARY" | "INTEGRATED";
      municipality?: { contains: string; mode: "insensitive" };
      congressionalDistrict?: number;
    } = {};

    if (search) {
      where.schoolname = { contains: search, mode: "insensitive" };
    }
    if (type) {
      where.schooltype = type as "ELEMENTARY" | "SECONDARY" | "INTEGRATED";
    }
    if (municipality) {
      where.municipality = { contains: municipality, mode: "insensitive" };
    }
    if (congressionalDistrict) {
      where.congressionalDistrict = parseInt(congressionalDistrict);
    }

    // Get schools with pagination
    const [schools, total] = await Promise.all([
      prisma.school.findMany({
        where,
        include: {
          _count: {
            select: { issuances: true },
          },
        },
        orderBy: { schoolname: "asc" },
        skip,
        take: limit,
      }),
      prisma.school.count({ where }),
    ]);

    return NextResponse.json({
      success: true,
      data: schools,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching schools:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch schools" },
      { status: 500 }
    );
  }
}

// POST /api/schools - Create a new school
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { schoolname, schooltype, municipality, congressionalDistrict, zone } = body;

    // Validation
    if (!schoolname || !schooltype || !municipality || !congressionalDistrict) {
      return NextResponse.json(
        {
          success: false,
          message: "School name, type, municipality, and congressional district are required",
        },
        { status: 400 }
      );
    }

    // Check for duplicate
    const existingSchool = await prisma.school.findFirst({
      where: {
        schoolname: { equals: schoolname, mode: "insensitive" },
        municipality: { equals: municipality, mode: "insensitive" },
      },
    });

    if (existingSchool) {
      return NextResponse.json(
        { success: false, message: "A school with this name already exists in this municipality" },
        { status: 400 }
      );
    }

    // Generate a unique school ID
    const schoolIdNumber = await prisma.school.count() + 1;
    const generatedSchoolId = `SCH-${schoolIdNumber.toString().padStart(6, '0')}`;

    const school = await prisma.school.create({
      data: {
        schoolId: generatedSchoolId,
        schoolname,
        schooltype,
        municipality,
        congressionalDistrict: parseInt(congressionalDistrict),
        zone,
      },
    });

    return NextResponse.json({
      success: true,
      data: school,
    });
  } catch (error) {
    console.error("Error creating school:", error);
    return NextResponse.json(
      { success: false, message: "Failed to create school" },
      { status: 500 }
    );
  }
}

// GET /api/schools/municipalities - Get unique municipalities
export async function OPTIONS() {
  // This is a workaround to get municipalities list
  // In production, you might want a separate endpoint
  return NextResponse.json({ success: true });
}
