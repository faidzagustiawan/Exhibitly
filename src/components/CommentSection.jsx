// src/components/CommentSection.jsx

import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../services/supabaseClient' // Asumsi lokasi supabaseClient

export default function CommentSection({ artworkId, isAuthenticated }) {
  const [comments, setComments] = useState([])
  const [newComment, setNewComment] = useState('')
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    fetchComments()
    // Kita juga bisa mendengarkan perubahan realtime di sini jika diperlukan
  }, [artworkId])

  const fetchComments = async () => {
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('comments')
        .select(`
          *,
          users:user_id (
            id,
            name,
            avatar_url
          )
        `)
        .eq('artwork_id', artworkId)
        .order('created_at', { ascending: false }) // Tampilkan yang terbaru di atas

      if (error) throw error
      setComments(data || [])
    } catch (error) {
      console.error('Fetch comments error:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!isAuthenticated) {
      navigate(`/login`, { state: { redirectTo: `/gallery/${artworkId}` } })
      return
    }

    if (!newComment.trim()) return

    setSubmitting(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        throw new Error('User session expired.')
      }

      // Insert komentar baru
      const { data: newCommentData, error } = await supabase
        .from('comments')
        .insert({ 
          artwork_id: artworkId, 
          user_id: user.id,
          comment_text: newComment.trim()
        })
        .select(`
          *,
          users:user_id (
            id,
            name,
            avatar_url
          )
        `)
        .single() 

      if (error) throw error

      // Update state lokal
      setComments([newCommentData, ...comments])
      setNewComment('')
      
    } catch (error) {
      console.error('Comment error:', error)
      alert(error.message || 'Failed to post comment.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 border dark:border-gray-700">
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
        Comments ({comments.length})
      </h2>

      {/* Comment Form */}
      <form onSubmit={handleSubmit} className="mb-8">
        <textarea
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          placeholder={isAuthenticated ? "Write a comment..." : "Please login to comment"}
          disabled={!isAuthenticated || submitting}
          rows={3}
          className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white disabled:bg-gray-100 dark:disabled:bg-gray-700/50"
        />
        <div className="mt-2 flex justify-end">
          <button
            type="submit"
            disabled={!isAuthenticated || submitting || !newComment.trim()}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {submitting ? 'Posting...' : 'Post Comment'}
          </button>
        </div>
      </form>

      {/* Comments List */}
      <div className="space-y-4">
        {loading ? (
          <p className="text-center text-gray-500">Loading comments...</p>
        ) : comments.length === 0 ? (
          <p className="text-center text-gray-500 dark:text-gray-400">No comments yet. Be the first to comment!</p>
        ) : (
          comments.map((comment) => (
            <div key={comment.id} className="border-b border-gray-200 dark:border-gray-700 pb-4 last:border-0">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-full bg-gray-300 dark:bg-gray-600 flex items-center justify-center flex-shrink-0 overflow-hidden">
                  {comment.users?.avatar_url ? (
                    <img 
                      src={comment.users.avatar_url} 
                      alt={comment.users.name}
                      className="w-full h-full rounded-full object-cover"
                    />
                  ) : (
                    <span className="text-sm text-white">{comment.users?.name?.[0]?.toUpperCase()}</span>
                  )}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-semibold text-gray-900 dark:text-white">
                      {comment.users?.name || 'Anonymous'}
                    </span>
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                      {new Date(comment.created_at).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-gray-700 dark:text-gray-300">{comment.comment_text}</p>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}