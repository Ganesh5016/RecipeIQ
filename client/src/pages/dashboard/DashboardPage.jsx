import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Sparkles, Heart, History, TrendingUp, Clock, ChefHat, BarChart3, Calendar, Flame } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext.jsx';
import { recipeAPI, analyticsAPI, favoriteAPI, recommendationAPI } from '../../services/api.js';
import RecipeCard from '../../components/recipes/RecipeCard.jsx';
import { RecipeCardSkeleton, StatCardSkeleton } from '../../components/common/Skeletons.jsx';

const fadeUp = { hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } };

function StatCard({ icon: Icon, value, label, color, loading }) {
  if (loading) return <StatCardSkeleton />;
  return (
    <motion.div variants={fadeUp} className="card p-5">
      <div className={`w-10 h-10 ${color} rounded-xl flex items-center justify-center mb-3`}>
        <Icon className="w-5 h-5 text-white" />
      </div>
      <p className="text-2xl font-black text-gray-900 dark:text-white">{value}</p>
      <p className="text-sm text-gray-500 dark:text-gray-400">{label}</p>
    </motion.div>
  );
}

export default function DashboardPage() {
  const { dbUser } = useAuth();
  const [trending, setTrending] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [stats, setStats] = useState(null);
  const [history, setHistory] = useState([]);
  const [loadingTrending, setLoadingTrending] = useState(true);
  const [loadingStats, setLoadingStats] = useState(true);

  useEffect(() => {
    Promise.all([
      recipeAPI.getTrending().then(d => setTrending(d.recipes?.slice(0, 4) || [])).finally(() => setLoadingTrending(false)),
      analyticsAPI.getUser().then(d => setStats(d)).finally(() => setLoadingStats(false)),
      favoriteAPI.getAll().then(d => setFavorites(d.favorites?.slice(0, 4) || [])).catch(() => {}),
      recommendationAPI.getHistory().then(d => setHistory(d.history?.slice(0, 5) || [])).catch(() => {}),
    ]);
  }, []);

  const greeting = () => {
    const h = new Date().getHours();
    if (h < 12) return 'Good morning';
    if (h < 17) return 'Good afternoon';
    return 'Good evening';
  };

  return (
    <div className="space-y-8">
      {/* Welcome */}
      <motion.div variants={fadeUp} initial="hidden" animate="visible" className="glass-card p-6 bg-gradient-to-br from-primary-500/10 to-accent-500/5">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-black text-gray-900 dark:text-white">
              {greeting()}, {dbUser?.name?.split(' ')[0]} 👋
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              What would you like to cook today?
            </p>
          </div>
          <div className="flex gap-3">
            <Link to="/generate" className="btn-primary py-2.5 text-sm flex items-center gap-2">
              <Sparkles className="w-4 h-4" /> Generate Recipe
            </Link>
            <Link to="/ingredients" className="btn-secondary py-2.5 text-sm flex items-center gap-2">
              <ChefHat className="w-4 h-4" /> Match Ingredients
            </Link>
          </div>
        </div>

        {dbUser?.dietPreference && dbUser.dietPreference !== 'none' && (
          <div className="mt-4 flex flex-wrap gap-2">
            <span className="tag bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300">
              {dbUser.dietPreference}
            </span>
            {dbUser.fitnessGoal && dbUser.fitnessGoal !== 'none' && (
              <span className="tag bg-accent-100 dark:bg-accent-900/30 text-accent-700 dark:text-accent-300">
                {dbUser.fitnessGoal}
              </span>
            )}
            <span className="tag bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300">
              {dbUser.calorieGoal || 2000} cal/day
            </span>
          </div>
        )}
      </motion.div>

      {/* Stats */}
      <motion.div
        variants={{ visible: { transition: { staggerChildren: 0.08 } } }}
        initial="hidden" animate="visible"
        className="grid grid-cols-2 lg:grid-cols-4 gap-4"
      >
        <StatCard icon={Heart} value={stats?.favorites ?? '—'} label="Saved Recipes" color="bg-red-500" loading={loadingStats} />
        <StatCard icon={Sparkles} value={stats?.generated ?? '—'} label="AI Generated" color="bg-primary-500" loading={loadingStats} />
        <StatCard icon={History} value={stats?.history ?? '—'} label="Recipes Viewed" color="bg-accent-500" loading={loadingStats} />
        <StatCard icon={Flame} value={`${dbUser?.calorieGoal || 2000}`} label="Daily Cal Goal" color="bg-orange-500" loading={loadingStats} />
      </motion.div>

      {/* Quick actions */}
      <div>
        <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Quick Actions</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { to: '/generate', icon: Sparkles, label: 'AI Generator', color: 'from-primary-500 to-primary-600' },
            { to: '/nutrition', icon: BarChart3, label: 'Nutrition', color: 'from-green-500 to-emerald-600' },
            { to: '/meal-plan', icon: Calendar, label: 'Meal Plan', color: 'from-blue-500 to-indigo-600' },
            { to: '/grocery', icon: Clock, label: 'Grocery List', color: 'from-accent-500 to-purple-600' },
          ].map(({ to, icon: Icon, label, color }) => (
            <Link key={to} to={to} className={`bg-gradient-to-br ${color} text-white rounded-xl p-4 flex flex-col items-center gap-2 hover:opacity-90 hover:-translate-y-1 transition-all shadow-md`}>
              <Icon className="w-6 h-6" />
              <span className="text-sm font-semibold">{label}</span>
            </Link>
          ))}
        </div>
      </div>

      {/* Trending Recipes */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-primary-500" /> Trending Recipes
          </h2>
          <Link to="/recipes" className="text-sm text-primary-500 hover:text-primary-600 font-medium">View all</Link>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {loadingTrending
            ? Array.from({ length: 4 }).map((_, i) => <RecipeCardSkeleton key={i} />)
            : trending.map(r => <RecipeCard key={r._id} recipe={r} />)
          }
        </div>
        {!loadingTrending && trending.length === 0 && (
          <div className="text-center py-12 card">
            <ChefHat className="w-12 h-12 text-gray-300 dark:text-gray-700 mx-auto mb-3" />
            <p className="text-gray-500">No trending recipes yet.</p>
            <Link to="/generate" className="btn-primary mt-4 inline-block text-sm">Generate the first one!</Link>
          </div>
        )}
      </div>

      {/* Saved Recipes */}
      {favorites.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <Heart className="w-5 h-5 text-red-500" /> Your Favorites
            </h2>
            <Link to="/favorites" className="text-sm text-primary-500 hover:text-primary-600 font-medium">View all</Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {favorites.map(f => f.recipe && <RecipeCard key={f._id} recipe={f.recipe} />)}
          </div>
        </div>
      )}

      {/* Recent History */}
      {history.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <History className="w-5 h-5 text-gray-500" /> Recent Activity
            </h2>
            <Link to="/history" className="text-sm text-primary-500 hover:text-primary-600 font-medium">View all</Link>
          </div>
          <div className="card divide-y divide-gray-100 dark:divide-gray-800">
            {history.map((item, i) => (
              <div key={i} className="flex items-center gap-3 p-4">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                  item.type === 'generated' ? 'bg-primary-100 dark:bg-primary-900/30' :
                  item.type === 'viewed' ? 'bg-blue-100 dark:bg-blue-900/30' : 'bg-gray-100 dark:bg-gray-800'
                }`}>
                  {item.type === 'generated' ? <Sparkles className="w-4 h-4 text-primary-600" /> :
                   item.type === 'viewed' ? <Clock className="w-4 h-4 text-blue-600" /> :
                   <History className="w-4 h-4 text-gray-600" />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                    {item.recipe?.title || item.recipeData?.title || 'Unknown Recipe'}
                  </p>
                  <p className="text-xs text-gray-500 capitalize">{item.type}</p>
                </div>
                <span className="text-xs text-gray-400 flex-shrink-0">
                  {new Date(item.createdAt).toLocaleDateString()}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
