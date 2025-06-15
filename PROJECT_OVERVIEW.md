# JobFillr - AI Agent Overview

## Project Architecture

JobFillr is a job application automation platform with three main components:

### 1. Web Portal (React + Express.js)
- **Frontend**: React with TypeScript, Tailwind CSS, Shadcn UI components
- **Backend**: Express.js server with Firebase Authentication
- **Database**: Firestore for data storage, Drizzle ORM for schema management
- **Routing**: Wouter (lightweight React Router alternative)
- **State Management**: TanStack React Query for server state

### 2. Browser Extension (Chrome/Firefox)
- **Architecture**: Content scripts + background workers
- **Authentication**: Syncs with web portal via Firebase tokens
- **Functionality**: Detects and auto-fills job application forms
- **Communication**: Message passing between content scripts and background

### 3. AI Processing (OpenAI Integration)
- **Resume Parsing**: Extracts structured data from PDF/DOCX files
- **Template System**: Pre-built responses for common application questions
- **Form Detection**: Intelligent field mapping for job applications

## Core Features

### User Management
- Firebase Authentication (email/password)
- User profiles with completion tracking
- GDPR/CCPA compliance (data export/deletion)

### Resume Processing
- AI-powered parsing of PDF and DOCX files
- Automatic extraction of work experience, education, skills
- Prevents duplicate data through transaction management

### Templates System
- 16+ pre-built question templates across 6 categories:
  - Work History, Skills, Education, Personal, Behavioral, Situational
- User can save personalized answers
- Supports multiple input types: text, textarea, select, radio, checkbox

### Browser Extension
- Detects form fields on job application pages
- Auto-fills using saved profile data and template answers
- Real-time form field recognition and mapping
- Secure token-based authentication

## Data Flow

1. **User Registration**: Firebase Auth → Profile Creation → Firestore
2. **Resume Upload**: File → AI Processing → Structured Data → Profile Update
3. **Template Answers**: User Input → Validation → Firestore Storage
4. **Extension Usage**: 
   - Background script authenticates with web portal
   - Content script scans page for forms
   - Retrieves user data via authenticated API calls
   - Auto-fills detected fields

## Security & Compliance

### Authentication
- Firebase Admin SDK for backend token verification
- Session management with express-session
- Rate limiting on all API endpoints (development: 1000/15min, production: 100/15min)

### Data Protection
- Firestore security rules for user data isolation
- GDPR compliance with data export/deletion APIs
- Secure file upload with type validation
- Environment-based configuration management

### API Security
- Firebase token validation on all protected routes
- Request rate limiting by IP and user
- Input validation using Zod schemas
- CORS configuration for extension compatibility

## Technology Stack

### Frontend
- React 18 with TypeScript
- Tailwind CSS + Shadcn UI components
- Wouter for routing
- TanStack React Query for data fetching
- React Hook Form with Zod validation

### Backend
- Express.js with TypeScript
- Firebase Admin SDK
- Firestore database
- Drizzle ORM for schema management
- Multer for file uploads
- OpenAI API for document processing

### Browser Extension
- Vanilla JavaScript (ES6+)
- Chrome Extension APIs
- Firebase SDK for authentication
- Custom form detection algorithms

### Development Tools
- Vite for build tooling
- TypeScript for type safety
- ESBuild for server bundling
- Drizzle Kit for database migrations

## Deployment Configuration

### Environment Variables Required
```
# Firebase
FIREBASE_PROJECT_ID, FIREBASE_PRIVATE_KEY, FIREBASE_CLIENT_EMAIL
VITE_FIREBASE_API_KEY, VITE_FIREBASE_AUTH_DOMAIN, etc.

# Database
DATABASE_URL (PostgreSQL connection string)

# AI
OPENAI_API_KEY

# Security
SESSION_SECRET, NODE_ENV
```

### Build Process
1. Frontend: Vite builds React app to `dist/`
2. Backend: ESBuild bundles Express server
3. Extension: Manual packaging for browser stores

### Vercel Deployment
- Uses `vercel.json` for routing configuration
- API routes served via serverless functions
- Static files served from `dist/` directory
- Environment variables configured in Vercel dashboard

## Key Business Logic

### Resume Processing Pipeline
1. File upload validation (PDF/DOCX only)
2. Text extraction using pdf-parse/mammoth
3. OpenAI GPT-4o parsing with structured JSON output
4. Firestore transaction to prevent duplicates
5. Profile completion percentage calculation

### Form Auto-Fill Algorithm
1. Content script scans DOM for input elements
2. Field classification using name/id/label patterns
3. Data retrieval from authenticated API endpoints
4. Smart mapping of profile data to form fields
5. User confirmation before auto-filling

### Template System
1. Categorized question templates stored in Firestore
2. User answers cached and retrievable by template ID
3. Support for multiple input types with validation
4. Integration with extension for seamless form filling

This architecture provides a scalable, secure platform for job application automation while maintaining user data privacy and regulatory compliance.