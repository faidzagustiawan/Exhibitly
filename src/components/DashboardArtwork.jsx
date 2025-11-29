import { useState } from 'react'
import { Link } from 'react-router-dom' // <-- Diperbarui untuk react-router-dom

export default function DashboardArtwork({ artwork }) {
    const [showDetails, setShowDetails] = useState(false)

    // Data likes dan comments sudah di-join dari DashboardPage.jsx
    const likes = artwork.likes || []
    const comments = artwork.comments || []

    // Ambil hanya user info yang sudah di-join dari likes/comments (Jika ada)
    const getEngagementUser = (engagementItem) => {
        // Asumsi struktur data: likes:likes(users:user_id(name, avatar_url))
        // Kita menggunakan likes[0].users untuk mendapatkan nama/avatar user yang sudah di-join
        return engagementItem.users || {}
    }

    return (
        <div className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden bg-white dark:bg-gray-800">
            {/* Artwork Header */}
            <div className="p-4 bg-gray-50 dark:bg-gray-700 flex items-center gap-4">
                <div className="w-20 h-20 bg-gray-200 dark:bg-gray-600 rounded overflow-hidden flex-shrink-0">
                    {artwork.media_type === 'image' ? (
                        <img
                            src={artwork.media_url}
                            alt={artwork.title}
                            className="w-full h-full object-cover"
                        />
                    ) : artwork.media_type === 'video' ? (
                        <video
                            src={artwork.media_url}
                            className="w-full h-full object-cover"
                            muted
                        />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-400">
                            <span className="text-2xl">
                                {artwork.media_type === 'audio' ? '🎵' : '📄'}
                            </span>
                        </div>
                    )}
                </div>

                <div className="flex-1">
                    <h3 className="font-semibold text-lg text-gray-900 dark:text-white">{artwork.title}</h3>
                    <div className="flex items-center gap-4 mt-1 text-sm text-gray-600 dark:text-gray-400">
                        <span className="capitalize">{artwork.category}</span>
                        <span>❤️ {likes.length}</span>
                        <span>💬 {comments.length}</span>
                    </div>
                </div>

                <div className="flex gap-2">
                    <Link
                        // Ganti href menjadi 'to'
                        to={`/gallery/${artwork.id}`} 
                        className="px-4 py-2 text-sm bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded hover:bg-gray-50 dark:hover:bg-gray-700/50 text-gray-700 dark:text-gray-200"
                    >
                        View
                    </Link>
                    <button
                        onClick={() => setShowDetails(!showDetails)}
                        className="px-4 py-2 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
                    >
                        {showDetails ? 'Hide' : 'Show'} Details
                    </button>
                </div>
            </div>

            {/* Expandable Details */}
            {showDetails && (
                <div className="p-4 space-y-4">
                    
                    {/* Likes Section */}
                    {likes.length > 0 && (
                        <div>
                            <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
                                Likes ({likes.length})
                            </h4>
                            <div className="space-y-2 max-h-40 overflow-y-auto pr-2">
                                {likes.map((like) => {
                                    const user = getEngagementUser(like)
                                    return (
                                        <div key={like.id} className="flex items-center gap-2 text-sm">
                                            <div className="w-6 h-6 rounded-full bg-gray-300 dark:bg-gray-600 flex items-center justify-center flex-shrink-0 overflow-hidden">
                                                {user?.avatar_url ? (
                                                    <img 
                                                        src={user.avatar_url} 
                                                        alt={user.name}
                                                        className="w-full h-full rounded-full object-cover"
                                                    />
                                                ) : (
                                                    <span className="text-xs text-white">{user?.name?.[0]?.toUpperCase()}</span>
                                                )}
                                            </div>
                                            <span className="text-gray-700 dark:text-gray-300">{user?.name || 'Anonymous User'}</span>
                                        </div>
                                    )
                                })}
                            </div>
                        </div>
                    )}

                    {/* Comments Section */}
                    {comments.length > 0 && (
                        <div className="pt-4 border-t dark:border-gray-700">
                            <h4 className="font-semibold text-gray-900 dark:text-white mb-3">
                                Comments ({comments.length})
                            </h4>
                            <div className="space-y-3 max-h-60 overflow-y-auto pr-2">
                                {comments.map((comment) => {
                                    const user = getEngagementUser(comment)
                                    return (
                                        <div key={comment.id} className="bg-gray-50 dark:bg-gray-700 p-3 rounded">
                                            <div className="flex items-center gap-2 mb-1">
                                                <div className="w-6 h-6 rounded-full bg-gray-300 dark:bg-gray-600 flex items-center justify-center flex-shrink-0 overflow-hidden">
                                                    {user?.avatar_url ? (
                                                        <img 
                                                            src={user.avatar_url} 
                                                            alt={user.name}
                                                            className="w-full h-full rounded-full object-cover"
                                                        />
                                                    ) : (
                                                        <span className="text-xs text-white">{user?.name?.[0]?.toUpperCase()}</span>
                                                    )}
                                                </div>
                                                <span className="font-semibold text-sm text-gray-900 dark:text-white">{user?.name || 'Anonymous'}</span>
                                                <span className="text-xs text-gray-500 dark:text-gray-400">
                                                    {new Date(comment.created_at).toLocaleDateString()}
                                                </span>
                                            </div>
                                            <p className="text-sm text-gray-700 dark:text-gray-300 ml-8">{comment.comment_text}</p>
                                        </div>
                                    )
                                })}
                            </div>
                        </div>
                    )}

                    {/* No Engagement Message */}
                    {likes.length === 0 && comments.length === 0 && (
                        <p className="text-center text-gray-500 dark:text-gray-400 py-4">
                            No engagement yet. Share your artwork to get likes and comments!
                        </p>
                    )}
                </div>
            )}
        </div>
    )
}