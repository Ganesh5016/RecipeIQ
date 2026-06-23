import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Heart, Trash2, Search, Filter } from 'lucide-react';
import { favoriteAPI } from '../../services/api.js';
import RecipeCard from '../../components/recipes/RecipeCard.jsx';
import { RecipeCardSkeleton } from '../../components/common/Skeletons.jsx';
import toast from 'react-hot-toast';

export default function FavoritesPage() {
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    favoriteAPI.getAll().then(d => setFavorites(d.favorites || [])).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const remove = async (recipeId) => {
    try {
      await favoriteAPI.remove(recipeId);
      setFavorites(prev => prev.filter(f => f.recipe?._id !== recipeId));
      toast.success('Removed from favorites');
    } catch (err) { toast.error(err.message); }
  };

  const filtered = favorites.filter(f => !search || f.recipe?.title?.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-gray-900 dark:text-white flex items-center gap-2">
            <Heart className="w-6 h-6 text-red-500" /> Favorites
          </h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">{favorites.length} saved recipes</p>
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search favorites..." className="input-field pl-9 py-2 text-sm w-64" />
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => <RecipeCardSkeleton key={i} />)}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20 card">
          <Heart className="w-16 h-16 text-gray-300 dark:text-gray-700 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-2">
            {search ? 'No matching favorites' : 'No favorites yet'}
          </h3>
          <p className="text-gray-500 text-sm">{search ? 'Try a different search' : 'Save recipes you love by clicking the heart icon'}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filtered.map(fav => fav.recipe && (
            <div key={fav._id} className="relative group">
              <RecipeCard recipe={fav.recipe} showFavoriteButton={false} />
              <button
                onClick={() => remove(fav.recipe._id)}
                className="absolute top-3 right-3 p-2 rounded-full bg-red-500 text-white opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
