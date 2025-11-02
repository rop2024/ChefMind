import express from 'express';
import authRoutes from './auth.js';
import userRoutes from './users.js';
import searchRoutes from './search.js'; // Add this line

const router = express.Router();

router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/search', searchRoutes); // Add this line

// Test API route
router.get('/test', (req, res) => {
  res.json({ message: 'API is working!' });
});

export default router;
