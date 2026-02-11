import mongoose from "mongoose";
import dotenv from 'dotenv';

// Load environment variables from .env file.
dotenv.config();

// Database connection string construction using environment variables. Make sure to set DB_USERNAME, DB_PASSWORD, and DB_CLUSTER in your .env file. Clusing includes target database name.
const CONNECTION_URL = `mongodb://${process.env.DB_USERNAME}:${process.env.DB_PASSWORD}@${process.env.DB_CLUSTER}`;

// Function to connect to the database.
export const connectDB = async () => {
  try {
    console.log("Connecting to MongoDB database...");
    await mongoose.connect(CONNECTION_URL);
    console.log("Connected to MongoDB database");
  } catch (error) {
    console.error("Error connecting to MongoDB database:", error.message);
    throw error;
  };
};