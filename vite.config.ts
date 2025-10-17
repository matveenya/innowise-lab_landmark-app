import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// https://vite.dev/config/
export default defineConfig({
  base: 'innowise-lab_landmark-app',
  plugins: [vue()],
  server: {
    open: true,
  }
})
