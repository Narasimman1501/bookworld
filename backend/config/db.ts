import mongoose from 'mongoose';

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI as string);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error: any) {
    console.error(`Error: ${error.message}`);
    // Throwing the error on a failed DB connection will cause an unhandled
    // promise rejection, which correctly terminates the server process on startup.
    throw error;
  }
};

export default connectDB;
