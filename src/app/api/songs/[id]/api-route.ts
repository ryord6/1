// src/app/api/songs/[id]/view/route.ts

import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Handler untuk menaikkan viewCount sebuah lagu (POST /api/songs/[id]/view)
 */
// --- PERUBAHAN DI SINI ---
// Kita akan menamai argumen kedua 'context' dan mendefinisikan tipenya.
export async function POST(
  request: Request,
  context: { params: { id: string } } 
) {
  try {
    // Lalu kita ambil 'id' dari context.params di dalam fungsi
    const { id } = context.params;

    await prisma.song.update({
      where: {
        id: id,
      },
      data: {
        viewCount: {
          increment: 1,
        },
      },
    });

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error(`Error incrementing view count:`, error);
    return NextResponse.json({ error: 'Failed to update view count' }, { status: 500 });
  }
}