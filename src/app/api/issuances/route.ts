import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

type TransactionClient = Parameters<Parameters<typeof prisma.$transaction>[0]>[0];

// GET /api/issuances - Get all issuances with filters
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status"); // "pending" or "completed"
    const schoolId = searchParams.get("schoolId");
    const materialId = searchParams.get("materialId");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const skip = (page - 1) * limit;

    // Build where clause
    const where: {
      schoolId?: string;
      materialId?: string;
      completedIssuance?: { is: null } | { isNot: null };
    } = {};

    if (schoolId) {
      where.schoolId = schoolId;
    }
    if (materialId) {
      where.materialId = materialId;
    }
    // Handle status filter (case-insensitive)
    const statusLower = status?.toLowerCase();
    if (statusLower === "pending") {
      where.completedIssuance = { is: null };
    } else if (statusLower === "completed") {
      where.completedIssuance = { isNot: null };
    }

    // Get issuances with pagination
    const [issuances, total] = await Promise.all([
      prisma.issuance.findMany({
        where,
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
        orderBy: { issuedAt: "desc" },
        skip,
        take: limit,
      }),
      prisma.issuance.count({ where }),
    ]);

    // Transform data to match frontend expectations (school.name, status, dateIssued)
    const transformedIssuances = issuances.map((issuance) => ({
      ...issuance,
      status: issuance.completedIssuance ? 'COMPLETED' : 'PENDING',
      dateIssued: issuance.issuedAt,
      school: {
        ...issuance.school,
        name: issuance.school.schoolname,
      },
    }));

    return NextResponse.json({
      success: true,
      data: {
        issuances: transformedIssuances,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      },
    });
  } catch (error) {
    console.error("Error fetching issuances:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch issuances" },
      { status: 500 }
    );
  }
}

// POST /api/issuances - Create a new issuance
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { materialId, schoolId, userId, quantity, remarks } = body;

    // Validation
    if (!materialId || !schoolId || !userId || !quantity) {
      return NextResponse.json(
        {
          success: false,
          message: "Material, school, user, and quantity are required",
        },
        { status: 400 }
      );
    }

    if (quantity <= 0) {
      return NextResponse.json(
        { success: false, message: "Quantity must be greater than 0" },
        { status: 400 }
      );
    }

    // Check if material exists and has enough quantity
    const material = await prisma.material.findUnique({
      where: { id: materialId },
    });

    if (!material) {
      return NextResponse.json(
        { success: false, message: "Material not found" },
        { status: 404 }
      );
    }

    if (material.quantity < quantity) {
      return NextResponse.json(
        {
          success: false,
          message: `Insufficient stock. Available: ${material.quantity}, Requested: ${quantity}`,
        },
        { status: 400 }
      );
    }

    // Check if school exists
    const school = await prisma.school.findUnique({
      where: { id: schoolId },
    });

    if (!school) {
      return NextResponse.json(
        { success: false, message: "School not found" },
        { status: 404 }
      );
    }

    // Create issuance and deduct quantity in a transaction
    const issuance = await prisma.$transaction(async (tx: TransactionClient) => {
      // Deduct quantity from material
      await tx.material.update({
        where: { id: materialId },
        data: { quantity: { decrement: quantity } },
      });

      // Create issuance
      return tx.issuance.create({
        data: {
          materialId,
          schoolId,
          userId,
          quantity,
          remarks,
        },
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
      });
    });

    // Transform school data for frontend and add status
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
    console.error("Error creating issuance:", error);
    return NextResponse.json(
      { success: false, message: "Failed to create issuance" },
      { status: 500 }
    );
  }
}
