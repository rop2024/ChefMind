import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import searchService from '../services/searchService';

const RecipeDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [recipe, setRecipe] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('ingredients');
  const [forceRefresh, setForceRefresh] = useState(false);

  useEffect(() => {
    fetchRecipeDetails();
  }, [id, forceRefresh]);

  const fetchRecipeDetails = async () => {
    setLoading(true);
    setError('');
    
    try {
      const result = await searchService.getRecipeDetails(id, forceRefresh);
      
      if (result.success) {
        setRecipe(result.data);
      } else {
        setError(result.message || 'Failed to load recipe');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleForceRefresh = () => {
    setForceRefresh(true);
    setTimeout(() => setForceRefresh(false), 1000);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading recipe details...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md w-full bg-white rounded-lg shadow-md p-6">
          <div className="text-red-500 text-6xl mb-4 text-center">🍳</div>
          <h2 className="text-xl font-semibold text-gray-800 mb-2 text-center">Recipe Not Found</h2>
          <p className="text-gray-600 mb-6 text-center">{error}</p>
          <button
            onClick={() => navigate(-1)}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  if (!recipe) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <button
                onClick={() => navigate(-1)}
                className="mr-4 text-gray-600 hover:text-gray-900"
              >
                ← Back
              </button>
              <h1 className="text-2xl font-bold text-gray-900">Recipe Details</h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-500">
                Source: {recipe.metadata?.cached ? 'Cache' : 'API'}
              </span>
              <button
                onClick={handleForceRefresh}
                className="text-sm text-blue-600 hover:text-blue-800"
                title="Force refresh from API"
              >
                🔄 Refresh
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Recipe Header */}
        <div className="bg-white rounded-lg shadow-lg overflow-hidden mb-8">
          <div className="md:flex">
            {/* Recipe Image */}
            <div className="md:w-2/5">
              <img
                src={recipe.image || '/placeholder-recipe.jpg'}
                alt={recipe.title}
                className="w-full h-64 md:h-full object-cover"
              />
            </div>
            
            {/* Recipe Info */}
            <div className="md:w-3/5 p-8">
              <h1 className="text-3xl font-bold text-gray-900 mb-4">{recipe.title}</h1>
              
              {/* Nutrition Badges */}
              <div className="flex flex-wrap gap-4 mb-6">
                {recipe.nutrition && (
                  <>
                    <NutritionBadge 
                      label="Calories" 
                      value={`${recipe.nutrition.calories}`} 
                      unit="kcal"
                      color="bg-red-100 text-red-800"
                    />
                    <NutritionBadge 
                      label="Protein" 
                      value={recipe.nutrition.protein} 
                      color="bg-blue-100 text-blue-800"
                    />
                    <NutritionBadge 
                      label="Carbs" 
                      value={recipe.nutrition.carbohydrates} 
                      color="bg-green-100 text-green-800"
                    />
                    <NutritionBadge 
                      label="Fat" 
                      value={recipe.nutrition.fat} 
                      color="bg-yellow-100 text-yellow-800"
                    />
                  </>
                )}
              </div>
              
              {/* Quick Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <StatBadge label="Prep Time" value={`${recipe.readyInMinutes} min`} />
                <StatBadge label="Servings" value={recipe.servings} />
                {recipe.diets?.length > 0 && (
                  <StatBadge label="Diet" value={recipe.diets[0]} />
                )}
                {recipe.cuisines?.length > 0 && (
                  <StatBadge label="Cuisine" value={recipe.cuisines[0]} />
                )}
              </div>
              
              {/* Summary */}
              {recipe.summary && (
                <div className="prose max-w-none mb-6">
                  <div 
                    className="text-gray-700"
                    dangerouslySetInnerHTML={{ __html: recipe.summary }}
                  />
                </div>
              )}
              
              {/* Source Link */}
              {recipe.sourceUrl && (
                <a
                  href={recipe.sourceUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center text-blue-600 hover:text-blue-800"
                >
                  <span>View Original Recipe</span>
                  <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                </a>
              )}
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow-lg mb-8">
          <div className="border-b border-gray-200">
            <nav className="flex -mb-px">
              <TabButton
                active={activeTab === 'ingredients'}
                onClick={() => setActiveTab('ingredients')}
              >
                Ingredients
              </TabButton>
              <TabButton
                active={activeTab === 'instructions'}
                onClick={() => setActiveTab('instructions')}
              >
                Instructions
              </TabButton>
              <TabButton
                active={activeTab === 'nutrition'}
                onClick={() => setActiveTab('nutrition')}
              >
                Nutrition
              </TabButton>
            </nav>
          </div>
          
          {/* Tab Content */}
          <div className="p-8">
            {activeTab === 'ingredients' && (
              <IngredientsTab ingredients={recipe.extendedIngredients} />
            )}
            
            {activeTab === 'instructions' && (
              <InstructionsTab 
                instructions={recipe.instructions} 
                analyzedInstructions={recipe.analyzedInstructions}
              />
            )}
            
            {activeTab === 'nutrition' && (
              <NutritionTab nutrition={recipe.nutrition} />
            )}
          </div>
        </div>

        {/* Attribution */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">
                Recipe data provided by Spoonacular API
              </p>
              {recipe.spoonacularSourceUrl && (
                <a
                  href={recipe.spoonacularSourceUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-blue-600 hover:text-blue-800"
                >
                  View on Spoonacular
                </a>
              )}
            </div>
            <div className="text-right text-sm text-gray-500">
              {recipe.metadata?.cached && (
                <p>Cached on {new Date(recipe.metadata.lastFetched).toLocaleDateString()}</p>
              )}
              <p>Fetch count: {recipe.metadata?.fetchCount || 1}</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

// Tab Button Component
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

// Nutrition Badge Component
const NutritionBadge = ({ label, value, unit = '', color = 'bg-gray-100 text-gray-800' }) => (
  <div className={`px-4 py-2 rounded-full ${color} flex flex-col items-center justify-center`}>
    <span className="text-sm font-medium">{value}{unit}</span>
    <span className="text-xs">{label}</span>
  </div>
);

// Stat Badge Component
const StatBadge = ({ label, value }) => (
  <div className="text-center">
    <div className="text-2xl font-bold text-gray-900">{value}</div>
    <div className="text-sm text-gray-600">{label}</div>
  </div>
);

// Ingredients Tab Component
const IngredientsTab = ({ ingredients }) => (
  <div>
    <h2 className="text-2xl font-bold text-gray-800 mb-6">Ingredients</h2>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {ingredients.map((ingredient, index) => (
        <div
          key={index}
          className="flex items-center p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition"
        >
          {ingredient.image && (
            <img
              src={`https://spoonacular.com/cdn/ingredients_100x100/${ingredient.image}`}
              alt={ingredient.name}
              className="w-10 h-10 rounded-full mr-4"
            />
          )}
          <div>
            <p className="font-medium text-gray-800">{ingredient.name}</p>
            <p className="text-sm text-gray-600">
              {ingredient.amount} {ingredient.unit}
            </p>
          </div>
        </div>
      ))}
    </div>
  </div>
);

// Instructions Tab Component
const InstructionsTab = ({ instructions, analyzedInstructions }) => (
  <div>
    <h2 className="text-2xl font-bold text-gray-800 mb-6">Instructions</h2>
    
    {analyzedInstructions && analyzedInstructions.length > 0 ? (
      <div className="space-y-6">
        {analyzedInstructions.map((step, index) => (
          <div key={index} className="flex items-start">
            <div className="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold mr-4 mt-1">
              {step.number}
            </div>
            <div className="flex-1">
              <p className="text-gray-800 mb-2">{step.step}</p>
              {step.ingredients.length > 0 && (
                <div className="mt-2">
                  <p className="text-sm text-gray-600 mb-1">Ingredients used:</p>
                  <div className="flex flex-wrap gap-1">
                    {step.ingredients.map((ing, i) => (
                      <span
                        key={i}
                        className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded"
                      >
                        {ing.name}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    ) : instructions ? (
      <div className="prose max-w-none">
        <div 
          className="text-gray-700"
          dangerouslySetInnerHTML={{ __html: instructions }}
        />
      </div>
    ) : (
      <p className="text-gray-500">No instructions available for this recipe.</p>
    )}
  </div>
);

// Nutrition Tab Component
const NutritionTab = ({ nutrition }) => (
  <div>
    <h2 className="text-2xl font-bold text-gray-800 mb-6">Nutrition Information</h2>
    
    {nutrition ? (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div>
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Nutrition Facts</h3>
          <div className="space-y-4">
            <NutritionItem label="Calories" value={nutrition.calories} unit="kcal" />
            <NutritionItem label="Protein" value={nutrition.protein} />
            <NutritionItem label="Carbohydrates" value={nutrition.carbohydrates} />
            <NutritionItem label="Fat" value={nutrition.fat} />
          </div>
        </div>
        
        <div>
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Daily Value Guide</h3>
          <div className="bg-gray-50 rounded-lg p-6">
            <p className="text-gray-600 text-sm mb-4">
              Percent Daily Values are based on a 2,000 calorie diet.
            </p>
            <div className="space-y-2">
              <DailyValueItem nutrient="Calories" percent={Math.round((nutrition.calories / 2000) * 100)} />
              <DailyValueItem nutrient="Protein" percent={40} />
              <DailyValueItem nutrient="Carbs" percent={30} />
              <DailyValueItem nutrient="Fat" percent={30} />
            </div>
          </div>
        </div>
      </div>
    ) : (
      <p className="text-gray-500">Nutrition information not available for this recipe.</p>
    )}
  </div>
);

// Nutrition Item Component
const NutritionItem = ({ label, value, unit = '' }) => (
  <div className="flex justify-between items-center py-3 border-b border-gray-200">
    <span className="text-gray-700">{label}</span>
    <span className="font-medium text-gray-900">{value} {unit}</span>
  </div>
);

// Daily Value Item Component
const DailyValueItem = ({ nutrient, percent }) => (
  <div>
    <div className="flex justify-between text-sm text-gray-600 mb-1">
      <span>{nutrient}</span>
      <span>{percent}%</span>
    </div>
    <div className="w-full bg-gray-200 rounded-full h-2">
      <div
        className="bg-blue-600 h-2 rounded-full"
        style={{ width: `${Math.min(percent, 100)}%` }}
      />
    </div>
  </div>
);

export default RecipeDetails;