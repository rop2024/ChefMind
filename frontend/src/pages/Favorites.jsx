import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import authService from '../services/authService';
import favoritesService from '../services/favoritesService';

const Favorites = () => {
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');
  const [error, setError] = useState('');

  useEffect(() => {
    fetchFavorites();
  }, [activeTab]);

  const fetchFavorites = async () => {
    setLoading(true);
    setError('');

    try {
      let data;
      if (activeTab === 'all') {
        const result = await favoritesService.getFavorites();
        data = result.data.favorites;
      } else {
        const result = await favoritesService.getFavoritesBySource(activeTab);
        data = result.data.favorites;
      }
      setFavorites(data || []);
    } catch (err) {
      setError(err.message);
      setFavorites([]);
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveFavorite = async (recipeId, source) => {
    try {
      await favoritesService.removeFromFavorites(recipeId, source);
      setFavorites(favorites.filter(fav => 
        !(fav.recipeId.toString() === recipeId.toString() && fav.source === source)
      ));
    } catch (err) {
      setError(err.message);
    }
  };

  const user = authService.getCurrentUser();

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md w-full bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Sign In Required</h2>
          <p className="text-gray-600 mb-6">Please sign in to view your favorites.</p>
          <div className="flex space-x-4">
            <Link
              to="/login"
              className="flex-1 text-center bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition"
            >
              Sign In
            </Link>
            <Link
              to="/register"
              className="flex-1 text-center bg-gray-200 text-gray-800 py-2 px-4 rounded-md hover:bg-gray-300 transition"
            >
              Register
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">My Favorites</h1>
          <p className="text-gray-600 mt-2">Your saved recipes from Spoonacular and your own creations</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-2xl font-bold text-blue-600">{favorites.length}</div>
            <div className="text-sm text-gray-600">Total Favorites</div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-2xl font-bold text-green-600">
              {favorites.filter(f => f.source === 'spoonacular').length}
            </div>
            <div className="text-sm text-gray-600">Spoonacular Recipes</div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-2xl font-bold text-purple-600">
              {favorites.filter(f => f.source === 'user').length}
            </div>
            <div className="text-sm text-gray-600">My Recipes</div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-2xl font-bold text-yellow-600">
              {user?.favorites?.length || 0}
            </div>
            <div className="text-sm text-gray-600">In Profile</div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow mb-8">
          <div className="border-b border-gray-200">
            <nav className="flex -mb-px">
              <TabButton
                active={activeTab === 'all'}
                onClick={() => setActiveTab('all')}
              >
                All Favorites ({favorites.length})
              </TabButton>
              <TabButton
                active={activeTab === 'spoonacular'}
                onClick={() => setActiveTab('spoonacular')}
              >
                Spoonacular ({favorites.filter(f => f.source === 'spoonacular').length})
              </TabButton>
              <TabButton
                active={activeTab === 'user'}
                onClick={() => setActiveTab('user')}
              >
                My Recipes ({favorites.filter(f => f.source === 'user').length})
              </TabButton>
            </nav>
          </div>
        </div>

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
        ) : favorites.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {favorites.map((favorite) => (
              <FavoriteCard
                key={`${favorite.source}-${favorite.recipeId}`}
                favorite={favorite}
                onRemove={handleRemoveFavorite}
              />
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <span className="material-icons text-gray-400 text-6xl mb-4">favorite</span>
            <h3 className="text-xl font-semibold text-gray-600 mb-2">No favorites yet</h3>
            <p className="text-gray-500 mb-6">
              {activeTab === 'all' 
                ? 'Start adding recipes to your favorites!' 
                : `No ${activeTab} recipes in your favorites.`}
            </p>
            <Link
              to="/"
              className="inline-block bg-blue-600 text-white py-2 px-6 rounded-md hover:bg-blue-700 transition"
            >
              Browse Recipes
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

const TabButton = ({ active, onClick, children }) => (
  <button
    className={`py-4 px-6 font-medium text-sm border-b-2 transition-colors ${
      active
        ? 'border-blue-500 text-blue-600'
        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
    }`}
    onClick={onClick}
  >
    {children}
  </button>
);

const FavoriteCard = ({ favorite, onRemove }) => {
  const getSourceColor = (source) => {
    return source === 'spoonacular' 
      ? 'bg-green-100 text-green-800' 
      : 'bg-purple-100 text-purple-800';
  };

  const handleRemove = () => {
    if (window.confirm('Remove from favorites?')) {
      onRemove(favorite.recipeId, favorite.source);
    }
  };

  const recipeLink = favorite.source === 'spoonacular' 
    ? `/recipe/${favorite.recipeId}`
    : `/my-recipes/${favorite.recipeId}`;

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition">
      <div className="relative">
        <img
          src={favorite.image || favorite.recipeDetails?.image || '/default-recipe.jpg'}
          alt={favorite.title}
          className="w-full h-48 object-cover"
        />
        <div className="absolute top-3 right-3">
          <span className={`px-2 py-1 text-xs font-medium rounded-full ${getSourceColor(favorite.source)}`}>
            {favorite.source === 'spoonacular' ? 'API' : 'My Recipe'}
          </span>
        </div>
      </div>
      
      <div className="p-4">
        <h3 className="font-semibold text-lg text-gray-800 mb-2 line-clamp-2">
          {favorite.title}
        </h3>
        
        {favorite.recipeDetails && (
          <div className="mb-3 space-y-1">
            <p className="text-sm text-gray-600">
              Prep: {favorite.recipeDetails.prepTime} min
            </p>
            <p className="text-sm text-gray-600">
              Cook: {favorite.recipeDetails.cookTime} min
            </p>
            <p className="text-sm text-gray-600">
              Servings: {favorite.recipeDetails.servings}
            </p>
          </div>
        )}
        
        <div className="flex justify-between items-center mt-4">
          <Link
            to={recipeLink}
            className="text-blue-600 hover:text-blue-800 text-sm font-medium"
          >
            View Recipe →
          </Link>
          <button
            onClick={handleRemove}
            className="text-red-600 hover:text-red-800 text-sm font-medium"
            title="Remove from favorites"
          >
            Remove
          </button>
        </div>
      </div>
    </div>
  );
};

export default Favorites;