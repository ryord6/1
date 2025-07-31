import { PrismaClient } from '@prisma/client';
import { Suspense } from 'react';
import Link from 'next/link';
import SearchResultsList from './SearchResultsList';
import SongCard from '@/components/SongCard';

const prisma = new PrismaClient();

// This component for popular search terms remains unchanged
async function PopularSearchesFallback() {
  const popular = await prisma.searchQuery.findMany({
    orderBy: { searchCount: 'desc' },
    take: 5,
  });
  return (
    <div className="mt-8">
      <h3 className="text-xl font-semibold text-gray-700">Or try one of these popular searches:</h3>
      <div className="flex flex-wrap gap-2 mt-4 justify-center">
        {popular.map(item => (
          <Link key={item.id} href={`/search?q=${item.query}`} className="bg-gray-200 text-gray-800 px-3 py-1 rounded-full hover:bg-gray-300">
            {item.query}
          </Link>
        ))}
      </div>
    </div>
  );
}

// This component for most viral songs remains unchanged
async function MostViralFallback() {
  const mostViral = await prisma.song.findMany({
    orderBy: { viewCount: 'desc' },
    take: 4,
    include: { tags: true },
  });

  if (mostViral.length === 0) {
    return null;
  }

  const songIds = mostViral.map(s => s.id);
  let searchClickCounts: { [songId: string]: number } = {};
  if (songIds.length > 0) {
    const clickAggregates = await prisma.searchClick.groupBy({
      by: ['songId'],
      where: { songId: { in: songIds } },
      _sum: { clickCount: true },
    });
    
    clickAggregates.forEach(agg => {
      if (agg.songId && agg._sum.clickCount) {
        searchClickCounts[agg.songId] = agg._sum.clickCount;
      }
    });
  }

  return (
    <section className="mt-12 text-left">
      <h2 className="text-2xl font-bold text-gray-800 border-b-2 border-blue-500 pb-2 mb-4">
        Most Viral
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {mostViral.map(song => (
          <SongCard
            key={`most-viral-${song.id}`}
            song={song}
            totalSearchClicks={searchClickCounts[song.id] || 0}
          />
        ))}
      </div>
    </section>
  );
}

// --- MAIN PAGE COMPONENT WITH FIXES ---
export default async function SearchResultsPage({
  searchParams,
}: {
  searchParams: { q?: string };
}) {
  const awaitedSearchParams = await searchParams;
  const query = awaitedSearchParams.q ?? '';
  let results: any[] = []; 

  if (query) {
    results = await prisma.song.findMany({
      where: {
        OR: [
          { title: { contains: query } },
          // Fix 2: Removed the 'artist' field from the search since it's not in your schema
          { tags: { some: { name: { contains: query } } } },
        ],
      },
      include: { tags: true },
      orderBy: { likeCount: 'desc' },
    });
  }

  if (query && results.length > 0) {
    await prisma.searchQuery.upsert({
      where: { query: query.toLowerCase() },
      update: { searchCount: { increment: 1 } },
      create: { query: query.toLowerCase() },
    });
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-2">Search Results</h1>
      <p className="text-gray-600 mb-6">You searched for: <span className="font-semibold text-black">{query || '...'}</span></p>

      {results.length > 0 ? (
        <SearchResultsList results={results} searchQuery={query} />
      ) : (
        <div className="text-center py-10">
          <h2 className="text-2xl font-bold text-red-600">No songs found.</h2>
          <p className="text-gray-500">We couldn't find any songs matching your search.</p>
          <Suspense fallback={<p>Loading popular searches...</p>}>
             <PopularSearchesFallback />
          </Suspense>

          <Suspense fallback={<p className="mt-8 text-gray-500">Loading most viral songs...</p>}>
            <MostViralFallback />
          </Suspense>
        </div>
        
      )}
    </div>
  );
}