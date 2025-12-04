import React from 'react';
import { Routes, Route, Link, Navigate } from 'react-router-dom';
import authService from './services/authService.js';
import SearchRecipes from './components/SearchRecipes';
import RecipeDetail from './components/RecipeDetail';
import Login from './pages/Login';
import Register from './pages/Register';
import Favorites from './pages/Favorites';
import AddRecipe from './pages/AddRecipe';
import MyRecipes from './pages/MyRecipes';
import './index.css';

function App() {
  const user = authService.getCurrentUser();

  const handleLogout = () => {
    authService.logout();
    window.location.href = '/';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-amber-50">
      <header className="bg-white shadow-md sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-2">
              <span className="text-3xl">👨‍🍳</span>
              <h1 className="text-2xl font-bold text-orange-600">ChefMind</h1>
            </div>

            {user && (
              <div className="flex items-center space-x-6">
                <nav className="flex items-center space-x-4">
                  <Link
                    to="/"
                    className="text-gray-700 hover:text-orange-600 transition-colors font-medium"
                  >
                    Search
                  </Link>
                  <Link
                    to="/favorites"
                    className="text-gray-700 hover:text-orange-600 transition-colors font-medium"
                  >
                    Favorites
                  </Link>
                  <Link
                    to="/my-recipes"
                    className="text-gray-700 hover:text-orange-600 transition-colors font-medium"
                  >
                    My Recipes
                  </Link>
                  <Link
                    to="/add-recipe"
                    className="text-gray-700 hover:text-orange-600 transition-colors font-medium"
                  >
                    Add Recipe
                  </Link>
                </nav>
                <div className="flex items-center space-x-4">
                  <span className="text-gray-700">Hello, {user.name}!</span>
                  <button
                    onClick={handleLogout}
                    className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg transition-colors"
                  >
                    Logout
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <Routes>
          {/* Public routes */}
          <Route
            path="/login"
            element={user ? <Navigate to="/" replace /> : <Login />}
          />
          <Route
            path="/register"
            element={user ? <Navigate to="/" replace /> : <Register />}
          />

          {/* Protected routes */}
          <Route
            path="/"
            element={user ? <SearchRecipes /> : <Navigate to="/login" replace />}
          />
          <Route
            path="/recipe/:id"
            element={user ? <RecipeDetail /> : <Navigate to="/login" replace />}
          />
          <Route
            path="/favorites"
            element={user ? <Favorites /> : <Navigate to="/login" replace />}
          />
          <Route
            path="/my-recipes"
            element={user ? <MyRecipes /> : <Navigate to="/login" replace />}
          />
          <Route
            path="/my-recipes/:id"
            element={user ? <MyRecipes /> : <Navigate to="/login" replace />}
          />
          <Route
            path="/add-recipe"
            element={user ? <AddRecipe /> : <Navigate to="/login" replace />}
          />
        </Routes>
      </main>
    </div>
  );
}

export default App;