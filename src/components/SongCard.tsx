// src/components/SongCard.tsx

import Link from 'next/link';

// --- Komponen Ikon (didefinisikan di sini agar mandiri) ---
const HeartIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 text-red-500">
    <path d="m11.645 20.91-1.07-1.07-8.245-8.246a5.5 5.5 0 0 1 7.778-7.778l1.06 1.061 1.06-1.061a5.5 5.5 0 0 1 7.778 7.778l-8.245 8.246-1.07 1.07Z" />
  </svg>
);

const EyeIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 text-gray-400">
    <path d="M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z" />
    <path fillRule="evenodd" d="M1.323 11.447C2.811 6.976 7.028 3.75 12.001 3.75c4.97 0 9.185 3.223 10.675 7.69.12.362.12.752 0 1.113C21.182 17.024 16.97 20.25 12.001 20.25c-4.97 0-9.185-3.223-10.675-7.69a.75.75 0 0 1 0-1.113ZM17.25 12a5.25 5.25 0 1 1-10.5 0 5.25 5.25 0 0 1 10.5 0Z" clipRule="evenodd" />
  </svg>
);

const SearchIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 text-blue-400">
    <path fillRule="evenodd" d="M10.5 3.75a6.75 6.75 0 1 0 0 13.5 6.75 6.75 0 0 0 0-13.5ZM2.25 10.5a8.25 8.25 0 1 1 14.59 5.28l4.69 4.69a.75.75 0 1 1-1.06 1.06l-4.69-4.69A8.25 8.25 0 0 1 2.25 10.5Z" clipRule="evenodd" />
  </svg>
);

// --- Definisikan props untuk SongCard ---
interface SongCardProps {
  song: any; // Sebaiknya ganti 'any' dengan tipe SongWithTags Anda
  totalSearchClicks: number;
}

export default function SongCard({ song, totalSearchClicks }: SongCardProps) {
  return (
    <Link 
      href={`/songs/${song.id}`} 
      className="group block bg-gray-900/50 border border-gray-800 p-4 rounded-lg shadow-lg hover:border-blue-500 hover:shadow-blue-500/20 transition-all duration-300"
    >
      <h3 className="font-bold text-lg text-white truncate group-hover:text-blue-400 transition-colors">
        {song.title}
      </h3>
      <p className="text-sm text-gray-400 truncate mb-4">
        {song.tags.map((tag: any) => tag.name).join(', ')}
      </p>

      {/* --- Bagian Statistik --- */}
      <div className="flex items-center justify-start gap-x-5 text-sm text-gray-300">
        {/* Like Count */}
        <div className="flex items-center gap-1.5">
          <HeartIcon />
          <span>{song.likeCount}</span>
        </div>

        {/* View Count */}
        <div className="flex items-center gap-1.5">
          <EyeIcon />
          <span>{song.viewCount}</span>
        </div>

        {/* --- STATISTIK BARU KITA --- */}
        {/* Tampilkan hanya jika jumlah klik lebih dari 0 */}
        {totalSearchClicks > 0 && (
          <div className="flex items-center gap-1.5">
            <SearchIcon />
            <span>{totalSearchClicks}</span>
          </div>
        )}
      </div>
    </Link>
  );
}
