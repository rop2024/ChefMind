import express from 'express';
import dotenv from 'dotenv';
import connectDB from './config/database.js';
import corsMiddleware from './middleware/cors.js';
import errorHandler from './middleware/error.js';

// Route imports
import authRoutes from './routes/auth.js';
import userRoutes from './routes/users.js';
import apiRoutes from './routes/api.js';

// Load env vars
dotenv.config();

// Helpful startup logs so it's obvious which client origin the server will allow
console.log('Server starting with:');
console.log(`  NODE_ENV=${process.env.NODE_ENV}`);
console.log(`  PORT=${process.env.PORT}`);
console.log(`  CLIENT_URL=${process.env.CLIENT_URL}`);

// Connect to database
connectDB();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(corsMiddleware);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Mount routers
app.use('/api/auth', authRoutes);
// Mount public API routes first so they are reachable (e.g. /api/users public endpoints)
app.use('/api', apiRoutes);
// Mount admin-protected user routes after public API routes
app.use('/api/users', userRoutes);


// Health check
app.get('/health', (req, res) => {
  console.log('[DEBUG] Health check called');
  res.json({ 
    status: 'Server is running!', 
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV 
  });
});

// Error handling middleware (must be after routes)
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
});
