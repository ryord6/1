// src/components/SearchOverlay.tsx

"use client";

// 1. Import useRef
import { useState, useEffect, FormEvent, useRef } from 'react';
import { useRouter } from 'next/navigation';
import SongCard from '@/components/SongCard';
import RecentSearchesList from '@/components/RecentSearchesList';

type PopularSong = any;
type SearchHistoryItem = { id: string; query: string };

interface SearchOverlayProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function SearchOverlay({ isOpen, onClose }: SearchOverlayProps) {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [popularSongs, setPopularSongs] = useState<PopularSong[]>([]);
  const [recentSearches, setRecentSearches] = useState<SearchHistoryItem[]>([]);
  const [isPopularLoading, setIsPopularLoading] = useState(true);
  const [isRecentLoading, setIsRecentLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 2. Buat sebuah ref untuk elemen input
  const inputRef = useRef<HTMLInputElement>(null);

  // (Fungsi-fungsi fetch, handleSearch, dan handleDeleteHistory tidak ada perubahan)
  const fetchPopularSongs = async () => {
    setIsPopularLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/songs/popular');
      if (!res.ok) throw new Error('Failed to fetch popular songs');
      const data = await res.json();
      setPopularSongs(data);
    } catch (e: any) { 
      console.error(e);
      setError(e.message);
    } finally {
      setIsPopularLoading(false);
    }
  };
  
  const fetchRecentSearches = async () => {
    setIsRecentLoading(true);
    try {
      const res = await fetch('/api/search-history');
      if (!res.ok) throw new Error('Failed to fetch recent searches');
      const { recent: allRecent } = await res.json();
      const hiddenIdsString = localStorage.getItem('hiddenSearchIds');
      const hiddenIds = hiddenIdsString ? JSON.parse(hiddenIdsString) : [];
      const visibleSearches = allRecent.filter((item: SearchHistoryItem) => !hiddenIds.includes(item.id));
      setRecentSearches(visibleSearches);
    } catch (e: any) {
      console.error(e);
    } finally {
      setIsRecentLoading(false);
    }
  };

  const handleSearch = (e: FormEvent) => {
    e.preventDefault();
    const trimmedQuery = query.trim();
    if (!trimmedQuery) return;
    router.push(`/search?q=${encodeURIComponent(trimmedQuery)}`);
    onClose();
  };
  
  const handleDeleteHistory = (id: string) => {
    setRecentSearches(prev => prev.filter(item => item.id !== id));
    const hiddenIdsString = localStorage.getItem('hiddenSearchIds');
    const hiddenIds = hiddenIdsString ? JSON.parse(hiddenIdsString) : [];
    if (!hiddenIds.includes(id)) {
      localStorage.setItem('hiddenSearchIds', JSON.stringify([...hiddenIds, id]));
    }
  };

  // 3. Gunakan useEffect untuk fokus ke input saat komponen dibuka
  useEffect(() => {
    if (isOpen) {
      fetchPopularSongs();
      fetchRecentSearches();
      setQuery('');

      // Beri sedikit jeda agar transisi selesai sebelum fokus
      const timer = setTimeout(() => {
        inputRef.current?.focus();
      }, 100);

      // Membersihkan timer
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  const panelTransformClass = isOpen ? 'translate-x-0' : 'translate-x-full';

  return (
    <div
      className={`fixed inset-0 z-50 transition-colors duration-300 ease-in-out ${isOpen ? 'bg-black/30' : 'bg-transparent pointer-events-none'}`}
      onClick={onClose}
      aria-hidden={!isOpen}
    >
      <div
        className={`absolute top-0 right-0 h-full w-4/5 bg-white shadow-xl transform transition-transform duration-300 ease-in-out ${panelTransformClass}`}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
      >
        <header className="flex items-center p-2 border-b">
          <button type="button" onClick={onClose} className="p-2 text-2xl">&larr;</button>
          <form onSubmit={handleSearch} className="flex-grow flex">
            <input
              ref={inputRef} // Pasang ref di sini
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search..."
              className="flex-grow p-2 mx-2 bg-gray-100 rounded-md focus:outline-none"
              // autoFocus dihapus karena sudah ditangani useEffect
            />
            <button type="submit" className="p-2 text-2xl">&rarr;</button>
          </form>
        </header>
        
        <div className="p-4 overflow-y-auto h-[calc(100vh-60px)]">
          {error && <p className="text-red-500 bg-red-100 p-3 rounded-md mb-4">{error}</p>}
          
          <RecentSearchesList 
            searches={recentSearches}
            isLoading={isRecentLoading}
            onQuerySelect={(q) => setQuery(q)}
            onDeleteHistory={handleDeleteHistory}
          />

          <section>
            <h2 className="text-lg font-semibold mb-2">Most Wanted Search</h2>
            {isPopularLoading ? (
              <p className="text-gray-500">Loading popular songs...</p>
            ) : popularSongs.length > 0 ? (
              <div className="space-y-4">
                {popularSongs.map(song => (
                  <div key={song.id} onClick={onClose}>
                    <SongCard
                      song={song}
                      totalSearchClicks={song.totalSearchClicks}
                    />
                  </div>
                ))}
              </div>
            ) : (
               <p className="text-gray-500">No popular songs found.</p>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}