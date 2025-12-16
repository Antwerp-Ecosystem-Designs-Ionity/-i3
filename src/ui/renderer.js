/**
 * ƐÏ3 Browser - Renderer Process
 * UI Logic and Event Handlers
 * 
 * IONITY (PTY) LTD
 */

// DOM Elements
const searchBar = document.getElementById('searchBar');
const urlBar = document.getElementById('urlBar');
const webview = document.getElementById('webview');
const welcomeScreen = document.getElementById('welcomeScreen');
const searchResults = document.getElementById('searchResults');
const resultsContent = document.getElementById('resultsContent');
const sshModal = document.getElementById('sshModal');
const infoModal = document.getElementById('infoModal');

// Buttons
const cloudSearchBtn = document.getElementById('cloudSearchBtn');
const edgeAIBtn = document.getElementById('edgeAIBtn');
const backBtn = document.getElementById('backBtn');
const forwardBtn = document.getElementById('forwardBtn');
const refreshBtn = document.getElementById('refreshBtn');
const goBtn = document.getElementById('goBtn');
const sshBtn = document.getElementById('sshBtn');
const infoBtn = document.getElementById('infoBtn');
const closeResultsBtn = document.getElementById('closeResultsBtn');
const sshConnectBtn = document.getElementById('sshConnectBtn');

// State
let currentUrl = '';
let isWelcomeVisible = true;

// Initialize
document.addEventListener('DOMContentLoaded', async () => {
    console.log('ƐÏ3 Browser UI initialized');
    setupEventListeners();
    await loadBrowserInfo();
});

// Event Listeners Setup
function setupEventListeners() {
    // Search functionality
    searchBar.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            const query = searchBar.value.trim();
            if (query) {
                performEdgeAISearch(query); // Default to Edge AI
            }
        }
    });

    cloudSearchBtn.addEventListener('click', () => {
        const query = searchBar.value.trim();
        if (query) {
            performCloudSearch(query);
        }
    });

    edgeAIBtn.addEventListener('click', () => {
        const query = searchBar.value.trim();
        if (query) {
            performEdgeAISearch(query);
        }
    });

    // URL navigation
    urlBar.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            navigateToUrl();
        }
    });

    goBtn.addEventListener('click', navigateToUrl);

    // Navigation controls
    backBtn.addEventListener('click', () => {
        if (webview && webview.canGoBack()) {
            webview.goBack();
        }
    });

    forwardBtn.addEventListener('click', () => {
        if (webview && webview.canGoForward()) {
            webview.goForward();
        }
    });

    refreshBtn.addEventListener('click', () => {
        if (webview) {
            webview.reload();
        }
    });

    // Modals
    sshBtn.addEventListener('click', openSSHModal);
    infoBtn.addEventListener('click', openInfoModal);
    closeResultsBtn.addEventListener('click', closeSearchResults);
    sshConnectBtn.addEventListener('click', connectSSH);

    // Webview events
    if (webview) {
        webview.addEventListener('did-start-loading', () => {
            console.log('Loading...');
        });

        webview.addEventListener('did-finish-load', () => {
            console.log('Loaded');
            hideWelcomeScreen();
        });

        webview.addEventListener('did-fail-load', (e) => {
            console.error('Failed to load:', e);
        });

        webview.addEventListener('page-title-updated', (e) => {
            console.log('Page title:', e.title);
        });

        webview.addEventListener('new-window', (e) => {
            console.log('New window:', e.url);
            webview.src = e.url;
        });
    }
}

// Navigation
function navigateToUrl() {
    let url = urlBar.value.trim();
    
    if (!url) {
        return;
    }

    // If it doesn't start with http:// or https://, add https://
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
        // Check if it looks like a domain
        if (url.includes('.') || url === 'localhost') {
            url = 'https://' + url;
        } else {
            // Treat as search query
            performEdgeAISearch(url);
            return;
        }
    }

    currentUrl = url;
    webview.src = url;
    hideWelcomeScreen();
}

// Search Functions
async function performCloudSearch(query) {
    console.log('CloudSearch query:', query);
    showSearchResults();
    
    try {
        const result = await window.ei3API.searchCloudSearch(query);
        displaySearchResults(result, 'CloudSearch');
    } catch (error) {
        console.error('CloudSearch error:', error);
        displayError('CloudSearch', error.message);
    }
}

async function performEdgeAISearch(query) {
    console.log('Edge AI search query:', query);
    showSearchResults();
    
    try {
        const result = await window.ei3API.searchEdgeAI(query);
        displaySearchResults(result, 'Edge AI');
    } catch (error) {
        console.error('Edge AI search error:', error);
        displayError('Edge AI', error.message);
    }
}

// Display Results
function displaySearchResults(result, source) {
    resultsContent.innerHTML = '';
    
    if (result.error) {
        displayError(source, result.error);
        return;
    }

    if (!result.success || !result.results || result.results.length === 0) {
        resultsContent.innerHTML = `
            <div class="result-item">
                <div class="result-title">No results found</div>
                <div class="result-snippet">Try a different search query.</div>
            </div>
        `;
        return;
    }

    // Display source info
    const sourceInfo = document.createElement('div');
    sourceInfo.style.padding = '10px';
    sourceInfo.style.marginBottom = '15px';
    sourceInfo.style.background = '#1e1e2e';
    sourceInfo.style.borderRadius = '8px';
    sourceInfo.innerHTML = `
        <strong>Source:</strong> ${source}<br>
        <strong>Query:</strong> ${result.query}<br>
        <strong>Results:</strong> ${result.results.length}
        ${result.message ? `<br><small style="color: #888;">${result.message}</small>` : ''}
    `;
    resultsContent.appendChild(sourceInfo);

    // Display results
    result.results.forEach(item => {
        const resultItem = document.createElement('div');
        resultItem.className = 'result-item';
        resultItem.innerHTML = `
            <div class="result-title" onclick="navigateToResult('${item.url}')">${item.title}</div>
            <div class="result-snippet">${item.snippet}</div>
            <div class="result-url">${item.url}</div>
        `;
        resultsContent.appendChild(resultItem);
    });
}

function displayError(source, message) {
    resultsContent.innerHTML = `
        <div class="result-item">
            <div class="result-title" style="color: #ff4444;">Error from ${source}</div>
            <div class="result-snippet">${message}</div>
        </div>
    `;
}

function navigateToResult(url) {
    urlBar.value = url;
    navigateToUrl();
    closeSearchResults();
}

// UI Controls
function showSearchResults() {
    searchResults.classList.remove('hidden');
}

function closeSearchResults() {
    searchResults.classList.add('hidden');
}

function hideWelcomeScreen() {
    if (isWelcomeVisible) {
        welcomeScreen.style.display = 'none';
        isWelcomeVisible = false;
    }
}

// SSH Modal
function openSSHModal() {
    sshModal.classList.remove('hidden');
}

function closeSSHModal() {
    sshModal.classList.add('hidden');
}

async function connectSSH() {
    const host = document.getElementById('sshHost').value;
    const port = document.getElementById('sshPort').value;
    const username = document.getElementById('sshUsername').value;
    const password = document.getElementById('sshPassword').value;
    const statusElement = document.getElementById('sshStatus');

    if (!host || !username || !password) {
        statusElement.className = 'status-message error';
        statusElement.textContent = 'Please fill in all required fields';
        return;
    }

    try {
        statusElement.className = 'status-message';
        statusElement.textContent = 'Connecting...';

        const result = await window.ei3API.sshConnect({
            host,
            port: parseInt(port),
            username,
            password
        });

        if (result.success) {
            statusElement.className = 'status-message success';
            statusElement.textContent = `Connected to ${result.host}`;
        } else {
            throw new Error(result.error || 'Connection failed');
        }
    } catch (error) {
        statusElement.className = 'status-message error';
        statusElement.textContent = error.message;
    }
}

// Info Modal
async function openInfoModal() {
    infoModal.classList.remove('hidden');
    const infoContent = document.getElementById('infoContent');
    
    try {
        const info = await window.ei3API.getBrowserInfo();
        const versions = window.ei3API.versions;
        
        infoContent.innerHTML = `
            <div style="line-height: 1.8; color: #e0e0e0;">
                <h4 style="color: #00d4ff; margin-bottom: 15px;">${info.name}</h4>
                <p><strong>Version:</strong> ${info.version}</p>
                <p><strong>Company:</strong> ${info.company}</p>
                <p><strong>Author:</strong> ${info.author}</p>
                <p><strong>Location:</strong> ${info.location}</p>
                <p><strong>Copyright:</strong> ${info.copyright}</p>
                <hr style="border: 1px solid #2a2a3e; margin: 20px 0;">
                <h4 style="color: #00d4ff; margin-bottom: 15px;">Technical Details</h4>
                <p><strong>Electron:</strong> ${versions.electron()}</p>
                <p><strong>Chromium:</strong> ${versions.chrome()}</p>
                <p><strong>Node.js:</strong> ${versions.node()}</p>
                <hr style="border: 1px solid #2a2a3e; margin: 20px 0;">
                <h4 style="color: #00d4ff; margin-bottom: 15px;">Features</h4>
                <ul style="list-style: none; padding: 0;">
                    <li>✓ Google CloudSearch Integration</li>
                    <li>✓ Microsoft Edge AI Search</li>
                    <li>✓ SSH Backend Support</li>
                    <li>✓ Sleek Modern Interface</li>
                    <li>✓ Chromium-based Engine</li>
                </ul>
                <hr style="border: 1px solid #2a2a3e; margin: 20px 0;">
                <p style="text-align: center; font-style: italic; color: #00d4ff; margin-top: 20px;">
                    ANYTHING IS POSSIBLE WITH GOD ❤️
                </p>
                <p style="text-align: center; font-size: 12px; color: #666; margin-top: 10px;">
                    ${info.trademark}
                </p>
            </div>
        `;
    } catch (error) {
        infoContent.innerHTML = `<p style="color: #ff4444;">Error loading browser info: ${error.message}</p>`;
    }
}

function closeInfoModal() {
    infoModal.classList.add('hidden');
}

// Load Browser Info
async function loadBrowserInfo() {
    try {
        const info = await window.ei3API.getBrowserInfo();
        console.log('Browser Info:', info);
        document.title = `${info.name} - ${info.company}`;
    } catch (error) {
        console.error('Error loading browser info:', error);
    }
}

// Make functions globally accessible for inline event handlers
window.closeSSHModal = closeSSHModal;
window.closeInfoModal = closeInfoModal;
window.navigateToResult = navigateToResult;
