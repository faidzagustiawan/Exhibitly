import { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../services/supabaseClient'; 

const AuthContext = createContext()

export const useAuth = () => useContext(AuthContext)

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  // Tambahkan state loading
  const [loading, setLoading] = useState(true) 

  useEffect(() => {
    const initializeAuth = async () => {
      // 1. Cek User saat ini
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)
      setLoading(false) // Stop loading setelah cek selesai
    }

    initializeAuth()

    // 2. Listen perubahan auth
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user || null)
      setLoading(false)
    })

    return () => {
      listener.subscription.unsubscribe()
    }
  }, [])

  const login = async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })
    if (error) throw error
    // Tidak perlu setUser manual di sini, karena onAuthStateChange akan menangkapnya
  }

  const logout = async () => {
    await supabase.auth.signOut()
    // setUser(null) ditangani oleh onAuthStateChange
  }

  return (
    // Kirim state loading ke seluruh aplikasi
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {/* Opsional: Render loading spinner global disini jika mau */}
      {!loading && children} 
    </AuthContext.Provider>
  )
}