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
