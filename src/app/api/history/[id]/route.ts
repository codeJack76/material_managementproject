import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET /api/history/[id] - Get single completed issuance
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const completedIssuance = await prisma.completedIssuance.findUnique({
      where: { id },
      include: {
        material: {
          include: {
            subject: true,
          },
        },
        school: true,
      },
    });

    if (!completedIssuance) {
      return NextResponse.json(
        { success: false, message: 'Completed issuance not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: completedIssuance,
    });
  } catch (error) {
    console.error('Failed to fetch completed issuance:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch completed issuance' },
      { status: 500 }
    );
  }
}

// DELETE /api/history/[id] - Delete a completed issuance record
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const completedIssuance = await prisma.completedIssuance.findUnique({
      where: { id },
    });

    if (!completedIssuance) {
      return NextResponse.json(
        { success: false, message: 'Completed issuance not found' },
        { status: 404 }
      );
    }

    await prisma.completedIssuance.delete({
      where: { id },
    });

    return NextResponse.json({
      success: true,
      message: 'Completed issuance deleted successfully',
    });
  } catch (error) {
    console.error('Failed to delete completed issuance:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to delete completed issuance' },
      { status: 500 }
    );
  }
}
