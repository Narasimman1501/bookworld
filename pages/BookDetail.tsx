import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link, useLocation } from 'react-router-dom';
import { getBookDetails, BookNotFoundError } from '../services/openLibrary';
import { Book, BookListStatus } from '../types';
import { OPEN_LIBRARY_COVERS_URL, BOOK_LIST_STATUSES } from '../constants';
import Spinner from '../components/Spinner';
import { useAuth } from '../context/AuthContext';
import { useBookList } from '../context/BookListContext';
import StarRating from '../components/StarRating';

const BookDetail: React.FC = () => {
  const { workId } = useParams<{ workId: string }>();
  const location = useLocation();
  const [book, setBook] = useState<Book | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isBioExpanded, setIsBioExpanded] = useState(false);
  const [isStatusDropdownOpen, setIsStatusDropdownOpen] = useState(false);
  const statusDropdownRef = useRef<HTMLDivElement>(null);

  const { user } = useAuth();
  const { getBookStatus, addBook, updateBook, removeBook } = useBookList();
  
  const userBook = workId ? getBookStatus(workId) : null;
  const currentStatus = userBook?.status || 'Add to List';

  useEffect(() => {
    if (!workId) {
      setError('No book ID provided in the URL.');
      setLoading(false);
      return;
    }

    const fetchBook = async () => {
      setLoading(true);
      setError(null);
      setBook(null);
      setIsBioExpanded(false);
      try {
        const details = await getBookDetails(workId);
        setBook(details);
      } catch (err) {
        console.error("Error fetching book details:", err);
        if (err instanceof BookNotFoundError) {
          setError('Sorry, we couldn\'t find a book with that ID. It may have been removed or the link is incorrect.');
        } else {
          setError('An unexpected error occurred while fetching book details. Please try refreshing the page.');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchBook();
  }, [workId]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (statusDropdownRef.current && !statusDropdownRef.current.contains(event.target as Node)) {
        setIsStatusDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleStatusChange = (newStatus: BookListStatus | 'Remove') => {
    if (!workId || !book) return;

    if (newStatus === 'Remove') {
        removeBook(workId);
    } else {
        const bookData = {
            book: {
                key: book.key,
                title: book.title,
                author_name: book.author_name,
                cover_i: book.cover_i,
            },
            status: newStatus,
            rating: userBook?.rating || null,
            review: userBook?.review || null,
            addedDate: userBook?.addedDate || new Date().toISOString(),
        };
        if (userBook) {
            updateBook(workId, { status: newStatus });
        } else {
            addBook(workId, bookData);
        }
    }
  };

  const handleRatingChange = (newRating: number) => {
    if (!workId || !book || !userBook) return;
    updateBook(workId, { rating: newRating });
  };

  if (loading) return <Spinner />;
  if (error) {
    return (
      <div className="text-center py-16 px-4">
        <h2 className="text-2xl font-bold text-red-400 mb-4">Something Went Wrong</h2>
        <p className="text-slate-400 text-lg max-w-md mx-auto">{error}</p>
      </div>
    );
  }
  if (!book) return null;

  const coverUrl = book.cover_i
    ? `${OPEN_LIBRARY_COVERS_URL}/${book.cover_i}-L.jpg`
    : `https://via.placeholder.com/400x600.png/1e293b/94a3b8?text=No+Cover`;
  
  const descriptionText = typeof book.description === 'string' 
    ? book.description 
    : book.description?.value || 'No description available.';

  const authorBioText = typeof book.author_details?.bio === 'string'
    ? book.author_details.bio
    : book.author_details?.bio?.value;

  const bioLines = authorBioText ? authorBioText.split('\n') : [];
  const isBioLong = bioLines.length > 5;

  const genres = book.subjects || book.subject || [];

  return (
    <div className="max-w-6xl mx-auto p-4 sm:p-6 lg:p-8">
      <div className="flex flex-col md:flex-row gap-8 md:items-start">
        <div className="md:w-1/3 flex-shrink-0 md:sticky md:top-8 self-start">
          <img 
            src={coverUrl} 
            alt={`Cover for ${book.title}`} 
            className="rounded-lg shadow-2xl w-full aspect-[2/3] object-cover shadow-sky-900/50"
          />
          {user ? (
            <div className="mt-4" ref={statusDropdownRef}>
              <div className="relative mb-4">
                <button
                  onClick={() => setIsStatusDropdownOpen(prev => !prev)}
                  className="w-full p-3 bg-sky-600 text-white font-bold rounded-md text-center hover:bg-sky-700 cursor-pointer flex justify-center items-center transition-colors"
                >
                  <span>{currentStatus}</span>
                  <svg className={`w-5 h-5 ml-2 transition-transform ${isStatusDropdownOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                </button>
                {isStatusDropdownOpen && (
                  <div className="absolute top-full mt-2 w-full bg-slate-700 border border-slate-600 rounded-md z-20 shadow-lg py-1">
                    {BOOK_LIST_STATUSES.map(status => (
                      <button
                        key={status}
                        onClick={() => {
                          handleStatusChange(status);
                          setIsStatusDropdownOpen(false);
                        }}
                        className="w-full text-left px-4 py-2 text-slate-200 hover:bg-slate-600 transition-colors"
                      >
                        {status}
                      </button>
                    ))}
                    {userBook && (
                      <>
                        <hr className="border-slate-600 my-1" />
                        <button
                          onClick={() => {
                            handleStatusChange('Remove');
                            setIsStatusDropdownOpen(false);
                          }}
                          className="w-full text-left px-4 py-2 text-red-400 hover:bg-slate-600 hover:text-red-300 transition-colors"
                        >
                          Remove from List
                        </button>
                      </>
                    )}
                  </div>
                )}
              </div>
              {userBook && (
                <div className="bg-slate-800 rounded-lg p-4">
                  <h4 className="text-slate-300 font-semibold mb-3 text-center text-sm">Your Rating</h4>
                  <StarRating
                    rating={userBook.rating || 0}
                    onRatingChange={handleRatingChange}
                  />
                </div>
              )}
            </div>
          ) : (
            <div className="mt-6 bg-slate-800 rounded-lg p-4 text-center">
              <p className="text-slate-300 mb-3">Want to track this book?</p>
              <Link
                to="/login"
                state={{ from: location }}
                className="inline-block w-full px-4 py-2 text-md font-semibold text-white bg-sky-600 rounded-md hover:bg-sky-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-800 focus:ring-sky-500 transition-colors"
              >
                Login to Add to List
              </Link>
            </div>
          )}
        </div>
        <div className="md:w-2/3 text-slate-200">
          <h1 className="text-3xl md:text-4xl font-bold text-slate-100 mb-2">{book.title}</h1>
          <p className="text-xl text-sky-400 mb-4">by {book.author_name?.join(', ') || 'Unknown Author'}</p>
          <div className="mb-6">
            <h3 className="font-semibold text-lg text-slate-100 mb-2">Description</h3>
            <p className="text-slate-400 whitespace-pre-wrap leading-relaxed">{descriptionText}</p>
          </div>
          <div className="mb-6">
            <h3 className="font-semibold text-lg text-slate-100 mb-2">Genres</h3>
            <div className="flex flex-wrap gap-2">
              {genres.slice(0, 10).map(g => (
                <span key={g} className="bg-slate-700 text-sky-300 text-xs font-semibold px-2.5 py-1 rounded-full">{g}</span>
              ))}
            </div>
          </div>
          
          {book.external_links && Object.keys(book.external_links).length > 0 && (
            <div className="mb-6">
              <h3 className="font-semibold text-lg text-slate-100 mb-3">Find this Book</h3>
              <div className="flex flex-wrap gap-3">
                {book.external_links.goodreads && (
                  <a
                    href={book.external_links.goodreads}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center px-4 py-2 bg-slate-700 text-slate-200 rounded-md hover:bg-slate-600 transition-colors font-medium"
                  >
                    View on Goodreads
                  </a>
                )}
                {book.external_links.amazon && (
                  <a
                    href={book.external_links.amazon}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center px-4 py-2 bg-slate-700 text-slate-200 rounded-md hover:bg-slate-600 transition-colors font-medium"
                  >
                    Buy on Amazon
                  </a>
                )}
                {book.external_links.google && (
                  <a
                    href={book.external_links.google}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center px-4 py-2 bg-slate-700 text-slate-200 rounded-md hover:bg-slate-600 transition-colors font-medium"
                  >
                    View on Google Books
                  </a>
                )}
              </div>
            </div>
          )}

          {book.author_details && (
            <div className="mb-6 pt-6 border-t border-slate-700">
                <h3 className="font-semibold text-lg text-slate-100 mb-2">About the Author</h3>
                 <p className="text-slate-300 font-medium mb-2">
                    {book.author_details.name}
                    {(book.author_details.birth_date || book.author_details.death_date) && (
                        <span className="text-slate-400 ml-2">
                            ({book.author_details.birth_date || ''} - {book.author_details.death_date || ''})
                        </span>
                    )}
                 </p>
                {authorBioText && (
                    <div>
                        <p className="text-slate-400 whitespace-pre-wrap leading-relaxed transition-all duration-300">
                            {isBioLong && !isBioExpanded 
                                ? bioLines.slice(0, 5).join('\n') + '...' 
                                : authorBioText}
                        </p>
                        {isBioLong && (
                            <button 
                                onClick={() => setIsBioExpanded(!isBioExpanded)}
                                className="text-sky-500 hover:text-sky-400 font-semibold mt-2 focus:outline-none"
                            >
                                {isBioExpanded ? 'Show less' : 'Read more'}
                            </button>
                        )}
                    </div>
                )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BookDetail;
