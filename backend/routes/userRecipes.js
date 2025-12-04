import express from 'express';
import asyncHandler from 'express-async-handler';
import UserRecipe from '../models/UserRecipe.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// @desc    Get all user recipes
// @route   GET /api/recipes/user
// @access  Private
router.get('/user', protect, asyncHandler(async (req, res) => {
  const recipes = await UserRecipe.find({ userId: req.user.id })
    .sort({ createdAt: -1 });

  res.json({
    success: true,
    data: {
      recipes,
      count: recipes.length
    }
  });
}));

// @desc    Get public user recipes
// @route   GET /api/recipes/public
// @access  Public
router.get('/public', asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, category, search } = req.query;
  
  const query = { isPublic: true };
  
  if (category) {
    query.category = category;
  }
  
  if (search) {
    query.$text = { $search: search };
  }

  const recipes = await UserRecipe.find(query)
    .populate('userId', 'name')
    .sort({ likes: -1, createdAt: -1 })
    .limit(limit * 1)
    .skip((page - 1) * limit);

  const total = await UserRecipe.countDocuments(query);

  res.json({
    success: true,
    data: {
      recipes,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    }
  });
}));

// @desc    Create user recipe
// @route   POST /api/recipes
// @access  Private
router.post('/', protect, asyncHandler(async (req, res) => {
  const {
    title,
    description,
    image,
    prepTime,
    cookTime,
    servings,
    difficulty,
    ingredients,
    instructions,
    nutrition,
    tags,
    category,
    isPublic
  } = req.body;

  // Validate required fields
  if (!title || !prepTime || !cookTime || !servings || !ingredients || !instructions) {
    return res.status(400).json({
      success: false,
      message: 'Please provide all required fields'
    });
  }

  // Validate ingredients array
  if (!Array.isArray(ingredients) || ingredients.length === 0) {
    return res.status(400).json({
      success: false,
      message: 'Please provide at least one ingredient'
    });
  }

  // Validate instructions array
  if (!Array.isArray(instructions) || instructions.length === 0) {
    return res.status(400).json({
      success: false,
      message: 'Please provide at least one instruction'
    });
  }

  // Create recipe
  const recipe = await UserRecipe.create({
    userId: req.user.id,
    title,
    description,
    image: image || '/default-recipe.jpg',
    prepTime,
    cookTime,
    servings,
    difficulty: difficulty || 'Medium',
    ingredients,
    instructions: instructions.map((inst, index) => ({
      stepNumber: index + 1,
      instruction: inst
    })),
    nutrition,
    tags: tags || [],
    category: category || 'Other',
    isPublic: isPublic || false
  });

  res.status(201).json({
    success: true,
    data: {
      recipe
    }
  });
}));

// @desc    Get single user recipe
// @route   GET /api/recipes/user/:id
// @access  Private
router.get('/user/:id', protect, asyncHandler(async (req, res) => {
  const recipe = await UserRecipe.findOne({
    _id: req.params.id,
    userId: req.user.id
  });

  if (!recipe) {
    return res.status(404).json({
      success: false,
      message: 'Recipe not found'
    });
  }

  res.json({
    success: true,
    data: {
      recipe
    }
  });
}));

// @desc    Update user recipe
// @route   PUT /api/recipes/user/:id
// @access  Private
router.put('/user/:id', protect, asyncHandler(async (req, res) => {
  let recipe = await UserRecipe.findOne({
    _id: req.params.id,
    userId: req.user.id
  });

  if (!recipe) {
    return res.status(404).json({
      success: false,
      message: 'Recipe not found'
    });
  }

  recipe = await UserRecipe.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  });

  res.json({
    success: true,
    data: {
      recipe
    }
  });
}));

// @desc    Delete user recipe
// @route   DELETE /api/recipes/user/:id
// @access  Private
router.delete('/user/:id', protect, asyncHandler(async (req, res) => {
  const recipe = await UserRecipe.findOne({
    _id: req.params.id,
    userId: req.user.id
  });

  if (!recipe) {
    return res.status(404).json({
      success: false,
      message: 'Recipe not found'
    });
  }

  await recipe.deleteOne();

  res.json({
    success: true,
    data: {},
    message: 'Recipe deleted successfully'
  });
}));

// @desc    Like a user recipe
// @route   POST /api/recipes/:id/like
// @access  Public
router.post('/:id/like', asyncHandler(async (req, res) => {
  const recipe = await UserRecipe.findByIdAndUpdate(
    req.params.id,
    { $inc: { likes: 1 } },
    { new: true }
  );

  if (!recipe) {
    return res.status(404).json({
      success: false,
      message: 'Recipe not found'
    });
  }

  res.json({
    success: true,
    data: {
      likes: recipe.likes
    }
  });
}));

// @desc    Get recipe statistics
// @route   GET /api/recipes/stats
// @access  Private
router.get('/stats', protect, asyncHandler(async (req, res) => {
  const stats = await UserRecipe.aggregate([
    { $match: { userId: req.user.id } },
    {
      $group: {
        _id: null,
        totalRecipes: { $sum: 1 },
        totalLikes: { $sum: '$likes' },
        totalFavorites: { $sum: '$favoritesCount' },
        avgPrepTime: { $avg: '$prepTime' },
        avgCookTime: { $avg: '$cookTime' }
      }
    }
  ]);

  const categoryStats = await UserRecipe.aggregate([
    { $match: { userId: req.user.id } },
    {
      $group: {
        _id: '$category',
        count: { $sum: 1 }
      }
    }
  ]);

  res.json({
    success: true,
    data: {
      stats: stats[0] || {
        totalRecipes: 0,
        totalLikes: 0,
        totalFavorites: 0,
        avgPrepTime: 0,
        avgCookTime: 0
      },
      categories: categoryStats
    }
  });
}));

export default router;