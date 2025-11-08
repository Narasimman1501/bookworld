import mongoose, { Schema } from 'mongoose';

const bookListEntrySchema = new mongoose.Schema({
  user: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  workId: { type: String, required: true },
  status: { type: String, required: true },
  rating: { type: Number, default: null },
  review: { type: String, default: null },
  addedDate: { type: Date, default: Date.now },
  bookDetails: {
      title: String,
      author_name: [String],
      cover_i: Number,
  }
}, {
  timestamps: true,
});

// Create a compound index to ensure a user can only have one entry per book
bookListEntrySchema.index({ user: 1, workId: 1 }, { unique: true });

const BookListEntry = mongoose.model('BookListEntry', bookListEntrySchema);

export default BookListEntry;
