import { defineConfig } from 'vite'
import { svelte } from '@sveltejs/vite-plugin-svelte'

// https://vitejs.dev/config/
export default defineConfig({
  // base: '/meshmagic/',
  server: {
    port: process.env.PORT || '5921'
  },
  plugins: [svelte()]
})
