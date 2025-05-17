import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      'monaco-themes': path.resolve(__dirname, 'node_modules/monaco-themes')
    }
  }
})
