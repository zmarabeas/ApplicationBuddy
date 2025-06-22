import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [
    react(),
  ],
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "client", "src"),
      "@shared": path.resolve(import.meta.dirname, "shared"),
      "@assets": path.resolve(import.meta.dirname, "attached_assets"),
    },
  },
  root: path.resolve(import.meta.dirname, "client"),
  build: {
    outDir: path.resolve(import.meta.dirname, "dist", "public"),
    emptyOutDir: true,
    rollupOptions: {
      input: path.resolve(import.meta.dirname, "client", "index.html"),
      external: ['fsevents'],
      output: {
        manualChunks: {
          'vendor': [
            'react',
            'react-dom',
            '@radix-ui/react-slot',
            'class-variance-authority',
            'react-hook-form',
            '@hookform/resolvers',
            'zod',
            'date-fns',
            'lodash',
            'uuid'
          ],
          'firebase': [
            'firebase/auth',
            'firebase/firestore',
            'firebase/storage'
          ]
        }
      }
    },
    chunkSizeWarningLimit: 1000,
    minify: 'terser',
    sourcemap: false,
    target: 'es2015',
    commonjsOptions: {
      include: [/node_modules/]
    }
  },
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      '@radix-ui/react-slot',
      'class-variance-authority',
      'react-hook-form',
      '@hookform/resolvers',
      'zod',
      'date-fns',
      'lodash',
      'uuid',
      'firebase/auth',
      'firebase/firestore',
      'firebase/storage'
    ],
    exclude: ['fsevents']
  },
  server: {
    port: process.env.PORT ? parseInt(process.env.PORT) : 3000,
  }
});
