import { defineConfig } from 'vite';
import { fileURLToPath } from 'node:url';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  resolve: {
    dedupe: ['react', 'react-dom'],
    alias: [
      {
        find: '@funsaized/stet/react',
        replacement: fileURLToPath(new URL('../src/react.ts', import.meta.url)),
      },
      {
        find: '@funsaized/stet/style.css',
        replacement: fileURLToPath(new URL('../style.css', import.meta.url)),
      },
      {
        find: /^@funsaized\/stet$/,
        replacement: fileURLToPath(new URL('../src/index.ts', import.meta.url)),
      },
    ],
  },
});
