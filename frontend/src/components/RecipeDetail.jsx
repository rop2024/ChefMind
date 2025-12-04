import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import searchService from '../services/searchService';

const RecipeDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [recipe, setRecipe] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchRecipeDetails = async () => {
      try {
        setLoading(true);
        setError('');
        const result = await searchService.getRecipeDetails(id);
        
        if (result.success) {
          setRecipe(result.data);
        } else {
          setError(result.message || 'Failed to fetch recipe details');
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchRecipeDetails();
    }
  }, [id]);

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <svg className="animate-spin h-12 w-12 text-blue-600 mx-auto mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <p className="text-gray-600">Loading recipe details...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-md">
          <div className="flex items-center mb-4">
            <svg className="w-6 h-6 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            <span className="font-medium">{error}</span>
          </div>
          <button
            onClick={() => navigate(-1)}
            className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  if (!recipe) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">Recipe not found</p>
          <button
            onClick={() => navigate(-1)}
            className="mt-4 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto p-6">
      {/* Back Button */}
      <button
        onClick={() => navigate(-1)}
        className="flex items-center text-blue-600 hover:text-blue-800 mb-6 transition"
      >
        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
        </svg>
        Back to Search
      </button>

      {/* Recipe Header */}
      <div className="bg-white rounded-lg shadow-lg overflow-hidden mb-8">
        <div className="relative h-96">
          <img
            src={recipe.image || '/placeholder-recipe.jpg'}
            alt={recipe.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black to-transparent p-6">
            <h1 className="text-4xl font-bold text-white mb-2">{recipe.title}</h1>
            <div className="flex items-center space-x-4 text-white text-sm">
              {recipe.readyInMinutes && (
                <span className="flex items-center">
                  <svg className="w-5 h-5 mr-1" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                  </svg>
                  {recipe.readyInMinutes} mins
                </span>
              )}
              {recipe.servings && (
                <span className="flex items-center">
                  <svg className="w-5 h-5 mr-1" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
                  </svg>
                  {recipe.servings} servings
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-8">
          {/* Summary */}
          {recipe.summary && (
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">About This Recipe</h2>
              <div 
                className="text-gray-700 leading-relaxed"
                dangerouslySetInnerHTML={{ __html: recipe.summary }}
              />
            </div>
          )}

          {/* Ingredients */}
          {recipe.extendedIngredients && recipe.extendedIngredients.length > 0 && (
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">Ingredients</h2>
              <ul className="space-y-3">
                {recipe.extendedIngredients.map((ingredient, index) => (
                  <li key={index} className="flex items-start">
                    <span className="text-blue-600 mr-3 mt-1">•</span>
                    <span className="text-gray-700">
                      <span className="font-medium">
                        {ingredient.amount} {ingredient.unit}
                      </span>{' '}
                      {ingredient.name}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Instructions */}
          {recipe.analyzedInstructions && recipe.analyzedInstructions.length > 0 && (
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">Instructions</h2>
              <ol className="space-y-4">
                {recipe.analyzedInstructions.map((step, index) => (
                  <li key={index} className="flex">
                    <span className="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-semibold mr-4">
                      {step.number}
                    </span>
                    <div className="flex-1">
                      <p className="text-gray-700 leading-relaxed">{step.step}</p>
                      {step.ingredients && step.ingredients.length > 0 && (
                        <div className="mt-2 flex flex-wrap gap-1">
                          {step.ingredients.map((ing, idx) => (
                            <span key={idx} className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                              {ing.name}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </li>
                ))}
              </ol>
            </div>
          )}

          {/* Instructions (if no analyzed instructions) */}
          {(!recipe.analyzedInstructions || recipe.analyzedInstructions.length === 0) && recipe.instructions && (
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">Instructions</h2>
              <div 
                className="text-gray-700 leading-relaxed"
                dangerouslySetInnerHTML={{ __html: recipe.instructions }}
              />
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Nutrition */}
          {recipe.nutrition && (
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-xl font-semibold text-gray-800 mb-4">Nutrition Facts</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center pb-2 border-b">
                  <span className="text-gray-600">Calories</span>
                  <span className="font-semibold text-gray-800">{recipe.nutrition.calories}</span>
                </div>
                <div className="flex justify-between items-center pb-2 border-b">
                  <span className="text-gray-600">Protein</span>
                  <span className="font-semibold text-gray-800">{recipe.nutrition.protein}</span>
                </div>
                <div className="flex justify-between items-center pb-2 border-b">
                  <span className="text-gray-600">Fat</span>
                  <span className="font-semibold text-gray-800">{recipe.nutrition.fat}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Carbs</span>
                  <span className="font-semibold text-gray-800">{recipe.nutrition.carbohydrates}</span>
                </div>
              </div>
            </div>
          )}

          {/* Diets */}
          {recipe.diets && recipe.diets.length > 0 && (
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-xl font-semibold text-gray-800 mb-4">Dietary Info</h3>
              <div className="flex flex-wrap gap-2">
                {recipe.diets.map((diet, index) => (
                  <span key={index} className="bg-green-100 text-green-800 text-sm px-3 py-1 rounded-full">
                    {diet}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Cuisines */}
          {recipe.cuisines && recipe.cuisines.length > 0 && (
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-xl font-semibold text-gray-800 mb-4">Cuisines</h3>
              <div className="flex flex-wrap gap-2">
                {recipe.cuisines.map((cuisine, index) => (
                  <span key={index} className="bg-blue-100 text-blue-800 text-sm px-3 py-1 rounded-full">
                    {cuisine}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Dish Types */}
          {recipe.dishTypes && recipe.dishTypes.length > 0 && (
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-xl font-semibold text-gray-800 mb-4">Dish Types</h3>
              <div className="flex flex-wrap gap-2">
                {recipe.dishTypes.map((type, index) => (
                  <span key={index} className="bg-purple-100 text-purple-800 text-sm px-3 py-1 rounded-full">
                    {type}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Source Link */}
          {recipe.sourceUrl && (
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-xl font-semibold text-gray-800 mb-4">Original Recipe</h3>
              <a
                href={recipe.sourceUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center text-blue-600 hover:text-blue-800 transition"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
                View Source
              </a>
            </div>
          )}

          {/* Cache Info */}
          {recipe.metadata && recipe.metadata.cached && (
            <div className="bg-gray-50 rounded-lg border border-gray-200 p-4">
              <p className="text-xs text-gray-500 flex items-center">
                <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                </svg>
                Loaded from cache
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Powered by Spoonacular */}
      <div className="mt-8 text-center text-sm text-gray-500">
        <p>Recipe data powered by Spoonacular API</p>
      </div>
    </div>
  );
};

export default RecipeDetail;
