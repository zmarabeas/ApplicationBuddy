/**
 * JobFillr Extension Configuration
 * 
 * This file contains environment-specific configuration for the extension.
 * Update this when deploying to different environments.
 */

// API Base URL - Change this when deploying to a different environment
const API_BASE_URL = 'https://ece6e3aa-b3d7-4dac-9300-c79387fa4329-00-13be6h49tpe41.janeway.replit.dev';

// Web App URL - typically the same as API_BASE_URL
const WEB_APP_URL = API_BASE_URL;

// API Timeout in milliseconds
const API_TIMEOUT = 10000; // 10 seconds

// Debug mode flag
const DEBUG = true;

// Version information
const VERSION = '1.0.0';

// Export configuration
export {
  API_BASE_URL,
  WEB_APP_URL,
  API_TIMEOUT,
  DEBUG,
  VERSION
};