import { BookListStatus } from './types';

export const OPEN_LIBRARY_URL = 'https://openlibrary.org';
export const OPEN_LIBRARY_COVERS_URL = 'https://covers.openlibrary.org/b/id';

export const BOOK_LIST_STATUSES: BookListStatus[] = [
  BookListStatus.Reading,
  BookListStatus.Completed,
  BookListStatus.PlanToRead,
  BookListStatus.OnHold,
  BookListStatus.Dropped,
];

export const GENRES = [
  'Fantasy',
  'Science Fiction',
  'Mystery',
  'Thriller',
  'Romance',
  'Horror',
  'History',
  'Biography',
  'Children',
  'Young Adult',
  'Adventure',
  'Dystopian',
  'Humor',
];

export const SORT_OPTIONS: Record<string, string> = {
  relevance: 'Relevance',
  new: 'Newest',
  old: 'Oldest',
  title: 'Title (A-Z)',
};
