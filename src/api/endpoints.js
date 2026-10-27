/**
 * LimitGuard API Endpoints Configuration
 * Structure is strictly decoupled from components and slices.
 * URLs are configured here and used via the API client.
 */

export const ENDPOINTS = {
  dashboard: {
    overview: '/api/v1/analytics/overview?days=30',        // KPI numbers
    tokenSavings: '/api/v1/analytics/token-savings?days=7', // time series
    activity: '/api/v1/analytics/protection-activity?days=7', // protection activity time series
    riskDistribution: '/api/v1/analytics/privacy-risk?days=30', // privacy risk distribution
    recent: '/api/v1/analytics/recent-activity?limit=10',       // recent activity list
  },
  token: {
    generate: '/api/v1/extension-token/generate',   // creates/regenerates API token
    get: '/api/v1/extension-token',                 // optional: fetch existing token/metadata
    rotate: '/api/v1/extension-token/rotate',       // rotates extension token
    revoke: '/api/v1/extension-token',              // revokes extension token (DELETE)
    status: '/api/v1/extension-token/status',       // token status check
  },
};
