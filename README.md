# JobFillr

A smart browser extension and web application that streamlines job applications by automatically filling out forms with your profile information.

## Project Description

JobFillr consists of two integrated components:

1. **Web Portal**: A centralized platform to manage your profile, work history, education, and skills
2. **Browser Extension**: An intelligent tool that detects and fills job application forms automatically

Key features:
- Firebase authentication (email/password and Google)
- AI-powered resume parsing with OpenAI
- Intelligent form field detection
- Dark-mode cyberpunk UI theme
- Profile data management
- Secure cross-platform integration

## Current Status

The project is fully functional with:

- ✅ Complete web portal with profile management
- ✅ Functional browser extension with form detection
- ✅ Firebase authentication integrated
- ✅ Form field auto-filling working
- ✅ Resume parsing operational

## Installation

### Prerequisites
- Node.js 18+
- Firebase account
- OpenAI API key

### Setup
1. Clone the repository
2. Run `npm install` to install dependencies
3. Configure Firebase:
   - Create a Firebase project
   - Enable Authentication (Email/Password and Google)
   - Set up Firestore Database
   - Add your application URL to authorized domains
4. Set environment variables:
   - OPENAI_API_KEY
   - FIREBASE_PRIVATE_KEY
   - FIREBASE_CLIENT_EMAIL
   - VITE_FIREBASE_API_KEY
   - VITE_FIREBASE_PROJECT_ID
   - VITE_FIREBASE_APP_ID
5. Run `npm run dev` to start the development server

## Using the Extension

1. Navigate to chrome://extensions in Chrome
2. Enable Developer Mode
3. Click "Load unpacked" and select the `extension` folder
4. Log in with your JobFillr account credentials
5. Navigate to any job application form
6. Click the extension icon
7. Use the "Scan Page" button to detect form fields
8. Click "Fill Form" to automatically fill the form with your profile data

## Documentation

For more detailed information, see the documentation in the `docs` folder:

- [Project Status](docs/PROJECT_STATUS.md)
- [Extension Development Guide](docs/EXTENSION_DEVELOPMENT.md)
- [Authentication Flow](docs/AUTHENTICATION.md)
- [Extension User Guide](docs/EXTENSION_GUIDE.md)
- [Code Architecture](docs/CODE_ARCHITECTURE.md)

## Contributing

Contributions are welcome! Please review our documentation before submitting pull requests.

## License

This project is licensed under the MIT License - see the LICENSE file for details.# ApplicationBuddy
