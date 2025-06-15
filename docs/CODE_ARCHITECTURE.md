# JobFillr Code Architecture

This document outlines the key components, files, and architecture of the JobFillr application.

## Project Structure

```
├── client/                  # Frontend React application
│   ├── src/
│   │   ├── components/      # Reusable UI components
│   │   ├── contexts/        # React Context providers
│   │   ├── hooks/           # Custom React hooks
│   │   ├── lib/             # Utility libraries
│   │   ├── pages/           # Page components
│   │   ├── App.tsx          # Main application component
│   │   └── main.tsx         # Entry point
│   └── index.html           # HTML template
├── server/                  # Backend Express server
│   ├── auth-middleware.ts   # Authentication middleware
│   ├── db.ts                # Database connection
│   ├── firestore-storage.ts # Firestore implementation
│   ├── index.ts             # Server entry point
│   ├── openai.ts            # OpenAI integration
│   ├── resumeProcessor.ts   # Resume parsing
│   ├── routes.ts            # API routes
│   ├── storage.ts           # Storage interface
│   ├── types.ts             # Type definitions
│   └── vite.ts              # Vite integration
├── shared/                  # Shared code between client and server
│   └── schema.ts            # Database schema
├── docs/                    # Project documentation
├── components.json          # Shadcn UI configuration
├── drizzle.config.ts        # Drizzle ORM configuration
├── package.json             # Project dependencies
├── postcss.config.js        # PostCSS configuration
├── tailwind.config.ts       # Tailwind CSS configuration
├── tsconfig.json            # TypeScript configuration
└── vite.config.ts           # Vite configuration
```

## Key Components

### Authentication System

**Files**:
- `client/src/contexts/AuthContext.tsx` - Client-side auth context
- `client/src/lib/firebase.ts` - Firebase client configuration
- `server/auth-middleware.ts` - Server-side authentication middleware

**Description**:  
The authentication system uses Firebase for user identity management and token-based authentication. The client uses Firebase SDK for authentication operations, while the server verifies Firebase tokens to authenticate API requests.

### Profile Management

**Files**:
- `client/src/contexts/ProfileContext.tsx` - Profile data context
- `client/src/pages/profile.tsx` - Profile page component
- `server/storage.ts` - Storage interface for profile data
- `server/firestore-storage.ts` - Firestore implementation
- `shared/schema.ts` - Data models

**Description**:  
The profile management system allows users to create and maintain their professional information including personal details, work experience, education, and skills. This information is stored in Firestore and synchronized with the client through React Context.

### Resume Processing

**Files**:
- `client/src/lib/resumeParser.ts` - Client-side resume parsing interface
- `client/src/lib/resumeUploader.ts` - Standalone resume upload utility
- `client/src/pages/resume.tsx` - Resume management page
- `server/resumeProcessor.ts` - Server-side document processing
- `server/openai.ts` - OpenAI integration for parsing

**Description**:  
The resume processing system extracts structured information from uploaded resume documents (PDF, DOCX) using OpenAI's language models. The extracted data is then used to populate the user's profile.

### API System

**Files**:
- `client/src/lib/queryClient.ts` - API client configuration
- `server/routes.ts` - API route definitions
- `server/index.ts` - Express server setup

**Description**:  
The API system provides endpoints for authentication, profile management, resume upload, and extension data access. The client uses TanStack Query for data fetching and caching.

### UI Components

**Files**:
- `client/src/components/ui/` - Base UI components
- `client/src/components/layout/` - Layout components
- `client/src/components/profile/` - Profile-specific components

**Description**:  
The UI is built using React components with Tailwind CSS for styling. Shadcn UI provides the base component library, which is extended with application-specific components.

## Data Flow

1. **Authentication Flow**:
   - User logs in via Firebase Authentication (email/password or Google)
   - Firebase returns auth token
   - Token is included in API requests to server
   - Server verifies token and identifies user

2. **Profile Update Flow**:
   - User edits profile data in UI
   - ProfileContext dispatches update action
   - API request sent to server
   - Server updates Firestore database
   - Response returned to client
   - UI updates to reflect changes

3. **Resume Upload Flow**:
   - User uploads resume file
   - File sent to server with auth token
   - Server processes file (PDF/DOCX parsing)
   - OpenAI API extracts structured data
   - Server updates user profile with extracted data
   - Response returned to client
   - UI updates to show success/failure

## Important Files

### Authentication

- `client/src/contexts/AuthContext.tsx`
  - Manages auth state
  - Provides login/logout functions
  - Stores current user information

- `server/auth-middleware.ts`
  - Verifies Firebase tokens
  - Attaches user data to request object
  - Handles authentication errors

### Database

- `shared/schema.ts`
  - Defines database schema
  - Contains Zod validation schemas
  - Exports TypeScript type definitions

- `server/firestore-storage.ts`
  - Implements database operations
  - Handles CRUD for all data types
  - Manages data relationships

### Resume Processing

- `server/openai.ts`
  - Integrates with OpenAI API
  - Defines resume parsing functions
  - Formats extracted data

- `server/resumeProcessor.ts`
  - Extracts text from documents
  - Manages file upload handling
  - Processes document formats (PDF/DOCX)

### UI

- `client/src/components/layout/PageLayout.tsx`
  - Main application layout
  - Includes sidebar navigation
  - Handles responsive design

- `client/src/components/profile/ProfileForm.tsx`
  - Form for editing profile information
  - Validates user input
  - Manages form submission

## Known Issues and Technical Debt

1. **Resume Upload Duplication**
   - Multiple components trying to update the same data
   - Context and direct API calls conflicting

2. **Firebase Security Rules**
   - Permission errors in console
   - Need to refine Firestore security rules

3. **Typescript Type Issues**
   - Some Firestore type conversions causing warnings
   - Need to align types between client and server

4. **Architecture Improvements Needed**
   - Better separation between Firebase and application logic
   - More consistent state management approach
   - Improved error handling and recovery