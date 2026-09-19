import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// GitHub Actions sets VITE_BASE_PATH="/${repository}/".
// Locally Vite serves the app at the root unless overridden.
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, '.', '')
  return { plugins: [react()], base: env.VITE_BASE_PATH || '/' }
})
