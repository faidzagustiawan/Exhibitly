// src/services/uploadArt.js

const CLOUDINARY_CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
// PENTING: Ganti 'YOUR_UNSIGNED_PRESET' dengan nama preset yang sudah Anda buat di Cloudinary.
const CLOUDINARY_UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET; 

export async function uploadToCloudinary(file) {
    if (!CLOUDINARY_CLOUD_NAME || !CLOUDINARY_UPLOAD_PRESET) {
        throw new Error("Cloudinary credentials are not set in environment variables.");
    }

    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);

    try {
        const response = await fetch(
            `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/auto/upload`,
            {
                method: 'POST',
                body: formData,
            }
        );

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error?.message || 'Cloudinary upload failed.');
        }

        const data = await response.json();
        return data.secure_url; // Mengembalikan URL media yang aman
    } catch (error) {
        console.error("Cloudinary Upload Error:", error);
        throw new Error(`Upload failed: ${error.message}`);
    }
}