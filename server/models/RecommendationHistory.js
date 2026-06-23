import mongoose from 'mongoose';

const recommendationHistorySchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  type: { type: String, enum: ['generated', 'searched', 'viewed'], required: true },
  query: { type: mongoose.Schema.Types.Mixed },
  recipe: { type: mongoose.Schema.Types.ObjectId, ref: 'Recipe' },
  recipeData: { type: mongoose.Schema.Types.Mixed },
}, { timestamps: true });

export default mongoose.model('RecommendationHistory', recommendationHistorySchema);
