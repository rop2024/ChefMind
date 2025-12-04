import express from 'express';
import asyncHandler from 'express-async-handler';
import MealPlan from '../models/MealPlan.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// Helper function to parse nutrition strings
const parseNutritionValue = (value) => {
  if (!value) return 0;
  if (typeof value === 'number') return value;
  const num = parseFloat(value);
  return isNaN(num) ? 0 : num;
};

// @desc    Create or update meal plan for a specific date
// @route   POST /api/mealplan
// @access  Private
router.post('/', protect, asyncHandler(async (req, res) => {
  const { date, meals, notes, isCompleted } = req.body;

  if (!date) {
    return res.status(400).json({
      success: false,
      message: 'Please provide a date'
    });
  }

  // Validate date format
  const planDate = new Date(date);
  if (isNaN(planDate.getTime())) {
    return res.status(400).json({
      success: false,
      message: 'Invalid date format'
    });
  }

  // Normalize date to start of day for consistency
  planDate.setHours(0, 0, 0, 0);

  // Validate meals structure
  if (meals && Array.isArray(meals)) {
    const validSlots = ['breakfast', 'lunch', 'dinner', 'snack'];
    for (const meal of meals) {
      if (!validSlots.includes(meal.slot)) {
        return res.status(400).json({
          success: false,
          message: `Invalid meal slot: ${meal.slot}. Valid slots are: ${validSlots.join(', ')}`
        });
      }
    }
  }

  try {
    // Find existing meal plan or create new one
    let mealPlan = await MealPlan.findOne({
      userId: req.user.id,
      date: planDate
    });

    if (mealPlan) {
      // Update existing meal plan
      mealPlan.meals = meals || mealPlan.meals;
      mealPlan.notes = notes !== undefined ? notes : mealPlan.notes;
      mealPlan.isCompleted = isCompleted !== undefined ? isCompleted : mealPlan.isCompleted;
    } else {
      // Create new meal plan
      mealPlan = new MealPlan({
        userId: req.user.id,
        date: planDate,
        meals: meals || [],
        notes: notes || '',
        isCompleted: isCompleted || false
      });
    }

    await mealPlan.save();

    res.json({
      success: true,
      data: {
        mealPlan,
        message: mealPlan.isNew ? 'Meal plan created successfully' : 'Meal plan updated successfully'
      }
    });

  } catch (error) {
    console.error('Meal plan save error:', error);
    res.status(500).json({
      success: false,
      message: 'Error saving meal plan',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
}));

// @desc    Get meal plan for a specific date
// @route   GET /api/mealplan
// @access  Private
router.get('/', protect, asyncHandler(async (req, res) => {
  const { date } = req.query;

  if (!date) {
    return res.status(400).json({
      success: false,
      message: 'Please provide a date parameter'
    });
  }

  const planDate = new Date(date);
  if (isNaN(planDate.getTime())) {
    return res.status(400).json({
      success: false,
      message: 'Invalid date format'
    });
  }

  // Normalize date to start of day
  planDate.setHours(0, 0, 0, 0);

  const mealPlan = await MealPlan.findOne({
    userId: req.user.id,
    date: planDate
  });

  if (!mealPlan) {
    return res.json({
      success: true,
      data: null,
      message: 'No meal plan found for this date'
    });
  }

  res.json({
    success: true,
    data: {
      mealPlan
    }
  });
}));

// @desc    Get meal plans for a date range
// @route   GET /api/mealplan/range
// @access  Private
router.get('/range', protect, asyncHandler(async (req, res) => {
  const { startDate, endDate } = req.query;

  if (!startDate || !endDate) {
    return res.status(400).json({
      success: false,
      message: 'Please provide startDate and endDate parameters'
    });
  }

  const start = new Date(startDate);
  const end = new Date(endDate);

  if (isNaN(start.getTime()) || isNaN(end.getTime())) {
    return res.status(400).json({
      success: false,
      message: 'Invalid date format'
    });
  }

  // Normalize dates
  start.setHours(0, 0, 0, 0);
  end.setHours(23, 59, 59, 999);

  const mealPlans = await MealPlan.findByDateRange(req.user.id, start, end);

  res.json({
    success: true,
    data: {
      mealPlans,
      count: mealPlans.length
    }
  });
}));

// @desc    Get weekly meal plans
// @route   GET /api/mealplan/weekly
// @access  Private
router.get('/weekly', protect, asyncHandler(async (req, res) => {
  const { startDate } = req.query;
  
  let start;
  if (startDate) {
    start = new Date(startDate);
    if (isNaN(start.getTime())) {
      return res.status(400).json({
        success: false,
        message: 'Invalid date format'
      });
    }
  } else {
    // Default to current week starting from Monday
    start = new Date();
    const day = start.getDay();
    const diff = start.getDate() - day + (day === 0 ? -6 : 1); // adjust when day is Sunday
    start.setDate(diff);
  }

  start.setHours(0, 0, 0, 0);

  const result = await MealPlan.getWeeklySummary(req.user.id, start);

  res.json({
    success: true,
    data: result
  });
}));

// @desc    Delete meal plan for a specific date
// @route   DELETE /api/mealplan
// @access  Private
router.delete('/', protect, asyncHandler(async (req, res) => {
  const { date } = req.query;

  if (!date) {
    return res.status(400).json({
      success: false,
      message: 'Please provide a date parameter'
    });
  }

  const planDate = new Date(date);
  if (isNaN(planDate.getTime())) {
    return res.status(400).json({
      success: false,
      message: 'Invalid date format'
    });
  }

  planDate.setHours(0, 0, 0, 0);

  const mealPlan = await MealPlan.findOneAndDelete({
    userId: req.user.id,
    date: planDate
  });

  if (!mealPlan) {
    return res.status(404).json({
      success: false,
      message: 'Meal plan not found'
    });
  }

  res.json({
    success: true,
    data: {},
    message: 'Meal plan deleted successfully'
  });
}));

// @desc    Add recipe to meal plan
// @route   POST /api/mealplan/add-recipe
// @access  Private
router.post('/add-recipe', protect, asyncHandler(async (req, res) => {
  const { date, slot, recipe } = req.body;

  if (!date || !slot || !recipe) {
    return res.status(400).json({
      success: false,
      message: 'Please provide date, slot, and recipe data'
    });
  }

  const validSlots = ['breakfast', 'lunch', 'dinner', 'snack'];
  if (!validSlots.includes(slot)) {
    return res.status(400).json({
      success: false,
      message: `Invalid slot. Must be one of: ${validSlots.join(', ')}`
    });
  }

  const planDate = new Date(date);
  if (isNaN(planDate.getTime())) {
    return res.status(400).json({
      success: false,
      message: 'Invalid date format'
    });
  }

  planDate.setHours(0, 0, 0, 0);

  // Find or create meal plan
  let mealPlan = await MealPlan.findOne({
    userId: req.user.id,
    date: planDate
  });

  if (!mealPlan) {
    mealPlan = new MealPlan({
      userId: req.user.id,
      date: planDate,
      meals: []
    });
  }

  // Find the meal slot
  let mealSlot = mealPlan.meals.find(m => m.slot === slot);
  if (!mealSlot) {
    mealSlot = { slot, items: [] };
    mealPlan.meals.push(mealSlot);
  }

  // Add recipe to slot
  mealSlot.items.push({
    recipeId: recipe.id,
    title: recipe.title,
    image: recipe.image,
    source: recipe.source || 'spoonacular',
    servings: recipe.servings || 1,
    nutrition: recipe.nutrition || null
  });

  await mealPlan.save();

  res.json({
    success: true,
    data: {
      mealPlan,
      message: 'Recipe added to meal plan'
    }
  });
}));

// @desc    Remove recipe from meal plan
// @route   DELETE /api/mealplan/remove-recipe
// @access  Private
router.delete('/remove-recipe', protect, asyncHandler(async (req, res) => {
  const { date, slot, recipeId } = req.body;

  if (!date || !slot || !recipeId) {
    return res.status(400).json({
      success: false,
      message: 'Please provide date, slot, and recipeId'
    });
  }

  const planDate = new Date(date);
  if (isNaN(planDate.getTime())) {
    return res.status(400).json({
      success: false,
      message: 'Invalid date format'
    });
  }

  planDate.setHours(0, 0, 0, 0);

  const mealPlan = await MealPlan.findOne({
    userId: req.user.id,
    date: planDate
  });

  if (!mealPlan) {
    return res.status(404).json({
      success: false,
      message: 'Meal plan not found'
    });
  }

  const mealSlot = mealPlan.meals.find(m => m.slot === slot);
  if (!mealSlot) {
    return res.status(404).json({
      success: false,
      message: `No ${slot} slot found in meal plan`
    });
  }

  const initialLength = mealSlot.items.length;
  mealSlot.items = mealSlot.items.filter(item => 
    item.recipeId.toString() !== recipeId.toString()
  );

  if (mealSlot.items.length === initialLength) {
    return res.status(404).json({
      success: false,
      message: 'Recipe not found in meal plan'
    });
  }

  // If slot is empty, remove it
  if (mealSlot.items.length === 0) {
    mealPlan.meals = mealPlan.meals.filter(m => m.slot !== slot);
  }

  await mealPlan.save();

  res.json({
    success: true,
    data: {
      mealPlan,
      message: 'Recipe removed from meal plan'
    }
  });
}));

// @desc    Get meal plan statistics
// @route   GET /api/mealplan/stats
// @access  Private
router.get('/stats', protect, asyncHandler(async (req, res) => {
  const { period = 'month' } = req.query;
  
  const now = new Date();
  let startDate, endDate;

  switch (period) {
    case 'week':
      startDate = new Date(now.setDate(now.getDate() - 7));
      break;
    case 'month':
      startDate = new Date(now.setMonth(now.getMonth() - 1));
      break;
    case 'year':
      startDate = new Date(now.setFullYear(now.getFullYear() - 1));
      break;
    default:
      startDate = new Date(now.setMonth(now.getMonth() - 1));
  }

  endDate = new Date();

  const stats = await MealPlan.aggregate([
    {
      $match: {
        userId: req.user.id,
        date: { $gte: startDate, $lte: endDate }
      }
    },
    {
      $group: {
        _id: null,
        totalDaysPlanned: { $sum: 1 },
        totalRecipes: { $sum: { $size: { $reduce: {
          input: "$meals",
          initialValue: [],
          in: { $concatArrays: ["$$value", "$$this.items"] }
        }}}},
        averageCaloriesPerDay: { $avg: "$dailySummary.totalCalories" },
        totalCalories: { $sum: "$dailySummary.totalCalories" },
        mostCommonSlot: {
          $addToSet: "$meals.slot"
        }
      }
    }
  ]);

  const slotStats = await MealPlan.aggregate([
    {
      $match: {
        userId: req.user.id,
        date: { $gte: startDate, $lte: endDate }
      }
    },
    { $unwind: "$meals" },
    { $unwind: "$meals.items" },
    {
      $group: {
        _id: "$meals.slot",
        count: { $sum: 1 },
        averageCalories: { $avg: { $ifNull: ["$meals.items.nutrition.calories", 0] } }
      }
    },
    { $sort: { count: -1 } }
  ]);

  res.json({
    success: true,
    data: {
      period,
      startDate,
      endDate,
      summary: stats[0] || {
        totalDaysPlanned: 0,
        totalRecipes: 0,
        averageCaloriesPerDay: 0,
        totalCalories: 0
      },
      slotStats
    }
  });
}));

export default router;