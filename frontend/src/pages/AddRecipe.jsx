import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import authService from '../services/authService';
import userRecipesService from '../services/userRecipesService';

const AddRecipe = () => {
  const navigate = useNavigate();
  const user = authService.getCurrentUser();

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    image: '',
    prepTime: '',
    cookTime: '',
    servings: '',
    difficulty: 'Medium',
    category: 'Other',
    isPublic: false,
    ingredients: [{ name: '', amount: '', unit: '', note: '' }],
    instructions: [''],
    nutrition: {
      calories: '',
      protein: '',
      fat: '',
      carbohydrates: ''
    },
    tags: []
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [tagInput, setTagInput] = useState('');

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md w-full bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Sign In Required</h2>
          <p className="text-gray-600 mb-6">Please sign in to create your own recipes.</p>
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

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleIngredientChange = (index, field, value) => {
    const updatedIngredients = [...formData.ingredients];
    updatedIngredients[index][field] = value;
    setFormData(prev => ({ ...prev, ingredients: updatedIngredients }));
  };

  const addIngredient = () => {
    setFormData(prev => ({
      ...prev,
      ingredients: [...prev.ingredients, { name: '', amount: '', unit: '', note: '' }]
    }));
  };

  const removeIngredient = (index) => {
    if (formData.ingredients.length > 1) {
      const updatedIngredients = formData.ingredients.filter((_, i) => i !== index);
      setFormData(prev => ({ ...prev, ingredients: updatedIngredients }));
    }
  };

  const handleInstructionChange = (index, value) => {
    const updatedInstructions = [...formData.instructions];
    updatedInstructions[index] = value;
    setFormData(prev => ({ ...prev, instructions: updatedInstructions }));
  };

  const addInstruction = () => {
    setFormData(prev => ({
      ...prev,
      instructions: [...prev.instructions, '']
    }));
  };

  const removeInstruction = (index) => {
    if (formData.instructions.length > 1) {
      const updatedInstructions = formData.instructions.filter((_, i) => i !== index);
      setFormData(prev => ({ ...prev, instructions: updatedInstructions }));
    }
  };

  const handleTagAdd = () => {
    if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, tagInput.trim()]
      }));
      setTagInput('');
    }
  };

  const handleTagRemove = (tagToRemove) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Validate form
    if (!formData.title.trim()) {
      setError('Please enter a recipe title');
      setLoading(false);
      return;
    }

    if (formData.ingredients.some(ing => !ing.name.trim())) {
      setError('Please fill in all ingredient names');
      setLoading(false);
      return;
    }

    if (formData.instructions.some(inst => !inst.trim())) {
      setError('Please fill in all instructions');
      setLoading(false);
      return;
    }

    try {
      const recipeData = {
        ...formData,
        prepTime: parseInt(formData.prepTime) || 0,
        cookTime: parseInt(formData.cookTime) || 0,
        servings: parseInt(formData.servings) || 1,
        ingredients: formData.ingredients.map(ing => ({
          ...ing,
          amount: parseFloat(ing.amount) || 0
        }))
      };

      const result = await userRecipesService.createRecipe(recipeData);
      
      if (result.success) {
        navigate('/my-recipes');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Create Your Recipe</h1>
          <p className="text-gray-600 mt-2">Share your culinary creation with the world</p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md mb-6">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Basic Information */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Basic Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Recipe Title *
                </label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  placeholder="e.g., Grandma's Secret Pancakes"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Category
                </label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="Breakfast">Breakfast</option>
                  <option value="Lunch">Lunch</option>
                  <option value="Dinner">Dinner</option>
                  <option value="Dessert">Dessert</option>
                  <option value="Snack">Snack</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Preparation Time (minutes) *
                </label>
                <input
                  type="number"
                  name="prepTime"
                  value={formData.prepTime}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  min="0"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Cooking Time (minutes) *
                </label>
                <input
                  type="number"
                  name="cookTime"
                  value={formData.cookTime}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  min="0"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Servings *
                </label>
                <input
                  type="number"
                  name="servings"
                  value={formData.servings}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  min="1"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Difficulty
                </label>
                <select
                  name="difficulty"
                  value={formData.difficulty}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="Easy">Easy</option>
                  <option value="Medium">Medium</option>
                  <option value="Hard">Hard</option>
                </select>
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows="3"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Describe your recipe..."
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Image URL
                </label>
                <input
                  type="url"
                  name="image"
                  value={formData.image}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  placeholder="https://example.com/recipe-image.jpg"
                />
                {formData.image && (
                  <div className="mt-2">
                    <img
                      src={formData.image}
                      alt="Preview"
                      className="w-32 h-32 object-cover rounded-md"
                      onError={(e) => e.target.style.display = 'none'}
                    />
                  </div>
                )}
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="isPublic"
                  name="isPublic"
                  checked={formData.isPublic}
                  onChange={handleChange}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="isPublic" className="ml-2 block text-sm text-gray-700">
                  Make this recipe public
                </label>
              </div>
            </div>
          </div>

          {/* Ingredients */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-gray-800">Ingredients *</h2>
              <button
                type="button"
                onClick={addIngredient}
                className="px-4 py-2 bg-green-100 text-green-700 rounded-md hover:bg-green-200 transition"
              >
                + Add Ingredient
              </button>
            </div>
            
            <div className="space-y-4">
              {formData.ingredients.map((ingredient, index) => (
                <div key={index} className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
                  <div className="md:col-span-4">
                    <input
                      type="text"
                      value={ingredient.name}
                      onChange={(e) => handleIngredientChange(index, 'name', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Ingredient name"
                      required
                    />
                  </div>
                  <div className="md:col-span-2">
                    <input
                      type="number"
                      step="0.1"
                      value={ingredient.amount}
                      onChange={(e) => handleIngredientChange(index, 'amount', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Amount"
                      required
                    />
                  </div>
                  <div className="md:col-span-2">
                    <input
                      type="text"
                      value={ingredient.unit}
                      onChange={(e) => handleIngredientChange(index, 'unit', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Unit (cup, tsp, etc.)"
                      required
                    />
                  </div>
                  <div className="md:col-span-3">
                    <input
                      type="text"
                      value={ingredient.note}
                      onChange={(e) => handleIngredientChange(index, 'note', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Note (optional)"
                    />
                  </div>
                  <div className="md:col-span-1">
                    {formData.ingredients.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeIngredient(index)}
                        className="w-full px-3 py-2 bg-red-100 text-red-700 rounded-md hover:bg-red-200 transition"
                      >
                        ×
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Instructions */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-gray-800">Instructions *</h2>
              <button
                type="button"
                onClick={addInstruction}
                className="px-4 py-2 bg-green-100 text-green-700 rounded-md hover:bg-green-200 transition"
              >
                + Add Step
              </button>
            </div>
            
            <div className="space-y-4">
              {formData.instructions.map((instruction, index) => (
                <div key={index} className="flex gap-4">
                  <div className="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold mt-1">
                    {index + 1}
                  </div>
                  <div className="flex-1">
                    <textarea
                      value={instruction}
                      onChange={(e) => handleInstructionChange(index, e.target.value)}
                      rows="3"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                      placeholder={`Step ${index + 1}...`}
                      required
                    />
                  </div>
                  {formData.instructions.length > 1 && (
                    <div className="flex-shrink-0">
                      <button
                        type="button"
                        onClick={() => removeInstruction(index)}
                        className="px-3 py-2 bg-red-100 text-red-700 rounded-md hover:bg-red-200 transition"
                      >
                        ×
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Nutrition (Optional) */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Nutrition Information (Optional)</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Calories
                </label>
                <input
                  type="number"
                  value={formData.nutrition.calories}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    nutrition: { ...prev.nutrition, calories: e.target.value }
                  }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  placeholder="kcal"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Protein
                </label>
                <input
                  type="text"
                  value={formData.nutrition.protein}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    nutrition: { ...prev.nutrition, protein: e.target.value }
                  }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  placeholder="e.g., 20g"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Fat
                </label>
                <input
                  type="text"
                  value={formData.nutrition.fat}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    nutrition: { ...prev.nutrition, fat: e.target.value }
                  }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  placeholder="e.g., 15g"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Carbohydrates
                </label>
                <input
                  type="text"
                  value={formData.nutrition.carbohydrates}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    nutrition: { ...prev.nutrition, carbohydrates: e.target.value }
                  }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  placeholder="e.g., 45g"
                />
              </div>
            </div>
          </div>

          {/* Tags */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Tags</h2>
            <div className="flex gap-2 mb-4">
              <input
                type="text"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                placeholder="Add a tag (e.g., vegetarian, quick-meal)"
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleTagAdd())}
              />
              <button
                type="button"
                onClick={handleTagAdd}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
              >
                Add
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {formData.tags.map((tag, index) => (
                <span
                  key={index}
                  className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800"
                >
                  {tag}
                  <button
                    type="button"
                    onClick={() => handleTagRemove(tag)}
                    className="ml-2 text-blue-600 hover:text-blue-800"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          </div>

          {/* Submit */}
          <div className="flex justify-end space-x-4">
            <button
              type="button"
              onClick={() => navigate('/my-recipes')}
              className="px-6 py-3 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 transition"
            >
              {loading ? 'Creating Recipe...' : 'Create Recipe'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddRecipe;