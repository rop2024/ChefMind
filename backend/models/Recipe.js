import mongoose from 'mongoose';

const nutritionSchema = new mongoose.Schema({
  calories: { type: Number },
  protein: { type: String },
  fat: { type: String },
  carbohydrates: { type: String }
});

const ingredientSchema = new mongoose.Schema({
  id: { type: Number },
  name: { type: String, required: true },
  amount: { type: Number },
  unit: { type: String },
  image: { type: String }
});

const recipeSchema = new mongoose.Schema({
  spoonacularId: { 
    type: Number, 
    required: true, 
    unique: true 
  },
  title: { 
    type: String, 
    required: true 
  },
  image: { 
    type: String 
  },
  summary: { 
    type: String 
  },
  instructions: { 
    type: String 
  },
  readyInMinutes: { 
    type: Number 
  },
  servings: { 
    type: Number 
  },
  sourceUrl: { 
    type: String 
  },
  spoonacularSourceUrl: { 
    type: String 
  },
  extendedIngredients: [ingredientSchema],
  analyzedInstructions: [{
    name: String,
    steps: [{
      number: Number,
      step: String,
      ingredients: [{
        id: Number,
        name: String
      }],
      equipment: [{
        id: Number,
        name: String
      }]
    }]
  }],
  nutrition: nutritionSchema,
  diets: [String],
  cuisines: [String],
  dishTypes: [String],
  lastFetched: { 
    type: Date, 
    default: Date.now 
  },
  fetchCount: { 
    type: Number, 
    default: 1 
  }
}, {
  timestamps: true
});

// Index for faster lookups
recipeSchema.index({ spoonacularId: 1 });
recipeSchema.index({ lastFetched: 1 });
recipeSchema.index({ title: 'text' });

// Pre-save middleware to update lastFetched
recipeSchema.pre('save', function(next) {
  this.lastFetched = new Date();
  next();
});

const Recipe = mongoose.model('Recipe', recipeSchema);

export default Recipe;