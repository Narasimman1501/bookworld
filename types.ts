
export interface Book {
  key: string;
  title: string;
  author_name?: string[];
  cover_i?: number;
  first_publish_year?: number;
  description?: string | { value: string };
  subjects?: string[]; // From /works/{id}.json API
  subject?: string[]; // From /search.json API
  authors?: { author: { key: string } }[];
  author_details?: Author;
  external_links?: {
    goodreads?: string;
    amazon?: string;
    google?: string;
  };
}

export interface Author {
    name: string;
    bio?: string | { value: string };
    birth_date?: string;
    death_date?: string;
    photos?: number[];
}

export enum BookListStatus {
  Reading = "Reading",
  Completed = "Completed",
  PlanToRead = "Plan to Read",
  OnHold = "On Hold",
  Dropped = "Dropped",
}

export interface UserBook {
  book: Book;
  status: BookListStatus;
  rating: number | null; // 1-5
  review: string | null;
  addedDate: string;
}

export interface User {
  _id: string;
  name: string;
  email: string;
  token?: string;
}