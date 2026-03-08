/**
 * Global Pagination Configuration
 * Default values can be overridden via environment variables
 */
export const paginationConfig = {
  // Default page number (1-indexed)
  DEFAULT_PAGE: parseInt(process.env.NEXT_PUBLIC_PAGINATION_DEFAULT_PAGE || '1'),
  
  // Default items per page
  DEFAULT_LIMIT: parseInt(process.env.NEXT_PUBLIC_PAGINATION_DEFAULT_LIMIT || '30'),
  
  // Maximum items per page (safety limit)
  MAX_LIMIT: parseInt(process.env.NEXT_PUBLIC_PAGINATION_MAX_LIMIT || '100'),
  
  // Minimum items per page
  MIN_LIMIT: parseInt(process.env.NEXT_PUBLIC_PAGINATION_MIN_LIMIT || '1'),

  // Options for rows per page dropdown
  ROW_OPTIONS: [10, 20, 30, 50, 100],
} as const;

export default paginationConfig;

