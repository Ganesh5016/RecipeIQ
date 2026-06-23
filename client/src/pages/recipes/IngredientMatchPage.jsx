import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Salad, Plus, X, Sparkles, Clock, ChefHat, ArrowRight } from 'lucide-react';
import { recommendationAPI } from '../../services/api.js';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';

const QUICK_INGREDIENTS = ['Tomato', 'Onion', 'Garlic', 'Potato', 'Carrot', 'Chicken', 'Rice', 'Pasta', 'Eggs', 'Cheese', 'Bell Pepper', 'Spinach'];

export default function IngredientMatchPage() {
  const [ingredients, setIngredients] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [suggestions, setSuggestions] = useState([]);

  const add = (item) => {
    const val = item || input.trim();
    if (val && !ingredients.includes(val)) setIngredients(p => [...p, val]);
    setInput('');
  };

  const remove = (item) => setIngredients(p => p.filter(i => i !== item));

  const match = async () => {
    if (ingredients.length === 0) return toast.error('Add at least one ingredient');
    setLoading(true);
    setSuggestions([]);
    try {
      const { suggestions: data } = await recommendationAPI.matchIngredients({ ingredients });
      setSuggestions(data || []);
      toast.success(`Found ${data?.length || 0} recipe matches!`);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  const matchColor = (pct) => {
    if (pct >= 80) return 'text-green-600 bg-green-100 dark:bg-green-900/30 dark:text-green-400';
    if (pct >= 50) return 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900/30 dark:text-yellow-400';
    return 'text-orange-600 bg-orange-100 dark:bg-orange-900/30 dark:text-orange-400';
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-black text-gray-900 dark:text-white flex items-center gap-2">
          <Salad className="w-6 h-6 text-green-500" /> Smart Ingredient Matching
        </h1>
        <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">Enter what's in your fridge and get recipe suggestions that maximize usage</p>
      </div>

      <div className="card p-6 space-y-5">
        <div>
          <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">Your Ingredients</label>
          <div className="flex gap-2 mb-3">
            <input
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), add())}
              placeholder="Type an ingredient and press Enter..."
              className="input-field flex-1 py-2.5"
            />
            <button onClick={() => add()} className="btn-primary py-2.5 px-4">
              <Plus className="w-4 h-4" />
            </button>
          </div>
          <div className="flex flex-wrap gap-2 mb-4">
            {ingredients.map(ing => (
              <motion.span key={ing} initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
                className="flex items-center gap-1 px-3 py-1.5 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded-full text-sm font-medium">
                {ing}
                <button onClick={() => remove(ing)} className="hover:text-red-500 transition-colors"><X className="w-3 h-3" /></button>
              </motion.span>
            ))}
          </div>
          <div>
            <p className="text-xs text-gray-400 mb-2">Quick add:</p>
            <div className="flex flex-wrap gap-2">
              {QUICK_INGREDIENTS.filter(q => !ingredients.includes(q)).map(q => (
                <button key={q} onClick={() => add(q)} className="tag bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-primary-50 hover:text-primary-600 cursor-pointer transition-all">
                  + {q}
                </button>
              ))}
            </div>
          </div>
        </div>

        <button onClick={match} disabled={loading || ingredients.length === 0} className="btn-primary w-full flex items-center justify-center gap-2">
          {loading ? (
            <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Analyzing ingredients...</>
          ) : (
            <><Sparkles className="w-4 h-4" /> Find Matching Recipes</>
          )}
        </button>
      </div>

      <AnimatePresence>
        {suggestions.length > 0 && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white">
              {suggestions.length} Recipe Matches Found
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {suggestions.map((s, i) => (
                <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }} className="card p-5 hover:border-primary-200 dark:hover:border-primary-800 transition-colors">
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <h3 className="font-bold text-gray-900 dark:text-white">{s.title}</h3>
                    <span className={`tag flex-shrink-0 font-bold ${matchColor(s.matchPercentage)}`}>
                      {s.matchPercentage}% match
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 line-clamp-2">{s.description}</p>

                  <div className="flex items-center gap-3 text-xs text-gray-500 dark:text-gray-400 mb-3">
                    <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" />{s.cookingTime} min</span>
                    <span className="flex items-center gap-1"><Salad className="w-3.5 h-3.5" />{s.estimatedCalories} kcal</span>
                    <span className="tag bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400">{s.difficulty}</span>
                  </div>

                  {s.missingIngredients?.length > 0 && (
                    <div className="mb-3">
                      <p className="text-xs text-gray-400 mb-1">Missing ingredients:</p>
                      <div className="flex flex-wrap gap-1">
                        {s.missingIngredients.map(m => (
                          <span key={m} className="tag bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-xs">{m}</span>
                        ))}
                      </div>
                    </div>
                  )}

                  <Link
                    to={`/generate?prefill=${encodeURIComponent(s.title)}`}
                    className="flex items-center gap-1 text-sm text-primary-500 hover:text-primary-600 font-medium"
                  >
                    Generate full recipe <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {!loading && suggestions.length === 0 && ingredients.length > 0 && (
        <div className="text-center py-12 card">
          <ChefHat className="w-12 h-12 text-gray-300 dark:text-gray-700 mx-auto mb-3" />
          <p className="text-gray-500">Click "Find Matching Recipes" to see suggestions</p>
        </div>
      )}
    </div>
  );
}
