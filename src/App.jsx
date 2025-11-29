import { useEffect, useState } from 'react'
import { Routes, Route } from 'react-router-dom'
// Import Layout dan Pages
import Layout from './layouts/Layout'
import HomePage from './pages/HomePage'
import LoginPage from './pages/LoginPage'
import SignupPage from './pages/SignupPage'
import GalleryPage from './pages/GalleryPage'
import GalleryDetailPage from './pages/GalleryDetailPage'
import UploadPage from './pages/UploadPage'
import ProfilePage from './pages/ProfilePage'
import NotFoundPage from './pages/NotFoundPage'
import DashboardPage from './pages/DashboardPage'
// Import Contexts/Services
import ProtectedRoute from './contexts/ProtectedRoute';
import { supabase } from './services/supabaseClient';

function App() {
  const [session, setSession] = useState(null);

  // --- LOGIKA SESI SUPABASE ---
  useEffect(() => {
    // 1. Cek sesi yang tersimpan di localStorage saat aplikasi dimuat
    const savedSession = localStorage.getItem('supabaseSession');
    if (savedSession) {
      try {
        const parsedSession = JSON.parse(savedSession);
        // Supabase akan secara otomatis memuat ulang sesi, kita hanya perlu mengatur state
        setSession(parsedSession); 
      } catch (e) {
        console.error("Error parsing stored session:", e);
        localStorage.removeItem('supabaseSession');
      }
    }

    // 2. Pantau perubahan sesi secara real-time
    const { data: authListener } = supabase.auth.onAuthStateChange((event, newSession) => {
      // Hanya simpan sesi jika event-nya adalah SIGNED_IN atau USER_UPDATED (dan ada sesi baru)
      if (newSession && (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED' || event === 'USER_UPDATED')) {
        localStorage.setItem('supabaseSession', JSON.stringify(newSession));
        setSession(newSession);
      } 
      
      // Hapus sesi jika SIGNED_OUT atau sesi batal
      else if (event === 'SIGNED_OUT' || !newSession) {
        localStorage.removeItem('supabaseSession');
        setSession(null);
      }
    });

    return () => {
      authListener?.subscription.unsubscribe();
    };
  }, []);


  return (
    <Routes>
      {/* Route Login dan Signup (Gunakan ProtectedRoute dengan requireAuth=false 
          agar user yang sudah login tidak bisa mengakses lagi) */}
      <Route element={<ProtectedRoute requireAuth={false} />}>
        <Route path="login" element={<LoginPage />} />
        <Route path="signup" element={<SignupPage />} />
      </Route>

      {/* Semua halaman yang menggunakan layout utama */}
      <Route path="/" element={<Layout />}>
        <Route index element={<HomePage />} />
        <Route path="gallery" element={<GalleryPage />} />
        
        {/* Detail Gallery/Artwork (Akses Publik, Tidak perlu ProtectedRoute) */}
        <Route path="gallery/:id" element={<GalleryDetailPage />} />
        
        {/* Route yang DI-PROTEKSI (Membutuhkan Login: requireAuth=true) */}
        <Route element={<ProtectedRoute requireAuth={true} />}>
          
          {/* Dashboard Artist (Path yang diperbaiki) */}
          <Route path="dashboard" element={<DashboardPage />} /> 

          {/* Halaman Upload */}
          <Route path="upload" element={<UploadPage />} />
          
          {/* Halaman Profil (Menggunakan ID) */}
          <Route path="profile/:id" element={<ProfilePage />} />
          
        </Route>
        
        {/* Route Catch-all untuk 404 */}
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  )
}

export default App