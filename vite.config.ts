import { defineConfig, type ConfigEnv, type UserConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import runtimeErrorOverlay from "@replit/vite-plugin-runtime-error-modal";

// Common configuration
const commonConfig: UserConfig = {
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "client", "src"),
      "@shared": path.resolve(import.meta.dirname, "shared"),
      "@assets": path.resolve(import.meta.dirname, "attached_assets"),
      "@api": path.resolve(import.meta.dirname, "api"),
    },
  },
};

// Client-side configuration
const clientConfig: UserConfig = {
  ...commonConfig,
  plugins: [
    react(),
    runtimeErrorOverlay(),
    ...(process.env.NODE_ENV !== "production" &&
    process.env.REPL_ID !== undefined
      ? [
          await import("@replit/vite-plugin-cartographer").then((m) =>
            m.cartographer(),
          ),
        ]
      : []),
  ],
  root: path.resolve(import.meta.dirname, "client"),
  build: {
    outDir: path.resolve(import.meta.dirname, "dist/public"),
    emptyOutDir: true,
    rollupOptions: {
      input: 'client/src/main.tsx',
      external: ['fsevents'],
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom'],
          'ui-components': [
            '@mui/material',
            '@mui/icons-material',
            '@emotion/react',
            '@emotion/styled'
          ],
          'form-components': [
            'react-hook-form',
            '@hookform/resolvers',
            'zod'
          ],
          'utils': [
            'date-fns',
            'lodash',
            'uuid'
          ]
        }
      }
    },
    chunkSizeWarningLimit: 500,
    minify: 'terser' as const,
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true
      }
    }
  },
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      '@mui/material',
      '@mui/icons-material',
      '@emotion/react',
      '@emotion/styled',
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
};

// Server-side configuration
const serverConfig: UserConfig = {
  ...commonConfig,
  build: {
    outDir: path.resolve(import.meta.dirname, "dist"),
    emptyOutDir: true,
    rollupOptions: {
      input: 'api/index.ts',
      external: (id) => id.includes('pkg') || id === 'fsevents' || [
        'firebase',
        'firebase-admin',
        'firebase/auth',
        'firebase/firestore',
        'firebase/storage',
        'express',
        'cors',
        'express-rate-limit',
        'multer',
        'openai',
        'pdf-parse',
        'mammoth',
        '@mui/material',
        '@mui/icons-material',
        '@emotion/react',
        '@emotion/styled',
        'react',
        'react-dom',
        'drizzle-orm',
        'drizzle-zod',
        'zod',
        'pg',
        'path',
        'fs',
        'crypto',
        'stream',
        'util',
        'url',
        'http',
        'https',
        'os',
        'net',
        'tls',
        'zlib',
        'events',
        'buffer',
        'string_decoder',
        'querystring',
        'punycode',
        'dns',
        'dgram',
        'child_process',
        'cluster',
        'module',
        'vm',
        'constants',
        'assert',
        'timers',
        'domain',
        'process'
      ].includes(id),
      output: {
        format: 'esm',
        dir: 'dist'
      }
    }
  },
  optimizeDeps: {
    include: ['@shared/schema']
  }
};

// Export the appropriate config based on the build target
export default defineConfig(({ command, mode }: ConfigEnv): UserConfig => {
  if (command === 'build' && mode === 'production') {
    return serverConfig;
  }
  return clientConfig;
});
