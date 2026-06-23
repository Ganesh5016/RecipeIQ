import User from '../models/User.js';
import Recipe from '../models/Recipe.js';
import Favorite from '../models/Favorite.js';
import Review from '../models/Review.js';
import RecommendationHistory from '../models/RecommendationHistory.js';
import { asyncHandler } from '../middleware/errorHandler.js';

export const getPublicStats = asyncHandler(async (req, res) => {
  const [totalUsers, totalRecipes, totalFavorites, totalReviews] = await Promise.all([
    User.countDocuments(),
    Recipe.countDocuments(),
    Favorite.countDocuments(),
    Review.countDocuments(),
  ]);
  res.json({ totalUsers, totalRecipes, totalFavorites, totalReviews });
});

export const getAdminAnalytics = asyncHandler(async (req, res) => {
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  const [
    totalUsers, activeUsers, totalRecipes, aiGenerated,
    topCuisines, recentUsers, topRecipes
  ] = await Promise.all([
    User.countDocuments(),
    User.countDocuments({ lastLogin: { $gte: thirtyDaysAgo } }),
    Recipe.countDocuments(),
    Recipe.countDocuments({ source: 'ai' }),
    Recipe.aggregate([{ $group: { _id: '$cuisine', count: { $sum: 1 } } }, { $sort: { count: -1 } }, { $limit: 6 }]),
    User.find().sort({ createdAt: -1 }).limit(5).select('name email createdAt'),
    Recipe.find().sort({ viewCount: -1 }).limit(5).select('title viewCount averageRating'),
  ]);

  const userGrowth = await User.aggregate([
    { $match: { createdAt: { $gte: thirtyDaysAgo } } },
    { $group: { _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } }, count: { $sum: 1 } } },
    { $sort: { _id: 1 } },
  ]);

  res.json({ totalUsers, activeUsers, totalRecipes, aiGenerated, topCuisines, recentUsers, topRecipes, userGrowth });
});

export const getUserStats = asyncHandler(async (req, res) => {
  const [favorites, generated, history] = await Promise.all([
    Favorite.countDocuments({ user: req.user._id }),
    RecommendationHistory.countDocuments({ user: req.user._id, type: 'generated' }),
    RecommendationHistory.countDocuments({ user: req.user._id }),
  ]);
  res.json({ favorites, generated, history });
});
