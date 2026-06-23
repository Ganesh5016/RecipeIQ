import MealPlan from '../models/MealPlan.js';
import { asyncHandler } from '../middleware/errorHandler.js';

export const getMealPlans = asyncHandler(async (req, res) => {
  const plans = await MealPlan.find({ user: req.user._id }).sort({ createdAt: -1 });
  res.json({ plans });
});

export const getMealPlanById = asyncHandler(async (req, res) => {
  const plan = await MealPlan.findOne({ _id: req.params.id, user: req.user._id })
    .populate('days.meals.recipe', 'title image nutrition');
  if (!plan) return res.status(404).json({ error: 'Meal plan not found' });
  res.json({ plan });
});

export const createMealPlan = asyncHandler(async (req, res) => {
  const { title, planType, goal, startDate, days } = req.body;
  const start = new Date(startDate);
  const daysCount = planType === 'daily' ? 1 : planType === 'weekly' ? 7 : 30;
  const endDate = new Date(start);
  endDate.setDate(endDate.getDate() + daysCount - 1);

  const plan = await MealPlan.create({
    user: req.user._id,
    title,
    planType,
    goal,
    startDate: start,
    endDate,
    days: days || [],
  });
  res.status(201).json({ plan });
});

export const updateMealPlan = asyncHandler(async (req, res) => {
  const plan = await MealPlan.findOneAndUpdate(
    { _id: req.params.id, user: req.user._id },
    req.body,
    { new: true }
  );
  if (!plan) return res.status(404).json({ error: 'Meal plan not found' });
  res.json({ plan });
});

export const deleteMealPlan = asyncHandler(async (req, res) => {
  const plan = await MealPlan.findOneAndDelete({ _id: req.params.id, user: req.user._id });
  if (!plan) return res.status(404).json({ error: 'Meal plan not found' });
  res.json({ success: true });
});
