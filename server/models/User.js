import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  firebaseUid: { type: String, required: true, unique: true },
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true },
  avatar: { type: String, default: '' },
  role: { type: String, enum: ['user', 'admin'], default: 'user' },
  dietPreference: {
    type: String,
    enum: ['none', 'vegetarian', 'vegan', 'keto', 'paleo', 'gluten-free', 'diabetic'],
    default: 'none',
  },
  allergies: [{ type: String }],
  favoriteCuisine: [{ type: String }],
  fitnessGoal: {
    type: String,
    enum: ['none', 'weight-loss', 'weight-gain', 'muscle-gain', 'maintenance'],
    default: 'none',
  },
  skillLevel: {
    type: String,
    enum: ['beginner', 'intermediate', 'advanced'],
    default: 'beginner',
  },
  calorieGoal: { type: Number, default: 2000 },
  isActive: { type: Boolean, default: true },
  lastLogin: { type: Date, default: Date.now },
}, { timestamps: true });

export default mongoose.model('User', userSchema);
