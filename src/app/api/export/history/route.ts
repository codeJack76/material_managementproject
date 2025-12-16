import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

interface CompletedIssuanceExport {
  id: string;
  quantity: number;
  dateIssued: Date;
  deliveredAt: Date;
  remarks: string | null;
  material: {
    title: string;
    gradeLevel: string;
    educationStage: string;
    subject: {
      name: string;
    };
  };
  school: {
    schoolname: string;
    municipality: string;
    congressionalDistrict: number;
  };
}

// GET /api/export/history - Export completed issuances as CSV
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const schoolId = searchParams.get('schoolId');
    const materialId = searchParams.get('materialId');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    // Build where clause
    const where: Record<string, unknown> = {};
    if (schoolId) where.schoolId = schoolId;
    if (materialId) where.materialId = materialId;
    
    if (startDate || endDate) {
      where.deliveredAt = {};
      if (startDate) {
        (where.deliveredAt as Record<string, Date>).gte = new Date(startDate);
      }
      if (endDate) {
        (where.deliveredAt as Record<string, Date>).lte = new Date(endDate);
      }
    }

    // Get all completed issuances
    const completedIssuances: CompletedIssuanceExport[] = await prisma.completedIssuance.findMany({
      where,
      include: {
        material: {
          include: {
            subject: { select: { name: true } },
          },
        },
        school: true,
      },
      orderBy: { deliveredAt: 'desc' },
    });

    // Create CSV content
    const headers = [
      'Material',
      'Subject',
      'Grade Level',
      'Education Stage',
      'School',
      'Municipality',
      'Congressional District',
      'Quantity',
      'Date Issued',
      'Date Delivered',
      'Remarks',
    ];

    const rows = completedIssuances.map((c: CompletedIssuanceExport) => [
      `"${c.material.title.replace(/"/g, '""')}"`,
      `"${c.material.subject.name}"`,
      c.material.gradeLevel,
      c.material.educationStage,
      `"${c.school.schoolname.replace(/"/g, '""')}"`,
      `"${c.school.municipality}"`,
      c.school.congressionalDistrict.toString(),
      c.quantity.toString(),
      new Date(c.dateIssued).toLocaleDateString(),
      new Date(c.deliveredAt).toLocaleDateString(),
      `"${(c.remarks || '').replace(/"/g, '""')}"`,
    ]);

    const csv = [headers.join(','), ...rows.map((r: string[]) => r.join(','))].join('\n');

    // Return CSV file
    return new NextResponse(csv, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': `attachment; filename="delivery-history-${new Date().toISOString().split('T')[0]}.csv"`,
      },
    });
  } catch (error) {
    console.error('Failed to export history:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to export history' },
      { status: 500 }
    );
  }
}
