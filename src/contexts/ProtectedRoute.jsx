import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from './AuthContext';

const ProtectedRoute = ({ requireAuth = false, requireArtist = false }) => {
  // Ambil loading dari context
  const { user, loading } = useAuth(); 
  const location = useLocation();

  // 1. Jika masih loading, TAMPILKAN SPINNER atau return null
  // Ini mencegah error "reading id of null" karena kode di bawahnya tidak akan dijalankan dulu
  if (loading) {
    return <div className="flex h-screen items-center justify-center">Loading...</div>; 
  }

  // 2. Jika butuh login, tapi user tidak ada
  if (requireAuth && !user) {
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }

  // 3. Jika role artist diperlukan
  if (requireArtist) {
    const role = user?.user_metadata?.role;
    // Pastikan validasi role sesuai tipe data di database kamu (number/string)
    if (role !== 2) { 
      return <Navigate to="/" replace />;
    }
  }

  return <Outlet />;
};

export default ProtectedRoute;