/**
 * ƐÏ3 Browser - Semantic Query & LRU Cache Unit / Integration Tests
 *
 * IONITY (PTY) LTD
 * Author: Johan Wilhelm van Antwerp and R1 DS
 * 2018-2025+ | Centurion, South Africa
 */

const assert = require('assert');
const fs = require('fs');
const path = require('path');
const os = require('os');

const SemanticCacheManager = require('../src/modules/semantic-cache-manager');
const AIFeaturesManager = require('../src/modules/ai-features-manager');

console.log('===================================================');
console.log('  Running ƐÏ3 Browser & AI Cache Cleaner Unit Tests');
console.log('===================================================');

let testsPassed = 0;
let totalTests = 0;

function runTest(name, fn) {
  totalTests++;
  try {
    fn();
    console.log(`  ✓ PASS: ${name}`);
    testsPassed++;
  } catch (err) {
    console.error(`  ✗ FAIL: ${name}`);
    console.error(`    ${err.message}`);
    process.exitCode = 1;
  }
}

async function runAsyncTest(name, fn) {
  totalTests++;
  try {
    await fn();
    console.log(`  ✓ PASS: ${name}`);
    testsPassed++;
  } catch (err) {
    console.error(`  ✗ FAIL: ${name}`);
    console.error(`    ${err.message}`);
    process.exitCode = 1;
  }
}

// -------------------------------------------------------------
// 1. SemanticCacheManager Tests
// -------------------------------------------------------------
console.log('\n[1] SemanticCacheManager Tests');

runTest('Exact LRU Cache set and get', () => {
  const cache = new SemanticCacheManager({ maxCapacity: 10 });
  cache.set('electron browser', { title: 'Electron' }, 'edge-ai');

  const result = cache.get('electron browser', 'edge-ai');
  assert.ok(result, 'Result should be returned');
  assert.strictEqual(result.title, 'Electron');
});

runTest('LRU Capacity Eviction (Capacity = 3)', () => {
  const cache = new SemanticCacheManager({ maxCapacity: 3 });
  cache.set('q1', { data: 1 }, 'test');
  cache.set('q2', { data: 2 }, 'test');
  cache.set('q3', { data: 3 }, 'test');

  // q1, q2, q3 in cache. Now add q4. q1 should be evicted.
  cache.set('q4', { data: 4 }, 'test');

  assert.strictEqual(cache.get('q1', 'test'), null, 'q1 should have been evicted by LRU');
  assert.ok(cache.get('q2', 'test'), 'q2 should still exist');
  assert.ok(cache.get('q4', 'test'), 'q4 should exist');
});

runTest('Semantic Similarity Query Matching', () => {
  const cache = new SemanticCacheManager({ similarityThreshold: 0.8 });
  cache.set('how to clear cache in windows', { solution: 'Use Cache Cleaner' }, 'cloudsearch');

  // Query with slightly different wording but same semantic meaning
  const semResult = cache.get('how to clean cache in windows', 'cloudsearch');
  assert.ok(semResult, 'Semantic match should be found');
  assert.strictEqual(semResult.semanticallyMatched, true, 'Should be flagged as semantically matched');
  assert.ok(semResult.similarityScore >= 0.8, 'Similarity score should be >= 0.8');
});

runTest('Clear LRU Cache & Clear Semantic Cache', () => {
  const cache = new SemanticCacheManager();
  cache.set('queryA', { a: 1 }, 'test');
  cache.set('queryB', { b: 2 }, 'test');

  const statsBefore = cache.getStats();
  assert.strictEqual(statsBefore.currentSize, 2);

  const clearRes = cache.clearLRUCache();
  assert.strictEqual(clearRes.entriesCleared, 2);

  const statsAfter = cache.getStats();
  assert.strictEqual(statsAfter.currentSize, 0);
});

runTest('Windows Temp Cache Cleaning logic', () => {
  const cache = new SemanticCacheManager();

  // Create dummy temp files in os.tmpdir()/ei3-ai-temp
  const dummyFolder = path.join(os.tmpdir(), 'ei3-ai-temp');
  if (!fs.existsSync(dummyFolder)) {
    fs.mkdirSync(dummyFolder, { recursive: true });
  }
  const dummyFile = path.join(dummyFolder, 'test-cache-file.tmp');
  fs.writeFileSync(dummyFile, 'Dummy cache data content', 'utf8');

  const cleanRes = cache.cleanWindowsTempCaches();
  assert.strictEqual(cleanRes.success, true);
  assert.ok(cleanRes.bytesFreed > 0, 'Bytes freed should be greater than 0');
});

// -------------------------------------------------------------
// 2. AIFeaturesManager Tests
// -------------------------------------------------------------
console.log('\n[2] AIFeaturesManager Tests');

runTest('AI Query Optimizer', () => {
  const ai = new AIFeaturesManager();
  const opt = ai.optimizeQuery('how to clear semantic cache');

  assert.strictEqual(opt.intent, 'procedural');
  assert.ok(opt.optimizedQuery.includes('guide') || opt.optimizedQuery.includes('clear'), 'Query should be optimized');
  assert.ok(Array.isArray(opt.suggestions), 'Suggestions should be an array');
});

runTest('AI Results Synthesizer', () => {
  const ai = new AIFeaturesManager();
  const sampleResults = [
    { title: 'Semantic Query Caching', snippet: 'Caching semantic queries improves AI response speeds.' },
    { title: 'LRU Cache Management', snippet: 'LRU evicts least recently accessed entries.' }
  ];

  const synthesis = ai.synthesizeResults('semantic cache', sampleResults);
  assert.ok(synthesis.summary.includes('semantic cache'));
  assert.strictEqual(synthesis.keyTakeaways.length, 2);
});

runTest('AI Neural Recall Contextual Memory', () => {
  const ai = new AIFeaturesManager();
  ai.optimizeQuery('electron browser setup');
  ai.optimizeQuery('windows cache cleaner guide');

  const recall = ai.getNeuralRecall('windows');
  assert.ok(recall.length > 0, 'Should return recall query items');
});

runTest('AI Cache Health Advisor', () => {
  const ai = new AIFeaturesManager();
  const mockStats = {
    currentSize: 90,
    maxCapacity: 100,
    totalMemorySizeBytes: 1024 * 1024 * 5,
    formattedMemorySize: '5 MB',
    hitRatioPercentage: '85.0'
  };

  const health = ai.analyzeCacheHealth(mockStats);
  assert.strictEqual(health.status, 'warning');
  assert.strictEqual(health.actionRequired, true);
});

// Summary
(async () => {
  console.log('\n===================================================');
  console.log(`  Tests Completed: ${testsPassed} / ${totalTests} Passed`);
  console.log('===================================================');

  if (testsPassed !== totalTests) {
    process.exit(1);
  }
})();
