# Deployment Guide - ApplicationBuddy

This guide covers deploying ApplicationBuddy to Vercel with Firebase integration.

## Prerequisites

1. **Vercel Account** - Sign up at [vercel.com](https://vercel.com)
2. **Firebase Project** - Create at [firebase.google.com](https://firebase.google.com)
3. **GitHub Repository** - Push your code to GitHub

## Firebase Setup

### 1. Create Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Click "Add project"
3. Enter project name (e.g., "application-buddy")
4. Enable Google Analytics (optional)
5. Click "Create project"

### 2. Enable Authentication

1. In Firebase Console, go to "Authentication" → "Sign-in method"
2. Enable "Google" provider
3. Add your domain to authorized domains
4. Configure OAuth consent screen if needed

### 3. Create Firestore Database

1. Go to "Firestore Database" → "Create database"
2. Choose "Start in test mode" (we'll secure it later)
3. Select a location close to your users
4. Click "Done"

### 4. Get Firebase Configuration

1. Go to "Project settings" → "Your apps"
2. Click "Add app" → "Web"
3. Register app with a nickname
4. Copy the configuration object

### 5. Generate Service Account Key

1. Go to "Project settings" → "Service accounts"
2. Click "Generate new private key"
3. Download the JSON file
4. **Keep this secure** - it contains sensitive credentials

## Environment Variables

Set these environment variables in your Vercel project:

### Firebase Configuration

```bash
# Firebase Admin SDK (from service account JSON)
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_CLIENT_EMAIL=your-service-account-email
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
FIREBASE_STORAGE_BUCKET=your-project-id.appspot.com

# Firebase Client SDK (from web app config)
VITE_FIREBASE_API_KEY=your-api-key
VITE_FIREBASE_AUTH_DOMAIN=your-project-id.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project-id.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
VITE_FIREBASE_APP_ID=your-app-id
```

### OpenAI Configuration (for resume parsing)

```bash
OPENAI_API_KEY=your-openai-api-key
```

### Session Configuration

```bash
SESSION_SECRET=your-random-session-secret
```

## Vercel Deployment

### 1. Connect Repository

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click "New Project"
3. Import your GitHub repository
4. Select the repository

### 2. Configure Build Settings

Vercel will auto-detect the configuration, but verify these settings:

- **Framework Preset:** Vite
- **Build Command:** `npx vite build --config vite.config.ts`
- **Output Directory:** `dist/public`
- **Install Command:** `npm install`

### 3. Set Environment Variables

1. In project settings, go to "Environment Variables"
2. Add all the environment variables listed above
3. Make sure to set them for "Production", "Preview", and "Development"

### 4. Deploy

1. Click "Deploy"
2. Wait for build to complete
3. Check build logs for any errors

## Post-Deployment Setup

### 1. Update Firebase Security Rules

In Firebase Console, go to "Firestore Database" → "Rules" and update:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Allow authenticated users to access their own data
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == resource.data.firebaseUID;
    }

    match /profiles/{profileId} {
      allow read, write: if request.auth != null;
    }

    match /workExperiences/{expId} {
      allow read, write: if request.auth != null;
    }

    match /educations/{eduId} {
      allow read, write: if request.auth != null;
    }

    match /resumes/{resumeId} {
      allow read, write: if request.auth != null;
    }

    match /questionTemplates/{templateId} {
      allow read: if request.auth != null;
    }

    match /userAnswers/{answerId} {
      allow read, write: if request.auth != null;
    }
  }
}
```

### 2. Update Authorized Domains

1. In Firebase Console, go to "Authentication" → "Settings"
2. Add your Vercel domain to "Authorized domains"
3. Format: `your-app.vercel.app`

### 3. Test Authentication

1. Visit your deployed app
2. Try signing in with Google
3. Verify user creation in Firestore
4. Test API endpoints

## Troubleshooting

### Build Errors

**Rollup Native Dependency Error:**

```
Error: Cannot find module '@rollup/rollup-linux-x64-gnu'
```

- **Solution:** We've fixed this by using Vite 4.5.0 and proper `.npmrc` configuration

**Firebase Import Error:**

```
Rollup failed to resolve import "firebase/auth"
```

- **Solution:** Ensure `firebase` dependency is in `package.json`

### Runtime Errors

**Authentication Errors:**

- Check Firebase configuration in environment variables
- Verify authorized domains in Firebase Console
- Check service account credentials

**Database Errors:**

- Verify Firestore security rules
- Check service account permissions
- Ensure database is created and accessible

**CORS Errors:**

- Verify CORS configuration in API
- Check domain settings in Firebase

### Common Issues

1. **Environment Variables Not Set:**

   - Double-check all variables are set in Vercel
   - Ensure no typos in variable names

2. **Firebase Private Key Format:**

   - Make sure to include the `\n` characters
   - Wrap in quotes in Vercel environment variables

3. **Domain Issues:**
   - Add Vercel domain to Firebase authorized domains
   - Check for typos in domain names

## Monitoring

### Vercel Analytics

1. Enable Vercel Analytics in project settings
2. Monitor build performance and errors
3. Track function execution times

### Firebase Monitoring

1. Use Firebase Console to monitor:
   - Authentication usage
   - Firestore read/write operations
   - Storage usage
   - Function invocations

### Error Tracking

1. Check Vercel function logs for API errors
2. Monitor Firebase Console for authentication issues
3. Use browser developer tools for frontend errors

## Security Considerations

1. **Environment Variables:** Never commit sensitive data to Git
2. **Firebase Rules:** Regularly review and update security rules
3. **API Keys:** Rotate keys periodically
4. **CORS:** Restrict to specific domains in production
5. **Rate Limiting:** Consider implementing rate limiting for API endpoints

## Performance Optimization

1. **Caching:** Implement caching for static assets
2. **CDN:** Vercel provides global CDN automatically
3. **Database:** Use Firestore indexes for complex queries
4. **Images:** Optimize images and use appropriate formats

## Backup and Recovery

1. **Database:** Firestore provides automatic backups
2. **Code:** Use Git for version control
3. **Environment:** Document all environment variables
4. **Configuration:** Keep Firebase configuration backed up

## Support

For issues:

1. Check Vercel build logs
2. Review Firebase Console for errors
3. Check browser developer tools
4. Review this documentation
5. Check GitHub issues for known problems
