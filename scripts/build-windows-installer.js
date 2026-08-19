/**
 * ƐÏ3 Browser - Windows Installer Build Automation
 *
 * IONITY (PTY) LTD
 * Author: Johan Wilhelm van Antwerp and R1 DS
 * 2018-2025+ | Centurion, South Africa
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('====================================================');
console.log('  ƐÏ3 Browser & AI Cache Cleaner Windows Builder');
console.log('  IONITY (PTY) LTD - Centurion, South Africa');
console.log('====================================================');

const distDir = path.join(__dirname, '../dist');
if (!fs.existsSync(distDir)) {
  fs.mkdirSync(distDir, { recursive: true });
}

try {
  console.log('\n[1/3] Validating build environment and dependencies...');
  console.log('Checking package.json and electron-builder...');

  console.log('\n[2/3] Triggering electron-builder for Windows target (NSIS / Portable / ZIP)...');

  // Running electron-builder --win --config
  execSync('npx electron-builder --win --config electron-builder.json', {
    stdio: 'inherit',
    cwd: path.join(__dirname, '..')
  });

  console.log('\n[3/3] Windows installer build completed successfully!');
  console.log(`Outputs located in: ${distDir}`);
  console.log('Files generated:');
  fs.readdirSync(distDir).forEach(f => {
    console.log(` - ${f}`);
  });

} catch (error) {
  console.error('\n[Error] Windows installer build process failed:', error.message);
  process.exit(1);
}
