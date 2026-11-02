/// <reference types="vitest/config" />
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'
import { defineConfig } from 'vite'
import { fileURLToPath, URL } from 'node:url'

const src = (p: string) => fileURLToPath(new URL(`./src/${p}`, import.meta.url))

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      manifest: {
        name: 'Tabuada Viva',
        short_name: 'Tabuada Viva',
        lang: 'pt-BR',
        display: 'standalone',
        orientation: 'portrait',
        start_url: '/',
        background_color: '#fff7e6',
        theme_color: '#2e9e5b',
        icons: [{ src: 'favicon.svg', sizes: 'any', type: 'image/svg+xml', purpose: 'any' }],
      },
      workbox: { globPatterns: ['**/*.{js,css,html,svg,webp,woff2}'] },
    }),
  ],
  resolve: {
    alias: {
      '@domain': src('domain'),
      '@content': src('content'),
      '@data': src('data'),
      '@ui': src('ui'),
      '@dashboard': src('dashboard'),
    },
  },
  test: {
    environment: 'node',
    include: ['src/**/*.test.{ts,tsx}', 'scripts/**/*.test.ts'],
  },
})
