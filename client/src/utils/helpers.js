/**
 * Format a number with commas
 */
export const formatNumber = (n) => Number(n).toLocaleString();

/**
 * Capitalize the first letter of a string
 */
export const capitalize = (s) => s ? s.charAt(0).toUpperCase() + s.slice(1) : '';

/**
 * Truncate text to a given length
 */
export const truncate = (text, length = 100) =>
  text && text.length > length ? text.slice(0, length) + '…' : text;

/**
 * Format minutes into "Xh Ym" display
 */
export const formatTime = (minutes) => {
  if (!minutes) return '—';
  if (minutes < 60) return `${minutes}m`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m > 0 ? `${h}h ${m}m` : `${h}h`;
};

/**
 * Get a food image from Unsplash by keyword
 */
export const getFoodImage = (keyword = 'food') => {
  const key = import.meta.env.VITE_UNSPLASH_ACCESS_KEY;
  if (!key) return `https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&q=80`;
  return `https://api.unsplash.com/photos/random?query=${encodeURIComponent(keyword)}&orientation=landscape&client_id=${key}`;
};

/**
 * Calculate percentage
 */
export const percentage = (value, total) =>
  total > 0 ? Math.round((value / total) * 100) : 0;

/**
 * Get difficulty badge color classes
 */
export const difficultyColor = (difficulty) => {
  const map = {
    easy: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
    medium: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
    hard: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
  };
  return map[difficulty] || map.easy;
};

/**
 * Sleep for ms milliseconds
 */
export const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Generate a random session ID
 */
export const generateSessionId = () =>
  `session_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;

/**
 * Alias for generateSessionId — generates a short unique ID
 */
export const genId = () =>
  `${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 9)}`;

export const generateId = genId;
