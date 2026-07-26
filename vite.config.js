import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],
  server: {
    port: 5173,
    allowedHosts: ['zxylearn.top', 'SERVER_IP_PLACEHOLDER', 'localhost', '127.0.0.1', '.zxylearn.top']
  }
})
