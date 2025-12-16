# ƐÏ3 Browser

**Break the Cycle | New AÏoT Browser for all**

![License](https://img.shields.io/badge/license-ISC-blue.svg)
![Version](https://img.shields.io/badge/version-1.0.0-green.svg)

## Overview

ƐÏ3 is a sleek, modern web browser built with Electron and Chromium, featuring integrated Google CloudSearch, Microsoft Edge AI Search capabilities, and SSH backend support. Built for enterprise and personal use with a focus on performance, security, and advanced search capabilities.

## Features

- 🌐 **Chromium-Based Browsing** - Full-featured web browser built on Chromium engine
- ☁️ **Google CloudSearch Integration** - Enterprise-grade search capabilities
- 🤖 **Edge AI Search** - AI-powered search using Microsoft Edge technology
- 🔐 **SSH Backend Support** - Secure SSH connections for remote operations
- 🎨 **Sleek Modern UI** - Beautiful, responsive interface with dark theme
- 🚀 **High Performance** - Optimized for speed and efficiency
- 🔒 **Enhanced Security** - Built with security best practices

## Architecture

ƐÏ3 Browser is built using:
- **Electron** - Cross-platform desktop application framework
- **Chromium** - Modern web rendering engine (reference: https://github.com/AntwerpDesignsIonitychromium-OG)
- **Node.js** - Backend runtime for SSH and API integrations
- **SSH2** - SSH client for secure remote connections
- **Axios** - HTTP client for API communications

## Installation

### Prerequisites

- Node.js 18.x or higher
- npm 9.x or higher

### Setup

1. Clone the repository:
```bash
git clone https://github.com/Antwerp-Ecosystem-Designs-Ionity/-i3.git
cd -i3
```

2. Install dependencies:
```bash
npm install
```

3. (Optional) Configure API keys for full functionality:
```bash
# Create a .env file or set environment variables
export GOOGLE_CLOUDSEARCH_API_KEY="your-cloudsearch-api-key"
export BING_SEARCH_API_KEY="your-bing-api-key"
export CLOUDSEARCH_APP_ID="your-app-id"
```

## Usage

### Start the Browser

```bash
npm start
```

### Development Mode (with DevTools)

```bash
npm run dev
```

### Build for Distribution

```bash
npm run build
```

## Features Guide

### 1. Web Browsing
- Enter URLs in the URL bar or search directly
- Use navigation controls (back, forward, refresh)
- Full support for modern web standards

### 2. CloudSearch Integration
- Enter search query in the search bar
- Click the **CloudSearch** button for enterprise search
- Results appear in the side panel

### 3. Edge AI Search
- Enter search query in the search bar
- Click the **Edge AI** button for AI-powered search
- Get intelligent, contextual search results

### 4. SSH Backend Support
- Click the **SSH** button in the header
- Enter connection details (host, port, username, password)
- Connect to remote servers for secure operations
- Execute commands remotely (via API)

## Configuration

Edit `src/config/config.js` to customize:
- Browser settings and user agent
- API endpoints and keys
- SSH configuration
- Security settings
- Window preferences

## API Keys

To enable full search functionality:

1. **Google CloudSearch**:
   - Get API key from Google Cloud Console
   - Set `GOOGLE_CLOUDSEARCH_API_KEY` environment variable

2. **Microsoft Bing Search** (Edge AI):
   - Get API key from Azure Cognitive Services
   - Set `BING_SEARCH_API_KEY` environment variable

Without API keys, the browser works in simulation mode with sample results.

## Architecture Overview

```
src/
├── main.js                           # Main Electron process
├── preload.js                        # Secure IPC bridge
├── modules/
│   ├── ssh-manager.js                # SSH connection management
│   ├── cloudsearch-integration.js    # Google CloudSearch API
│   └── edge-ai-search.js             # Edge AI Search API
├── ui/
│   ├── index.html                    # Browser UI
│   ├── styles.css                    # Sleek styling
│   └── renderer.js                   # UI logic
└── config/
    └── config.js                     # Configuration
```

## Security

ƐÏ3 Browser implements security best practices:
- Context isolation enabled
- Node integration disabled in renderer
- Content Security Policy enforced
- Secure IPC communication
- SSH with timeout protection

## Development

### Project Structure
- `src/main.js` - Main process, window management
- `src/preload.js` - Secure IPC bridge
- `src/modules/` - Backend modules (SSH, search APIs)
- `src/ui/` - Frontend UI components
- `src/config/` - Configuration files

### Adding Features
1. Add module in `src/modules/`
2. Expose via IPC in `main.js`
3. Add to preload bridge in `preload.js`
4. Implement UI in `src/ui/renderer.js`

## Troubleshooting

### Browser won't start
- Ensure Node.js and npm are installed
- Run `npm install` to install dependencies
- Check for port conflicts

### Search not working
- Verify API keys are set correctly
- Check internet connection
- Browser works in simulation mode without keys

### SSH connection fails
- Verify host and credentials
- Check network connectivity
- Ensure SSH port (22) is accessible

## License

ISC License

## Credits

**IONITY (PTY) LTD**

**Author:** Johan Wilhelm van Antwerp and R1 DS

**Location:** Centurion, South Africa

**Copyright:** 2018-2025+

**Trademark:** ƐÏ3 | AEDI | ƐÏ3 | AMPIES | 986 AED | 6ƐÏ39 | NeTzeR | And ALL other IP

**Motto:** ANYTHING IS POSSIBLE WITH GOD ❤️

## References

- Chromium Repository: https://github.com/AntwerpDesignsIonitychromium-OG
- Main Repository: https://github.com/Antwerp-Ecosystem-Designs-Ionity/-i3

## Support

For issues, questions, or contributions, please visit the GitHub repository.

---

*Break the Cycle - ƐÏ3 Browser*
