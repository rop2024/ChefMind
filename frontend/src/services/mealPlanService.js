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

export const mealPlanService = {
  // Get meal plan for a specific date
  getMealPlan: async (date) => {
    try {
      const response = await api.get('/mealplan', {
        params: { date: date.toISOString().split('T')[0] }
      });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch meal plan');
    }
  },

  // Create or update meal plan
  saveMealPlan: async (mealPlanData) => {
    try {
      const response = await api.post('/mealplan', mealPlanData);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to save meal plan');
    }
  },

  // Delete meal plan for a date
  deleteMealPlan: async (date) => {
    try {
      const response = await api.delete('/mealplan', {
        params: { date: date.toISOString().split('T')[0] }
      });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to delete meal plan');
    }
  },

  // Add recipe to meal plan
  addRecipeToMealPlan: async (date, slot, recipe) => {
    try {
      const response = await api.post('/mealplan/add-recipe', {
        date: date.toISOString().split('T')[0],
        slot,
        recipe
      });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to add recipe to meal plan');
    }
  },

  // Remove recipe from meal plan
  removeRecipeFromMealPlan: async (date, slot, recipeId) => {
    try {
      const response = await api.delete('/mealplan/remove-recipe', {
        data: {
          date: date.toISOString().split('T')[0],
          slot,
          recipeId
        }
      });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to remove recipe from meal plan');
    }
  },

  // Get meal plans for date range
  getMealPlansByRange: async (startDate, endDate) => {
    try {
      const response = await api.get('/mealplan/range', {
        params: {
          startDate: startDate.toISOString().split('T')[0],
          endDate: endDate.toISOString().split('T')[0]
        }
      });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch meal plans');
    }
  },

  // Get weekly meal plans
  getWeeklyMealPlans: async (startDate) => {
    try {
      const response = await api.get('/mealplan/weekly', {
        params: startDate ? { startDate: startDate.toISOString().split('T')[0] } : {}
      });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch weekly meal plans');
    }
  },

  // Get meal plan statistics
  getMealPlanStats: async (period = 'month') => {
    try {
      const response = await api.get('/mealplan/stats', {
        params: { period }
      });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch meal plan stats');
    }
  }
};

export default mealPlanService;