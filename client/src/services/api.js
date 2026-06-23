import axios from 'axios';
import { auth } from './firebase.js';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  timeout: 30000,
});

api.interceptors.request.use(async (config) => {
  const user = auth.currentUser;
  if (user) {
    const token = await user.getIdToken();
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => Promise.reject(error));

api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    const message = error.response?.data?.error || error.message || 'Something went wrong';
    return Promise.reject(new Error(message));
  }
);

export default api;

export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  getMe: () => api.get('/auth/me'),
  updateLogin: () => api.post('/auth/login'),
};

export const userAPI = {
  getProfile: () => api.get('/users/profile'),
  updateProfile: (data) => api.put('/users/profile', data),
  deleteAccount: () => api.delete('/users/account'),
};

export const recipeAPI = {
  getAll: (params) => api.get('/recipes', { params }),
  getById: (id) => api.get(`/recipes/${id}`),
  getTrending: () => api.get('/recipes/trending'),
  getMealDB: (params) => api.get('/recipes/mealdb', { params }),
  getMealDBCategories: () => api.get('/recipes/mealdb/categories'),
  create: (data) => api.post('/recipes', data),
};

export const recommendationAPI = {
  generate: (data) => api.post('/recommendations/generate', data),
  matchIngredients: (data) => api.post('/recommendations/match-ingredients', data),
  analyzeNutrition: (data) => api.post('/recommendations/analyze-nutrition', data),
  generateMealPlanAI: (data) => api.post('/recommendations/meal-plan-ai', data),
  getHistory: () => api.get('/recommendations/history'),
};

export const chatAPI = {
  sendMessage: (data) => api.post('/chat/message', data),
  getHistory: (sessionId) => api.get(`/chat/${sessionId}`),
  getSessions: () => api.get('/chat/sessions'),
  deleteSession: (sessionId) => api.delete(`/chat/${sessionId}`),
};

export const favoriteAPI = {
  getAll: () => api.get('/favorites'),
  add: (data) => api.post('/favorites', data),
  remove: (recipeId) => api.delete(`/favorites/${recipeId}`),
  check: (recipeId) => api.get(`/favorites/check/${recipeId}`),
};

export const reviewAPI = {
  getAll: (recipeId) => api.get(`/reviews/${recipeId}`),
  add: (recipeId, data) => api.post(`/reviews/${recipeId}`, data),
  update: (id, data) => api.put(`/reviews/${id}`, data),
  delete: (id) => api.delete(`/reviews/${id}`),
};

export const mealplanAPI = {
  getAll: () => api.get('/mealplans'),
  getById: (id) => api.get(`/mealplans/${id}`),
  create: (data) => api.post('/mealplans', data),
  update: (id, data) => api.put(`/mealplans/${id}`, data),
  delete: (id) => api.delete(`/mealplans/${id}`),
};

export const groceryAPI = {
  getAll: () => api.get('/grocerylists'),
  getById: (id) => api.get(`/grocerylists/${id}`),
  create: (data) => api.post('/grocerylists', data),
  update: (id, data) => api.put(`/grocerylists/${id}`, data),
  toggleItem: (id, itemId) => api.patch(`/grocerylists/${id}/items/${itemId}/toggle`),
  delete: (id) => api.delete(`/grocerylists/${id}`),
};

export const analyticsAPI = {
  getPublic: () => api.get('/analytics/public'),
  getUser: () => api.get('/analytics/user'),
  getAdmin: () => api.get('/analytics/admin'),
};

export const adminAPI = {
  getUsers: (params) => api.get('/admin/users', { params }),
  updateUserRole: (id, role) => api.put(`/admin/users/${id}/role`, { role }),
  deleteUser: (id) => api.delete(`/admin/users/${id}`),
  getRecipes: (params) => api.get('/admin/recipes', { params }),
  deleteRecipe: (id) => api.delete(`/admin/recipes/${id}`),
  getReviews: () => api.get('/admin/reviews'),
  deleteReview: (id) => api.delete(`/admin/reviews/${id}`),
};

export const healthAPI = {
  getProfile: () => api.get('/health'),
  analyze: (data) => api.post('/health/analyze', data),
  track: (data) => api.post('/health/track', data),
};
