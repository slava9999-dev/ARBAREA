import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

// https://vitejs.dev/config/
export default defineConfig({
    plugins: [
        react(),
        VitePWA({
            registerType: 'autoUpdate',
            strategies: 'generateSW',
            devOptions: {
                enabled: true
            },
            manifest: {
                name: 'Arbarea',
                short_name: 'Arbarea',
                description: 'Эксклюзивная мебель и декор из массива дерева ручной работы.',
                theme_color: '#1c1917',
                background_color: '#1c1917',
                display: 'standalone',
                icons: [
                    {
                        src: '/pwa-192x192.png',
                        sizes: '192x192',
                        type: 'image/png'
                    },
                    {
                        src: '/pwa-512x512.png',
                        sizes: '512x512',
                        type: 'image/png'
                    }
                ]
            }
        })
    ],
    resolve: {
        alias: {
            '@': '/src',
            '@api': '/api'
        }
    },
    server: {
        host: true,
        proxy: {
            '/api': {
                target: 'http://localhost:4000',
                changeOrigin: true,
                secure: false,
            }
        }
    },
    build: {
        chunkSizeWarningLimit: 1000,
        rollupOptions: {
            output: {
                manualChunks: {
                    vendor: ['react', 'react-dom', 'framer-motion'],
                    firebase: ['firebase/app', 'firebase/firestore', 'firebase/auth'],
                    ui: ['lucide-react']
                }
            }
        }
    }
})
