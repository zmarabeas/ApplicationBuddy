# API Reference

This document describes all backend API endpoints, their methods, request/response shapes, and notes on frontend usage. All endpoints require authentication unless otherwise noted.

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
  ...
}
```

---

## Profile

### GET `/api/profile`

- **Description:** Get the current user's profile.
- **Response:**

```json
{
  ...profile fields...
}
```

### PUT `/api/profile`

- **Description:** Update the user's profile.
- **Request:**

```json
{
  ...profile fields...
}
```

- **Response:** Updated profile object.

### PATCH `/api/profile/personal-info`

- **Description:** (Frontend expects this, backend does not implement. Consider adding.)

---

## Work Experience

### POST `/api/profile/work-experiences`

- **Description:** Add a work experience.
- **Request:**

```json
{
  ...workExperience fields...
}
```

- **Response:** Updated work experience object.

### PATCH `/api/profile/work-experiences/:id`

- **Description:** Update a work experience.
- **Request:**

```json
{
  ...workExperience fields...
}
```

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
  ...education fields...
}
```

- **Response:** Updated education object.

### PATCH `/api/profile/educations/:id`

- **Description:** Update an education.
- **Request:**

```json
{
  ...education fields...
}
```

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

- **Response:** Resume object.

### GET `/api/resumes`

- **Description:** Get all resumes for the user.
- **Response:** Array of resume objects.

### DELETE `/api/resumes/:id`

- **Description:** Delete a resume.
- **Response:** `{ "success": boolean }`

---

## Profile Reset

### POST `/api/profile/reset`

- **Description:** Reset the user's profile.
- **Response:** `{ "success": boolean }`

---

## User Data Export & Deletion

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
- **Response:** `{ "message": string }`

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
  ...answer fields...
}
```

- **Response:** Saved answer object.

### GET `/api/answers`

- **Description:** (Frontend expects this, backend does not implement. Consider adding.)

---

## Notes & TODOs

- Frontend expects `/api/resumes/upload` (POST), backend uses `/api/resume/process` (POST). Consider aligning.
- Frontend expects `/api/profile/personal-info` (PATCH), backend does not implement. Consider adding.
- Frontend expects `/api/answers` (GET), backend does not implement. Consider adding.
- All endpoints require authentication (Bearer token in Authorization header).
- Data shapes for profile, work experience, education, etc. are defined in `api/schema.js`.
