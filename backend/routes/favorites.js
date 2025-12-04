import express from 'express';
import asyncHandler from 'express-async-handler';
import User from '../models/User.js';
import UserRecipe from '../models/UserRecipe.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// @desc    Add recipe to favorites
// @route   POST /api/favorites
// @access  Private
router.post('/', protect, asyncHandler(async (req, res) => {
  const { recipeId, title, image, source = 'spoonacular' } = req.body;

  if (!recipeId || !title) {
    return res.status(400).json({
      success: false,
      message: 'Please provide recipeId and title'
    });
  }

  // Check if recipe already in favorites
  const user = await User.findById(req.user.id);
  const alreadyFavorite = user.favorites.some(
    fav => fav.recipeId === recipeId && fav.source === source
  );

  if (alreadyFavorite) {
    return res.status(400).json({
      success: false,
      message: 'Recipe already in favorites'
    });
  }

  // Add to favorites
  user.favorites.push({
    recipeId,
    title,
    image,
    source,
    addedAt: new Date()
  });

  await user.save();

  // If it's a user recipe, increment favorites count
  if (source === 'user') {
    await UserRecipe.findByIdAndUpdate(recipeId, {
      $inc: { favoritesCount: 1 }
    });
  }

  res.status(201).json({
    success: true,
    data: {
      favorites: user.favorites,
      message: 'Recipe added to favorites'
    }
  });
}));

// @desc    Remove recipe from favorites
// @route   DELETE /api/favorites/:recipeId
// @access  Private
router.delete('/:recipeId', protect, asyncHandler(async (req, res) => {
  const { recipeId } = req.params;
  const { source = 'spoonacular' } = req.query;

  const user = await User.findById(req.user.id);
  
  // Check if recipe exists in favorites
  const favoriteIndex = user.favorites.findIndex(
    fav => fav.recipeId.toString() === recipeId && fav.source === source
  );

  if (favoriteIndex === -1) {
    return res.status(404).json({
      success: false,
      message: 'Recipe not found in favorites'
    });
  }

  // Remove from favorites
  user.favorites.splice(favoriteIndex, 1);
  await user.save();

  // If it's a user recipe, decrement favorites count
  if (source === 'user') {
    await UserRecipe.findByIdAndUpdate(recipeId, {
      $inc: { favoritesCount: -1 }
    });
  }

  res.json({
    success: true,
    data: {
      favorites: user.favorites,
      message: 'Recipe removed from favorites'
    }
  });
}));

// @desc    Get all favorites
// @route   GET /api/favorites
// @access  Private
router.get('/', protect, asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id).select('favorites');

  // Get detailed information for user recipes
  const userRecipeIds = user.favorites
    .filter(fav => fav.source === 'user')
    .map(fav => fav.recipeId);

  const userRecipes = await UserRecipe.find({
    _id: { $in: userRecipeIds }
  });

  // Merge favorites with detailed recipe data
  const detailedFavorites = user.favorites.map(favorite => {
    if (favorite.source === 'user') {
      const recipe = userRecipes.find(r => r._id.toString() === favorite.recipeId.toString());
      return {
        ...favorite.toObject(),
        recipeDetails: recipe || null
      };
    }
    return favorite;
  });

  res.json({
    success: true,
    data: {
      favorites: detailedFavorites,
      count: detailedFavorites.length
    }
  });
}));

// @desc    Check if recipe is in favorites
// @route   GET /api/favorites/check/:recipeId
// @access  Private
router.get('/check/:recipeId', protect, asyncHandler(async (req, res) => {
  const { recipeId } = req.params;
  const { source = 'spoonacular' } = req.query;

  const user = await User.findById(req.user.id);
  const isFavorite = user.favorites.some(
    fav => fav.recipeId.toString() === recipeId && fav.source === source
  );

  res.json({
    success: true,
    data: {
      isFavorite
    }
  });
}));

// @desc    Get favorites by source
// @route   GET /api/favorites/source/:source
// @access  Private
router.get('/source/:source', protect, asyncHandler(async (req, res) => {
  const { source } = req.params;
  
  const user = await User.findById(req.user.id).select('favorites');
  const sourceFavorites = user.favorites.filter(fav => fav.source === source);

  let detailedFavorites = sourceFavorites;

  if (source === 'user') {
    const userRecipeIds = sourceFavorites.map(fav => fav.recipeId);
    const userRecipes = await UserRecipe.find({
      _id: { $in: userRecipeIds }
    });

    detailedFavorites = sourceFavorites.map(favorite => {
      const recipe = userRecipes.find(r => r._id.toString() === favorite.recipeId.toString());
      return {
        ...favorite.toObject(),
        recipeDetails: recipe || null
      };
    });
  }

  res.json({
    success: true,
    data: {
      favorites: detailedFavorites,
      count: detailedFavorites.length,
      source
    }
  });
}));

export default router;