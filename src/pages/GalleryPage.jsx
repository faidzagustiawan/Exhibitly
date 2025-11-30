import { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { FiCalendar, FiFilter, FiChevronDown, FiSearch, FiHeart, FiMessageCircle } from 'react-icons/fi'
import { motion, AnimatePresence } from 'framer-motion'
import { supabase } from '../services/supabaseClient'
import { useAuth } from '../contexts/AuthContext'


// === VIDEO AUTOPLAY ON HOVER ===
const VideoHoverPlayer = ({ src }) => {
    const videoRef = useRef(null)

    const handleMouseEnter = () => {
        if (videoRef.current) videoRef.current.play().catch(() => { })
    }

    const handleMouseLeave = () => {
        if (videoRef.current) {
            videoRef.current.pause()
            videoRef.current.currentTime = 0
        }
    }

    return (
        <video
            ref={videoRef}
            src={src}
            muted
            playsInline
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
        />
    )
}

// === ARTWORK CARD ===
const ArtworkCard = ({ artwork, userId }) => {
    const [isLiked, setIsLiked] = useState(false)
    const [likesCount, setLikesCount] = useState(artwork.likes?.[0]?.count || 0)
    const commentsCount = artwork.comments?.[0]?.count || 0

    const categoryColors = {
        fairy: "bg-pink-100 text-pink-800 dark:bg-pink-900/30 dark:text-pink-300",
        kastil: "bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-300",
        fiksi: "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300",
        alam: "bg-teal-100 text-teal-800 dark:bg-teal-900/30 dark:text-teal-300",
        mitologi: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300",
    }

    useEffect(() => {
        if (userId) checkIfLiked()
    }, [userId, artwork.id])

    const checkIfLiked = async () => {
        const { data } = await supabase
            .from("likes")
            .select("id")
            .eq("artwork_id", artwork.id)
            .eq("user_id", userId)
            .maybeSingle()

        setIsLiked(!!data)
    }

    const handleLike = async (e) => {
        e.preventDefault()
        if (!userId) return

        if (isLiked) {
            await supabase.from("likes")
                .delete()
                .eq("artwork_id", artwork.id)
                .eq("user_id", userId)
            setLikesCount(prev => prev - 1)
        } else {
            await supabase.from("likes").insert({
                artwork_id: artwork.id,
                user_id: userId
            })
            setLikesCount(prev => prev + 1)
        }

        setIsLiked(!isLiked)
    }

    return (
        <motion.div
            className="card group bg-white dark:bg-gray-900 hover:shadow-xl transition-all duration-300 flex flex-col h-full rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.05 }}
        >

            {/* MEDIA DISPLAY */}
            <Link to={`/gallery/${artwork.id}`} className="relative h-64 bg-gray-100 dark:bg-gray-700">
                {artwork.media_type === "image" ? (
                    <img
                        src={artwork.media_url}
                        alt={artwork.title}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                ) : artwork.media_type === "video" ? (
                    <VideoHoverPlayer src={artwork.media_url} />
                ) : (
                    <div className="w-full h-full flex items-center justify-center group-hover:scale-105 text-gray-400 dark:text-gray-500">
                        <span className="text-6xl">
                            {artwork.media_type === "audio" ? "🎵" : "📄"}
                        </span>
                    </div>
                )}
            </Link>

            {/* KONTEN CARD */}
            <div className="flex flex-col grow p-5">
                <div className="flex justify-between items-start mb-3">
                    <span
                        className={`text-xs font-medium px-2.5 py-1 rounded-full capitalize ${categoryColors[artwork.category] ||
                            "bg-gray-100 text-gray-800 dark:bg-gray-700/80 dark:text-gray-100"
                            }`}
                    >
                        {artwork.category}
                    </span>

                    <div className="flex items-center text-gray-500 dark:text-gray-400 text-sm">
                        <FiCalendar className="mr-1" />
                        {new Date(artwork.created_at).toLocaleDateString()}
                    </div>
                </div>

                <Link to={`/gallery/${artwork.id}`}>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2 line-clamp-2 group-hover:text-green-600 dark:group-hover:text-green-400 transition-colors">
                        {artwork.title}
                    </h3>
                </Link>

                <Link
                    to={`/profile/${artwork.users?.id}`}
                    className="flex items-center gap-2 mb-4 hover:opacity-80 transition-opacity"
                >
                    <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700 overflow-hidden flex items-center justify-center flex-shrink-0">
                        {artwork.users?.avatar_url ? (
                            <img
                                src={artwork.users.avatar_url}
                                alt={artwork.users.name}
                                className="w-full h-full object-cover"
                            />
                        ) : (
                            <span className="text-gray-500 dark:text-gray-400 text-xs font-medium">
                                {artwork.users?.name?.charAt(0).toUpperCase()}
                            </span>
                        )}
                    </div>
                    <span className="text-sm text-gray-600 dark:text-gray-300">
                        {artwork.users?.name || "Artist"}
                    </span>
                </Link>

                <div className="grow"></div>

                <div className="flex items-center gap-4 pt-3 border-t border-gray-200 dark:border-gray-700">
                    <button
                        onClick={handleLike}
                        disabled={!userId}
                        className={`flex items-center gap-1 text-sm transition-colors ${isLiked ? "text-red-500" :
                            "text-gray-500 dark:text-gray-400 hover:text-red-500"
                            } ${!userId ? "cursor-not-allowed opacity-50" : "cursor-pointer"}`}
                    >
                        <FiHeart className={isLiked ? "fill-current" : ""} />
                        <span>{likesCount}</span>
                    </button>

                    <Link
                        to={`/gallery/${artwork.id}`}
                        className="flex items-center gap-1 text-sm text-gray-500 dark:text-gray-400 hover:text-green-500 transition-colors"
                    >
                        <FiMessageCircle />
                        <span>{commentsCount}</span>
                    </Link>
                </div>
            </div>
        </motion.div>
    )
}

// --- MAIN PAGE ---
const GalleryPage = () => {
    const { user } = useAuth()
    const [artworks, setArtworks] = useState([])
    const [loading, setLoading] = useState(true)
    const [filteredArtworks, setFilteredArtworks] = useState([])
    const [isFilterOpen, setIsFilterOpen] = useState(false)
    const [searchTerm, setSearchTerm] = useState('')
    const [filters, setFilters] = useState({ category: '' })

    // === PAGINATION ===
    const [currentPage, setCurrentPage] = useState(1)
    const ITEMS_PER_PAGE = 8
    const totalPages = Math.ceil(filteredArtworks.length / ITEMS_PER_PAGE)

    const paginatedArtworks = filteredArtworks.slice(
        (currentPage - 1) * ITEMS_PER_PAGE,
        currentPage * ITEMS_PER_PAGE
    )


    useEffect(() => {
        setCurrentPage(1)
    }, [searchTerm, filters])

    // FETCH ARTWORKS
    useEffect(() => { fetchArtworks() }, [])

    const fetchArtworks = async () => {
        setLoading(true)

        let query = supabase
            .from('artworks')
            .select(`
                *,
                users:artist_id (id, name, avatar_url),
                likes:likes(count),
                comments:comments(count)
            `)
            .order('created_at', { ascending: false })

        const { data, error } = await query

        if (error) console.error('Error fetching artworks:', error)
        else {
            setArtworks(data || [])
            setFilteredArtworks(data || [])
        }

        setLoading(false)
    }

    // FILTER + SEARCH
    useEffect(() => {
        let results = artworks

        if (searchTerm) {
            results = results.filter(artwork =>
                artwork.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                artwork.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                artwork.users?.name?.toLowerCase().includes(searchTerm.toLowerCase())
            )
        }

        if (filters.category) {
            results = results.filter(artwork => artwork.category === filters.category)
        }

        setFilteredArtworks(results)
    }, [searchTerm, filters, artworks])

    const getUniqueCategories = () => {
        return [...new Set(artworks.map(a => a.category))].filter(Boolean)
    }

    const handleFilterChange = (key, value) => {
        setFilters(prev => ({ ...prev, [key]: value }))
    }

    const resetFilters = () => {
        setFilters({ category: '' })
        setSearchTerm('')
    }

    if (loading) {
        return (
            <div className="pt-20 pb-16 min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
                    <p className="text-gray-600 dark:text-gray-400">Loading artworks...</p>
                </div>
            </div>
        )
    }

    return (
        <div className="pb-16 bg-gray-50 dark:bg-gray-900 min-h-screen">

            {/* HERO */}
            <div className="relative pt-35 pb-16 bg-green-300 dark:bg-green-800">
                <div className="absolute inset-0 overflow-hidden opacity-20">
                    <img
                        src="https://images.pexels.com/photos/1266808/pexels-photo-1266808.jpeg"
                        alt="Art Gallery"
                        className="w-full h-full object-cover"
                    />
                </div>

                <div className="container-custom relative z-10 text-center">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                    >
                        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">Art Gallery</h1>
                        <p className="text-gray-900 dark:text-white max-w-3xl mx-auto text-lg mb-8">
                            Jelajahi karya seni dari berbagai seniman berbakat.
                        </p>

                        {!user && (
                            <div className="flex flex-col sm:flex-row justify-center gap-4">
                                <Link to="/login" className="px-6 py-2 bg-white text-green-700 rounded-lg">
                                    Login
                                </Link>
                                <Link to="/signup" className="px-6 py-2 bg-green-600 text-white rounded-lg">
                                    Sign Up
                                </Link>
                            </div>
                        )}
                    </motion.div>
                </div>
            </div>

            {/* LISTING */}
            <section id="gallery" className="py-16">
                <div className="container-custom">

                    {/* HEADER FILTER */}
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8">
                        <div>
                            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                                {filters.category ? `${filters.category} Artworks` : "All Artworks"}
                            </h2>
                            <p className="text-gray-600 dark:text-gray-400">
                                {filteredArtworks.length} karya ditemukan
                            </p>
                        </div>

                        <button
                            onClick={() => setIsFilterOpen(!isFilterOpen)}
                            className="flex items-center gap-1 text-green-600 dark:text-green-400 font-medium"
                        >
                            <FiFilter />
                            Filter
                            <FiChevronDown className={`${isFilterOpen ? "rotate-180" : ""} transition`} />
                        </button>
                    </div>

                    {/* FILTER FORM */}
                    <AnimatePresence>
                        {isFilterOpen && (
                            <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: "auto", opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                transition={{ duration: 0.3 }}
                                className="overflow-hidden"
                            >
                                <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md mb-8 border dark:border-gray-700">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                                        {/* SEARCH */}
                                        <div>
                                            <label className="block text-sm font-medium mb-1">
                                                Cari Artwork
                                            </label>
                                            <div className="relative">
                                                <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                                <input
                                                    type="text"
                                                    value={searchTerm}
                                                    onChange={(e) => setSearchTerm(e.target.value)}
                                                    className="pl-10 w-full border dark:bg-gray-700 rounded-lg py-2 px-3"
                                                    placeholder="Cari judul, deskripsi, artist"
                                                />
                                            </div>
                                        </div>

                                        {/* CATEGORY */}
                                        <div>
                                            <label className="block text-sm font-medium mb-1">Kategori</label>
                                            <select
                                                value={filters.category}
                                                onChange={(e) => handleFilterChange("category", e.target.value)}
                                                className="w-full border dark:bg-gray-700 rounded-lg py-2 px-3"
                                            >
                                                <option value="">Semua Kategori</option>
                                                {getUniqueCategories().map((cat, idx) => (
                                                    <option key={idx} value={cat}>{cat}</option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>

                                    <div className="mt-6 flex justify-end">
                                        <button
                                            onClick={resetFilters}
                                            className="px-4 py-2 text-green-600 dark:text-green-400"
                                        >
                                            Reset Filter
                                        </button>
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* GRID ARTWORK */}
                    {filteredArtworks.length > 0 ? (
                        <>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                                {paginatedArtworks.map((artwork) => (
                                    <ArtworkCard key={artwork.id} artwork={artwork} userId={user?.id} />
                                ))}
                            </div>

                            {/* PAGINATION */}
                            {/* PAGINATION FULL (ANGKA 1, 2, 3, …, LAST) */}
                            {totalPages > 1 && (
                                <div className="flex items-center justify-center mt-10 gap-2 flex-wrap">

                                    {/* PREV */}
                                    <button
                                        onClick={() => setCurrentPage(p => Math.max(p - 1, 1))}
                                        disabled={currentPage === 1}
                                        className="px-3 py-2 rounded-lg bg-gray-200 dark:bg-green-700  disabled:opacity-10"
                                    >
                                        Prev
                                    </button>

                                    {/* PAGE NUMBERS */}
                                    {Array.from({ length: totalPages }, (_, i) => i + 1)
                                        .filter(page => {
                                            // tampilkan:
                                            // - halaman 1
                                            // - halaman terakhir
                                            // - halaman sekitar currentPage (current-2 sampai current+2)
                                            return (
                                                page === 1 ||
                                                page === totalPages ||
                                                (page >= currentPage - 2 && page <= currentPage + 2)
                                            )
                                        })
                                        .map((page, index, arr) => {
                                            const prevPage = arr[index - 1]

                                            return (
                                                <span key={page} className="flex items-center">
                                                    {/* Tambah "..." jika jarak halaman jauh */}
                                                    {prevPage && page - prevPage > 1 && (
                                                        <span className="px-2 text-gray-500">...</span>
                                                    )}

                                                    <button
                                                        onClick={() => setCurrentPage(page)}
                                                        className={`px-3 py-2 rounded-lg border
                                ${currentPage === page
                                                                ? "bg-green-600 text-white border-green-600"
                                                                : "bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600"
                                                            }
                            `}
                                                    >
                                                        {page}
                                                    </button>
                                                </span>
                                            )
                                        })}

                                    {/* NEXT */}
                                    <button
                                        onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))}
                                        disabled={currentPage === totalPages}
                                        className="px-3 py-2 rounded-lg bg-gray-200 dark:bg-green-700 disabled:opacity-10"
                                    >
                                        Next
                                    </button>
                                </div>
                            )}

                        </>
                    ) : (
                        <div className="text-center py-12">
                            <p className="text-lg text-gray-600 dark:text-gray-400">
                                Tidak ada artwork yang cocok.
                            </p>
                            <button
                                onClick={resetFilters}
                                className="mt-4 px-6 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg"
                            >
                                Reset Filter
                            </button>
                        </div>
                    )}
                </div>
            </section>
        </div>
    )
}

export default GalleryPage
