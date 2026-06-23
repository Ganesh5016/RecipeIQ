import HealthProfile from '../models/HealthProfile.js';
import groq from '../config/groq.js';
import { asyncHandler } from '../middleware/errorHandler.js';

export const getHealthProfile = asyncHandler(async (req, res) => {
  let profile = await HealthProfile.findOne({ user: req.user._id });
  if (!profile) {
    profile = await HealthProfile.create({ user: req.user._id });
  }
  res.json({ profile });
});

export const updateAndAnalyze = asyncHandler(async (req, res) => {
  const { conditions, allergies, age, gender, height, weight } = req.body;
  
  const prompt = `You are an expert AI nutritionist and health advisor.
A user has provided the following health profile:
- Age: ${age || 'Not specified'}
- Gender: ${gender || 'Not specified'}
- Height: ${height || 'Not specified'} cm
- Weight: ${weight || 'Not specified'} kg
- Health Conditions: ${conditions?.join(', ') || 'None'}
- Allergies: ${allergies?.join(', ') || 'None'}

Based on this profile, generate a strict personalized diet plan.
Return ONLY a valid JSON object with the following structure (no markdown, no explanations):
{
  "recommendedCalories": 2000,
  "foodsToEat": ["item1", "item2"],
  "foodsToAvoid": ["item1", "item2"],
  "generalAdvice": "Brief professional health advice based on the conditions."
}`;

  const completion = await groq.chat.completions.create({
    model: 'llama-3.3-70b-versatile',
    messages: [{ role: 'user', content: prompt }],
    temperature: 0.3,
    max_tokens: 1000,
  });

  const raw = completion.choices[0]?.message?.content?.trim();
  let aiDietPlan;
  try {
    const jsonMatch = raw.match(/\{[\s\S]*\}/);
    aiDietPlan = JSON.parse(jsonMatch ? jsonMatch[0] : raw);
  } catch {
    return res.status(500).json({ error: 'Failed to generate AI diet plan. Please try again.' });
  }

  const profile = await HealthProfile.findOneAndUpdate(
    { user: req.user._id },
    { conditions, allergies, age, gender, height, weight, aiDietPlan },
    { new: true, upsert: true }
  );

  res.json({ profile });
});

export const addHealthRecord = asyncHandler(async (req, res) => {
  const { weight, caloriesConsumed, notes } = req.body;
  const profile = await HealthProfile.findOne({ user: req.user._id });
  
  if (!profile) return res.status(404).json({ error: 'Profile not found' });

  profile.records.push({ weight, caloriesConsumed, notes });
  // Update current weight to latest record's weight
  if (weight) profile.weight = weight;
  
  await profile.save();
  
  res.json({ profile });
});
