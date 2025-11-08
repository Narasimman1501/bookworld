import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getTrendingBooks, getTopRatedBooks, getRandomBooks } from '../services/openLibrary';
import { Book } from '../types';
import BookCarousel from '../components/BookCarousel';
import SkeletonBookCard from '../components/SkeletonBookCard';

const Home: React.FC = () => {
  const [trending, setTrending] = useState<Book[]>([]);
  const [topRated, setTopRated] = useState<Book[]>([]);
  const [randomBooks, setRandomBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchAllBooks = async () => {
      setLoading(true);
      setError(null);

      try {
        // Attempt to load all data from session storage first for an instant UI
        const cachedTrending = sessionStorage.getItem('home_trending');
        const cachedTopRated = sessionStorage.getItem('home_topRated');
        const cachedRandom = sessionStorage.getItem('home_random');

        let isCacheAvailable = false;
        if (cachedTrending) setTrending(JSON.parse(cachedTrending));
        if (cachedTopRated) setTopRated(JSON.parse(cachedTopRated));
        if (cachedRandom) setRandomBooks(JSON.parse(cachedRandom));

        // If we have all sections cached, we can show the content immediately
        if (cachedTrending && cachedTopRated && cachedRandom) {
            setLoading(false);
            isCacheAvailable = true;
        }
        
        // Fetch fresh data from the API
        const results = await Promise.allSettled([
          getTrendingBooks(),
          getTopRatedBooks(),
          getRandomBooks(),
        ]);

        let allFetchesFailed = true;

        // Process trending books
        if (results[0].status === 'fulfilled' && results[0].value.length > 0) {
          setTrending(results[0].value);
          sessionStorage.setItem('home_trending', JSON.stringify(results[0].value));
          allFetchesFailed = false;
        } else {
          console.error('Failed to fetch or got empty trending books:', results[0].status === 'rejected' ? results[0].reason : 'Empty result');
        }

        // Process top-rated books
        if (results[1].status === 'fulfilled' && results[1].value.length > 0) {
          setTopRated(results[1].value);
          sessionStorage.setItem('home_topRated', JSON.stringify(results[1].value));
          allFetchesFailed = false;
        } else {
          console.error('Failed to fetch or got empty top rated books:', results[1].status === 'rejected' ? results[1].reason : 'Empty result');
        }
        
        // Process random books
        if (results[2].status === 'fulfilled' && results[2].value.length > 0) {
          setRandomBooks(results[2].value);
          sessionStorage.setItem('home_random', JSON.stringify(results[2].value));
          allFetchesFailed = false;
        } else {
          console.error('Failed to fetch or got empty random books:', results[2].status === 'rejected' ? results[2].reason : 'Empty result');
        }

        // If all API calls failed and we didn't have anything in the cache, show an error.
        if (allFetchesFailed && !isCacheAvailable) {
          setError("Failed to load books. Please try again later.");
        }

      } catch (err) {
        console.error(err);
        // Set error only if there's no cached data to show
        if (!sessionStorage.getItem('home_trending') && !sessionStorage.getItem('home_topRated') && !sessionStorage.getItem('home_random')) {
           setError("An unexpected error occurred while loading books.");
        }
      } finally {
        setLoading(false);
      }
    };
    fetchAllBooks();
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/browse?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const SkeletonCarousel = ({ title }: { title: string }) => (
    <section>
      <h2 className="text-2xl font-bold text-slate-100 mb-4">{title}</h2>
      <div className="flex overflow-x-auto space-x-6 pb-4 -mx-4 px-4 scrollbar-thin">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="flex-shrink-0 w-40 sm:w-48">
            <SkeletonBookCard />
          </div>
        ))}
      </div>
    </section>
  );

  return (
    <div className="space-y-12 px-4 sm:px-6 lg:px-8">
      <div className="text-center pt-8 pb-4">
        <h1 className="text-4xl sm:text-5xl font-bold text-slate-100 mb-4" translate="no">Welcome to BookWorld</h1>
        <p className="text-lg text-slate-400 mb-6 max-w-2xl mx-auto">Your portal to discover, track, and rate the world of literature.</p>
        <form onSubmit={handleSearchSubmit} className="max-w-xl mx-auto">
          <div className="relative">
            <input
              type="search"
              placeholder="Search for a book..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-5 py-3 text-lg bg-slate-800 border-2 border-slate-700 rounded-full placeholder-slate-500 text-slate-200 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
            />
            <button
              type="submit"
              className="absolute top-1/2 right-2 -translate-y-1/2 p-2 bg-sky-600 text-white rounded-full hover:bg-sky-700 focus:outline-none focus:ring-2 focus:ring-sky-500"
              aria-label="Search"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </button>
          </div>
        </form>
      </div>

      {loading ? (
        <div className="space-y-10">
          <SkeletonCarousel title="Trending Now" />
          <SkeletonCarousel title="Top Rated Classics" />
          <SkeletonCarousel title="Random Discoveries" />
        </div>
      ) : error ? (
        <p className="text-center text-red-500">{error}</p>
      ) : (
        <div className="space-y-10">
          <BookCarousel title="Trending Now" books={trending} />
          <BookCarousel title="Top Rated Classics" books={topRated} />
          <BookCarousel title="Random Discoveries" books={randomBooks} />
        </div>
      )}
    </div>
  );
};

export default Home;
