import { defineConfig } from 'vite'
import { svelte } from '@sveltejs/vite-plugin-svelte'
import basicSsl from '@vitejs/plugin-basic-ssl'

// https://vitejs.dev/config/
export default defineConfig({
  // base: '/meshmagic/',
  server: {
    port: process.env.PORT || '5921'
  },
  // plugins: [basicSsl(), svelte()]
  plugins: [svelte()]
})
