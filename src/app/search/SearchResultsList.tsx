// src/app/search/SearchResultsList.tsx

// Tandai sebagai Client Component
"use client";

import Link from 'next/link';
import { useRouter } from 'next/navigation';

// Impor tipe data Anda jika perlu
// import type { Song, Tag } from '@/types';
// type SongWithTags = Song & { tags: Tag[] };

// Definisikan tipe props yang akan diterima komponen ini
interface SearchResultsListProps {
  results: any[]; // Ganti 'any' dengan tipe SongWithTags Anda
  searchQuery: string;
}

export default function SearchResultsList({ results, searchQuery }: SearchResultsListProps) {
  const router = useRouter();

  // --- INILAH FUNGSI KUNCI UNTUK MELACAK KLIK ---
  const handleSongClick = async (songId: string) => {
    // Pastikan ada query pencarian sebelum melacak
    if (!searchQuery) {
      router.push(`/songs/${songId}`);
      return;
    }

    console.log(`Attempting to track click for songId: ${songId} with query: ${searchQuery}`);

    try {
      // Kirim data ke API endpoint di belakang layar
      // 'fetch' tidak akan memblokir navigasi pengguna
      fetch('/api/search/click', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ searchQuery: searchQuery, songId: songId }),
      });
    } catch (error) {
      // Jika tracking gagal, kita tetap tidak ingin mengganggu pengguna
      console.error("Background tracking failed:", error);
    } finally {
      // Apapun yang terjadi (berhasil atau gagal),
      // langsung arahkan pengguna ke halaman lagu.
      router.push(`/songs/${songId}`);
    }
  };

  // --- Komponen Kartu Lagu Internal ---
  const SongCard = ({ song }: { song: any }) => ( // Ganti 'any' dengan tipe SongWithTags
    // Kita ganti <Link> dengan <div> yang bisa diklik
    <div
      onClick={() => handleSongClick(song.id)}
      className="block border p-4 rounded-lg shadow-sm hover:shadow-md transition-shadow cursor-pointer"
    >
      <h3 className="font-bold text-lg">{song.title}</h3>
      <p className="text-sm text-gray-500 truncate">
        {song.tags.map((tag: any) => tag.name).join(', ')}
      </p>
    </div>
  );

  return (
    <div className="space-y-4">
      {results.map(song => <SongCard key={song.id} song={song} />)}
    </div>
  );
}
