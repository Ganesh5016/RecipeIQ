import mongoose from 'mongoose';

const groceryItemSchema = new mongoose.Schema({
  name: { type: String, required: true },
  amount: { type: String, default: '' },
  unit: { type: String, default: '' },
  category: { type: String, default: 'Other' },
  purchased: { type: Boolean, default: false },
});

const groceryListSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true },
  mealPlan: { type: mongoose.Schema.Types.ObjectId, ref: 'MealPlan' },
  items: [groceryItemSchema],
  isCompleted: { type: Boolean, default: false },
}, { timestamps: true });

export default mongoose.model('GroceryList', groceryListSchema);
