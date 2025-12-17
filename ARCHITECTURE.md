# ƐÏ3 Browser - Architecture Documentation

## Overview

ƐÏ3 Browser is a modern, Chromium-based web browser built with Electron, featuring integrated Google CloudSearch, Microsoft Edge AI Search capabilities, and SSH backend support.

## Technology Stack

### Core Technologies
- **Electron 28.0.0** - Cross-platform desktop application framework
- **Chromium** - Web rendering engine (reference: AntwerpDesignsIonitychromium-OG)
- **Node.js** - JavaScript runtime for backend operations
- **HTML5/CSS3** - Modern web standards for UI

### Key Dependencies
- **ssh2 (^1.15.0)** - SSH2 client for Node.js
- **axios (^1.6.2)** - Promise-based HTTP client
- **electron-builder (^24.9.1)** - Build and package for distribution

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                        ƐÏ3 Browser                              │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌──────────────┐          ┌──────────────┐                   │
│  │   Main UI    │          │   Webview    │                   │
│  │  (Renderer)  │◄────────►│  (Chromium)  │                   │
│  │              │          │              │                   │
│  │  - Search    │          │  - Browse    │                   │
│  │  - URL Bar   │          │  - Render    │                   │
│  │  - Controls  │          │  - Execute   │                   │
│  └───────┬──────┘          └──────────────┘                   │
│          │                                                     │
│          │ IPC (Secure Bridge)                                │
│          │                                                     │
│  ┌───────▼──────────────────────────────────────────────────┐ │
│  │              Preload Script (Security)                   │ │
│  │              Context Isolation Enabled                   │ │
│  └───────┬──────────────────────────────────────────────────┘ │
│          │                                                     │
│  ┌───────▼──────────────────────────────────────────────────┐ │
│  │                Main Process (Electron)                   │ │
│  │                                                          │ │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  │ │
│  │  │ CloudSearch  │  │  Edge AI     │  │ SSH Manager  │  │ │
│  │  │ Integration  │  │  Search      │  │              │  │ │
│  │  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘  │ │
│  └─────────┼──────────────────┼──────────────────┼──────────┘ │
│            │                  │                  │            │
└────────────┼──────────────────┼──────────────────┼────────────┘
             │                  │                  │
             ▼                  ▼                  ▼
    ┌─────────────┐    ┌─────────────┐    ┌─────────────┐
    │   Google    │    │  Microsoft  │    │  SSH Server │
    │ CloudSearch │    │  Bing API   │    │  (Remote)   │
    │     API     │    │  (Edge AI)  │    │             │
    └─────────────┘    └─────────────┘    └─────────────┘
```

## Component Details

### 1. Main Process (`src/main.js`)
- **Responsibilities:**
  - Application lifecycle management
  - Window creation and management
  - IPC handler registration
  - Module initialization
  - Session configuration

- **Key Functions:**
  - `createWindow()` - Creates the browser window
  - `initializeSSHManager()` - Sets up SSH backend
  - `initializeCloudSearch()` - Sets up CloudSearch
  - `initializeEdgeAI()` - Sets up Edge AI Search
  - IPC handlers for all backend operations

### 2. Preload Script (`src/preload.js`)
- **Purpose:** Secure bridge between renderer and main process
- **Security Features:**
  - Context isolation
  - Limited API exposure
  - No direct Node.js access from renderer
- **Exposed APIs:**
  - `searchCloudSearch(query)`
  - `searchEdgeAI(query)`
  - `sshConnect(config)`
  - `sshExecute(command)`
  - `getBrowserInfo()`

### 3. SSH Manager (`src/modules/ssh-manager.js`)
- **Functionality:**
  - SSH connection management
  - Command execution over SSH
  - Connection status tracking
  - Error handling

- **Methods:**
  - `connect(config)` - Establish SSH connection
  - `execute(command)` - Run command on remote server
  - `disconnect()` - Close connection
  - `getStatus()` - Get connection status

### 4. CloudSearch Integration (`src/modules/cloudsearch-integration.js`)
- **Functionality:**
  - Google CloudSearch API integration
  - Search query handling
  - Result caching
  - Simulation mode (when API key not configured)

- **Methods:**
  - `search(query)` - Perform CloudSearch
  - `simulateSearch(query)` - Fallback simulation
  - `clearCache()` - Clear search cache
  - `configure(config)` - Update configuration

### 5. Edge AI Search (`src/modules/edge-ai-search.js`)
- **Functionality:**
  - Microsoft Bing Search API integration
  - AI-enhanced search results
  - Auto-suggestions
  - Result formatting

- **Methods:**
  - `search(query)` - Perform Edge AI search
  - `getSuggestions(query)` - Get search suggestions
  - `simulateEdgeSearch(query)` - Fallback simulation
  - `clearCache()` - Clear search cache

### 6. User Interface

#### HTML (`src/ui/index.html`)
- Browser header with logo and search bar
- Navigation bar with URL controls
- Webview container for web content
- Welcome screen
- Search results panel
- SSH connection modal
- Info modal

#### CSS (`src/ui/styles.css`)
- Dark theme design
- Gradient accents (blue tones)
- Responsive layout
- Smooth transitions
- Custom scrollbars

#### JavaScript (`src/ui/renderer.js`)
- Event handling
- Search functionality
- Navigation controls
- Modal management
- Result display

## Data Flow

### Search Operation Flow
```
1. User enters query in search bar
2. User clicks CloudSearch or Edge AI button
3. Renderer calls ei3API.searchCloudSearch() or ei3API.searchEdgeAI()
4. Preload script forwards IPC message to main process
5. Main process calls appropriate module (CloudSearch/EdgeAI)
6. Module checks cache first
7. If not cached, makes API call (or uses simulation)
8. Result returned through IPC chain
9. Renderer displays results in side panel
```

### SSH Connection Flow
```
1. User clicks SSH button
2. Modal opens with connection form
3. User enters credentials
4. User clicks Connect
5. Renderer calls ei3API.sshConnect(config)
6. Preload forwards to main process
7. SSHManager.connect() establishes connection
8. Connection result returned via IPC
9. Status displayed in modal
```

### Navigation Flow
```
1. User enters URL in URL bar
2. User presses Enter or clicks Go
3. Renderer validates and formats URL
4. Sets webview.src to URL
5. Webview loads page using Chromium
6. Events fired: did-start-loading, did-finish-load
7. Welcome screen hidden
8. Page displayed in webview
```

## Security Model

### Context Isolation
- Renderer process cannot access Node.js APIs
- All communication via secure IPC bridge
- Preload script controls exposed APIs

### Content Security Policy
- Restricts script sources
- Limits inline scripts
- Controls resource loading

### Input Validation
- URL validation before navigation
- SSH config validation
- Search query sanitization

### Credential Handling
- Environment variables for API keys
- No hardcoded secrets
- SSH passwords not logged

## Configuration System

### Config File (`src/config/config.js`)
Centralized configuration for:
- Browser settings
- API endpoints
- Security options
- Window preferences
- Company information

### Environment Variables
- `GOOGLE_CLOUDSEARCH_API_KEY` - CloudSearch API key
- `BING_SEARCH_API_KEY` - Bing/Edge AI API key
- `CLOUDSEARCH_APP_ID` - CloudSearch application ID

## Error Handling

### Strategy
1. **Try-Catch Blocks** - All async operations wrapped
2. **Error Objects** - Structured error returns
3. **User Feedback** - Error messages displayed in UI
4. **Graceful Degradation** - Simulation mode on API failures
5. **Logging** - Console logging for debugging

### Example Error Flow
```javascript
try {
  const result = await apiCall();
  return { success: true, data: result };
} catch (error) {
  console.error('API error:', error);
  return { success: false, error: error.message };
}
```

## Performance Optimizations

### Caching
- Search results cached for 5 minutes
- Reduces API calls
- Faster repeat searches

### Lazy Loading
- Webview only loads when navigation occurs
- Welcome screen shown initially
- Modules initialized on app start

### Event Throttling
- Navigation controls respond to user actions
- No unnecessary reloads
- Efficient event handling

## Build and Distribution

### Development Build
```bash
npm run dev
```
- Opens DevTools
- Verbose logging enabled
- Hot reload support

### Production Build
```bash
npm run build
```
- Creates distributable packages
- Optimized for performance
- Platform-specific installers

### Output Structure
```
dist/
├── ei3-browser-1.0.0.dmg      # macOS
├── ei3-browser-1.0.0.exe      # Windows
└── ei3-browser-1.0.0.AppImage # Linux
```

## Future Enhancements

### Planned Features
1. Bookmark management
2. History tracking
3. Tab support
4. Extension system
5. Theme customization
6. Multiple SSH sessions
7. Enhanced AI features
8. Offline mode

### Integration Opportunities
- More search engines
- Cloud storage integration
- VPN support
- Password manager
- Translation services

## Credits

**IONITY (PTY) LTD**
- Author: Johan Wilhelm van Antwerp and R1 DS
- Location: Centurion, South Africa
- Copyright: 2018-2025+
- Trademark: ƐÏ3 | AEDI | ƐÏ3 | AMPIES | 986 AED | 6ƐÏ39 | NeTzeR

**References:**
- Chromium Repository: https://github.com/AntwerpDesignsIonitychromium-OG
- Main Repository: https://github.com/Antwerp-Ecosystem-Designs-Ionity/-i3

**Motto:** ANYTHING IS POSSIBLE WITH GOD ❤️

---

*ƐÏ3 Browser - Break the Cycle*
