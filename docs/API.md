# API Documentation

## Overview

ApplicationBuddy's API is built using Next.js API routes and provides endpoints for user management, profile operations, and browser extension integration.

## Base URL

- Development: `http://localhost:3000/api`
- Production: `https://your-domain.com/api`

## Authentication

All protected endpoints require a Firebase authentication token in the Authorization header:

```
Authorization: Bearer <firebase-token>
```

## Response Format

All API responses follow this structure:

```typescript
interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
  };
}
```

## Endpoints

### Authentication

#### POST /api/auth/signup
Create a new user account.

**Request Body:**
```typescript
{
  email: string;
  password: string;
  username: string;
}
```

**Response:**
```typescript
{
  success: true;
  data: {
    id: number;
    email: string;
    username: string;
    createdAt: string;
  }
}
```

#### POST /api/auth/login
Authenticate a user.

**Request Body:**
```typescript
{
  email: string;
  password: string;
}
```

**Response:**
```typescript
{
  success: true;
  data: {
    token: string;
    user: {
      id: number;
      email: string;
      username: string;
    }
  }
}
```

### Profile Management

#### GET /api/profile
Get user's profile data.

**Response:**
```typescript
{
  success: true;
  data: {
    id: number;
    userId: number;
    personalInfo: {
      firstName: string;
      lastName: string;
      email: string;
      phone: string;
      address: {
        street: string;
        city: string;
        state: string;
        zip: string;
        country: string;
      };
      links: {
        linkedin: string;
        github: string;
        portfolio: string;
      };
    };
    skills: string[];
    completionPercentage: number;
  }
}
```

#### POST /api/profile
Create or update profile.

**Request Body:**
```typescript
{
  personalInfo?: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    address?: {
      street: string;
      city: string;
      state: string;
      zip: string;
      country: string;
    };
    links?: {
      linkedin: string;
      github: string;
      portfolio: string;
    };
  };
  skills?: string[];
}
```

### Work Experience

#### GET /api/profile/work-experience
Get all work experiences.

**Response:**
```typescript
{
  success: true;
  data: WorkExperience[]
}
```

#### POST /api/profile/work-experience
Add work experience.

**Request Body:**
```typescript
{
  company: string;
  title: string;
  location?: string;
  startDate?: string;
  endDate?: string;
  current?: boolean;
  description?: string;
}
```

### Education

#### GET /api/profile/education
Get all education entries.

**Response:**
```typescript
{
  success: true;
  data: Education[]
}
```

#### POST /api/profile/education
Add education entry.

**Request Body:**
```typescript
{
  institution: string;
  degree: string;
  field?: string;
  startDate?: string;
  endDate?: string;
  current?: boolean;
  description?: string;
}
```

### Resume Management

#### POST /api/resume/upload
Upload and parse resume.

**Request Body:**
```typescript
FormData {
  file: File;
}
```

**Response:**
```typescript
{
  success: true;
  data: {
    id: number;
    filename: string;
    parsedData: {
      personalInfo: PersonalInfo;
      workExperiences: WorkExperience[];
      educations: Education[];
      skills: string[];
    }
  }
}
```

### Question Templates

#### GET /api/templates
Get all question templates.

**Response:**
```typescript
{
  success: true;
  data: QuestionTemplate[]
}
```

#### GET /api/templates/:category
Get templates by category.

**Response:**
```typescript
{
  success: true;
  data: QuestionTemplate[]
}
```

### User Answers

#### GET /api/answers
Get all user answers.

**Response:**
```typescript
{
  success: true;
  data: UserAnswer[]
}
```

#### POST /api/answers
Save user answer.

**Request Body:**
```typescript
{
  templateId: number;
  answer: string;
}
```

## Error Codes

| Code | Description |
|------|-------------|
| AUTH_001 | Invalid authentication token |
| AUTH_002 | Token expired |
| VAL_001 | Invalid request body |
| DB_001 | Database operation failed |
| RES_001 | Resource not found |

## Rate Limiting

- Development: 1000 requests per 15 minutes
- Production: 100 requests per 15 minutes

## Browser Extension Integration

### POST /api/extension/login
Extension-specific login endpoint.

**Request Body:**
```typescript
{
  email: string;
  password: string;
}
```

**Response:**
```typescript
{
  success: true;
  data: {
    token: string;
    user: {
      id: number;
      email: string;
    }
  }
}
```

### GET /api/extension/profile
Get profile data formatted for extension.

**Response:**
```typescript
{
  success: true;
  data: {
    personalInfo: PersonalInfo;
    workExperiences: WorkExperience[];
    educations: Education[];
    skills: string[];
    answers: UserAnswer[];
  }
}
```

## Best Practices

1. Always include error handling
2. Use appropriate HTTP methods
3. Validate request bodies
4. Implement proper authentication
5. Follow rate limiting guidelines
6. Use proper content types
7. Implement proper CORS headers

## Testing

API endpoints can be tested using the provided test suite:

```bash
npm run api:test
```

## Support

For API support or questions, please:
1. Check the documentation
2. Review error messages
3. Contact the development team 