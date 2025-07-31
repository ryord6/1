import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Handler untuk mengambil riwayat pencarian (GET /api/search-history)
 * Sekarang akan mengembalikan DUA daftar: yang terbaru dan yang terpopuler.
 */
export async function GET() {
  try {
    // Mengambil data secara paralel untuk efisiensi maksimal
    const [recent, popular] = await Promise.all([
      // 1. Ambil 10 pencarian terbaru
      prisma.searchQuery.findMany({
        orderBy: {
          lastSearchedAt: 'desc',
        },
        take: 10,
      }),
      // 2. Ambil 10 pencarian terpopuler
      prisma.searchQuery.findMany({
        orderBy: {
          searchCount: 'desc',
        },
        take: 10,
      }),
    ]);
    
    // Kembalikan dalam satu objek
    return NextResponse.json({ recent, popular });

  } catch (error) {
    console.error("Error fetching search history:", error);
    return NextResponse.json({ error: 'Failed to fetch search history' }, { status: 500 });
  }
}

/**
 * Handler untuk mencatat query pencarian baru (POST /api/search-history)
 * Fungsi ini tidak berubah, tetapi kita tambahkan field lastSearchedAt secara eksplisit
 */
export async function POST(request: Request) {
  try {
    const { query } = await request.json();

    if (!query || typeof query !== 'string' || query.trim() === '') {
      return NextResponse.json({ error: 'Query is required' }, { status: 400 });
    }

    const trimmedQuery = query.trim().toLowerCase();

    await prisma.searchQuery.upsert({
      where: { query: trimmedQuery },
      update: {
        searchCount: {
          increment: 1,
        },
        // Pastikan tanggal terakhir dicari juga diperbarui
        lastSearchedAt: new Date(),
      },
      create: {
        query: trimmedQuery,
      },
    });

    return NextResponse.json({ success: true }, { status: 201 });
  } catch (error) {
    console.error("Error logging search query:", error);
    return NextResponse.json({ error: 'Failed to log search query' }, { status: 500 });
  }
}