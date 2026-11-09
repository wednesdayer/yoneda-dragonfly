import { defineConfig } from 'vite';

export default defineConfig({
  server: { port: 5199, open: false },
  worker: { format: 'es' },
  build: { target: 'es2022' },
});
