import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET /api/history - Get completed issuances
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    // Pagination
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const skip = (page - 1) * limit;
    
    // Filters
    const schoolId = searchParams.get('schoolId');
    const materialId = searchParams.get('materialId');
    const search = searchParams.get('search');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    // Build where clause
    const where: Record<string, unknown> = {};

    if (schoolId) {
      where.schoolId = schoolId;
    }

    if (materialId) {
      where.materialId = materialId;
    }

    if (startDate || endDate) {
      where.deliveredAt = {};
      if (startDate) {
        (where.deliveredAt as Record<string, Date>).gte = new Date(startDate);
      }
      if (endDate) {
        (where.deliveredAt as Record<string, Date>).lte = new Date(endDate);
      }
    }

    if (search) {
      where.OR = [
        { material: { title: { contains: search, mode: 'insensitive' } } },
        { school: { schoolname: { contains: search, mode: 'insensitive' } } },
        { remarks: { contains: search, mode: 'insensitive' } },
      ];
    }

    // Get completed issuances with pagination
    const [completedIssuances, total] = await Promise.all([
      prisma.completedIssuance.findMany({
        where,
        include: {
          material: {
            select: {
              id: true,
              title: true,
              gradeLevel: true,
              educationStage: true,
              subject: {
                select: {
                  name: true,
                },
              },
            },
          },
          school: {
            select: {
              id: true,
              schoolname: true,
              municipality: true,
              congressionalDistrict: true,
            },
          },
        },
        orderBy: { deliveredAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.completedIssuance.count({ where }),
    ]);

    // Transform data to match frontend expectations
    const transformedData = completedIssuances.map((item) => ({
      ...item,
      school: {
        ...item.school,
        name: item.school.schoolname,
      },
    }));

    return NextResponse.json({
      success: true,
      data: {
        completedIssuances: transformedData,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      },
    });
  } catch (error) {
    console.error('Failed to fetch completed issuances:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch completed issuances' },
      { status: 500 }
    );
  }
}
