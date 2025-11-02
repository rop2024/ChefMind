import express from 'express';
import axios from 'axios';
import asyncHandler from 'express-async-handler';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// Normalize ingredient input
const normalizeIngredients = (ingredients) => {
  if (!ingredients) return [];
  
  if (Array.isArray(ingredients)) {
    return ingredients.map(ing => ing.toLowerCase().trim()).filter(ing => ing.length > 0);
  }
  
  if (typeof ingredients === 'string') {
    return ingredients.split(',')
      .map(ing => ing.toLowerCase().trim())
      .filter(ing => ing.length > 0);
  }
  
  return [];
};

// Format recipe data from Spoonacular response
const formatRecipes = (recipes) => {
  return recipes.map(recipe => ({
    id: recipe.id,
    title: recipe.title,
    image: recipe.image,
    usedIngredients: recipe.usedIngredients?.map(ing => ({
      id: ing.id,
      name: ing.name,
      amount: ing.amount,
      unit: ing.unit,
      image: ing.image
    })) || [],
    missedIngredients: recipe.missedIngredients?.map(ing => ({
      id: ing.id,
      name: ing.name,
      amount: ing.amount,
      unit: ing.unit,
      image: ing.image
    })) || [],
    likes: recipe.likes,
    unusedIngredients: recipe.unusedIngredients || []
  }));
};

// Search recipes by ingredients
router.post('/by-ingredients', protect, asyncHandler(async (req, res) => {
  const { ingredients, number = 10, ranking = 1, ignorePantry = true } = req.body;
  
  if (!ingredients || (Array.isArray(ingredients) && ingredients.length === 0)) {
    return res.status(400).json({
      success: false,
      message: 'Please provide at least one ingredient'
    });
  }

  const normalizedIngredients = normalizeIngredients(ingredients);
  
  if (normalizedIngredients.length === 0) {
    return res.status(400).json({
      success: false,
      message: 'No valid ingredients provided'
    });
  }

  try {
    const response = await axios.get('https://api.spoonacular.com/recipes/findByIngredients', {
      params: {
        ingredients: normalizedIngredients.join(','),
        number,
        ranking,
        ignorePantry,
        apiKey: process.env.SPOONACULAR_API_KEY
      }
    });

    const formattedRecipes = formatRecipes(response.data);
    
    res.json({
      success: true,
      count: formattedRecipes.length,
      data: formattedRecipes
    });

  } catch (error) {
    console.error('Spoonacular API Error:', error.response?.data || error.message);
    
    if (error.response?.status === 402) {
      return res.status(402).json({
        success: false,
        message: 'API quota exceeded. Please try again later.'
      });
    }
    
    if (error.response?.status === 401) {
      return res.status(401).json({
        success: false,
        message: 'Invalid API key. Please check your Spoonacular API configuration.'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Error fetching recipes from Spoonacular API',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
}));

// Get recipe information by ID
router.get('/recipe/:id', protect, asyncHandler(async (req, res) => {
  const { id } = req.params;

  try {
    const response = await axios.get(`https://api.spoonacular.com/recipes/${id}/information`, {
      params: {
        apiKey: process.env.SPOONACULAR_API_KEY,
        includeNutrition: false
      }
    });

    const recipe = {
      id: response.data.id,
      title: response.data.title,
      image: response.data.image,
      summary: response.data.summary,
      instructions: response.data.instructions,
      readyInMinutes: response.data.readyInMinutes,
      servings: response.data.servings,
      sourceUrl: response.data.sourceUrl,
      extendedIngredients: response.data.extendedIngredients?.map(ing => ({
        id: ing.id,
        name: ing.name,
        amount: ing.amount,
        unit: ing.unit,
        image: ing.image
      })) || []
    };

    res.json({
      success: true,
      data: recipe
    });

  } catch (error) {
    console.error('Spoonacular API Error:', error.response?.data || error.message);
    
    res.status(500).json({
      success: false,
      message: 'Error fetching recipe details',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
}));

export default router;