/**
 * ƐÏ3 Browser - Main Process
 * 
 * IONITY (PTY) LTD
 * Author: Johan Wilhelm van Antwerp and R1 DS
 * 2018-2025+ | Centurion, South Africa
 * 
 * ANYTHING IS POSSIBLE WITH GOD <3
 */

const { app, BrowserWindow, ipcMain, session } = require('electron');
const path = require('path');
const SSHManager = require('./modules/ssh-manager');
const CloudSearchIntegration = require('./modules/cloudsearch-integration');
const EdgeAISearch = require('./modules/edge-ai-search');
const SemanticCacheManager = require('./modules/semantic-cache-manager');
const AIFeaturesManager = require('./modules/ai-features-manager');
const config = require('./config/config');

let mainWindow;
let sshManager;
let cloudSearchIntegration;
let edgeAISearch;
let semanticCacheManager;
let aiFeaturesManager;

// Initialize Cache and AI Managers
function initializeCacheAndAIManager() {
  semanticCacheManager = new SemanticCacheManager(config.semanticCache);
  aiFeaturesManager = new AIFeaturesManager(config.aiFeatures);
  console.log('[Main] SemanticCacheManager and AIFeaturesManager initialized');
}

// Initialize SSH Manager for backend support
function initializeSSHManager() {
  sshManager = new SSHManager();
  console.log('[Main] SSH Manager initialized - SSH backing and support enabled');
}

// Initialize CloudSearch Integration with shared cache manager
function initializeCloudSearch() {
  cloudSearchIntegration = new CloudSearchIntegration({
    cacheManager: semanticCacheManager
  });
  console.log('[Main] Google CloudSearch integration initialized with SemanticCacheManager');
}

// Initialize Edge AI Search with shared cache manager
function initializeEdgeAI() {
  edgeAISearch = new EdgeAISearch({
    cacheManager: semanticCacheManager
  });
  console.log('[Main] Edge AI Search integration initialized with SemanticCacheManager');
}

function createWindow() {
  // Create the browser window with sleek design
  mainWindow = new BrowserWindow({
    width: config.window.width || 1400,
    height: config.window.height || 900,
    minWidth: config.window.minWidth || 800,
    minHeight: config.window.minHeight || 600,
    title: 'ƐÏ3 Browser - IONITY',
    backgroundColor: config.window.backgroundColor || '#0f0f0f',
    frame: true,
    webPreferences: {
      nodeIntegration: config.security.nodeIntegration || false,
      contextIsolation: config.security.contextIsolation !== false,
      enableRemoteModule: false,
      preload: path.join(__dirname, 'preload.js'),
      webSecurity: config.security.webSecurity !== false,
      allowRunningInsecureContent: config.security.allowRunningInsecureContent || false
    },
    icon: path.join(__dirname, '../assets/icon.png')
  });

  // Load the browser UI
  mainWindow.loadFile(path.join(__dirname, 'ui/index.html'));

  // Handle navigation
  mainWindow.webContents.on('will-navigate', (event, url) => {
    console.log('[Main] Navigating to:', url);
  });

  // Configure session for enhanced privacy and performance
  session.defaultSession.webRequest.onBeforeSendHeaders((details, callback) => {
    details.requestHeaders['User-Agent'] = config.browser.userAgent;
    callback({ requestHeaders: details.requestHeaders });
  });

  // Open DevTools in development mode
  if (process.argv.includes('--dev')) {
    mainWindow.webContents.openDevTools();
  }

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

// IPC Handlers for communication between renderer and main process

// 1. Search Handlers
ipcMain.handle('search-cloudsearch', async (event, query) => {
  try {
    return await cloudSearchIntegration.search(query);
  } catch (error) {
    console.error('CloudSearch error:', error);
    return { error: error.message };
  }
});

ipcMain.handle('search-edge-ai', async (event, query) => {
  try {
    return await edgeAISearch.search(query);
  } catch (error) {
    console.error('Edge AI Search error:', error);
    return { error: error.message };
  }
});

// 2. Cache Cleaning IPC Handlers
ipcMain.handle('cache-get-stats', async () => {
  try {
    const stats = semanticCacheManager.getStats();
    const health = aiFeaturesManager.analyzeCacheHealth(stats);
    return {
      success: true,
      stats,
      health
    };
  } catch (error) {
    console.error('Cache stats error:', error);
    return { success: false, error: error.message };
  }
});

ipcMain.handle('cache-clear-lru', async () => {
  try {
    return semanticCacheManager.clearLRUCache();
  } catch (error) {
    console.error('Clear LRU error:', error);
    return { success: false, error: error.message };
  }
});

ipcMain.handle('cache-clear-semantic', async () => {
  try {
    return semanticCacheManager.clearSemanticCache();
  } catch (error) {
    console.error('Clear semantic error:', error);
    return { success: false, error: error.message };
  }
});

ipcMain.handle('cache-clear-browser', async () => {
  try {
    return await semanticCacheManager.clearBrowserSessionCache(session);
  } catch (error) {
    console.error('Clear browser session cache error:', error);
    return { success: false, error: error.message };
  }
});

ipcMain.handle('cache-clean-windows-temp', async () => {
  try {
    return semanticCacheManager.cleanWindowsTempCaches();
  } catch (error) {
    console.error('Clean Windows temp error:', error);
    return { success: false, error: error.message };
  }
});

ipcMain.handle('cache-deep-clean', async () => {
  try {
    return await semanticCacheManager.deepClean(session);
  } catch (error) {
    console.error('Deep clean error:', error);
    return { success: false, error: error.message };
  }
});

// 3. Additional AI Feature IPC Handlers
ipcMain.handle('ai-optimize-query', async (event, query) => {
  try {
    return aiFeaturesManager.optimizeQuery(query);
  } catch (error) {
    console.error('AI optimize query error:', error);
    return { originalQuery: query, error: error.message };
  }
});

ipcMain.handle('ai-synthesize-results', async (event, { query, results }) => {
  try {
    return aiFeaturesManager.synthesizeResults(query, results);
  } catch (error) {
    console.error('AI synthesis error:', error);
    return { query, error: error.message };
  }
});

ipcMain.handle('ai-get-neural-recall', async (event, currentQuery) => {
  try {
    return aiFeaturesManager.getNeuralRecall(currentQuery);
  } catch (error) {
    console.error('AI Neural Recall error:', error);
    return [];
  }
});

// 4. SSH Handlers
ipcMain.handle('ssh-connect', async (event, config) => {
  try {
    return await sshManager.connect(config);
  } catch (error) {
    console.error('SSH connection error:', error);
    return { error: error.message };
  }
});

ipcMain.handle('ssh-execute', async (event, command) => {
  try {
    return await sshManager.execute(command);
  } catch (error) {
    console.error('SSH execution error:', error);
    return { error: error.message };
  }
});

// 5. Browser Info Handler
ipcMain.handle('get-browser-info', async () => {
  return {
    name: config.browser.name,
    version: app.getVersion() || config.browser.version,
    company: config.company.name,
    author: config.company.author,
    location: config.company.location,
    copyright: config.company.copyright,
    trademark: config.company.trademark,
    motto: config.company.motto
  };
});

// App lifecycle
app.on('ready', () => {
  console.log('ƐÏ3 Browser starting...');
  console.log('IONITY (PTY) LTD - ANYTHING IS POSSIBLE WITH GOD <3');
  
  initializeCacheAndAIManager();
  initializeSSHManager();
  initializeCloudSearch();
  initializeEdgeAI();
  createWindow();
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (mainWindow === null) {
    createWindow();
  }
});

app.on('quit', () => {
  if (sshManager) {
    sshManager.disconnect();
  }
});
