// File: src/app/api/tags/[slug]/route.ts

import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Handler untuk mengambil satu Tag spesifik berdasarkan slug-nya
 * (GET /api/tags/[slug])
 */
export async function GET(
  request: Request,
  { params }: { params: { slug: string } }
) {
  try {
    const slug = params.slug; // Mengambil 'slug' dari URL

    const tag = await prisma.tag.findUnique({
      where: {
        slug: slug,
      },
      // Anda bisa menyertakan relasi jika perlu, misalnya lagu-lagu yang terkait
      // include: {
      //   songs: true,
      // }
    });

    // Jika tag dengan slug tersebut tidak ditemukan, kembalikan error 404
    if (!tag) {
      return NextResponse.json({ error: 'Tag not found' }, { status: 404 });
    }

    // Jika ditemukan, kembalikan data tag tersebut
    return NextResponse.json(tag);
  } catch (error) {
    console.error(`Error fetching tag with slug ${params.slug}:`, error);
    return NextResponse.json({ error: 'Failed to fetch tag' }, { status: 500 });
  }
}