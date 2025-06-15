/**
 * Field Handlers for JobFillr
 * 
 * This module provides handlers for complex form field types that require
 * special treatment beyond simple text insertion.
 */

// Global validation patterns
const PATTERNS = {
  // Date patterns
  MM_DD_YYYY: /^(0[1-9]|1[0-2])\/(0[1-9]|[12][0-9]|3[01])\/\d{4}$/,
  DD_MM_YYYY: /^(0[1-9]|[12][0-9]|3[01])\/(0[1-9]|1[0-2])\/\d{4}$/,
  YYYY_MM_DD: /^\d{4}\-(0[1-9]|1[0-2])\-(0[1-9]|[12][0-9]|3[01])$/,
  
  // Phone patterns
  US_PHONE: /^\(?(\d{3})\)?[- ]?(\d{3})[- ]?(\d{4})$/,
  INTL_PHONE: /^\+?\d{1,4}?[-.\s]?\(?\d{1,3}?\)?[-.\s]?\d{1,4}[-.\s]?\d{1,4}[-.\s]?\d{1,9}$/,
  
  // Address patterns
  ZIP_CODE_US: /^\d{5}(?:[-\s]\d{4})?$/,
  ZIP_CODE_CANADA: /^[A-Za-z]\d[A-Za-z][ -]?\d[A-Za-z]\d$/,
  
  // Currency patterns
  CURRENCY: /^\$?\d{1,3}(?:,\d{3})*(?:\.\d{2})?$/,
  
  // Other
  URL: /^(https?:\/\/)?((([a-z\d]([a-z\d-]*[a-z\d])*)\.)+[a-z]{2,}|localhost)(:\d+)?(\/[-a-z\d%_.~+]*)*(\?[;&a-z\d%_.~+=-]*)?(\#[-a-z\d_]*)?$/i,
};

/**
 * Class to handle date field formatting
 */
class DateHandler {
  /**
   * Format a date value according to the detected format of the field
   * 
   * @param {string} dateValue - The date value to format (YYYY-MM-DD, ISO string, etc)
   * @param {HTMLElement} element - The date element to fill
   * @returns {string} The formatted date
   */
  static formatDate(dateValue, element) {
    // Skip if no date value
    if (!dateValue) return '';
    
    // Parse the date
    let date;
    try {
      // Handle YYYY-MM-DD format from database
      if (dateValue.match(/^\d{4}-\d{2}-\d{2}$/)) {
        date = new Date(dateValue);
      } else {
        // Try to parse as regular date string
        date = new Date(dateValue);
      }
      
      // Check if date is valid
      if (isNaN(date.getTime())) {
        console.warn('Invalid date value:', dateValue);
        return '';
      }
    } catch (e) {
      console.warn('Error parsing date:', e);
      return '';
    }
    
    // Detect the input format based on placeholder or pattern attribute
    const placeholder = element.placeholder?.toLowerCase() || '';
    const pattern = element.pattern || '';
    const inputType = element.type || '';
    
    // Input type="date" expects YYYY-MM-DD
    if (inputType === 'date') {
      return this.toYYYYMMDD(date);
    }
    
    // Check placeholder hints
    if (placeholder.includes('mm/dd/yyyy') || 
        placeholder.includes('mm-dd-yyyy')) {
      return this.toMMDDYYYY(date);
    }
    
    if (placeholder.includes('dd/mm/yyyy') || 
        placeholder.includes('dd-mm-yyyy')) {
      return this.toDDMMYYYY(date);
    }
    
    // Check pattern attribute
    if (pattern) {
      if (pattern.includes('MM') && pattern.includes('DD') && pattern.includes('YYYY')) {
        // Determine order from pattern
        if (pattern.indexOf('MM') < pattern.indexOf('DD')) {
          return this.toMMDDYYYY(date);
        } else {
          return this.toDDMMYYYY(date);
        }
      }
    }
    
    // Default to MM/DD/YYYY (US format) if no format detected
    return this.toMMDDYYYY(date);
  }
  
  /**
   * Format date as MM/DD/YYYY
   */
  static toMMDDYYYY(date) {
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    const year = date.getFullYear();
    return `${month}/${day}/${year}`;
  }
  
  /**
   * Format date as DD/MM/YYYY
   */
  static toDDMMYYYY(date) {
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  }
  
  /**
   * Format date as YYYY-MM-DD
   */
  static toYYYYMMDD(date) {
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    const year = date.getFullYear();
    return `${year}-${month}-${day}`;
  }
}

/**
 * Class to handle phone number formatting
 */
class PhoneHandler {
  /**
   * Format a phone number according to the detected format
   * 
   * @param {string} phoneValue - The phone value to format
   * @param {HTMLElement} element - The phone element to fill
   * @returns {string} The formatted phone number
   */
  static formatPhone(phoneValue, element) {
    // Skip if no phone value
    if (!phoneValue) return '';
    
    // Strip all non-numeric characters
    const digitsOnly = phoneValue.replace(/\D/g, '');
    
    // Detect the format based on the field
    const placeholder = element.placeholder?.toLowerCase() || '';
    const pattern = element.pattern || '';
    
    // US format: (123) 456-7890
    if (placeholder.includes('(') && placeholder.includes(')') && 
        (placeholder.includes('-') || placeholder.includes(' '))) {
      return this.toUSFormat(digitsOnly);
    }
    
    // Format with dashes: 123-456-7890
    if (placeholder.includes('-')) {
      return this.toDashFormat(digitsOnly);
    }
    
    // International format
    if (placeholder.includes('+') || placeholder.toLowerCase().includes('country')) {
      return this.toInternationalFormat(digitsOnly);
    }
    
    // Check pattern for hints
    if (pattern) {
      // TODO: Implement pattern detection logic
    }
    
    // Default to US format if 10 digits, otherwise use as-is
    if (digitsOnly.length === 10) {
      return this.toUSFormat(digitsOnly);
    }
    
    // For other lengths, use dash format
    return this.toDashFormat(digitsOnly);
  }
  
  /**
   * Format phone as (123) 456-7890
   */
  static toUSFormat(digits) {
    if (digits.length === 10) {
      return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
    } else if (digits.length === 11 && digits[0] === '1') {
      // Handle 1 + area code
      return `(${digits.slice(1, 4)}) ${digits.slice(4, 7)}-${digits.slice(7)}`;
    }
    return digits; // Return as-is if not a standard length
  }
  
  /**
   * Format phone as 123-456-7890
   */
  static toDashFormat(digits) {
    if (digits.length === 10) {
      return `${digits.slice(0, 3)}-${digits.slice(3, 6)}-${digits.slice(6)}`;
    } else if (digits.length === 7) {
      // Format as local number
      return `${digits.slice(0, 3)}-${digits.slice(3)}`;
    } else if (digits.length > 10) {
      // For longer numbers, add dashes every 3-4 digits
      let result = '';
      for (let i = 0; i < digits.length; i += 3) {
        result += digits.slice(i, i + 3) + '-';
      }
      return result.slice(0, -1); // Remove trailing dash
    }
    return digits; // Return as-is if not a standard length
  }
  
  /**
   * Format phone in international format +1 123 456 7890
   */
  static toInternationalFormat(digits) {
    if (digits.length === 10) {
      // Assume US/Canada number with country code 1
      return `+1 ${digits.slice(0, 3)} ${digits.slice(3, 6)} ${digits.slice(6)}`;
    } else if (digits.length === 11 && digits[0] === '1') {
      // US/Canada number with country code included
      return `+${digits[0]} ${digits.slice(1, 4)} ${digits.slice(4, 7)} ${digits.slice(7)}`;
    } else if (digits.length > 10) {
      // Generic international format
      // Assume first 1-3 digits are country code
      const countryCodeLength = Math.min(digits.length >= 12 ? 3 : 2, digits.length - 7);
      const countryCode = digits.slice(0, countryCodeLength);
      const rest = digits.slice(countryCodeLength);
      
      let formatted = `+${countryCode} `;
      for (let i = 0; i < rest.length; i += 3) {
        formatted += rest.slice(i, i + 3) + ' ';
      }
      return formatted.trim();
    }
    
    return digits; // Return as-is if not a recognizable format
  }
}

/**
 * Class to handle address formatting
 */
class AddressHandler {
  /**
   * Format a postal/zip code according to the detected format
   * 
   * @param {string} postalCode - The postal code to format
   * @param {HTMLElement} element - The element to fill
   * @returns {string} The formatted postal code
   */
  static formatPostalCode(postalCode, element) {
    if (!postalCode) return '';
    
    // Clean up the postal code
    postalCode = postalCode.trim().toUpperCase();
    
    // Check if it's potentially a Canadian postal code (letter-number-letter number-letter-number)
    const isCanadianFormat = /^[A-Z]\d[A-Z]\s*\d[A-Z]\d$/i.test(postalCode.replace(/\s+/g, ''));
    
    // Format Canadian postal code with space: A1A 1A1
    if (isCanadianFormat) {
      const cleaned = postalCode.replace(/\s+/g, '');
      return `${cleaned.substring(0, 3)} ${cleaned.substring(3)}`;
    }
    
    // US zip code with optional +4: 12345 or 12345-6789
    const usZipMatch = postalCode.match(/^(\d{5})([-\s]?\d{4})?$/);
    if (usZipMatch) {
      if (usZipMatch[2]) {
        // Format as ZIP+4
        return `${usZipMatch[1]}-${usZipMatch[2].replace(/[-\s]/g, '')}`;
      }
      return usZipMatch[1]; // Just the 5-digit ZIP
    }
    
    // Return as-is if no specific format is detected
    return postalCode;
  }
  
  /**
   * Format the state/province value (handle abbreviations, etc.)
   * 
   * @param {string} stateValue - The state/province value
   * @param {HTMLElement} element - The element to fill
   * @returns {string} The formatted state value
   */
  static formatState(stateValue, element) {
    if (!stateValue) return '';
    
    const stateMap = {
      // US state mappings (full name to abbreviation)
      'alabama': 'AL',
      'alaska': 'AK',
      'arizona': 'AZ',
      'arkansas': 'AR',
      'california': 'CA',
      'colorado': 'CO',
      'connecticut': 'CT',
      'delaware': 'DE',
      'florida': 'FL',
      'georgia': 'GA',
      'hawaii': 'HI',
      'idaho': 'ID',
      'illinois': 'IL',
      'indiana': 'IN',
      'iowa': 'IA',
      'kansas': 'KS',
      'kentucky': 'KY',
      'louisiana': 'LA',
      'maine': 'ME',
      'maryland': 'MD',
      'massachusetts': 'MA',
      'michigan': 'MI',
      'minnesota': 'MN',
      'mississippi': 'MS',
      'missouri': 'MO',
      'montana': 'MT',
      'nebraska': 'NE',
      'nevada': 'NV',
      'new hampshire': 'NH',
      'new jersey': 'NJ',
      'new mexico': 'NM',
      'new york': 'NY',
      'north carolina': 'NC',
      'north dakota': 'ND',
      'ohio': 'OH',
      'oklahoma': 'OK',
      'oregon': 'OR',
      'pennsylvania': 'PA',
      'rhode island': 'RI',
      'south carolina': 'SC',
      'south dakota': 'SD',
      'tennessee': 'TN',
      'texas': 'TX',
      'utah': 'UT',
      'vermont': 'VT',
      'virginia': 'VA',
      'washington': 'WA',
      'west virginia': 'WV',
      'wisconsin': 'WI',
      'wyoming': 'WY',
      'district of columbia': 'DC',
      
      // Canadian provinces
      'alberta': 'AB',
      'british columbia': 'BC',
      'manitoba': 'MB',
      'new brunswick': 'NB',
      'newfoundland and labrador': 'NL',
      'newfoundland': 'NL',
      'northwest territories': 'NT',
      'nova scotia': 'NS',
      'nunavut': 'NU',
      'ontario': 'ON',
      'prince edward island': 'PE',
      'quebec': 'QC',
      'saskatchewan': 'SK',
      'yukon': 'YT'
    };
    
    // Check if the state value is a full name that needs to be abbreviated
    const normalized = stateValue.toLowerCase().trim();
    
    // If it's a dropdown (<select>), we need to match the options
    if (element.tagName === 'SELECT') {
      const options = Array.from(element.options);
      
      // First try a direct case-insensitive match
      const directMatch = options.find(opt => 
        opt.text.toLowerCase() === normalized || 
        opt.value.toLowerCase() === normalized
      );
      
      if (directMatch) return directMatch.value;
      
      // If no direct match, try to match the abbreviation
      const abbr = stateMap[normalized] || stateValue;
      const abbrMatch = options.find(opt => 
        opt.text.toLowerCase() === abbr.toLowerCase() || 
        opt.value.toLowerCase() === abbr.toLowerCase()
      );
      
      if (abbrMatch) return abbrMatch.value;
      
      // If still no match, use the first option as default (except the placeholder)
      const nonPlaceholder = options.find(opt => 
        opt.value && 
        !['', 'select', 'choose'].includes(opt.value.toLowerCase()) &&
        !['', 'select', 'choose'].includes(opt.text.toLowerCase())
      );
      
      if (nonPlaceholder) return nonPlaceholder.value;
      
      // Last resort, return first option
      if (options.length > 0) return options[0].value;
      
      // Nothing matched
      return stateValue;
    }
    
    // For text fields, use the abbreviation if available
    return stateMap[normalized] || stateValue;
  }
}

/**
 * Class to handle selection fields (dropdowns, radio buttons, checkboxes)
 */
class SelectionHandler {
  /**
   * Select the appropriate option in a dropdown based on value
   * 
   * @param {string} value - The value to select
   * @param {HTMLSelectElement} selectElement - The select element
   * @returns {boolean} True if an option was selected, false otherwise
   */
  static selectOption(value, selectElement) {
    if (!value || !selectElement || selectElement.tagName !== 'SELECT') {
      return false;
    }
    
    const options = Array.from(selectElement.options);
    const lowerValue = value.toString().toLowerCase();
    let selectedIndex = -1;
    
    // First try direct value match
    selectedIndex = options.findIndex(opt => opt.value.toLowerCase() === lowerValue);
    
    // Then try text content match
    if (selectedIndex === -1) {
      selectedIndex = options.findIndex(opt => opt.text.toLowerCase() === lowerValue);
    }
    
    // Try partial matches
    if (selectedIndex === -1) {
      // If value contains multiple words, try to match any option containing all those words
      const valueWords = lowerValue.split(/\s+/).filter(w => w.length > 3);
      if (valueWords.length > 0) {
        selectedIndex = options.findIndex(opt => {
          const optText = opt.text.toLowerCase();
          return valueWords.every(word => optText.includes(word));
        });
      }
    }
    
    // If we found a match, select it
    if (selectedIndex !== -1) {
      selectElement.selectedIndex = selectedIndex;
      return true;
    }
    
    // No match found
    return false;
  }
  
  /**
   * Select the appropriate checkbox or radio button based on value
   * 
   * @param {string|boolean} value - The value to match
   * @param {HTMLInputElement} inputElement - The checkbox or radio input
   * @returns {boolean} True if element was successfully set, false otherwise
   */
  static setCheckedState(value, inputElement) {
    if (!inputElement || !['checkbox', 'radio'].includes(inputElement.type)) {
      return false;
    }
    
    // Handle boolean values
    if (typeof value === 'boolean') {
      inputElement.checked = value;
      return true;
    }
    
    // Handle yes/no/true/false string values
    const stringValue = String(value).toLowerCase().trim();
    const positiveValues = ['yes', 'true', 'y', '1', 'on', 'checked'];
    const negativeValues = ['no', 'false', 'n', '0', 'off', 'unchecked'];
    
    if (positiveValues.includes(stringValue)) {
      inputElement.checked = true;
      return true;
    } else if (negativeValues.includes(stringValue)) {
      inputElement.checked = false;
      return true;
    }
    
    // For radios, check if the value matches
    if (inputElement.type === 'radio') {
      if (inputElement.value.toLowerCase() === stringValue) {
        inputElement.checked = true;
        return true;
      }
      
      // Check if the label contains the value
      const labels = document.querySelectorAll(`label[for="${inputElement.id}"]`);
      for (const label of labels) {
        if (label.textContent.toLowerCase().includes(stringValue)) {
          inputElement.checked = true;
          return true;
        }
      }
    }
    
    return false;
  }
}

// Make handlers available globally since we can't use ES modules in content scripts
// Store previous reference if it exists (for potential handling of multiple instances)
const existingHandlers = window.JobFillrHandlers || {};

// Combine with new handlers (new ones take precedence)
window.JobFillrHandlers = {
  ...existingHandlers,
  DateHandler,
  PhoneHandler,
  AddressHandler,
  SelectionHandler,
  PATTERNS
};

// Initialize handlers to ensure they're available when content.js runs
(function initializeHandlers() {
  console.log('JobFillr: Field handlers initialized and available globally');
  
  // Create a custom event to notify content.js that handlers are ready
  const handlersReadyEvent = new CustomEvent('jobfillr:handlersReady', {
    detail: { handlers: window.JobFillrHandlers }
  });
  
  // Add a flag in the document to indicate handlers are ready
  if (document.body) {
    document.body.setAttribute('data-jobfillr-handlers-ready', 'true');
    document.body.dispatchEvent(handlersReadyEvent);
  } else {
    // If document.body is not available yet, wait for it
    document.addEventListener('DOMContentLoaded', function() {
      document.body.setAttribute('data-jobfillr-handlers-ready', 'true');
      document.body.dispatchEvent(handlersReadyEvent);
    });
  }
  
  // Also dispatch on document in case content.js is listening there
  document.dispatchEvent(handlersReadyEvent);
})();
