import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './contexts/AuthContext.jsx';
import { ThemeProvider } from './contexts/ThemeContext.jsx';
import ProtectedRoute from './components/auth/ProtectedRoute.jsx';
import AdminRoute from './components/auth/AdminRoute.jsx';
import PublicLayout from './components/layout/PublicLayout.jsx';
import DashboardLayout from './components/layout/DashboardLayout.jsx';

import LandingPage from './pages/LandingPage.jsx';
import LoginPage from './pages/auth/LoginPage.jsx';
import RegisterPage from './pages/auth/RegisterPage.jsx';
import ForgotPasswordPage from './pages/auth/ForgotPasswordPage.jsx';

import DashboardPage from './pages/dashboard/DashboardPage.jsx';
import RecipesPage from './pages/recipes/RecipesPage.jsx';
import RecipeDetailPage from './pages/recipes/RecipeDetailPage.jsx';
import GenerateRecipePage from './pages/recipes/GenerateRecipePage.jsx';
import IngredientMatchPage from './pages/recipes/IngredientMatchPage.jsx';
import NutritionPage from './pages/nutrition/NutritionPage.jsx';
import MealPlanPage from './pages/mealplan/MealPlanPage.jsx';
import GroceryPage from './pages/grocery/GroceryPage.jsx';
import FavoritesPage from './pages/favorites/FavoritesPage.jsx';
import HistoryPage from './pages/history/HistoryPage.jsx';
import ProfilePage from './pages/profile/ProfilePage.jsx';
import HealthAdvisorPage from './pages/health/HealthAdvisorPage.jsx';
import AdminDashboard from './pages/admin/AdminDashboard.jsx';
import AdminUsers from './pages/admin/AdminUsers.jsx';
import AdminRecipes from './pages/admin/AdminRecipes.jsx';
import AdminReviews from './pages/admin/AdminReviews.jsx';

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route element={<PublicLayout />}>
              <Route path="/" element={<LandingPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/forgot-password" element={<ForgotPasswordPage />} />
            </Route>

            <Route element={<ProtectedRoute><DashboardLayout /></ProtectedRoute>}>
              <Route path="/dashboard" element={<DashboardPage />} />
              <Route path="/recipes" element={<RecipesPage />} />
              <Route path="/recipes/:id" element={<RecipeDetailPage />} />
              <Route path="/generate" element={<GenerateRecipePage />} />
              <Route path="/ingredients" element={<IngredientMatchPage />} />
              <Route path="/nutrition" element={<NutritionPage />} />
              <Route path="/meal-plan" element={<MealPlanPage />} />
              <Route path="/grocery" element={<GroceryPage />} />
              <Route path="/favorites" element={<FavoritesPage />} />
              <Route path="/health" element={<HealthAdvisorPage />} />
              <Route path="/history" element={<HistoryPage />} />
              <Route path="/profile" element={<ProfilePage />} />
            </Route>

            <Route element={<AdminRoute><DashboardLayout /></AdminRoute>}>
              <Route path="/admin" element={<AdminDashboard />} />
              <Route path="/admin/users" element={<AdminUsers />} />
              <Route path="/admin/recipes" element={<AdminRecipes />} />
              <Route path="/admin/reviews" element={<AdminReviews />} />
            </Route>

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>

          <Toaster
            position="top-right"
            toastOptions={{
              duration: 4000,
              className: 'dark:bg-gray-800 dark:text-white',
              style: { borderRadius: '12px', padding: '12px 16px' },
            }}
          />
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
}
