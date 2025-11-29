import { useState, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { FiClock, FiChevronRight, FiHeart, FiUser } from 'react-icons/fi' // Diubah ikon agar relevan dengan artwork
import { motion } from 'framer-motion'
import { supabase } from '../services/supabaseClient'
// Import komponen dummy untuk LikeButton dan CommentSection
// CATATAN: Anda harus membuat komponen LikeButton dan CommentSection versi React/Vite/react-router-dom sendiri
import LikeButton from '../components/LikeButton' 
import CommentSection from '../components/CommentSection' 

const GalleryDetailPage = () => {
    const { id } = useParams()
    const navigate = useNavigate()
    const [artwork, setArtwork] = useState(null)
    const [loading, setLoading] = useState(true)
    const [likesCount, setLikesCount] = useState(0)
    const [userHasLiked, setUserHasLiked] = useState(false)
    const [currentUser, setCurrentUser] = useState(null)

    // --- FUNGSI UTAMA UNTUK MENGAMBIL DATA ---
    useEffect(() => {
        const fetchArtworkDetail = async () => {
            setLoading(true)

            // 1. Ambil data artwork dan artist
            const { data: artworkData, error } = await supabase
                .from('artworks')
                .select(`
                    *,
                    users:artist_id (
                        id,
                        name,
                        avatar_url
                    )
                `)
                .eq('id', id)
                .single()

            if (error || !artworkData) {
                console.error('Gagal memuat artwork:', error)
                // Mengarahkan ke halaman 404 jika tidak ditemukan
                navigate('/404', { replace: true })
                return
            }

            setArtwork(artworkData)

            // 2. Ambil data user saat ini
            const { data: { user } } = await supabase.auth.getUser()
            setCurrentUser(user)

            // 3. Ambil jumlah Likes
            const { count: countData } = await supabase
                .from('likes')
                .select('*', { count: 'exact', head: true })
                .eq('artwork_id', id)
                .eq('user_id', user.id) // <-- Ini memerlukan otorisasi RLS yang tepat
                .single()
            
            setLikesCount(countData || 0)

            // 4. Cek apakah user sudah Like
            if (user) {
                const { data: likeData } = await supabase
                    .from('likes')
                    .select('id')
                    .eq('artwork_id', id)
                    .eq('user_id', user.id)
                    .single()
                setUserHasLiked(!!likeData)
            }
            
            setLoading(false)
        }

        fetchArtworkDetail()
    }, [id, navigate])

    if (loading) {
        return (
            <div className="min-h-screen py-20 flex items-center justify-center dark:bg-gray-900">
                <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-600 dark:border-blue-400"></div>
            </div>
        )
    }

    if (!artwork) {
        // Redirect sudah ditangani di useEffect
        return null;
    }

    // Menggunakan data artist dari hasil join
    const artist = artwork.users;

    const categoryColorClass = {
        'fairy': 'bg-pink-100 text-pink-800 dark:bg-pink-900/30 dark:text-pink-300',
        'kastil': 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300',
        'fiksi': 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300',
        'alam': 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
        'mitologi': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300'
    }

    return (
        <div className="min-h-screen py-20 bg-gray-50 dark:bg-gray-900">
            <div className="container-custom max-w-6xl mx-auto px-6">
                
                {/* Breadcrumb */}
                <nav className="flex py-3 mb-6 text-gray-600 dark:text-gray-400">
                    <ol className="inline-flex items-center space-x-1 md:space-x-3">
                        <li><Link to="/" className="hover:text-blue-600 dark:hover:text-blue-400">Beranda</Link></li>
                        <li className="flex items-center">
                            <FiChevronRight className="w-4 h-4" />
                            <Link to="/gallery" className="ml-1 hover:text-blue-600 dark:hover:text-blue-400">Gallery</Link>
                        </li>
                        <li className="flex items-center">
                            <FiChevronRight className="w-4 h-4" />
                            <span className="ml-1 text-gray-500 dark:text-gray-400">{artwork.title}</span>
                        </li>
                    </ol>
                </nav>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Konten Utama (Media & Info) */}
                    <div className="lg:col-span-2">
                        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }} className="space-y-6">
                            
                            {/* Media Section */}
                            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden">
                                {artwork.media_type === 'image' && (
                                    <img src={artwork.media_url} alt={artwork.title} className="w-full h-auto object-cover" />
                                )}
                                {artwork.media_type === 'video' && (
                                    <video src={artwork.media_url} controls className="w-full h-auto" />
                                )}
                                {/* Tambahkan handler untuk media type lain jika diperlukan */}
                            </div>

                            {/* Detail Text */}
                            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md border dark:border-gray-700">
                                <div className="flex flex-wrap gap-2 mb-4">
                                    <span className={`text-sm font-medium px-2.5 py-1 rounded-full capitalize ${categoryColorClass[artwork.category] || 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'}`}>
                                        {artwork.category}
                                    </span>
                                    <span className="text-sm font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300 px-2.5 py-1 rounded-full capitalize">
                                        {artwork.media_type}
                                    </span>
                                </div>

                                <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-4">{artwork.title}</h1>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6 text-gray-700 dark:text-gray-300 border-b pb-4 dark:border-gray-700">
                                    <div><FiClock className="inline mr-2 text-blue-600" />{new Date(artwork.created_at).toLocaleDateString()}</div>
                                    <div><FiUser className="inline mr-2 text-blue-600" />{artist?.name || 'Unknown Artist'}</div>
                                </div>
                                
                                {artwork.description && (
                                    <div className="mt-4">
                                        <h2 className="text-xl font-semibold mb-2">Deskripsi</h2>
                                        <p className="text-gray-700 dark:text-gray-300 leading-relaxed">{artwork.description}</p>
                                    </div>
                                )}
                            </div>
                            
                            {/* Comments Section */}
                            <CommentSection 
                                artworkId={artwork.id}
                                userId={currentUser?.id}
                                isAuthenticated={!!currentUser}
                            />
                        </motion.div>
                    </div>

                    {/* Sidebar (Artist Info & Action) */}
                    <div className="lg:col-span-1">
                        <motion.div className="sticky top-28 space-y-6" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, delay: 0.1 }}>
                            
                            {/* Artist Info Card */}
                            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border dark:border-gray-700 shadow-md">
                                <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Tentang Artist</h3>
                                <div className="flex items-center mb-4">
                                    <div className="w-14 h-14 rounded-full bg-gray-300 dark:bg-gray-700 mr-4 flex items-center justify-center overflow-hidden">
                                        {artist?.avatar_url ? (
                                            <img src={artist.avatar_url} alt={artist.name} className="w-full h-full object-cover" />
                                        ) : (
                                            <span className="text-xl text-white">{artist?.name?.[0]?.toUpperCase()}</span>
                                        )}
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-gray-900 dark:text-white">{artist?.name || 'Artist Tidak Diketahui'}</h4>
                                        <p className="text-sm text-gray-600 dark:text-gray-300">@{artist?.id.substring(0, 8)}...</p>
                                    </div>
                                </div>
                                
                                <Link
                                    to={`/profile/${artist?.id}`}
                                    className="w-full py-2 text-center text-sm font-medium text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors border-t pt-4 block dark:border-gray-700"
                                >
                                    Lihat Profil Lengkap &rarr;
                                </Link>
                            </div>

                            {/* Like & Actions Card */}
                            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border dark:border-gray-700 shadow-md">
                                <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Aksi</h3>
                                <LikeButton 
                                    artworkId={artwork.id}
                                    initialLiked={userHasLiked}
                                    initialCount={likesCount || 0}
                                    isAuthenticated={!!currentUser}
                                    // Callback untuk memperbarui state di komponen induk
                                    onToggle={(newLiked, newCount) => {
                                        setUserHasLiked(newLiked);
                                        setLikesCount(newCount);
                                    }}
                                />
                            </div>

                        </motion.div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default GalleryDetailPage