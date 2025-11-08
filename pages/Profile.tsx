import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useBookList } from '../context/BookListContext';
import { BookListStatus, UserBook } from '../types';
import { BOOK_LIST_STATUSES } from '../constants';
import BookCard from '../components/BookCard';
import Spinner from '../components/Spinner';

const Profile: React.FC = () => {
  const { user } = useAuth();
  const { userBooks, loading } = useBookList();
  const [activeTab, setActiveTab] = useState<BookListStatus>(BookListStatus.Reading);

  const filteredBooks = useMemo(() => {
    return Object.values(userBooks).filter(book => book.status === activeTab);
  }, [userBooks, activeTab]);

  if (!user) {
    return null; // Or a redirect, handled by ProtectedRoute
  }

  const getAvatarUrl = (email: string) => {
    // Simple hash function to get a color from email for placeholder
    let hash = 0;
    for (let i = 0; i < email.length; i++) {
        hash = email.charCodeAt(i) + ((hash << 5) - hash);
    }
    const color = (hash & 0x00FFFFFF).toString(16).toUpperCase();
    const bgColor = "00000".substring(0, 6 - color.length) + color;
    const textColor = "FFFFFF"; // contrast
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=${bgColor}&color=${textColor}`;
  };

  return (
    <div className="px-4 sm:px-6 lg:px-8">
      <div className="bg-slate-900 rounded-lg p-6 mb-6 flex flex-col sm:flex-row items-center text-center sm:text-left sm:items-center space-y-4 sm:space-y-0 sm:space-x-6">
        <img
          src={getAvatarUrl(user.email)}
          alt="User avatar"
          className="w-24 h-24 rounded-full border-4 border-sky-500"
        />
        <div>
          <h1 className="text-3xl font-bold text-slate-100">{user.name}</h1>
          <p className="text-slate-400">{user.email}</p>
        </div>
      </div>

      <div className="mb-6">
        <div className="border-b border-slate-700 overflow-x-auto">
          <nav className="-mb-px flex space-x-6" aria-label="Tabs">
            {BOOK_LIST_STATUSES.map((status) => (
              <button
                key={status}
                onClick={() => setActiveTab(status)}
                className={`${
                  activeTab === status
                    ? 'border-sky-500 text-sky-400'
                    : 'border-transparent text-slate-400 hover:text-slate-200 hover:border-slate-500'
                } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
              >
                {status}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {loading ? (
        <Spinner />
      ) : filteredBooks.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
          {filteredBooks.map((userBook) => (
            <BookCard key={userBook.book.key} book={userBook.book} />
          ))}
        </div>
      ) : (
        <div className="text-center py-16">
          <p className="text-slate-400 text-lg">No books in this list yet.</p>
          <Link to="/" className="mt-4 inline-block text-sky-500 hover:text-sky-400 font-semibold">
            Browse books to add some!
          </Link>
        </div>
      )}
    </div>
  );
};

export default Profile;