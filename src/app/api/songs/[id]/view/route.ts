import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// --- TAMBAHKAN BARIS INI ---
export const dynamic = 'force-dynamic';

// Gunakan pola ini untuk menghindari error 'params should be awaited'
export async function POST(
  request: Request,
  context: { params: { id: string } } 
) {
  try {
    // Await params before destructuring
    const resolvedParams = await Promise.resolve(context.params);
    const { id } = resolvedParams;

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