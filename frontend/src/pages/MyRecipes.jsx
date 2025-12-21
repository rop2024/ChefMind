import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import authService from '../services/authService';
import userRecipesService from '../services/userRecipesService';

const MyRecipes = () => {
  const navigate = useNavigate();
  const [recipes, setRecipes] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchRecipes();
    fetchStats();
  }, []);

  const fetchRecipes = async () => {
    setLoading(true);
    setError('');
    
    try {
      const result = await userRecipesService.getUserRecipes();
      setRecipes(result.data.recipes || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const result = await userRecipesService.getStats();
      setStats(result.data.stats);
    } catch (err) {
      console.error('Failed to fetch stats:', err);
    }
  };

  const handleDelete = async (recipeId) => {
    if (window.confirm('Are you sure you want to delete this recipe?')) {
      try {
        await userRecipesService.deleteRecipe(recipeId);
        setRecipes(recipes.filter(recipe => recipe._id !== recipeId));
      } catch (err) {
        setError(err.message);
      }
    }
  };

  const user = authService.getCurrentUser();

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md w-full bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Sign In Required</h2>
          <p className="text-gray-600 mb-6">Please sign in to view your recipes.</p>
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

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">My Recipes</h1>
              <p className="text-gray-600 mt-2">Manage your personal recipe collection</p>
            </div>
            <Link
              to="/add-recipe"
              className="px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition flex items-center"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Add New Recipe
            </Link>
          </div>
        </div>

        {/* Stats */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
            <div className="bg-white rounded-lg shadow p-6">
              <div className="text-2xl font-bold text-blue-600">{stats.totalRecipes || 0}</div>
              <div className="text-sm text-gray-600">Total Recipes</div>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <div className="text-2xl font-bold text-green-600">{stats.totalLikes || 0}</div>
              <div className="text-sm text-gray-600">Total Likes</div>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <div className="text-2xl font-bold text-purple-600">{stats.totalFavorites || 0}</div>
              <div className="text-sm text-gray-600">Total Favorites</div>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <div className="text-2xl font-bold text-yellow-600">{Math.round(stats.avgPrepTime) || 0}</div>
              <div className="text-sm text-gray-600">Avg Prep (min)</div>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <div className="text-2xl font-bold text-red-600">{Math.round(stats.avgCookTime) || 0}</div>
              <div className="text-sm text-gray-600">Avg Cook (min)</div>
            </div>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md mb-6">
            {error}
          </div>
        )}

        {/* Loading */}
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : recipes.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {recipes.map((recipe) => (
              <RecipeCard
                key={recipe._id}
                recipe={recipe}
                onDelete={handleDelete}
              />
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <span className="material-icons text-gray-400 text-6xl mb-4">free_breakfast</span>
            <h3 className="text-xl font-semibold text-gray-600 mb-2">No recipes yet</h3>
            <p className="text-gray-500 mb-6">Start by creating your first recipe!</p>
            <Link
              to="/add-recipe"
              className="inline-block bg-blue-600 text-white py-2 px-6 rounded-md hover:bg-blue-700 transition"
            >
              Create Your First Recipe
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

const RecipeCard = ({ recipe, onDelete }) => {
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition">
      <div className="relative">
        <img
          src={recipe.image || '/default-recipe.jpg'}
          alt={recipe.title}
          className="w-full h-48 object-cover"
        />
        <div className="absolute top-3 right-3">
          <span className={`px-2 py-1 text-xs font-medium rounded-full ${
            recipe.isPublic ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
          }`}>
            {recipe.isPublic ? 'Public' : 'Private'}
          </span>
        </div>
      </div>
      
      <div className="p-4">
        <div className="flex justify-between items-start mb-2">
          <h3 className="font-semibold text-lg text-gray-800 line-clamp-2">
            {recipe.title}
          </h3>
          <div className="flex space-x-2">
            <Link
              to={`/my-recipes/edit/${recipe._id}`}
              className="text-blue-600 hover:text-blue-800"
              title="Edit"
            >
              ✏️
            </Link>
            <button
              onClick={() => onDelete(recipe._id)}
              className="text-red-600 hover:text-red-800"
              title="Delete"
            >
              🗑️
            </button>
          </div>
        </div>
        
        <p className="text-gray-600 text-sm mb-3 line-clamp-2">
          {recipe.description || 'No description provided'}
        </p>
        
        <div className="grid grid-cols-2 gap-2 mb-4">
          <div className="text-center">
            <div className="text-sm font-medium text-gray-700">Prep</div>
            <div className="text-lg font-bold text-gray-900">{recipe.prepTime} min</div>
          </div>
          <div className="text-center">
            <div className="text-sm font-medium text-gray-700">Cook</div>
            <div className="text-lg font-bold text-gray-900">{recipe.cookTime} min</div>
          </div>
          <div className="text-center">
            <div className="text-sm font-medium text-gray-700">Servings</div>
            <div className="text-lg font-bold text-gray-900">{recipe.servings}</div>
          </div>
          <div className="text-center">
            <div className="text-sm font-medium text-gray-700">Difficulty</div>
            <div className="text-lg font-bold text-gray-900">{recipe.difficulty}</div>
          </div>
        </div>
        
        <div className="flex justify-between items-center">
          <div className="flex space-x-4 text-sm text-gray-500">
            <span><span className="material-icons" style={{verticalAlign: 'middle'}}>favorite</span> {recipe.likes}</span>
            <span>⭐ {recipe.favoritesCount}</span>
          </div>
          <Link
            to={`/my-recipes/${recipe._id}`}
            className="text-blue-600 hover:text-blue-800 text-sm font-medium"
          >
            View Details →
          </Link>
        </div>
        
        {recipe.tags && recipe.tags.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-1">
            {recipe.tags.slice(0, 3).map((tag, index) => (
              <span
                key={index}
                className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded"
              >
                {tag}
              </span>
            ))}
            {recipe.tags.length > 3 && (
              <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded">
                +{recipe.tags.length - 3} more
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyRecipes;