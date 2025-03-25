import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    tailwindcss(),
    react()
  ],
  server: {
    proxy: {
      '/api/lol/profile': {
        target: 'http://localhost:5288',
      },
      '/api/lol/profile/livegame': {
        target: 'http://localhost:5288',
      }
    },
  },
})
