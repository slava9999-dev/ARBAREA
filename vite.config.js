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
            includeAssets: ['favicon.svg', 'icon.svg', 'icons/*.png'],
            devOptions: {
                enabled: true
            },
            manifest: {
                id: '/',
                name: 'Arbarea — Столярная мастерская',
                short_name: 'Arbarea',
                description: 'Эксклюзивная мебель и декор из массива дерева ручной работы.',
                theme_color: '#1c1917',
                background_color: '#1c1917',
                display: 'standalone',
                orientation: 'portrait',
                scope: '/',
                start_url: '/',
                categories: ['shopping', 'lifestyle'],
                icons: [
                    {
                        src: '/icons/icon-192x192.png',
                        sizes: '192x192',
                        type: 'image/png',
                        purpose: 'any'
                    },
                    {
                        src: '/icons/icon-512x512.png',
                        sizes: '512x512',
                        type: 'image/png',
                        purpose: 'any'
                    },
                    {
                        src: '/icons/maskable-icon-512x512.png',
                        sizes: '512x512',
                        type: 'image/png',
                        purpose: 'maskable'
                    },
                    {
                        src: '/icon.svg',
                        sizes: 'any',
                        type: 'image/svg+xml',
                        purpose: 'any'
                    }
                ],
                screenshots: [
                    {
                        src: '/screenshots/screenshot-mobile.png',
                        sizes: '390x844',
                        type: 'image/png',
                        form_factor: 'narrow',
                        label: 'Главный экран Arbarea'
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
