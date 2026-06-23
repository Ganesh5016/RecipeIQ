import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Users, BookOpen, Heart, Star, TrendingUp, Shield, MessageSquare } from 'lucide-react';
import { analyticsAPI } from '../../services/api.js';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, Cell,
} from 'recharts';

const COLORS = ['#f97316', '#d946ef', '#3b82f6', '#22c55e', '#eab308', '#ef4444'];

function StatCard({ icon: Icon, value, label, sub, color }) {
  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="card p-5">
      <div className={`w-10 h-10 ${color} rounded-xl flex items-center justify-center mb-3`}>
        <Icon className="w-5 h-5 text-white" />
      </div>
      <p className="text-2xl font-black text-gray-900 dark:text-white">{value?.toLocaleString() ?? '—'}</p>
      <p className="text-sm text-gray-500 dark:text-gray-400">{label}</p>
      {sub && <p className="text-xs text-green-500 mt-1">{sub}</p>}
    </motion.div>
  );
}

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    analyticsAPI.getAdmin()
      .then(d => setStats(d))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const quickLinks = [
    { to: '/admin/users', icon: Users, label: 'Manage Users', color: 'from-blue-500 to-indigo-600' },
    { to: '/admin/recipes', icon: BookOpen, label: 'Manage Recipes', color: 'from-primary-500 to-orange-600' },
    { to: '/admin/reviews', icon: MessageSquare, label: 'Manage Reviews', color: 'from-accent-500 to-purple-600' },
  ];

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-gradient-to-br from-accent-500 to-purple-600 rounded-xl flex items-center justify-center">
          <Shield className="w-5 h-5 text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-black text-gray-900 dark:text-white">Admin Dashboard</h1>
          <p className="text-gray-500 text-sm">Platform overview and management</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={Users} value={stats?.totalUsers} label="Total Users" sub={`${stats?.activeUsers} active (30d)`} color="bg-blue-500" />
        <StatCard icon={BookOpen} value={stats?.totalRecipes} label="Total Recipes" sub={`${stats?.aiGenerated} AI generated`} color="bg-primary-500" />
        <StatCard icon={TrendingUp} value={stats?.aiGenerated} label="AI Generations" color="bg-accent-500" />
        <StatCard icon={Star} value={stats?.topRecipes?.[0]?.averageRating?.toFixed(1)} label="Top Rating" color="bg-yellow-500" />
      </div>

      {/* Quick links */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {quickLinks.map(({ to, icon: Icon, label, color }) => (
          <Link key={to} to={to} className={`bg-gradient-to-br ${color} rounded-xl p-5 text-white hover:opacity-90 hover:-translate-y-1 transition-all shadow-lg`}>
            <Icon className="w-8 h-8 mb-3 opacity-80" />
            <p className="font-bold">{label}</p>
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* User Growth */}
        {stats?.userGrowth?.length > 0 && (
          <div className="card p-5">
            <h3 className="font-bold text-gray-900 dark:text-white mb-4">User Growth (30 days)</h3>
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={stats.userGrowth}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                <XAxis dataKey="_id" tick={{ fontSize: 10 }} tickFormatter={v => v.slice(5)} />
                <YAxis tick={{ fontSize: 10 }} />
                <Tooltip labelFormatter={v => v} />
                <Line type="monotone" dataKey="count" stroke="#f97316" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Top Cuisines */}
        {stats?.topCuisines?.length > 0 && (
          <div className="card p-5">
            <h3 className="font-bold text-gray-900 dark:text-white mb-4">Popular Cuisines</h3>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={stats.topCuisines} layout="vertical" margin={{ left: 60 }}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                <XAxis type="number" tick={{ fontSize: 10 }} />
                <YAxis type="category" dataKey="_id" tick={{ fontSize: 11 }} width={60} />
                <Tooltip />
                <Bar dataKey="count" radius={[0, 4, 4, 0]}>
                  {stats.topCuisines.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      {/* Recent users & top recipes */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {stats?.recentUsers?.length > 0 && (
          <div className="card p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-gray-900 dark:text-white">Recent Users</h3>
              <Link to="/admin/users" className="text-sm text-primary-500 hover:text-primary-600">View all</Link>
            </div>
            <div className="space-y-3">
              {stats.recentUsers.map(u => (
                <div key={u._id} className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-400 to-accent-400 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                    {u.name?.[0]?.toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{u.name}</p>
                    <p className="text-xs text-gray-500 truncate">{u.email}</p>
                  </div>
                  <span className="text-xs text-gray-400">{new Date(u.createdAt).toLocaleDateString()}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {stats?.topRecipes?.length > 0 && (
          <div className="card p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-gray-900 dark:text-white">Top Recipes</h3>
              <Link to="/admin/recipes" className="text-sm text-primary-500 hover:text-primary-600">View all</Link>
            </div>
            <div className="space-y-3">
              {stats.topRecipes.map((r, i) => (
                <div key={r._id} className="flex items-center gap-3">
                  <span className="w-6 h-6 rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-xs font-bold text-gray-500 flex-shrink-0">
                    {i + 1}
                  </span>
                  <p className="flex-1 text-sm font-medium text-gray-900 dark:text-white truncate">{r.title}</p>
                  <span className="text-xs text-gray-500 flex-shrink-0">{r.viewCount} views</span>
                  {r.averageRating > 0 && (
                    <span className="text-xs text-amber-500 flex-shrink-0">★ {r.averageRating.toFixed(1)}</span>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
