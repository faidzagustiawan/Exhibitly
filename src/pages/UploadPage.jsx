import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom' 
import { supabase } from '../services/supabaseClient' // Menggunakan Supabase client
import { uploadToCloudinary } from '../services/uploadArt' // Mengimpor fungsi upload baru

const UploadPage = () => {
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        category: 'fairy',
        media_type: 'image'
    })
    const [file, setFile] = useState(null)
    const [preview, setPreview] = useState(null)
    const [uploading, setUploading] = useState(false)
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(true)
    
    const navigate = useNavigate() 
    const [user, setUser] = useState(null) // State untuk menyimpan user

    // 1. Verifikasi Pengguna dan Peran (Artist)
    useEffect(() => {
        async function checkUser() {
            const { data: { user: currentUser } } = await supabase.auth.getUser()
            
            if (!currentUser) {
                navigate('/login', { state: { redirectTo: '/upload' } })
                return
            }
            
            // Memeriksa peran (role) pengguna di tabel 'users'
            const { data: userData, error: userError } = await supabase
                .from('users')
                .select('role')
                .eq('id', currentUser.id)
                .single()

            if (userError || userData?.role !== 'artist') {
                navigate('/forbidden')
                return
            }

            setUser(currentUser) // Simpan user object
            setLoading(false)
        }

        checkUser()
    }, [navigate]) 

    // 2. Handler Perubahan Form Input Teks
    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        })
    }

    // 3. Handler Perubahan File Input
    const handleFileChange = (e) => {
        const selectedFile = e.target.files[0]
        if (selectedFile) {
            setFile(selectedFile)
            
            if (selectedFile.type.startsWith('image/')) {
                const reader = new FileReader()
                reader.onloadend = () => {
                    setPreview(reader.result)
                }
                reader.readAsDataURL(selectedFile)
            } else {
                setPreview(null)
            }
        }
    }

    // 4. Handler Submit Form: Upload ke Cloudinary & Insert ke Supabase
    const handleSubmit = async (e) => {
        e.preventDefault()
        setError('')

        if (!file || !user) {
            setError('Please select a file and ensure you are logged in.')
            return
        }
        if (!formData.title || !formData.category) {
            setError('Title and Category are required.')
            return
        }

        setUploading(true)

        try {
            // 🔹 1. Upload file ke Cloudinary
            const mediaUrl = await uploadToCloudinary(file)
            
            // 🔹 2. Insert metadata ke Supabase
            const { data: artwork, error: dbError } = await supabase
                .from('artworks')
                .insert({
                    title: formData.title,
                    description: formData.description,
                    artist_id: user.id, // Menggunakan user yang tersimpan di state
                    category: formData.category,
                    media_type: formData.media_type,
                    media_url: mediaUrl, // URL dari Cloudinary
                })
                .select()
                .single()

            if (dbError) throw dbError
            
            // Navigasi setelah upload berhasil
            navigate(`/gallery/${artwork.id}`)

        } catch (err) {
            console.error('Upload process failed:', err)
            setError(err.message || 'An unexpected error occurred during upload.')
        } finally {
            setUploading(false)
        }
    }

    if (loading) {
        return (
            <div className="min-h-screen py-20 flex items-center justify-center">
                <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-green-600 dark:border-green-400"></div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
            {/* Header */}
            <header className="px-6 py-4 border-b bg-white dark:bg-gray-800 dark:border-gray-700">
                <div className="max-w-7xl mx-auto flex justify-between items-center">
                    <Link to="/" className="text-2xl font-bold text-gray-900 dark:text-white">
                        ArtGallery
                    </Link>
                    <nav className="flex gap-4">
                        <Link to="/gallery" className="text-gray-700 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white">
                            Gallery
                        </Link>
                        <Link to="/dashboard" className="text-gray-700 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white">
                            Dashboard
                        </Link>
                    </nav>
                </div>
            </header>

            <main className="max-w-3xl mx-auto px-6 py-8">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Upload Artwork</h1>
                    <p className="text-gray-600 dark:text-gray-400">Share your creative work with the community</p>
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8">
                    {error && (
                        <div className="mb-6 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-gray-700 text-red-600 dark:text-red-300 px-4 py-3 rounded">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Title */}
                        <div>
                            <label htmlFor="title" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Title *
                            </label>
                            <input
                                type="text"
                                id="title"
                                name="title"
                                required
                                value={formData.title}
                                onChange={handleChange}
                                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                                placeholder="Enter artwork title"
                            />
                        </div>

                        {/* Description */}
                        <div>
                            <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Description
                            </label>
                            <textarea
                                id="description"
                                name="description"
                                value={formData.description}
                                onChange={handleChange}
                                rows={4}
                                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                                placeholder="Describe your artwork..."
                            />
                        </div>

                        {/* Category */}
                        <div>
                            <label htmlFor="category" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Category *
                            </label>
                            <select
                                id="category"
                                name="category"
                                required
                                value={formData.category}
                                onChange={handleChange}
                                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                            >
                                <option value="fairy">Fairy</option>
                                <option value="kastil">Kastil</option>
                                <option value="fiksi">Fiksi</option>
                                <option value="alam">Alam</option>
                                <option value="mitologi">Mitologi</option>
                            </select>
                        </div>

                        {/* Media Type */}
                        <div>
                            <label htmlFor="media_type" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Media Type *
                            </label>
                            <select
                                id="media_type"
                                name="media_type"
                                required
                                value={formData.media_type}
                                onChange={handleChange}
                                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                            >
                                <option value="image">Image</option>
                                <option value="video">Video</option>
                                <option value="audio">Audio</option>
                                <option value="text">Text</option>
                            </select>
                        </div>

                        {/* File Upload */}
                        <div>
                            <label htmlFor="file" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Upload File *
                            </label>
                            <input
                                type="file"
                                id="file"
                                required
                                onChange={handleFileChange}
                                accept={
                                    formData.media_type === 'image' ? 'image/*' :
                                    formData.media_type === 'video' ? 'video/*' :
                                    formData.media_type === 'audio' ? 'audio/*' :
                                    '*'
                                }
                                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                            />
                            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                                {formData.media_type === 'image' && 'Accepted formats: JPG, PNG, GIF, WebP'}
                                {formData.media_type === 'video' && 'Accepted formats: MP4, WebM, MOV'}
                                {formData.media_type === 'audio' && 'Accepted formats: MP3, WAV, OGG'}
                                {formData.media_type === 'text' && 'Accepted formats: TXT, PDF, DOC'}
                            </p>
                        </div>

                        {/* Preview */}
                        {preview && (
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Preview
                                </label>
                                <div className="border border-gray-300 dark:border-gray-600 rounded-lg overflow-hidden">
                                    <img
                                        src={preview}
                                        alt="Preview"
                                        className="w-full h-auto max-h-96 object-contain bg-gray-100 dark:bg-gray-900"
                                    />
                                </div>
                            </div>
                        )}

                        {/* Submit Buttons */}
                        <div className="flex gap-4 pt-4">
                            <button
                                type="submit"
                                disabled={uploading}
                                className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                            >
                                {uploading ? 'Uploading...' : 'Upload Artwork'}
                            </button>
                            <Link
                                to="/dashboard" 
                                className="px-6 py-3 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 font-medium"
                            >
                                Cancel
                            </Link>
                        </div>
                    </form>
                </div>
            </main>
        </div>
    )
}

export default UploadPage