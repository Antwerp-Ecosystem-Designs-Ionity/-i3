/**
 * ƐÏ3 Browser - Configuration
 * 
 * IONITY (PTY) LTD
 */

module.exports = {
  // Browser Settings
  browser: {
    name: 'ƐÏ3 Browser',
    version: '1.0.0',
    userAgent: 'ƐÏ3-Browser/1.0 (IONITY) Chrome/120.0.0.0',
    homepage: 'about:blank',
    defaultSearchEngine: 'edge-ai' // 'edge-ai' or 'cloudsearch'
  },

  // Google CloudSearch Configuration
  cloudSearch: {
    enabled: true,
    apiEndpoint: 'https://cloudsearch.googleapis.com/v1',
    apiKey: process.env.GOOGLE_CLOUDSEARCH_API_KEY || '',
    searchApplicationId: process.env.CLOUDSEARCH_APP_ID || 'default',
    cacheTimeout: 300000 // 5 minutes
  },

  // Microsoft Edge AI Search Configuration
  edgeAI: {
    enabled: true,
    apiEndpoint: 'https://api.bing.microsoft.com/v7.0',
    apiKey: process.env.BING_SEARCH_API_KEY || '',
    cacheTimeout: 300000 // 5 minutes
  },

  // SSH Backend Configuration
  ssh: {
    enabled: true,
    defaultPort: 22,
    readyTimeout: 10000,
    keepaliveInterval: 30000
  },

  // Security Settings
  security: {
    contextIsolation: true,
    nodeIntegration: false,
    webSecurity: true,
    allowRunningInsecureContent: false
  },

  // Window Settings
  window: {
    width: 1400,
    height: 900,
    minWidth: 800,
    minHeight: 600,
    backgroundColor: '#0f0f0f'
  },

  // Developer Settings
  developer: {
    devToolsEnabled: false,
    verboseLogging: false
  },

  // Company Information
  company: {
    name: 'IONITY (PTY) LTD',
    author: 'Johan Wilhelm van Antwerp and R1 DS',
    location: 'Centurion, South Africa',
    copyright: '2018-2025+',
    trademark: 'ƐÏ3 | AEDI | ƐÏ3 | AMPIES | 986 AED | 6ƐÏ39 | NeTzeR',
    motto: 'ANYTHING IS POSSIBLE WITH GOD <3'
  },

  // References
  references: {
    chromiumRepo: 'https://github.com/AntwerpDesignsIonitychromium-OG',
    mainRepo: 'https://github.com/Antwerp-Ecosystem-Designs-Ionity/-i3'
  }
};
