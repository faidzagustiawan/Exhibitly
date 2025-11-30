import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'

const NotFoundPage = () => {
  return (
    <div className="min-h-screen bg-gray-200 dark:bg-gray-900 py-20 flex items-center">
      <div className="container-custom">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-gray-200 mb-4">
              404
            </h1>
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-6">
              Halaman Tidak Ditemukan
            </h2>
            <p className="text-lg text-gray-700 dark:text-gray-300 mb-8">
              Maaf, halaman yang Anda cari tidak dapat ditemukan. Mungkin halaman telah dipindahkan, dihapus, atau URL yang Anda masukkan salah.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link 
                to="/" 
                className="text-white p-4 border-2 border-white rounded-xl hover:bg-white hover:text-gray-900 transition"
              >
                Kembali ke Beranda
              </Link>
            </div>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="hidden md:block"
          >
            <img 
              src="https://images.pexels.com/photos/957024/forest-trees-perspective-bright-957024.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750" 
              alt="Hutan yang membutuhkan perlindungan" 
              className="w-full h-auto rounded-xl shadow-xl"
            />
          </motion.div>
        </div>
      </div>
    </div>
  )
}

export default NotFoundPage