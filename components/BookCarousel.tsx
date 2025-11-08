import React from 'react';
import { Book } from '../types';
import BookCard from './BookCard';

interface BookCarouselProps {
  title: string;
  books: Book[];
}

const BookCarousel: React.FC<BookCarouselProps> = ({ title, books }) => {
  return (
    <section>
      <h2 className="text-2xl font-bold text-slate-100 mb-4">{title}</h2>
      {books && books.length > 0 ? (
        <div className="overflow-hidden">
          <ul className="flex overflow-x-auto space-x-6 pb-4 -mx-4 px-4 scrollbar-thin list-none">
            {books.map(book => (
              book?.key ? (
                <li key={book.key} className="flex-shrink-0 w-40 sm:w-48">
                  <BookCard book={book} />
                </li>
              ) : null
            ))}
          </ul>
        </div>
      ) : (
        <div className="px-4">
          <p className="text-slate-500">No books to display in this section.</p>
        </div>
      )}
    </section>
  );
};

export default BookCarousel;
