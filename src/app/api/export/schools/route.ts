import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

interface SchoolExport {
  schoolId: string;
  schoolname: string;
  schooltype: string;
  municipality: string;
  congressionalDistrict: number;
  zone: string | null;
}

// GET /api/export/schools - Export schools as CSV
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');
    const municipality = searchParams.get('municipality');
    const congressionalDistrict = searchParams.get('congressionalDistrict');

    // Build where clause
    const where: Record<string, unknown> = {};
    if (type) where.schooltype = type;
    if (municipality) where.municipality = municipality;
    if (congressionalDistrict) where.congressionalDistrict = parseInt(congressionalDistrict);

    // Get all schools
    const schools: SchoolExport[] = await prisma.school.findMany({
      where,
      orderBy: [
        { congressionalDistrict: 'asc' },
        { municipality: 'asc' },
        { schoolname: 'asc' },
      ],
    });

    // Create CSV content
    const headers = ['School ID', 'Name', 'Type', 'Municipality', 'Congressional District', 'Zone'];
    const rows = schools.map((s: SchoolExport) => [
      s.schoolId,
      `"${s.schoolname.replace(/"/g, '""')}"`,
      s.schooltype,
      `"${s.municipality}"`,
      s.congressionalDistrict.toString(),
      s.zone || '',
    ]);

    const csv = [headers.join(','), ...rows.map((r: string[]) => r.join(','))].join('\n');

    // Return CSV file
    return new NextResponse(csv, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': `attachment; filename="schools-${new Date().toISOString().split('T')[0]}.csv"`,
      },
    });
  } catch (error) {
    console.error('Failed to export schools:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to export schools' },
      { status: 500 }
    );
  }
}
