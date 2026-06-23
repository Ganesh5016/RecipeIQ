import Favorite from '../models/Favorite.js';
import Recipe from '../models/Recipe.js';
import { asyncHandler } from '../middleware/errorHandler.js';

export const getFavorites = asyncHandler(async (req, res) => {
  const favorites = await Favorite.find({ user: req.user._id })
    .populate('recipe')
    .sort({ createdAt: -1 });
  res.json({ favorites });
});

export const addFavorite = asyncHandler(async (req, res) => {
  const { recipeId, category } = req.body;
  const existing = await Favorite.findOne({ user: req.user._id, recipe: recipeId });
  if (existing) return res.status(400).json({ error: 'Already in favorites' });

  const favorite = await Favorite.create({ user: req.user._id, recipe: recipeId, category });
  await Recipe.findByIdAndUpdate(recipeId, { $inc: { saveCount: 1 } });
  await favorite.populate('recipe');
  res.status(201).json({ favorite });
});

export const removeFavorite = asyncHandler(async (req, res) => {
  const favorite = await Favorite.findOneAndDelete({ user: req.user._id, recipe: req.params.recipeId });
  if (!favorite) return res.status(404).json({ error: 'Not found in favorites' });
  await Recipe.findByIdAndUpdate(req.params.recipeId, { $inc: { saveCount: -1 } });
  res.json({ success: true });
});

export const checkFavorite = asyncHandler(async (req, res) => {
  const fav = await Favorite.findOne({ user: req.user._id, recipe: req.params.recipeId });
  res.json({ isFavorite: !!fav });
});
