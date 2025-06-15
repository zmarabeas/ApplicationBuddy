/**
 * JobFillr Extension Logger
 * A utility for consistent logging throughout the extension
 */

// Configuration
const LOG_LEVELS = {
  DEBUG: 0,
  INFO: 1,
  WARN: 2,
  ERROR: 3,
  NONE: 4
};

// Default log level (change to NONE in production)
let currentLogLevel = LOG_LEVELS.DEBUG;

// Constants for log sources
const LOG_SOURCES = {
  POPUP: 'Popup',
  BACKGROUND: 'Background',
  CONTENT: 'Content',
  UTILS: 'Utils',
};

/**
 * Set the current log level
 * @param {number} level - The log level to set (from LOG_LEVELS)
 */
function setLogLevel(level) {
  if (Object.values(LOG_LEVELS).includes(level)) {
    currentLogLevel = level;
    debug('Logger', `Log level set to ${getLogLevelName(level)}`);
  }
}

/**
 * Get the name of a log level
 * @param {number} level - The log level
 * @returns {string} The name of the log level
 */
function getLogLevelName(level) {
  return Object.keys(LOG_LEVELS).find(key => LOG_LEVELS[key] === level) || 'UNKNOWN';
}

/**
 * Log a debug message
 * @param {string} source - The source of the log
 * @param {...any} args - Arguments to log
 */
function debug(source, ...args) {
  if (currentLogLevel <= LOG_LEVELS.DEBUG) {
    console.debug(`[JobFillr:${source}]`, ...args);
  }
}

/**
 * Log an info message
 * @param {string} source - The source of the log
 * @param {...any} args - Arguments to log
 */
function info(source, ...args) {
  if (currentLogLevel <= LOG_LEVELS.INFO) {
    console.info(`[JobFillr:${source}]`, ...args);
  }
}

/**
 * Log a warning message
 * @param {string} source - The source of the log
 * @param {...any} args - Arguments to log
 */
function warn(source, ...args) {
  if (currentLogLevel <= LOG_LEVELS.WARN) {
    console.warn(`[JobFillr:${source}]`, ...args);
  }
}

/**
 * Log an error message
 * @param {string} source - The source of the log
 * @param {...any} args - Arguments to log
 */
function error(source, ...args) {
  if (currentLogLevel <= LOG_LEVELS.ERROR) {
    console.error(`[JobFillr:${source}]`, ...args);
  }
}

/**
 * Log the start of an async operation
 * @param {string} source - The source of the log
 * @param {string} operation - The name of the operation
 */
function startOperation(source, operation) {
  if (currentLogLevel <= LOG_LEVELS.DEBUG) {
    console.debug(`[JobFillr:${source}] ▶️ Starting: ${operation}`);
  }
}

/**
 * Log the successful completion of an async operation
 * @param {string} source - The source of the log
 * @param {string} operation - The name of the operation
 * @param {any} result - Optional result to log
 */
function endOperation(source, operation, result) {
  if (currentLogLevel <= LOG_LEVELS.DEBUG) {
    if (result !== undefined) {
      console.debug(`[JobFillr:${source}] ✅ Completed: ${operation}`, result);
    } else {
      console.debug(`[JobFillr:${source}] ✅ Completed: ${operation}`);
    }
  }
}

/**
 * Log the failure of an async operation
 * @param {string} source - The source of the log
 * @param {string} operation - The name of the operation
 * @param {Error|string} error - The error that occurred
 */
function failOperation(source, operation, error) {
  if (currentLogLevel <= LOG_LEVELS.ERROR) {
    console.error(`[JobFillr:${source}] ❌ Failed: ${operation}`, error);
  }
}

/**
 * Time an operation and log its duration
 * @param {string} source - The source of the log
 * @param {string} operation - The name of the operation
 * @param {Function} fn - The function to time
 * @returns {Promise<any>} The result of the function
 */
async function timeOperation(source, operation, fn) {
  if (currentLogLevel <= LOG_LEVELS.DEBUG) {
    const start = performance.now();
    try {
      startOperation(source, operation);
      const result = await fn();
      const duration = performance.now() - start;
      console.debug(`[JobFillr:${source}] ⏱️ ${operation} took ${duration.toFixed(2)}ms`);
      endOperation(source, operation, result);
      return result;
    } catch (error) {
      const duration = performance.now() - start;
      console.debug(`[JobFillr:${source}] ⏱️ ${operation} failed after ${duration.toFixed(2)}ms`);
      failOperation(source, operation, error);
      throw error;
    }
  } else {
    return fn();
  }
}

// Export all functions and constants
export {
  LOG_LEVELS,
  LOG_SOURCES,
  setLogLevel,
  debug,
  info,
  warn,
  error,
  startOperation,
  endOperation,
  failOperation,
  timeOperation
};