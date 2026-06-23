import admin from '../config/firebase.js';
import User from '../models/User.js';
import { asyncHandler } from '../middleware/errorHandler.js';

export const registerUser = asyncHandler(async (req, res) => {
  const { firebaseUid, name, email, avatar } = req.body;
  if (!firebaseUid || !name || !email) {
    return res.status(400).json({ error: 'Missing required fields' });
  }
  const existing = await User.findOne({ firebaseUid });
  if (existing) {
    existing.lastLogin = new Date();
    await existing.save();
    return res.json({ user: existing, isNew: false });
  }
  const adminUid = process.env.ADMIN_UID;
  const user = await User.create({
    firebaseUid,
    name,
    email,
    avatar: avatar || '',
    role: firebaseUid === adminUid ? 'admin' : 'user',
  });
  res.status(201).json({ user, isNew: true });
});

export const getMe = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).select('-__v');
  res.json({ user });
});

export const updateLastLogin = asyncHandler(async (req, res) => {
  await User.findByIdAndUpdate(req.user._id, { lastLogin: new Date() });
  res.json({ success: true });
});
