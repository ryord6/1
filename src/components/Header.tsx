"use client";

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useSession, signIn, signOut } from 'next-auth/react';
import SearchOverlay from '@/components/SearchOverlay';

export default function Header() {
  const { data: session, status } = useSession();
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  const renderUserMenu = () => {
    // Tampilkan loading indicator saat sesi sedang diverifikasi
    if (status === "loading") {
      return <div className="h-10 w-10 rounded-full bg-gray-200 animate-pulse" />;
    }

    // Jika user sudah login (sesi ada)
    if (session) {
      return (
        <div className="relative">
          <button onClick={() => signOut()} aria-label="Sign out">
            {session.user?.image ? (
              <Image
                src={session.user.image}
                alt={session.user.name || 'User Avatar'}
                width={40}
                height={40}
                className="rounded-full"
              />
            ) : (
              <div className="h-10 w-10 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold text-lg">
                {session.user?.name?.charAt(0).toUpperCase()}
              </div>
            )}
          </button>
        </div>
      );
    }
    
    // Jika user belum login
    return (
      <button
        onClick={() => signIn('google')}
        className="bg-blue-600 text-white font-semibold px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
      >
        LOGIN
      </button>
    );
  };

  return (
    <>
      <header className="bg-white dark:bg-gray-900 shadow-md sticky top-0 z-40">
        <nav className="container mx-auto p-4 flex justify-between items-center">
          <Link href="/" className="text-2xl font-bold text-blue-600 dark:text-blue-400">
            Karaokei
          </Link>
          
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setIsSearchOpen(true)}
              className="p-2 text-gray-700 dark:text-gray-300"
              aria-label="Open search"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </button>
            {renderUserMenu()}
          </div>
        </nav>
      </header>

      <SearchOverlay 
        isOpen={isSearchOpen} 
        onClose={() => setIsSearchOpen(false)} 
      />
    </>
  );
}