import mongoose from 'mongoose';

const mealItemSchema = new mongoose.Schema({
  recipeId: {
    type: mongoose.Schema.Types.Mixed, // Can be Number (Spoonacular) or ObjectId (UserRecipe)
    required: true
  },
  title: {
    type: String,
    required: true
  },
  image: String,
  source: {
    type: String,
    enum: ['spoonacular', 'user'],
    required: true
  },
  servings: {
    type: Number,
    default: 1
  },
  nutrition: {
    calories: Number,
    protein: String,
    fat: String,
    carbohydrates: String
  }
});

const mealSlotSchema = new mongoose.Schema({
  slot: {
    type: String,
    enum: ['breakfast', 'lunch', 'dinner', 'snack'],
    required: true
  },
  items: [mealItemSchema]
});

const mealPlanSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  date: {
    type: Date,
    required: true,
    index: true
  },
  meals: [mealSlotSchema],
  dailySummary: {
    totalCalories: {
      type: Number,
      default: 0
    },
    totalProtein: String,
    totalFat: String,
    totalCarbs: String,
    proteinPercentage: Number,
    fatPercentage: Number,
    carbsPercentage: Number
  },
  notes: {
    type: String,
    maxlength: 500
  },
  isCompleted: {
    type: Boolean,
    default: false
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

// Compound index for user and date
mealPlanSchema.index({ userId: 1, date: 1 }, { unique: true });

// Pre-save middleware to calculate daily summary
mealPlanSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  
  // Calculate daily nutrition summary
  let totalCalories = 0;
  let totalProtein = 0;
  let totalFat = 0;
  let totalCarbs = 0;

  this.meals.forEach(meal => {
    meal.items.forEach(item => {
      if (item.nutrition) {
        totalCalories += item.nutrition.calories || 0;
        
        // Parse nutrition values (e.g., "20g" -> 20)
        const parseNutrition = (value) => {
          if (!value) return 0;
          const num = parseFloat(value);
          return isNaN(num) ? 0 : num;
        };

        totalProtein += parseNutrition(item.nutrition.protein);
        totalFat += parseNutrition(item.nutrition.fat);
        totalCarbs += parseNutrition(item.nutrition.carbohydrates);
      }
    });
  });

  this.dailySummary.totalCalories = Math.round(totalCalories);
  
  // Format nutrition values
  this.dailySummary.totalProtein = totalProtein > 0 ? `${Math.round(totalProtein)}g` : '0g';
  this.dailySummary.totalFat = totalFat > 0 ? `${Math.round(totalFat)}g` : '0g';
  this.dailySummary.totalCarbs = totalCarbs > 0 ? `${Math.round(totalCarbs)}g` : '0g';

  // Calculate percentages
  const totalMacros = totalProtein + totalFat + totalCarbs;
  if (totalMacros > 0) {
    this.dailySummary.proteinPercentage = Math.round((totalProtein / totalMacros) * 100);
    this.dailySummary.fatPercentage = Math.round((totalFat / totalMacros) * 100);
    this.dailySummary.carbsPercentage = Math.round((totalCarbs / totalMacros) * 100);
  } else {
    this.dailySummary.proteinPercentage = 0;
    this.dailySummary.fatPercentage = 0;
    this.dailySummary.carbsPercentage = 0;
  }

  next();
});

// Static method to get meal plan by date range
mealPlanSchema.statics.findByDateRange = function(userId, startDate, endDate) {
  return this.find({
    userId,
    date: {
      $gte: startDate,
      $lte: endDate
    }
  }).sort({ date: 1 });
};

// Static method to get weekly summary
mealPlanSchema.statics.getWeeklySummary = async function(userId, startDate) {
  const endDate = new Date(startDate);
  endDate.setDate(endDate.getDate() + 6);

  const mealPlans = await this.findByDateRange(userId, startDate, endDate);

  const weeklySummary = {
    totalCalories: 0,
    totalProtein: 0,
    totalFat: 0,
    totalCarbs: 0,
    daysPlanned: mealPlans.length,
    averageCalories: 0
  };

  mealPlans.forEach(plan => {
    weeklySummary.totalCalories += plan.dailySummary.totalCalories || 0;
    weeklySummary.totalProtein += parseFloat(plan.dailySummary.totalProtein) || 0;
    weeklySummary.totalFat += parseFloat(plan.dailySummary.totalFat) || 0;
    weeklySummary.totalCarbs += parseFloat(plan.dailySummary.totalCarbs) || 0;
  });

  if (mealPlans.length > 0) {
    weeklySummary.averageCalories = Math.round(weeklySummary.totalCalories / mealPlans.length);
  }

  return {
    mealPlans,
    summary: weeklySummary
  };
};

const MealPlan = mongoose.model('MealPlan', mealPlanSchema);

export default MealPlan;