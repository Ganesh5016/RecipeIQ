import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, Plus, Sparkles, Trash2, X, ChevronLeft, ChevronRight } from 'lucide-react';
import { mealplanAPI, recommendationAPI } from '../../services/api.js';
import { useAuth } from '../../contexts/AuthContext.jsx';
import { format, addDays, startOfWeek } from 'date-fns';
import toast from 'react-hot-toast';

const GOALS = ['weight-loss', 'weight-gain', 'muscle-gain', 'maintenance', 'vegetarian', 'vegan', 'diabetic'];
const MEAL_TYPES = ['breakfast', 'lunch', 'dinner', 'snack'];
const MEAL_COLORS = { breakfast: 'bg-yellow-100 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-300', lunch: 'bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-300', dinner: 'bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300', snack: 'bg-pink-100 dark:bg-pink-900/20 text-pink-700 dark:text-pink-300' };

export default function MealPlanPage() {
  const { dbUser } = useAuth();
  const [plans, setPlans] = useState([]);
  const [activePlan, setActivePlan] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [weekOffset, setWeekOffset] = useState(0);
  const [form, setForm] = useState({ title: '', planType: 'weekly', goal: dbUser?.fitnessGoal || 'maintenance', startDate: format(new Date(), 'yyyy-MM-dd') });

  useEffect(() => {
    mealplanAPI.getAll().then(d => {
      setPlans(d.plans || []);
      if (d.plans?.length > 0) setActivePlan(d.plans[0]);
    }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const createPlan = async () => {
    if (!form.title) return toast.error('Plan title required');
    try {
      const { plan } = await mealplanAPI.create(form);
      setPlans(p => [plan, ...p]);
      setActivePlan(plan);
      setShowCreate(false);
      toast.success('Meal plan created!');
    } catch (err) { toast.error(err.message); }
  };

  const generateAIPlan = async () => {
    setGenerating(true);
    try {
      const { plan: aiPlan } = await recommendationAPI.generateMealPlanAI({
        goal: form.goal,
        days: form.planType === 'daily' ? 1 : form.planType === 'weekly' ? 7 : 30,
        calorieGoal: dbUser?.calorieGoal || 2000,
        dietType: dbUser?.dietPreference !== 'none' ? dbUser?.dietPreference : undefined,
      });

      const startDate = new Date(form.startDate || new Date());
      const days = aiPlan.map((day, i) => ({
        date: addDays(startDate, i),
        meals: [
          day.breakfast && { mealType: 'breakfast', recipeTitle: day.breakfast.title, calories: day.breakfast.calories },
          day.lunch && { mealType: 'lunch', recipeTitle: day.lunch.title, calories: day.lunch.calories },
          day.dinner && { mealType: 'dinner', recipeTitle: day.dinner.title, calories: day.dinner.calories },
          day.snack && { mealType: 'snack', recipeTitle: day.snack.title, calories: day.snack.calories },
        ].filter(Boolean),
        totalCalories: day.totalCalories || 0,
      }));

      const { plan } = await mealplanAPI.create({ ...form, title: form.title || `AI ${form.goal} Plan`, days });
      setPlans(p => [plan, ...p]);
      setActivePlan(plan);
      setShowCreate(false);
      toast.success('AI meal plan generated!');
    } catch (err) { toast.error(err.message); }
    finally { setGenerating(false); }
  };

  const deletePlan = async (id) => {
    try {
      await mealplanAPI.delete(id);
      setPlans(p => p.filter(pl => pl._id !== id));
      if (activePlan?._id === id) setActivePlan(plans.find(p => p._id !== id) || null);
      toast.success('Plan deleted');
    } catch (err) { toast.error(err.message); }
  };

  const weekStart = addDays(startOfWeek(new Date()), weekOffset * 7);
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

  const getDayMeals = (date) => {
    if (!activePlan?.days) return [];
    return activePlan.days.filter(d => format(new Date(d.date), 'yyyy-MM-dd') === format(date, 'yyyy-MM-dd'));
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-gray-900 dark:text-white flex items-center gap-2">
            <Calendar className="w-6 h-6 text-blue-500" /> Meal Planner
          </h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">Plan your meals for the week ahead</p>
        </div>
        <button onClick={() => setShowCreate(true)} className="btn-primary flex items-center gap-2 text-sm self-start sm:self-auto">
          <Plus className="w-4 h-4" /> New Plan
        </button>
      </div>

      {/* Create Modal */}
      <AnimatePresence>
        {showCreate && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95 }}
              className="bg-white dark:bg-gray-900 rounded-2xl p-6 w-full max-w-md shadow-2xl">
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-lg font-bold text-gray-900 dark:text-white">Create Meal Plan</h2>
                <button onClick={() => setShowCreate(false)}><X className="w-5 h-5 text-gray-500" /></button>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Plan Name</label>
                  <input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} placeholder="e.g. My Weight Loss Plan" className="input-field" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Plan Type</label>
                    <select value={form.planType} onChange={e => setForm(f => ({ ...f, planType: e.target.value }))} className="input-field text-sm">
                      <option value="daily">Daily</option>
                      <option value="weekly">Weekly</option>
                      <option value="monthly">Monthly</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Goal</label>
                    <select value={form.goal} onChange={e => setForm(f => ({ ...f, goal: e.target.value }))} className="input-field text-sm">
                      {GOALS.map(g => <option key={g} value={g}>{g.replace('-', ' ')}</option>)}
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Start Date</label>
                  <input type="date" value={form.startDate} onChange={e => setForm(f => ({ ...f, startDate: e.target.value }))} className="input-field" />
                </div>
                <div className="flex gap-3 pt-2">
                  <button onClick={createPlan} className="btn-secondary flex-1 text-sm py-2.5">Create Empty</button>
                  <button onClick={generateAIPlan} disabled={generating} className="btn-primary flex-1 text-sm py-2.5 flex items-center justify-center gap-2">
                    {generating ? <><div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Generating...</> : <><Sparkles className="w-3.5 h-3.5" /> Generate with AI</>}
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Plan List */}
        <div className="space-y-3">
          <h2 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Your Plans</h2>
          {loading ? (
            <div className="space-y-2">{Array.from({ length: 3 }).map((_, i) => <div key={i} className="skeleton h-16 rounded-xl" />)}</div>
          ) : plans.length === 0 ? (
            <div className="card p-4 text-center text-sm text-gray-500">
              <p>No meal plans yet.</p>
              <button onClick={() => setShowCreate(true)} className="text-primary-500 hover:text-primary-600 mt-1">Create one</button>
            </div>
          ) : plans.map(plan => (
            <div key={plan._id} onClick={() => setActivePlan(plan)}
              className={`card p-4 cursor-pointer transition-all ${activePlan?._id === plan._id ? 'border-primary-500 dark:border-primary-500 bg-primary-50 dark:bg-primary-900/20' : 'hover:border-gray-300 dark:hover:border-gray-600'}`}>
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm text-gray-900 dark:text-white truncate">{plan.title}</p>
                  <p className="text-xs text-gray-500 mt-0.5 capitalize">{plan.goal?.replace('-', ' ')} · {plan.planType}</p>
                </div>
                <button onClick={e => { e.stopPropagation(); deletePlan(plan._id); }} className="p-1 hover:text-red-500 text-gray-400 flex-shrink-0">
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Calendar View */}
        <div className="lg:col-span-3 card p-5">
          {activePlan ? (
            <>
              <div className="flex items-center justify-between mb-5">
                <h2 className="font-bold text-gray-900 dark:text-white">{activePlan.title}</h2>
                <div className="flex items-center gap-2">
                  <button onClick={() => setWeekOffset(w => w - 1)} className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500">
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <span className="text-sm text-gray-600 dark:text-gray-400 font-medium">
                    {format(weekStart, 'MMM d')} – {format(addDays(weekStart, 6), 'MMM d, yyyy')}
                  </span>
                  <button onClick={() => setWeekOffset(w => w + 1)} className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500">
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-7 gap-2">
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
                  <div key={d} className="text-center text-xs font-semibold text-gray-400 pb-2">{d}</div>
                ))}
                {weekDays.map(day => {
                  const dayPlans = getDayMeals(day);
                  const isToday = format(day, 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd');
                  return (
                    <div key={day.toISOString()} className={`rounded-xl p-2 min-h-24 border ${isToday ? 'border-primary-400 bg-primary-50 dark:bg-primary-900/10' : 'border-gray-100 dark:border-gray-800'}`}>
                      <p className={`text-xs font-bold mb-1 ${isToday ? 'text-primary-600' : 'text-gray-500'}`}>{format(day, 'd')}</p>
                      <div className="space-y-0.5">
                        {dayPlans.flatMap(dp => dp.meals || []).map((meal, i) => (
                          <div key={i} className={`text-xs px-1.5 py-0.5 rounded ${MEAL_COLORS[meal.mealType] || MEAL_COLORS.snack} truncate`}>
                            {meal.recipeTitle}
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>

              {activePlan.days?.length > 0 && (
                <div className="mt-5 pt-4 border-t border-gray-100 dark:border-gray-800">
                  <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">Meal Schedule</h3>
                  <div className="space-y-3">
                    {activePlan.days.slice(0, 7).map((day, i) => (
                      <div key={i} className="flex gap-3">
                        <div className="w-20 flex-shrink-0 text-xs text-gray-500 pt-0.5">{format(new Date(day.date), 'EEE, MMM d')}</div>
                        <div className="flex-1 flex flex-wrap gap-1.5">
                          {(day.meals || []).map((meal, j) => (
                            <span key={j} className={`tag text-xs ${MEAL_COLORS[meal.mealType]}`}>
                              <span className="capitalize font-semibold">{meal.mealType}:</span> {meal.recipeTitle} {meal.calories ? `(${meal.calories} cal)` : ''}
                            </span>
                          ))}
                        </div>
                        {day.totalCalories > 0 && <div className="text-xs text-gray-400 flex-shrink-0 pt-0.5">{day.totalCalories} cal</div>}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="flex flex-col items-center justify-center h-64 text-center">
              <Calendar className="w-16 h-16 text-gray-300 dark:text-gray-700 mb-4" />
              <p className="text-gray-500 font-medium">No plan selected</p>
              <p className="text-sm text-gray-400 mt-1">Create a new plan or select one from the list</p>
              <button onClick={() => setShowCreate(true)} className="btn-primary mt-4 text-sm flex items-center gap-2">
                <Plus className="w-4 h-4" /> Create Meal Plan
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
