import mongoose from 'mongoose';
import dotenv from 'dotenv';
import app from './app.js'; // Import the Express app from app.ts

// Load environment variables based on the current environment
if (process.env.NODE_ENV === 'test') {
    dotenv.config({ path: './.env.test' });
} else {
    dotenv.config({ path: './.env' });
}

const PORT = process.env.PORT || 3001;
const MONGO_URI = process.env.MONGO_URI;

// Function to connect to DB and start the server
const startServer = async () => {
  if (!MONGO_URI) {
    console.error('FATAL ERROR: MONGO_URI is not defined.');
    process.exit(1);
  }

  try {
    await mongoose.connect(MONGO_URI);
    console.log(`Successfully connected to MongoDB.`);

    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Failed to connect to MongoDB', error);
    process.exit(1);
  }
};

// Don't start the server automatically in the test environment
if (process.env.NODE_ENV !== 'test') {
    startServer();
}

// Export app and mongoose for testing purposes
export { mongoose, app };