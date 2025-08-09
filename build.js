#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🔨 Building n8n Chat Widget...');

// Read source files
const configJs = fs.readFileSync(path.join(__dirname, 'src/chat-widget-config.js'), 'utf8');
const streamingJs = fs.readFileSync(path.join(__dirname, 'src/chat-widget-streaming.js'), 'utf8');
const css = fs.readFileSync(path.join(__dirname, 'src/chat-widget.css'), 'utf8');

// Create bundled version
const bundled = `
/*!
 * n8n Chat Widget v1.0.0
 * (c) ${new Date().getFullYear()} n8n Community
 * Released under the MIT License
 */

// Bundled CSS
(function() {
  const style = document.createElement('style');
  style.textContent = \`${css.replace(/`/g, '\\`')}\`;
  document.head.appendChild(style);
})();

// Configuration
${configJs}

// Main Widget
${streamingJs}
`.trim();

// Create dist directory if it doesn't exist
if (!fs.existsSync(path.join(__dirname, 'dist'))) {
  fs.mkdirSync(path.join(__dirname, 'dist'));
}

// Write bundled file (everything in one)
fs.writeFileSync(path.join(__dirname, 'dist/chat-widget.bundle.js'), bundled);

// Write separate files
fs.writeFileSync(path.join(__dirname, 'dist/chat-widget.js'), configJs + '\n\n' + streamingJs);
fs.writeFileSync(path.join(__dirname, 'dist/chat-widget.css'), css);

console.log('✅ Build complete!');
console.log('📦 Files created:');
console.log('   - dist/chat-widget.bundle.js (all-in-one)');
console.log('   - dist/chat-widget.js (JS only)');
console.log('   - dist/chat-widget.css (CSS only)');