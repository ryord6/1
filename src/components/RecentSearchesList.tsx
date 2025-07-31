// src/components/RecentSearchesList.tsx

"use client";

// Tidak perlu lagi useState dan useEffect di sini
// import { useState, useEffect } from 'react';

type SearchHistoryItem = { id: string; query: string };

interface RecentSearchesListProps {
  // Terima daftar pencarian sebagai prop
  searches: SearchHistoryItem[];
  // Terima loading state dari parent
  isLoading: boolean;
  // Fungsi untuk memilih query dari riwayat
  onQuerySelect: (query: string) => void;
  // Fungsi untuk menghapus item riwayat (akan dikelola oleh parent)
  onDeleteHistory: (id:string) => void;
}

export default function RecentSearchesList({ searches, isLoading, onQuerySelect, onDeleteHistory }: RecentSearchesListProps) {

  if (isLoading) {
    return <p className="text-gray-500">Loading recent searches...</p>;
  }

  return (
    <section className="mb-8">
      <h2 className="text-lg font-semibold mb-2">Recent Searches</h2>
      {searches.length > 0 ? (
        <ul>
          {searches.map(item => (
            <li key={item.id} className="flex justify-between items-center py-2 border-b">
              <button 
                type="button" 
                onClick={() => onQuerySelect(item.query)} 
                className="text-gray-700 text-left flex-grow hover:underline"
              >
                {item.query}
              </button>
              <button 
                type="button" 
                // Panggil fungsi onDeleteHistory dari props
                onClick={() => onDeleteHistory(item.id)} 
                className="text-gray-400 hover:text-red-500 font-bold ml-4 p-1"
              >
                X
              </button>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-gray-500">No recent searches.</p>
      )}
    </section>
  );
}