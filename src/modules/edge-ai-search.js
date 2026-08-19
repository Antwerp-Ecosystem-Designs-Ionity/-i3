/**
 * ƐÏ3 Browser - Microsoft Edge AI Search Integration
 * Integration with Edge's AI-powered search capabilities
 * 
 * IONITY (PTY) LTD
 */

const axios = require('axios');
const SemanticCacheManager = require('./semantic-cache-manager');

class EdgeAISearch {
  /**
   * @param {Object} options Configuration options
   * @param {SemanticCacheManager} options.cacheManager Optional shared cache manager
   */
  constructor(options = {}) {
    this.bingApiEndpoint = 'https://api.bing.microsoft.com/v7.0';
    this.apiKey = process.env.BING_SEARCH_API_KEY || '';

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
   * Search using Edge AI / Bing Search API
   * @param {string} query - Search query
   * @returns {Promise<Object>} Search results with AI enhancement
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
    const cached = this.cacheManager.get(trimmedQuery, 'edge-ai');
    if (cached) {
      console.log(`[EdgeAI] Returning cached results for query: "${trimmedQuery}"`);
      return cached;
    }

    try {
      // If API key is not configured, return a simulated response
      if (!this.apiKey) {
        console.log('[EdgeAI] Search API key not configured - using simulation mode');
        const simResult = this.simulateEdgeSearch(trimmedQuery);
        this.cacheManager.set(trimmedQuery, simResult, 'edge-ai');
        return simResult;
      }

      // Validate API key format (basic validation)
      if (typeof this.apiKey !== 'string' || this.apiKey.length < 10) {
        console.warn('[EdgeAI] Invalid API key format - using simulation mode');
        const simResult = this.simulateEdgeSearch(trimmedQuery);
        this.cacheManager.set(trimmedQuery, simResult, 'edge-ai');
        return simResult;
      }

      // Make actual API call to Bing Search API
      const response = await axios.get(
        `${this.bingApiEndpoint}/search`,
        {
          params: {
            q: trimmedQuery,
            count: 10,
            mkt: 'en-US'
          },
          headers: {
            'Ocp-Apim-Subscription-Key': this.apiKey
          },
          timeout: 10000,
          validateStatus: (status) => {
            if (status === 429) {
              console.warn('Rate limit exceeded for Edge AI Search');
              return false;
            }
            return status >= 200 && status < 300;
          }
        }
      );

      const result = {
        success: true,
        query: trimmedQuery,
        results: this.formatBingResults(response.data),
        totalResults: response.data.webPages?.totalEstimatedMatches || 0,
        source: 'edge-ai-search',
        aiEnhanced: true
      };

      // Cache the result in Semantic LRU Cache
      this.cacheManager.set(trimmedQuery, result, 'edge-ai');

      return result;
    } catch (error) {
      console.error('[EdgeAI] Search error:', error.message);
      
      // Fallback to simulated search on error
      const fallbackResult = this.simulateEdgeSearch(trimmedQuery);
      this.cacheManager.set(trimmedQuery, fallbackResult, 'edge-ai');
      return fallbackResult;
    }
  }

  /**
   * Format Bing API results
   * @param {Object} data - Raw Bing API response
   * @returns {Array} Formatted results
   */
  formatBingResults(data) {
    if (!data.webPages || !data.webPages.value) {
      return [];
    }

    return data.webPages.value.map(result => ({
      title: result.name,
      snippet: result.snippet,
      url: result.url,
      displayUrl: result.displayUrl,
      dateLastCrawled: result.dateLastCrawled
    }));
  }

  /**
   * Simulate Edge AI search results when API is not available
   * @param {string} query - Search query
   * @returns {Object} Simulated search results
   */
  simulateEdgeSearch(query) {
    return {
      success: true,
      query: query,
      results: [
        {
          title: `Edge AI Search: ${query}`,
          snippet: 'Microsoft Edge AI Search integration is ready. Configure API key for live results with AI-powered insights.',
          url: `https://www.bing.com/search?q=${encodeURIComponent(query)}`,
          displayUrl: 'www.bing.com',
          source: 'edge-ai-simulation',
          aiEnhanced: true
        }
      ],
      totalResults: 1,
      source: 'edge-ai-search-simulation',
      aiEnhanced: true,
      message: 'Configure BING_SEARCH_API_KEY environment variable for live Edge AI search results'
    };
  }

  /**
   * Get AI-powered suggestions
   * @param {string} query - Partial query
   * @returns {Promise<Array>} Search suggestions
   */
  async getSuggestions(query) {
    if (!query || query.trim().length === 0) {
      return [];
    }

    try {
      if (!this.apiKey) {
        return this.simulateSuggestions(query);
      }

      const response = await axios.get(
        `${this.bingApiEndpoint}/suggestions`,
        {
          params: {
            q: query
          },
          headers: {
            'Ocp-Apim-Subscription-Key': this.apiKey
          },
          timeout: 5000
        }
      );

      return response.data.suggestionGroups?.[0]?.searchSuggestions || [];
    } catch (error) {
      console.error('[EdgeAI] Suggestions error:', error.message);
      return this.simulateSuggestions(query);
    }
  }

  /**
   * Simulate search suggestions
   * @param {string} query - Partial query
   * @returns {Array} Simulated suggestions
   */
  simulateSuggestions(query) {
    return [
      { displayText: `${query}`, query: query },
      { displayText: `${query} tutorial`, query: `${query} tutorial` },
      { displayText: `${query} examples`, query: `${query} examples` }
    ];
  }

  /**
   * Clear search cache
   */
  clearCache() {
    this.cacheManager.clearLRUCache();
    console.log('[EdgeAI] Search cache cleared via SemanticCacheManager');
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
      this.bingApiEndpoint = config.apiEndpoint;
    }
    if (config.cacheManager) {
      this.setCacheManager(config.cacheManager);
    }
    console.log('[EdgeAI] Search configuration updated');
  }
}

module.exports = EdgeAISearch;
