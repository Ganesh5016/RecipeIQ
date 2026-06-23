import axios from 'axios';
import Recipe from '../models/Recipe.js';
import RecommendationHistory from '../models/RecommendationHistory.js';
import { asyncHandler } from '../middleware/errorHandler.js';

export const getRecipes = asyncHandler(async (req, res) => {
  const { search, cuisine, dietType, difficulty, maxTime, page = 1, limit = 12 } = req.query;
  const query = {};
  if (search) query.$text = { $search: search };
  if (cuisine) query.cuisine = new RegExp(cuisine, 'i');
  if (dietType) query.dietType = { $in: [dietType] };
  if (difficulty) query.difficulty = difficulty;
  if (maxTime) query.cookingTime = { $lte: Number(maxTime) };

  const skip = (Number(page) - 1) * Number(limit);
  const [recipes, total] = await Promise.all([
    Recipe.find(query).sort({ createdAt: -1 }).skip(skip).limit(Number(limit)),
    Recipe.countDocuments(query),
  ]);
  res.json({ recipes, total, page: Number(page), pages: Math.ceil(total / Number(limit)) });
});

export const getRecipeById = asyncHandler(async (req, res) => {
  const recipe = await Recipe.findById(req.params.id);
  if (!recipe) return res.status(404).json({ error: 'Recipe not found' });
  recipe.viewCount += 1;
  await recipe.save();
  if (req.user) {
    await RecommendationHistory.create({ user: req.user._id, type: 'viewed', recipe: recipe._id });
  }
  res.json({ recipe });
});

export const getTrendingRecipes = asyncHandler(async (req, res) => {
  const trending = await Recipe.find()
    .sort({ viewCount: -1, averageRating: -1 })
    .limit(8);
  res.json({ recipes: trending });
});

export const getMealDBRecipes = asyncHandler(async (req, res) => {
  const { category, search } = req.query;
  let url = 'https://www.themealdb.com/api/json/v1/1/search.php?s=';
  if (search) url = `https://www.themealdb.com/api/json/v1/1/search.php?s=${search}`;
  else if (category) url = `https://www.themealdb.com/api/json/v1/1/filter.php?c=${category}`;

  const response = await axios.get(url);
  const meals = response.data.meals || [];
  res.json({ recipes: meals.slice(0, 12) });
});

export const getMealDBCategories = asyncHandler(async (req, res) => {
  const response = await axios.get('https://www.themealdb.com/api/json/v1/1/categories.php');
  res.json({ categories: response.data.categories || [] });
});

export const createRecipe = asyncHandler(async (req, res) => {
  const recipe = await Recipe.create({ ...req.body, createdBy: req.user._id, source: 'user' });
  res.status(201).json({ recipe });
});
