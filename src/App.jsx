import { Routes, Route } from 'react-router-dom'
import Layout from './layouts/Layout'
// ... import pages lainnya ...
import HomePage from './pages/HomePage'
import LoginPage from './pages/LoginPage'
import SignupPage from './pages/SignupPage'
import GalleryPage from './pages/GalleryPage'
import GalleryDetailPage from './pages/GalleryDetailPage'
import UploadPage from './pages/UploadPage'
import DashboardPage from './pages/DashboardPage'
import ProfilePage from './pages/ProfilePage'
import NotFoundPage from './pages/NotFoundPage'
import ProtectedRoute from './contexts/ProtectedRoute';
import UpdatePasswordPage from './pages/UpdatePasswordPage';
import ResetPasswordPage from './pages/ResetPasswordPage';

function App() {
  // HAPUS SEMUA STATE SESSION & USEEFFECT DISINI
  // Kita percayakan sepenuhnya pada AuthProvider di main.jsx

  return (
    <Routes>
      {/* PUBLIC ROUTES (Login/Signup) */}
      {/* Tambahkan logika: Jika sudah login, redirect ke Home (GuestGuard) */}
      <Route element={<ProtectedRoute requireAuth={false} />}>
        <Route path="login" element={<LoginPage />} />
        <Route path="signup" element={<SignupPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />
        <Route path="/update-password" element={<UpdatePasswordPage />} />
      </Route>

      <Route path="/" element={<Layout />}>
        <Route index element={<HomePage />} />
        <Route path="gallery" element={<GalleryPage />} />

        {/* PROTECTED ROUTES (Wajib Login) */}
        <Route element={<ProtectedRoute requireAuth={true} />}>
          {/* Karena ada loading check di ProtectedRoute, halaman ini aman diakses */}
          <Route path="gallery/:id" element={<GalleryDetailPage />} />
          <Route path="profile/:id" element={<ProfilePage />} />
        </Route>

        {/* ARTIST ONLY */}
        <Route element={<ProtectedRoute requireAuth={true} requireArtist={true} />}>
          <Route path="dashboard" element={<DashboardPage />} />
          <Route path="upload" element={<UploadPage />} />
        </Route>

      </Route>
      <Route path="*" element={<NotFoundPage />} />



    </Routes>
  )
}

export default App