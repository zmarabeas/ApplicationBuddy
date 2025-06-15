# Deployment Guide

## Overview

ApplicationBuddy is deployed on Vercel with Firebase backend services. This guide covers the deployment process for both the web application and browser extension.

## Prerequisites

- Vercel account
- Firebase project
- GitHub repository
- Environment variables configured

## Web Application Deployment

### 1. Vercel Configuration

Create a `vercel.json` file in the root directory:

```json
{
  "buildCommand": "npm install --no-optional && npm run build",
  "installCommand": "npm install --no-optional",
  "functions": {
    "api/**/*.ts": {
      "runtime": "@vercel/node@20"
    }
  }
}
```

### 2. Environment Variables

Configure the following environment variables in Vercel:

```env
# Firebase Configuration
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_CLIENT_EMAIL=your-client-email
FIREBASE_PRIVATE_KEY=your-private-key

# Web App Configuration
NEXT_PUBLIC_FIREBASE_API_KEY=your-api-key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-auth-domain
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-storage-bucket
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
NEXT_PUBLIC_FIREBASE_APP_ID=your-app-id

# API Configuration
API_URL=https://your-domain.com/api
```

### 3. Deployment Steps

1. Connect your GitHub repository to Vercel
2. Configure build settings:
   - Framework Preset: Next.js
   - Build Command: `npm run build`
   - Output Directory: `.next`
3. Set environment variables
4. Deploy

### 4. Post-Deployment

1. Verify API endpoints
2. Check Firebase integration
3. Test authentication flow
4. Monitor error logs

## Browser Extension Deployment

### 1. Build Process

```bash
# Build the extension
npm run build:extension

# The output will be in the extension/dist directory
```

### 2. Chrome Web Store

1. Create a ZIP file of the `extension/dist` directory
2. Go to Chrome Web Store Developer Dashboard
3. Create new item
4. Upload the ZIP file
5. Fill in store listing details
6. Submit for review

### 3. Firefox Add-ons

1. Create a ZIP file of the `extension/dist` directory
2. Go to Firefox Add-ons Developer Hub
3. Submit new add-on
4. Upload the ZIP file
5. Fill in store listing details
6. Submit for review

## Firebase Configuration

### 1. Security Rules

```javascript
// firestore.rules
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    match /profiles/{profileId} {
      allow read, write: if request.auth != null;
    }
    // Add more rules as needed
  }
}
```

### 2. CORS Configuration

```javascript
// cors.json
{
  "origin": ["https://your-domain.com", "chrome-extension://*"],
  "methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  "allowedHeaders": ["Content-Type", "Authorization"],
  "maxAge": 3600
}
```

## Monitoring and Maintenance

### 1. Vercel Analytics

- Monitor deployment performance
- Track API usage
- View error logs
- Analyze user behavior

### 2. Firebase Console

- Monitor database usage
- Track authentication
- View error logs
- Analyze performance

### 3. Chrome Web Store

- Monitor extension usage
- Track user feedback
- View crash reports
- Analyze performance

## Troubleshooting

### Common Issues

1. **Build Failures**
   - Check build logs
   - Verify environment variables
   - Check dependency versions

2. **API Errors**
   - Verify Firebase configuration
   - Check CORS settings
   - Monitor error logs

3. **Authentication Issues**
   - Verify Firebase Auth settings
   - Check token handling
   - Monitor auth logs

### Debugging Steps

1. Check Vercel deployment logs
2. Monitor Firebase Console
3. Test API endpoints
4. Verify environment variables
5. Check browser console

## Rollback Procedure

### 1. Vercel Rollback

1. Go to Vercel dashboard
2. Select deployment
3. Click "..." menu
4. Choose "Redeploy"
5. Select previous version

### 2. Extension Rollback

1. Update version number
2. Build new version
3. Submit to stores
4. Wait for approval

## Best Practices

1. **Version Control**
   - Use semantic versioning
   - Tag releases
   - Maintain changelog

2. **Testing**
   - Test before deployment
   - Use staging environment
   - Monitor after deployment

3. **Security**
   - Regular security audits
   - Update dependencies
   - Monitor access logs

4. **Performance**
   - Optimize builds
   - Monitor metrics
   - Regular maintenance

## Support

For deployment issues:
1. Check Vercel documentation
2. Review Firebase guides
3. Contact support team
4. Check GitHub issues