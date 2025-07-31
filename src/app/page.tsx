// src/app/page.tsx

import { PrismaClient } from '@prisma/client';
import SongCard from '@/components/SongCard'; 

const prisma = new PrismaClient();

// Tipe data untuk mempermudah
type SongWithTags = Awaited<ReturnType<typeof getSongs>>[0];

// Fungsi untuk mengambil data lagu berdasarkan urutan tertentu
async function getSongs(orderBy: any, take: number) {
  return prisma.song.findMany({
    orderBy,
    take,
    include: { tags: true },
  });
}

// --- FUNGSI BARU UNTUK MENGAMBIL MOST WANTED ---
// Fungsi ini mengambil lagu berdasarkan total klik pencarian
async function getMostWantedSongs(take: number): Promise<SongWithTags[]> {
  // 1. Agregasi untuk menemukan songId dengan jumlah klik terbanyak
  const topSearchClicks = await prisma.searchClick.groupBy({
    by: ['songId'],
    _sum: {
      clickCount: true,
    },
    orderBy: {
      _sum: {
        clickCount: 'desc',
      },
    },
    take,
  });

  if (topSearchClicks.length === 0) {
    return [];
  }

  // 2. Ambil ID lagu dari hasil agregasi
  const songIds = topSearchClicks.map(item => item.songId);

  // 3. Ambil detail lengkap dari lagu-lagu tersebut
  const songs = await prisma.song.findMany({
    where: {
      id: { in: songIds },
    },
    include: {
      tags: true,
    },
  });

  // 4. Urutkan kembali hasil lagu sesuai urutan klik terbanyak
  const songMap = new Map(songs.map(song => [song.id, song]));
  const sortedSongs = topSearchClicks.map(item => songMap.get(item.songId)).filter(Boolean) as SongWithTags[];

  return sortedSongs;
}


export default async function HomePage() {
  // 1. Ambil semua data lagu untuk setiap seksi secara paralel
  //    Tambahkan getMostWantedSongs ke dalam Promise.all
  const [newReleases, mostPopular, mostViral, mostWanted] = await Promise.all([
    getSongs({ createdAt: 'desc' }, 4),
    getSongs({ likeCount: 'desc' }, 4),
    getSongs({ viewCount: 'desc' }, 4),
    getMostWantedSongs(4), // Panggil fungsi baru kita
  ]);

  // 2. Kumpulkan semua ID lagu yang akan ditampilkan
  const allSongIds = [
    ...newReleases.map(s => s.id),
    ...mostPopular.map(s => s.id),
    ...mostViral.map(s => s.id),
    ...mostWanted.map(s => s.id), // Tambahkan ID dari mostWanted
  ];
  const uniqueSongIds = [...new Set(allSongIds)];

  // 3. Lakukan SATU query agregasi untuk mendapatkan total Search Clicks
  let searchClickCounts: { [songId: string]: number } = {};
  if (uniqueSongIds.length > 0) {
    const clickAggregates = await prisma.searchClick.groupBy({
      by: ['songId'],
      where: { songId: { in: uniqueSongIds } },
      _sum: { clickCount: true },
    });

    clickAggregates.forEach(agg => {
      if (agg.songId && agg._sum.clickCount) {
        searchClickCounts[agg.songId] = agg._sum.clickCount;
      }
    });
  }

  // Helper function untuk me-render seksi lagu (tidak ada perubahan)
  const renderSongSection = (title: string, songs: SongWithTags[]) => (
    <section className="mb-12">
      <h2 className="text-2xl font-bold text-white border-b-2 border-blue-500 pb-2 mb-4">{title}</h2>
      {songs.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {songs.map(song => (
            <SongCard
              key={`${title}-${song.id}`}
              song={song}
              totalSearchClicks={searchClickCounts[song.id] || 0}
            />
          ))}
        </div>
      ) : (
        <p className="text-gray-400">No songs found in this category.</p>
      )}
    </section>
  );

  return (
    <main className="container mx-auto p-4 md:p-8">
      <div className="text-center mb-12">
        <h1 className="text-5xl font-extrabold text-white">Karaokei Web App</h1>
        <p className="text-lg text-gray-400 mt-2">Your favorite songs, ready to sing.</p>
      </div>
      
      {renderSongSection("New Releases", newReleases)}
      {renderSongSection("Most Popular", mostPopular)}
      {renderSongSection("Most Viral", mostViral)}
      
      {/* --- SEKSI BARU DITAMBAHKAN DI SINI --- */}
      {renderSongSection("Most Wanted Search", mostWanted)}
    </main>
  );
}