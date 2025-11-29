import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FiUpload, FiArrowRight, FiUser, FiImage, FiHeart, FiStar } from 'react-icons/fi';
import { motion } from 'framer-motion';
import { supabase } from '../services/supabaseClient';

// --- KOMPONEN BANTU: FeatureCard ---
const FeatureCard = ({ icon: Icon, title, description, delay }) => (
    <motion.div
        className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 text-center"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: delay }}
        whileHover={{ scale: 1.05, boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.04)" }}
    >
        <Icon className="w-10 h-10 text-indigo-600 dark:text-indigo-400 mx-auto mb-4" />
        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">{title}</h3>
        <p className="text-gray-600 dark:text-gray-400">{description}</p>
    </motion.div>
);

// --- KOMPONEN UTAMA: HomePage ---
const HomePage = () => {
    const [recentArtworks, setRecentArtworks] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchRecentArtworks = async () => {
            // Ambil 4 karya seni terbaru untuk tampilan cepat
            const { data, error } = await supabase
                .from('artworks')
                .select(`
                    id, title, media_url, media_type, category,
                    users:artist_id (name)
                `)
                .order('created_at', { ascending: false })
                .limit(4);
            
            if (error) {
                console.error('Error fetching recent artworks:', error);
            } else {
                setRecentArtworks(data || []);
            }
            setLoading(false);
        };
        fetchRecentArtworks();
    }, []);

    // Desain Card untuk Karya Terbaru
    const RecentArtworkCard = ({ artwork }) => (
        <Link to={`/gallery/${artwork.id}`} className="block group">
            <div className="h-64 rounded-xl overflow-hidden shadow-md transition-shadow duration-300 group-hover:shadow-xl relative">
                {artwork.media_type === 'image' ? (
                    <img 
                        src={artwork.media_url} 
                        alt={artwork.title} 
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gray-200 dark:bg-gray-700 text-gray-500">
                        <FiImage className="w-12 h-12" />
                    </div>
                )}
                <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-4">
                    <h4 className="text-lg font-semibold text-white line-clamp-1">{artwork.title}</h4>
                </div>
            </div>
            <p className="mt-2 text-sm text-gray-700 dark:text-gray-300 font-medium">By {artwork.users?.name || 'Artist'}</p>
        </Link>
    );

    return (
        <div className="min-h-screen pt-20 bg-gray-50 dark:bg-gray-800">
            
            {/* 1. HERO SECTION (Global Standard: Clear CTA) */}
            <header className="relative py-32 md:py-40 bg-gray-100 dark:bg-gray-900 overflow-hidden">
                <div className="container-custom relative z-10 text-center text-white">
                    <motion.h1
                        className="text-4xl md:text-6xl font-extrabold mb-4 tracking-tight"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                    >
                        Jelajahi Kreativitas Tanpa Batas
                    </motion.h1>
                    <motion.p
                        className="text-xl mb-8 max-w-3xl mx-auto opacity-80"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.2 }}
                    >
                        Platform digital untuk seniman dan kolektor. Temukan, apresiasi, dan miliki karya seni unik dari seluruh dunia.
                    </motion.p>
                    <motion.div
                        className="flex justify-center gap-4"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.6, delay: 0.4 }}
                    >
                        <Link 
                            to="/gallery" 
                            className="px-8 py-3 bg-green-500 text-white font-semibold rounded-full shadow-lg hover:bg-green-600 transition-colors flex items-center gap-2"
                        >
                            Mulai Jelajahi <FiArrowRight />
                        </Link>
                    </motion.div>
                </div>
                {/*  */}
            </header>

            {/* 2. FEATURE SECTION (Global Standard: Value Proposition) */}
            <section className="py-16">
                <div className="container-custom">
                    <h2 className="text-3xl font-bold text-center text-gray-900 dark:text-white mb-12">
                        Mengapa Memilih Galeri Kami?
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <FeatureCard 
                            icon={FiImage} 
                            title="Karya Pilihan" 
                            description="Koleksi kurasi terbaik dari berbagai genre dan media seni, memastikan kualitas tertinggi." 
                            delay={0.6}
                        />
                        <FeatureCard 
                            icon={FiUser} 
                            title="Dukungan Artist" 
                            description="Kami memberikan royalti dan hak penuh kepada artist, mendukung kemerdekaan berkarya mereka." 
                            delay={0.7}
                        />
                        <FeatureCard 
                            icon={FiStar} 
                            title="Akses Mudah" 
                            description="Antarmuka intuitif dan responsif, sempurna di desktop maupun perangkat seluler." 
                            delay={0.8}
                        />
                    </div>
                </div>
            </section>

            {/* 3. RECENT ARTWORKS (Global Standard: Showcase Latest Content) */}
            <section className="py-16 bg-white dark:bg-gray-900">
                <div className="container-custom">
                    <div className="flex justify-between items-center mb-10">
                        <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
                            Karya Terbaru
                        </h2>
                        <Link to="/gallery" className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 font-medium flex items-center gap-1">
                            Lihat Semua <FiArrowRight />
                        </Link>
                    </div>

                    {loading ? (
                        <div className="text-center py-10">Loading...</div>
                    ) : recentArtworks.length > 0 ? (
                        <motion.div 
                            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ duration: 0.5 }}
                        >
                            {recentArtworks.map(artwork => (
                                <RecentArtworkCard key={artwork.id} artwork={artwork} />
                            ))}
                        </motion.div>
                    ) : (
                        <div className="text-center py-10 text-gray-500 dark:text-gray-400">
                            Belum ada karya seni yang diunggah.
                        </div>
                    )}
                </div>
            </section>

        </div>
    );
};

export default HomePage;