# API Reference

This document describes all backend API endpoints, their methods, request/response shapes, and notes on frontend usage. All endpoints require authentication unless otherwise noted.

---

## Authentication

All endpoints require a valid Firebase ID token in the Authorization header:

```
Authorization: Bearer <firebase-id-token>
```

---

## User

### GET `/api/user`

- **Description:** Get the current user profile.
- **Response:**

```json
{
  "id": number,
  "uid": string,
  "email": string,
  "username": string,
  "displayName": string,
  "photoURL": string | null,
  "authProvider": string,
  "createdAt": string,
  "updatedAt": string,
  "lastLogin": string | null
}
```

### GET `/api/user/export-data`

- **Description:** Export all user data.
- **Response:**

```json
{
  "profile": {...},
  "workExperiences": [...],
  "educations": [...],
  "resumes": [...],
  "answers": [...]
}
```

### POST `/api/user/delete-account`

- **Description:** Delete the user's account and data.
- **Response:** `{ "message": "Account deleted successfully" }`

---

## Profile

### GET `/api/profile`

- **Description:** Get the current user's profile.
- **Response:**

```json
{
  "id": number,
  "userId": number,
  "personalInfo": {
    "firstName": string,
    "lastName": string,
    "email": string,
    "phone": string,
    "address": {
      "street": string,
      "city": string,
      "state": string,
      "zip": string,
      "country": string
    },
    "links": {
      "linkedin": string,
      "github": string,
      "portfolio": string
    }
  },
  "skills": string[],
  "completionPercentage": number,
  "createdAt": string,
  "updatedAt": string
}
```

### PUT `/api/profile`

- **Description:** Update the user's profile.
- **Request:** Profile object (partial updates supported)
- **Response:** Updated profile object.

### POST `/api/profile/reset`

- **Description:** Reset the user's profile (clear all data).
- **Response:** `{ "success": boolean }`

---

## Work Experience

### POST `/api/profile/work-experiences`

- **Description:** Add a work experience.
- **Request:**

```json
{
  "company": string,
  "title": string,
  "location": string,
  "startDate": string,
  "endDate": string,
  "current": boolean,
  "description": string
}
```

- **Response:** Created work experience object with ID.

### PATCH `/api/profile/work-experiences/:id`

- **Description:** Update a work experience.
- **Request:** Work experience object (partial updates supported)
- **Response:** Updated work experience object.

### DELETE `/api/profile/work-experiences/:id`

- **Description:** Delete a work experience.
- **Response:** `{ "success": boolean }`

---

## Education

### POST `/api/profile/educations`

- **Description:** Add an education.
- **Request:**

```json
{
  "institution": string,
  "degree": string,
  "field": string,
  "startDate": string,
  "endDate": string,
  "current": boolean,
  "description": string
}
```

- **Response:** Created education object with ID.

### PATCH `/api/profile/educations/:id`

- **Description:** Update an education.
- **Request:** Education object (partial updates supported)
- **Response:** Updated education object.

### DELETE `/api/profile/educations/:id`

- **Description:** Delete an education.
- **Response:** `{ "success": boolean }`

---

## Skills

### PATCH `/api/profile/skills`

- **Description:** Update skills array.
- **Request:**

```json
{
  "skills": ["string", ...]
}
```

- **Response:** Updated profile object.

---

## Resume

### POST `/api/resume/process`

- **Description:** Upload and process a resume.
- **Request:**

```json
{
  "file": string, // base64 or file data
  "fileType": string
}
```

- **Response:** Resume object with parsed data.

### GET `/api/resumes`

- **Description:** Get all resumes for the user.
- **Response:** Array of resume objects.

### DELETE `/api/resumes/:id`

- **Description:** Delete a resume.
- **Response:** `{ "success": boolean }`

---

## Questions & Answers

### GET `/api/questions`

- **Description:** Get all question templates.
- **Response:** Array of question template objects.

### POST `/api/answers`

- **Description:** Save a user answer.
- **Request:**

```json
{
  "templateId": number,
  "answer": any
}
```

- **Response:** Saved answer object.

### GET `/api/answers`

- **Description:** Get all user answers.
- **Response:** Array of user answer objects.

---

## System

### GET `/api/health`

- **Description:** Health check endpoint.
- **Response:**

```json
{
  "status": "healthy",
  "message": "ApplicationBuddy API with Firebase",
  "timestamp": string,
  "firebase": "initialized" | "not configured"
}
```

### GET `/api/templates`

- **Description:** Get question templates (alias for /api/questions).
- **Response:** Array of question template objects.

---

## Error Responses

All endpoints return consistent error responses:

```json
{
  "message": "Error description",
  "error": "Detailed error message"
}
```

Common HTTP status codes:

- `400` - Bad Request (validation errors)
- `401` - Unauthorized (invalid or missing token)
- `404` - Not Found (resource doesn't exist)
- `500` - Internal Server Error

---

## Authentication Flow

1. **Frontend Authentication:** User signs in with Firebase Auth (Google, email/password, etc.)
2. **Token Generation:** Firebase provides an ID token
3. **API Requests:** Frontend includes token in Authorization header
4. **Backend Verification:** Server verifies token with Firebase Admin SDK
5. **User Resolution:** Server maps Firebase UID to database user (auto-creates if needed)
6. **Request Processing:** Server processes request with authenticated user context

---

## Data Validation

All request bodies are validated using Zod schemas:

- `personalInfoSchema` - Personal information validation
- `workExperienceSchema` - Work experience validation
- `educationSchema` - Education validation
- `profileSchema` - Profile validation
- `questionTemplateSchema` - Question template validation
- `userAnswerSchema` - User answer validation

---

## Firebase Integration

- **Authentication:** Firebase Auth for user authentication
- **Database:** Firestore for data storage
- **Storage:** Firebase Storage for file uploads (resumes)
- **Admin SDK:** Backend uses Firebase Admin for token verification and database access
- **Client SDK:** Frontend uses Firebase client for authentication and token management
