# JobFillr Extension

The JobFillr Chrome extension automates the process of filling out job applications, leveraging your profile data from the JobFillr web application.

## Features

- **Auto-detect form fields** in job applications
- **Auto-fill forms** with your profile data
- **Smart field matching** using machine learning to identify the appropriate information for each field
- **Authentication** with JobFillr web application
- **Profile caching** for offline functionality
- **User-friendly interface** with confidence indicators and visual feedback

## Testing the Extension

There are two ways to test the JobFillr extension:

### 1. Loading in Chrome

1. In Chrome, go to `chrome://extensions/`
2. Enable "Developer mode" using the toggle in the top-right corner
3. Click "Load unpacked" and select the `extension` folder from this project
4. The extension should now appear in your extensions list
5. Click the extension icon to open the popup
6. Log in using your JobFillr credentials

### 2. Using the Test Form

For testing the form detection and field filling functionality:

1. Make sure you're logged into the JobFillr web application
2. Open the test form at `http://localhost:[port]/test-form.html`
3. Open the extension popup
4. Click "Scan Page" to detect form fields
5. Review the detected fields and their confidence ratings
6. Click "Fill Form" to automatically populate the fields with your profile data

## Extension Structure

- **popup/** - User interface that appears when clicking the extension icon
- **content/** - Scripts that run on webpage context for field detection and form filling
- **background/** - Service worker for authentication and state management
- **icons/** - Extension icons in various sizes

## Development Notes

- The extension uses service workers rather than background pages (Chrome Manifest V3)
- Communication between components uses message passing
- For security, API keys and tokens are stored in Chrome's secure storage
- Form field detection uses heuristic patterns and machine learning for matching
- Custom caching mechanism implements offline functionality with expiration

## Troubleshooting

- **Extension not loading**: Verify the manifest.json file is correct
- **Authentication issues**: Check the console for error messages; tokens may have expired
- **Form detection problems**: Try reloading the page or using a different job application form
- **Field mapping issues**: The extension works best with standard form layouts; custom or unusual forms may have lower match confidence