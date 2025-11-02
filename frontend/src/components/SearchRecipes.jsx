import React, { useState } from 'react';
import searchService from '../services/searchService';

const SearchRecipes = () => {
  const [ingredients, setIngredients] = useState('');
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [searchParams, setSearchParams] = useState({
    number: 10,
    ignorePantry: true
  });

  const handleSearch = async (e) => {
    e.preventDefault();
    
    if (!ingredients.trim()) {
      setError('Please enter at least one ingredient');
      return;
    }

    setLoading(true);
    setError('');
    
    try {
      const ingredientList = ingredients.split(',').map(ing => ing.trim()).filter(ing => ing);
      const result = await searchService.searchByIngredients(ingredientList, searchParams);
      
      if (result.success) {
        setRecipes(result.data);
      } else {
        setError(result.message || 'Failed to fetch recipes');
      }
    } catch (err) {
      setError(err.message);
      setRecipes([]);
    } finally {
      setLoading(false);
    }
  };

  const handleIngredientChange = (e) => {
    setIngredients(e.target.value);
    if (error) setError('');
  };

  const handleParamChange = (key, value) => {
    setSearchParams(prev => ({
      ...prev,
      [key]: value
    }));
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Find Recipes by Ingredients</h1>
      
      {/* Search Form */}
      <form onSubmit={handleSearch} className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="mb-4">
          <label htmlFor="ingredients" className="block text-sm font-medium text-gray-700 mb-2">
            Ingredients (comma-separated)
          </label>
          <input
            type="text"
            id="ingredients"
            value={ingredients}
            onChange={handleIngredientChange}
            placeholder="e.g., chicken, rice, tomatoes, garlic"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            disabled={loading}
          />
          <p className="text-sm text-gray-500 mt-1">
            Enter ingredients separated by commas
          </p>
        </div>

        {/* Search Parameters */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label htmlFor="number" className="block text-sm font-medium text-gray-700 mb-1">
              Number of Results
            </label>
            <select
              id="number"
              value={searchParams.number}
              onChange={(e) => handleParamChange('number', parseInt(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={loading}
            >
              <option value="5">5 recipes</option>
              <option value="10">10 recipes</option>
              <option value="15">15 recipes</option>
              <option value="20">20 recipes</option>
            </select>
          </div>
          
          <div className="flex items-center">
            <input
              type="checkbox"
              id="ignorePantry"
              checked={searchParams.ignorePantry}
              onChange={(e) => handleParamChange('ignorePantry', e.target.checked)}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              disabled={loading}
            />
            <label htmlFor="ignorePantry" className="ml-2 block text-sm text-gray-700">
              Ignore pantry items (salt, water, etc.)
            </label>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading || !ingredients.trim()}
          className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition duration-200"
        >
          {loading ? 'Searching...' : 'Find Recipes'}
        </button>
      </form>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md mb-6">
          {error}
        </div>
      )}

      {/* Results */}
      {recipes.length > 0 && (
        <div>
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">
            Found {recipes.length} Recipes
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {recipes.map((recipe) => (
              <RecipeCard key={recipe.id} recipe={recipe} />
            ))}
          </div>
        </div>
      )}

      {/* No Results */}
      {!loading && recipes.length === 0 && ingredients && !error && (
        <div className="text-center py-8">
          <p className="text-gray-500 text-lg">No recipes found. Try different ingredients.</p>
        </div>
      )}
    </div>
  );
};

// Recipe Card Component
const RecipeCard = ({ recipe }) => {
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition duration-200">
      <img
        src={recipe.image || '/placeholder-recipe.jpg'}
        alt={recipe.title}
        className="w-full h-48 object-cover"
      />
      <div className="p-4">
        <h3 className="font-semibold text-lg text-gray-800 mb-2 line-clamp-2">
          {recipe.title}
        </h3>
        
        {/* Used Ingredients */}
        {recipe.usedIngredients.length > 0 && (
          <div className="mb-3">
            <p className="text-sm font-medium text-gray-700 mb-1">Used Ingredients:</p>
            <div className="flex flex-wrap gap-1">
              {recipe.usedIngredients.map((ingredient, index) => (
                <span
                  key={index}
                  className="inline-block bg-green-100 text-green-800 text-xs px-2 py-1 rounded"
                >
                  {ingredient.name}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Missed Ingredients */}
        {recipe.missedIngredients.length > 0 && (
          <div className="mb-3">
            <p className="text-sm font-medium text-gray-700 mb-1">Missing Ingredients:</p>
            <div className="flex flex-wrap gap-1">
              {recipe.missedIngredients.map((ingredient, index) => (
                <span
                  key={index}
                  className="inline-block bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded"
                >
                  {ingredient.name}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Recipe Info */}
        <div className="flex justify-between items-center text-sm text-gray-600">
          <span>👍 {recipe.likes || 0}</span>
          <span>{recipe.usedIngredients.length} used ingredients</span>
        </div>
      </div>
    </div>
  );
};

export default SearchRecipes;