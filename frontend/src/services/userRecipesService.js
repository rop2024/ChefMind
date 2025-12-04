import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export const userRecipesService = {
  // Get user's recipes
  getUserRecipes: async () => {
    try {
      const response = await api.get('/recipes/user');
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch recipes');
    }
  },

  // Get public recipes
  getPublicRecipes: async (params = {}) => {
    try {
      const response = await api.get('/recipes/public', { params });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch recipes');
    }
  },

  // Create recipe
  createRecipe: async (recipeData) => {
    try {
      const response = await api.post('/recipes', recipeData);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to create recipe');
    }
  },

  // Get single recipe
  getRecipe: async (recipeId) => {
    try {
      const response = await api.get(`/recipes/user/${recipeId}`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch recipe');
    }
  },

  // Update recipe
  updateRecipe: async (recipeId, recipeData) => {
    try {
      const response = await api.put(`/recipes/user/${recipeId}`, recipeData);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to update recipe');
    }
  },

  // Delete recipe
  deleteRecipe: async (recipeId) => {
    try {
      const response = await api.delete(`/recipes/user/${recipeId}`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to delete recipe');
    }
  },

  // Like recipe
  likeRecipe: async (recipeId) => {
    try {
      const response = await api.post(`/recipes/${recipeId}/like`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to like recipe');
    }
  },

  // Get recipe statistics
  getStats: async () => {
    try {
      const response = await api.get('/recipes/stats');
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch stats');
    }
  }
};

export default userRecipesService;