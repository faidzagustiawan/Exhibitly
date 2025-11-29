// src/components/LikeButton.jsx

import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../services/supabaseClient' // Asumsi lokasi supabaseClient

export default function LikeButton({ artworkId, initialLiked, initialCount, isAuthenticated, onToggle }) {
  const [liked, setLiked] = useState(initialLiked)
  const [count, setCount] = useState(initialCount)
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const handleLike = async () => {
    // 1. Cek Autentikasi
    if (!isAuthenticated) {
      // Menggunakan state untuk redirect setelah login
      navigate(`/login`, { state: { redirectTo: `/gallery/${artworkId}` } })
      return
    }

    setLoading(true)
    const newLikedState = !liked
    const newCount = newLikedState ? count + 1 : count - 1

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        throw new Error('User session expired.')
      }

      if (newLikedState) {
        // Aksi LIKE: Insert ke tabel 'likes'
        const { error } = await supabase
          .from('likes')
          .insert({ artwork_id: artworkId, user_id: user.id })
        
        if (error) throw error
      } else {
        // Aksi UNLIKE: Delete dari tabel 'likes'
        const { error } = await supabase
          .from('likes')
          .delete()
          .eq('artwork_id', artworkId)
          .eq('user_id', user.id)
        
        if (error) throw error
      }

      // Update state lokal dan panggil callback ke induk
      setLiked(newLikedState)
      setCount(newCount)
      if (onToggle) {
        onToggle(newLikedState, newCount)
      }

    } catch (error) {
      console.error('Like error:', error)
      alert(error.message || 'Failed to process like action.')
      // Kembalikan ke state awal jika gagal
      // Note: Di sini kita tidak memanggil router.refresh() karena kita sudah update state lokal
    } finally {
      setLoading(false)
    }
  }

  return (
    <button
      onClick={handleLike}
      disabled={loading}
      className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition ${
        liked
          ? 'bg-red-500 text-white hover:bg-red-600'
          : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600'
      } disabled:opacity-50`}
    >
      <span className="text-xl">{liked ? '❤️' : '🤍'}</span>
      <span>{count} {count === 1 ? 'Like' : 'Likes'}</span>
    </button>
  )
}