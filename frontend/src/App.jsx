import React, { useState } from 'react';
import usePageTitle from './hooks/usePageTitle';
import { Routes, Route, Link, Navigate, useNavigate } from 'react-router-dom';
import authService from './services/authService.js';
import SearchRecipes from './components/SearchRecipes';
import RecipeDetail from './components/RecipeDetail';
import Login from './pages/Login';
import Register from './pages/Register';
import Favorites from './pages/Favorites';
import AddRecipe from './pages/AddRecipe';
import MyRecipes from './pages/MyRecipes';
import MealPlanner from './pages/MealPlanner';
import AccountDashboard from './pages/AccountDashboard';
import Settings from './pages/Settings';
import './index.css';

function App() {
  usePageTitle();
  const user = authService.getCurrentUser();
  const navigate = useNavigate();
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  const handleLogout = () => {
    setShowLogoutConfirm(true);
  };

  const confirmLogout = () => {
    setShowLogoutConfirm(false);
    authService.logout();
    window.location.href = '/';
  };

  const cancelLogout = () => {
    setShowLogoutConfirm(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-amber-50">
      <header className="bg-white shadow-md sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <Link to="/" className="flex items-center space-x-2 group" style={{ textDecoration: 'none' }}>
              <span className="material-icons text-3xl group-hover:text-orange-600 transition-colors" style={{verticalAlign: 'middle'}}>restaurant_menu</span>
              <h1 className="text-2xl font-bold text-orange-600 group-hover:text-orange-700 transition-colors">ChefMind</h1>
            </Link>

            {user && (
              <div className="flex items-center space-x-6">
                {/* Dropdown Menu */}
                <div className="relative group">
                  <button className="flex items-center px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors focus:outline-none">
                    <span className="material-icons mr-2">menu</span>
                    Menu
                  </button>
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-100 opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 pointer-events-none group-hover:pointer-events-auto group-focus-within:pointer-events-auto transition-opacity z-20">
                    <div className="px-4 py-3 border-b border-gray-100">
                      <div className="flex items-center space-x-2">
                        <span className="material-icons text-orange-500">account_circle</span>
                        <div>
                          <div className="font-semibold text-gray-800">{user.name}</div>
                          <div className="text-xs text-gray-500">{user.email}</div>
                        </div>
                      </div>
                    </div>
                    <Link to="/" className="block px-4 py-2 text-gray-700 hover:bg-orange-50 hover:text-orange-600 transition-colors">
                      <span className="material-icons align-middle mr-1 text-base">search</span> Search
                    </Link>
                    <Link to="/meal-planner" className="block px-4 py-2 text-gray-700 hover:bg-orange-50 hover:text-orange-600 transition-colors">
                      <span className="material-icons align-middle mr-1 text-base">event_note</span> Meal Planner
                    </Link>
                    <Link to="/favorites" className="block px-4 py-2 text-gray-700 hover:bg-orange-50 hover:text-orange-600 transition-colors">
                      <span className="material-icons align-middle mr-1 text-base">favorite</span> Favorites
                    </Link>
                    <Link to="/my-recipes" className="block px-4 py-2 text-gray-700 hover:bg-orange-50 hover:text-orange-600 transition-colors">
                      <span className="material-icons align-middle mr-1 text-base">menu_book</span> My Recipes
                    </Link>
                    <Link to="/add-recipe" className="block px-4 py-2 text-gray-700 hover:bg-orange-50 hover:text-orange-600 transition-colors">
                      <span className="material-icons align-middle mr-1 text-base">add_circle</span> Add Recipe
                    </Link>
                    <Link to="/account" className="block px-4 py-2 text-gray-700 hover:bg-orange-50 hover:text-orange-600 transition-colors border-t border-gray-100">
                      <span className="material-icons align-middle mr-1 text-base">person</span> Account
                    </Link>
                    <Link to="/settings" className="block px-4 py-2 text-gray-700 hover:bg-orange-50 hover:text-orange-600 transition-colors">
                      <span className="material-icons align-middle mr-1 text-base">settings</span> Settings
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="w-full text-left px-4 py-2 text-red-600 hover:bg-orange-50 hover:text-red-700 transition-colors border-t border-gray-100"
                    >
                      <span className="material-icons align-middle mr-1 text-base">logout</span> Logout
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Logout Confirmation Modal */}
      {showLogoutConfirm && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50">
          <div className="bg-white rounded-lg shadow-lg p-8 max-w-sm w-full">
            <h2 className="text-lg font-semibold mb-4">Confirm Logout</h2>
            <p className="mb-6">Are you sure you want to log out?</p>
            <div className="flex justify-end space-x-4">
              <button onClick={cancelLogout} className="px-4 py-2 rounded bg-gray-200 text-gray-700 hover:bg-gray-300">Cancel</button>
              <button onClick={confirmLogout} className="px-4 py-2 rounded bg-red-500 text-white hover:bg-red-600">Logout</button>
            </div>
          </div>
        </div>
      )}

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
            path="/meal-planner"
            element={user ? <MealPlanner /> : <Navigate to="/login" replace />}
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
          <Route
            path="/account"
            element={user ? <AccountDashboard /> : <Navigate to="/login" replace />}
          />
          <Route
            path="/settings"
            element={user ? <Settings /> : <Navigate to="/login" replace />}
          />
        </Routes>
      </main>
    </div>
  );
}

export default App;