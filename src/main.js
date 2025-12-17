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

let mainWindow;
let sshManager;
let cloudSearchIntegration;
let edgeAISearch;

// Initialize SSH Manager for backend support
function initializeSSHManager() {
  sshManager = new SSHManager();
  console.log('SSH Manager initialized - SSH backing and support enabled');
}

// Initialize CloudSearch Integration
function initializeCloudSearch() {
  cloudSearchIntegration = new CloudSearchIntegration();
  console.log('Google CloudSearch integration initialized');
}

// Initialize Edge AI Search
function initializeEdgeAI() {
  edgeAISearch = new EdgeAISearch();
  console.log('Edge AI Search integration initialized');
}

function createWindow() {
  // Create the browser window with sleek design
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 800,
    minHeight: 600,
    title: 'ƐÏ3 Browser - IONITY',
    backgroundColor: '#0f0f0f',
    frame: true,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      enableRemoteModule: false,
      preload: path.join(__dirname, 'preload.js'),
      webSecurity: true,
      allowRunningInsecureContent: false
    },
    icon: path.join(__dirname, '../assets/icon.png')
  });

  // Load the browser UI
  mainWindow.loadFile(path.join(__dirname, 'ui/index.html'));

  // Handle navigation and search
  mainWindow.webContents.on('will-navigate', (event, url) => {
    console.log('Navigating to:', url);
    // Allow navigation - this is a browser
  });

  // Configure session for enhanced privacy and performance
  session.defaultSession.webRequest.onBeforeSendHeaders((details, callback) => {
    details.requestHeaders['User-Agent'] = 'ƐÏ3-Browser/1.0 (IONITY) Chrome/120.0.0.0';
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

ipcMain.handle('get-browser-info', async () => {
  return {
    name: 'ƐÏ3 Browser',
    version: app.getVersion(),
    company: 'IONITY (PTY) LTD',
    author: 'Johan Wilhelm van Antwerp and R1 DS',
    location: 'Centurion, South Africa',
    copyright: '2018-2025+',
    trademark: 'ƐÏ3 | AEDI | ƐÏ3 | AMPIES | 986 AED | 6ƐÏ39 | NeTzeR'
  };
});

// App lifecycle
app.on('ready', () => {
  console.log('ƐÏ3 Browser starting...');
  console.log('IONITY (PTY) LTD - ANYTHING IS POSSIBLE WITH GOD <3');
  
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
