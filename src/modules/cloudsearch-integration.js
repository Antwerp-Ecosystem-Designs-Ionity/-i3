/**
 * ƐÏ3 Browser - Google CloudSearch Integration
 * Integration with Google CloudSearch for enterprise search
 * 
 * IONITY (PTY) LTD
 */

const axios = require('axios');
const SemanticCacheManager = require('./semantic-cache-manager');

class CloudSearchIntegration {
  /**
   * @param {Object} options Configuration options
   * @param {SemanticCacheManager} options.cacheManager Optional shared cache manager
   */
  constructor(options = {}) {
    this.apiEndpoint = 'https://cloudsearch.googleapis.com/v1';
    this.apiKey = process.env.GOOGLE_CLOUDSEARCH_API_KEY || '';

    this.cacheManager = options.cacheManager || new SemanticCacheManager({
      maxCapacity: 100,
      ttl: 300000,
      similarityThreshold: 0.85
    });
  }

  /**
   * Set or update cache manager instance
   * @param {SemanticCacheManager} manager
   */
  setCacheManager(manager) {
    if (manager) {
      this.cacheManager = manager;
    }
  }

  /**
   * Search using Google CloudSearch
   * @param {string} query - Search query
   * @returns {Promise<Object>} Search results
   */
  async search(query) {
    if (!query || query.trim().length === 0) {
      return {
        success: false,
        error: 'Empty query provided'
      };
    }

    const trimmedQuery = query.trim();

    // Check semantic LRU cache first
    const cached = this.cacheManager.get(trimmedQuery, 'cloudsearch');
    if (cached) {
      console.log(`[CloudSearch] Returning cached results for query: "${trimmedQuery}"`);
      return cached;
    }

    try {
      // If API key is not configured, return a simulated response
      if (!this.apiKey) {
        console.log('[CloudSearch] API key not configured - using simulation mode');
        const simResult = this.simulateSearch(trimmedQuery);
        this.cacheManager.set(trimmedQuery, simResult, 'cloudsearch');
        return simResult;
      }

      // Validate API key format (basic validation)
      if (typeof this.apiKey !== 'string' || this.apiKey.length < 10) {
        console.warn('[CloudSearch] Invalid API key format - using simulation mode');
        const simResult = this.simulateSearch(trimmedQuery);
        this.cacheManager.set(trimmedQuery, simResult, 'cloudsearch');
        return simResult;
      }

      // Make actual API call to CloudSearch
      const response = await axios.post(
        `${this.apiEndpoint}/query/search`,
        {
          query: trimmedQuery,
          requestOptions: {
            searchApplicationId: process.env.CLOUDSEARCH_APP_ID || 'default'
          }
        },
        {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json'
          },
          timeout: 10000,
          validateStatus: (status) => {
            if (status === 429) {
              console.warn('Rate limit exceeded for CloudSearch');
              return false;
            }
            return status >= 200 && status < 300;
          }
        }
      );

      const result = {
        success: true,
        query: trimmedQuery,
        results: response.data.results || [],
        totalResults: response.data.resultCountExact || 0,
        source: 'google-cloudsearch'
      };

      // Cache the result in Semantic LRU Cache
      this.cacheManager.set(trimmedQuery, result, 'cloudsearch');

      return result;
    } catch (error) {
      console.error('[CloudSearch] API error:', error.message);
      
      // Fallback to simulated search on error
      const fallbackResult = this.simulateSearch(trimmedQuery);
      this.cacheManager.set(trimmedQuery, fallbackResult, 'cloudsearch');
      return fallbackResult;
    }
  }

  /**
   * Simulate CloudSearch results when API is not available
   * @param {string} query - Search query
   * @returns {Object} Simulated search results
   */
  simulateSearch(query) {
    return {
      success: true,
      query: query,
      results: [
        {
          title: `CloudSearch Result for: ${query}`,
          snippet: 'Google CloudSearch integration is ready. Configure API key for live results.',
          url: `https://cloudsearch.google.com/search?q=${encodeURIComponent(query)}`,
          source: 'cloudsearch-simulation'
        }
      ],
      totalResults: 1,
      source: 'google-cloudsearch-simulation',
      message: 'Configure GOOGLE_CLOUDSEARCH_API_KEY environment variable for live results'
    };
  }

  /**
   * Clear search cache
   */
  clearCache() {
    this.cacheManager.clearLRUCache();
    console.log('[CloudSearch] Cache cleared via SemanticCacheManager');
  }

  /**
   * Configure API settings
   * @param {Object} config - Configuration object
   */
  configure(config) {
    if (config.apiKey) {
      this.apiKey = config.apiKey;
    }
    if (config.apiEndpoint) {
      this.apiEndpoint = config.apiEndpoint;
    }
    if (config.cacheManager) {
      this.setCacheManager(config.cacheManager);
    }
    console.log('[CloudSearch] Configuration updated');
  }
}

module.exports = CloudSearchIntegration;
