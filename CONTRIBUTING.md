# Contributing to ƐÏ3 Browser

Thank you for your interest in contributing to ƐÏ3 Browser!

## Development Setup

1. Fork and clone the repository
2. Install dependencies: `npm install`
3. Create a feature branch: `git checkout -b feature/your-feature`
4. Make your changes
5. Test thoroughly
6. Commit with clear messages
7. Push and create a Pull Request

## Code Structure

### Main Components

- **src/main.js** - Main Electron process, app lifecycle
- **src/preload.js** - Secure IPC bridge
- **src/modules/** - Backend functionality modules
- **src/ui/** - Frontend interface files
- **src/config/** - Configuration files

### Adding a New Feature

1. **Backend Module** (if needed)
   - Create file in `src/modules/`
   - Export a class with clear methods
   - Add error handling

2. **IPC Handler** (if needed)
   - Add handler in `src/main.js` using `ipcMain.handle()`
   - Validate input parameters

3. **Preload Bridge** (if needed)
   - Expose method in `src/preload.js` via `contextBridge`

4. **UI Implementation**
   - Update `src/ui/index.html` for markup
   - Update `src/ui/styles.css` for styling
   - Update `src/ui/renderer.js` for logic

### Example: Adding a New Search Engine

```javascript
// 1. Create src/modules/new-search.js
class NewSearch {
  async search(query) {
    // Implementation
  }
}
module.exports = NewSearch;

// 2. Add to src/main.js
const NewSearch = require('./modules/new-search');
const newSearch = new NewSearch();

ipcMain.handle('search-new', async (event, query) => {
  return await newSearch.search(query);
});

// 3. Expose in src/preload.js
contextBridge.exposeInMainWorld('ei3API', {
  searchNew: (query) => ipcRenderer.invoke('search-new', query)
});

// 4. Use in src/ui/renderer.js
async function performNewSearch(query) {
  const result = await window.ei3API.searchNew(query);
  displayResults(result);
}
```

## Coding Standards

### Style Guide
- Use 2 spaces for indentation
- Use semicolons
- Use single quotes for strings
- Add JSDoc comments for functions
- Keep functions small and focused

### Naming Conventions
- Classes: PascalCase
- Functions: camelCase
- Constants: UPPER_SNAKE_CASE
- Files: kebab-case.js

### Error Handling
- Always use try/catch for async operations
- Provide meaningful error messages
- Log errors to console
- Return error objects in API responses

## Testing

Before submitting:
1. Test in normal mode: `npm start`
2. Test in dev mode: `npm run dev`
3. Test all features you modified
4. Test on different screen sizes
5. Check console for errors

## Pull Request Process

1. **Update Documentation**
   - Update README.md if needed
   - Add JSDoc comments
   - Update QUICK_START.md if needed

2. **Clean Code**
   - Remove console.logs (except important ones)
   - Remove commented code
   - Format code consistently

3. **PR Description**
   - Describe what you changed
   - Explain why you changed it
   - List any breaking changes
   - Include screenshots for UI changes

4. **Review Process**
   - Wait for review
   - Address feedback
   - Keep PR updated with main branch

## Security

- Never commit API keys or secrets
- Use environment variables for sensitive data
- Validate all user input
- Follow Electron security best practices
- Report security issues privately

## Code Review Checklist

- [ ] Code follows project style
- [ ] Changes are tested
- [ ] Documentation is updated
- [ ] No console errors
- [ ] No security issues
- [ ] Performance is acceptable
- [ ] Backwards compatible (or documented)

## Questions?

Feel free to open an issue for:
- Bug reports
- Feature requests
- Questions about code
- Clarification on contributing

## License

By contributing, you agree that your contributions will be licensed under the ISC License.

---

**IONITY (PTY) LTD**
Break the Cycle - Together

*ANYTHING IS POSSIBLE WITH GOD ❤️*
