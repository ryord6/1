import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Anda harus login untuk menyukai lagu ini.' }, { status: 401 });
  }

  // --- PERBAIKAN DI SINI ---
  // Secara eksplisit "menunggu" params untuk diselesaikan
  const resolvedParams = await Promise.resolve(params);
  const songId = resolvedParams.id;
  // -------------------------

  const userId = session.user.id;

  if (!songId) {
    return NextResponse.json({ error: 'Song ID tidak ditemukan.' }, { status: 400 });
  }

  try {
    const existingLike = await prisma.like.findUnique({
      where: {
        songId_userId: {
          songId: songId,
          userId: userId,
        },
      },
    });

    if (existingLike) {
      await prisma.$transaction([
        prisma.like.delete({
          where: { id: existingLike.id },
        }),
        prisma.song.update({
          where: { id: songId },
          data: { likeCount: { decrement: 1 } },
        }),
      ]);
      return NextResponse.json({ message: 'Batal menyukai berhasil', liked: false });
    } else {
      await prisma.$transaction([
        prisma.like.create({
          data: {
            songId: songId,
            userId: userId,
          },
        }),
        prisma.song.update({
          where: { id: songId },
          data: { likeCount: { increment: 1 } },
        }),
      ]);
      return NextResponse.json({ message: 'Berhasil menyukai', liked: true });
    }
  } catch (error) {
    console.error("Error saat memproses like/unlike:", error);
    return NextResponse.json({ error: 'Terjadi kesalahan pada server.' }, { status: 500 });
  }
}