import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { FiMail, FiUpload, FiLock, FiUser, FiImage, FiSettings } from 'react-icons/fi';
import { motion } from 'framer-motion';
import { supabase } from '../services/supabaseClient';
import { useAuth } from '../contexts/AuthContext';
import { uploadToCloudinary } from '../services/uploadArt'; // <-- IMPORT CLOUDINARY SERVICE
import Swal from 'sweetalert2';

// --- KOMPONEN BANTU: ArtworkCard (Tidak berubah) ---
const ArtworkCard = ({ artwork }) => (
    <motion.div
        className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden border border-gray-200 dark:border-gray-700"
        whileHover={{ y: -3 }}
        transition={{ duration: 0.2 }}
    >
        <Link to={`/gallery/${artwork.id}`} className="block h-48 overflow-hidden bg-gray-100 dark:bg-gray-700">
            {artwork.media_type === 'image' ? (
                <img
                    src={artwork.media_url}
                    alt={artwork.title}
                    className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                />
            ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-500 text-xl">
                    {artwork.media_type === 'video' ? '🎬 Video' : '🔗 File'}
                </div>
            )}
        </Link>
        <div className="p-4">
            <h4 className="font-semibold text-gray-900 dark:text-white truncate">{artwork.title}</h4>
            <p className="text-xs text-gray-500 dark:text-gray-400 capitalize">{artwork.category}</p>
        </div>
    </motion.div>
);

// --- KOMPONEN UTAMA: ProfilePage ---
const ProfilePage = () => {
    const { id } = useParams();
    const { user: authUser } = useAuth();
    
    const [profile, setProfile] = useState(null);
    const [artworks, setArtworks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isViewerOwner, setIsViewerOwner] = useState(false);
    const [uploadingAvatar, setUploadingAvatar] = useState(false);
    
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [isChangingPassword, setIsChangingPassword] = useState(false);

    useEffect(() => {
        if (authUser && authUser.id === id) {
            setIsViewerOwner(true);
        } else {
            setIsViewerOwner(false);
        }
        fetchProfileAndArtworks();
    }, [id, authUser]);

    const fetchProfileAndArtworks = async () => {
        setLoading(true);

        // 1. Ambil Data Profil
        const { data: profileData, error: profileError } = await supabase
            .from('users')
            .select('*')
            .eq('id', id)
            .single();

        if (profileError || !profileData) {
            console.error('Error fetching profile:', profileError);
            setLoading(false);
            return;
        }

        setProfile(profileData);

        // 2. Jika Artist, Ambil Data Artworks
        if (profileData.role === 'artist') {
            const { data: artworkData, error: artworkError } = await supabase
                .from('artworks')
                .select('id, title, media_url, media_type, category')
                .eq('artist_id', id)
                .order('created_at', { ascending: false });

            if (artworkError) {
                console.error('Error fetching artworks:', artworkError);
            }
            setArtworks(artworkData || []);
        } else {
            setArtworks([]);
        }

        setLoading(false);
    };

    // --- HANDLERS ---

    const handleUploadAvatar = async (event) => {
        if (!isViewerOwner || !profile) return;

        const file = event.target.files[0];
        if (!file) return;

        setUploadingAvatar(true);
        
        try {
            // 1. UPLOAD FILE KE CLOUDINARY
            // Catatan: uploadToCloudinary harus dikonfigurasi untuk menangani folder jika Anda ingin avatarnya terpisah.
            // Saat ini, diasumsikan menggunakan preset umum.
            const avatarUrl = await uploadToCloudinary(file); 

            // 2. PERBARUI URL DI TABEL 'users' SUPABASE
            const { error: updateError } = await supabase
                .from('users')
                .update({ avatar_url: avatarUrl })
                .eq('id', id);

            if (updateError) throw updateError;
            
            // 3. PERBARUI STATE DI APLIKASI
            // Perbarui state lokal
            setProfile(prev => ({ ...prev, avatar_url: avatarUrl }));
            
            // Perbarui Supabase Auth user metadata (jika diperlukan untuk header, dll.)
            await supabase.auth.updateUser({ data: { avatar_url: avatarUrl } });

            Swal.fire('Berhasil!', 'Avatar berhasil diperbarui.', 'success');

        } catch (error) {
            console.error('Upload avatar error:', error);
            Swal.fire('Gagal!', error.message || 'Gagal memperbarui avatar. Pastikan Cloudinary Preset/Credentials sudah benar.', 'error');
        } finally {
            setUploadingAvatar(false);
        }
    };

    const handleChangePassword = async (e) => {
        e.preventDefault();
        if (!isViewerOwner) return;

        if (newPassword.length < 6) {
            Swal.fire('Gagal', 'Kata sandi minimal 6 karakter.', 'warning');
            return;
        }
        if (newPassword !== confirmPassword) {
            Swal.fire('Gagal', 'Kata sandi dan konfirmasi tidak cocok.', 'warning');
            return;
        }

        const { error } = await supabase.auth.updateUser({ password: newPassword });

        if (error) {
            console.error('Password update error:', error);
            Swal.fire('Gagal', error.message || 'Gagal mengganti kata sandi. Coba lagi.', 'error');
        } else {
            Swal.fire('Berhasil!', 'Kata sandi berhasil diperbarui.', 'success');
            setNewPassword('');
            setConfirmPassword('');
            setIsChangingPassword(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen py-20 flex items-center justify-center bg-gray-50 dark:bg-gray-900">
                <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-green-600 dark:border-green-400"></div>
            </div>
        );
    }

    if (!profile) {
        return (
            <div className="min-h-screen py-20 flex flex-col items-center justify-center bg-gray-50 dark:bg-gray-900">
                <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-4">Profil Tidak Ditemukan</h2>
                <Link to="/" className="mt-4 px-6 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium">
                    Kembali ke Beranda
                </Link>
            </div>
        );
    }

    // --- TAMPILAN UTAMA ---
    return (
        <div className="min-h-screen py-20 bg-gray-50 dark:bg-gray-900">
            <div className="container-custom max-w-4xl mx-auto px-4">
                
                {/* Header Profil */}
                <motion.div 
                    initial={{ opacity: 0, y: 20 }} 
                    animate={{ opacity: 1, y: 0 }} 
                    transition={{ duration: 0.5 }}
                    className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 md:p-8 mb-8 border border-gray-200 dark:border-gray-700"
                >
                    <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
                        
                        {/* Avatar */}
                        <div className="relative flex-shrink-0">
                            <div className="w-32 h-32 rounded-full bg-gray-200 dark:bg-gray-700 overflow-hidden flex items-center justify-center shadow-lg">
                                {profile.avatar_url ? (
                                    <img 
                                        src={profile.avatar_url} 
                                        alt={profile.name || 'User'} 
                                        className="w-full h-full object-cover" 
                                    />
                                ) : (
                                    <FiUser className="w-16 h-16 text-gray-500 dark:text-gray-400" />
                                )}
                            </div>
                            
                            {/* Upload Avatar (Hanya untuk pemilik) */}
                            {isViewerOwner && (
                                <label className="absolute bottom-0 right-0 w-8 h-8 bg-green-600 hover:bg-green-700 text-white rounded-full flex items-center justify-center cursor-pointer transition-colors shadow">
                                    <FiUpload className="w-4 h-4" />
                                    <input 
                                        type="file" 
                                        accept="image/*" 
                                        className="hidden" 
                                        onChange={handleUploadAvatar}
                                        disabled={uploadingAvatar}
                                    />
                                </label>
                            )}
                        </div>

                        {/* Info Profil */}
                        <div className="flex-1 text-center md:text-left">
                            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                                {profile.name || 'Pengguna'}
                            </h1>
                            <span className={`inline-block text-sm font-medium px-3 py-1 rounded-full capitalize ${
                                profile.role === 'artist' 
                                    ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300' 
                                    : 'bg-gray-100 text-gray-600 dark:bg-gray-700/50 dark:text-gray-400'
                            }`}>
                                {profile.role}
                            </span>
                            
                            <p className="mt-3 text-gray-700 dark:text-gray-300 flex items-center justify-center md:justify-start">
                                <FiMail className="mr-2 text-green-600" /> {profile.email || 'Email tidak tersedia'}
                            </p>
                            
                            {isViewerOwner && (
                                <div className="mt-4 pt-4 border-t dark:border-gray-700">
                                    <button 
                                        onClick={() => setIsChangingPassword(!isChangingPassword)}
                                        className="text-sm font-medium text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 transition-colors flex items-center mx-auto md:mx-0"
                                    >
                                        <FiLock className="mr-2 w-4 h-4" /> Ganti Kata Sandi
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </motion.div>

                {/* Form Ganti Password (Hanya untuk pemilik) */}
                {isViewerOwner && isChangingPassword && (
                    <motion.div 
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 md:p-8 mb-8 border border-red-200 dark:border-red-700 overflow-hidden"
                    >
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center">
                            <FiSettings className="mr-2 w-5 h-5 text-red-600" /> Pengaturan Kata Sandi
                        </h3>
                        <form onSubmit={handleChangePassword} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Kata Sandi Baru (Min 6 Karakter)</label>
                                <input
                                    type="password"
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                    required
                                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Konfirmasi Kata Sandi</label>
                                <input
                                    type="password"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    required
                                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                                />
                            </div>
                            <div className="flex justify-end gap-3">
                                <button type="button" onClick={() => setIsChangingPassword(false)} className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">
                                    Batal
                                </button>
                                <button type="submit" className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors">
                                    Simpan Kata Sandi
                                </button>
                            </div>
                        </form>
                    </motion.div>
                )}


                {/* Bagian Karya Seni (Hanya untuk Artist) */}
                {profile.role === 'artist' && (
                    <motion.div 
                        initial={{ opacity: 0, y: 20 }} 
                        animate={{ opacity: 1, y: 0 }} 
                        transition={{ duration: 0.5, delay: 0.2 }}
                        className="mt-10"
                    >
                        <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center">
                            <FiImage className="mr-2 text-green-600 w-6 h-6" /> Karya Seni ({artworks.length})
                        </h3>

                        {artworks.length > 0 ? (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                                {artworks.map(artwork => (
                                    <ArtworkCard key={artwork.id} artwork={artwork} />
                                ))}
                            </div>
                        ) : (
                            <div className="bg-white dark:bg-gray-800 p-8 rounded-xl text-center text-gray-500 dark:text-gray-400 border dark:border-gray-700">
                                <p className="mb-4">Artist ini belum mengunggah karya seni apa pun.</p>
                                {isViewerOwner && (
                                    <Link to="/upload" className="px-6 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium">
                                        Unggah Karya Pertama Anda
                                    </Link>
                                )}
                            </div>
                        )}
                    </motion.div>
                )}

                {/* Bagian User Biasa */}
                {profile.role === 'user' && (
                    <div className="mt-10 bg-white dark:bg-gray-800 p-8 rounded-xl text-center border dark:border-gray-700 shadow-md">
                        <p className="text-lg text-gray-700 dark:text-gray-300">
                            Ini adalah profil pengguna biasa. Tidak ada karya seni untuk ditampilkan.
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ProfilePage;