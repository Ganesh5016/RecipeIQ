import mongoose from 'mongoose';

const recipeSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  description: { type: String, required: true },
  image: { type: String, default: '' },
  cuisine: { type: String, default: 'International' },
  category: { type: String, default: 'Main Course' },
  dietType: [{ type: String }],
  ingredients: [{
    name: { type: String, required: true },
    amount: { type: String, required: true },
    unit: { type: String, default: '' },
  }],
  steps: [{ type: String }],
  cookingTime: { type: Number, default: 30 },
  prepTime: { type: Number, default: 15 },
  servings: { type: Number, default: 4 },
  difficulty: { type: String, enum: ['easy', 'medium', 'hard'], default: 'easy' },
  nutrition: {
    calories: { type: Number, default: 0 },
    protein: { type: Number, default: 0 },
    carbs: { type: Number, default: 0 },
    fat: { type: Number, default: 0 },
    fiber: { type: Number, default: 0 },
    sugar: { type: Number, default: 0 },
  },
  tags: [{ type: String }],
  source: { type: String, enum: ['ai', 'mealdb', 'user'], default: 'ai' },
  externalId: { type: String, default: '' },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  viewCount: { type: Number, default: 0 },
  saveCount: { type: Number, default: 0 },
  averageRating: { type: Number, default: 0 },
  ratingCount: { type: Number, default: 0 },
}, { timestamps: true });

recipeSchema.index({ title: 'text', description: 'text', tags: 'text' });
recipeSchema.index({ cuisine: 1, dietType: 1 });

export default mongoose.model('Recipe', recipeSchema);
