// src/app/api/search/click/route.ts

import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

// Inisialisasi Prisma Client di luar handler agar bisa di-reuse
// Ini adalah praktik terbaik untuk menghindari pembuatan koneksi baru di setiap request
const prisma = new PrismaClient();

/**
 * Handler untuk mencatat klik dari hasil pencarian (POST /api/search/click)
 * Endpoint ini akan menerima searchQuery dan songId dari frontend.
 */
export async function POST(request: Request) {
  try {
    // 1. Mengambil data dari body request yang dikirim oleh frontend
    const body = await request.json();
    const { searchQuery, songId } = body;

    // 2. Validasi input: Memastikan data yang diperlukan ada
    if (!searchQuery || !songId) {
      return NextResponse.json(
        { error: 'searchQuery and songId are required' },
        { status: 400 } // 400 Bad Request
      );
    }

    // 3. Cari atau Buat SearchQuery
    // Menggunakan 'upsert' untuk efisiensi:
    // - Jika 'query' sudah ada di tabel SearchQuery, Prisma akan mengambilnya.
    // - Jika belum ada, Prisma akan membuat entri baru.
    // Ini mencegah duplikasi kata kunci pencarian.
    const queryRecord = await prisma.searchQuery.upsert({
      where: { query: searchQuery },
      update: {}, // Tidak ada yang perlu di-update jika sudah ada
      create: { query: searchQuery },
    });

    // 4. Inti Logika: Cari atau Buat/Update SearchClick
    // 'upsert' di sini sangat powerful karena menggunakan constraint @@unique.
    await prisma.searchClick.upsert({
      // Prisma akan mencari baris yang cocok dengan kombinasi unik ini
      where: {
        searchQueryId_songId: {
          searchQueryId: queryRecord.id,
          songId: songId,
        },
      },
      // JIKA DITEMUKAN: Cukup tambah 'clickCount' sebanyak 1
      update: {
        clickCount: {
          increment: 1,
        },
      },
      // JIKA TIDAK DITEMUKAN: Buat baris baru
      create: {
        searchQueryId: queryRecord.id,
        songId: songId,
        clickCount: 1, // Nilai awal saat pertama kali dibuat
      },
    });

    // 5. Kirim respons sukses ke frontend
    return NextResponse.json({ success: true, message: 'Click tracked successfully' });

  } catch (error) {
    // Penanganan error jika terjadi masalah di server atau database
    console.error("Error tracking search click:", error);
    return NextResponse.json(
      { error: 'An internal error occurred while tracking the click' },
      { status: 500 } // 500 Internal Server Error
    );
  }
}
