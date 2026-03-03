import { defineConfig } from 'astro/config';
import node from '@astrojs/node';
import svelte from '@astrojs/svelte';
import tailwindcss from '@tailwindcss/vite';
import Icons from 'unplugin-icons/vite';

export default defineConfig({
  output: 'server',
  adapter: node({
    mode: 'standalone'
  }),
  integrations: [
    svelte()
  ],
  vite: {
    plugins: [
      tailwindcss(),
      Icons({
        compiler: 'svelte',
        autoInstall: true, // This is the MVP move—it fetches icon sets as you import them
      }),
    ]
  },
  server: {
    host: true
  }
});