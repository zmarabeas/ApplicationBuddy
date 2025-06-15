/**
 * JobFillr Extension API Utilities
 * Utilities for making API calls with proper error handling and timeouts
 */

import { LOG_SOURCES, startOperation, endOperation, failOperation } from './logger.js';
import { API_BASE_URL, API_TIMEOUT } from '../config.js';

/**
 * Make an API request with timeout handling
 * 
 * @param {string} endpoint - The API endpoint (without base URL)
 * @param {Object} options - Fetch options
 * @param {string} operationName - Name of the operation for logging
 * @returns {Promise<Object>} The response data
 */
async function apiRequest(endpoint, options = {}, operationName = 'API Request') {
  const url = `${API_BASE_URL}${endpoint}`;
  
  startOperation(LOG_SOURCES.UTILS, `${operationName} to ${endpoint}`);
  
  // Create an AbortController to handle timeouts
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), API_TIMEOUT);
  
  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      }
    });
    
    clearTimeout(timeoutId);
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`API error (${response.status}): ${errorText}`);
    }
    
    const data = await response.json();
    endOperation(LOG_SOURCES.UTILS, `${operationName} to ${endpoint}`, { status: response.status });
    return data;
  } catch (error) {
    if (error.name === 'AbortError') {
      failOperation(LOG_SOURCES.UTILS, `${operationName} to ${endpoint}`, `Request timed out after ${API_TIMEOUT}ms`);
      throw new Error(`Request timed out after ${API_TIMEOUT}ms`);
    }
    
    failOperation(LOG_SOURCES.UTILS, `${operationName} to ${endpoint}`, error);
    throw error;
  }
}

/**
 * Make an authenticated API request
 * 
 * @param {string} endpoint - The API endpoint (without base URL)
 * @param {string} token - The authentication token
 * @param {Object} options - Fetch options
 * @param {string} operationName - Name of the operation for logging
 * @returns {Promise<Object>} The response data
 */
async function authenticatedRequest(endpoint, token, options = {}, operationName = 'Auth API Request') {
  if (!token) {
    throw new Error('No authentication token provided');
  }
  
  return apiRequest(
    endpoint, 
    {
      ...options,
      headers: {
        ...options.headers,
        'Authorization': `Bearer ${token}`
      }
    },
    operationName
  );
}

/**
 * Verify if a token is valid
 * 
 * @param {string} token - The token to verify
 * @returns {Promise<boolean>} Whether the token is valid
 */
async function verifyToken(token) {
  try {
    await authenticatedRequest('/api/extension/verify-token', token, {
      method: 'POST'
    }, 'Verify Token');
    return true;
  } catch (error) {
    return false;
  }
}

/**
 * Login with email and password
 * 
 * @param {string} email - User email
 * @param {string} password - User password
 * @returns {Promise<Object>} Login response with token and user
 */
async function login(email, password) {
  return apiRequest('/api/extension/login', {
    method: 'POST',
    body: JSON.stringify({ email, password })
  }, 'Login');
}

/**
 * Fetch user profile data
 * 
 * @param {string} token - Authentication token
 * @returns {Promise<Object>} User profile data
 */
async function fetchProfile(token) {
  return authenticatedRequest('/api/extension/profile', token, {}, 'Fetch Profile');
}

export {
  API_BASE_URL,
  API_TIMEOUT,
  apiRequest,
  authenticatedRequest,
  verifyToken,
  login,
  fetchProfile
};