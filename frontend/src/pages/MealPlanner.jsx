import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import authService from '../services/authService';
import mealPlanService from '../services/mealPlanService';
import searchService from '../services/searchService';
import userRecipesService from '../services/userRecipesService';

const MealPlanner = () => {
  const navigate = useNavigate();
  const user = authService.getCurrentUser();

  const [selectedDate, setSelectedDate] = useState(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return today;
  });

  const [mealPlan, setMealPlan] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [notes, setNotes] = useState('');
  const [isCompleted, setIsCompleted] = useState(false);
  const [showRecipeSearch, setShowRecipeSearch] = useState({ slot: null, show: false });
  const [searchResults, setSearchResults] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchLoading, setSearchLoading] = useState(false);
  const [stats, setStats] = useState(null);

  // Format date for display
  const formatDate = (date) => {
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // Navigate to previous/next day
  const navigateDay = (direction) => {
    const newDate = new Date(selectedDate);
    newDate.setDate(newDate.getDate() + direction);
    setSelectedDate(newDate);
  };

  // Fetch meal plan for selected date
  useEffect(() => {
    fetchMealPlan();
    fetchStats();
  }, [selectedDate]);

  const fetchMealPlan = async () => {
    setLoading(true);
    setError('');
    
    try {
      const result = await mealPlanService.getMealPlan(selectedDate);
      if (result.data?.mealPlan) {
        setMealPlan(result.data.mealPlan);
        setNotes(result.data.mealPlan.notes || '');
        setIsCompleted(result.data.mealPlan.isCompleted || false);
      } else {
        setMealPlan({
          date: selectedDate,
          meals: [],
          dailySummary: {
            totalCalories: 0,
            totalProtein: '0g',
            totalFat: '0g',
            totalCarbs: '0g',
            proteinPercentage: 0,
            fatPercentage: 0,
            carbsPercentage: 0
          }
        });
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const result = await mealPlanService.getMealPlanStats('month');
      setStats(result.data);
    } catch (err) {
      console.error('Failed to fetch stats:', err);
    }
  };

  const saveMealPlan = async () => {
    setSaving(true);
    setError('');

    try {
      const planData = {
        date: selectedDate.toISOString(),
        meals: mealPlan?.meals || [],
        notes,
        isCompleted
      };

      const result = await mealPlanService.saveMealPlan(planData);
      if (result.success) {
        setMealPlan(result.data.mealPlan);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const deleteMealPlan = async () => {
    if (window.confirm('Are you sure you want to delete this meal plan?')) {
      try {
        await mealPlanService.deleteMealPlan(selectedDate);
        setMealPlan({
          date: selectedDate,
          meals: [],
          dailySummary: {
            totalCalories: 0,
            totalProtein: '0g',
            totalFat: '0g',
            totalCarbs: '0g'
          }
        });
        setNotes('');
        setIsCompleted(false);
      } catch (err) {
        setError(err.message);
      }
    }
  };

  const searchRecipes = async (query) => {
    if (!query.trim()) return;

    setSearchLoading(true);
    setSearchQuery(query);

    try {
      // Search both Spoonacular and user recipes
      const [spoonacularResults, userResults] = await Promise.all([
        searchService.searchByIngredients([query], { number: 5 }).catch(() => ({ data: { exactMatches: [] } })),
        userRecipesService.getPublicRecipes({ search: query, limit: 5 }).catch(() => ({ data: { recipes: [] } }))
      ]);

      const spoonacularRecipes = spoonacularResults.data?.exactMatches || [];
      const userRecipes = userResults.data?.recipes || [];

      const allResults = [
        ...spoonacularRecipes.map(recipe => ({
          ...recipe,
          source: 'spoonacular',
          id: recipe.id.toString()
        })),
        ...userRecipes.map(recipe => ({
          ...recipe,
          source: 'user',
          id: recipe._id,
          nutrition: recipe.nutrition || {
            calories: 0,
            protein: '0g',
            fat: '0g',
            carbohydrates: '0g'
          }
        }))
      ];

      setSearchResults(allResults);
    } catch (err) {
      console.error('Search error:', err);
      setSearchResults([]);
    } finally {
      setSearchLoading(false);
    }
  };

  const addRecipeToSlot = async (slot, recipe) => {
    try {
      const result = await mealPlanService.addRecipeToMealPlan(selectedDate, slot, recipe);
      if (result.success) {
        setMealPlan(result.data.mealPlan);
        setShowRecipeSearch({ slot: null, show: false });
        setSearchResults([]);
        setSearchQuery('');
      }
    } catch (err) {
      setError(err.message);
    }
  };

  const removeRecipeFromSlot = async (slot, recipeId) => {
    try {
      const result = await mealPlanService.removeRecipeFromMealPlan(selectedDate, slot, recipeId);
      if (result.success) {
        setMealPlan(result.data.mealPlan);
      }
    } catch (err) {
      setError(err.message);
    }
  };

  const getSlotMeals = (slot) => {
    if (!mealPlan?.meals) return [];
    const mealSlot = mealPlan.meals.find(m => m.slot === slot);
    return mealSlot ? mealSlot.items : [];
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md w-full bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Sign In Required</h2>
          <p className="text-gray-600 mb-6">Please sign in to use the meal planner.</p>
          <div className="flex space-x-4">
            <button
              onClick={() => navigate('/login')}
              className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition"
            >
              Sign In
            </button>
            <button
              onClick={() => navigate('/register')}
              className="flex-1 bg-gray-200 text-gray-800 py-2 px-4 rounded-md hover:bg-gray-300 transition"
            >
              Register
            </button>
          </div>
        </div>
      </div>
    );
  }

  const mealSlots = [
    { id: 'breakfast', label: 'Breakfast', icon: '🍳', color: 'bg-yellow-50 border-yellow-200' },
    { id: 'lunch', label: 'Lunch', icon: '🥗', color: 'bg-green-50 border-green-200' },
    { id: 'dinner', label: 'Dinner', icon: '🍲', color: 'bg-blue-50 border-blue-200' },
    { id: 'snack', label: 'Snack', icon: '🍎', color: 'bg-purple-50 border-purple-200' }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Meal Planner</h1>
          <p className="text-gray-600 mt-2">Plan your meals and track nutrition</p>
        </div>

        {/* Stats Overview */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-white rounded-lg shadow p-6">
              <div className="text-2xl font-bold text-blue-600">{stats.summary?.totalDaysPlanned || 0}</div>
              <div className="text-sm text-gray-600">Days Planned</div>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <div className="text-2xl font-bold text-green-600">{stats.summary?.totalRecipes || 0}</div>
              <div className="text-sm text-gray-600">Total Recipes</div>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <div className="text-2xl font-bold text-purple-600">
                {Math.round(stats.summary?.averageCaloriesPerDay || 0)}
              </div>
              <div className="text-sm text-gray-600">Avg Calories/Day</div>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <div className="text-2xl font-bold text-yellow-600">
                {stats.slotStats?.[0]?._id || 'N/A'}
              </div>
              <div className="text-sm text-gray-600">Most Planned Meal</div>
            </div>
          </div>
        )}

        {/* Date Navigation */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigateDay(-1)}
                className="p-2 rounded-full hover:bg-gray-100"
              >
                ←
              </button>
              <div className="text-center">
                <h2 className="text-xl font-semibold text-gray-800">{formatDate(selectedDate)}</h2>
                <div className="flex items-center justify-center space-x-4 mt-2">
                  <button
                    onClick={() => setSelectedDate(new Date())}
                    className="text-sm text-blue-600 hover:text-blue-800"
                  >
                    Today
                  </button>
                  <input
                    type="date"
                    value={selectedDate.toISOString().split('T')[0]}
                    onChange={(e) => setSelectedDate(new Date(e.target.value))}
                    className="text-sm border rounded px-2 py-1"
                  />
                </div>
              </div>
              <button
                onClick={() => navigateDay(1)}
                className="p-2 rounded-full hover:bg-gray-100"
              >
                →
              </button>
            </div>

            <div className="flex items-center space-x-4">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="isCompleted"
                  checked={isCompleted}
                  onChange={(e) => setIsCompleted(e.target.checked)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500"
                />
                <label htmlFor="isCompleted" className="ml-2 text-sm text-gray-700">
                  Mark as completed
                </label>
              </div>
              <button
                onClick={saveMealPlan}
                disabled={saving}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
              >
                {saving ? 'Saving...' : 'Save Plan'}
              </button>
              {mealPlan?._id && (
                <button
                  onClick={deleteMealPlan}
                  className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
                >
                  Delete
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md mb-6">
            {error}
          </div>
        )}

        {/* Loading State */}
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : (
          <>
            {/* Nutrition Summary */}
            <div className="bg-white rounded-lg shadow-md p-6 mb-8">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">Daily Nutrition Summary</h2>
              <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-gray-900">
                    {mealPlan?.dailySummary?.totalCalories || 0}
                  </div>
                  <div className="text-sm text-gray-600">Calories</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">
                    {mealPlan?.dailySummary?.totalProtein || '0g'}
                  </div>
                  <div className="text-sm text-gray-600">Protein</div>
                  {mealPlan?.dailySummary?.proteinPercentage > 0 && (
                    <div className="text-xs text-gray-500">
                      {mealPlan.dailySummary.proteinPercentage}% of macros
                    </div>
                  )}
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-yellow-600">
                    {mealPlan?.dailySummary?.totalCarbs || '0g'}
                  </div>
                  <div className="text-sm text-gray-600">Carbs</div>
                  {mealPlan?.dailySummary?.carbsPercentage > 0 && (
                    <div className="text-xs text-gray-500">
                      {mealPlan.dailySummary.carbsPercentage}% of macros
                    </div>
                  )}
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-red-600">
                    {mealPlan?.dailySummary?.totalFat || '0g'}
                  </div>
                  <div className="text-sm text-gray-600">Fat</div>
                  {mealPlan?.dailySummary?.fatPercentage > 0 && (
                    <div className="text-xs text-gray-500">
                      {mealPlan.dailySummary.fatPercentage}% of macros
                    </div>
                  )}
                </div>
                <div className="flex items-center justify-center">
                  <MacroChart
                    protein={mealPlan?.dailySummary?.proteinPercentage || 0}
                    carbs={mealPlan?.dailySummary?.carbsPercentage || 0}
                    fat={mealPlan?.dailySummary?.fatPercentage || 0}
                  />
                </div>
              </div>
            </div>

            {/* Meal Slots */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {mealSlots.map((slot) => (
                <MealSlot
                  key={slot.id}
                  slot={slot}
                  meals={getSlotMeals(slot.id)}
                  onAddClick={() => setShowRecipeSearch({ slot: slot.id, show: true })}
                  onRemoveMeal={removeRecipeFromSlot}
                />
              ))}
            </div>

            {/* Notes Section */}
            <div className="bg-white rounded-lg shadow-md p-6 mb-8">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">Notes</h2>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Add notes about your meal plan..."
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                rows="3"
              />
            </div>

            {/* Recipe Search Modal */}
            {showRecipeSearch.show && (
              <RecipeSearchModal
                slot={showRecipeSearch.slot}
                searchQuery={searchQuery}
                searchResults={searchResults}
                searchLoading={searchLoading}
                onSearch={searchRecipes}
                onAddRecipe={addRecipeToSlot}
                onClose={() => {
                  setShowRecipeSearch({ slot: null, show: false });
                  setSearchResults([]);
                  setSearchQuery('');
                }}
              />
            )}
          </>
        )}
      </div>
    </div>
  );
};

// Macro Chart Component
const MacroChart = ({ protein, carbs, fat }) => {
  const total = protein + carbs + fat || 1;
  
  return (
    <div className="relative w-20 h-20">
      <svg viewBox="0 0 100 100" className="transform -rotate-90">
        {/* Protein (Green) */}
        <circle
          cx="50"
          cy="50"
          r="40"
          stroke="#10B981"
          strokeWidth="20"
          strokeDasharray={`${(protein / total) * 251.2} 251.2`}
          fill="none"
        />
        {/* Carbs (Yellow) */}
        <circle
          cx="50"
          cy="50"
          r="40"
          stroke="#FBBF24"
          strokeWidth="20"
          strokeDasharray={`${(carbs / total) * 251.2} 251.2`}
          strokeDashoffset={-((protein / total) * 251.2)}
          fill="none"
        />
        {/* Fat (Red) */}
        <circle
          cx="50"
          cy="50"
          r="40"
          stroke="#EF4444"
          strokeWidth="20"
          strokeDasharray={`${(fat / total) * 251.2} 251.2`}
          strokeDashoffset={-(((protein + carbs) / total) * 251.2)}
          fill="none"
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="text-center">
          <div className="text-xs font-semibold">Macros</div>
        </div>
      </div>
    </div>
  );
};

// Meal Slot Component
const MealSlot = ({ slot, meals, onAddClick, onRemoveMeal }) => {
  const getSlotCalories = () => {
    return meals.reduce((total, meal) => total + (meal.nutrition?.calories || 0), 0);
  };

  return (
    <div className={`rounded-lg border-2 ${slot.color} overflow-hidden`}>
      <div className="p-4 border-b">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <span className="text-2xl mr-2">{slot.icon}</span>
            <div>
              <h3 className="font-semibold text-gray-800">{slot.label}</h3>
              <p className="text-sm text-gray-600">{meals.length} items</p>
            </div>
          </div>
          <div className="text-right">
            <div className="font-bold text-gray-900">{getSlotCalories()} cal</div>
          </div>
        </div>
      </div>
      
      <div className="p-4 bg-white">
        {meals.length > 0 ? (
          <div className="space-y-3">
            {meals.map((meal, index) => (
              <MealItem
                key={index}
                meal={meal}
                onRemove={() => onRemoveMeal(slot.id, meal.recipeId)}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-4">
            <p className="text-gray-500 text-sm">No meals planned</p>
          </div>
        )}
        
        <button
          onClick={onAddClick}
          className="w-full mt-4 px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition flex items-center justify-center"
        >
          <span className="mr-2">+</span> Add Recipe
        </button>
      </div>
    </div>
  );
};

// Meal Item Component
const MealItem = ({ meal, onRemove }) => {
  const [showDetails, setShowDetails] = useState(false);

  return (
    <div className="bg-gray-50 rounded-lg p-3 hover:bg-gray-100 transition">
      <div className="flex justify-between items-start">
        <div className="flex-1">
          <div className="flex items-center">
            <img
              src={meal.image || '/default-recipe.jpg'}
              alt={meal.title}
              className="w-10 h-10 rounded-md object-cover mr-3"
            />
            <div>
              <h4 className="font-medium text-gray-800 text-sm line-clamp-1">{meal.title}</h4>
              <div className="flex items-center text-xs text-gray-500 mt-1">
                <span className={`px-1.5 py-0.5 rounded ${
                  meal.source === 'spoonacular' 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-purple-100 text-purple-800'
                }`}>
                  {meal.source === 'spoonacular' ? 'API' : 'My'}
                </span>
                {meal.nutrition?.calories && (
                  <span className="ml-2">• {meal.nutrition.calories} cal</span>
                )}
              </div>
            </div>
          </div>
          
          {showDetails && meal.nutrition && (
            <div className="mt-2 pt-2 border-t border-gray-200">
              <div className="grid grid-cols-3 gap-2 text-xs">
                <div className="text-center">
                  <div className="font-medium text-green-600">{meal.nutrition.protein || '0g'}</div>
                  <div className="text-gray-500">Protein</div>
                </div>
                <div className="text-center">
                  <div className="font-medium text-yellow-600">{meal.nutrition.carbohydrates || '0g'}</div>
                  <div className="text-gray-500">Carbs</div>
                </div>
                <div className="text-center">
                  <div className="font-medium text-red-600">{meal.nutrition.fat || '0g'}</div>
                  <div className="text-gray-500">Fat</div>
                </div>
              </div>
            </div>
          )}
        </div>
        
        <div className="flex items-center space-x-2 ml-2">
          <button
            onClick={() => setShowDetails(!showDetails)}
            className="text-gray-400 hover:text-gray-600"
            title="Show nutrition"
          >
            {showDetails ? '↑' : '↓'}
          </button>
          <button
            onClick={onRemove}
            className="text-red-400 hover:text-red-600"
            title="Remove"
          >
            ×
          </button>
        </div>
      </div>
    </div>
  );
};

// Recipe Search Modal Component
const RecipeSearchModal = ({ slot, searchQuery, searchResults, searchLoading, onSearch, onAddRecipe, onClose }) => {
  const slotLabels = {
    breakfast: 'Breakfast',
    lunch: 'Lunch',
    dinner: 'Dinner',
    snack: 'Snack'
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[80vh] overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-xl font-semibold text-gray-800">
                Add recipe to {slotLabels[slot] || slot}
              </h2>
              <p className="text-gray-600 text-sm mt-1">Search for recipes to add</p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Search Input */}
        <div className="p-6 border-b">
          <div className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => onSearch(e.target.value)}
              placeholder="Search for recipes (e.g., chicken, pasta, salad)..."
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              autoFocus
            />
            {searchLoading && (
              <div className="absolute right-3 top-3">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
              </div>
            )}
          </div>
        </div>

        {/* Search Results */}
        <div className="overflow-y-auto max-h-[50vh]">
          {searchResults.length > 0 ? (
            <div className="divide-y">
              {searchResults.map((recipe, index) => (
                <div key={index} className="p-4 hover:bg-gray-50 transition">
                  <div className="flex items-center">
                    <img
                      src={recipe.image || '/default-recipe.jpg'}
                      alt={recipe.title}
                      className="w-16 h-16 rounded-md object-cover"
                    />
                    <div className="ml-4 flex-1">
                      <h3 className="font-medium text-gray-800">{recipe.title}</h3>
                      <div className="flex items-center mt-1 space-x-3">
                        <span className={`text-xs px-2 py-1 rounded ${
                          recipe.source === 'spoonacular' 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-purple-100 text-purple-800'
                        }`}>
                          {recipe.source === 'spoonacular' ? 'Spoonacular' : 'My Recipe'}
                        </span>
                        {recipe.nutrition?.calories && (
                          <span className="text-sm text-gray-600">
                            {recipe.nutrition.calories} cal
                          </span>
                        )}
                      </div>
                    </div>
                    <button
                      onClick={() => onAddRecipe(slot, recipe)}
                      className="ml-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
                    >
                      Add
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : searchQuery.trim() ? (
            <div className="p-8 text-center">
              <div className="text-gray-400 text-4xl mb-4">🔍</div>
              <p className="text-gray-500">No recipes found. Try a different search term.</p>
            </div>
          ) : (
            <div className="p-8 text-center">
              <div className="text-gray-400 text-4xl mb-4">🍳</div>
              <p className="text-gray-500">Start typing to search for recipes</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t bg-gray-50">
          <div className="flex justify-end">
            <button
              onClick={onClose}
              className="px-6 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-100 transition"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MealPlanner;