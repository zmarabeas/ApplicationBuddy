# Deployment Guide

This guide covers the deployment process for ApplicationBuddy on Vercel with Firebase integration.

## **CURRENT STATUS: SUCCESSFULLY DEPLOYED**

ApplicationBuddy is currently deployed and running on Vercel with all features working correctly.

**Live URL:** `https://application-buddy.vercel.app` (or your custom domain)

---

## **DEPLOYMENT OVERVIEW**

### **Architecture**

- **Frontend:** React + Vite deployed on Vercel
- **Backend:** Serverless API functions on Vercel
- **Database:** Firebase Firestore
- **Storage:** Firebase Storage
- **Authentication:** Firebase Auth

### **Deployment Stack**

- **Platform:** Vercel
- **Build Tool:** Vite 4.5.0
- **Runtime:** Node.js 18.x
- **Package Manager:** npm

---

## **PREREQUISITES**

### **Required Accounts**

- [Vercel Account](https://vercel.com)
- [Firebase Project](https://firebase.google.com)
- [OpenAI API Key](https://platform.openai.com)

### **Required Tools**

- Node.js 18+
- npm or yarn
- Git

---

## **ENVIRONMENT SETUP**

### **1. Firebase Configuration**

Create a new Firebase project and enable the following services:

#### **Authentication**

- Enable Email/Password authentication
- Enable Google authentication (optional)
- Configure authorized domains

#### **Firestore Database**

- Create database in production mode
- Set up security rules
- Configure indexes for queries

#### **Storage**

- Create storage bucket
- Set up security rules
- Configure CORS if needed

### **2. Environment Variables**

Create a `.env` file in the root directory:

```env
# Firebase Configuration
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_CLIENT_EMAIL=your-service-account-email
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
FIREBASE_STORAGE_BUCKET=your-project-id.appspot.com

# OpenAI Configuration
OPENAI_API_KEY=sk-your-openai-api-key

# Vercel Configuration
VERCEL_URL=https://your-app.vercel.app
```

### **3. Firebase Service Account**

1. Go to Firebase Console → Project Settings → Service Accounts
2. Click "Generate New Private Key"
3. Download the JSON file
4. Extract the required values for environment variables

---

## **DEPLOYMENT STEPS**

### **1. Local Development Setup**

```bash
# Clone the repository
git clone https://github.com/your-username/ApplicationBuddy.git
cd ApplicationBuddy

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Edit .env with your actual values

# Test locally
npm run dev
```

### **2. Vercel Deployment**

#### **Option A: Vercel CLI**

```bash
# Install Vercel CLI
npm i -g vercel

# Login to Vercel
vercel login

# Deploy
vercel --prod
```

#### **Option B: GitHub Integration**

1. Push code to GitHub
2. Connect repository to Vercel
3. Configure environment variables in Vercel dashboard
4. Deploy automatically on push

### **3. Environment Variables in Vercel**

Add all environment variables to Vercel dashboard:

1. Go to Vercel Dashboard → Your Project → Settings → Environment Variables
2. Add each variable from your `.env` file
3. Ensure they're set for Production, Preview, and Development

### **4. Build Configuration**

The project uses the following build configuration:

```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "client/dist",
  "installCommand": "npm install",
  "framework": "vite"
}
```

---

## **VERIFICATION STEPS**

### **1. Health Check**

```bash
curl https://your-app.vercel.app/api/health
```

Expected response:

```json
{
  "status": "healthy",
  "message": "ApplicationBuddy API with Firebase",
  "timestamp": "2025-01-24T...",
  "firebase": "initialized"
}
```

### **2. Authentication Test**

1. Visit the deployed URL
2. Try to sign up/sign in
3. Verify Firebase authentication works

### **3. API Endpoints Test**

```bash
# Test with authentication token
curl -H "Authorization: Bearer YOUR_TOKEN" \
     https://your-app.vercel.app/api/profile
```

### **4. Resume Upload Test**

1. Upload a PDF resume
2. Verify parsing works
3. Check Firebase Storage

---

## **TROUBLESHOOTING**

### **Common Issues**

#### **Build Failures**

- **Issue:** Rollup native dependency errors
- **Solution:** Use Vite 4.5.0 (already configured)

#### **Firebase Initialization**

- **Issue:** Firebase app duplicate initialization
- **Solution:** Proper initialization in `firestore-storage.ts`

#### **Missing Dependencies**

- **Issue:** `multer` or `@google-cloud/firestore` not found
- **Solution:** All dependencies are in `package.json`

#### **Environment Variables**

- **Issue:** Variables not accessible in production
- **Solution:** Add to Vercel dashboard environment variables

### **Debug Commands**

```bash
# Check build logs
vercel logs

# Check function logs
vercel logs --function api/index

# Test API locally
npm run dev

# Check environment variables
echo $FIREBASE_PROJECT_ID
```

---

## **MONITORING**

### **Vercel Analytics**

- Function execution times
- Error rates
- Performance metrics

### **Firebase Console**

- Authentication usage
- Firestore queries
- Storage usage

### **Custom Logging**

```javascript
// Add to API functions
console.log("Request:", req.body);
console.log("User:", req.user);
```

---

## **UPDATES & MAINTENANCE**

### **Deploying Updates**

```bash
# Make changes locally
git add .
git commit -m "Update description"
git push

# Vercel will auto-deploy if connected to GitHub
# Or deploy manually:
vercel --prod
```

### **Database Migrations**

- Firestore schema changes are backward compatible
- No manual migration needed
- Update security rules as needed

### **Environment Variable Updates**

1. Update in Vercel dashboard
2. Redeploy if necessary
3. Test functionality

---

## **SECURITY CONSIDERATIONS**

### **Firebase Security Rules**

```javascript
// Firestore rules
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

### **API Security**

- JWT token validation
- CORS configuration
- Input validation with Zod
- Rate limiting (consider adding)

### **Environment Variables**

- Never commit `.env` files
- Use Vercel dashboard for production
- Rotate API keys regularly

---

## **SCALING CONSIDERATIONS**

### **Current Limits**

- Vercel: 10GB bandwidth/month (free tier)
- Firebase: 50,000 reads/day (free tier)
- OpenAI: Rate limits apply

### **Scaling Strategies**

- Implement caching
- Add CDN for static assets
- Optimize database queries
- Consider paid tiers for higher limits

---

## **NEXT STEPS**

### **Phase 3: Landing Page**

- Deploy marketing pages
- Add analytics tracking
- Implement SEO optimization

### **Phase 4: Browser Extension**

- Deploy extension to Chrome Web Store
- Set up extension API endpoints
- Configure cross-origin requests

### **Phase 7: Monetization**

- Add payment processing
- Implement usage tracking
- Set up subscription management

---

## **SUPPORT**

### **Deployment Issues**

- Check Vercel documentation
- Review Firebase console
- Check build logs

### **Development Issues**

- Review this documentation
- Check GitHub issues
- Contact development team

---

**Deployment Complete - Ready for Phase 3!**
