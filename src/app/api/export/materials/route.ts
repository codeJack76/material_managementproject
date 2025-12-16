import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

interface MaterialWithSubject {
  id: string;
  title: string;
  gradeLevel: string;
  educationStage: string;
  quantity: number;
  createdAt: Date;
  subject: {
    name: string;
  };
}

// GET /api/export/materials - Export materials as CSV
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const educationStage = searchParams.get('educationStage');
    const subjectId = searchParams.get('subjectId');

    // Build where clause
    const where: Record<string, unknown> = {};
    if (educationStage) where.educationStage = educationStage;
    if (subjectId) where.subjectId = subjectId;

    // Get all materials
    const materials: MaterialWithSubject[] = await prisma.material.findMany({
      where,
      include: {
        subject: {
          select: { name: true },
        },
      },
      orderBy: [
        { educationStage: 'asc' },
        { gradeLevel: 'asc' },
        { title: 'asc' },
      ],
    });

    // Create CSV content
    const headers = ['Title', 'Subject', 'Grade Level', 'Education Stage', 'Quantity', 'Created At'];
    const rows = materials.map((m: MaterialWithSubject) => [
      `"${m.title.replace(/"/g, '""')}"`,
      `"${m.subject.name}"`,
      m.gradeLevel,
      m.educationStage,
      m.quantity.toString(),
      new Date(m.createdAt).toLocaleDateString(),
    ]);

    const csv = [headers.join(','), ...rows.map((r: string[]) => r.join(','))].join('\n');

    // Return CSV file
    return new NextResponse(csv, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': `attachment; filename="materials-${new Date().toISOString().split('T')[0]}.csv"`,
      },
    });
  } catch (error) {
    console.error('Failed to export materials:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to export materials' },
      { status: 500 }
    );
  }
}
