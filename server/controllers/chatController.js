import groq from '../config/groq.js';
import ChatMessage from '../models/ChatMessage.js';
import { asyncHandler } from '../middleware/errorHandler.js';

const SYSTEM_PROMPT = `You are Chef IQ, an expert AI culinary assistant for RecipeIQ. You help users with:
- Recipe suggestions and customization
- Ingredient substitutions
- Cooking techniques and tips
- Nutritional guidance
- Meal planning advice
- Food safety and storage tips
Be friendly, concise, and always food-focused. If asked about non-food topics, gently redirect to culinary topics.`;

export const sendMessage = asyncHandler(async (req, res) => {
  const { message, sessionId } = req.body;

  const recentMessages = await ChatMessage.find({
    user: req.user._id,
    sessionId,
  }).sort({ createdAt: 1 }).limit(10);

  const history = recentMessages.map((m) => ({ role: m.role, content: m.content }));

  const completion = await groq.chat.completions.create({
    model: 'llama-3.3-70b-versatile',
    messages: [
      { role: 'system', content: SYSTEM_PROMPT },
      ...history,
      { role: 'user', content: message },
    ],
    temperature: 0.8,
    max_tokens: 800,
  });

  const reply = completion.choices[0]?.message?.content?.trim();

  await ChatMessage.insertMany([
    { user: req.user._id, sessionId, role: 'user', content: message },
    { user: req.user._id, sessionId, role: 'assistant', content: reply },
  ]);

  res.json({ reply, sessionId });
});

export const getChatHistory = asyncHandler(async (req, res) => {
  const { sessionId } = req.params;
  const messages = await ChatMessage.find({ user: req.user._id, sessionId })
    .sort({ createdAt: 1 });
  res.json({ messages });
});

export const getSessions = asyncHandler(async (req, res) => {
  const sessions = await ChatMessage.aggregate([
    { $match: { user: req.user._id } },
    { $sort: { createdAt: -1 } },
    { $group: { _id: '$sessionId', lastMessage: { $first: '$content' }, updatedAt: { $first: '$createdAt' }, count: { $sum: 1 } } },
    { $limit: 10 },
  ]);
  res.json({ sessions });
});

export const deleteSession = asyncHandler(async (req, res) => {
  await ChatMessage.deleteMany({ user: req.user._id, sessionId: req.params.sessionId });
  res.json({ success: true });
});
