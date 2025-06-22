# Contributing to ApplicationBuddy

Thank you for your interest in contributing to ApplicationBuddy! This document provides guidelines and information for contributors.

## **CURRENT PROJECT STATUS**

**Phase 2 Complete** - Core platform is stable and deployed
**Phase 3 Active** - Landing page development

### **Development Phases**

- **Phase 1-2:** Core platform (COMPLETE)
- **Phase 3:** Landing page & marketing
- **Phase 4:** Browser extension
- **Phase 5:** AI enhancement
- **Phase 6:** Testing & polish
- **Phase 7:** Monetization

---

## **GETTING STARTED**

### **Prerequisites**

- Node.js 18+
- npm or yarn
- Git
- Firebase project (for testing)
- OpenAI API key (for AI features)

### **Local Setup**

```bash
# Clone the repository
git clone https://github.com/your-username/ApplicationBuddy.git
cd ApplicationBuddy

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Edit .env with your credentials

# Start development server
npm run dev
```

### **Environment Variables**

```env
# Firebase Configuration
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_CLIENT_EMAIL=your-service-account-email
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
FIREBASE_STORAGE_BUCKET=your-project-id.appspot.com

# OpenAI Configuration
OPENAI_API_KEY=sk-your-openai-api-key

# Vercel Configuration
VERCEL_URL=https://your-app.vercel.app
```

---

## **CONTRIBUTION GUIDELINES**

### **Code Standards**

#### **TypeScript**

- Use TypeScript for all new code
- Define proper interfaces and types
- Avoid `any` types - use proper typing
- Use strict mode in `tsconfig.json`

#### **React Components**

- Use functional components with hooks
- Follow React best practices
- Use proper prop typing
- Implement error boundaries where needed

#### **Styling**

- Use Tailwind CSS for styling
- Follow mobile-first responsive design
- Maintain consistent spacing and colors
- Use CSS custom properties for theming

#### **API Development**

- Use Express.js for API routes
- Implement proper error handling
- Use Zod for request validation
- Follow RESTful conventions

### **File Structure**

```
ApplicationBuddy/
├── api/                 # Backend API routes
├── client/              # Frontend React app
│   ├── src/
│   │   ├── components/  # React components
│   │   ├── pages/       # Page components
│   │   ├── hooks/       # Custom hooks
│   │   ├── lib/         # Utilities and config
│   │   └── contexts/    # React contexts
├── docs/                # Documentation
├── extension/           # Browser extension
└── shared/              # Shared types and utilities
```

### **Naming Conventions**

- **Files:** kebab-case (`user-profile.tsx`)
- **Components:** PascalCase (`UserProfile`)
- **Functions:** camelCase (`getUserProfile`)
- **Constants:** UPPER_SNAKE_CASE (`API_BASE_URL`)
- **Types/Interfaces:** PascalCase (`UserProfile`)

---

## **DEVELOPMENT WORKFLOW**

### **Branch Strategy**

```bash
# Main branch (production-ready)
main

# Development branch (integration)
develop

# Feature branches
feature/landing-page
feature/browser-extension
feature/ai-enhancement

# Bug fix branches
fix/firebase-initialization
fix/resume-parsing
```

### **Commit Message Format**

```
type(scope): description

feat(landing): add hero section with CTA
fix(api): resolve Firebase initialization error
docs(readme): update deployment instructions
style(ui): improve button hover states
refactor(auth): simplify authentication flow
test(api): add unit tests for user endpoints
```

### **Pull Request Process**

1. **Create Feature Branch**

   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Make Changes**

   - Write clean, documented code
   - Add tests if applicable
   - Update documentation

3. **Test Locally**

   ```bash
   npm run dev
   npm run build
   npm run test  # if tests exist
   ```

4. **Commit Changes**

   ```bash
   git add .
   git commit -m "feat(scope): description"
   git push origin feature/your-feature-name
   ```

5. **Create Pull Request**
   - Use the PR template
   - Describe changes clearly
   - Link related issues
   - Request reviews

---

## **TESTING GUIDELINES**

### **Frontend Testing**

- Test components in isolation
- Test user interactions
- Test responsive design
- Test accessibility features

### **API Testing**

- Test all endpoints
- Test error scenarios
- Test authentication
- Test data validation

### **Manual Testing Checklist**

- [ ] Authentication flow works
- [ ] Profile management functions
- [ ] Resume upload and parsing
- [ ] Work experience CRUD
- [ ] Education CRUD
- [ ] Skills management
- [ ] Responsive design
- [ ] Error handling

---

## **DOCUMENTATION**

### **Code Documentation**

- Use JSDoc for functions and classes
- Document complex logic
- Add inline comments for clarity
- Keep README files updated

### **API Documentation**

- Document all endpoints
- Include request/response examples
- Document error codes
- Keep API reference updated

### **User Documentation**

- Write clear user guides
- Include screenshots
- Provide troubleshooting steps
- Keep documentation current

---

## **DESIGN GUIDELINES**

### **UI/UX Principles**

- **Human-centric design** - Technology serves users
- **Reduce cognitive load** - Make complex things simple
- **Anticipate user needs** - Design natural flows
- **Build trust** - Clear actions, predictable outcomes

### **Visual Standards**

- **Colors:** Professional blues, sophisticated grays, tech accents
- **Typography:** Clean sans-serif fonts, proper hierarchy
- **Spacing:** Generous whitespace, consistent grid
- **Animations:** 200-400ms duration, natural easing

### **Accessibility**

- **Keyboard navigation** for all interactive elements
- **Screen reader compatibility** with ARIA labels
- **Color contrast** meeting WCAG standards
- **Focus indicators** that are clearly visible

---

## **BUG REPORTS**

### **Reporting Bugs**

1. **Check existing issues** - Don't duplicate
2. **Use the bug report template**
3. **Include reproduction steps**
4. **Provide environment details**
5. **Add screenshots if relevant**

### **Bug Report Template**

```markdown
## Bug Description

[Clear description of the issue]

## Steps to Reproduce

1. [Step 1]
2. [Step 2]
3. [Step 3]

## Expected Behavior

[What should happen]

## Actual Behavior

[What actually happens]

## Environment

- Browser: [Chrome/Firefox/Safari]
- OS: [Windows/Mac/Linux]
- Device: [Desktop/Mobile]

## Additional Information

[Any other relevant details]
```

---

## **FEATURE REQUESTS**

### **Requesting Features**

1. **Check existing requests** - Don't duplicate
2. **Use the feature request template**
3. **Explain the problem being solved**
4. **Describe the proposed solution**
5. **Consider implementation complexity**

### **Feature Request Template**

```markdown
## Problem Statement

[What problem does this feature solve?]

## Proposed Solution

[How should this feature work?]

## Alternative Solutions

[What other approaches were considered?]

## Additional Context

[Any other relevant information]
```

---

## **SECURITY**

### **Security Guidelines**

- **Never commit sensitive data** (API keys, passwords)
- **Use environment variables** for configuration
- **Validate all inputs** on both client and server
- **Follow OWASP guidelines** for web security
- **Report security issues** privately

### **Reporting Security Issues**

- **Email:** security@applicationbuddy.com
- **Don't create public issues** for security problems
- **Provide detailed information** about the vulnerability
- **Allow time for response** before disclosure

---

## **PERFORMANCE**

### **Performance Guidelines**

- **Optimize bundle size** - Use code splitting
- **Minimize API calls** - Use caching where appropriate
- **Optimize images** - Use appropriate formats and sizes
- **Monitor Core Web Vitals** - Ensure good user experience
- **Test on real devices** - Not just desktop

---

## **CURRENT PRIORITIES**

### **Phase 3: Landing Page (Active)**

- [ ] Modern landing page design
- [ ] Feature showcase sections
- [ ] Pricing page
- [ ] SEO optimization
- [ ] Analytics integration

### **Phase 4: Browser Extension (Next)**

- [ ] Chrome extension development
- [ ] Form auto-fill functionality
- [ ] Profile integration
- [ ] Cross-browser testing

### **Phase 5: AI Enhancement (Planned)**

- [ ] Common questions database
- [ ] Answer templates
- [ ] Cover letter generation
- [ ] Interview preparation

---

## **COMMUNICATION**

### **Communication Channels**

- **GitHub Issues** - Bug reports and feature requests
- **GitHub Discussions** - General questions and ideas
- **Pull Requests** - Code reviews and feedback
- **Email** - Security issues and private matters

### **Code Review Process**

- **Be constructive** - Provide helpful feedback
- **Be respectful** - Treat others with kindness
- **Be thorough** - Review for bugs and improvements
- **Be timely** - Respond within 48 hours

---

## **RECOGNITION**

### **Contributor Recognition**

- **Contributors list** in README
- **Special thanks** in release notes
- **Contributor badges** for significant contributions
- **Mention in blog posts** and announcements

### **Types of Contributions**

- **Code contributions** - Features, bug fixes, improvements
- **Documentation** - Guides, tutorials, API docs
- **Design** - UI/UX improvements, graphics
- **Testing** - Bug reports, testing, feedback
- **Community** - Helping others, answering questions

---

## **GETTING HELP**

### **Need Help?**

- **Check documentation** - Start with README and docs
- **Search issues** - Look for similar problems
- **Ask questions** - Use GitHub Discussions
- **Join community** - Connect with other contributors

### **Resources**

- [Project Documentation](./README.md)
- [API Reference](./API_REFERENCE.md)
- [Deployment Guide](./DEPLOYMENT.md)
- [Bug Tracker](./BUG_TRACKER.md)

---

**Thank you for contributing to ApplicationBuddy! Together, we're building the future of job applications!**
