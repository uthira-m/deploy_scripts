/**
 * Utility functions for the application
 */

/**
 * Calculate service duration from date of entry
 * @param doeString - Date of entry as string
 * @returns Formatted service duration string (e.g., "25 yrs 6 months" or "8 months")
 */
export const calculateServiceDuration = (doeString: string): string => {
  if (!doeString) return '--';
  
  const doe = new Date(doeString);
  const today = new Date();
  
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
 * Format date to a readable string
 * @param dateString - Date as string
 * @returns Formatted date string
 */
export const formatDate = (dateString: string): string => {
  if (!dateString) return '--';
  
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};

/**
 * Format date to short format (MM/DD/YYYY)
 * @param dateString - Date as string
 * @returns Short formatted date string
 */
export const formatDateShort = (dateString: string): string => {
  if (!dateString) return '--';
  
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  });
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
  const date = new Date(trimmed);
  if (isNaN(date.getTime())) return '';
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

