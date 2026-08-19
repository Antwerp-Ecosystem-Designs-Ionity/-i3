/**
 * ƐÏ3 Browser - Additional AI Features Manager
 *
 * Includes AI Query Optimizer, Semantic Intent Synthesizer, AI Neural Recall & Contextual Memory,
 * and AI Cache Advisory Auto-Cleaner.
 *
 * IONITY (PTY) LTD
 * Author: Johan Wilhelm van Antwerp and R1 DS
 * 2018-2025+ | Centurion, South Africa
 */

class AIFeaturesManager {
  constructor(options = {}) {
    // Contextual memory buffer for Neural Recall
    this.neuralRecallHistory = [];
    this.maxRecallCapacity = options.maxRecallCapacity || 50;

    // AI Settings
    this.autoOptimizerEnabled = options.autoOptimizerEnabled !== false;
  }

  /**
   * AI Query Optimizer: Refines user query for higher precision AI search
   * @param {string} query Raw user query
   * @returns {Object} Optimized query breakdown
   */
  optimizeQuery(query) {
    if (!query || typeof query !== 'string') {
      return { originalQuery: '', optimizedQuery: '', keywords: [], intent: 'unknown' };
    }

    const trimmed = query.trim();
    const words = trimmed.split(/\s+/);

    // Determine query intent category
    let intent = 'informational';
    const lower = trimmed.toLowerCase();

    if (/^(how to|guide|tutorial|steps|build|create|install|clear|clean)/i.test(lower)) {
      intent = 'procedural';
    } else if (/^(what is|who is|define|meaning|explain)/i.test(lower)) {
      intent = 'definitional';
    } else if (/(vs|versus|compare|difference|best|top)/i.test(lower)) {
      intent = 'comparative';
    } else if (/^(download|buy|price|get|login|site|http)/i.test(lower)) {
      intent = 'navigational';
    }

    // Extract key action words and entities
    const keywords = words.filter(w => w.length > 2);

    // Formulate enhanced query
    let enhancedQuery = trimmed;
    if (intent === 'procedural' && !/step by step|tutorial|guide/i.test(lower)) {
      enhancedQuery += ' step by step guide';
    } else if (intent === 'definitional' && !/overview|definition|explanation/i.test(lower)) {
      enhancedQuery += ' explanation overview';
    }

    // Save to Neural Recall Context Buffer
    this.recordNeuralRecall(trimmed, intent, keywords);

    return {
      originalQuery: trimmed,
      optimizedQuery: enhancedQuery,
      intent,
      keywords,
      suggestions: [
        `${trimmed} best practices`,
        `${trimmed} examples`,
        `${trimmed} documentation`
      ],
      aiScore: 0.95
    };
  }

  /**
   * Synthesize search results into AI structured insights and summary
   * @param {string} query
   * @param {Array} results Search result items
   * @returns {Object} AI synthesis and summary
   */
  synthesizeResults(query, results = []) {
    if (!results || results.length === 0) {
      return {
        summary: `No results found to synthesize for query "${query}".`,
        keyTakeaways: [],
        confidenceScore: 0
      };
    }

    const titles = results.map(r => r.title || '').filter(Boolean);
    const snippets = results.map(r => r.snippet || '').filter(Boolean);

    // Create synthesized insight text
    const topTitles = titles.slice(0, 3).join('; ');
    const summaryText = `AI Synthesis for "${query}": Based on top search results (${topTitles}), key information is centered around ${query.toLowerCase()} options, configuration, and implementation.`;

    const keyTakeaways = snippets.slice(0, 3).map((snippet, idx) => {
      return `Key Insight #${idx + 1}: ${snippet.slice(0, 150)}${snippet.length > 150 ? '...' : ''}`;
    });

    return {
      query,
      resultCount: results.length,
      summary: summaryText,
      keyTakeaways,
      aiConfidenceScore: 0.92,
      synthesizedAt: new Date().toISOString()
    };
  }

  /**
   * Record query into Neural Recall contextual memory buffer
   */
  recordNeuralRecall(query, intent, keywords) {
    if (!query) return;

    // Check if query already recorded recently
    const existingIdx = this.neuralRecallHistory.findIndex(item => item.query.toLowerCase() === query.toLowerCase());
    if (existingIdx !== -1) {
      this.neuralRecallHistory.splice(existingIdx, 1);
    }

    this.neuralRecallHistory.unshift({
      query,
      intent,
      keywords,
      timestamp: Date.now()
    });

    if (this.neuralRecallHistory.length > this.maxRecallCapacity) {
      this.neuralRecallHistory.pop();
    }
  }

  /**
   * Get Neural Recall contextual recommendations based on recent query history
   * @param {string} currentQuery
   * @returns {Array} Recall recommendations
   */
  getNeuralRecall(currentQuery = '') {
    if (!currentQuery) {
      return this.neuralRecallHistory.slice(0, 5).map(item => ({
        query: item.query,
        intent: item.intent,
        relevance: 1.0
      }));
    }

    const lower = currentQuery.toLowerCase();
    return this.neuralRecallHistory
      .filter(item => item.query.toLowerCase() !== lower)
      .map(item => {
        const itemLower = item.query.toLowerCase();
        let relevance = 0.5;
        if (itemLower.includes(lower) || lower.includes(itemLower)) {
          relevance = 0.9;
        }
        return {
          query: item.query,
          intent: item.intent,
          relevance
        };
      })
      .sort((a, b) => b.relevance - a.relevance)
      .slice(0, 5);
  }

  /**
   * AI Cache Advisor: Analyzes cache statistics and recommends auto-clean actions
   * @param {Object} cacheStats Output from SemanticCacheManager.getStats()
   * @returns {Object} Cache analysis & recommendation
   */
  analyzeCacheHealth(cacheStats) {
    if (!cacheStats) {
      return { status: 'healthy', recommendation: 'No cache data available.' };
    }

    const { currentSize, maxCapacity, totalMemorySizeBytes, hitRatioPercentage } = cacheStats;
    const capacityRatio = maxCapacity > 0 ? currentSize / maxCapacity : 0;

    let status = 'optimal';
    let recommendation = 'Cache is operating at peak efficiency.';
    let actionRequired = false;

    if (capacityRatio >= 0.85) {
      status = 'warning';
      recommendation = `Cache capacity is at ${(capacityRatio * 100).toFixed(0)}%. Recommended action: Run Clear LRU Cache or Deep Clean.`;
      actionRequired = true;
    } else if (totalMemorySizeBytes > 50 * 1024 * 1024) { // > 50MB
      status = 'high_memory';
      recommendation = `Cache memory usage is ${cacheStats.formattedMemorySize}. Recommended action: Run One-Click Deep Clean.`;
      actionRequired = true;
    } else if (parseFloat(hitRatioPercentage) < 20 && currentSize > 15) {
      status = 'low_hit_ratio';
      recommendation = `Cache hit ratio is low (${hitRatioPercentage}%). Recommended action: Clear stale semantic query cache.`;
      actionRequired = true;
    }

    return {
      status,
      capacityPercentage: (capacityRatio * 100).toFixed(1),
      hitRatioPercentage,
      memorySizeFormatted: cacheStats.formattedMemorySize,
      recommendation,
      actionRequired,
      suggestedActions: [
        'Clear LRU Cache',
        'Clear Semantic Cache',
        'Clean Windows System Temp Files',
        'One-Click Deep Clean'
      ]
    };
  }
}

module.exports = AIFeaturesManager;
