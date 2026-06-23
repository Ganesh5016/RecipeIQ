import mongoose from 'mongoose';

const mealEntrySchema = new mongoose.Schema({
  recipe: { type: mongoose.Schema.Types.ObjectId, ref: 'Recipe' },
  recipeTitle: { type: String },
  mealType: { type: String, enum: ['breakfast', 'lunch', 'dinner', 'snack'], required: true },
  calories: { type: Number, default: 0 },
  notes: { type: String, default: '' },
});

const dayPlanSchema = new mongoose.Schema({
  date: { type: Date, required: true },
  meals: [mealEntrySchema],
  totalCalories: { type: Number, default: 0 },
});

const mealPlanSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true },
  planType: { type: String, enum: ['daily', 'weekly', 'monthly'], default: 'weekly' },
  goal: {
    type: String,
    enum: ['weight-loss', 'weight-gain', 'muscle-gain', 'maintenance', 'vegetarian', 'vegan', 'diabetic'],
    default: 'maintenance',
  },
  days: [dayPlanSchema],
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  isActive: { type: Boolean, default: true },
}, { timestamps: true });

export default mongoose.model('MealPlan', mealPlanSchema);
