import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Handler untuk mengambil lagu-lagu paling viral (GET /api/songs/viral)
 */
export async function GET() {
  try {
    const viralSongs = await prisma.song.findMany({
      // Mengurutkan berdasarkan jumlah 'view', yang terbanyak di atas
      orderBy: {
        viewCount: 'desc',
      },
      // Mengambil hanya 10 lagu teratas
      take: 10,
      // Menyertakan data tags
      include: {
        tags: true,
      },
    });

    return NextResponse.json(viralSongs);
  } catch (error) {
    console.error("Error fetching viral songs:", error);
    return NextResponse.json({ error: 'Failed to fetch viral songs' }, { status: 500 });
  }
}
