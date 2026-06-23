import User from '../models/User.js';
import { asyncHandler } from '../middleware/errorHandler.js';

export const getProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).select('-__v');
  res.json({ user });
});

export const updateProfile = asyncHandler(async (req, res) => {
  const allowed = ['name', 'avatar', 'dietPreference', 'allergies', 'favoriteCuisine', 'fitnessGoal', 'skillLevel', 'calorieGoal'];
  const updates = {};
  allowed.forEach((f) => { if (req.body[f] !== undefined) updates[f] = req.body[f]; });
  const user = await User.findByIdAndUpdate(req.user._id, updates, { new: true, runValidators: true }).select('-__v');
  res.json({ user });
});

export const deleteAccount = asyncHandler(async (req, res) => {
  await User.findByIdAndDelete(req.user._id);
  res.json({ success: true, message: 'Account deleted' });
});
