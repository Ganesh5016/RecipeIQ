import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BarChart3, Loader } from 'lucide-react';
import { PieChart, Pie, Cell, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Legend } from 'recharts';
import { recommendationAPI } from '../../services/api.js';
import toast from 'react-hot-toast';

const COLORS = { calories: '#f97316', protein: '#3b82f6', carbs: '#eab308', fat: '#ef4444', fiber: '#22c55e', sugar: '#ec4899' };

export default function NutritionPage() {
  const [recipeText, setRecipeText] = useState('');
  const [loading, setLoading] = useState(false);
  const [nutrition, setNutrition] = useState(null);

  const analyze = async () => {
    if (!recipeText.trim()) return toast.error('Please enter a recipe or ingredient list');
    setLoading(true);
    try {
      const { nutrition: data } = await recommendationAPI.analyzeNutrition({ recipeText });
      setNutrition(data);
      toast.success('Nutrition analyzed!');
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  const macroData = nutrition ? [
    { name: 'Protein', value: nutrition.protein || 0, color: COLORS.protein },
    { name: 'Carbs', value: nutrition.carbs || 0, color: COLORS.carbs },
    { name: 'Fat', value: nutrition.fat || 0, color: COLORS.fat },
  ] : [];

  const barData = nutrition ? [
    { name: 'Calories', value: nutrition.calories || 0, fill: COLORS.calories },
    { name: 'Protein', value: nutrition.protein || 0, fill: COLORS.protein },
    { name: 'Carbs', value: nutrition.carbs || 0, fill: COLORS.carbs },
    { name: 'Fat', value: nutrition.fat || 0, fill: COLORS.fat },
    { name: 'Fiber', value: nutrition.fiber || 0, fill: COLORS.fiber },
    { name: 'Sugar', value: nutrition.sugar || 0, fill: COLORS.sugar },
  ] : [];

  const SAMPLE = `Grilled Chicken Salad:
- 200g grilled chicken breast
- 2 cups mixed greens
- 1 medium tomato, diced
- 1/2 cucumber, sliced
- 1/4 cup feta cheese
- 2 tbsp olive oil dressing`;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-black text-gray-900 dark:text-white flex items-center gap-2">
          <BarChart3 className="w-6 h-6 text-green-500" /> Nutrition Analyzer
        </h1>
        <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">Paste any recipe or ingredients to get instant nutritional breakdown</p>
      </div>

      <div className="card p-6 space-y-4">
        <div>
          <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Recipe or Ingredient List</label>
          <textarea
            value={recipeText}
            onChange={e => setRecipeText(e.target.value)}
            placeholder={SAMPLE}
            className="input-field resize-none text-sm leading-relaxed"
            rows={8}
          />
          <button onClick={() => setRecipeText(SAMPLE)} className="text-xs text-primary-500 hover:text-primary-600 mt-1">Use sample recipe</button>
        </div>
        <button onClick={analyze} disabled={loading || !recipeText.trim()} className="btn-primary flex items-center gap-2">
          {loading ? <><Loader className="w-4 h-4 animate-spin" /> Analyzing...</> : <><BarChart3 className="w-4 h-4" /> Analyze Nutrition</>}
        </button>
      </div>

      <AnimatePresence>
        {nutrition && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
            {/* Stat Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
              {[
                { key: 'calories', label: 'Calories', unit: 'kcal' },
                { key: 'protein', label: 'Protein', unit: 'g' },
                { key: 'carbs', label: 'Carbs', unit: 'g' },
                { key: 'fat', label: 'Fat', unit: 'g' },
                { key: 'fiber', label: 'Fiber', unit: 'g' },
                { key: 'sugar', label: 'Sugar', unit: 'g' },
              ].map(({ key, label, unit }) => (
                <div key={key} className="card p-4 text-center border-t-4" style={{ borderTopColor: COLORS[key] }}>
                  <p className="text-xl font-black text-gray-900 dark:text-white">{nutrition[key] || 0}</p>
                  <p className="text-xs text-gray-500">{unit}</p>
                  <p className="text-xs font-semibold text-gray-700 dark:text-gray-300 mt-0.5">{label}</p>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Pie Chart */}
              <div className="card p-5">
                <h3 className="font-bold text-gray-900 dark:text-white mb-4">Macronutrient Distribution</h3>
                <ResponsiveContainer width="100%" height={220}>
                  <PieChart>
                    <Pie data={macroData} cx="50%" cy="50%" innerRadius={55} outerRadius={85} paddingAngle={3} dataKey="value">
                      {macroData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                    </Pie>
                    <Tooltip formatter={(v) => [`${v}g`, '']} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              {/* Bar Chart */}
              <div className="card p-5">
                <h3 className="font-bold text-gray-900 dark:text-white mb-4">Nutritional Values</h3>
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={barData} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                    <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                    <YAxis tick={{ fontSize: 11 }} />
                    <Tooltip />
                    <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                      {barData.map((entry, i) => <Cell key={i} fill={entry.fill} />)}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {nutrition.notes && (
              <div className="card p-5 bg-blue-50 dark:bg-blue-900/10 border-blue-200 dark:border-blue-800">
                <h3 className="font-semibold text-blue-800 dark:text-blue-300 mb-1 text-sm">Nutritionist Notes</h3>
                <p className="text-sm text-blue-700 dark:text-blue-400">{nutrition.notes}</p>
              </div>
            )}

            <div className="card p-5 bg-gray-50 dark:bg-gray-800/50 text-xs text-gray-400 text-center">
              Per serving · {nutrition.servings && nutrition.servings > 1 ? `${nutrition.servings} total servings` : '1 serving'} · Values are AI estimates
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
