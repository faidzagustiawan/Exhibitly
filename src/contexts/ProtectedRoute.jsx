import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from './AuthContext';

const ProtectedRoute = ({ requireAuth }) => {
  const { user } = useAuth();
  const location = useLocation(); // Ambil URL saat ini

  if (requireAuth && !user) {
    return <Navigate to="/login" state={{ from: location.pathname }} />; 
  }

  return <Outlet />;
};

export default ProtectedRoute;