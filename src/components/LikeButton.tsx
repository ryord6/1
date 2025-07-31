"use client";

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { HeartIcon, CheckIcon, XMarkIcon } from '@heroicons/react/24/solid'; // Menggunakan ikon solid & outline

// Definisikan props yang diterima, termasuk status like awal
interface LikeButtonProps {
  songId: string;
  initialLikeCount: number;
  isInitiallyLiked: boolean;
}

export default function LikeButton({ songId, initialLikeCount, isInitiallyLiked }: LikeButtonProps) {
  const { data: session, status } = useSession();
  const [likes, setLikes] = useState(initialLikeCount);
  const [isLiked, setIsLiked] = useState(isInitiallyLiked);
  const [isLiking, setIsLiking] = useState(false);
  
  // State baru untuk mengontrol popup konfirmasi
  const [showUnlikeConfirmation, setShowUnlikeConfirmation] = useState(false);

  // Sinkronkan state jika user login/logout atau prop berubah
  useEffect(() => {
    setIsLiked(isInitiallyLiked);
  }, [isInitiallyLiked, session]);

  // Fungsi utama untuk like/unlike
  const handleLikeToggle = async () => {
    if (isLiking || !session) return;

    setIsLiking(true);
    // Optimistic Update
    setIsLiked(prev => !prev);
    setLikes(prev => isLiked ? prev - 1 : prev + 1);

    try {
      const res = await fetch(`/api/songs/${songId}/like`, { method: 'POST' });
      if (!res.ok) throw new Error('API request failed');
    } catch (error) {
      // Rollback jika gagal
      setIsLiked(prev => !prev);
      setLikes(prev => isLiked ? prev - 1 : prev + 1);
      console.error("Failed to update like status:", error);
    } finally {
      setIsLiking(false);
    }
  };
  
  // Fungsi yang dipanggil saat tombol utama diklik
  const handleButtonClick = () => {
    if (!session) return; // Seharusnya tombol sudah nonaktif, tapi ini pengaman

    if (isLiked) {
      setShowUnlikeConfirmation(true); // Jika sudah like, tampilkan popup
    } else {
      handleLikeToggle(); // Jika belum, langsung like
    }
  };
  
  const confirmUnlike = () => {
    handleLikeToggle(); // Lakukan unlike
    setShowUnlikeConfirmation(false); // Tutup popup
  };
  
  const cancelUnlike = () => {
    setShowUnlikeConfirmation(false); // Tutup popup
  };
  
  const isLoggedIn = !!session;
  const isLoadingSession = status === 'loading';

  return (
    <div className="relative">
      {/* Tombol Like Utama */}
      <button
        onClick={handleButtonClick}
        disabled={!isLoggedIn || isLoadingSession || isLiking}
        className={`flex items-center justify-center gap-2 px-6 py-2 rounded-lg font-semibold text-white transition-all duration-200 transform active:scale-95
          ${!isLoggedIn
            ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
            : isLiked
              ? 'bg-pink-500 hover:bg-pink-600'
              : 'bg-blue-500 hover:bg-blue-600'
          }
          ${isLoadingSession || isLiking ? 'opacity-50 cursor-wait' : ''}
        `}
      >
        <HeartIcon className="h-5 w-5" />
        <span>{likes} Likes</span>
        {/* Tampilkan checkmark jika sudah login dan like */}
        {isLoggedIn && isLiked && <CheckIcon className="h-5 w-5 ml-1" />}
      </button>

      {/* Popup Konfirmasi Unlike */}
      {showUnlikeConfirmation && (
        <div
          className="fixed inset-0 bg-black/30 flex justify-center items-center z-50"
          onClick={cancelUnlike} // Klik di luar untuk menutup
        >
          <div
            className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-xl text-center relative"
            onClick={(e) => e.stopPropagation()} // Mencegah klik di dalam menutup popup
          >
            <button onClick={cancelUnlike} className="absolute top-2 right-2 p-1 text-gray-500 hover:text-gray-800 dark:hover:text-white">
              <XMarkIcon className="h-6 w-6" />
            </button>
            <p className="mb-4 text-lg text-gray-800 dark:text-gray-200">
              Anda yakin ingin batal menyukai lagu ini?
            </p>
            <div className="flex justify-center gap-4">
              <button onClick={confirmUnlike} className="px-6 py-2 bg-red-600 text-white font-bold rounded-md hover:bg-red-700 transition-colors">
                YES
              </button>
              <button onClick={cancelUnlike} className="px-6 py-2 bg-gray-300 text-black font-bold rounded-md hover:bg-gray-400 dark:bg-gray-600 dark:text-white dark:hover:bg-gray-500 transition-colors">
                NO
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}