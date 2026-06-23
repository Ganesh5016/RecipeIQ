import User from '../models/User.js';
import Recipe from '../models/Recipe.js';
import Review from '../models/Review.js';
import { asyncHandler } from '../middleware/errorHandler.js';

export const getAllUsers = asyncHandler(async (req, res) => {
  const { page = 1, limit = 20, search } = req.query;
  const query = search ? { $or: [{ name: new RegExp(search, 'i') }, { email: new RegExp(search, 'i') }] } : {};
  const [users, total] = await Promise.all([
    User.find(query).sort({ createdAt: -1 }).skip((page - 1) * limit).limit(Number(limit)).select('-__v'),
    User.countDocuments(query),
  ]);
  res.json({ users, total });
});

export const updateUserRole = asyncHandler(async (req, res) => {
  const user = await User.findByIdAndUpdate(req.params.id, { role: req.body.role }, { new: true });
  if (!user) return res.status(404).json({ error: 'User not found' });
  res.json({ user });
});

export const deleteUser = asyncHandler(async (req, res) => {
  await User.findByIdAndDelete(req.params.id);
  res.json({ success: true });
});

export const getAllRecipes = asyncHandler(async (req, res) => {
  const { page = 1, limit = 20 } = req.query;
  const [recipes, total] = await Promise.all([
    Recipe.find().sort({ createdAt: -1 }).skip((page - 1) * limit).limit(Number(limit)),
    Recipe.countDocuments(),
  ]);
  res.json({ recipes, total });
});

export const deleteRecipe = asyncHandler(async (req, res) => {
  await Recipe.findByIdAndDelete(req.params.id);
  res.json({ success: true });
});

export const getAllReviews = asyncHandler(async (req, res) => {
  const reviews = await Review.find()
    .populate('user', 'name email')
    .populate('recipe', 'title')
    .sort({ createdAt: -1 })
    .limit(50);
  res.json({ reviews });
});

export const deleteReview = asyncHandler(async (req, res) => {
  await Review.findByIdAndDelete(req.params.id);
  res.json({ success: true });
});
