import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Handler untuk membuat Song baru (POST /api/songs)
 * Ini akan menghubungkan lagu baru dengan Tag yang sudah ada.
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { title, videoUrl, lyrics, tagIds } = body;

    // Validasi input dasar
    if (!title || !videoUrl || !tagIds || !Array.isArray(tagIds)) {
      return NextResponse.json({ error: 'Title, videoUrl, and an array of tagIds are required' }, { status: 400 });
    }
    
    // Ini adalah bagian penting: kita menggunakan 'connect' untuk membuat relasi many-to-many
    // Prisma akan secara otomatis membuat entri di tabel join penghubung.
    const newSong = await prisma.song.create({
      data: {
        title,
        videoUrl,
        lyrics,
        tags: {
          connect: tagIds.map((id: string) => ({ id })),
        },
      },
      // Kita sertakan data tags yang terhubung dalam respons
      include: {
        tags: true, 
      }
    });

    return NextResponse.json(newSong, { status: 201 });
  } catch (error) {
    console.error("Error creating song:", error);
    return NextResponse.json({ error: 'Failed to create song' }, { status: 500 });
  }
}

/**
 * Handler untuk mengambil semua Songs (GET /api/songs)
 * Nantinya, di sini kita bisa menambahkan query params untuk sorting, filtering, dan pagination.
 * Contoh: /api/songs?sortBy=popular&genre=pop
 */
export async function GET() {
  try {
    const songs = await prisma.song.findMany({
      // Mengurutkan berdasarkan yang terbaru dulu
      orderBy: {
        createdAt: 'desc',
      },
      // Selalu sertakan data tags yang terhubung
      include: {
        tags: true,
      },
    });
    return NextResponse.json(songs);
  } catch (error) {
    console.error("Error fetching songs:", error);
    return NextResponse.json({ error: 'Failed to fetch songs' }, { status: 500 });
  }
}
