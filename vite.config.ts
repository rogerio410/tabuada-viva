/// <reference types="vitest/config" />
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'
import { defineConfig } from 'vite'
import { fileURLToPath, URL } from 'node:url'
import { CSP_META, SECURITY_HEADERS } from './config/security-headers.mjs'

const src = (p: string) => fileURLToPath(new URL(`./src/${p}`, import.meta.url))

export default defineConfig({
  plugins: [
    react(),
    {
      // CSP por <meta> só no build: o dev server do Vite injeta scripts inline (HMR).
      name: 'csp-meta',
      apply: 'build',
      transformIndexHtml: () => [
        {
          tag: 'meta',
          attrs: { 'http-equiv': 'Content-Security-Policy', content: CSP_META },
          injectTo: 'head-prepend',
        },
      ],
    },
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
        icons: [
          { src: 'icons/icon-192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
          { src: 'icons/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
          { src: 'icons/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
          { src: 'favicon.svg', sizes: 'any', type: 'image/svg+xml', purpose: 'any' },
        ],
      },
      workbox: { globPatterns: ['**/*.{js,css,html,svg,webp,woff2}'] },
    }),
  ],
  // O preview serve o build com os mesmos cabeçalhos da Vercel (usados pelo e2e).
  preview: { headers: Object.fromEntries(SECURITY_HEADERS) },
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
    include: ['src/**/*.test.{ts,tsx}', 'scripts/**/*.test.ts', 'config/**/*.test.ts'],
  },
})
