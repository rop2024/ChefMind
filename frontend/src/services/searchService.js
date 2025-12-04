import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Create axios instance with auth header
const api = axios.create({
  baseURL: API_URL,
});

// Add token to requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('promptly_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export const searchService = {
  // Search recipes by ingredients
  searchByIngredients: async (ingredients, options = {}) => {
    try {
      const response = await api.post('/search/by-ingredients', {
        ingredients,
        number: options.number || 10,
        ranking: options.ranking || 1,
        ignorePantry: options.ignorePantry !== false
      });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to search recipes');
    }
  },

  // Get detailed recipe information
  getRecipeDetails: async (recipeId, forceRefresh = false) => {
    try {
      const response = await api.get(`/search/recipe/${recipeId}`, {
        params: { forceRefresh }
      });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch recipe details');
    }
  }
};

export default searchService;