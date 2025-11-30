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
  const navigate = useNavigate();


  // Validasi
  const isValidName = name.trim().length >= 3
  const isValidEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
  const hasMinLength = password.length >= 8
  const hasUppercase = /[A-Z]/.test(password)
  const hasNumber = /[0-9]/.test(password)
  const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password)
  const isValidPassword = hasMinLength && hasUppercase && hasNumber && hasSpecialChar

  const loginWithGoogle = async () => {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        queryParams: {
          prompt: 'select_account', // Memaksa pemilihan akun setiap kali login
        },
      },
    });

    if (error) {
      console.error('Login gagal:', error.message);
    } else {
      console.log('Login berhasil:', data);
    }
  };


  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)

    if (!isValidName) {
      setError('Nama harus minimal 3 karakter')
      return
    }
    if (!isValidEmail) {
      setError('Email tidak valid')
      return
    }
    if (!isValidPassword) {
      setError('Password tidak memenuhi kriteria')
      return
    }

    setLoading(true)

    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { name },
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
        navigate("/"); // redirect ke home
      }
    } catch (err) {
      console.error('Unexpected signup error:', err)
      setError('Terjadi kesalahan tidak terduga.')
    } finally {
      setLoading(false)
    }
  }

  console.log('SignUp Payload:', { email, password, name })


  return (
    <div className="min-h-screen py-20 flex items-center justify-center bg-gray-50 dark:bg-gray-900">
      <div className="container-custom max-w-6xl">
        <div className="grid md:grid-cols-2 gap-8 items-center">
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
                    Buat akun untuk bergabung dengan ribuan relawan dan pendukung yang berkomitmen untuk Indonesia yang lebih hijau.
                  </p>
                </div>
              </div>
            </div>
          </motion.div>

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
                  Mulai perjalanan Anda dengan Re-Enviro
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Nama Lengkap
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                      <FiUser className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      id="name"
                      name="name"
                      type="text"
                      autoComplete="name"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="block w-full pl-10 pr-3 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                      placeholder="Nama lengkap Anda"
                    />
                  </div>
                  <div className={`flex mt-3 -mb-2 items-center text-sm ${isValidName ? 'text-green-500 dark:text-green-400' : 'text-gray-500 dark:text-gray-400'}`}>
                    <FiCheck className="mr-1 h-4 w-4" />
                    <span>Minimal 3 karakter</span>
                  </div>

                </div>

                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Email
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                      <FiMail className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      id="email"
                      name="email"
                      type="email"
                      autoComplete="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="block w-full pl-10 pr-3 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 "
                      placeholder="nama@email.com"
                    />
                  </div>
                  <div className={`flex mt-3 -mb-2 items-center text-sm ${isValidEmail ? 'text-green-500 dark:text-green-400' : 'text-gray-500 dark:text-gray-400'}`}>
                    <FiCheck className="mr-1 h-4 w-4" />
                    <span>Email Tidak Valid</span>
                  </div>
                </div>

                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Kata Sandi
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                      <FiLock className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      id="password"
                      name="password"
                      type={showPassword ? "text" : "password"}
                      autoComplete="new-password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="block w-full pl-10 pr-10 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                      placeholder="Buat kata sandi yang kuat"
                    />
                    <button
                      type="button"
                      className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-500"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <FiEyeOff className="h-5 w-5" /> : <FiEye className="h-5 w-5" />}
                    </button>
                  </div>

                  {/* Validasi Password */}
                  <div className="mt-3 grid grid-cols-2 gap-2">
                    <div className={`flex items-center text-sm ${hasMinLength ? 'text-green-500 dark:text-green-400' : 'text-gray-500 dark:text-gray-400'}`}>
                      <FiCheck className="mr-1 h-4 w-4" />
                      <span>Minimal 8 karakter</span>
                    </div>
                    <div className={`flex items-center text-sm ${hasUppercase ? 'text-green-500 dark:text-green-400' : 'text-gray-500 dark:text-gray-400'}`}>
                      <FiCheck className="mr-1 h-4 w-4" />
                      <span>Huruf besar</span>
                    </div>
                    <div className={`flex items-center text-sm ${hasNumber ? 'text-green-500 dark:text-green-400' : 'text-gray-500 dark:text-gray-400'}`}>
                      <FiCheck className="mr-1 h-4 w-4" />
                      <span>Angka</span>
                    </div>
                    <div className={`flex items-center text-sm ${hasSpecialChar ? 'text-green-500 dark:text-green-400' : 'text-gray-500 dark:text-gray-400'}`}>
                      <FiCheck className="mr-1 h-4 w-4" />
                      <span>Karakter khusus</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center">
                  <input
                    id="terms"
                    name="terms"
                    type="checkbox"
                    required
                    className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                  />
                  <label htmlFor="terms" className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
                    Saya menyetujui{' '}
                    <a href="#" className="text-primary-600 hover:text-primary-500 dark:text-primary-400 dark:hover:text-primary-300">
                      Syarat dan Ketentuan
                    </a>{' '}
                    serta{' '}
                    <a href="#" className="text-primary-600 hover:text-primary-500 dark:text-primary-400 dark:hover:text-primary-300">
                      Kebijakan Privasi
                    </a>
                  </label>
                </div>

                <div>
                  <button
                    type="submit"
                    className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-gray-600 hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={loading || !isValidName || !isValidEmail || !isValidPassword}
                  >
                    {loading ? 'Memproses...' : 'Daftar'}
                  </button>
                  {error && (
                    <p className="mt-2 text-sm text-red-600 dark:text-red-400">
                      {error}
                    </p>
                  )}
                </div>
              </form>

              <div className="mt-8">
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-300 dark:border-gray-600"></div>
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-2 bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400">
                      Atau daftar dengan
                    </span>
                  </div>
                </div>

                <div className="mt-6">
                  <button onClick={loginWithGoogle}
                    className="w-full inline-flex justify-center py-3 px-4 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm bg-white dark:bg-gray-700 text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
                  >
                    <svg className="h-5 w-5" fill="#4285F4" viewBox="0 0 24 24" aria-hidden="true">
                      <path d="M12.24 10.285V14.4h6.806c-.275 1.765-2.056 5.174-6.806 5.174-4.095 0-7.439-3.389-7.439-7.574s3.345-7.574 7.439-7.574c2.33 0 3.891.989 4.785 1.849l3.254-3.138C18.189 1.186 15.479 0 12.24 0c-6.635 0-12 5.365-12 12s5.365 12 12 12c6.926 0 11.52-4.869 11.52-11.726 0-.788-.085-1.39-.189-1.989H12.24z" />
                    </svg>
                    <span className="ml-2">Google</span>
                  </button>

                  
                </div>
              </div>

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