import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
    plugins: [react()],
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
                manualChunks(id) {
                    if (id.includes('node_modules')) {
                        if (id.includes('firebase')) {
                            return 'firebase';
                        }
                        if (id.includes('react') || id.includes('framer-motion')) {
                            return 'vendor';
                        }
                        return 'deps'; // Other dependencies
                    }
                }
            }
        }
    }
})
