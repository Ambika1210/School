import logger from './logger.js';

/**
 * Date Helper Utilities
 * Handles date validation, calculations, and formatting
 */

/**
 * Validate if a date is valid
 * @param {Date|string} date - Date to validate
 * @returns {boolean} - True if valid, false otherwise
 */
export const isValidDate = (date) => {
  if (!date) return false;
  const dateObj = new Date(date);
  return dateObj instanceof Date && !isNaN(dateObj);
};

/**
 * Validate date range (startDate must be before endDate)
 * @param {Date|string} startDate - Start date
 * @param {Date|string} endDate - End date
 * @returns {Object} - { valid: boolean, error: string|null }
 */
export const validateDateRange = (startDate, endDate) => {
  if (!startDate || !endDate) {
    return {
      valid: false,
      error: 'Both start date and end date are required'
    };
  }

  if (!isValidDate(startDate)) {
    return {
      valid: false,
      error: 'Invalid start date format'
    };
  }

  if (!isValidDate(endDate)) {
    return {
      valid: false,
      error: 'Invalid end date format'
    };
  }

  const start = new Date(startDate);
  const end = new Date(endDate);

  // Set time to start of day for accurate comparison
  start.setHours(0, 0, 0, 0);
  end.setHours(0, 0, 0, 0);

  if (start >= end) {
    return {
      valid: false,
      error: 'Start date must be before end date'
    };
  }

  // Check if session duration is reasonable (at least 1 month, max 2 years)
  const diffTime = end - start;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  const minDays = 30; // Minimum 30 days
  const maxDays = 730; // Maximum 2 years (730 days)

  if (diffDays < minDays) {
    return {
      valid: false,
      error: `Session duration must be at least ${minDays} days`
    };
  }

  if (diffDays > maxDays) {
    return {
      valid: false,
      error: `Session duration cannot exceed ${maxDays} days (2 years)`
    };
  }

  return {
    valid: true,
    error: null
  };
};

/**
 * Check if a date falls within a date range
 * @param {Date|string} date - Date to check
 * @param {Date|string} startDate - Range start
 * @param {Date|string} endDate - Range end
 * @returns {boolean} - True if date is within range
 */
export const isDateInRange = (date, startDate, endDate) => {
  if (!isValidDate(date) || !isValidDate(startDate) || !isValidDate(endDate)) {
    return false;
  }

  const checkDate = new Date(date);
  const start = new Date(startDate);
  const end = new Date(endDate);

  checkDate.setHours(0, 0, 0, 0);
  start.setHours(0, 0, 0, 0);
  end.setHours(23, 59, 59, 999);

  return checkDate >= start && checkDate <= end;
};

/**
 * Check if two date ranges overlap
 * @param {Object} range1 - { startDate, endDate }
 * @param {Object} range2 - { startDate, endDate }
 * @returns {boolean} - True if ranges overlap
 */
export const doDateRangesOverlap = (range1, range2) => {
  const { startDate: start1, endDate: end1 } = range1;
  const { startDate: start2, endDate: end2 } = range2;

  if (!isValidDate(start1) || !isValidDate(end1) || !isValidDate(start2) || !isValidDate(end2)) {
    return false;
  }

  const s1 = new Date(start1);
  const e1 = new Date(end1);
  const s2 = new Date(start2);
  const e2 = new Date(end2);

  // Check if ranges overlap
  return s1 <= e2 && s2 <= e1;
};

/**
 * Calculate duration between two dates in days
 * @param {Date|string} startDate - Start date
 * @param {Date|string} endDate - End date
 * @returns {number} - Number of days
 */
export const calculateDaysDifference = (startDate, endDate) => {
  if (!isValidDate(startDate) || !isValidDate(endDate)) {
    return 0;
  }

  const start = new Date(startDate);
  const end = new Date(endDate);
  const diffTime = Math.abs(end - start);
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};

/**
 * Format date to readable string
 * @param {Date|string} date - Date to format
 * @param {string} format - Format type ('short', 'long', 'iso')
 * @returns {string} - Formatted date string
 */
export const formatDate = (date, format = 'short') => {
  if (!isValidDate(date)) {
    return 'Invalid Date';
  }

  const dateObj = new Date(date);
  const options = {
    short: { year: 'numeric', month: '2-digit', day: '2-digit' },
    long: { year: 'numeric', month: 'long', day: 'numeric' },
    iso: { year: 'numeric', month: '2-digit', day: '2-digit' }
  };

  if (format === 'iso') {
    return dateObj.toISOString().split('T')[0]; // YYYY-MM-DD
  }

  return dateObj.toLocaleDateString('en-US', options[format] || options.short);
};

/**
 * Get current date in ISO format
 * @returns {string} - Current date in YYYY-MM-DD format
 */
export const getCurrentDate = () => {
  return new Date().toISOString().split('T')[0];
};

/**
 * Check if a date is in the past
 * @param {Date|string} date - Date to check
 * @returns {boolean} - True if date is in the past
 */
export const isPastDate = (date) => {
  if (!isValidDate(date)) {
    return false;
  }

  const checkDate = new Date(date);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  checkDate.setHours(0, 0, 0, 0);

  return checkDate < today;
};

/**
 * Check if a date is in the future
 * @param {Date|string} date - Date to check
 * @returns {boolean} - True if date is in the future
 */
export const isFutureDate = (date) => {
  if (!isValidDate(date)) {
    return false;
  }

  const checkDate = new Date(date);
  const today = new Date();
  today.setHours(23, 59, 59, 999);
  checkDate.setHours(0, 0, 0, 0);

  return checkDate > today;
};

