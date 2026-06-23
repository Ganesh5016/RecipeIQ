import { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Search, Filter, X, ChefHat } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { recipeAPI } from '../../services/api.js';
import RecipeCard from '../../components/recipes/RecipeCard.jsx';
import { RecipeCardSkeleton } from '../../components/common/Skeletons.jsx';

const CUISINES = ['Italian', 'Indian', 'Chinese', 'Mexican', 'Japanese', 'Mediterranean', 'American', 'Thai'];
const DIET_TYPES = ['vegetarian', 'vegan', 'gluten-free', 'keto', 'paleo'];
const DIFFICULTIES = ['easy', 'medium', 'hard'];
const MAX_TIMES = [{ label: 'Under 15 min', value: 15 }, { label: 'Under 30 min', value: 30 }, { label: 'Under 60 min', value: 60 }];

export default function RecipesPage() {
  const { t } = useTranslation();
  const [searchParams, setSearchParams] = useSearchParams();
  const [recipes, setRecipes] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [showFilters, setShowFilters] = useState(false);

  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [cuisine, setCuisine] = useState('');
  const [dietType, setDietType] = useState('');
  const [difficulty, setDifficulty] = useState('');
  const [maxTime, setMaxTime] = useState('');

  const fetchRecipes = useCallback(async () => {
    setLoading(true);
    try {
      const params = { page, limit: 12 };
      if (search) params.search = search;
      if (cuisine) params.cuisine = cuisine;
      if (dietType) params.dietType = dietType;
      if (difficulty) params.difficulty = difficulty;
      if (maxTime) params.maxTime = maxTime;
      const data = await recipeAPI.getAll(params);
      setRecipes(data.recipes || []);
      setTotal(data.total || 0);
    } catch {
      setRecipes([]);
    } finally {
      setLoading(false);
    }
  }, [search, cuisine, dietType, difficulty, maxTime, page]);

  useEffect(() => {
    const timer = setTimeout(fetchRecipes, 400);
    return () => clearTimeout(timer);
  }, [fetchRecipes]);

  const clearFilters = () => {
    setSearch(''); setCuisine(''); setDietType(''); setDifficulty(''); setMaxTime(''); setPage(1);
  };

  const hasFilters = search || cuisine || dietType || difficulty || maxTime;

  const FilterChip = ({ label, value, active, onClick }) => (
    <button
      onClick={onClick}
      className={`tag cursor-pointer transition-all ${active
        ? 'bg-primary-500 text-white'
        : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-primary-50 dark:hover:bg-primary-900/20 hover:text-primary-600'
      }`}
    >
      {label}
    </button>
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-gray-900 dark:text-white">{t('Recipes')}</h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm">{total} {t('Recipes_Found')}</p>
        </div>
        <button onClick={() => setShowFilters(!showFilters)} className="btn-secondary flex items-center gap-2 text-sm self-start sm:self-auto">
          <Filter className="w-4 h-4" />
          {t('Filters')} {hasFilters && <span className="w-5 h-5 bg-primary-500 text-white rounded-full text-xs flex items-center justify-center">!</span>}
        </button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
        <input
          value={search}
          onChange={e => { setSearch(e.target.value); setPage(1); }}
          placeholder={t('Search_Placeholder')}
          className="input-field pl-12 pr-4 py-3.5"
        />
        {search && (
          <button onClick={() => setSearch('')} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Filters Panel */}
      {showFilters && (
        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="card p-5 space-y-4">
          <div>
            <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">{t('Cuisine')}</p>
            <div className="flex flex-wrap gap-2">
              {CUISINES.map(c => (
                <FilterChip key={c} label={c} active={cuisine === c} onClick={() => { setCuisine(cuisine === c ? '' : c); setPage(1); }} />
              ))}
            </div>
          </div>
          <div>
            <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">{t('Diet Type')}</p>
            <div className="flex flex-wrap gap-2">
              {DIET_TYPES.map(d => (
                <FilterChip key={d} label={d} active={dietType === d} onClick={() => { setDietType(dietType === d ? '' : d); setPage(1); }} />
              ))}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">{t('Difficulty')}</p>
              <div className="flex flex-wrap gap-2">
                {DIFFICULTIES.map(d => (
                  <FilterChip key={d} label={d} active={difficulty === d} onClick={() => { setDifficulty(difficulty === d ? '' : d); setPage(1); }} />
                ))}
              </div>
            </div>
            <div>
              <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">{t('Cooking Time')}</p>
              <div className="flex flex-wrap gap-2">
                {MAX_TIMES.map(t => (
                  <FilterChip key={t.value} label={t.label} active={maxTime === String(t.value)} onClick={() => { setMaxTime(maxTime === String(t.value) ? '' : String(t.value)); setPage(1); }} />
                ))}
              </div>
            </div>
          </div>
          {hasFilters && (
            <button onClick={clearFilters} className="text-sm text-red-500 hover:text-red-600 flex items-center gap-1">
              <X className="w-3 h-3" /> {t('Clear_All_Filters')}
            </button>
          )}
        </motion.div>
      )}

      {/* Results */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {Array.from({ length: 12 }).map((_, i) => <RecipeCardSkeleton key={i} />)}
        </div>
      ) : recipes.length > 0 ? (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {recipes.map(r => <RecipeCard key={r._id} recipe={r} />)}
          </div>
          {total > 12 && (
            <div className="flex justify-center gap-2">
              <button disabled={page === 1} onClick={() => setPage(p => p - 1)} className="btn-secondary py-2 text-sm disabled:opacity-50">{t('Previous')}</button>
              <span className="flex items-center px-4 text-sm text-gray-600 dark:text-gray-400">{t('Page')} {page} {t('Of')} {Math.ceil(total / 12)}</span>
              <button disabled={page >= Math.ceil(total / 12)} onClick={() => setPage(p => p + 1)} className="btn-secondary py-2 text-sm disabled:opacity-50">{t('Next')}</button>
            </div>
          )}
        </>
      ) : (
        <div className="text-center py-20">
          <ChefHat className="w-16 h-16 text-gray-300 dark:text-gray-700 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-2">{t('No_Recipes')}</h3>
          <p className="text-gray-500 dark:text-gray-400 mb-6">{t('Try_Adjusting')}</p>
          <button onClick={clearFilters} className="btn-primary text-sm">{t('Clear_Filters')}</button>
        </div>
      )}
    </div>
  );
}
