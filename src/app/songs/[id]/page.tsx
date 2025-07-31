import { PrismaClient } from "@prisma/client";
import { notFound } from "next/navigation";
import ViewCounter from "@/components/ViewCounter";
import LikeButton from "@/components/LikeButton";
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

const prisma = new PrismaClient();

export const dynamic = 'force-dynamic';

// --- Komponen Ikon (tidak ada perubahan) ---
const EyeIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6 text-gray-500">
    <path d="M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z" />
    <path fillRule="evenodd" d="M1.323 11.447C2.811 6.976 7.028 3.75 12.001 3.75c4.97 0 9.185 3.223 10.675 7.69.12.362.12.752 0 1.113C21.182 17.024 16.97 20.25 12.001 20.25c-4.97 0-9.185-3.223-10.675-7.69a.75.75 0 0 1 0-1.113ZM17.25 12a5.25 5.25 0 1 1-10.5 0 5.25 5.25 0 0 1 10.5 0Z" clipRule="evenodd" />
  </svg>
);

const SearchIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6 text-gray-500">
    <path fillRule="evenodd" d="M10.5 3.75a6.75 6.75 0 1 0 0 13.5 6.75 6.75 0 0 0 0-13.5ZM2.25 10.5a8.25 8.25 0 1 1 14.59 5.28l4.69 4.69a.75.75 0 1 1-1.06 1.06l-4.69-4.69A8.25 8.25 0 0 1 2.25 10.5Z" clipRule="evenodd" />
  </svg>
);

export default async function SongDetailPage({ params }: { params: { id: string } }) {
  // Await params sebelum digunakan untuk mengatasi error
  const resolvedParams = await Promise.resolve(params);
  const { id } = resolvedParams;

  const [session, song, searchClickData] = await Promise.all([
    getServerSession(authOptions),
    prisma.song.findUnique({
      where: { id: id },
      include: { tags: true },
    }),
    prisma.searchClick.aggregate({
      where: { songId: id },
      _sum: { clickCount: true },
    })
  ]);

  if (!song) {
    notFound();
  }

  let isInitiallyLiked = false;
  if (session?.user?.id) {
    const like = await prisma.like.findUnique({
      where: {
        songId_userId: {
          songId: song.id,
          userId: session.user.id,
        },
      },
    });
    isInitiallyLiked = !!like;
  }

  const totalSearchClicks = searchClickData._sum.clickCount || 0;
  
  return (
    <main className="container mx-auto p-4">
      <ViewCounter songId={song.id} />

      <div className="text-center my-6">
        <h1 className="text-4xl font-bold">{song.title}</h1>
        <p className="text-lg text-gray-600 mt-2">
          {song.tags.map(tag => tag.name).join(' / ')}
        </p>
        
        <div className="mt-6 flex justify-center items-center gap-x-8 text-gray-700">
          <div className="flex items-center gap-2">
            <EyeIcon/>
            <span>{song.viewCount} Views</span>
          </div>
          <LikeButton
            songId={song.id}
            initialLikeCount={song.likeCount}
            isInitiallyLiked={isInitiallyLiked}
          />
          <div className="flex items-center gap-2">
            <SearchIcon />
            <span>{totalSearchClicks} Searches</span>
          </div>
        </div>
        
        {/* --- PERUBAHAN DI SINI --- */}
        {/* Tampilkan pesan ini hanya jika pengguna BELUM login */}
        {!session && (
          <div className="mt-4 border-t border-gray-200 pt-4">
            <p className="text-sm text-gray-500">
              LOGIN untuk Like & Unlock Fitur Lanjutan
            </p>
          </div>
        )}
        {/* ------------------------- */}
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="aspect-w-16 aspect-h-9">
          <iframe 
            src={`https://www.youtube.com/embed/${song.videoUrl.split('v=')[1]}`}
            title={song.title}
            frameBorder="0" 
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
            allowFullScreen
            className="w-full h-full rounded-lg shadow-lg"
          ></iframe>
        </div>

        <div className="bg-gray-50 p-4 rounded-lg h-96 overflow-y-auto">
          <h2 className="text-xl font-semibold mb-2">Lyrics</h2>
          <p className="whitespace-pre-wrap font-mono text-sm">
            {song.lyrics || 'No lyrics available.'}
          </p>
        </div>
      </div>
    </main>
  );
}