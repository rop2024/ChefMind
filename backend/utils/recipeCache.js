// Simple in-memory cache for recipes
const CACHE_DURATION_HOURS = 24;
const recipeCache = new Map();

const recipeCacheUtils = {
  // Get recipe from cache
  getRecipe: (recipeId) => {
    const cached = recipeCache.get(recipeId);
    if (!cached) return null;

    // Check if cache is still valid
    const cacheAge = Date.now() - cached.lastFetched;
    const cacheAgeHours = cacheAge / (1000 * 60 * 60);

    if (cacheAgeHours > CACHE_DURATION_HOURS) {
      recipeCache.delete(recipeId);
      return null; // Cache expired
    }

    return cached;
  },

  // Save recipe to cache
  saveRecipe: (recipeData) => {
    const cachedRecipe = {
      ...recipeData,
      lastFetched: Date.now(),
      fetchCount: 1
    };
    recipeCache.set(recipeData.id, cachedRecipe);
  },

  // Get cache stats
  getCacheStats: () => {
    return {
      totalRecipes: recipeCache.size,
      cacheSize: JSON.stringify([...recipeCache]).length
    };
  }
};

export default recipeCacheUtils;