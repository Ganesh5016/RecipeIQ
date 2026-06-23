import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Plus, X, Clock, Flame, Users, ChefHat, Heart, ArrowRight } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { recommendationAPI, favoriteAPI } from '../../services/api.js';
import { useAuth } from '../../contexts/AuthContext.jsx';
import toast from 'react-hot-toast';

const CUISINES = ['Any', 'Italian', 'Indian', 'Chinese', 'Mexican', 'Japanese', 'Mediterranean', 'American', 'Thai', 'French'];
const DIET_TYPES = ['none', 'vegetarian', 'vegan', 'keto', 'paleo', 'gluten-free'];
const SKILL_LEVELS = ['beginner', 'intermediate', 'advanced'];
const COMMON_ALLERGENS = ['nuts', 'dairy', 'eggs', 'gluten', 'shellfish', 'soy', 'fish'];

export default function GenerateRecipePage() {
  const { t, i18n } = useTranslation();
  const { dbUser } = useAuth();
  const [ingredients, setIngredients] = useState([]);
  const [ingredientInput, setIngredientInput] = useState('');
  const [allergies, setAllergies] = useState([]);
  const [loading, setLoading] = useState(false);
  const [recipe, setRecipe] = useState(null);
  const [saving, setSaving] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm({
    defaultValues: {
      cuisine: 'Any',
      dietType: dbUser?.dietPreference || 'none',
      cookingTime: 30,
      calories: dbUser?.calorieGoal ? Math.round(dbUser.calorieGoal / 3) : 500,
      skillLevel: dbUser?.skillLevel || 'beginner',
      servings: 4,
    },
  });

  const addIngredient = () => {
    const val = ingredientInput.trim();
    if (val && !ingredients.includes(val)) {
      setIngredients(prev => [...prev, val]);
    }
    setIngredientInput('');
  };

  const removeIngredient = (item) => setIngredients(prev => prev.filter(i => i !== item));
  const toggleAllergy = (a) => setAllergies(prev => prev.includes(a) ? prev.filter(x => x !== a) : [...prev, a]);

  const onSubmit = async (data) => {
    if (ingredients.length === 0) return toast.error('Add at least one ingredient');
    setLoading(true);
    setRecipe(null);
    try {
      const payload = {
        ingredients,
        cuisine: data.cuisine === 'Any' ? '' : data.cuisine,
        dietType: data.dietType === 'none' ? '' : data.dietType,
        allergies,
        cookingTime: Number(data.cookingTime),
        calories: Number(data.calories),
        skillLevel: data.skillLevel,
        servings: Number(data.servings),
        language: i18n.language || 'en',
      };
      const { recipe: generated } = await recommendationAPI.generate(payload);
      setRecipe(generated);
      toast.success('Recipe generated!');
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  const saveToFavorites = async () => {
    if (!recipe?._id) return;
    setSaving(true);
    try {
      await favoriteAPI.add({ recipeId: recipe._id });
      toast.success('Saved to favorites!');
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSaving(false);
    }
  };

  const DIFF_COLOR = { easy: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400', medium: 'bg-yellow-100 text-yellow-700', hard: 'bg-red-100 text-red-700' };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-black text-gray-900 dark:text-white flex items-center gap-2">
          <Sparkles className="w-6 h-6 text-primary-500" /> {t('AI_Title')}
        </h1>
        <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">{t('AI_Sub')}</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Form */}
        <div className="card p-6 space-y-5">
          {/* Ingredients */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">{t('Ingredients_Label')}</label>
            <div className="flex gap-2 mb-3">
              <input
                value={ingredientInput}
                onChange={e => setIngredientInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addIngredient())}
                placeholder="e.g. tomato, chicken, garlic..."
                className="input-field flex-1 py-2"
              />
              <button type="button" onClick={addIngredient} className="btn-primary py-2 px-4 flex items-center gap-1">
                <Plus className="w-4 h-4" />
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {ingredients.map(ing => (
                <span key={ing} className="flex items-center gap-1 px-3 py-1 bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 rounded-full text-sm">
                  {ing}
                  <button onClick={() => removeIngredient(ing)}><X className="w-3 h-3" /></button>
                </span>
              ))}
              {ingredients.length === 0 && <p className="text-xs text-gray-400">Add ingredients above</p>}
            </div>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">{t('Cuisine')}</label>
                <select className="input-field py-2 text-sm" {...register('cuisine')}>
                  {CUISINES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">{t('Diet Type')}</label>
                <select className="input-field py-2 text-sm" {...register('dietType')}>
                  {DIET_TYPES.map(d => <option key={d} value={d}>{d === 'none' ? 'No preference' : d}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">{t('Skill Level')}</label>
                <select className="input-field py-2 text-sm" {...register('skillLevel')}>
                  {SKILL_LEVELS.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">{t('Servings')}</label>
                <input type="number" min="1" max="20" className="input-field py-2 text-sm" {...register('servings', { min: 1, max: 20 })} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">{t('Max Cook Time')}</label>
                <input type="number" min="5" max="480" className="input-field py-2 text-sm" {...register('cookingTime', { min: 5 })} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">{t('Target Calories')}</label>
                <input type="number" min="100" max="5000" className="input-field py-2 text-sm" {...register('calories', { min: 100 })} />
              </div>
            </div>

            {/* Allergies */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{t('Allergies')}</label>
              <div className="flex flex-wrap gap-2">
                {COMMON_ALLERGENS.map(a => (
                  <button
                    key={a} type="button" onClick={() => toggleAllergy(a)}
                    className={`tag cursor-pointer transition-all ${allergies.includes(a) ? 'bg-red-500 text-white' : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-red-50 hover:text-red-600'}`}
                  >
                    {a}
                  </button>
                ))}
              </div>
            </div>

            <button type="submit" disabled={loading || ingredients.length === 0} className="btn-primary w-full flex items-center justify-center gap-2">
              {loading ? (
                <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> {t('Generating')}</>
              ) : (
                <><Sparkles className="w-4 h-4" /> {t('Generate')}</>
              )}
            </button>
          </form>
        </div>

        {/* Result */}
        <div>
          <AnimatePresence mode="wait">
            {loading && (
              <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="card p-8 flex flex-col items-center justify-center h-full min-h-64 text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-primary-100 to-accent-100 dark:from-primary-900/30 dark:to-accent-900/30 rounded-2xl flex items-center justify-center mb-4">
                  <Sparkles className="w-8 h-8 text-primary-500 animate-pulse" />
                </div>
                <p className="font-semibold text-gray-900 dark:text-white">{t('Cooking_Up')}</p>
                <p className="text-sm text-gray-500 mt-1">{t('Analyzing')}</p>
              </motion.div>
            )}

            {!loading && !recipe && (
              <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                className="card p-8 flex flex-col items-center justify-center h-full min-h-64 text-center">
                <ChefHat className="w-16 h-16 text-gray-300 dark:text-gray-700 mb-4" />
                <p className="font-semibold text-gray-700 dark:text-gray-300">{t('Empty_Title')}</p>
                <p className="text-sm text-gray-400 mt-1">{t('Empty_Sub')}</p>
              </motion.div>
            )}

            {!loading && recipe && (
              <motion.div key="recipe" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="card overflow-hidden">
                <div className="p-5 border-b border-gray-100 dark:border-gray-800">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h2 className="text-xl font-black text-gray-900 dark:text-white">{recipe.title}</h2>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 line-clamp-2">{recipe.description}</p>
                    </div>
                    <span className={`tag flex-shrink-0 ${DIFF_COLOR[recipe.difficulty] || DIFF_COLOR.easy}`}>{recipe.difficulty}</span>
                  </div>
                  <div className="flex flex-wrap gap-4 mt-3 text-sm text-gray-600 dark:text-gray-400">
                    <span className="flex items-center gap-1"><Clock className="w-4 h-4 text-primary-500" />{recipe.cookingTime} min</span>
                    <span className="flex items-center gap-1"><Flame className="w-4 h-4 text-orange-500" />{recipe.nutrition?.calories} kcal</span>
                    <span className="flex items-center gap-1"><Users className="w-4 h-4 text-blue-500" />{recipe.servings} servings</span>
                  </div>
                </div>

                <div className="p-5 space-y-4 max-h-96 overflow-y-auto">
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white mb-2 text-sm">{t('Ingredients')}</h3>
                    <ul className="space-y-1">
                      {recipe.ingredients?.slice(0, 8).map((ing, i) => (
                        <li key={i} className="text-sm text-gray-600 dark:text-gray-400 flex items-center gap-2">
                          <span className="w-1.5 h-1.5 rounded-full bg-primary-400 flex-shrink-0" />
                          <strong>{ing.amount} {ing.unit}</strong> {ing.name}
                        </li>
                      ))}
                      {recipe.ingredients?.length > 8 && <li className="text-xs text-gray-400">+{recipe.ingredients.length - 8} more...</li>}
                    </ul>
                  </div>

                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white mb-2 text-sm">{t('Steps')}</h3>
                    <ol className="space-y-2">
                      {recipe.steps?.slice(0, 4).map((step, i) => (
                        <li key={i} className="flex gap-2 text-sm text-gray-600 dark:text-gray-400">
                          <span className="w-5 h-5 bg-primary-500 text-white rounded-full flex items-center justify-center text-xs flex-shrink-0 mt-0.5">{i + 1}</span>
                          <span className="line-clamp-2">{step}</span>
                        </li>
                      ))}
                      {recipe.steps?.length > 4 && <li className="text-xs text-gray-400 pl-7">+{recipe.steps.length - 4} more steps...</li>}
                    </ol>
                  </div>

                  {recipe.nutrition && (
                    <div className="grid grid-cols-3 gap-2">
                      {[
                        { label: 'Protein', value: recipe.nutrition.protein, unit: 'g', color: 'bg-blue-50 dark:bg-blue-900/20 text-blue-600' },
                        { label: 'Carbs', value: recipe.nutrition.carbs, unit: 'g', color: 'bg-yellow-50 dark:bg-yellow-900/20 text-yellow-600' },
                        { label: 'Fat', value: recipe.nutrition.fat, unit: 'g', color: 'bg-red-50 dark:bg-red-900/20 text-red-600' },
                      ].map(({ label, value, unit, color }) => (
                        <div key={label} className={`${color} rounded-lg p-2 text-center`}>
                          <p className="font-bold text-sm">{value}{unit}</p>
                          <p className="text-xs opacity-70">{label}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="p-4 border-t border-gray-100 dark:border-gray-800 flex gap-3">
                  <button onClick={saveToFavorites} disabled={saving} className="btn-secondary flex-1 flex items-center justify-center gap-2 text-sm py-2">
                    <Heart className="w-4 h-4" /> {saving ? t('Saving...') : t('Save Recipe')}
                  </button>
                  <button onClick={handleSubmit(onSubmit)} disabled={loading} className="btn-primary flex-1 flex items-center justify-center gap-2 text-sm py-2">
                    <Sparkles className="w-4 h-4" /> {t('Regenerate')}
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
