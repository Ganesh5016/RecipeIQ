import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { BookOpen, Trash2, Search, Eye, Star } from 'lucide-react';
import { adminAPI } from '../../services/api.js';
import { TableRowSkeleton } from '../../components/common/Skeletons.jsx';
import toast from 'react-hot-toast';

export default function AdminRecipes() {
  const [recipes, setRecipes] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);

  useEffect(() => {
    const fetchRecipes = async () => {
      setLoading(true);
      try {
        const data = await adminAPI.getRecipes({ page, limit: 20 });
        setRecipes(data.recipes || []);
        setTotal(data.total || 0);
      } catch {}
      finally { setLoading(false); }
    };
    fetchRecipes();
  }, [page]);

  const deleteRecipe = async (id) => {
    if (!window.confirm('Delete this recipe?')) return;
    try {
      await adminAPI.deleteRecipe(id);
      setRecipes(prev => prev.filter(r => r._id !== id));
      toast.success('Recipe deleted');
    } catch (err) { toast.error(err.message); }
  };

  const SOURCE_COLORS = {
    ai: 'bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300',
    mealdb: 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300',
    user: 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300',
  };

  const pages = Math.ceil(total / 20);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-gray-900 dark:text-white flex items-center gap-2">
          <BookOpen className="w-6 h-6 text-primary-500" /> Recipe Management
        </h1>
        <p className="text-gray-500 text-sm mt-1">{total} total recipes</p>
      </div>

      <div className="card overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="bg-gray-50 dark:bg-gray-800/50 border-b border-gray-100 dark:border-gray-800">
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Recipe</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider hidden sm:table-cell">Cuisine</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider hidden md:table-cell">Source</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider hidden lg:table-cell">Stats</th>
              <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
            {loading
              ? Array.from({ length: 10 }).map((_, i) => <TableRowSkeleton key={i} cols={5} />)
              : recipes.map(r => (
                <motion.tr key={r._id} initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                  className="hover:bg-gray-50 dark:hover:bg-gray-800/30 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg overflow-hidden flex-shrink-0 bg-gray-100 dark:bg-gray-800">
                        {r.image ? <img src={r.image} alt="" className="w-full h-full object-cover" /> : <BookOpen className="w-5 h-5 text-gray-400 m-2.5" />}
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-gray-900 dark:text-white truncate max-w-[200px]">{r.title}</p>
                        <p className="text-xs text-gray-500 capitalize">{r.difficulty} · {r.cookingTime}min</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 hidden sm:table-cell">
                    <span className="text-xs text-gray-500">{r.cuisine || '—'}</span>
                  </td>
                  <td className="px-4 py-3 hidden md:table-cell">
                    <span className={`tag text-xs ${SOURCE_COLORS[r.source] || ''}`}>{r.source}</span>
                  </td>
                  <td className="px-4 py-3 hidden lg:table-cell">
                    <div className="flex items-center gap-3 text-xs text-gray-500">
                      <span className="flex items-center gap-1"><Eye className="w-3 h-3" />{r.viewCount}</span>
                      {r.averageRating > 0 && <span className="flex items-center gap-1"><Star className="w-3 h-3 text-amber-400" />{r.averageRating.toFixed(1)}</span>}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end">
                      <button onClick={() => deleteRecipe(r._id)}
                        className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-gray-400 hover:text-red-500 transition-colors">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </motion.tr>
              ))
            }
          </tbody>
        </table>
        {!loading && recipes.length === 0 && (
          <div className="text-center py-12">
            <BookOpen className="w-12 h-12 text-gray-300 dark:text-gray-700 mx-auto mb-3" />
            <p className="text-gray-500">No recipes found</p>
          </div>
        )}
      </div>

      {pages > 1 && (
        <div className="flex justify-center gap-2">
          <button disabled={page === 1} onClick={() => setPage(p => p - 1)} className="btn-secondary py-2 text-sm disabled:opacity-50">Previous</button>
          <span className="flex items-center px-4 text-sm text-gray-600 dark:text-gray-400">Page {page} of {pages}</span>
          <button disabled={page >= pages} onClick={() => setPage(p => p + 1)} className="btn-secondary py-2 text-sm disabled:opacity-50">Next</button>
        </div>
      )}
    </div>
  );
}
