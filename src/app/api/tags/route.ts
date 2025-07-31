import { NextResponse } from 'next/server';
import { PrismaClient, TagType } from '@prisma/client';

// Inisialisasi Prisma Client di luar handler agar bisa di-reuse
// Ini adalah praktik terbaik untuk menghindari pembuatan koneksi baru di setiap request
const prisma = new PrismaClient();

/**
 * Handler untuk membuat Tag baru (POST /api/tags)
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    // Kita gunakan destructuring untuk mengambil data dari body request
    const { name, slug, type, parentId } = body;

    // Validasi input dasar
    if (!name || !slug || !type) {
      return NextResponse.json({ error: 'Name, slug, and type are required' }, { status: 400 });
    }

    // Validasi apakah 'type' adalah nilai yang valid dari enum TagType
    if (!Object.values(TagType).includes(type)) {
      return NextResponse.json({ error: 'Invalid tag type' }, { status: 400 });
    }

    const newTag = await prisma.tag.create({
      data: {
        name,
        slug,
        type,
        parentId, // Jika parentId tidak ada, Prisma akan mengabaikannya
      },
    });

    // Mengembalikan data tag yang baru dibuat dengan status 201 (Created)
    return NextResponse.json(newTag, { status: 201 });
  } catch (error: any) {
    console.error("Error creating tag:", error);
    // Memberikan pesan error yang lebih spesifik jika terjadi duplikasi slug
    if (error.code === 'P2002' && error.meta?.target?.includes('slug')) {
         return NextResponse.json({ error: 'Slug already exists' }, { status: 409 });
    }
    return NextResponse.json({ error: 'Failed to create tag' }, { status: 500 });
  }
}

/**
 * Handler untuk mengambil semua Tags (GET /api/tags)
 */
export async function GET() {
  try {
    const tags = await prisma.tag.findMany({
      // Mengurutkan berdasarkan nama secara alfabetis
      orderBy: {
        name: 'asc'
      }
    });
    return NextResponse.json(tags);
  } catch (error) {
    console.error("Error fetching tags:", error);
    return NextResponse.json({ error: 'Failed to fetch tags' }, { status: 500 });
  }
}
