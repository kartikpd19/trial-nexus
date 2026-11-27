import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Production builds are served from GitHub Pages at /trial-nexus/; local dev runs at /.
export default defineConfig(({ command }) => ({
  plugins: [react()],
  base: command === 'build' ? '/trial-nexus/' : '/',
}))
