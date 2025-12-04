import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import searchService from '../services/searchService';

const SearchRecipes = () => {
  const [ingredients, setIngredients] = useState('');
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [searchParams, setSearchParams] = useState({
    number: 15,
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
    setResults(null);
    
    try {
      const ingredientList = ingredients.split(',').map(ing => ing.trim()).filter(ing => ing);
      const result = await searchService.searchByIngredients(ingredientList, searchParams);
      
      if (result.success) {
        setResults(result.data);
      } else {
        setError(result.message || 'Failed to fetch recipes');
      }
    } catch (err) {
      setError(err.message);
      setResults(null);
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
    <div className="max-w-6xl mx-auto p-6">
      <h1 className="text-3xl font-bold text-gray-800 mb-2">Smart Recipe Finder</h1>
      <p className="text-gray-600 mb-6">Find recipes categorized by ingredient matches</p>
      
      {/* Search Form */}
      <form onSubmit={handleSearch} className="bg-white rounded-lg shadow-md p-6 mb-8">
        <div className="mb-4">
          <label htmlFor="ingredients" className="block text-sm font-medium text-gray-700 mb-2">
            Your Ingredients (comma-separated)
          </label>
          <input
            type="text"
            id="ingredients"
            value={ingredients}
            onChange={handleIngredientChange}
            placeholder="e.g., chicken, rice, tomatoes, garlic, onions"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            disabled={loading}
          />
          <p className="text-sm text-gray-500 mt-1">
            Enter what you have, and we'll find the best matching recipes
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
              <option value="10">10 recipes</option>
              <option value="15">15 recipes</option>
              <option value="20">20 recipes</option>
              <option value="25">25 recipes</option>
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
          className="w-full bg-blue-600 text-white py-3 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition duration-200 font-medium"
        >
          {loading ? (
            <span className="flex items-center justify-center">
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Finding Best Matches...
            </span>
          ) : 'Find Smart Recipes'}
        </button>
      </form>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md mb-6">
          <div className="flex items-center">
            <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            {error}
          </div>
        </div>
      )}

      {/* Results Summary */}
      {results && (
        <div className="mb-8">
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-6 border border-blue-200">
            <h2 className="text-xl font-semibold text-gray-800 mb-3">Search Results</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
              <div className="bg-white rounded-lg p-4 shadow-sm">
                <div className="text-2xl font-bold text-green-600">{results.summary.exactMatches}</div>
                <div className="text-sm text-gray-600">Perfect Matches</div>
              </div>
              <div className="bg-white rounded-lg p-4 shadow-sm">
                <div className="text-2xl font-bold text-yellow-600">{results.summary.oneMissing}</div>
                <div className="text-sm text-gray-600">One Ingredient Missing</div>
              </div>
              <div className="bg-white rounded-lg p-4 shadow-sm">
                <div className="text-2xl font-bold text-blue-600">{results.summary.otherMatches}</div>
                <div className="text-sm text-gray-600">Other Good Matches</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Categorized Results */}
      {results && (
        <div className="space-y-8">
          {/* Exact Matches */}
          {results.exactMatches.length > 0 && (
            <RecipeCategory 
              title="Perfect Matches - You Have All Ingredients!"
              subtitle="These recipes use only the ingredients you provided"
              recipes={results.exactMatches}
              type="exact"
            />
          )}

          {/* One Missing */}
          {results.oneMissing.length > 0 && (
            <RecipeCategory 
              title="Almost There - Just One Ingredient Missing"
              subtitle="These recipes need only one additional ingredient"
              recipes={results.oneMissing}
              type="oneMissing"
            />
          )}

          {/* Other Matches */}
          {results.otherMatches.length > 0 && (
            <RecipeCategory 
              title="Other Great Matches"
              subtitle="These recipes might need a few more ingredients"
              recipes={results.otherMatches}
              type="other"
            />
          )}

          {/* No Results */}
          {results.exactMatches.length === 0 && 
           results.oneMissing.length === 0 && 
           results.otherMatches.length === 0 && (
            <div className="text-center py-12">
              <div className="text-gray-400 text-6xl mb-4">🍳</div>
              <h3 className="text-xl font-semibold text-gray-600 mb-2">No matches found</h3>
              <p className="text-gray-500">Try different ingredients or adjust your search parameters</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// Recipe Category Component
const RecipeCategory = ({ title, subtitle, recipes, type }) => {
  const getTypeStyles = (type) => {
    switch (type) {
      case 'exact':
        return {
          border: 'border-green-200',
          header: 'bg-green-50 border-green-200',
          badge: 'bg-green-100 text-green-800',
          icon: '✅'
        };
      case 'oneMissing':
        return {
          border: 'border-yellow-200',
          header: 'bg-yellow-50 border-yellow-200',
          badge: 'bg-yellow-100 text-yellow-800',
          icon: '⭐'
        };
      default:
        return {
          border: 'border-blue-200',
          header: 'bg-blue-50 border-blue-200',
          badge: 'bg-blue-100 text-blue-800',
          icon: '💡'
        };
    }
  };

  const styles = getTypeStyles(type);

  return (
    <div className={`rounded-lg border-2 ${styles.border} overflow-hidden`}>
      <div className={`${styles.header} px-6 py-4 border-b`}>
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-gray-800 flex items-center">
              <span className="mr-2">{styles.icon}</span>
              {title}
            </h2>
            <p className="text-gray-600 text-sm mt-1">{subtitle}</p>
          </div>
          <span className={`px-3 py-1 rounded-full text-sm font-medium ${styles.badge}`}>
            {recipes.length} recipes
          </span>
        </div>
      </div>
      <div className="bg-white p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {recipes.map((recipe) => (
            <RecipeCard key={recipe.id} recipe={recipe} type={type} />
          ))}
        </div>
      </div>
    </div>
  );
};

// Enhanced Recipe Card Component
const RecipeCard = ({ recipe, type }) => {
  const navigate = useNavigate();
  const { matchMetrics } = recipe;
  
  const handleCardClick = () => {
    navigate(`/recipe/${recipe.id}`);
  };
  
  const getMatchBadge = (type, matchMetrics) => {
    if (type === 'exact') {
      return {
        text: 'Perfect Match',
        color: 'bg-green-100 text-green-800 border-green-200'
      };
    }
    
    if (type === 'oneMissing') {
      return {
        text: `1 Missing: ${matchMetrics.missingIngredients[0]}`,
        color: 'bg-yellow-100 text-yellow-800 border-yellow-200'
      };
    }
    
    return {
      text: `${matchMetrics.missingCount} Missing`,
      color: 'bg-blue-100 text-blue-800 border-blue-200'
    };
  };

  const matchBadge = getMatchBadge(type, matchMetrics);

  return (
    <div 
      className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition duration-200 border border-gray-100 cursor-pointer"
      onClick={handleCardClick}
    >
      <div className="relative">
        <img
          src={recipe.image || '/placeholder-recipe.jpg'}
          alt={recipe.title}
          className="w-full h-48 object-cover"
        />
        <div className="absolute top-3 right-3">
          <span className={`px-2 py-1 text-xs font-medium rounded-full border ${matchBadge.color}`}>
            {matchBadge.text}
          </span>
        </div>
      </div>
      
      <div className="p-4">
        <h3 className="font-semibold text-lg text-gray-800 mb-2 line-clamp-2">
          {recipe.title}
        </h3>
        
        {/* Match Metrics */}
        <div className="mb-3 space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Match Score:</span>
            <span className="font-medium text-green-600">
              {Math.round(matchMetrics.matchRatio * 100)}%
            </span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Your Ingredients Used:</span>
            <span className="font-medium">
              {matchMetrics.matchedCount}/{matchMetrics.totalUsedIngredients}
            </span>
          </div>
        </div>

        {/* Used Ingredients */}
        {matchMetrics.matchedIngredients.length > 0 && (
          <div className="mb-3">
            <p className="text-sm font-medium text-gray-700 mb-1">Your Ingredients:</p>
            <div className="flex flex-wrap gap-1">
              {matchMetrics.matchedIngredients.slice(0, 4).map((ingredient, index) => (
                <span
                  key={index}
                  className="inline-block bg-green-100 text-green-800 text-xs px-2 py-1 rounded"
                >
                  {ingredient}
                </span>
              ))}
              {matchMetrics.matchedIngredients.length > 4 && (
                <span className="inline-block bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded">
                  +{matchMetrics.matchedIngredients.length - 4} more
                </span>
              )}
            </div>
          </div>
        )}

        {/* Missing Ingredients */}
        {matchMetrics.missingIngredients.length > 0 && (
          <div className="mb-3">
            <p className="text-sm font-medium text-gray-700 mb-1">Missing:</p>
            <div className="flex flex-wrap gap-1">
              {matchMetrics.missingIngredients.map((ingredient, index) => (
                <span
                  key={index}
                  className="inline-block bg-red-100 text-red-800 text-xs px-2 py-1 rounded"
                >
                  {ingredient}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Recipe Info */}
        <div className="flex justify-between items-center text-sm text-gray-600 pt-2 border-t border-gray-100">
          <span className="flex items-center">
            <span className="mr-1">👍</span>
            {recipe.likes || 0}
          </span>
          <span className="text-xs text-gray-500">
            {Math.round(matchMetrics.matchRatio * 100)}% match
          </span>
        </div>
      </div>
    </div>
  );
};

export default SearchRecipes;