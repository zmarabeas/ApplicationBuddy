/**
 * JobFillr Extension Storage Utilities
 * Utilities for working with browser extension storage
 */

import { LOG_SOURCES, debug, error } from './logger.js';

// Storage keys
const STORAGE_KEYS = {
  AUTH: 'auth',
  PROFILE: 'profile',
  SETTINGS: 'settings',
  CACHE: 'cache'
};

// Default cache expiration (15 minutes)
const DEFAULT_CACHE_EXPIRATION = 15 * 60 * 1000;

/**
 * Save data to local storage
 * 
 * @param {string} key - Storage key
 * @param {any} value - Value to store
 * @returns {Promise<void>}
 */
function saveToStorage(key, value) {
  debug(LOG_SOURCES.UTILS, `Saving to storage: ${key}`);
  return new Promise((resolve) => {
    chrome.storage.local.set({ [key]: value }, () => {
      const error = chrome.runtime.lastError;
      if (error) {
        error(LOG_SOURCES.UTILS, `Error saving to storage: ${key}`, error);
      } else {
        debug(LOG_SOURCES.UTILS, `Saved to storage: ${key}`);
      }
      resolve();
    });
  });
}

/**
 * Get data from local storage
 * 
 * @param {string} key - Storage key
 * @returns {Promise<any>} Stored value or undefined
 */
function getFromStorage(key) {
  debug(LOG_SOURCES.UTILS, `Getting from storage: ${key}`);
  return new Promise((resolve) => {
    chrome.storage.local.get([key], (result) => {
      const error = chrome.runtime.lastError;
      if (error) {
        error(LOG_SOURCES.UTILS, `Error getting from storage: ${key}`, error);
        resolve(undefined);
      } else {
        debug(LOG_SOURCES.UTILS, `Got from storage: ${key}`, result[key] ? true : false);
        resolve(result[key]);
      }
    });
  });
}

/**
 * Clear data from local storage
 * 
 * @param {string} key - Storage key
 * @returns {Promise<void>}
 */
function clearStorage(key) {
  debug(LOG_SOURCES.UTILS, `Clearing from storage: ${key}`);
  return new Promise((resolve) => {
    chrome.storage.local.remove([key], () => {
      const error = chrome.runtime.lastError;
      if (error) {
        error(LOG_SOURCES.UTILS, `Error clearing storage: ${key}`, error);
      } else {
        debug(LOG_SOURCES.UTILS, `Cleared from storage: ${key}`);
      }
      resolve();
    });
  });
}

/**
 * Clear all extension storage
 * 
 * @returns {Promise<void>}
 */
function clearAllStorage() {
  debug(LOG_SOURCES.UTILS, 'Clearing all storage');
  return new Promise((resolve) => {
    chrome.storage.local.clear(() => {
      const error = chrome.runtime.lastError;
      if (error) {
        error(LOG_SOURCES.UTILS, 'Error clearing all storage', error);
      } else {
        debug(LOG_SOURCES.UTILS, 'Cleared all storage');
      }
      resolve();
    });
  });
}

/**
 * Cache data with expiration
 * 
 * @param {string} key - Cache key
 * @param {any} data - Data to cache
 * @param {number} expirationMs - Cache expiration in milliseconds
 * @returns {Promise<void>}
 */
function cacheData(key, data, expirationMs = DEFAULT_CACHE_EXPIRATION) {
  const cacheObj = {
    data,
    timestamp: Date.now(),
    expiration: expirationMs
  };
  
  return saveToStorage(`${STORAGE_KEYS.CACHE}.${key}`, cacheObj);
}

/**
 * Get cached data if not expired
 * 
 * @param {string} key - Cache key
 * @returns {Promise<any>} Cached data or undefined if expired
 */
async function getCachedData(key) {
  const cacheObj = await getFromStorage(`${STORAGE_KEYS.CACHE}.${key}`);
  
  if (!cacheObj) {
    return undefined;
  }
  
  const isExpired = Date.now() > (cacheObj.timestamp + cacheObj.expiration);
  
  if (isExpired) {
    debug(LOG_SOURCES.UTILS, `Cache expired for: ${key}`);
    await clearStorage(`${STORAGE_KEYS.CACHE}.${key}`);
    return undefined;
  }
  
  debug(LOG_SOURCES.UTILS, `Cache hit for: ${key}`);
  return cacheObj.data;
}

/**
 * Clear specific cached data
 * 
 * @param {string} key - Cache key
 * @returns {Promise<void>}
 */
function clearCache(key) {
  return clearStorage(`${STORAGE_KEYS.CACHE}.${key}`);
}

/**
 * Clear all cached data
 * 
 * @returns {Promise<void>}
 */
async function clearAllCache() {
  debug(LOG_SOURCES.UTILS, 'Clearing all cache');
  
  return new Promise((resolve) => {
    chrome.storage.local.get(null, (items) => {
      const cacheKeys = Object.keys(items).filter(key => 
        key.startsWith(`${STORAGE_KEYS.CACHE}.`)
      );
      
      if (cacheKeys.length === 0) {
        debug(LOG_SOURCES.UTILS, 'No cache to clear');
        resolve();
        return;
      }
      
      chrome.storage.local.remove(cacheKeys, () => {
        const error = chrome.runtime.lastError;
        if (error) {
          error(LOG_SOURCES.UTILS, 'Error clearing all cache', error);
        } else {
          debug(LOG_SOURCES.UTILS, `Cleared ${cacheKeys.length} cache items`);
        }
        resolve();
      });
    });
  });
}

export {
  STORAGE_KEYS,
  DEFAULT_CACHE_EXPIRATION,
  saveToStorage,
  getFromStorage,
  clearStorage,
  clearAllStorage,
  cacheData,
  getCachedData,
  clearCache,
  clearAllCache
};