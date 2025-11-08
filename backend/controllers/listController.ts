import { Request, Response } from 'express';
import BookListEntry from '../models/BookListEntry';

// @desc    Get user's book list
// @route   GET /api/lists
// @access  Private
export const getBookList = async (req: Request, res: Response) => {
  try {
    const books = await BookListEntry.find({ user: req.user?.id });
    // Convert to the frontend's expected format: Record<string, UserBook>
    const bookListRecord = books.reduce((acc, entry) => {
      acc[entry.workId] = {
        book: {
            key: `/works/${entry.workId}`,
            title: entry.bookDetails?.title || 'No Title',
            author_name: entry.bookDetails?.author_name || 'Unknown Author',
            cover_i: entry.bookDetails?.cover_i || null,

        },
        status: entry.status,
        rating: entry.rating,
        review: entry.review,
        addedDate: entry.addedDate.toISOString(),
      };
      return acc;
    }, {} as any);
    res.json(bookListRecord);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Add or update a book in the list
// @route   POST /api/lists
// @access  Private
export const upsertBookInList = async (req: Request, res: Response) => {
  const { workId, status, rating, review, bookDetails } = req.body;

  try {
    const bookData = {
      user: req.user?.id,
      workId,
      status,
      rating,
      review,
      bookDetails
    };

    const updatedBook = await BookListEntry.findOneAndUpdate(
      { user: req.user?.id, workId: workId },
      bookData,
      { new: true, upsert: true, runValidators: true }
    );
    
    res.status(200).json(updatedBook);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Remove a book from the list
// @route   DELETE /api/lists/:workId
// @access  Private
export const removeBookFromList = async (req: Request, res: Response) => {
  try {
    const { workId } = req.params;
    const book = await BookListEntry.findOneAndDelete({ user: req.user?.id, workId });

    if (!book) {
      return res.status(404).json({ message: 'Book not found in list' });
    }

    res.json({ message: 'Book removed from list' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};
