import mongoose from 'mongoose';

const ingredientSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please add ingredient name']
  },
  amount: {
    type: Number,
    required: [true, 'Please add ingredient amount']
  },
  unit: {
    type: String,
    required: [true, 'Please add ingredient unit']
  },
  note: String
});

const nutritionSchema = new mongoose.Schema({
  calories: Number,
  protein: String,
  fat: String,
  carbohydrates: String
});

const userRecipeSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  title: {
    type: String,
    required: [true, 'Please add a recipe title'],
    trim: true,
    maxlength: [100, 'Title cannot be more than 100 characters']
  },
  description: {
    type: String,
    maxlength: [500, 'Description cannot be more than 500 characters']
  },
  image: {
    type: String,
    default: '/default-recipe.jpg'
  },
  prepTime: {
    type: Number,
    required: [true, 'Please add preparation time in minutes']
  },
  cookTime: {
    type: Number,
    required: [true, 'Please add cooking time in minutes']
  },
  totalTime: {
    type: Number,
    required: [true, 'Please add total time in minutes']
  },
  servings: {
    type: Number,
    required: [true, 'Please add number of servings'],
    min: [1, 'Servings must be at least 1']
  },
  difficulty: {
    type: String,
    enum: ['Easy', 'Medium', 'Hard'],
    default: 'Medium'
  },
  ingredients: [ingredientSchema],
  instructions: [{
    stepNumber: {
      type: Number,
      required: true
    },
    instruction: {
      type: String,
      required: true
    }
  }],
  nutrition: nutritionSchema,
  tags: [String],
  category: {
    type: String,
    enum: ['Breakfast', 'Lunch', 'Dinner', 'Dessert', 'Snack', 'Other'],
    default: 'Other'
  },
  isPublic: {
    type: Boolean,
    default: false
  },
  likes: {
    type: Number,
    default: 0
  },
  favoritesCount: {
    type: Number,
    default: 0
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Update totalTime before save
userRecipeSchema.pre('save', function(next) {
  this.totalTime = this.prepTime + this.cookTime;
  next();
});

// Indexes for better query performance
userRecipeSchema.index({ userId: 1, createdAt: -1 });
userRecipeSchema.index({ isPublic: 1, likes: -1 });
userRecipeSchema.index({ title: 'text', description: 'text' });

const UserRecipe = mongoose.model('UserRecipe', userRecipeSchema);

export default UserRecipe;