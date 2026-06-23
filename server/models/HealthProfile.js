import mongoose from 'mongoose';

const healthProfileSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  conditions: [{ type: String }],
  allergies: [{ type: String }],
  age: { type: Number },
  gender: { type: String, enum: ['male', 'female', 'other', 'prefer-not-to-say'] },
  height: { type: Number }, // in cm
  weight: { type: Number }, // in kg
  aiDietPlan: {
    recommendedCalories: { type: Number },
    foodsToEat: [{ type: String }],
    foodsToAvoid: [{ type: String }],
    generalAdvice: { type: String }
  },
  records: [{
    date: { type: Date, default: Date.now },
    weight: { type: Number }, // in kg
    caloriesConsumed: { type: Number },
    notes: { type: String }
  }]
}, { timestamps: true });

export default mongoose.model('HealthProfile', healthProfileSchema);
