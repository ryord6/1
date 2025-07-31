import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Handler untuk mengambil lagu-lagu terbaru (GET /api/songs/recent)
 */
export async function GET() {
  try {
    const recentSongs = await prisma.song.findMany({
      // Mengurutkan berdasarkan tanggal pembuatan, yang terbaru di atas
      orderBy: {
        createdAt: 'desc',
      },
      // Mengambil hanya 10 lagu teratas untuk menjaga performa
      take: 10,
      // Menyertakan data tags yang terhubung
      include: {
        tags: true,
      },
    });

    return NextResponse.json(recentSongs);
  } catch (error) {
    console.error("Error fetching recent songs:", error);
    return NextResponse.json({ error: 'Failed to fetch recent songs' }, { status: 500 });
  }
}
