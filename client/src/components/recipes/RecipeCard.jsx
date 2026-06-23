import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Heart, Clock, ChefHat, Flame, Star } from 'lucide-react';
import { favoriteAPI } from '../../services/api.js';
import toast from 'react-hot-toast';

const FALLBACK = 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&q=80';
const DIFFICULTY_COLOR = { easy: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400', medium: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400', hard: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' };

export default function RecipeCard({ recipe, showFavoriteButton = true }) {
  const [favorited, setFavorited] = useState(false);
  const [saving, setSaving] = useState(false);

  const toggleFavorite = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (saving) return;
    setSaving(true);
    try {
      if (favorited) {
        await favoriteAPI.remove(recipe._id);
        setFavorited(false);
        toast.success('Removed from favorites');
      } else {
        await favoriteAPI.add({ recipeId: recipe._id });
        setFavorited(true);
        toast.success('Added to favorites!');
      }
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <motion.div whileHover={{ y: -4 }} transition={{ duration: 0.2 }}>
      <Link to={`/recipes/${recipe._id}`} className="card block overflow-hidden group">
        <div className="relative h-48 overflow-hidden rounded-t-2xl">
          <img
            src={recipe.image || FALLBACK}
            alt={recipe.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            onError={(e) => { e.target.src = FALLBACK; }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />

          {showFavoriteButton && (
            <button
              onClick={toggleFavorite}
              disabled={saving}
              className={`absolute top-3 right-3 p-2 rounded-full backdrop-blur-sm transition-all ${
                favorited ? 'bg-red-500 text-white' : 'bg-white/80 dark:bg-gray-900/80 text-gray-600 hover:text-red-500'
              }`}
            >
              <Heart className={`w-4 h-4 ${favorited ? 'fill-current' : ''}`} />
            </button>
          )}

          <div className="absolute bottom-3 left-3">
            <span className={`tag ${DIFFICULTY_COLOR[recipe.difficulty] || DIFFICULTY_COLOR.easy}`}>
              {recipe.difficulty}
            </span>
          </div>
        </div>

        <div className="p-4">
          <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-1 line-clamp-1 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
            {recipe.title}
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2 mb-3">{recipe.description}</p>

          <div className="flex items-center gap-3 text-xs text-gray-500 dark:text-gray-400">
            <span className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" />
              {recipe.cookingTime}m
            </span>
            <span className="flex items-center gap-1">
              <Flame className="w-3.5 h-3.5" />
              {recipe.nutrition?.calories || 0} cal
            </span>
            {recipe.averageRating > 0 && (
              <span className="flex items-center gap-1 ml-auto">
                <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                {recipe.averageRating.toFixed(1)}
              </span>
            )}
          </div>

          {recipe.cuisine && (
            <div className="mt-2">
              <span className="tag bg-primary-50 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400">
                {recipe.cuisine}
              </span>
            </div>
          )}
        </div>
      </Link>
    </motion.div>
  );
}
