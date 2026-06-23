import Review from '../models/Review.js';
import Recipe from '../models/Recipe.js';
import { asyncHandler } from '../middleware/errorHandler.js';

const updateRecipeRating = async (recipeId) => {
  const stats = await Review.aggregate([
    { $match: { recipe: recipeId } },
    { $group: { _id: null, avg: { $avg: '$rating' }, count: { $sum: 1 } } },
  ]);
  const { avg = 0, count = 0 } = stats[0] || {};
  await Recipe.findByIdAndUpdate(recipeId, { averageRating: Math.round(avg * 10) / 10, ratingCount: count });
};

export const getReviews = asyncHandler(async (req, res) => {
  const reviews = await Review.find({ recipe: req.params.recipeId })
    .populate('user', 'name avatar')
    .sort({ createdAt: -1 });
  res.json({ reviews });
});

export const addReview = asyncHandler(async (req, res) => {
  const { recipeId } = req.params;
  const existing = await Review.findOne({ user: req.user._id, recipe: recipeId });
  if (existing) return res.status(400).json({ error: 'Already reviewed this recipe' });

  const review = await Review.create({ user: req.user._id, recipe: recipeId, ...req.body });
  await updateRecipeRating(review.recipe);
  await review.populate('user', 'name avatar');
  res.status(201).json({ review });
});

export const updateReview = asyncHandler(async (req, res) => {
  const review = await Review.findOneAndUpdate(
    { _id: req.params.id, user: req.user._id },
    req.body,
    { new: true, runValidators: true }
  ).populate('user', 'name avatar');
  if (!review) return res.status(404).json({ error: 'Review not found' });
  await updateRecipeRating(review.recipe);
  res.json({ review });
});

export const deleteReview = asyncHandler(async (req, res) => {
  const review = await Review.findOneAndDelete({ _id: req.params.id, user: req.user._id });
  if (!review) return res.status(404).json({ error: 'Review not found' });
  await updateRecipeRating(review.recipe);
  res.json({ success: true });
});
