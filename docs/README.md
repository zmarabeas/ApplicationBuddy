# ApplicationBuddy

A comprehensive job application automation platform with web portal and browser extension integration.

## Project Overview

ApplicationBuddy is a full-stack application that helps users automate their job application process through:
- A NextJS web portal for profile management and data storage
- A browser extension for form auto-filling
- Firebase backend for authentication and data storage
- Vercel deployment for the web application

## Quick Start

### Prerequisites
- Node.js 18+
- npm 9+
- Firebase account
- Vercel account (for deployment)

### Development Setup
1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Set up environment variables:
   ```bash
   cp .env.example .env.local
   ```
4. Configure Firebase credentials in `.env.local`
5. Start the development server:
   ```bash
   npm run dev
   ```

## Project Structure

```
ApplicationBuddy/
├── api/                 # API routes and server logic
├── components/         # React components
├── docs/              # Project documentation
├── public/            # Static assets
└── src/               # Source code
```

## Documentation

- [Setup Guide](SETUP.md) - Detailed setup instructions
- [Architecture](ARCHITECTURE.md) - System design and decisions
- [API Documentation](API.md) - API endpoints and usage
- [Deployment Guide](DEPLOYMENT.md) - Deployment process
- [Troubleshooting](TROUBLESHOOTING.md) - Common issues and solutions
- [Development Guide](DEVELOPMENT.md) - Development workflows
- [Changelog](CHANGELOG.md) - Recent changes and progress

## Current Status

### Completed
- ✅ Firebase integration and authentication
- ✅ Basic API endpoints implementation
- ✅ Data storage with Firestore
- ✅ Browser extension foundation
- ✅ Deployment configuration fixes
- ✅ API bug resolutions
- ✅ Codebase cleanup

### In Progress
- 🔄 Home page development
- 🔄 Enhanced form detection
- 🔄 Profile completion tracking

### Next Steps
- Implement home page design
- Enhance browser extension functionality
- Add more template questions
- Improve form field detection accuracy

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.