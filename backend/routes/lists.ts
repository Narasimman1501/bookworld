import express from 'express';
import { getBookList, upsertBookInList, removeBookFromList } from '../controllers/listController';
import protect from '../middleware/auth';

const router = express.Router();

router.route('/')
  .get(protect, getBookList)
  .post(protect, upsertBookInList);

router.route('/:workId')
  .delete(protect, removeBookFromList);

export default router;