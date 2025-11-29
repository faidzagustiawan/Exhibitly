import { Link } from 'react-router-dom'
import { FiInstagram, FiTwitter, FiLinkedin, FiYoutube, FiMail } from 'react-icons/fi'
import Logo from './Logo'

const Footer = () => {
    const currentYear = new Date().getFullYear()

    return (
        <footer className="bg-gray-100 dark:bg-gray-800 pt-16 pb-8">
            <div className="max-w-7xl mx-auto px-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">

                    {/* Tentang Exhibitly */}
                    <div>
                        <div className="flex items-center mb-4">
                            <Logo className="h-10 w-auto" />
                            <span className="ml-2 text-xl font-bold text-gray-800 dark:text-white">Exhibitly</span>
                        </div>

                        <p className="mb-6 text-gray-600 dark:text-gray-300">
                            Menghubungkan artist digital dengan kolektor global. Platform terkurasi untuk menampilkan dan mengapresiasi karya seni online.
                        </p>

                        <div className="flex space-x-4">
                            {[FiInstagram, FiTwitter, FiLinkedin, FiYoutube].map((Icon, i) => (
                                <a 
                                    key={i} 
                                    href="#" 
                                    aria-label={`Link to Exhibitly's social media ${Icon.name}`} 
                                    className="text-gray-600 dark:text-gray-300 dark:hover:text-green-500 hover:text-green-500  transition-colors"
                                >
                                    {/* Komentar JSX yang dipindahkan ke dalam elemen <a> */}
                                    <Icon className="h-5 w-5" />
                                </a>
                            ))}
                        </div>
                    </div>

                    {/* Link Cepat */}
                    <div>
                        <h3 className="text-lg font-semibold mb-4 text-gray-800 dark:text-white">Galeri & Komunitas</h3>
                        <ul className="space-y-2">
                            <li>
                                <Link to="/gallery" className="text-gray-600 dark:text-gray-300 dark:hover:text-green-500 hover:text-green-500 transition-colors">
                                    Jelajahi Galeri
                                </Link>
                            </li>
                        </ul>
                    </div>

                    {/* Kontak */}
                    <div>
                        <h3 className="text-lg font-semibold mb-4 text-gray-800 dark:text-white">Hubungi Kami</h3>

                        <div className="flex items-center space-x-3 mb-3 text-gray-600 dark:text-gray-300 dark:hover:text-green-500 hover:text-green-500  transition-colors">
                            <FiMail className="h-5 w-5 text-green-500" />
                            <a href="mailto:support@exhibitly.art">support@exhibitly.art</a>
                        </div>

                        <p className="text-gray-600 dark:text-gray-300">
                            Digital Arts Center<br />
                            Jalan Kreatif No. 10<br />
                            San Francisco, CA 94107<br />
                            USA
                        </p>
                    </div>

                    {/* Newsletter */}
                    <div>
                        <h3 className="text-lg font-semibold mb-4 text-gray-800 dark:text-white">Dapatkan Eksklusif</h3>

                        <p className="text-gray-600 dark:text-gray-300 mb-3">
                            Berlangganan untuk koleksi kurasi terbaru dan notifikasi lelang.
                        </p>

                        <form className="space-y-2">
                            <input
                                type="email"
                                placeholder="Email Anda"
                                className="w-full px-4 py-2 rounded-lg bg-gray-200 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 text-black dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500"
                            />

                            <button
                                type="submit"
                                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg w-full transition-colors font-medium"
                            >
                                Berlangganan
                            </button>
                        </form>
                    </div>
                </div>

                {/* Footer Bottom */}
                <div className="mt-12 pt-8 border-t border-gray-300 dark:border-gray-700">
                    <div className="flex flex-col md:flex-row justify-between items-center">
                        <p className="text-gray-600 dark:text-gray-300 text-sm mb-4 md:mb-0">
                            &copy; {currentYear} Exhibitly. All Rights Reserved.
                        </p>

                        <div className="flex space-x-6">
                            <Link to="/terms" className="text-sm text-gray-600 dark:text-gray-300 dark:hover:text-green-500 hover:text-green-500 transition-colors">
                                Terms of Service
                            </Link>
                            <Link to="/privacy" className="text-sm text-gray-600 dark:text-gray-300 dark:hover:text-green-500 hover:text-green-500 transition-colors">
                                Privacy Policy
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </footer>
    )
}

export default Footer