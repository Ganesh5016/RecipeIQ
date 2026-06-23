import GroceryList from '../models/GroceryList.js';
import { asyncHandler } from '../middleware/errorHandler.js';

export const getGroceryLists = asyncHandler(async (req, res) => {
  const lists = await GroceryList.find({ user: req.user._id }).sort({ createdAt: -1 });
  res.json({ lists });
});

export const getGroceryListById = asyncHandler(async (req, res) => {
  const list = await GroceryList.findOne({ _id: req.params.id, user: req.user._id });
  if (!list) return res.status(404).json({ error: 'Grocery list not found' });
  res.json({ list });
});

export const createGroceryList = asyncHandler(async (req, res) => {
  const list = await GroceryList.create({ ...req.body, user: req.user._id });
  res.status(201).json({ list });
});

export const updateGroceryList = asyncHandler(async (req, res) => {
  const list = await GroceryList.findOneAndUpdate(
    { _id: req.params.id, user: req.user._id },
    req.body,
    { new: true }
  );
  if (!list) return res.status(404).json({ error: 'Grocery list not found' });
  res.json({ list });
});

export const toggleItem = asyncHandler(async (req, res) => {
  const list = await GroceryList.findOne({ _id: req.params.id, user: req.user._id });
  if (!list) return res.status(404).json({ error: 'List not found' });
  const item = list.items.id(req.params.itemId);
  if (!item) return res.status(404).json({ error: 'Item not found' });
  item.purchased = !item.purchased;
  await list.save();
  res.json({ list });
});

export const deleteGroceryList = asyncHandler(async (req, res) => {
  await GroceryList.findOneAndDelete({ _id: req.params.id, user: req.user._id });
  res.json({ success: true });
});
