import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserBook } from '../types';
import { useAuth } from './AuthContext';
import api from '../services/api';

interface BookListContextType {
  userBooks: Record<string, UserBook>;
  loading: boolean;
  addBook: (workId: string, bookData: UserBook) => Promise<void>;
  removeBook: (workId: string) => Promise<void>;
  updateBook: (workId: string, updates: Partial<UserBook>) => Promise<void>;
  getBookStatus: (workId: string) => UserBook | null;
}

const BookListContext = createContext<BookListContextType | undefined>(undefined);

export const BookListProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [userBooks, setUserBooks] = useState<Record<string, UserBook>>({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchBookList = async () => {
      if (user) {
        setLoading(true);
        try {
          const books = await api('/lists');
          setUserBooks(books || {});
        } catch (error) {
          console.error("Failed to fetch book list:", error);
        } finally {
          setLoading(false);
        }
      } else {
        // Clear books on logout
        setUserBooks({});
      }
    };
    fetchBookList();
  }, [user]);

  const addBook = async (workId: string, bookData: UserBook) => {
    const dataToSend = {
      workId: workId,
      status: bookData.status,
      bookDetails: {
        title: bookData.book.title,
        author_name: bookData.book.author_name,
        cover_i: bookData.book.cover_i,
      }
    };
    await api('/lists', { data: dataToSend, method: 'POST' });
    setUserBooks(prev => ({ ...prev, [workId]: bookData }));
  };

  const removeBook = async (workId: string) => {
    await api(`/lists/${workId}`, { method: 'DELETE' });
    setUserBooks(prev => {
      const newState = { ...prev };
      delete newState[workId];
      return newState;
    });
  };

  const updateBook = async (workId: string, updates: Partial<UserBook>) => {
    const currentBook = userBooks[workId];
    if (!currentBook) return;
    
    const updatedBook = { ...currentBook, ...updates };

    const dataToSend = {
      workId: workId,
      status: updatedBook.status,
      rating: updatedBook.rating,
      review: updatedBook.review,
      bookDetails: {
        title: updatedBook.book.title,
        author_name: updatedBook.book.author_name,
        cover_i: updatedBook.book.cover_i,
      }
    };

    await api('/lists', { data: dataToSend, method: 'POST' });
    setUserBooks(prev => ({
      ...prev,
      [workId]: updatedBook,
    }));
  };

  const getBookStatus = (workId: string): UserBook | null => {
    return userBooks[workId] || null;
  };

  return (
    <BookListContext.Provider value={{ userBooks, loading, addBook, removeBook, updateBook, getBookStatus }}>
      {children}
    </BookListContext.Provider>
  );
};

export const useBookList = (): BookListContextType => {
  const context = useContext(BookListContext);
  if (context === undefined) {
    throw new Error('useBookList must be used within a BookListProvider');
  }
  return context;
};
