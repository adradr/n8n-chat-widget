# n8n Chat Widget

A fully customizable, streaming-enabled chat widget for n8n webhooks. Build intelligent chat interfaces with real-time response streaming, session persistence, and beautiful animations.

## Demo

Try the live demo: Open `demo.html` in your browser to see the widget in action and explore integration options.

## Features

- 🚀 **Real-time streaming** - Responses stream in as they're generated
- 💬 **Session persistence** - Chat history saved locally
- 🎨 **Fully customizable** - Match any brand colors and style
- 📱 **Mobile responsive** - Works perfectly on all devices
- ⚡ **Lightweight** - Minimal performance impact (~15KB gzipped)
- 🔧 **Easy integration** - Single script tag implementation
- 🌍 **Multi-language ready** - All text content is fully customizable
- 🎭 **Loading animations** - Customizable loading messages
- 🖼️ **Iframe support** - Works seamlessly when embedded in iframes

## Quick Start

### Option 1: CDN Integration (Easiest)

Add these lines to your website's HTML:

```html
<!-- Add before closing </head> tag -->
<link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/adradr/n8n-chat-widget@latest/dist/chat-widget.min.css">

<!-- Add before closing </body> tag -->
<script src="https://cdn.jsdelivr.net/gh/adradr/n8n-chat-widget@latest/dist/chat-widget.min.js"></script>
<script>
  window.ChatWidgetConfig = {
    webhook: {
      url: 'YOUR_N8N_WEBHOOK_URL',
      route: 'general',
      streaming: true
    },
    branding: {
      logo: 'YOUR_LOGO_URL',
      name: 'Your Company',
      welcomeText: 'Hello! How can I help you today?',
      responseTimeText: 'Typically replies in seconds',
      poweredBy: {
        text: 'Powered by Your Company',
        link: 'https://yourcompany.com'
      }
    },
    style: {
      primaryColor: '#007bff',
      secondaryColor: '#6c757d',
      position: 'right', // or 'left'
      backgroundColor: '#ffffff',
      fontColor: '#333333'
    }
  };
</script>
```

### Option 2: Self-Hosted

1. Download the latest release from [Releases](https://github.com/adradr/n8n-chat-widget/releases)
2. Upload the `dist` folder to your server
3. Include the files:

```html
<link rel="stylesheet" href="/path/to/chat-widget.min.css">
<script src="/path/to/chat-widget.min.js"></script>
```

### Option 3: Bundle Everything (Single File)

Use the bundled version that includes CSS:

```html
<script src="https://cdn.jsdelivr.net/gh/adradr/n8n-chat-widget@latest/dist/chat-widget.bundle.js"></script>
```

## Configuration

### Required Settings

| Option | Type | Description |
|--------|------|-------------|
| `webhook.url` | string | Your n8n webhook endpoint URL |
| `webhook.route` | string | Route identifier (used in the request payload) |

### Optional Settings

#### Webhook Configuration
| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `webhook.streaming` | boolean | `true` | Enable streaming responses |
| `webhook.timeout` | number | `0` | Request timeout in milliseconds (0 = no timeout) |

#### Branding Configuration
| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `branding.logo` | string | - | URL to your logo image |
| `branding.name` | string | - | Your company/bot name |
| `branding.welcomeText` | string | - | Initial welcome message |
| `branding.responseTimeText` | string | - | Expected response time text |
| `branding.poweredBy.text` | string | - | Powered by text |
| `branding.poweredBy.link` | string | - | Link for powered by text |

#### Style Configuration
| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `style.primaryColor` | string | `#854fff` | Primary brand color |
| `style.secondaryColor` | string | `#6b3fd4` | Secondary brand color |
| `style.position` | string | `right` | Widget position (left/right) |
| `style.backgroundColor` | string | `#ffffff` | Chat background color |
| `style.fontColor` | string | `#333333` | Text color |

#### Labels Configuration
| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `labels.inputPlaceholder` | string | `'Type your message here...'` | Input field placeholder text |
| `labels.newChatButton` | string | `'Send us a message'` | New chat button text |
| `labels.clearHistoryTooltip` | string | `'Clear conversation'` | Clear history button tooltip |
| `labels.closeButtonTooltip` | string | `'Close'` | Close button tooltip |
| `labels.errorMessage` | string | `'An error occurred...'` | Generic error message |
| `labels.connectionErrorMessage` | string | `'Connection error...'` | Connection timeout message |

#### Loading Messages Configuration
| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `loadingMessages` | array | See example | Array of loading messages with emoji and text |
| `loadingMessageDelay` | number | `5000` | Delay before showing loading messages (ms) |
| `loadingMessageInterval` | number | `3000` | Interval between loading messages (ms) |

#### Initial Message Configuration
| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `initialMessage.enabled` | boolean | `false` | Enable showing an initial message when chat opens |
| `initialMessage.text` | string | `''` | The initial message text to display |
| `initialMessage.loadPreviousSession` | boolean | `false` | Load previous session from webhook on chat open |

#### Debug Configuration
| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `debug` | boolean | `false` | Enable console logging |

## n8n Webhook Setup

### Basic Webhook Flow

1. Create a new workflow in n8n
2. Add a Webhook node as the trigger
3. Configure your chat logic (AI, database lookups, etc.)
4. Return responses in the expected format

### Request Payload

The widget sends the following data to your webhook:

```json
{
  "action": "sendMessage",
  "sessionId": "uuid-v4-session-id",
  "route": "your-configured-route",
  "chatInput": "User's message",
  "metadata": {
    "userId": "",
    "streaming": true
  }
}
```

### Expected Response Format

For streaming responses:
```json
{
  "output": "Your response text here"
}
```

For non-streaming responses:
```json
{
  "output": "Your response text here"
}
```

For loading previous session (LangChain format):
```json
{
  "data": [
    {
      "id": ["langchain_core", "messages", "HumanMessage"],
      "kwargs": {
        "content": "User message text"
      }
    },
    {
      "id": ["langchain_core", "messages", "AIMessage"],
      "kwargs": {
        "content": "Agent response text"
      }
    }
  ]
}
```

Note: The widget supports multiple response formats:
- Simple format: looks for the `output` field
- Array format: uses the first element's `output` field
- LangChain format: reconstructs full conversation history from `data` array

### Example n8n Workflow

```json
{
  "nodes": [
    {
      "name": "Webhook",
      "type": "n8n-nodes-base.webhook",
      "parameters": {
        "httpMethod": "POST",
        "path": "chat"
      }
    },
    {
      "name": "Process Message",
      "type": "n8n-nodes-base.code",
      "parameters": {
        "code": "// Your chat logic here\nreturn { output: 'Response to user' };"
      }
    }
  ]
}
```

## Advanced Usage

### Programmatic Control

```javascript
// Open chat widget
document.querySelector('.chat-toggle').click();

// Clear chat history
localStorage.removeItem('chatbot-history');
localStorage.removeItem('chatbot-session-id');

// Access chat history
const history = JSON.parse(localStorage.getItem('chatbot-history'));
```

### Custom Styling

Override CSS variables for deeper customization:

```css
.n8n-chat-widget {
  --chat--color-primary: #your-color;
  --chat--color-secondary: #your-color;
  --chat--color-background: #your-color;
  --chat--color-font: #your-color;
}
```

Note: The widget internally uses `--n8n-chat-primary-color`, `--n8n-chat-secondary-color`, `--n8n-chat-background-color`, and `--n8n-chat-font-color` which map to the above CSS variables.

### Loading Messages Customization

Customize or disable loading messages that appear while waiting for responses:

```javascript
window.ChatWidgetConfig = {
  // Custom loading messages
  loadingMessages: [
    { emoji: '💭', text: 'Thinking...' },
    { emoji: '🔍', text: 'Processing your request...' },
    { emoji: '⏳', text: 'Just a moment...' },
    { emoji: '🎯', text: 'Preparing response...' }
  ],
  loadingMessageDelay: 5000,     // Start after 5 seconds
  loadingMessageInterval: 3000   // Change message every 3 seconds
};

// To disable loading messages completely
window.ChatWidgetConfig = {
  loadingMessages: []  // Empty array disables loading messages
};
```

### Iframe Embedding

The widget automatically detects when it's embedded in an iframe and adjusts its positioning accordingly. Here are the recommended approaches:

#### Option 1: Dedicated Iframe Page (Recommended)

Create a dedicated HTML page for the iframe:

```html
<!-- iframe-embed.html -->
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <style>
        body {
            margin: 0;
            padding: 0;
            background: transparent;
            overflow: hidden;
        }
    </style>
    <link rel="stylesheet" href="dist/chat-widget.min.css">
</head>
<body>
    <script src="dist/chat-widget.min.js"></script>
    <script>
        window.ChatWidgetConfig = {
            webhook: {
                url: 'YOUR_N8N_WEBHOOK_URL',
                route: 'general',
                streaming: true
            },
            // ... your configuration
        };
    </script>
</body>
</html>
```

Then embed it in your main page:

```html
<iframe 
    src="iframe-embed.html" 
    style="position: fixed; bottom: 0; right: 0; width: 100%; height: 100%; border: none; pointer-events: none; z-index: 999999;">
</iframe>
```

#### Option 2: Direct Page Embedding

Embed any page with the widget directly:

```html
<iframe 
    src="your-page-with-widget.html" 
    style="position: fixed; bottom: 0; right: 0; width: 100%; height: 100%; border: none; pointer-events: none; z-index: 999999;">
</iframe>
```

**Important Notes for Iframe Embedding:**
- The widget automatically detects iframe context and adjusts positioning
- Set `pointer-events: none` on the iframe to allow clicking through empty areas
- The widget components will have `pointer-events: auto` to remain interactive
- Use high z-index values to ensure the widget appears above other content
- The iframe should cover the full viewport for proper positioning

## Examples

### Complete Configuration Example

```javascript
window.ChatWidgetConfig = {
  // Webhook settings (required)
  webhook: {
    url: 'https://your-n8n.com/webhook/abc123/chat',
    route: 'general',
    streaming: true,
    timeout: 0 // No timeout (default), or set to milliseconds like 300000 for 5 minutes
  },
  
  // Branding
  branding: {
    logo: '/logo.png',
    name: 'Support Bot',
    welcomeText: 'Hello! 👋 How can I help you today?',
    responseTimeText: 'Typically replies in seconds',
    poweredBy: {
      text: 'Powered by YourCompany',
      link: 'https://yourcompany.com'
    }
  },
  
  // Styling
  style: {
    primaryColor: '#007bff',
    secondaryColor: '#6c757d',
    position: 'right',
    backgroundColor: '#ffffff',
    fontColor: '#333333'
  },
  
  // UI Labels (for internationalization)
  labels: {
    inputPlaceholder: 'Type your message here...',
    newChatButton: 'Send us a message',
    clearHistoryTooltip: 'Clear conversation',
    closeButtonTooltip: 'Close',
    errorMessage: 'An error occurred while receiving the response.',
    connectionErrorMessage: 'Connection error. Please check your internet connection.'
  },
  
  // Loading messages
  loadingMessages: [
    { emoji: '💭', text: 'Thinking...' },
    { emoji: '🔍', text: 'Processing your request...' },
    { emoji: '⏳', text: 'Just a moment...' },
    { emoji: '🎯', text: 'Preparing response...' }
  ],
  loadingMessageDelay: 5000,
  loadingMessageInterval: 3000,
  
  // Initial message (optional)
  initialMessage: {
    enabled: true,
    text: 'Hello! 👋 How can I help you today?',
    loadPreviousSession: false
  },
  
  // Debug mode
  debug: false
};
```

### E-commerce Support Bot

```javascript
window.ChatWidgetConfig = {
  webhook: {
    url: 'https://your-n8n.com/webhook/abc123/chat',
    route: 'ecommerce'
  },
  branding: {
    logo: '/logo.png',
    name: 'ShopBot',
    welcomeText: 'Need help with your order?',
    responseTimeText: 'Instant responses'
  },
  style: {
    primaryColor: '#28a745',
    position: 'right'
  }
};
```

### Technical Documentation Assistant

```javascript
window.ChatWidgetConfig = {
  webhook: {
    url: 'https://your-n8n.com/webhook/xyz789/docs',
    route: 'documentation'
  },
  branding: {
    name: 'DocBot',
    welcomeText: 'Ask me about our API documentation',
    poweredBy: {
      text: 'Powered by DevDocs',
      link: 'https://devdocs.com'
    }
  },
  style: {
    primaryColor: '#0066cc',
    backgroundColor: '#f8f9fa'
  }
};
```

## Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+
- Mobile browsers (iOS Safari 14+, Chrome Mobile)

## Development

### Setup

```bash
git clone https://github.com/adradr/n8n-chat-widget.git
cd n8n-chat-widget
npm install
```

### Build

```bash
# Build all assets
npm run build

# Build bundled version
npm run build:bundle

# Watch mode for development
npm run watch
```

### Creating Releases

The project uses GitHub Actions for automated builds and releases:

```bash
# Create a new patch release (1.0.0 → 1.0.1)
npm run release

# Create a new minor release (1.0.0 → 1.1.0)
npm run release:minor

# Create a new major release (1.0.0 → 2.0.0)
npm run release:major
```

After tagging, GitHub Actions will automatically:
1. Build the widget files
2. Create a GitHub Release
3. Upload distribution files
4. Make them available via jsDelivr CDN

### Project Structure

```
n8n-chat-widget/
├── src/
│   ├── chat-widget-config.js    # Configuration setup
│   ├── chat-widget-streaming.js # Main widget logic
│   └── chat-widget.css          # Styles
├── dist/                         # Built files (generated)
│   ├── chat-widget.min.js       # Minified JS
│   ├── chat-widget.min.css      # Minified CSS
│   └── chat-widget.bundle.js    # All-in-one bundle
├── demo.html                     # Demo & integration guide
├── build.js                      # Build script
├── package.json                  # Project dependencies
└── LICENSE                       # MIT license
```


## Deployment Checklist

- [ ] Set up your n8n webhook endpoint
- [ ] Configure webhook URL in widget config
- [ ] Customize branding (logo, colors, text)
- [ ] Test on mobile devices
- [ ] Verify CSP headers allow widget styles/scripts
- [ ] Test streaming functionality
- [ ] Set up error handling in n8n workflow
- [ ] Configure all text labels for your language/locale

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

MIT License - see LICENSE file for details

## Support

For issues, questions, or suggestions, please open an issue on [GitHub](https://github.com/adradr/n8n-chat-widget/issues)

## Credits

Built with ❤️ for the n8n community