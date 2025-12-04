import express from 'express';
import axios from 'axios';
import asyncHandler from 'express-async-handler';
import { protect } from '../middleware/auth.js';
import recipeCache from '../utils/recipeCache.js';

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

// Enhanced ingredient normalization for better matching
const normalizeIngredientName = (ingredientName) => {
  if (!ingredientName) return '';
  
  return ingredientName
    .toLowerCase()
    .trim()
    // Remove common prefixes/suffixes and plurals
    .replace(/\s*\([^)]*\)/g, '') // Remove parentheses content
    .replace(/\s*fresh\s*/g, ' ')
    .replace(/\s*dried\s*/g, ' ')
    .replace(/\s*chopped\s*/g, ' ')
    .replace(/\s*sliced\s*/g, ' ')
    .replace(/\s*minced\s*/g, ' ')
    .replace(/\s*cubed\s*/g, ' ')
    .replace(/\s*grated\s*/g, ' ')
    .replace(/\s*ground\s*/g, ' ')
    .replace(/s$/, '') // Remove trailing 's' for plurals
    .replace(/\s+/g, ' ') // Normalize spaces
    .trim();
};

// Calculate match metrics between user ingredients and recipe
const calculateMatchMetrics = (userIngredients, recipe) => {
  const normalizedUserIngredients = userIngredients.map(normalizeIngredientName);
  
  // Normalize recipe ingredients
  const normalizedUsedIngredients = recipe.usedIngredients.map(ing => 
    normalizeIngredientName(ing.name)
  );
  const normalizedMissedIngredients = recipe.missedIngredients.map(ing => 
    normalizeIngredientName(ing.name)
  );
  
  const allRecipeIngredients = [...normalizedUsedIngredients, ...normalizedMissedIngredients];
  
  // Calculate matches
  const matchedIngredients = normalizedUsedIngredients.filter(usedIng =>
    normalizedUserIngredients.some(userIng => 
      usedIng.includes(userIng) || userIng.includes(usedIng)
    )
  );
  
  const exactMatches = normalizedUsedIngredients.filter(usedIng =>
    normalizedUserIngredients.some(userIng => 
      usedIng === userIng || 
      Math.abs(usedIng.length - userIng.length) <= 2 && 
      (usedIng.includes(userIng) || userIng.includes(usedIng))
    )
  );
  
  const missingIngredients = normalizedMissedIngredients.filter(missedIng =>
    !normalizedUserIngredients.some(userIng => 
      missedIng.includes(userIng) || userIng.includes(missedIng)
    )
  );
  
  // Calculate match ratio
  const totalUsedIngredients = normalizedUsedIngredients.length;
  const matchRatio = totalUsedIngredients > 0 ? matchedIngredients.length / totalUsedIngredients : 0;
  
  return {
    matchedIngredients,
    exactMatches,
    missingIngredients: missingIngredients.slice(0, 3), // Limit to top 3 missing
    missingCount: missingIngredients.length,
    matchRatio,
    totalUsedIngredients,
    matchedCount: matchedIngredients.length
  };
};

// Enhanced recipe formatting with match data
const formatRecipesWithMatch = (recipes, userIngredients) => {
  return recipes.map(recipe => {
    const matchMetrics = calculateMatchMetrics(userIngredients, recipe);
    
    return {
      id: recipe.id,
      title: recipe.title,
      image: recipe.image,
      usedIngredients: recipe.usedIngredients?.map(ing => ({
        id: ing.id,
        name: ing.name,
        amount: ing.amount,
        unit: ing.unit,
        image: ing.image,
        normalized: normalizeIngredientName(ing.name)
      })) || [],
      missedIngredients: recipe.missedIngredients?.map(ing => ({
        id: ing.id,
        name: ing.name,
        amount: ing.amount,
        unit: ing.unit,
        image: ing.image,
        normalized: normalizeIngredientName(ing.name)
      })) || [],
      likes: recipe.likes,
      unusedIngredients: recipe.unusedIngredients || [],
      matchMetrics: {
        ...matchMetrics,
        score: matchMetrics.matchRatio * 100 - matchMetrics.missingCount * 5 // Weighted score
      }
    };
  });
};

// Categorize recipes into exact matches and one-missing
const categorizeRecipes = (recipes, userIngredients) => {
  const exactMatches = [];
  const oneMissing = [];
  const otherMatches = [];
  
  recipes.forEach(recipe => {
    const { missingCount, matchRatio, matchedCount, totalUsedIngredients } = recipe.matchMetrics;
    
    // Exact match: No missing ingredients and high match ratio
    if (missingCount === 0 && matchRatio >= 0.8) {
      exactMatches.push(recipe);
    }
    // One missing: Only 1 missing ingredient and good match ratio
    else if (missingCount === 1 && matchRatio >= 0.6) {
      oneMissing.push(recipe);
    }
    // Other matches with 2-3 missing ingredients
    else if (missingCount <= 3 && matchRatio >= 0.4) {
      otherMatches.push(recipe);
    }
  });
  
  // Sort exact matches by match ratio (descending), then by likes (descending)
  exactMatches.sort((a, b) => {
    if (b.matchMetrics.matchRatio !== a.matchMetrics.matchRatio) {
      return b.matchMetrics.matchRatio - a.matchMetrics.matchRatio;
    }
    return (b.likes || 0) - (a.likes || 0);
  });
  
  // Sort one-missing by match ratio (descending), then by missing ingredient commonality
  oneMissing.sort((a, b) => {
    if (b.matchMetrics.matchRatio !== a.matchMetrics.matchRatio) {
      return b.matchMetrics.matchRatio - a.matchMetrics.matchRatio;
    }
    return a.matchMetrics.missingCount - b.matchMetrics.missingCount;
  });
  
  // Sort other matches by weighted score
  otherMatches.sort((a, b) => b.matchMetrics.score - a.matchMetrics.score);
  
  return {
    exactMatches,
    oneMissing,
    otherMatches,
    summary: {
      exactMatches: exactMatches.length,
      oneMissing: oneMissing.length,
      otherMatches: otherMatches.length,
      totalRecipes: recipes.length
    }
  };
};

// Enhanced search with matching algorithm
router.post('/by-ingredients', protect, asyncHandler(async (req, res) => {
  const { ingredients, number = 15, ranking = 1, ignorePantry = true } = req.body;
  
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
        number: Math.min(number, 25), // Limit to 25 for better performance
        ranking,
        ignorePantry,
        apiKey: process.env.SPOONACULAR_API_KEY
      }
    });

    // Format recipes with match data
    const recipesWithMatch = formatRecipesWithMatch(response.data, normalizedIngredients);
    
    // Categorize recipes
    const categorizedRecipes = categorizeRecipes(recipesWithMatch, normalizedIngredients);
    
    res.json({
      success: true,
      data: categorizedRecipes,
      searchMeta: {
        userIngredients: normalizedIngredients,
        searchCount: response.data.length
      }
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

// Parse nutrition data from Spoonacular response
const parseNutrition = (nutritionData) => {
  if (!nutritionData || !nutritionData.nutrients) {
    return null;
  }
  
  const nutrients = nutritionData.nutrients;
  
  const getNutrient = (name) => {
    const nutrient = nutrients.find(n => n.name.toLowerCase().includes(name));
    return nutrient ? `${Math.round(nutrient.amount)}${nutrient.unit}` : 'N/A';
  };
  
  return {
    calories: Math.round(nutrients.find(n => n.name === 'Calories')?.amount || 0),
    protein: getNutrient('protein'),
    fat: getNutrient('fat'),
    carbohydrates: getNutrient('carbohydrate')
  };
};

// Parse analyzed instructions
const parseInstructions = (analyzedInstructions) => {
  if (!analyzedInstructions || analyzedInstructions.length === 0) {
    return [];
  }
  
  return analyzedInstructions[0].steps.map(step => ({
    number: step.number,
    step: step.step,
    ingredients: step.ingredients || [],
    equipment: step.equipment || []
  }));
};

// Get detailed recipe information with caching
router.get('/recipe/:id', protect, asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { forceRefresh = false } = req.query;

  // Validate recipe ID
  if (!id || isNaN(id)) {
    return res.status(400).json({
      success: false,
      message: 'Invalid recipe ID'
    });
  }

  const recipeId = parseInt(id);

  try {
    // Try to get from cache first (unless force refresh)
    let recipe = null;
    let source = 'cache';
    
    if (!forceRefresh) {
      recipe = await recipeCache.getRecipe(recipeId);
    }
    
    // If not in cache or force refresh, fetch from API
    if (!recipe) {
      source = 'api';
      
      // Fetch detailed recipe information
      const [recipeResponse, nutritionResponse] = await Promise.all([
        axios.get(`https://api.spoonacular.com/recipes/${recipeId}/information`, {
          params: {
            apiKey: process.env.SPOONACULAR_API_KEY,
            includeNutrition: true
          }
        }),
        axios.get(`https://api.spoonacular.com/recipes/${recipeId}/nutritionWidget.json`, {
          params: {
            apiKey: process.env.SPOONACULAR_API_KEY
          }
        }).catch(() => null) // Nutrition endpoint might fail, but we continue
      ]);
      
      // Prepare recipe data
      const recipeData = {
        id: recipeResponse.data.id,
        title: recipeResponse.data.title,
        image: recipeResponse.data.image,
        summary: recipeResponse.data.summary,
        instructions: recipeResponse.data.instructions,
        readyInMinutes: recipeResponse.data.readyInMinutes,
        servings: recipeResponse.data.servings,
        sourceUrl: recipeResponse.data.sourceUrl,
        spoonacularSourceUrl: recipeResponse.data.spoonacularSourceUrl,
        extendedIngredients: recipeResponse.data.extendedIngredients?.map(ing => ({
          id: ing.id,
          name: ing.name,
          amount: ing.amount,
          unit: ing.unit,
          image: ing.image
        })) || [],
        analyzedInstructions: recipeResponse.data.analyzedInstructions,
        nutrition: parseNutrition(nutritionResponse?.data),
        diets: recipeResponse.data.diets || [],
        cuisines: recipeResponse.data.cuisines || [],
        dishTypes: recipeResponse.data.dishTypes || []
      };
      
      // Save to cache
      recipe = await recipeCache.saveRecipe(recipeData);
      
      if (!recipe) {
        // If cache save failed, use the data directly
        recipe = recipeData;
      }
    }
    
    // Format response
    const formattedRecipe = {
      id: recipe.spoonacularId || recipe.id,
      title: recipe.title,
      image: recipe.image,
      summary: recipe.summary,
      instructions: recipe.instructions,
      analyzedInstructions: parseInstructions(recipe.analyzedInstructions),
      readyInMinutes: recipe.readyInMinutes,
      servings: recipe.servings,
      sourceUrl: recipe.sourceUrl,
      spoonacularSourceUrl: recipe.spoonacularSourceUrl,
      extendedIngredients: recipe.extendedIngredients,
      nutrition: recipe.nutrition,
      diets: recipe.diets || [],
      cuisines: recipe.cuisines || [],
      dishTypes: recipe.dishTypes || [],
      metadata: {
        source,
        lastFetched: recipe.lastFetched,
        fetchCount: recipe.fetchCount || 1,
        cached: source === 'cache'
      }
    };
    
    res.json({
      success: true,
      data: formattedRecipe,
      meta: {
        source,
        cached: source === 'cache',
        attribution: {
          poweredBy: 'Spoonacular API',
          sourceUrl: recipe.spoonacularSourceUrl
        }
      }
    });

  } catch (error) {
    console.error('Recipe fetch error:', error.response?.data || error.message);
    
    if (error.response?.status === 404) {
      return res.status(404).json({
        success: false,
        message: 'Recipe not found'
      });
    }
    
    if (error.response?.status === 402) {
      return res.status(402).json({
        success: false,
        message: 'API quota exceeded. Please try again later.'
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Error fetching recipe details',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
}));

// Get cache statistics (admin endpoint)
router.get('/cache/stats', protect, asyncHandler(async (req, res) => {
  try {
    const stats = await recipeCache.getCacheStats();
    
    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching cache stats'
    });
  }
}));

export default router;