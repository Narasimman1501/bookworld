import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import morgan from 'morgan';
import connectDB from './config/db';
import authRoutes from './routes/auth';
import listRoutes from './routes/lists';

dotenv.config();

connectDB();

const app = express();

// Middleware
const corsOptions = {
  origin: process.env.CORS_ORIGIN,
  credentials: true, // Enable cookies, if your frontend uses them
};
app.use(cors(corsOptions));

app.use(express.json());
app.use(morgan('dev'));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/lists', listRoutes);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
