const esbuild = require('esbuild');
const path = require('path');

esbuild.build({
  entryPoints: ['api/index.ts'],
  bundle: true,
  platform: 'node',
  target: 'node18',
  format: 'esm',
  outdir: 'dist',
  minify: true,
  sourcemap: true,
  external: [
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
    'react-dom'
  ],
  alias: {
    '@shared': path.resolve(__dirname, '../shared'),
    '@api': path.resolve(__dirname, './api')
  }
}).catch(() => process.exit(1)); 