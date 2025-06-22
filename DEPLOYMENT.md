# JobFillr Vercel Deployment Guide

## Required Environment Variables

### Firebase Configuration

```
FIREBASE_PROJECT_ID=jobassist-xmxdx
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n[Your Firebase Admin SDK Private Key]\n-----END PRIVATE KEY-----"
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-fbsvc@jobassist-xmxdx.iam.gserviceaccount.com
```

### Firebase Client Configuration (Frontend)

```
VITE_FIREBASE_API_KEY=AIzaSyCGXXXXXXXXXXXXXXXXXXXXXXXXXXXXc5lIc
VITE_FIREBASE_AUTH_DOMAIN=jobassist-xmxdx.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=jobassist-xmxdx
VITE_FIREBASE_STORAGE_BUCKET=jobassist-xmxdx.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=593613955
VITE_FIREBASE_APP_ID=1:593613955:web:xxxxxxxxxxxxxxxxxxxxx
```

### Database

```
DATABASE_URL=postgresql://username:password@host:port/database
```

### OpenAI

```
OPENAI_API_KEY=sk-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

### Session Security

```
SESSION_SECRET=your-super-secure-random-session-secret-here
```

### Node Environment

```
NODE_ENV=production
```

## Deployment Steps

### 1. Database Setup

- Use Neon PostgreSQL (recommended for Vercel)
- Create a new database on Neon
- Copy the connection string to `DATABASE_URL`
- Run `npm run db:push` to set up tables

### 2. Firebase Setup

- Download your Firebase Admin SDK JSON file
- Extract the `private_key`, `client_email`, and `project_id`
- Set up Firebase Authentication in your Firebase console
- Enable Email/Password authentication

### 3. Vercel Configuration

- Connect your GitHub repository to Vercel
- Add all environment variables in Vercel dashboard
- Set build command: `npm run vercel-build`
- Set output directory: `dist/public`
- Framework preset: Other

### 4. Domain Setup

- Configure your custom domain in Vercel
- Update Firebase authorized domains to include your Vercel domain

## Recent Fixes Applied

### Rollup Dependency Issue

- Added `.npmrc` file to disable optional dependencies
- Updated `package.json` with Rollup overrides
- Removed Replit-specific dependencies
- Fixed Vite configuration for Vercel deployment

### API Routes

- Removed `/api/` prefix from routes (Vercel serverless functions)
- Updated Firebase initialization for proper environment variables
- Converted Express app to export default for serverless functions

### Build Configuration

- Updated build scripts to only build client-side code
- Fixed Vercel configuration with proper build commands
- Removed server-side build dependencies

## Browser Extension Deployment

### Chrome Web Store

1. Update `extension/manifest.json` with your production API URL
2. Replace localhost references with your Vercel domain
3. Package extension as ZIP file
4. Submit to Chrome Web Store

### Firefox Add-ons

1. Update manifest for Firefox compatibility
2. Replace API URLs with production endpoints
3. Submit to Firefox Add-ons marketplace

## Build Configuration

The project uses:

- Vite for frontend bundling
- Express.js serverless functions on Vercel
- TypeScript compilation
- Tailwind CSS processing

## Post-Deployment Verification

1. Test user registration/login
2. Verify resume upload functionality
3. Test template system
4. Check browser extension connectivity
5. Validate GDPR compliance features

## Troubleshooting

### If you still get Rollup errors:

1. Delete `node_modules` and `package-lock.json`
2. Run `npm install`
3. Deploy again

### If API calls fail:

1. Check environment variables in Vercel dashboard
2. Verify Firebase configuration
3. Check Vercel function logs for errors
