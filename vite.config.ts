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
    outDir: path.resolve(import.meta.dirname, "dist/public"),
    emptyOutDir: true,
    rollupOptions: {
      input: 'client/src/main.tsx',
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
          ]
        }
      }
    },
    chunkSizeWarningLimit: 500,
    minify: true
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
      'uuid'
    ]
  },
  server: {
    port: process.env.PORT ? parseInt(process.env.PORT) : 3000,
  }
});
