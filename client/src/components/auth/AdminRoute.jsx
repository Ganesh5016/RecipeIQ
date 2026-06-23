import { Navigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext.jsx';
import LoadingSpinner from '../common/LoadingSpinner.jsx';

export default function AdminRoute({ children }) {
  const { user, dbUser, loading } = useAuth();
  if (loading) return <LoadingSpinner fullScreen />;
  if (!user) return <Navigate to="/login" replace />;
  if (dbUser?.role !== 'admin') return <Navigate to="/dashboard" replace />;
  return children;
}
