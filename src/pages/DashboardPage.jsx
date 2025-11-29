import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { FiGrid, FiHeart, FiMessageSquare, FiUpload, FiLogOut } from 'react-icons/fi'
import { motion } from 'framer-motion'
import { supabase } from '../services/supabaseClient' 
// import DashboardArtwork from '../components/DashboardArtwork' // Asumsi Anda memiliki komponen ini
import DashboardArtwork from '../components/DashboardArtwork'



// --- Komponen Dashboard Utama ---
const DashboardPage = () => {
    const [artworks, setArtworks] = useState(null)
    const [notifications, setNotifications] = useState(null)
    const [loading, setLoading] = useState(true)
    const [user, setUser] = useState(null)
    const navigate = useNavigate()

    // Status Calculated
    const totalArtworks = artworks?.length || 0
    const totalLikes = artworks?.reduce((sum, art) => sum + (art.likes?.length || 0), 0) || 0
    const totalComments = artworks?.reduce((sum, art) => sum + (art.comments?.length || 0), 0) || 0

    // 1. Verifikasi User dan Ambil Data
    useEffect(() => {
        const fetchDashboardData = async () => {
            setLoading(true)
            
            // --- Verifikasi User ---
            const { data: { user: currentUser } } = await supabase.auth.getUser()
            
            if (!currentUser) {
                // Redirect jika belum login
                navigate('/login', { state: { redirectTo: '/dashboard' } })
                return
            }

            // Ambil detail role dari tabel users
            const { data: userData } = await supabase
                .from('users')
                .select('role, name, avatar_url')
                .eq('id', currentUser.id)
                .single()
            
            // Set user dengan data tambahan (nama dan role)
            currentUser.name = userData?.name || 'Artist'
            currentUser.role = userData?.role

            if (currentUser.role !== 'artist') {
                // Redirect jika bukan artist
                navigate('/forbidden') 
                return
            }
            
            setUser(currentUser)

            // --- Fetch Artworks, Likes, and Comments ---
            const { data: fetchedArtworks } = await supabase
                .from('artworks')
                .select(`
                    *,
                    likes:likes(id),
                    comments:comments(id)
                `)
                .eq('artist_id', currentUser.id)
                .order('created_at', { ascending: false })

            setArtworks(fetchedArtworks)

            // --- Fetch Notifications ---
            const { data: fetchedNotifications } = await supabase
                .from('notifications')
                .select(`
                    *,
                    users:from_user_id (name, avatar_url),
                    artworks (title)
                `)
                .eq('artist_id', currentUser.id)
                .order('created_at', { ascending: false })
                .limit(5)
            
            setNotifications(fetchedNotifications)
            setLoading(false)
        }

        fetchDashboardData()
    }, [navigate])

    if (loading) {
        return (
            <div className="min-h-screen pt-20 flex items-center justify-center dark:bg-gray-900">
                <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-600 dark:border-blue-400"></div>
            </div>
        )
    }

    // Jika user tidak null (sudah diverifikasi sebagai artist), tampilkan dashboard
    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pt-20 px-20">
            {/* Header sudah diasumsikan ada di layout utama */}
            <main className="max-w-7xl mx-auto px-6 py-8">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                        Dashboard Saya
                    </h1>
                    <p className="text-gray-600 dark:text-gray-400">
                        Kelola karya seni Anda dan lihat aktivitas engagement.
                    </p>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }} className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow border dark:border-gray-700">
                        <div className="text-3xl mb-2 text-blue-600 dark:text-blue-400">🎨</div>
                        <div className="text-2xl font-bold text-gray-900 dark:text-white">{totalArtworks}</div>
                        <div className="text-gray-600 dark:text-gray-400">Total Artworks</div>
                    </motion.div>
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, delay: 0.1 }} className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow border dark:border-gray-700">
                        <div className="text-3xl mb-2 text-red-600 dark:text-red-400">❤️</div>
                        <div className="text-2xl font-bold text-gray-900 dark:text-white">{totalLikes}</div>
                        <div className="text-gray-600 dark:text-gray-400">Total Likes</div>
                    </motion.div>
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, delay: 0.2 }} className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow border dark:border-gray-700">
                        <div className="text-3xl mb-2 text-green-600 dark:text-green-400">💬</div>
                        <div className="text-2xl font-bold text-gray-900 dark:text-white">{totalComments}</div>
                        <div className="text-gray-600 dark:text-gray-400">Total Comments</div>
                    </motion.div>
                </div>

                {/* Recent Notifications & Artworks */}
                <div className=" grid grid-cols-1 lg:grid-cols-3 gap-6">
                    
                    {/* Recent Notifications (Sidebar) */}
                    <div className="lg:col-span-1">
                        {notifications && notifications.length > 0 && (
                            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.4 }} className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 border dark:border-gray-700 sticky top-24">
                                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Aktivitas Terbaru</h2>
                                <div className="space-y-4">
                                    {notifications.map((notif) => (
                                        <div key={notif.id} className="flex items-start gap-3 text-sm border-b dark:border-gray-700 pb-4 last:border-b-0 last:pb-0">
                                            <div className="w-8 h-8 rounded-full bg-gray-300 dark:bg-gray-600 flex items-center justify-center flex-shrink-0 overflow-hidden">
                                                {notif.users?.avatar_url ? (
                                                    <img 
                                                        src={notif.users.avatar_url} 
                                                        alt={notif.users.name}
                                                        className="w-full h-full rounded-full object-cover"
                                                    />
                                                ) : (
                                                    <span className="text-xs text-white">{notif.users?.name?.[0]?.toUpperCase()}</span>
                                                )}
                                            </div>
                                            <div className="flex-1">
                                                <span className="font-semibold text-gray-900 dark:text-white">{notif.users?.name}</span>
                                                <span className="text-gray-600 dark:text-gray-400">
                                                    {notif.type === 'like' ? ' menyukai' : ' berkomentar pada'} karya Anda
                                                </span>
                                                <Link to={`/gallery/${notif.artwork_id}`} className="text-blue-600 dark:text-blue-400 hover:underline block truncate">
                                                    {' "' + notif.artworks?.title + '"'}
                                                </Link>
                                            </div>
                                            <span className="text-gray-400 text-xs flex-shrink-0">
                                                {new Date(notif.created_at).toLocaleDateString()}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </motion.div>
                        )}
                    </div>
                    
                    {/* My Artworks (Main Content) */}
                    <div className="lg:col-span-3">
                        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.4 }} className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 border dark:border-gray-700">
                            <div className="flex justify-between items-center mb-6">
                                <h2 className="text-xl font-bold text-gray-900 dark:text-white">Karya Seni Saya</h2>
                                <Link 
                                    to="/upload"
                                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-1 text-sm font-medium"
                                >
                                    <FiUpload className="h-4 w-4" /> Upload Baru
                                </Link>
                            </div>

                            {artworks && artworks.length > 0 ? (
                                <div className="space-y-6">
                                    {artworks.map((artwork) => (
                                        // Asumsi DashboardArtwork adalah komponen yang menampilkan kartu artwork
                                        <DashboardArtwork key={artwork.id} artwork={artwork} />
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-12">
                                    <p className="text-gray-500 dark:text-gray-400 mb-4">Anda belum mengunggah karya seni apa pun.</p>
                                    <Link 
                                        to="/upload"
                                        className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
                                    >
                                        Unggah Karya Seni Pertama Anda
                                    </Link>
                                </div>
                            )}
                        </motion.div>
                    </div>

                </div>
            </main>
        </div>
    )
}

export default DashboardPage