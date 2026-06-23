import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Clock, Users, Flame, ChefHat, Heart, ArrowLeft, Star, Trash2, Edit2, Download } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { recipeAPI, favoriteAPI, reviewAPI } from '../../services/api.js';
import { useAuth } from '../../contexts/AuthContext.jsx';
import StarRating from '../../components/common/StarRating.jsx';
import LoadingSpinner from '../../components/common/LoadingSpinner.jsx';
import { exportRecipePDF } from '../../utils/pdfExport.js';
import toast from 'react-hot-toast';

const FALLBACK = 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800&q=80';
const DIFF_COLOR = { easy: 'text-green-600 bg-green-100 dark:bg-green-900/30 dark:text-green-400', medium: 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900/30 dark:text-yellow-400', hard: 'text-red-600 bg-red-100 dark:bg-red-900/30 dark:text-red-400' };

export default function RecipeDetailPage() {
  const { t } = useTranslation();
  const { id } = useParams();
  const { dbUser } = useAuth();
  const [recipe, setRecipe] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isFavorite, setIsFavorite] = useState(false);
  const [favLoading, setFavLoading] = useState(false);
  const [myRating, setMyRating] = useState(0);
  const [myComment, setMyComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);
  const [myReview, setMyReview] = useState(null);
  const [editingReview, setEditingReview] = useState(false);

  useEffect(() => {
    const fetchAll = async () => {
      setLoading(true);
      try {
        const [recData, revData, favData] = await Promise.all([
          recipeAPI.getById(id),
          reviewAPI.getAll(id),
          favoriteAPI.check(id),
        ]);
        setRecipe(recData.recipe);
        setReviews(revData.reviews || []);
        setIsFavorite(favData.isFavorite);
        const mine = revData.reviews?.find(r => r.user?._id === dbUser?._id);
        if (mine) { setMyReview(mine); setMyRating(mine.rating); setMyComment(mine.comment || ''); }
      } catch (err) {
        toast.error('Failed to load recipe');
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, [id, dbUser]);

  const toggleFavorite = async () => {
    setFavLoading(true);
    try {
      if (isFavorite) {
        await favoriteAPI.remove(id);
        setIsFavorite(false);
        toast.success('Removed from favorites');
      } else {
        await favoriteAPI.add({ recipeId: id });
        setIsFavorite(true);
        toast.success('Added to favorites!');
      }
    } catch (err) { toast.error(err.message); }
    finally { setFavLoading(false); }
  };

  const submitReview = async () => {
    if (!myRating) return toast.error('Please select a rating');
    setSubmittingReview(true);
    try {
      if (myReview && editingReview) {
        const { review } = await reviewAPI.update(myReview._id, { rating: myRating, comment: myComment });
        setReviews(prev => prev.map(r => r._id === review._id ? review : r));
        setMyReview(review);
        setEditingReview(false);
        toast.success('Review updated!');
      } else if (!myReview) {
        const { review } = await reviewAPI.add(id, { rating: myRating, comment: myComment });
        setReviews(prev => [review, ...prev]);
        setMyReview(review);
        toast.success('Review submitted!');
      }
    } catch (err) { toast.error(err.message); }
    finally { setSubmittingReview(false); }
  };

  const deleteReview = async () => {
    if (!myReview) return;
    try {
      await reviewAPI.delete(myReview._id);
      setReviews(prev => prev.filter(r => r._id !== myReview._id));
      setMyReview(null); setMyRating(0); setMyComment('');
      toast.success('Review deleted');
    } catch (err) { toast.error(err.message); }
  };

  if (loading) return <div className="flex justify-center py-20"><LoadingSpinner size="lg" /></div>;
  if (!recipe) return <div className="text-center py-20"><p className="text-gray-500">{t('Recipe_Not_Found')}</p><Link to="/recipes" className="btn-primary mt-4 inline-block">{t('Back_To_Recipes')}</Link></div>;

  const { nutrition } = recipe;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <Link to="/recipes" className="flex items-center gap-2 text-sm text-gray-500 hover:text-primary-600 transition-colors">
          <ArrowLeft className="w-4 h-4" /> {t('Back_To_Recipes')}
        </Link>
        <button
          onClick={() => { exportRecipePDF(recipe); toast.success('PDF exported!'); }}
          className="btn-secondary py-2 text-sm flex items-center gap-2"
        >
          <Download className="w-4 h-4" /> {t('Export_PDF')}
        </button>
      </div>

      {/* Hero */}
      <div className="card overflow-hidden">
        <div className="relative h-72 sm:h-96">
          <img src={recipe.image || FALLBACK} alt={recipe.title} className="w-full h-full object-cover" onError={e => { e.target.src = FALLBACK; }} />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 p-6">
            <div className="flex flex-wrap gap-2 mb-3">
              <span className={`tag ${DIFF_COLOR[recipe.difficulty] || DIFF_COLOR.easy}`}>{recipe.difficulty}</span>
              {recipe.cuisine && <span className="tag bg-white/20 text-white backdrop-blur-sm">{recipe.cuisine}</span>}
              {recipe.dietType?.map(d => <span key={d} className="tag bg-primary-500/80 text-white">{d}</span>)}
            </div>
            <h1 className="text-3xl font-black text-white">{recipe.title}</h1>
            <p className="text-white/80 text-sm mt-1 line-clamp-2">{recipe.description}</p>
          </div>
          <button onClick={toggleFavorite} disabled={favLoading} className={`absolute top-4 right-4 p-3 rounded-full backdrop-blur-sm transition-all ${isFavorite ? 'bg-red-500 text-white' : 'bg-white/80 text-gray-700 hover:text-red-500'}`}>
            <Heart className={`w-5 h-5 ${isFavorite ? 'fill-current' : ''}`} />
          </button>
        </div>

        {/* Meta */}
        <div className="grid grid-cols-2 sm:grid-cols-4 divide-x divide-gray-100 dark:divide-gray-800 border-t border-gray-100 dark:border-gray-800">
          {[
            { icon: Clock, label: t('Cook Time'), value: `${recipe.cookingTime} min` },
            { icon: Users, label: t('Servings'), value: recipe.servings },
            { icon: Flame, label: t('Calories'), value: `${nutrition?.calories || 0} kcal` },
            { icon: ChefHat, label: t('Prep Time'), value: `${recipe.prepTime || 15} min` },
          ].map(({ icon: Icon, label, value }) => (
            <div key={label} className="flex flex-col items-center py-4 px-2 text-center">
              <Icon className="w-5 h-5 text-primary-500 mb-1" />
              <p className="text-sm font-bold text-gray-900 dark:text-white">{value}</p>
              <p className="text-xs text-gray-500">{label}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Ingredients */}
        <div className="card p-5">
          <h2 className="font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <span className="w-6 h-6 bg-primary-100 dark:bg-primary-900/30 rounded-lg flex items-center justify-center text-primary-600 text-sm">🥗</span>
            {t('Ingredients')}
          </h2>
          <ul className="space-y-2">
            {recipe.ingredients?.map((ing, i) => (
              <li key={i} className="flex items-start gap-2 text-sm">
                <span className="w-2 h-2 rounded-full bg-primary-400 mt-1.5 flex-shrink-0" />
                <span className="text-gray-700 dark:text-gray-300">
                  <strong>{ing.amount} {ing.unit}</strong> {ing.name}
                </span>
              </li>
            ))}
          </ul>
        </div>

        {/* Steps */}
        <div className="lg:col-span-2 card p-5">
          <h2 className="font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <span className="w-6 h-6 bg-accent-100 dark:bg-accent-900/30 rounded-lg flex items-center justify-center text-accent-600 text-sm">👨‍🍳</span>
            {t('Instructions')}
          </h2>
          <ol className="space-y-4">
            {recipe.steps?.map((step, i) => (
              <li key={i} className="flex gap-4">
                <span className="w-7 h-7 bg-primary-500 text-white rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">{i + 1}</span>
                <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed pt-1">{step}</p>
              </li>
            ))}
          </ol>
        </div>
      </div>

      {/* Nutrition */}
      {nutrition && (
        <div className="card p-5">
          <h2 className="font-bold text-gray-900 dark:text-white mb-4">{t('Nutrition_Per_Serving')}</h2>
          <div className="grid grid-cols-3 sm:grid-cols-6 gap-4">
            {[
              { label: t('Calories'), value: nutrition.calories, unit: 'kcal', color: 'bg-orange-100 dark:bg-orange-900/20 text-orange-600' },
              { label: t('Protein'), value: nutrition.protein, unit: 'g', color: 'bg-blue-100 dark:bg-blue-900/20 text-blue-600' },
              { label: t('Carbs'), value: nutrition.carbs, unit: 'g', color: 'bg-yellow-100 dark:bg-yellow-900/20 text-yellow-600' },
              { label: t('Fat'), value: nutrition.fat, unit: 'g', color: 'bg-red-100 dark:bg-red-900/20 text-red-600' },
              { label: t('Fiber'), value: nutrition.fiber, unit: 'g', color: 'bg-green-100 dark:bg-green-900/20 text-green-600' },
              { label: t('Sugar'), value: nutrition.sugar, unit: 'g', color: 'bg-pink-100 dark:bg-pink-900/20 text-pink-600' },
            ].map(({ label, value, unit, color }) => (
              <div key={label} className={`${color} rounded-xl p-3 text-center`}>
                <p className="text-lg font-black">{value || 0}</p>
                <p className="text-xs opacity-70">{unit}</p>
                <p className="text-xs font-medium mt-0.5">{label}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Reviews */}
      <div className="card p-5 space-y-5">
        <div className="flex items-center justify-between">
          <h2 className="font-bold text-gray-900 dark:text-white">
            {t('Reviews')} {reviews.length > 0 && <span className="text-gray-400 font-normal">({reviews.length})</span>}
          </h2>
          {recipe.averageRating > 0 && (
            <div className="flex items-center gap-2">
              <StarRating rating={Math.round(recipe.averageRating)} size="md" />
              <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">{recipe.averageRating.toFixed(1)}</span>
            </div>
          )}
        </div>

        {/* Write Review */}
        {(!myReview || editingReview) && (
          <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4 space-y-3">
            <p className="text-sm font-medium text-gray-700 dark:text-gray-300">{myReview ? t('Edit_Review') : t('Write_Review')}</p>
            <StarRating rating={myRating} size="lg" interactive onChange={setMyRating} />
            <textarea
              value={myComment}
              onChange={e => setMyComment(e.target.value)}
              placeholder={t('Share_Experience')}
              className="input-field text-sm resize-none"
              rows={3}
              maxLength={500}
            />
            <div className="flex gap-2">
              <button onClick={submitReview} disabled={!myRating || submittingReview} className="btn-primary py-2 text-sm">
                {submittingReview ? t('Submitting') : myReview ? t('Update') : t('Submit_Review')}
              </button>
              {editingReview && <button onClick={() => setEditingReview(false)} className="btn-secondary py-2 text-sm">{t('Cancel')}</button>}
            </div>
          </div>
        )}

        {/* Review list */}
        <div className="space-y-4">
          {reviews.map(rev => (
            <div key={rev._id} className="flex gap-3">
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary-400 to-accent-400 flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
                {rev.user?.avatar ? <img src={rev.user.avatar} alt="" className="w-full h-full rounded-full object-cover" /> : rev.user?.name?.[0]?.toUpperCase()}
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-semibold text-gray-900 dark:text-white">{rev.user?.name}</p>
                    <StarRating rating={rev.rating} size="sm" />
                  </div>
                  {rev.user?._id === dbUser?._id && (
                    <div className="flex gap-1">
                      <button onClick={() => setEditingReview(true)} className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-400"><Edit2 className="w-3.5 h-3.5" /></button>
                      <button onClick={deleteReview} className="p-1 rounded hover:bg-red-50 dark:hover:bg-red-900/20 text-gray-400 hover:text-red-500"><Trash2 className="w-3.5 h-3.5" /></button>
                    </div>
                  )}
                </div>
                {rev.comment && <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{rev.comment}</p>}
                <p className="text-xs text-gray-400 mt-1">{new Date(rev.createdAt).toLocaleDateString()}</p>
              </div>
            </div>
          ))}
          {reviews.length === 0 && <p className="text-sm text-gray-400 text-center py-4">{t('No_Reviews')}</p>}
        </div>
      </div>
    </div>
  );
}
