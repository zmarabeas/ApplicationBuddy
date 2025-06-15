# JobFillr - Required Secrets and API Keys

## Environment Variables Checklist

### Firebase Configuration (Backend)
```bash
FIREBASE_PROJECT_ID=jobassist-xmxdx
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n[Your actual private key from Firebase Admin SDK JSON]\n-----END PRIVATE KEY-----"
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-fbsvc@jobassist-xmxdx.iam.gserviceaccount.com
```

### Firebase Configuration (Frontend - VITE_ prefix required)
```bash
VITE_FIREBASE_API_KEY=AIzaSyCGXXXXXXXXXXXXXXXXXXXXXXXXXXXXc5lIc
VITE_FIREBASE_AUTH_DOMAIN=jobassist-xmxdx.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=jobassist-xmxdx
VITE_FIREBASE_STORAGE_BUCKET=jobassist-xmxdx.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=593613955
VITE_FIREBASE_APP_ID=1:593613955:web:xxxxxxxxxxxxxxxxxxxxx
```

### Database
```bash
DATABASE_URL=postgresql://username:password@host:port/database
```
**Source**: Use Neon PostgreSQL (free tier available) or any PostgreSQL provider

### AI Processing
```bash
OPENAI_API_KEY=sk-proj-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```
**Source**: OpenAI Platform (platform.openai.com)

### Security
```bash
SESSION_SECRET=your-very-long-random-string-for-session-security
NODE_ENV=production
```

## How to Obtain Each Key

### Firebase Keys
1. Go to Firebase Console (console.firebase.google.com)
2. Select your project: `jobassist-xmxdx`
3. Go to Project Settings > Service Accounts
4. Generate new private key (downloads JSON file)
5. Extract values from JSON file:
   - `project_id` → FIREBASE_PROJECT_ID
   - `private_key` → FIREBASE_PRIVATE_KEY (keep \n formatting)
   - `client_email` → FIREBASE_CLIENT_EMAIL

### Frontend Firebase Config
1. Firebase Console > Project Settings > General
2. Under "Your apps" section, find web app config
3. Copy configuration values with VITE_ prefix

### Database URL
1. Sign up at Neon (neon.tech) - recommended for Vercel
2. Create new database
3. Copy connection string from dashboard
4. Format: `postgresql://user:pass@host:port/dbname`

### OpenAI API Key
1. Visit platform.openai.com
2. Sign up/login to your account
3. Go to API Keys section
4. Create new key with appropriate permissions
5. Copy the `sk-proj-` prefixed key

### Session Secret
Generate a random string (32+ characters):
```bash
# On macOS/Linux:
openssl rand -base64 32

# Or use any random string generator
```

## Verification Commands

Test each service after deployment:

```bash
# Test database connection
curl -X GET "your-domain.vercel.app/api/profile" -H "Authorization: Bearer your-token"

# Test Firebase auth
curl -X POST "your-domain.vercel.app/api/login" -d '{"email":"test@example.com","password":"password"}'

# Test OpenAI integration
curl -X POST "your-domain.vercel.app/api/upload-resume" -F "resume=@test.pdf"
```

## Security Notes

- Never commit secrets to version control
- Use Vercel environment variables dashboard
- Firebase private key must preserve \n characters
- Test all endpoints after deployment
- Enable Firebase security rules for production