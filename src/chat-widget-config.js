// Chat Widget Configuration
window.ChatWidgetDefaultConfig = {
    webhook: {
        url: '',
        route: '',
        streaming: true, // Enable streaming by default
        timeout: 0 // Timeout in milliseconds (0 = no timeout)
    },
    branding: {
        logo: '',
        name: '',
        welcomeText: 'Hello! 👋 How can I help you today?',
        responseTimeText: 'Typically replies in seconds',
        poweredBy: {
            text: '',
            link: ''
        }
    },
    style: {
        primaryColor: '#854fff',
        secondaryColor: '#6b3fd4',
        position: 'right',
        backgroundColor: '#ffffff',
        fontColor: '#333333'
    },
    labels: {
        inputPlaceholder: 'Type your message here...',
        waitingForResponse: 'Waiting for response...',
        newChatButton: 'Send us a message',
        clearHistoryTooltip: 'Clear conversation',
        closeButtonTooltip: 'Close',
        errorMessage: 'An error occurred while receiving the response.',
        connectionErrorMessage: 'Connection error. Please check your internet connection.',
        confirmClearHistory: 'Are you sure you want to clear the entire conversation history?'
    },
    initialMessage: {
        enabled: false, // Set to true to show an initial message when chat opens
        text: '', // The initial message text to display
        loadPreviousSession: false // Set to true to load previous session from webhook
    },
    loadingMessages: [
        { emoji: '💭', text: 'Thinking...' },
        { emoji: '🔍', text: 'Processing your request...' },
        { emoji: '⏳', text: 'Just a moment...' },
        { emoji: '🎯', text: 'Preparing response...' }
    ],
    loadingMessageDelay: 5000, // Delay before showing loading messages (ms)
    loadingMessageInterval: 3000, // Interval between loading messages (ms)
    debug: false // Set to true to enable console logging
};

// Merge user config with defaults
window.ChatWidgetConfig = window.ChatWidgetConfig || {};
window.ChatWidgetConfig = {
    webhook: { ...window.ChatWidgetDefaultConfig.webhook, ...window.ChatWidgetConfig.webhook },
    branding: { 
        ...window.ChatWidgetDefaultConfig.branding, 
        ...window.ChatWidgetConfig.branding,
        poweredBy: {
            ...window.ChatWidgetDefaultConfig.branding.poweredBy,
            ...(window.ChatWidgetConfig.branding?.poweredBy || {})
        }
    },
    style: { ...window.ChatWidgetDefaultConfig.style, ...window.ChatWidgetConfig.style },
    labels: { ...window.ChatWidgetDefaultConfig.labels, ...window.ChatWidgetConfig.labels },
    initialMessage: { ...window.ChatWidgetDefaultConfig.initialMessage, ...window.ChatWidgetConfig.initialMessage },
    loadingMessages: window.ChatWidgetConfig.loadingMessages !== undefined 
        ? window.ChatWidgetConfig.loadingMessages 
        : window.ChatWidgetDefaultConfig.loadingMessages,
    loadingMessageDelay: window.ChatWidgetConfig.loadingMessageDelay !== undefined 
        ? window.ChatWidgetConfig.loadingMessageDelay 
        : window.ChatWidgetDefaultConfig.loadingMessageDelay,
    loadingMessageInterval: window.ChatWidgetConfig.loadingMessageInterval !== undefined 
        ? window.ChatWidgetConfig.loadingMessageInterval 
        : window.ChatWidgetDefaultConfig.loadingMessageInterval,
    debug: window.ChatWidgetConfig.debug !== undefined ? window.ChatWidgetConfig.debug : window.ChatWidgetDefaultConfig.debug
};