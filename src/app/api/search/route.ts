import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Handler untuk pencarian (GET /api/search?q=...)
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const q = searchParams.get('q');

    // Jika parameter query 'q' tidak ada atau kosong, kembalikan error.
    if (!q) {
      return NextResponse.json({ error: 'Search query "q" is required' }, { status: 400 });
    }

    // Ini adalah query Prisma yang powerful.
    // Kita mencari lagu di mana (OR):
    // 1. Judulnya (title) mengandung string query 'q' (case-insensitive).
    // 2. ATAU, beberapa (some) dari tag yang terhubung dengannya memiliki nama (name)
    //    yang mengandung string query 'q' (case-insensitive).
    const songs = await prisma.song.findMany({
      where: {
        OR: [
          {
            title: {
              contains: q,
            },
          },
          {
            tags: {
              some: {
                name: {
                  contains: q,
                },
              },
            },
          },
        ],
      },
      // Sertakan juga data tag dalam hasil pencarian
      include: {
        tags: true,
      },
      // Kita bisa urutkan berdasarkan relevansi (misal: yang paling banyak like)
      orderBy: {
        likeCount: 'desc',
      },
    });

    return NextResponse.json(songs);
  } catch (error) {
    console.error("Error during search:", error);
    return NextResponse.json({ error: 'Failed to perform search' }, { status: 500 });
  }
}
