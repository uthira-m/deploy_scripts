/**
 * Utility functions for the application
 */

import { getServerDate } from './serverTime';

/**
 * Calculate service duration from date of entry.
 * Uses server date/time for year calculations.
 * @param doeString - Date of entry as string
 * @returns Formatted service duration string (e.g., "25 yrs 6 months" or "8 months")
 */
export const calculateServiceDuration = (doeString: string): string => {
  if (!doeString) return '--';
  
  const doe = new Date(doeString);
  const today = getServerDate();
  
  let years = today.getFullYear() - doe.getFullYear();
  let months = today.getMonth() - doe.getMonth();
  
  if (months < 0) {
    years--;
    months += 12;
  }
  
  // Handle day difference
  if (today.getDate() < doe.getDate()) {
    months--;
    if (months < 0) {
      years--;
      months += 12;
    }
  }
  
  if (years > 0 && months > 0) {
    return `${years} yrs ${months} months`;
  } else if (years > 0) {
    return `${years} yrs`;
  } else if (months > 0) {
    return `${months} months`;
  } else {
    const diffTime = Math.abs(today.getTime() - doe.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return `${diffDays} days`;
  }
};

/**
 * Parse date string to Date object. Centralized parsing for consistency.
 * Returns null for invalid or empty.
 */
export const parseDate = (dateStr: string | undefined | null): Date | null => {
  if (!dateStr) return null;
  const d = new Date(dateStr);
  return isNaN(d.getTime()) ? null : d;
};

/**
 * Parse date string to timestamp (ms since epoch) for sorting/comparison.
 * Uses centralized parsing; returns 0 for invalid or empty.
 */
export const parseToTimestamp = (dateStr: string | undefined | null): number => {
  const d = parseDate(dateStr);
  return d ? d.getTime() : 0;
};

/**
 * Format date to DD/MM/YYYY (consistent across all pages)
 * @param dateString - Date as string
 * @returns Formatted date string
 */
export const formatDate = (dateString: string | undefined | null): string => {
  const d = parseDate(dateString);
  if (!d) return '--';
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();
  return `${day}/${month}/${year}`;
};

/**
 * Format date to short format (DD/MM/YYYY)
 * @param dateString - Date as string
 * @returns Short formatted date string
 */
export const formatDateShort = (dateString: string | undefined | null): string => {
  const d = parseDate(dateString);
  if (!d) return '--';
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();
  return `${day}/${month}/${year}`;
};

/**
 * Validate personnel date of birth: age must be between 18 and 50 years.
 * @param value - Date string (YYYY-MM-DD)
 * @returns Error message or empty string if valid
 */
export const validatePersonnelDob = (value: string): string => {
  if (!value) return '';
  const birthDate = parseDate(value);
  const today = getServerDate();
  if (!birthDate) return 'Invalid date';
  if (birthDate > today) return 'Date of birth cannot be in the future';
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  const dayDiff = today.getDate() - birthDate.getDate();
  if (monthDiff < 0 || (monthDiff === 0 && dayDiff < 0)) age--;
  if (age < 18) return 'Age must be at least 18 years';
  if (age > 50) return 'Age must not exceed 50 years';
  return '';
};

/**
 * Format duration string that may contain YYYY-MM-DD dates to dd/mm/yyyy.
 * Handles: "2024-01-15 to 2024-02-15", "2024-01-15", RFC3339, or plain text.
 */
export const formatDurationDates = (duration: string | undefined | null): string => {
  if (!duration || !duration.trim()) return '--';
  const trimmed = duration.trim();
  const rangeMatch = trimmed.match(/^(\d{4}-\d{2}-\d{2}(?:T[\d:.Z+-]+)?)\s+to\s+(\d{4}-\d{2}-\d{2}(?:T[\d:.Z+-]+)?)$/i);
  if (rangeMatch) {
    return `${formatDate(rangeMatch[1])} to ${formatDate(rangeMatch[2])}`;
  }
  const singleMatch = trimmed.match(/^(\d{4}-\d{2}-\d{2}(?:T[\d:.Z+-]+)?)$/);
  if (singleMatch) {
    return `${formatDate(singleMatch[1])} - till date`;
  }
  return trimmed;
};

/**
 * Convert date string to YYYY-MM-DD format for HTML date inputs.
 * Handles RFC3339 (e.g. 2024-01-15T00:00:00Z) and other formats from API.
 * @param dateString - Date as string from API
 * @returns YYYY-MM-DD string or empty string
 */
export const toDateInputValue = (dateString: string | undefined | null): string => {
  if (!dateString) return '';
  const trimmed = String(dateString).trim();
  if (!trimmed) return '';
  // If already in YYYY-MM-DD format, return as is
  const ymdMatch = trimmed.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (ymdMatch) return ymdMatch[0];
  const date = parseDate(trimmed);
  if (!date) return '';
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

