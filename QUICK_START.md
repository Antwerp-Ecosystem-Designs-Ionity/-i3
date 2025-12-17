# ƐÏ3 Browser - Quick Start Guide

## Installation

```bash
# 1. Install dependencies
npm install

# 2. (Optional) Configure API keys
cp .env.example .env
# Edit .env with your API keys
```

## Running the Browser

### Start in Normal Mode
```bash
npm start
```

### Start in Development Mode (with DevTools)
```bash
npm run dev
```

## First Time Usage

### 1. Welcome Screen
When you first start ƐÏ3 Browser, you'll see the welcome screen showing:
- ƐÏ3 logo and tagline
- Three main features: CloudSearch, Edge AI, SSH
- Company information

### 2. Web Browsing
- Enter a URL in the URL bar (top navigation)
- Click "Go" or press Enter
- Use back/forward/refresh buttons to navigate

### 3. Search Features

#### CloudSearch (Google)
1. Enter your search query in the top search bar
2. Click the "☁️ CloudSearch" button
3. Results appear in the side panel

#### Edge AI Search (Microsoft)
1. Enter your search query in the top search bar
2. Click the "🤖 Edge AI" button
3. Get AI-enhanced results in the side panel

**Note:** Without API keys, searches work in simulation mode.

### 4. SSH Backend

To connect via SSH:
1. Click the "🔐 SSH" button in the header
2. Fill in connection details:
   - Host: your-server.com
   - Port: 22 (default)
   - Username: your-username
   - Password: your-password
3. Click "Connect"
4. Status will show connection result

### 5. Browser Info
Click the "ℹ️ Info" button to see:
- Browser version and details
- Technical information (Electron, Chromium, Node.js versions)
- Features list
- Company information

## Features Overview

### Browsing
- **Full web browsing** powered by Chromium engine
- **Modern standards** support (HTML5, CSS3, JavaScript)
- **Fast rendering** with optimized performance
- **Secure** with context isolation and CSP

### Search Integration
- **CloudSearch** - Enterprise Google search
- **Edge AI** - Microsoft's AI-powered search
- **Side panel** results view
- **Smart caching** for faster repeat searches

### SSH Support
- **Remote connections** to SSH servers
- **Secure authentication** with password or key
- **Command execution** via backend API
- **Connection management** with status tracking

### UI/UX
- **Sleek dark theme** optimized for extended use
- **Responsive design** adapts to window size
- **Intuitive controls** easy to learn
- **Modal dialogs** for complex actions

## Building for Distribution

```bash
npm run build
```

This creates distributable packages in the `dist/` directory.

## Troubleshooting

### Browser won't start
- Ensure Node.js 18+ is installed
- Run `npm install` again
- Check console for errors

### Search not working
- Verify API keys in `.env` file
- Check internet connection
- Simulation mode works without keys

### SSH won't connect
- Verify host is reachable
- Check credentials
- Ensure port 22 is open

## Keyboard Shortcuts

- **Ctrl+L** - Focus URL bar
- **Ctrl+R** - Refresh page
- **Ctrl+Q** - Quit browser
- **F11** - Toggle fullscreen (if enabled)
- **F12** - Open DevTools (in dev mode)

## Configuration

Edit `src/config/config.js` to customize:
- Default search engine
- API endpoints
- Window size and appearance
- Security settings
- Developer options

## Support

For issues or questions:
- Check README.md for detailed documentation
- Visit GitHub repository for updates
- Review LICENSE for terms

---

**IONITY (PTY) LTD**
Johan Wilhelm van Antwerp and R1 DS
Centurion, South Africa

*ANYTHING IS POSSIBLE WITH GOD ❤️*

ƐÏ3 | Break the Cycle
