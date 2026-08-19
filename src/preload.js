/**
 * ƐÏ3 Browser - Preload Script
 * Secure bridge between renderer and main process
 * 
 * IONITY (PTY) LTD
 */

const { contextBridge, ipcRenderer } = require('electron');

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld('ei3API', {
  // CloudSearch integration
  searchCloudSearch: (query) => ipcRenderer.invoke('search-cloudsearch', query),
  
  // Edge AI Search integration
  searchEdgeAI: (query) => ipcRenderer.invoke('search-edge-ai', query),

  // Semantic Caching & LRU Cleaning
  getCacheStats: () => ipcRenderer.invoke('cache-get-stats'),
  clearLRUCache: () => ipcRenderer.invoke('cache-clear-lru'),
  clearSemanticCache: () => ipcRenderer.invoke('cache-clear-semantic'),
  clearBrowserCache: () => ipcRenderer.invoke('cache-clear-browser'),
  cleanWindowsTempCache: () => ipcRenderer.invoke('cache-clean-windows-temp'),
  deepCleanCache: () => ipcRenderer.invoke('cache-deep-clean'),

  // Additional AI Features
  optimizeAIQuery: (query) => ipcRenderer.invoke('ai-optimize-query', query),
  synthesizeAIResults: (query, results) => ipcRenderer.invoke('ai-synthesize-results', { query, results }),
  getAINeuralRecall: (currentQuery) => ipcRenderer.invoke('ai-get-neural-recall', currentQuery),

  // SSH backend support
  sshConnect: (config) => ipcRenderer.invoke('ssh-connect', config),
  sshExecute: (command) => ipcRenderer.invoke('ssh-execute', command),
  
  // Browser information
  getBrowserInfo: () => ipcRenderer.invoke('get-browser-info'),
  
  // Version info
  versions: {
    node: () => process.versions.node,
    chrome: () => process.versions.chrome,
    electron: () => process.versions.electron
  }
});
