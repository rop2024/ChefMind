import express from 'express';
import authRoutes from './auth.js';
import userRoutes from './users.js';
import searchRoutes from './search.js';
import favoritesRoutes from './favorites.js';
import userRecipesRoutes from './userRecipes.js';

const router = express.Router();

router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/search', searchRoutes);
router.use('/favorites', favoritesRoutes);
router.use('/recipes', userRecipesRoutes);

export default router;
