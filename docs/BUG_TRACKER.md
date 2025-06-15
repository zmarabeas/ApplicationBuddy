# JobFillr Bug Tracker

This document tracks known bugs, their status, and attempted solutions.

## Active Bugs

### BUG-001: Resume Upload Duplication

**Priority**: High  
**Status**: Open  
**Reported**: April 2024

**Description**:  
Uploading a resume creates duplicate entries in the profile database for work experiences, education history, and skills.

**Steps to Reproduce**:
1. Log in to the application
2. Navigate to the Resume page
3. Upload a resume file (PDF or DOCX)
4. Check the Profile page to see duplicate entries

**Root Cause Analysis**:  
Multiple components attempting to update Firebase simultaneously. The issue appears to be related to:
1. ProfileContext trying to update Firebase directly
2. Server-side routes also updating the database
3. Possible race conditions during profile updates

**Attempted Solutions**:
- Isolated resume upload code from ProfileContext by creating standalone resumeUploader.ts
- Added extensive deduplication checks in server routes
- Enhanced validation for skills, work experiences, and education entries
- Added try/catch blocks in server routes to prevent cascading failures
- Modified client-side code to use a separate upload workflow

**Current Status**:  
Still occurring, likely due to deeper Firebase integration issues.

**Next Steps**:
- Refactor ProfileContext to eliminate direct Firebase calls
- Implement a transaction-based approach for database updates
- Add more comprehensive logging to track the exact sequence of events

---

### BUG-002: Firebase Permission Errors

**Priority**: Medium  
**Status**: Open  
**Reported**: April 2024

**Description**:  
Console shows "permission-denied" errors when trying to write to Firestore.

**Steps to Reproduce**:
1. Log in to the application
2. Upload a resume or make profile changes
3. Check browser console for Firebase permission errors

**Root Cause Analysis**:  
Security rules or authentication issues with Firebase. Possible causes:
1. Incorrect security rules configuration
2. Token authentication issues
3. Improper collection/document access patterns

**Attempted Solutions**:
- Verified Firebase token handling in server middleware
- Added explicit token retrieval in API calls
- Updated error handling in Firebase operations

**Current Status**:  
Ongoing. Permission errors still appear in the console.

**Next Steps**:
- Review and update Firestore security rules
- Verify Firebase project configuration
- Ensure consistent authentication across all Firebase operations

---

### BUG-003: Nested Anchor Tag Warning

**Priority**: Low  
**Status**: Open  
**Reported**: April 2024

**Description**:  
React warns about `<a>` tags being nested inside other `<a>` tags in the console.

**Steps to Reproduce**:
1. Log in to the application
2. Navigate to any page with the sidebar visible
3. Check browser console for React DOM nesting warnings

**Root Cause Analysis**:  
Navigation components in Sidebar using nested Link elements from Wouter.

**Current Status**:  
Low priority UI warning, not affecting functionality.

**Next Steps**:
- Refactor sidebar navigation components to use proper nesting
- Replace inner anchor tags with button or div elements