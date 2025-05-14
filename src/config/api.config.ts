/**
 * API Configuration
 *
 * This file contains centralized configuration for all API endpoints.
 * Any changes to API URLs should be made here rather than in individual service files.
 */

// Base URL for all API endpoints
export const API_CONFIG = {
  BASE_URL: 'https://gsoft-api-gateway-dtc3g9h8e7cpgagx.eastus-01.azurewebsites.net/api',

  // Specific service endpoints
  AUTH: {
    BASE_PATH: '/auth',
    LOGIN: '/login',
    VALIDATE_TOKEN: '/validate-token'
  },

  // Resource paths for different service types
  RESOURCES: {
    CLIENTS: 'clients',
    MATTERS: 'matter',
    TIME_ENTRIES: 'timeentry',
    COUNTRIES: 'countries',
    WORKFLOWS_PROCESS_PHASES: 'processphases',
    WORKFLOWS_PROCESS_TYPES: 'processtypes',
    USERS: 'users'
  }
};

/**
 * Helper to generate full API URLs
 */
export const getApiUrl = (path: string): string => {
  return `${API_CONFIG.BASE_URL}${path}`;
};

/**
 * Get authentication headers for API requests
 */
export const getAuthHeaders = () => {
  const token = localStorage.getItem('authToken');
  if (!token) {
    throw new Error('No authentication token found');
  }

  return {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  };
};