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
const cacheModal = document.getElementById('cacheModal');

// AI Panel Elements
const aiOptimizerPanel = document.getElementById('aiOptimizerPanel');
const aiOptimizedText = document.getElementById('aiOptimizedText');
const aiIntentTag = document.getElementById('aiIntentTag');
const aiSuggestionsContainer = document.getElementById('aiSuggestionsContainer');
const aiSynthesisCard = document.getElementById('aiSynthesisCard');
const synthesisText = document.getElementById('synthesisText');
const synthesisTakeaways = document.getElementById('synthesisTakeaways');

// Buttons
const cloudSearchBtn = document.getElementById('cloudSearchBtn');
const edgeAIBtn = document.getElementById('edgeAIBtn');
const aiOptimizeBtn = document.getElementById('aiOptimizeBtn');
const cacheCleanerBtn = document.getElementById('cacheCleanerBtn');
const backBtn = document.getElementById('backBtn');
const forwardBtn = document.getElementById('forwardBtn');
const refreshBtn = document.getElementById('refreshBtn');
const goBtn = document.getElementById('goBtn');
const sshBtn = document.getElementById('sshBtn');
const infoBtn = document.getElementById('infoBtn');
const closeResultsBtn = document.getElementById('closeResultsBtn');
const sshConnectBtn = document.getElementById('sshConnectBtn');

// Cache Modal Action Buttons
const cleanDeepBtn = document.getElementById('cleanDeepBtn');
const cleanLruBtn = document.getElementById('cleanLruBtn');
const cleanSemanticBtn = document.getElementById('cleanSemanticBtn');
const cleanBrowserBtn = document.getElementById('cleanBrowserBtn');
const cleanWinTempBtn = document.getElementById('cleanWinTempBtn');

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
                performEdgeAISearch(query);
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

    // AI Query Optimizer
    aiOptimizeBtn.addEventListener('click', handleAIOptimize);

    // Cache Cleaner Modal
    cacheCleanerBtn.addEventListener('click', openCacheModal);

    // Cache Cleaning Action Triggers
    cleanDeepBtn.addEventListener('click', handleDeepClean);
    cleanLruBtn.addEventListener('click', handleClearLRU);
    cleanSemanticBtn.addEventListener('click', handleClearSemantic);
    cleanBrowserBtn.addEventListener('click', handleClearBrowserSession);
    cleanWinTempBtn.addEventListener('click', handleCleanWindowsTemp);

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

    if (!url.startsWith('http://') && !url.startsWith('https://')) {
        if (url.includes('.') || url === 'localhost') {
            url = 'https://' + url;
        } else {
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

// AI Query Optimizer Handler
async function handleAIOptimize() {
    const rawQuery = searchBar.value.trim();
    if (!rawQuery) return;

    try {
        const optimized = await window.ei3API.optimizeAIQuery(rawQuery);
        if (optimized) {
            aiOptimizedText.textContent = optimized.optimizedQuery;
            aiIntentTag.textContent = optimized.intent;

            aiSuggestionsContainer.innerHTML = '';
            (optimized.suggestions || []).forEach(sugg => {
                const chip = document.createElement('span');
                chip.className = 'suggestion-chip';
                chip.textContent = sugg;
                chip.addEventListener('click', () => {
                    searchBar.value = sugg;
                    performEdgeAISearch(sugg);
                });
                aiSuggestionsContainer.appendChild(chip);
            });

            aiOptimizerPanel.classList.remove('hidden');
        }
    } catch (err) {
        console.error('Error optimizing AI query:', err);
    }
}

// Display Search Results & AI Synthesis
async function displaySearchResults(result, source) {
    resultsContent.innerHTML = '';
    
    if (result.error) {
        displayError(source, result.error);
        aiSynthesisCard.classList.add('hidden');
        return;
    }

    if (!result.success || !result.results || result.results.length === 0) {
        resultsContent.innerHTML = `
            <div class="result-item">
                <div class="result-title">No results found</div>
                <div class="result-snippet">Try a different search query.</div>
            </div>
        `;
        aiSynthesisCard.classList.add('hidden');
        return;
    }

    // AI Results Synthesis
    try {
        const synthesis = await window.ei3API.synthesizeAIResults(result.query, result.results);
        if (synthesis && synthesis.summary) {
            synthesisText.textContent = synthesis.summary;
            synthesisTakeaways.innerHTML = '';
            (synthesis.keyTakeaways || []).forEach(takeaway => {
                const item = document.createElement('div');
                item.className = 'takeaway-item';
                item.textContent = takeaway;
                synthesisTakeaways.appendChild(item);
            });
            aiSynthesisCard.classList.remove('hidden');
        }
    } catch (e) {
        aiSynthesisCard.classList.add('hidden');
    }

    // Source Info Header
    const sourceInfo = document.createElement('div');
    sourceInfo.style.padding = '10px';
    sourceInfo.style.marginBottom = '15px';
    sourceInfo.style.background = '#1e1e2e';
    sourceInfo.style.borderRadius = '8px';
    sourceInfo.innerHTML = `
        <strong>Source:</strong> ${source}<br>
        <strong>Query:</strong> ${result.query}<br>
        <strong>Results:</strong> ${result.results.length}
        ${result.semanticallyMatched ? `<br><span style="color: #a78bfa;">⚡ Semantic Cache Hit (${(result.similarityScore * 100).toFixed(0)}% match)</span>` : ''}
        ${result.message ? `<br><small style="color: #888;">${result.message}</small>` : ''}
    `;
    resultsContent.appendChild(sourceInfo);

    // Result List
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

// AI Cache Cleaner Modal Functions
async function openCacheModal() {
    cacheModal.classList.remove('hidden');
    await refreshCacheStats();
}

function closeCacheModal() {
    cacheModal.classList.add('hidden');
}

async function refreshCacheStats() {
    try {
        const response = await window.ei3API.getCacheStats();
        if (response && response.success) {
            updateCacheModalStats(response.stats, response.health);
        }
    } catch (err) {
        console.error('Error getting cache stats:', err);
    }
}

function updateCacheModalStats(stats, health) {
    if (!stats) return;

    document.getElementById('statCapacity').textContent = `${stats.currentSize} / ${stats.maxCapacity}`;
    document.getElementById('statMemory').textContent = stats.formattedMemorySize || '0 KB';
    document.getElementById('statHitRatio').textContent = `${stats.hitRatioPercentage}%`;
    document.getElementById('statSemanticHits').textContent = stats.semanticHits || 0;
    document.getElementById('statTotalCleaned').textContent = stats.formattedTotalBytesCleaned || '0 KB';

    if (health) {
        const healthBar = document.getElementById('cacheHealthBar');
        healthBar.className = `health-bar ${health.status || 'optimal'}`;
        document.getElementById('healthStatusText').textContent = (health.status || 'Optimal').toUpperCase();
        document.getElementById('healthRecommendationText').textContent = health.recommendation || 'Operating efficiently.';
    }

    // Populate Query Table
    const tbody = document.getElementById('cacheTableBody');
    tbody.innerHTML = '';

    if (!stats.cachedQueries || stats.cachedQueries.length === 0) {
        tbody.innerHTML = '<tr><td colspan="5" style="text-align:center; color: #888;">No cached queries yet.</td></tr>';
        return;
    }

    stats.cachedQueries.forEach(item => {
        const tr = document.createElement('tr');
        const ageSec = Math.round((Date.now() - item.timestamp) / 1000);
        tr.innerHTML = `
            <td style="font-weight:600; color:#00d4ff;">${item.query}</td>
            <td>${item.source}</td>
            <td>${item.sizeBytes} B</td>
            <td>${item.hitCount}</td>
            <td>${ageSec}s ago</td>
        `;
        tbody.appendChild(tr);
    });
}

// Cleaning Handlers
async function handleDeepClean() {
    showCacheStatus('Running One-Click Deep Clean...', 'info');
    const res = await window.ei3API.deepCleanCache();
    if (res && res.success) {
        showCacheStatus(`Deep Clean Complete! Freed ${res.summary.formattedBytesFreed}.`, 'success');
        await refreshCacheStats();
    } else {
        showCacheStatus('Deep Clean failed.', 'error');
    }
}

async function handleClearLRU() {
    const res = await window.ei3API.clearLRUCache();
    showCacheStatus(`LRU Cache Cleared (${res.entriesCleared} items removed).`, 'success');
    await refreshCacheStats();
}

async function handleClearSemantic() {
    const res = await window.ei3API.clearSemanticCache();
    showCacheStatus(`Semantic Query Cache Cleared.`, 'success');
    await refreshCacheStats();
}

async function handleClearBrowserSession() {
    const res = await window.ei3API.clearBrowserCache();
    showCacheStatus(`Browser Session & Webview Storage Cleared.`, 'success');
    await refreshCacheStats();
}

async function handleCleanWindowsTemp() {
    const res = await window.ei3API.cleanWindowsTempCache();
    if (res && res.success) {
        showCacheStatus(`Windows System Temp Cache Cleaned! Freed ${res.formattedBytesFreed}.`, 'success');
        await refreshCacheStats();
    } else {
        showCacheStatus('Windows Temp Clean failed.', 'error');
    }
}

function showCacheStatus(msg, type) {
    const el = document.getElementById('cacheStatusMessage');
    el.className = `status-message ${type}`;
    el.textContent = msg;
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
                    <li>✓ AI Semantic Query Caching & LRU Manager</li>
                    <li>✓ One-Click Windows System & AI Temp Cleaner</li>
                    <li>✓ Google CloudSearch Integration</li>
                    <li>✓ Microsoft Edge AI Search</li>
                    <li>✓ SSH Backend Support</li>
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
window.closeCacheModal = closeCacheModal;
window.navigateToResult = navigateToResult;
