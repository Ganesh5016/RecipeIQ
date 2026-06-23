import { useState, useCallback } from 'react';
import { genId } from '../utils/helpers.js';

/**
 * Generic app state hook with ID generation utility
 */
export const useAppState = (initialState = {}) => {
  const [state, setState] = useState(initialState);

  const update = useCallback((updates) => {
    setState((prev) => ({ ...prev, ...updates }));
  }, []);

  const reset = useCallback(() => {
    setState(initialState);
  }, [initialState]);

  return { state, update, reset, genId };
};

export default useAppState;
