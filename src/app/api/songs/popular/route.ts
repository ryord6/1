// src/app/api/songs/popular/route.ts

import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET() {
  try {
    // 1. Ambil kandidat lagu populer (misal: 20 lagu dengan 'like' terbanyak)
    // Ini untuk memastikan kita punya daftar yang relevan untuk diurutkan.
    const candidateSongs = await prisma.song.findMany({
      orderBy: {
        likeCount: 'desc',
      },
      take: 20, // Ambil lebih banyak kandidat untuk diurutkan
      include: {
        tags: true,
      },
    });

    if (candidateSongs.length === 0) {
      return NextResponse.json([]);
    }

    const songIds = candidateSongs.map(song => song.id);

    // 2. Hitung total Search Clicks untuk lagu-lagu kandidat tersebut
    const clickAggregates = await prisma.searchClick.groupBy({
      by: ['songId'],
      where: {
        songId: {
          in: songIds,
        },
      },
      _sum: {
        clickCount: true,
      },
    });

    const searchClickCounts = new Map<string, number>();
    clickAggregates.forEach(agg => {
      if (agg._sum.clickCount) {
        searchClickCounts.set(agg.songId, agg._sum.clickCount);
      }
    });

    // 3. Gabungkan data lagu dengan data jumlah klik
    let songsWithAllStats = candidateSongs.map(song => ({
      ...song,
      totalSearchClicks: searchClickCounts.get(song.id) || 0,
    }));

    // 4. --- INI LANGKAH KUNCI YANG BARU ---
    // Urutkan array hasil penggabungan berdasarkan totalSearchClicks (dari besar ke kecil)
    songsWithAllStats.sort((a, b) => b.totalSearchClicks - a.totalSearchClicks);

    // 5. Ambil 5 lagu teratas SETELAH diurutkan berdasarkan klik pencarian
    const finalTopSongs = songsWithAllStats.slice(0, 5);

    return NextResponse.json(finalTopSongs);

  } catch (error) {
    console.error("Error fetching sorted popular songs:", error);
    return NextResponse.json({ error: 'Failed to fetch popular songs' }, { status: 500 });
  }
}
