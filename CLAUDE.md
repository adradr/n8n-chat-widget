# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

# Main tool rule

Use serena mcp when possible!

## Common Commands

### Build Commands
- `npm run build` - Build all assets (minified JS and CSS)
- `npm run build:js` - Build JavaScript only (uses terser for minification)
- `npm run build:css` - Build CSS only (uses cleancss for minification)
- `npm run build:bundle` - Create all-in-one bundled version with CSS embedded

### Development
- `npm run watch` - Watch mode for development (rebuilds on file changes)
- Open `demo.html` in a browser to test the widget locally

### Release Management
- `npm run release` - Create patch release (1.0.0 → 1.0.1)
- `npm run release:minor` - Create minor release (1.0.0 → 1.1.0)
- `npm run release:major` - Create major release (1.0.0 → 2.0.0)

Note: After tagging, GitHub Actions automatically builds and creates releases.

## Architecture Overview

This is a standalone n8n chat widget designed for easy integration into any website. The architecture follows a modular approach:

### Core Components

1. **Configuration Layer** (`src/chat-widget-config.js`)
   - Manages default settings and user configuration merging
   - Handles webhook settings, branding, styling, labels, and loading messages
   - Uses window.ChatWidgetConfig for runtime configuration

2. **Main Widget Logic** (`src/chat-widget-streaming.js`)
   - Implements streaming and non-streaming chat functionality
   - Manages session persistence via localStorage
   - Handles UI state transitions and user interactions
   - Implements SSE (Server-Sent Events) for streaming responses
   - Contains loading message system with configurable delays

3. **Styling** (`src/chat-widget.css`)
   - Uses CSS variables for theme customization
   - Responsive design with mobile support
   - Animations for smooth transitions
   - Position flexibility (left/right placement)

### Key Technical Details

- **Session Management**: Uses UUID v4 for session IDs, persisted in localStorage
- **Chat History**: Stored in localStorage with automatic cleanup of corrupted entries
- **Streaming Support**: Implements SSE with proper error handling and reconnection logic
- **Message Queue**: Prevents duplicate processing during streaming
- **Loading Messages**: Configurable system that displays after specified delay
- **Debug Mode**: Built-in logging system controlled via config.debug flag

### Request/Response Flow

1. User sends message → Creates POST request with:
   - action: "sendMessage"
   - sessionId: UUID
   - route: configured route
   - chatInput: user message
   - metadata: {userId, streaming flag}

2. For streaming responses:
   - Opens SSE connection to webhook URL
   - Processes "message" events containing response chunks
   - Handles "end" event to close connection
   - Implements timeout and error recovery

3. For non-streaming:
   - Standard fetch POST request
   - Expects JSON response with "output" field

### Build Process

The project uses a custom build system:
- `build.js` creates bundled version with embedded CSS
- Terser for JS minification
- CleanCSS for CSS optimization
- Outputs to `dist/` directory with multiple formats

### Integration Points

- Designed for n8n webhook endpoints
- Expects specific response format (output field)
- Supports both streaming (SSE) and non-streaming modes
- CDN-ready via jsDelivr integration