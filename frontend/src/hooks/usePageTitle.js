import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const TITLES = {
  '/': 'ChefMind | Homepage',
  '/meal-planner': 'ChefMind | Meal Planner',
  '/favorites': 'ChefMind | Favorites',
  '/my-recipes': 'ChefMind | My Recipes',
  '/add-recipe': 'ChefMind | Add Recipe',
  '/account': 'ChefMind | Account',
  '/settings': 'ChefMind | Settings',
  '/login': 'ChefMind | Login',
  '/register': 'ChefMind | Register',
};

export default function usePageTitle() {
  const location = useLocation();
  useEffect(() => {
    const path = location.pathname.startsWith('/recipe/') ? '/my-recipes' : location.pathname;
    document.title = TITLES[path] || 'ChefMind';
  }, [location]);
}
