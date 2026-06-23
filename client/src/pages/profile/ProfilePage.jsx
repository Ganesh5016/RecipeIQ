import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { motion } from 'framer-motion';
import { User, Save, Shield, Flame, ChefHat, AlertTriangle } from 'lucide-react';
import { userAPI } from '../../services/api.js';
import { useAuth } from '../../contexts/AuthContext.jsx';
import toast from 'react-hot-toast';

const DIET_PREFS = ['none', 'vegetarian', 'vegan', 'keto', 'paleo', 'gluten-free', 'diabetic'];
const FITNESS_GOALS = ['none', 'weight-loss', 'weight-gain', 'muscle-gain', 'maintenance'];
const SKILL_LEVELS = ['beginner', 'intermediate', 'advanced'];
const CUISINES = ['Italian', 'Indian', 'Chinese', 'Mexican', 'Japanese', 'Mediterranean', 'American', 'Thai', 'French', 'Greek'];
const ALLERGENS = ['nuts', 'peanuts', 'dairy', 'eggs', 'gluten', 'shellfish', 'soy', 'fish', 'sesame'];

export default function ProfilePage() {
  const { dbUser, updateDbUser } = useAuth();
  const [saving, setSaving] = useState(false);
  const [selectedCuisines, setSelectedCuisines] = useState(dbUser?.favoriteCuisine || []);
  const [selectedAllergies, setSelectedAllergies] = useState(dbUser?.allergies || []);

  const { register, handleSubmit, formState: { errors } } = useForm({
    defaultValues: {
      name: dbUser?.name || '',
      dietPreference: dbUser?.dietPreference || 'none',
      fitnessGoal: dbUser?.fitnessGoal || 'none',
      skillLevel: dbUser?.skillLevel || 'beginner',
      calorieGoal: dbUser?.calorieGoal || 2000,
      avatar: dbUser?.avatar || '',
    },
  });

  const toggleCuisine = (c) => setSelectedCuisines(p => p.includes(c) ? p.filter(x => x !== c) : [...p, c]);
  const toggleAllergy = (a) => setSelectedAllergies(p => p.includes(a) ? p.filter(x => x !== a) : [...p, a]);

  const onSubmit = async (data) => {
    setSaving(true);
    try {
      const { user } = await userAPI.updateProfile({
        ...data,
        favoriteCuisine: selectedCuisines,
        allergies: selectedAllergies,
      });
      updateDbUser(user);
      toast.success('Profile updated!');
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-black text-gray-900 dark:text-white flex items-center gap-2">
          <User className="w-6 h-6 text-primary-500" /> Your Profile
        </h1>
        <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">Personalize your RecipeIQ experience</p>
      </div>

      {/* Avatar / info card */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="card p-6 flex items-center gap-5">
        {dbUser?.avatar ? (
          <img src={dbUser.avatar} alt="" className="w-20 h-20 rounded-2xl object-cover" />
        ) : (
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary-400 to-accent-400 flex items-center justify-center text-white text-3xl font-black">
            {dbUser?.name?.[0]?.toUpperCase()}
          </div>
        )}
        <div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">{dbUser?.name}</h2>
          <p className="text-gray-500 text-sm">{dbUser?.email}</p>
          <span className={`tag mt-2 ${dbUser?.role === 'admin' ? 'bg-accent-100 dark:bg-accent-900/30 text-accent-700 dark:text-accent-300' : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400'}`}>
            <Shield className="w-3 h-3 inline mr-1" />
            {dbUser?.role}
          </span>
        </div>
      </motion.div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        {/* Basic info */}
        <div className="card p-5 space-y-4">
          <h3 className="font-bold text-gray-900 dark:text-white flex items-center gap-2 text-sm uppercase tracking-wider text-gray-500">
            Basic Information
          </h3>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Display Name</label>
            <input className={`input-field ${errors.name ? 'border-red-500' : ''}`} placeholder="Your name"
              {...register('name', { required: 'Name required', minLength: { value: 2, message: 'Too short' } })} />
            {errors.name && <p className="mt-1 text-xs text-red-500">{errors.name.message}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Avatar URL</label>
            <input className="input-field" placeholder="https://..." {...register('avatar')} />
          </div>
        </div>

        {/* Dietary preferences */}
        <div className="card p-5 space-y-4">
          <h3 className="font-bold text-gray-500 dark:text-gray-400 text-sm uppercase tracking-wider flex items-center gap-2">
            <ChefHat className="w-4 h-4" /> Dietary Preferences
          </h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Diet Type</label>
              <select className="input-field text-sm" {...register('dietPreference')}>
                {DIET_PREFS.map(d => <option key={d} value={d}>{d === 'none' ? 'No preference' : d}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Skill Level</label>
              <select className="input-field text-sm" {...register('skillLevel')}>
                {SKILL_LEVELS.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Favorite Cuisines</label>
            <div className="flex flex-wrap gap-2">
              {CUISINES.map(c => (
                <button key={c} type="button" onClick={() => toggleCuisine(c)}
                  className={`tag cursor-pointer transition-all ${selectedCuisines.includes(c) ? 'bg-primary-500 text-white' : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-primary-50 hover:text-primary-600'}`}>
                  {c}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Allergies */}
        <div className="card p-5 space-y-4">
          <h3 className="font-bold text-gray-500 dark:text-gray-400 text-sm uppercase tracking-wider flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-yellow-500" /> Allergies & Restrictions
          </h3>
          <div className="flex flex-wrap gap-2">
            {ALLERGENS.map(a => (
              <button key={a} type="button" onClick={() => toggleAllergy(a)}
                className={`tag cursor-pointer transition-all ${selectedAllergies.includes(a) ? 'bg-red-500 text-white' : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-red-50 hover:text-red-600'}`}>
                {a}
              </button>
            ))}
          </div>
          <p className="text-xs text-gray-400">Selected items will always be excluded from AI-generated recipes</p>
        </div>

        {/* Health goals */}
        <div className="card p-5 space-y-4">
          <h3 className="font-bold text-gray-500 dark:text-gray-400 text-sm uppercase tracking-wider flex items-center gap-2">
            <Flame className="w-4 h-4 text-orange-500" /> Health Goals
          </h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Fitness Goal</label>
              <select className="input-field text-sm" {...register('fitnessGoal')}>
                {FITNESS_GOALS.map(g => <option key={g} value={g}>{g === 'none' ? 'No specific goal' : g.replace('-', ' ')}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Daily Calorie Goal</label>
              <input type="number" min={500} max={10000} step={50} className="input-field text-sm" {...register('calorieGoal', { min: 500, max: 10000 })} />
            </div>
          </div>
        </div>

        <button type="submit" disabled={saving} className="btn-primary w-full flex items-center justify-center gap-2">
          <Save className="w-4 h-4" />
          {saving ? 'Saving...' : 'Save Changes'}
        </button>
      </form>
    </div>
  );
}
