import { OPEN_LIBRARY_URL, GENRES } from '../constants';
import { Book, Author } from '../types';

// Custom Error classes for more specific error handling
export class FetchError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'FetchError';
  }
}

export class BookNotFoundError extends FetchError {
  constructor(workId: string) {
    super(`Book with ID "${workId}" not found.`);
    this.name = 'BookNotFoundError';
  }
}

interface SearchResult {
  docs: Book[];
  numFound: number;
}

interface BrowseOptions {
    query?: string;
    genres?: string[];
    year?: string;
    sort?: string;
    limit?: number;
    page?: number;
}

export const browseBooks = async (options: BrowseOptions): Promise<{ books: Book[], total: number }> => {
  const { query, genres, year, sort, limit = 40, page = 1 } = options;
  
  const searchParams = new URLSearchParams();
  
  searchParams.set('q', query || '*');

  if (genres && genres.length > 0) {
    genres.forEach(genre => searchParams.append('subject', genre));
  }

  if (year) {
    searchParams.set('publish_year', year);
  }

  if (sort && sort !== 'relevance') {
    searchParams.set('sort', sort);
  }
  
  const offset = (page - 1) * limit;
  searchParams.set('offset', offset.toString());
  searchParams.set('language', 'eng');
  // Fix: Corrected typo from search_params to searchParams
  searchParams.set('limit', limit.toString());
  searchParams.set('fields', 'key,title,author_name,cover_i,first_publish_year');
  
  const requestUrl = `${OPEN_LIBRARY_URL}/search.json?${searchParams.toString()}`;
  const cacheKey = `browse_${requestUrl}`;

  try {
    const response = await fetch(requestUrl);
    if (!response.ok) {
      throw new FetchError(`Network response was not ok, status: ${response.status}`);
    }
    const data: SearchResult = await response.json();
    const filteredBooks = data.docs.filter(doc => doc.key);
    
    const result = { books: filteredBooks, total: data.numFound };
    sessionStorage.setItem(cacheKey, JSON.stringify(result));
    return result;
  } catch (error) {
    console.warn("Failed to fetch from network, checking cache...", error);
    const cachedData = sessionStorage.getItem(cacheKey);
    if (cachedData) {
      console.log("Serving from cache due to network error.");
      return JSON.parse(cachedData);
    }
    throw error; 
  }
};


export const getBookDetails = async (workId: string): Promise<Book> => {
  const response = await fetch(`${OPEN_LIBRARY_URL}/works/${workId}.json`);
  if (!response.ok) {
    if (response.status === 404) {
      throw new BookNotFoundError(workId);
    }
    throw new FetchError('Failed to fetch book details from Open Library.');
  }
  const data: Book = await response.json();

  // The work API often lacks a cover, so we fetch an edition to find a cover and identifiers.
  try {
    const editionsResponse = await fetch(`${OPEN_LIBRARY_URL}/works/${workId}/editions.json?limit=1&language=eng`);
    if (editionsResponse.ok) {
      const editionsData = await editionsResponse.json();
      if (editionsData.entries.length > 0) {
        const edition = editionsData.entries[0];
        if (edition.covers && edition.covers.length > 0) {
          data.cover_i = edition.covers[0];
        }
        
        // Get external links from identifiers
        if (edition.identifiers) {
          data.external_links = {};
          if (edition.identifiers.goodreads?.[0]) {
            data.external_links.goodreads = `https://www.goodreads.com/book/show/${edition.identifiers.goodreads[0]}`;
          }
          if (edition.identifiers.amazon?.[0]) {
            data.external_links.amazon = `https://www.amazon.com/dp/${edition.identifiers.amazon[0]}`;
          }
          if (edition.identifiers.google?.[0]) {
            data.external_links.google = `https://books.google.com/books?id=${edition.identifiers.google[0]}`;
          }
        }
      }
    }
  } catch (error) {
    console.warn(`Could not fetch edition details for ${workId}:`, error);
  }


  // Author details might need a separate call if not fully populated
  if (data.authors && data.authors[0].author) {
    const authorKey = data.authors[0].author.key;
    try {
        const authorResponse = await fetch(`${OPEN_LIBRARY_URL}${authorKey}.json`);
        if(authorResponse.ok) {
          const authorData: Author = await authorResponse.json();
          data.author_name = [authorData.name];
          data.author_details = {
              name: authorData.name,
              bio: authorData.bio,
              birth_date: authorData.birth_date,
              death_date: authorData.death_date,
          };
        }
    } catch (error) {
        console.warn(`Could not fetch author details for ${authorKey}:`, error);
    }
  }

  return data;
};

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// --- Resilient Home Page Fetching Functions ---

// A list of broad, popular subjects to use as fallbacks for "Trending".
const TRENDING_FALLBACKS = ['love', 'fiction', 'thriller', 'adventure', 'fantasy'];
export const getTrendingBooks = async (limit: number = 20): Promise<Book[]> => {
    for (const subject of TRENDING_FALLBACKS) {
        try {
            const { books } = await browseBooks({ genres: [subject], sort: 'relevance', limit });
            if (books && books.length > 0) return books;
        } catch (error) {
            console.warn(`Trending fallback failed for subject: ${subject}`, error);
            await sleep(250); // Add a small delay to avoid overwhelming the API
        }
    }
    console.error("All fallback subjects for trending books failed.");
    return [];
};

// A list of subjects for "Top Rated" classics that are likely to return results.
const TOP_RATED_FALLBACKS = ['history', 'classic_literature', 'biography', 'science'];
export const getTopRatedBooks = async (limit: number = 20): Promise<Book[]> => {
    for (const subject of TOP_RATED_FALLBACKS) {
        try {
            const { books } = await browseBooks({ genres: [subject], sort: 'relevance', limit });
            if (books && books.length > 0) return books;
        } catch (error) {
            console.warn(`Top rated fallback failed for subject: ${subject}`, error);
            await sleep(250); // Add a small delay to avoid overwhelming the API
        }
    }
    console.error("All fallback subjects for top-rated books failed.");
    return [];
};

// A curated list of popular subjects known to return reliable results from the API.
const POPULAR_RANDOM_SUBJECTS = [
    'adventure',
    'fantasy',
    'science_fiction',
    'romance',
    'thriller',
    'mystery'
];
export const getRandomBooks = async (limit: number = 20): Promise<Book[]> => {
    // Create a mutable, shuffled copy of the subjects to try in a random order.
    const subjectsToTry = [...POPULAR_RANDOM_SUBJECTS]
        .map(value => ({ value, sort: Math.random() }))
        .sort((a, b) => a.sort - b.sort)
        .map(({ value }) => value);

    for (const subject of subjectsToTry) {
        try {
            const { books } = await browseBooks({ genres: [subject], sort: 'relevance', limit });
            if (books && books.length > 0) return books;
        } catch (error) {
            console.warn(`Random books failed for subject: ${subject}`, error);
            await sleep(250); // Add a small delay to avoid overwhelming the API
        }
    }
    console.error("All random subjects failed to return results.");
    return [];
};