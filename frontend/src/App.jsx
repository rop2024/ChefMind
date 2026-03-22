import React from 'react';
import usePageTitle from './hooks/usePageTitle';
import { Routes, Route, Link } from 'react-router-dom';
import SearchRecipes from './components/SearchRecipes';
import RecipeDetail from './components/RecipeDetail';
import './index.css';

function App() {
  usePageTitle();

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-amber-50">
      <header className="bg-white shadow-md sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <Link to="/" className="flex items-center space-x-2 group" style={{ textDecoration: 'none' }}>
              <span className="material-icons text-3xl group-hover:text-orange-600 transition-colors" style={{verticalAlign: 'middle'}}>restaurant_menu</span>
              <h1 className="text-2xl font-bold text-orange-600 group-hover:text-orange-700 transition-colors">ChefMind</h1>
            </Link>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <Routes>
          <Route path="/" element={<SearchRecipes />} />
          <Route path="/recipe/:id" element={<RecipeDetail />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;