import { useState, useEffect, useCallback } from 'react';
import { recipeAPI } from '../services/api.js';

export function useRecipes(params = {}) {
  const [recipes, setRecipes] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetch = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await recipeAPI.getAll(params);
      setRecipes(data.recipes || []);
      setTotal(data.total || 0);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [JSON.stringify(params)]);

  useEffect(() => { fetch(); }, [fetch]);

  return { recipes, total, loading, error, refetch: fetch };
}
