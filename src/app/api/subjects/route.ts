import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET /api/subjects - Get all subjects
export async function GET() {
  try {
    const subjects = await prisma.subject.findMany({
      orderBy: [
        { educationStage: "asc" },
        { name: "asc" },
      ],
      include: {
        _count: {
          select: { materials: true },
        },
      },
    });

    return NextResponse.json({
      success: true,
      data: subjects,
    });
  } catch (error) {
    console.error("Error fetching subjects:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch subjects" },
      { status: 500 }
    );
  }
}

// POST /api/subjects - Create a new subject
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, category, strand, educationStage } = body;

    if (!name || !educationStage) {
      return NextResponse.json(
        { success: false, message: "Name and education stage are required" },
        { status: 400 }
      );
    }

    const subject = await prisma.subject.create({
      data: {
        name,
        category,
        strand,
        educationStage,
      },
    });

    return NextResponse.json({
      success: true,
      data: subject,
    });
  } catch (error) {
    console.error("Error creating subject:", error);
    return NextResponse.json(
      { success: false, message: "Failed to create subject" },
      { status: 500 }
    );
  }
}
