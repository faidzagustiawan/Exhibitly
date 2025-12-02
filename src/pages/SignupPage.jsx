import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom';
import { FiUser, FiMail, FiLock, FiEye, FiEyeOff, FiCheck } from 'react-icons/fi'
import { motion } from 'framer-motion'
import { supabase } from '../services/supabaseClient'


const SignupPage = () => {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [role, setRole] = useState("enthusiast") // ⬅ role dropdown
  const navigate = useNavigate();

  // Validasi
  const isValidName = name.trim().length >= 3
  const isValidEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
  const hasMinLength = password.length >= 8
  const hasUppercase = /[A-Z]/.test(password)
  const hasNumber = /[0-9]/.test(password)
  const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password)
  const isValidPassword = hasMinLength && hasUppercase && hasNumber && hasSpecialChar


  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)

    if (!isValidName) return setError('Nama harus minimal 3 karakter')
    if (!isValidEmail) return setError('Email tidak valid')
    if (!isValidPassword) return setError('Password tidak memenuhi kriteria')

    setLoading(true)

    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name,
            role: role === "artist" ? 2 : 1, // ⬅ simpan role
          },
        },
      })

      if (error) {
        console.error('Supabase signup error:', error)
        if (error.status === 422 || error.message.includes('already registered')) {
          setError('Email sudah terdaftar. Silakan gunakan email lain.')
        } else {
          setError(error.message || 'Terjadi kesalahan saat mendaftar.')
        }
      } else {
        alert('Pendaftaran berhasil!')
        navigate("/")
      }
    } catch (err) {
      console.error('Unexpected signup error:', err)
      setError('Terjadi kesalahan tidak terduga.')
    } finally {
      setLoading(false)
    }
  }


  return (
    <div className="min-h-screen py-20 flex items-center justify-center bg-gray-50 dark:bg-gray-900">
      <div className="container-custom max-w-6xl">
        <div className="grid md:grid-cols-2 gap-8 items-center">

          {/* LEFT IMAGE */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className="hidden md:block"
          >
            <div className="relative">
              <img
                src="https://images.pexels.com/photos/8108715/pexels-photo-8108715.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750"
                alt="Relawan menanam pohon"
                className="w-full h-auto rounded-xl"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-primary-600/60 to-primary-800/60 rounded-xl flex items-center justify-center">
                <div className="text-white text-center p-8">
                  <h2 className="text-3xl font-bold mb-4">Mulai Perjalanan Anda</h2>
                  <p className="text-lg text-white/90">
                    Buat akun untuk bergabung dengan komunitas kreator & enthusiast.
                  </p>
                </div>
              </div>
            </div>
          </motion.div>

          {/* FORM */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="bg-white dark:bg-gray-800 p-8 rounded-xl shadow-lg">
              <div className="text-center mb-8">
                <h1 className="text-2xl font-bold text-gray-200">
                  Buat Akun Baru
                </h1>
                <p className="text-gray-600 dark:text-gray-400 mt-2">
                  Daftar dan mulai perjalanan kreatif Anda
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">

                {/* NAME */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Nama Lengkap
                  </label>
                  <div className="relative">
                    <FiUser className="absolute inset-y-0 left-0 ml-3 mt-3 text-gray-400" />
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="block w-full pl-10 pr-3 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      placeholder="Nama lengkap Anda"
                      required
                    />
                  </div>
                </div>

                {/* EMAIL */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Email
                  </label>
                  <div className="relative">
                    <FiMail className="absolute inset-y-0 left-0 ml-3 mt-3 text-gray-400" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="block w-full pl-10 pr-3 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      placeholder="email@example.com"
                      required
                    />
                  </div>
                </div>

                {/* PASSWORD */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Kata Sandi
                  </label>
                  <div className="relative">
                    <FiLock className="absolute inset-y-0 left-0 ml-3 mt-3 text-gray-400" />
                    <input
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="block w-full pl-10 pr-10 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      placeholder="Buat kata sandi yang kuat"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-3 text-gray-400"
                    >
                      {showPassword ? <FiEyeOff /> : <FiEye />}
                    </button>
                  </div>
                </div>

                {/* ROLE DROPDOWN */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Daftar sebagai
                  </label>
                  <select
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    className="block w-full pl-3 pr-3 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none"
                  >
                    <option value="enthusiast">Enthusiast</option>
                    <option value="artist">Artist</option>
                  </select>
                </div>

                {/* TERMS */}
                <div className="flex items-center">
                  <input
                    id="terms"
                    name="terms"
                    type="checkbox"
                    required
                    className="h-4 w-4 text-primary-600"
                  />
                  <label htmlFor="terms" className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                    Saya menyetujui Syarat & Ketentuan
                  </label>
                </div>

                {/* SUBMIT BUTTON */}
                <button
                  type="submit"
                  disabled={loading || !isValidName || !isValidEmail || !isValidPassword}
                  className="w-full py-3 rounded-lg text-white bg-gray-600 hover:bg-gray-700 disabled:opacity-50"
                >
                  {loading ? "Memproses..." : "Daftar"}
                </button>

                {error && (
                  <p className="mt-2 text-sm text-red-600 dark:text-red-400">{error}</p>
                )}

              </form>

              <div className="mt-8 text-center">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Sudah memiliki akun?{' '}
                  <Link to="/login" className="font-medium text-gray-200 hover:text-green-500">
                    Masuk
                  </Link>
                </p>
              </div>

            </div>
          </motion.div>
        </div>
      </div>
    </div>
  )
}

export default SignupPage
