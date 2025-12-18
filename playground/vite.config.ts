import path from 'node:path';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
     plugins: [react()],
     resolve: {
          alias: {
               // Import the library source directly for instant HMR
               '@next-data-kit': path.resolve(__dirname, '../src/index.ts'),
               '@next-data-kit-server': path.resolve(__dirname, '../src/server/index.ts'),
          },
     },
     server: {
          port: 5173,
          strictPort: false,
          fs: {
               // Allow importing files from the parent workspace (src/)
               allow: [path.resolve(__dirname, '..')],
          },
     },
});
