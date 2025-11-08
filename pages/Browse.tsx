import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { browseBooks, getTrendingBooks } from '../services/openLibrary';
import { Book } from '../types';
import { GENRES, SORT_OPTIONS } from '../constants';
import BookCard from '../components/BookCard';
import SkeletonBookCard from '../components/SkeletonBookCard';
import Spinner from '../components/Spinner';

const Browse: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  
  const [books, setBooks] = useState<Book[]>([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [total, setTotal] = useState(0);
  const [error, setError] = useState<string | null>(null);

  // Check URL params to see if a search is active or if we should show the default view
  const isSearchActive = !!searchParams.get('q') || searchParams.getAll('genre').length > 0 || !!searchParams.get('sort');
  const [isDefaultView, setIsDefaultView] = useState(!isSearchActive);

  // Filter states, synced with URL params
  const [query, setQuery] = useState(searchParams.get('q') || '');
  const [genres, setGenres] = useState<string[]>(searchParams.getAll('genre') || []);
  const [sort, setSort] = useState(searchParams.get('sort') || 'relevance');

  // Local state for the input field and genre dropdown
  const [inputValue, setInputValue] = useState(searchParams.get('q') || '');
  const [isGenreDropdownOpen, setIsGenreDropdownOpen] = useState(false);
  const genreDropdownRef = useRef<HTMLDivElement>(null);
  
  const observer = useRef<IntersectionObserver | null>(null);

  const lastBookElementRef = useCallback((node: HTMLDivElement | null) => {
    if (loading || loadingMore) return;
    if (observer.current) observer.current.disconnect();
    observer.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasMore) {
        setPage(prevPage => prevPage + 1);
      }
    });
    if (node) observer.current.observe(node);
  }, [loading, loadingMore, hasMore]);

  // Effect to fetch books
  useEffect(() => {
    const fetcher = async () => {
      // Don't fetch for default view if books are already there
      if(isDefaultView && books.length > 0) return;

      if (page === 1) setLoading(true);
      else setLoadingMore(true);
      
      setError(null);
      try {
        if (isDefaultView) {
          const trendingBooks = await getTrendingBooks(50);
          setBooks(trendingBooks);
          setTotal(trendingBooks.length);
          setHasMore(false);
        } else {
          const options = {
            query: query || undefined,
            genres: genres.length > 0 ? genres.map(g => g.toLowerCase().replace(/ /g, '_')) : undefined,
            sort: sort,
            page: page,
            limit: 40,
          };
          const data = await browseBooks(options);

          setBooks(prevBooks => (page === 1 ? data.books : [...prevBooks, ...data.books]));
          setTotal(data.total);
          
          const currentBookCount = page === 1 ? data.books.length : books.length + data.books.length;
          const hasMoreResults = currentBookCount < data.total && currentBookCount < 1000;
          setHasMore(hasMoreResults);
        }
      } catch (err) {
        setError('Failed to fetch books. Please try refreshing the page.');
        console.error(err);
      } finally {
        setLoading(false);
        setLoadingMore(false);
      }
    };

    fetcher();
  }, [isDefaultView, query, JSON.stringify(genres), sort, page]);

  // Effect to close genre dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (genreDropdownRef.current && !genreDropdownRef.current.contains(event.target as Node)) {
        setIsGenreDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Effect to reset state when filters change
  const handleFilterChange = (newQuery: string, newGenres: string[], newSort: string) => {
    // Switch from default view to search view on first interaction
    if (isDefaultView) {
      setIsDefaultView(false);
    }
    
    if (query === newQuery && JSON.stringify(genres) === JSON.stringify(newGenres) && sort === newSort) return;
    
    setPage(1);
    setBooks([]);
    setHasMore(true);
    setQuery(newQuery);
    setGenres(newGenres);
    setSort(newSort);

    // Update URL search params
    const params: Record<string, string | string[]> = {};
    if (newQuery) params.q = newQuery;
    if (newGenres.length > 0) params.genre = newGenres;
    if (newSort !== 'relevance') params.sort = newSort;
    setSearchParams(params as any);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleFilterChange(inputValue, genres, sort);
  };

  const handleGenreCheckboxChange = (genre: string, isChecked: boolean) => {
    const newGenres = isChecked
        ? [...genres, genre]
        : genres.filter(g => g !== genre);
    handleFilterChange(query, newGenres, sort);
  };
  
  const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    handleFilterChange(query, genres, e.target.value);
  };
  
  const genreButtonText = genres.length > 0 ? `Genres (${genres.length})` : 'All Genres';

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-6">
      <div className="bg-slate-800 p-4 rounded-lg mb-6 sticky top-0 z-10 border-b border-slate-700">
        <form onSubmit={handleSearchSubmit} className="grid grid-cols-1 sm:grid-cols-12 gap-4 items-center">
            <div className="sm:col-span-6">
                <input
                    type="text"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    placeholder="Search by title, author, or subject..."
                    className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-md placeholder-slate-400 text-slate-200 focus:outline-none focus:ring-2 focus:ring-sky-500"
                />
            </div>
            <div className="relative sm:col-span-3" ref={genreDropdownRef}>
              <button
                type="button"
                onClick={() => setIsGenreDropdownOpen(prev => !prev)}
                className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-md text-slate-200 focus:outline-none focus:ring-2 focus:ring-sky-500 text-left flex justify-between items-center"
              >
                <span>{genreButtonText}</span>
                <svg className={`w-5 h-5 transition-transform ${isGenreDropdownOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
              </button>
              {isGenreDropdownOpen && (
                <div className="absolute top-full mt-1 w-full bg-slate-700 border border-slate-600 rounded-md z-20 max-h-60 overflow-y-auto">
                    {GENRES.map(g => (
                        <label key={g} className="flex items-center px-4 py-2 text-slate-200 hover:bg-slate-600 cursor-pointer">
                            <input
                                type="checkbox"
                                checked={genres.includes(g)}
                                onChange={(e) => handleGenreCheckboxChange(g, e.target.checked)}
                                className="h-4 w-4 rounded border-slate-500 bg-slate-800 text-sky-600 focus:ring-sky-500"
                            />
                            <span className="ml-3">{g}</span>
                        </label>
                    ))}
                </div>
              )}
            </div>
             <div className="sm:col-span-3">
                 <select value={sort} onChange={handleSortChange} className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-md text-slate-200 focus:outline-none focus:ring-2 focus:ring-sky-500">
                    {Object.entries(SORT_OPTIONS).map(([key, value]) => <option key={key} value={key}>{value}</option>)}
                </select>
            </div>
        </form>
      </div>

      {isDefaultView && !loading && !error && (
        <h2 className="text-3xl font-bold text-slate-100 mb-4">Top 50 Trending Books</h2>
      )}
      
      {!isDefaultView && !loading && !error && total > 0 && (
        <div className="mb-4 text-slate-400 text-sm">
          Showing {books.length} of ~{Math.min(total, 1000).toLocaleString()} results.
          {total > 1000 && <span> (Note: API limited to first 1000 results)</span>}
        </div>
      )}

      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
          {[...Array(18)].map((_, i) => <SkeletonBookCard key={i} />)}
        </div>
      ) : error ? (
        <p className="text-center text-red-500 py-16">{error}</p>
      ) : books.length > 0 ? (
        <>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
              {books.map((book, index) => {
                if (books.length === index + 1 && !isDefaultView) {
                  return <div ref={lastBookElementRef} key={book.key}><BookCard book={book} /></div>;
                } else {
                  return <BookCard key={book.key} book={book} />;
                }
              })}
            </div>
            {loadingMore && <div className="py-8"><Spinner /></div>}
            {!hasMore && !isDefaultView && <p className="text-center text-slate-500 text-lg py-16">You've reached the end of the list.</p>}
        </>
      ) : (
        <p className="text-center text-slate-500 text-lg py-16">No books found. Try a different search or filter.</p>
      )}
    </div>
  );
};

export default Browse;