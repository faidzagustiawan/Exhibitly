import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react({
      babel: {
        plugins: [['babel-plugin-react-compiler']],
      },
    }),
    tailwindcss(),
  ],
  server: {
    host: true, // agar bisa diakses dari luar localhost
    allowedHosts: [
      '2a9a1b89bdb0.ngrok-free.app' // tambahkan host ngrok-mu di sini
    ],
  },
})
