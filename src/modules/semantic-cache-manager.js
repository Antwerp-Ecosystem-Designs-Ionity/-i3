/**
 * ƐÏ3 Browser - Semantic Query & LRU Cache Manager
 *
 * Advanced LRU (Least Recently Used) and Semantic Query Cache Engine with
 * deep cleaning capabilities for browser session and Windows system AI temp caches.
 *
 * IONITY (PTY) LTD
 * Author: Johan Wilhelm van Antwerp and R1 DS
 * 2018-2025+ | Centurion, South Africa
 */

const fs = require('fs');
const path = require('path');
const os = require('os');

class SemanticCacheManager {
  /**
   * @param {Object} options Configuration options
   * @param {number} options.maxCapacity Maximum entries in LRU cache (default: 100)
   * @param {number} options.ttl Time to live in ms (default: 300000 / 5 mins)
   * @param {number} options.similarityThreshold Semantic similarity threshold (0.0 - 1.0, default: 0.85)
   */
  constructor(options = {}) {
    this.maxCapacity = options.maxCapacity || 100;
    this.ttl = options.ttl || 300000; // 5 minutes
    this.similarityThreshold = options.similarityThreshold || 0.85;

    // Map maintains insertion order: key -> { value, timestamp, lastAccessed, sizeBytes, query, source, hitCount }
    this.lruMap = new Map();

    // Semantic index for quick similarity lookup: normalizedQuery -> cacheKey
    this.semanticIndex = new Map();

    // Statistics tracking
    this.stats = {
      hits: 0,
      misses: 0,
      semanticHits: 0,
      lruEvictions: 0,
      ttlEvictions: 0,
      totalCleanRuns: 0,
      totalBytesCleaned: 0,
      lastCleanedAt: null
    };

    // Synonym map for semantic normalization
    this.synonyms = new Map([
      ['clean', 'clear'],
      ['clearing', 'clear'],
      ['cleaning', 'clear'],
      ['prune', 'clear'],
      ['pruning', 'clear'],
      ['purge', 'clear'],
      ['purging', 'clear'],
      ['flush', 'clear'],
      ['flushing', 'clear'],
      ['remove', 'clear'],
      ['removing', 'clear'],
      ['delete', 'clear'],
      ['deleting', 'clear'],
      ['caches', 'cache'],
      ['caching', 'cache'],
      ['cached', 'cache'],
      ['searches', 'search'],
      ['searching', 'search'],
      ['optimizes', 'optimize'],
      ['optimizing', 'optimize'],
      ['optimization', 'optimize'],
      ['installer', 'install'],
      ['installers', 'install'],
      ['installing', 'install'],
      ['setup', 'install']
    ]);
  }

  /**
   * Normalize query string for semantic comparison
   * @param {string} query
   * @returns {string} Normalized string
   */
  normalizeQuery(query) {
    if (!query || typeof query !== 'string') return '';

    // Stopwords set for semantic normalization
    const stopWords = new Set([
      'a', 'an', 'and', 'are', 'as', 'at', 'be', 'by', 'for', 'from',
      'has', 'he', 'in', 'is', 'it', 'its', 'of', 'on', 'that', 'the',
      'to', 'was', 'were', 'will', 'with', 'what', 'where', 'how', 'when'
    ]);

    const tokens = query
      .toLowerCase()
      .replace(/[^\w\s]/gi, ' ') // Remove punctuation
      .split(/\s+/)
      .filter(token => token.length > 0 && !stopWords.has(token));

    // Map synonyms
    const normalizedTokens = tokens.map(token => this.synonyms.get(token) || token);

    return normalizedTokens.join(' ').trim();
  }

  /**
   * Calculate Jaccard similarity between two tokenized strings (0.0 to 1.0)
   */
  calculateJaccardSimilarity(str1, str2) {
    const tokens1 = new Set(str1.split(/\s+/).filter(Boolean));
    const tokens2 = new Set(str2.split(/\s+/).filter(Boolean));

    if (tokens1.size === 0 && tokens2.size === 0) return 1.0;
    if (tokens1.size === 0 || tokens2.size === 0) return 0.0;

    let intersectionSize = 0;
    for (const token of tokens1) {
      if (tokens2.has(token)) {
        intersectionSize++;
      }
    }

    const unionSize = new Set([...tokens1, ...tokens2]).size;
    return unionSize === 0 ? 0.0 : intersectionSize / unionSize;
  }

  /**
   * Calculate normalized Levenshtein similarity (0.0 to 1.0)
   */
  calculateLevenshteinSimilarity(str1, str2) {
    if (str1 === str2) return 1.0;
    if (!str1.length || !str2.length) return 0.0;

    const len1 = str1.length;
    const len2 = str2.length;
    const matrix = Array.from({ length: len1 + 1 }, () => new Array(len2 + 1).fill(0));

    for (let i = 0; i <= len1; i++) matrix[i][0] = i;
    for (let j = 0; j <= len2; j++) matrix[0][j] = j;

    for (let i = 1; i <= len1; i++) {
      for (let j = 1; j <= len2; j++) {
        const cost = str1[i - 1] === str2[j - 1] ? 0 : 1;
        matrix[i][j] = Math.min(
          matrix[i - 1][j] + 1,
          matrix[i][j - 1] + 1,
          matrix[i - 1][j - 1] + cost
        );
      }
    }

    const distance = matrix[len1][len2];
    const maxLength = Math.max(len1, len2);
    return 1 - distance / maxLength;
  }

  /**
   * Combined semantic similarity score
   */
  calculateSemanticSimilarity(q1, q2) {
    const norm1 = this.normalizeQuery(q1);
    const norm2 = this.normalizeQuery(q2);

    if (norm1 === norm2) return 1.0;

    const jaccard = this.calculateJaccardSimilarity(norm1, norm2);
    const levenshtein = this.calculateLevenshteinSimilarity(norm1, norm2);

    // Weighted combination: Jaccard (60%) + Levenshtein (40%)
    return (jaccard * 0.6) + (levenshtein * 0.4);
  }

  /**
   * Get value from cache with LRU update and semantic query matching
   * @param {string} query
   * @param {string} source Optional source scope (e.g., 'cloudsearch', 'edge-ai')
   * @returns {Object|null} Cached item or null
   */
  get(query, source = 'all') {
    if (!query) return null;

    const exactKey = `${source}:${query.trim()}`;

    // 1. Exact Match Check
    if (this.lruMap.has(exactKey)) {
      const entry = this.lruMap.get(exactKey);

      // Check TTL
      if (Date.now() - entry.timestamp > this.ttl) {
        this.lruMap.delete(exactKey);
        this.stats.ttlEvictions++;
        this.stats.misses++;
        return null;
      }

      // Update LRU position (delete and re-set)
      entry.lastAccessed = Date.now();
      entry.hitCount++;
      this.lruMap.delete(exactKey);
      this.lruMap.set(exactKey, entry);

      this.stats.hits++;
      console.log(`[SemanticCache] Exact LRU cache hit for: "${query}"`);
      return entry.value;
    }

    // 2. Semantic Match Check
    let bestMatchKey = null;
    let highestScore = 0;

    for (const [key, entry] of this.lruMap.entries()) {
      if (source !== 'all' && entry.source !== source) continue;

      // Check TTL
      if (Date.now() - entry.timestamp > this.ttl) {
        continue;
      }

      const score = this.calculateSemanticSimilarity(query, entry.query);
      if (score >= this.similarityThreshold && score > highestScore) {
        highestScore = score;
        bestMatchKey = key;
      }
    }

    if (bestMatchKey) {
      const entry = this.lruMap.get(bestMatchKey);
      entry.lastAccessed = Date.now();
      entry.hitCount++;
      this.lruMap.delete(bestMatchKey);
      this.lruMap.set(bestMatchKey, entry);

      this.stats.hits++;
      this.stats.semanticHits++;
      console.log(`[SemanticCache] Semantic cache hit (${(highestScore * 100).toFixed(1)}% match) for: "${query}" -> "${entry.query}"`);

      return {
        ...entry.value,
        semanticallyMatched: true,
        matchedQuery: entry.query,
        similarityScore: highestScore
      };
    }

    this.stats.misses++;
    return null;
  }

  /**
   * Set value into LRU and Semantic Cache
   * @param {string} query
   * @param {Object} value
   * @param {string} source
   */
  set(query, value, source = 'default') {
    if (!query) return;

    const cacheKey = `${source}:${query.trim()}`;
    const serialized = JSON.stringify(value || {});
    const sizeBytes = Buffer.byteLength(serialized, 'utf8');

    // Evict if capacity reached
    if (this.lruMap.size >= this.maxCapacity && !this.lruMap.has(cacheKey)) {
      // First key in map is the least recently used
      const oldestKey = this.lruMap.keys().next().value;
      if (oldestKey) {
        this.lruMap.delete(oldestKey);
        this.stats.lruEvictions++;
        console.log(`[SemanticCache] Evicted LRU key: ${oldestKey}`);
      }
    }

    const entry = {
      query: query.trim(),
      normalizedQuery: this.normalizeQuery(query),
      value: value,
      source: source,
      timestamp: Date.now(),
      lastAccessed: Date.now(),
      sizeBytes: sizeBytes,
      hitCount: 0
    };

    if (this.lruMap.has(cacheKey)) {
      this.lruMap.delete(cacheKey);
    }

    this.lruMap.set(cacheKey, entry);
  }

  /**
   * Clear LRU search cache
   */
  clearLRUCache() {
    const size = this.lruMap.size;
    this.lruMap.clear();
    console.log(`[SemanticCache] Cleared ${size} entries from LRU cache.`);
    return {
      success: true,
      entriesCleared: size
    };
  }

  /**
   * Clear semantic query index and cache
   */
  clearSemanticCache() {
    const size = this.lruMap.size;
    this.semanticIndex.clear();
    this.lruMap.clear();
    console.log(`[SemanticCache] Cleared semantic cache.`);
    return {
      success: true,
      entriesCleared: size
    };
  }

  /**
   * Clear Chromium / Electron session webview cache & storage
   * @param {Object} electronSession - Electron session instance
   */
  async clearBrowserSessionCache(electronSession) {
    try {
      if (electronSession && electronSession.defaultSession) {
        await electronSession.defaultSession.clearCache();
        await electronSession.defaultSession.clearStorageData({
          storages: ['appcache', 'cookies', 'filesystem', 'indexdb', 'localstorage', 'shadercache', 'websql', 'serviceworkers', 'cachestorage']
        });
        console.log('[SemanticCache] Cleared Electron browser session cache and storage data');
        return { success: true };
      }
    } catch (error) {
      console.error('[SemanticCache] Error clearing session cache:', error.message);
      return { success: false, error: error.message };
    }
    return { success: true, message: 'Session clean requested' };
  }

  /**
   * Clean Windows system temp directories & application AI caches
   * @returns {Object} Clean summary with bytes freed
   */
  cleanWindowsTempCaches() {
    let bytesFreed = 0;
    let filesRemoved = 0;

    const targets = [];

    // Windows local appdata temp directory
    if (process.platform === 'win32') {
      const localAppData = process.env.LOCALAPPDATA;
      const tempPath = process.env.TEMP || process.env.TMP;

      if (tempPath && fs.existsSync(tempPath)) {
        targets.push(path.join(tempPath, 'ei3-browser-cache'));
        targets.push(path.join(tempPath, 'ei3-ai-temp'));
      }

      if (localAppData && fs.existsSync(localAppData)) {
        targets.push(path.join(localAppData, 'ƐÏ3-Browser', 'Cache'));
        targets.push(path.join(localAppData, 'ƐÏ3-Browser', 'GPUCache'));
        targets.push(path.join(localAppData, 'ƐÏ3-Browser', 'Code Cache'));
      }
    } else {
      // Fallback cross-platform temp directory
      const tmpDir = os.tmpdir();
      targets.push(path.join(tmpDir, 'ei3-browser-cache'));
      targets.push(path.join(tmpDir, 'ei3-ai-temp'));
    }

    // Helper recursive deletion & size calculation
    const cleanDirectory = (dirPath) => {
      if (!fs.existsSync(dirPath)) return;

      try {
        const items = fs.readdirSync(dirPath);
        for (const item of items) {
          const itemPath = path.join(dirPath, item);
          try {
            const stat = fs.statSync(itemPath);
            if (stat.isDirectory()) {
              cleanDirectory(itemPath);
              fs.rmdirSync(itemPath);
            } else {
              bytesFreed += stat.size;
              fs.unlinkSync(itemPath);
              filesRemoved++;
            }
          } catch (e) {
            // Ignore locked/in-use files
          }
        }
      } catch (err) {
        console.warn(`[SemanticCache] Skipped path ${dirPath}: ${err.message}`);
      }
    };

    for (const targetPath of targets) {
      cleanDirectory(targetPath);
    }

    this.stats.totalCleanRuns++;
    this.stats.totalBytesCleaned += bytesFreed;
    this.stats.lastCleanedAt = new Date().toISOString();

    return {
      success: true,
      filesRemoved,
      bytesFreed,
      formattedBytesFreed: this.formatBytes(bytesFreed)
    };
  }

  /**
   * One-Click Deep Clean & Cache Optimization
   * Executes LRU clear, Semantic clear, and Windows System/Temp Cache Clean
   */
  async deepClean(electronSession) {
    const lruResult = this.clearLRUCache();
    const semanticResult = this.clearSemanticCache();
    const sessionResult = await this.clearBrowserSessionCache(electronSession);
    const winTempResult = this.cleanWindowsTempCaches();

    const totalBytesFreed = winTempResult.bytesFreed;

    return {
      success: true,
      timestamp: new Date().toISOString(),
      summary: {
        lruEntriesCleared: lruResult.entriesCleared,
        semanticEntriesCleared: semanticResult.entriesCleared,
        browserSessionCleared: sessionResult.success,
        windowsFilesRemoved: winTempResult.filesRemoved,
        bytesFreed: totalBytesFreed,
        formattedBytesFreed: this.formatBytes(totalBytesFreed)
      }
    };
  }

  /**
   * Helper to format bytes to human readable string
   */
  formatBytes(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  /**
   * Get detailed cache statistics and metrics
   */
  getStats() {
    let totalMemorySizeBytes = 0;
    const items = [];

    for (const [key, entry] of this.lruMap.entries()) {
      totalMemorySizeBytes += entry.sizeBytes || 0;
      items.push({
        key,
        query: entry.query,
        source: entry.source,
        timestamp: entry.timestamp,
        lastAccessed: entry.lastAccessed,
        hitCount: entry.hitCount,
        sizeBytes: entry.sizeBytes
      });
    }

    const totalRequests = this.stats.hits + this.stats.misses;
    const hitRatio = totalRequests > 0 ? (this.stats.hits / totalRequests) * 100 : 0;

    return {
      maxCapacity: this.maxCapacity,
      currentSize: this.lruMap.size,
      ttlMs: this.ttl,
      similarityThreshold: this.similarityThreshold,
      hits: this.stats.hits,
      misses: this.stats.misses,
      semanticHits: this.stats.semanticHits,
      hitRatioPercentage: hitRatio.toFixed(1),
      lruEvictions: this.stats.lruEvictions,
      ttlEvictions: this.stats.ttlEvictions,
      totalMemorySizeBytes: totalMemorySizeBytes,
      formattedMemorySize: this.formatBytes(totalMemorySizeBytes),
      totalCleanRuns: this.stats.totalCleanRuns,
      totalBytesCleaned: this.stats.totalBytesCleaned,
      formattedTotalBytesCleaned: this.formatBytes(this.stats.totalBytesCleaned),
      lastCleanedAt: this.stats.lastCleanedAt,
      cachedQueries: items
    };
  }

  /**
   * Update manager options dynamically
   */
  configure(config = {}) {
    if (config.maxCapacity) this.maxCapacity = config.maxCapacity;
    if (config.ttl) this.ttl = config.ttl;
    if (config.similarityThreshold) this.similarityThreshold = config.similarityThreshold;
  }
}

module.exports = SemanticCacheManager;
