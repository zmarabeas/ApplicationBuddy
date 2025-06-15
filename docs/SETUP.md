# Development Environment Setup

This guide provides detailed instructions for setting up the ApplicationBuddy development environment.

## Prerequisites

### Required Software
- Node.js 18 or higher
- npm 9 or higher
- Git
- Firebase CLI (optional, for local emulation)
- Chrome/Edge browser (for extension development)

### Required Accounts
- Firebase account
- Vercel account (for deployment)
- GitHub account (for version control)

## Step-by-Step Setup

### 1. Clone the Repository
```bash
git clone https://github.com/yourusername/ApplicationBuddy.git
cd ApplicationBuddy
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Environment Configuration

#### Create Environment Files
```bash
# Create .env.local for local development
cp .env.example .env.local
```

#### Required Environment Variables
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
API_URL=http://localhost:3000/api
```

### 4. Firebase Setup

1. Create a new Firebase project
2. Enable Authentication:
   - Email/Password
   - Google Sign-in
3. Set up Firestore Database
4. Configure Security Rules
5. Add your development domain to authorized domains

### 5. Development Server

Start the development server:
```bash
npm run dev
```

The application will be available at `http://localhost:3000`

### 6. Browser Extension Setup

1. Navigate to `chrome://extensions/`
2. Enable "Developer mode"
3. Click "Load unpacked"
4. Select the `extension` directory from the project
5. The extension icon should appear in your browser toolbar

## Common Issues

### Firebase Authentication
- Ensure all Firebase environment variables are correctly set
- Check that the Firebase project has the necessary services enabled
- Verify that your domain is authorized in Firebase Console

### Development Server
- If you encounter port conflicts, modify the port in `package.json`
- For API issues, check the console for detailed error messages

### Browser Extension
- If the extension fails to load, check the extension's console for errors
- Ensure the API URL is correctly configured in the extension settings

## Next Steps

After completing the setup:
1. Run the test suite: `npm test`
2. Check the API endpoints: `npm run api:test`
3. Start developing new features

## Additional Resources

- [Firebase Documentation](https://firebase.google.com/docs)
- [Next.js Documentation](https://nextjs.org/docs)
- [Chrome Extension Development](https://developer.chrome.com/docs/extensions)
- [Vercel Deployment Guide](https://vercel.com/docs) 