import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { History, Sparkles, Eye, Search, Clock } from 'lucide-react';
import { recommendationAPI } from '../../services/api.js';

const TYPE_CONFIG = {
  generated: { label: 'AI Generated', icon: Sparkles, color: 'bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400' },
  viewed: { label: 'Viewed', icon: Eye, color: 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400' },
  searched: { label: 'Searched', icon: Search, color: 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400' },
};

export default function HistoryPage() {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    recommendationAPI.getHistory()
      .then(d => setHistory(d.history || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const filtered = filter === 'all' ? history : history.filter(h => h.type === filter);

  const getTitle = (item) =>
    item.recipe?.title || item.recipeData?.title || item.query?.ingredients?.join(', ') || 'Unknown';

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-gray-900 dark:text-white flex items-center gap-2">
          <History className="w-6 h-6 text-gray-500" /> Activity History
        </h1>
        <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">Your recipe activity and AI interactions</p>
      </div>

      <div className="flex gap-2">
        {['all', 'generated', 'viewed', 'searched'].map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all capitalize ${
              filter === f ? 'bg-primary-500 text-white' : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="card divide-y divide-gray-100 dark:divide-gray-800">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="flex items-center gap-4 p-4">
              <div className="skeleton w-10 h-10 rounded-xl flex-shrink-0" />
              <div className="flex-1 space-y-2">
                <div className="skeleton h-4 w-48" />
                <div className="skeleton h-3 w-32" />
              </div>
              <div className="skeleton h-3 w-16" />
            </div>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20 card">
          <History className="w-16 h-16 text-gray-300 dark:text-gray-700 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-2">No activity yet</h3>
          <p className="text-gray-500 text-sm">Start exploring recipes to build your history</p>
          <Link to="/generate" className="btn-primary mt-4 inline-block text-sm">Generate a Recipe</Link>
        </div>
      ) : (
        <div className="card divide-y divide-gray-100 dark:divide-gray-800">
          {filtered.map((item, i) => {
            const cfg = TYPE_CONFIG[item.type] || TYPE_CONFIG.searched;
            const Icon = cfg.icon;
            return (
              <motion.div
                key={item._id || i}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.03 }}
                className="flex items-center gap-4 p-4 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
              >
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${cfg.color}`}>
                  <Icon className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm text-gray-900 dark:text-gray-100 truncate">{getTitle(item)}</p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className={`tag text-xs ${cfg.color}`}>{cfg.label}</span>
                    {item.query?.cuisine && (
                      <span className="text-xs text-gray-400">{item.query.cuisine}</span>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-3 flex-shrink-0">
                  {item.recipe?._id && (
                    <Link to={`/recipes/${item.recipe._id}`} className="text-xs text-primary-500 hover:text-primary-600 font-medium">
                      View
                    </Link>
                  )}
                  <span className="text-xs text-gray-400 flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {new Date(item.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
