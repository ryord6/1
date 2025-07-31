import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Handler untuk menghapus satu item riwayat pencarian (DELETE /api/search-history/[id])
 */
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    await prisma.searchQuery.delete({
      where: { id: id },
    });

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error("Error deleting search history item:", error);
    // Memberikan error spesifik jika item tidak ditemukan
    if (error instanceof Error && 'code' in error && error.code === 'P2025') {
       return NextResponse.json({ error: 'Item not found' }, { status: 404 });
    }
    return NextResponse.json({ error: 'Failed to delete search history item' }, { status: 500 });
  }
}
