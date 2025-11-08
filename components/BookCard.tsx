import React, { useState, useRef, useEffect, MouseEvent } from 'react';
import { Link } from 'react-router-dom';
import { Book, BookListStatus } from '../types';
import { OPEN_LIBRARY_COVERS_URL, BOOK_LIST_STATUSES } from '../constants';
import { useAuth } from '../context/AuthContext';
import { useBookList } from '../context/BookListContext';

interface BookCardProps {
  book: Book;
}

const BookCard: React.FC<BookCardProps> = ({ book }) => {
  const { user } = useAuth();
  const { getBookStatus, addBook, updateBook } = useBookList();
  
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  
  // Destructure with defaults to prevent errors from malformed book objects
  const { key, title = 'Untitled', author_name, cover_i } = book;

  const workId = typeof key === 'string' ? key.split('/').pop() : undefined;
  const userBook = workId ? getBookStatus(workId) : null;
  
  useEffect(() => {
    const handleClickOutside = (event: globalThis.MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Do not render a card if the book has no key/workId
  if (!workId) {
    return null;
  }

  const handleButtonClick = (e: MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDropdownOpen(prev => !prev);
  };

  const handleStatusChange = (e: MouseEvent<HTMLButtonElement>, newStatus: BookListStatus) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (userBook) {
      updateBook(workId, { status: newStatus });
    } else {
      const newBookEntry = {
        book: { key, title, author_name, cover_i },
        status: newStatus,
        rating: null,
        review: null,
        addedDate: new Date().toISOString(),
      };
      addBook(workId, newBookEntry);
    }
    setIsDropdownOpen(false);
  };

  const coverUrl = cover_i
    ? `${OPEN_LIBRARY_COVERS_URL}/${cover_i}-L.jpg`
    : `https://via.placeholder.com/400x600.png/1e293b/94a3b8?text=No+Cover`;

  const authorText = Array.isArray(author_name) && author_name.length > 0
    ? author_name.join(', ')
    : 'Unknown Author';

  // The entire card is a single link, ensuring it is the direct child for list items.
  return (
    <Link to={`/book/${workId}`} className="group relative block h-full">
      <div className="bg-slate-800 rounded-lg overflow-hidden border border-slate-700 shadow-md hover:shadow-lg transition-all duration-300 transform group-hover:-translate-y-1 group-hover:shadow-sky-500/30 h-full flex flex-col">
        <div className="relative">
          {/* This is a proper img tag, which will replace any incorrect <button role="image"> */}
          <img
            src={coverUrl}
            alt={`Cover of ${title}`}
            className="w-full object-cover aspect-[2/3] bg-slate-700"
            loading="lazy"
          />
          {user && (
            <div ref={dropdownRef}>
              <button
                onClick={handleButtonClick}
                className={`absolute top-2 right-2 z-10 p-2 rounded-full transition-all duration-200 
                           ${userBook ? 'bg-sky-600 text-white' : 'bg-slate-900/70 text-slate-200'}
                           opacity-0 group-hover:opacity-100 focus:opacity-100 hover:bg-sky-500`}
                aria-label="Add to list"
              >
                {userBook ? (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                ) : (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path></svg>
                )}
              </button>
              {isDropdownOpen && (
                 <div className="absolute top-12 right-2 w-40 bg-slate-700 border border-slate-600 rounded-md z-20 shadow-lg py-1">
                    {BOOK_LIST_STATUSES.map(status => (
                      <button
                        key={status}
                        onClick={(e) => handleStatusChange(e, status)}
                        className="w-full text-left px-4 py-2 text-sm text-slate-200 hover:bg-slate-600 transition-colors"
                      >
                        {status}
                      </button>
                    ))}
                 </div>
              )}
            </div>
          )}
        </div>
        <div className="p-4 flex-1 flex flex-col">
          {/* Proper h3 and p tags will replace any incorrect button roles */}
          <h3 className="font-bold text-md truncate text-slate-200 group-hover:text-sky-400" title={title}>
            {title}
          </h3>
          <p className="text-sm text-slate-400 truncate mt-1">
            {authorText}
          </p>
        </div>
      </div>
    </Link>
  );
};

export default BookCard;
