import Recipe from '../models/Recipe.js';

// Cache duration in hours
const CACHE_DURATION_HOURS = 24;

const recipeCache = {
  // Get recipe from cache
  getRecipe: async (recipeId) => {
    try {
      const recipe = await Recipe.findOne({ spoonacularId: recipeId });
      
      if (!recipe) {
        return null;
      }
      
      // Check if cache is still valid
      const cacheAge = Date.now() - recipe.lastFetched;
      const cacheAgeHours = cacheAge / (1000 * 60 * 60);
      
      if (cacheAgeHours > CACHE_DURATION_HOURS) {
        return null; // Cache expired
      }
      
      // Update fetch count
      recipe.fetchCount += 1;
      await recipe.save();
      
      return recipe;
    } catch (error) {
      console.error('Cache read error:', error);
      return null;
    }
  },
  
  // Save recipe to cache
  saveRecipe: async (recipeData) => {
    try {
      const recipe = await Recipe.findOneAndUpdate(
        { spoonacularId: recipeData.id },
        {
          $set: {
            title: recipeData.title,
            image: recipeData.image,
            summary: recipeData.summary,
            instructions: recipeData.instructions,
            readyInMinutes: recipeData.readyInMinutes,
            servings: recipeData.servings,
            sourceUrl: recipeData.sourceUrl,
            spoonacularSourceUrl: recipeData.spoonacularSourceUrl,
            extendedIngredients: recipeData.extendedIngredients,
            analyzedInstructions: recipeData.analyzedInstructions,
            nutrition: recipeData.nutrition,
            diets: recipeData.diets,
            cuisines: recipeData.cuisines,
            dishTypes: recipeData.dishTypes,
            lastFetched: new Date()
          },
          $inc: { fetchCount: 1 },
          $setOnInsert: {
            createdAt: new Date()
          }
        },
        {
          upsert: true,
          new: true,
          runValidators: true
        }
      );
      
      return recipe;
    } catch (error) {
      console.error('Cache save error:', error);
      return null;
    }
  },
  
  // Get recipe stats
  getCacheStats: async () => {
    try {
      const totalRecipes = await Recipe.countDocuments();
      const totalFetches = await Recipe.aggregate([
        { $group: { _id: null, total: { $sum: '$fetchCount' } } }
      ]);
      
      const oldestCache = await Recipe.findOne()
        .sort({ lastFetched: 1 })
        .select('title lastFetched');
      
      const newestCache = await Recipe.findOne()
        .sort({ lastFetched: -1 })
        .select('title lastFetched');
      
      return {
        totalRecipes,
        totalFetches: totalFetches[0]?.total || 0,
        oldestCache: oldestCache ? {
          title: oldestCache.title,
          lastFetched: oldestCache.lastFetched
        } : null,
        newestCache: newestCache ? {
          title: newestCache.title,
          lastFetched: newestCache.lastFetched
        } : null
      };
    } catch (error) {
      console.error('Cache stats error:', error);
      return null;
    }
  }
};

export default recipeCache;