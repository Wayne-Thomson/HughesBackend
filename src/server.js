import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import vehicleRoutes from './routes/vehicleRoutes.js';
import userRoutes from './routes/userRoutes.js';
import companyStatsRoutes from './routes/companyStatsRoutes.js';
import bodyParser from 'body-parser';
import { connectDB } from './config/db.js';
import { rateLimiter } from './middleware/rateLimiter.js';

// Load environment variables from .env file.
dotenv.config();

// Initialize Express app.
const app = express();
// Set constant for port.
const PORT = process.env.PORT || 3000;

// cors middleware to allow cross-origin requests.
app.use(cors());

// Middleware to parse JSON request bodies.
// app.use(express.json());

// Body parser middleware to handle large request bodies.
app.use(bodyParser.json({ limit: "15mb", extended: true}));
app.use(bodyParser.urlencoded({ limit: "15mb", extended: true}));
app.use(rateLimiter);

// Use routes for vehicles, users, and company stats.
app.use("/api/vehicle", vehicleRoutes);
app.use("/api/user", userRoutes);
app.use("/api/company", companyStatsRoutes);

// Start the server after successful database connection.
connectDB().then(() => {
  console.log("Connected to the database successfully.");
  app.listen(PORT, () => {
    console.log(`Server running on port: ${PORT}`);
  });
}).catch((error) => {
  console.error("Database connection failed:", error);
  process.exit(1); // Exit the process with failure.
});


