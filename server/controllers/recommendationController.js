import groq from '../config/groq.js';
import Recipe from '../models/Recipe.js';
import RecommendationHistory from '../models/RecommendationHistory.js';
import { asyncHandler } from '../middleware/errorHandler.js';

const getDifficulty = (skill) => {
  if (skill === 'beginner') return 'easy';
  if (skill === 'intermediate') return 'medium';
  if (skill === 'advanced') return 'hard';
  return 'easy';
};

const buildRecipePrompt = (data) => `
You are a professional chef AI. Generate a detailed recipe in JSON format based on these requirements:
- Ingredients available: ${data.ingredients?.join(', ') || 'any'}
- Cuisine type: ${data.cuisine || 'any'}
- Diet type: ${data.dietType || 'none'}
- Allergies to avoid: ${data.allergies?.join(', ') || 'none'}
- Max cooking time: ${data.cookingTime || 60} minutes
- Target calories: ${data.calories || 'balanced'}
- Target difficulty: ${getDifficulty(data.skillLevel)}
- Servings: ${data.servings || 4}
- Output Language: ${data.language === 'te' ? 'Telugu' : data.language === 'hi' ? 'Hindi' : data.language === 'ta' ? 'Tamil' : 'English'}

Return ONLY a valid JSON object (no markdown, no explanation) with this exact structure. The "difficulty" field MUST be exactly one of: "easy", "medium", or "hard":
{
  "title": "Recipe Name",
  "description": "Brief description",
  "cuisine": "Cuisine type",
  "category": "Category",
  "dietType": ["tag1"],
  "ingredients": [{"name": "item", "amount": "1", "unit": "cup"}],
  "steps": ["Step 1...", "Step 2..."],
  "cookingTime": 30,
  "prepTime": 15,
  "servings": 4,
  "difficulty": "easy",
  "nutrition": {"calories": 350, "protein": 20, "carbs": 40, "fat": 10, "fiber": 5, "sugar": 8},
  "tags": ["tag1", "tag2"]
}`;

export const generateRecipe = asyncHandler(async (req, res) => {
  const completion = await groq.chat.completions.create({
    model: 'llama-3.3-70b-versatile',
    messages: [{ role: 'user', content: buildRecipePrompt(req.body) }],
    temperature: 0.7,
    max_tokens: 2000,
  });

  const raw = completion.choices[0]?.message?.content?.trim();
  let recipeData;
  try {
    const jsonMatch = raw.match(/\{[\s\S]*\}/);
    recipeData = JSON.parse(jsonMatch ? jsonMatch[0] : raw);
  } catch {
    return res.status(500).json({ error: 'Failed to parse AI response. Please try again.' });
  }

  // Sanitize difficulty in case AI hallucinated
  const validDiffs = ['easy', 'medium', 'hard'];
  if (!validDiffs.includes(recipeData.difficulty)) {
    const d = String(recipeData.difficulty).toLowerCase();
    recipeData.difficulty = d === 'intermediate' ? 'medium' : d === 'advanced' ? 'hard' : 'easy';
  }

  const savedRecipe = await Recipe.create({ ...recipeData, source: 'ai', createdBy: req.user._id });

  await RecommendationHistory.create({
    user: req.user._id,
    type: 'generated',
    query: req.body,
    recipe: savedRecipe._id,
    recipeData,
  });

  res.json({ recipe: savedRecipe });
});

export const matchIngredients = asyncHandler(async (req, res) => {
  const { ingredients } = req.body;
  if (!ingredients?.length) return res.status(400).json({ error: 'Ingredients required' });

  const prompt = `Given these ingredients: ${ingredients.join(', ')}, suggest 5 recipes that maximize usage of these ingredients. Return ONLY a valid JSON array of objects with structure:
[{"title": "Recipe", "description": "Brief description", "matchPercentage": 85, "missingIngredients": ["item1"], "cuisine": "Italian", "cookingTime": 30, "difficulty": "easy", "estimatedCalories": 400}]
No markdown, no explanation.`;

  const completion = await groq.chat.completions.create({
    model: 'llama-3.3-70b-versatile',
    messages: [{ role: 'user', content: prompt }],
    temperature: 0.7,
    max_tokens: 1500,
  });

  const raw = completion.choices[0]?.message?.content?.trim();
  let suggestions;
  try {
    const jsonMatch = raw.match(/\[[\s\S]*\]/);
    suggestions = JSON.parse(jsonMatch ? jsonMatch[0] : raw);
  } catch {
    return res.status(500).json({ error: 'Failed to parse suggestions. Please try again.' });
  }

  res.json({ suggestions });
});

export const analyzeNutrition = asyncHandler(async (req, res) => {
  const { recipeText } = req.body;
  if (!recipeText) return res.status(400).json({ error: 'Recipe text required' });

  const prompt = `Analyze the nutritional content of this recipe and return ONLY a valid JSON object:
Recipe: ${recipeText}
{"calories": 0, "protein": 0, "carbs": 0, "fat": 0, "fiber": 0, "sugar": 0, "sodium": 0, "servings": 1, "notes": "brief note"}
All values per serving in grams except calories (kcal) and sodium (mg).`;

  const completion = await groq.chat.completions.create({
    model: 'llama-3.3-70b-versatile',
    messages: [{ role: 'user', content: prompt }],
    temperature: 0.3,
    max_tokens: 500,
  });

  const raw = completion.choices[0]?.message?.content?.trim();
  let nutrition;
  try {
    const jsonMatch = raw.match(/\{[\s\S]*\}/);
    nutrition = JSON.parse(jsonMatch ? jsonMatch[0] : raw);
  } catch {
    return res.status(500).json({ error: 'Failed to analyze nutrition. Please try again.' });
  }

  res.json({ nutrition });
});

export const getHistory = asyncHandler(async (req, res) => {
  const history = await RecommendationHistory.find({ user: req.user._id })
    .populate('recipe', 'title image cuisine cookingTime')
    .sort({ createdAt: -1 })
    .limit(20);
  res.json({ history });
});

export const generateMealPlanAI = asyncHandler(async (req, res) => {
  const { goal, days = 7, calorieGoal = 2000, dietType } = req.body;

  const prompt = `Create a ${days}-day meal plan for goal: ${goal}, diet: ${dietType || 'none'}, daily calories: ~${calorieGoal}. Return ONLY valid JSON array:
[{"day": 1, "breakfast": {"title": "...", "calories": 400}, "lunch": {"title": "...", "calories": 600}, "dinner": {"title": "...", "calories": 700}, "snack": {"title": "...", "calories": 200}, "totalCalories": 1900}]`;

  const completion = await groq.chat.completions.create({
    model: 'llama-3.3-70b-versatile',
    messages: [{ role: 'user', content: prompt }],
    temperature: 0.7,
    max_tokens: 2000,
  });

  const raw = completion.choices[0]?.message?.content?.trim();
  let plan;
  try {
    const jsonMatch = raw.match(/\[[\s\S]*\]/);
    plan = JSON.parse(jsonMatch ? jsonMatch[0] : raw);
  } catch {
    return res.status(500).json({ error: 'Failed to generate meal plan. Please try again.' });
  }

  res.json({ plan });
});
