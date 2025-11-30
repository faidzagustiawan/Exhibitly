import { useState, useEffect, useRef } from 'react'
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom'
import { FiMenu, FiX, FiMoon, FiSun, FiLogOut, FiUpload, FiGrid, FiUser } from 'react-icons/fi' // FiUser ditambahkan
import { motion } from 'framer-motion'
import { useTheme } from '../contexts/ThemeContext'
import { useAuth } from '../contexts/AuthContext'
import { supabase } from '../services/supabaseClient'; 
import Logo from './Logo'

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)
  const [isUserDropdown, setIsUserDropdown] = useState(false)
  const [avatarFailed, setAvatarFailed] = useState(false)

  const { theme, toggleTheme } = useTheme()
  const { user, logout } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()
  const dropdownRef = useRef()

  const isArtist = user?.user_metadata?.role === 'artist' || user?.role === 'artist'

  // === USER NAME ===
  const userName = user?.user_metadata?.full_name || user?.email || "User"

  // === USER INITIAL ===
  const userInitial = userName.charAt(0).toUpperCase()

  // === AVATAR COLOR (ASCII BASED) ===
  const avatarColors = [
    "bg-red-500", "bg-blue-500", "bg-green-500",
    "bg-purple-500", "bg-amber-500", "bg-pink-500",
    "bg-indigo-500", "bg-teal-500"
  ]
  const colorIndex = userInitial.charCodeAt(0) % avatarColors.length
  const avatarColor = avatarColors[colorIndex]

  // === RAW AVATAR URL ===
  const rawAvatar = user?.user_metadata?.avatar_url

  // VALIDASI URL AGAR TIDAK TAMPIL FOTO ERROR
  const avatarUrl =
    rawAvatar &&
      typeof rawAvatar === "string" &&
      rawAvatar.trim() !== "" &&
      rawAvatar !== "null" &&
      rawAvatar !== "undefined" &&
      rawAvatar.startsWith("http")
      ? rawAvatar
      : null

  // Reset avatar failed state when user changes
  useEffect(() => {
    setAvatarFailed(false)
  }, [user])

  // Detect click outside dropdown
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsUserDropdown(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Close menu on route change
  useEffect(() => {
    setIsMenuOpen(false)
    setIsUserDropdown(false)
  }, [location])

  // Scroll effect
  useEffect(() => {
    // Mengganti warna background default menjadi bg-gray-800
    const handleScroll = () => setIsScrolled(window.scrollY > 10)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // LOGOUT
  const handleLogout = async () => {
    try {
      await supabase.auth.signOut()
      
      if (logout) {
        logout()
      }
      
      navigate('/', { replace: true })
      window.location.reload() 
      
    } catch (error) {
      console.error("Error during logout:", error)

      navigate('/', { replace: true })
      window.location.reload() 
    }
  }

  // NAV LINK CLASSES
  const navLinkClasses = ({ isActive }) =>
    `px-3 py-2 text-base font-medium rounded-md transition-colors duration-300 
    ${isActive
      ? 'text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20'
      : 'text-gray-600 dark:text-gray-300 hover:text-green-500 dark:hover:text-green-400 hover:bg-gray-100 dark:hover:bg-gray-800'
    }`

  // PENYESUAIAN HEADER CLASSES
  const headerClasses = `fixed w-full top-0 z-50 transition-colors duration-300
    ${isScrolled
      ? 'bg-white/95 dark:bg-gray-900/95 backdrop-blur-md shadow-md'
      : 'bg-transparent' // Latar belakang awal sebelum scroll
    }`

  return (
    <header className={headerClasses}>
      <nav className="container-custom py-4">
        <div className="flex items-center justify-between">

          {/* LOGO */}
          <Link to="/" className="flex items-center space-x-2">
            <Logo className="h-10 w-auto" />
            <span className="text-xl font-bold text-gray-800 dark:text-white">Exhibitly</span>
          </Link>

          {/* DESKTOP MENU */}
          <div className="hidden md:flex items-center space-x-4">

            <NavLink to="/gallery" className={navLinkClasses}>Gallery</NavLink>

            {user && isArtist && (
              <>
                <NavLink to="/dashboard" className={navLinkClasses}>
                  <FiGrid className="inline-block mr-1" /> Dashboard
                </NavLink>
                <NavLink to="/upload" className={navLinkClasses}>
                  <FiUpload className="inline-block mr-1" /> Upload
                </NavLink>
              </>
            )}

            {/* THEME */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-full text-gray-600 dark:text-gray-300 hover:text-green-500"
            >
              {theme === 'dark' ? <FiSun /> : <FiMoon />}
            </button>

            {/* USER DROPDOWN */}
            {user ? (
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setIsUserDropdown(!isUserDropdown)}
                  className="flex items-center focus:outline-none focus:ring-2 focus:ring-green-500 rounded-full"
                >
                  <div className={`w-10 h-10 rounded-full overflow-hidden ${avatarColor} flex items-center justify-center text-white font-semibold`}>
                    {!avatarFailed && avatarUrl ? (
                      <img
                        src={avatarUrl}
                        className="w-full h-full object-cover"
                        alt="avatar"
                        onError={() => setAvatarFailed(true)}
                      />
                    ) : (
                      <span className="text-lg">{userInitial}</span>
                    )}
                  </div>
                </button>

                {/* DROPDOWN MENU */}
                {isUserDropdown && (
                  <div className="absolute right-0 mt-3 w-48 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-50">

                    <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700">
                      <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{userName}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                        {user?.email}
                      </p>
                    </div>

                    <ul className="py-2">
                      {/* LINK PROFILE SAYA (Desktop) */}
                      <li>
                        <NavLink
                          to={`/profile/${user?.id}`} 
                          onClick={() => setIsUserDropdown(false)}
                          className="flex items-center w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                        >
                          <FiUser className="mr-2" /> Profil Saya
                        </NavLink>
                      </li>
                      
                      {/* LINK LOGOUT */}
                      <li>
                        <button
                          onClick={handleLogout}
                          className="flex items-center w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                        >
                          <FiLogOut className="mr-2" /> Logout
                        </button>
                      </li>
                    </ul>
                  </div>
                )}
              </div>
            ) : (
              <>
                <Link to="/login" className="px-4 py-2 text-sm border rounded-lg text-gray-600 dark:text-gray-300 hover:text-green-500">Masuk</Link>
                <Link to="/signup" className="px-4 py-2 text-sm rounded-lg bg-green-600 text-white hover:bg-green-700">Daftar</Link>
              </>
            )}
          </div>

          {/* MOBILE MENU BUTTON */}
          <div className="md:hidden flex items-center space-x-2">
            <button
              onClick={toggleTheme}
              className="p-2 rounded-full text-gray-600 dark:text-gray-300"
            >
              {theme === 'dark' ? <FiSun /> : <FiMoon />}
            </button>

            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="p-2 rounded-md text-gray-600 dark:text-gray-300"
            >
              {isMenuOpen ? <FiX className="h-6 w-6" /> : <FiMenu className="h-6 w-6" />}
            </button>
          </div>
        </div>

        {/* MOBILE MENU */}
        {isMenuOpen && (
          <motion.div
            className="md:hidden mt-4 py-3 bg-white dark:bg-gray-900 rounded-lg shadow-lg border dark:border-gray-700"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="flex flex-col space-y-1 px-2">

              <NavLink to="/gallery" className={navLinkClasses}>Gallery</NavLink>

              {user && isArtist && (
                <>
                  <NavLink to="/dashboard" className={navLinkClasses}>
                    <FiGrid className="inline-block mr-1" /> Dashboard
                  </NavLink>
                  <NavLink to="/upload" className={navLinkClasses}>
                    <FiUpload className="inline-block mr-1" /> Upload
                  </NavLink>
                </>
              )}

              <div className="border-t border-gray-200 dark:border-gray-700 my-2" />

              {user ? (
                <>
                  <div className="flex items-center space-x-2 px-3 py-2">
                    <div className={`w-8 h-8 rounded-full ${avatarColor} flex items-center justify-center text-white font-semibold text-sm overflow-hidden`}>
                      {!avatarFailed && avatarUrl ? (
                        <img
                          src={avatarUrl}
                          className="w-full h-full object-cover rounded-full"
                          alt="avatar"
                          onError={() => setAvatarFailed(true)}
                        />
                      ) : (
                        <span>{userInitial}</span>
                      )}
                    </div>
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      {userName}
                    </span>
                  </div>

                  {/* LINK PROFILE SAYA (Mobile) */}
                  <NavLink 
                    to={`/profile/${user?.id}`} 
                    className="px-3 py-2 text-left text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md"
                  >
                    <FiUser className="inline-block mr-2" /> Profil Saya
                  </NavLink>

                  <button
                    onClick={handleLogout}
                    className="px-3 py-2 text-left text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md"
                  >
                    <FiLogOut className="inline-block mr-2" /> Logout
                  </button>
                </>
              ) : (
                <>
                  <Link to="/login" className="px-3 py-2 rounded-md text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800">Masuk</Link>
                  <Link to="/signup" className="px-3 py-2 rounded-md bg-green-600 text-white text-center hover:bg-green-700">Daftar</Link>
                </>
              )}
            </div>
          </motion.div>
        )}
      </nav>
    </header>
  )
}

export default Header