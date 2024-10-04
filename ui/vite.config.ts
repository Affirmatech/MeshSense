import { defineConfig } from 'vite'
import { svelte } from '@sveltejs/vite-plugin-svelte'
import basicSsl from '@vitejs/plugin-basic-ssl'
import 'dotenv/config'

// https://vitejs.dev/config/
export default defineConfig({
  base: process.env.VITE_PATH,
  server: {
    port: process.env.PORT || '5921'
  },
  build: {
    sourcemap: true
  },
  // plugins: [basicSsl(), svelte()]
  plugins: [svelte()]
})
