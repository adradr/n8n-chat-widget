// Chat Widget with Streaming Support
(function() {
    'use strict';

    // Prevent multiple initializations
    if (window.N8NChatWidgetInitialized) return;
    window.N8NChatWidgetInitialized = true;

    const config = window.ChatWidgetConfig;
    
    // Check if we're in an iframe
    const isInIframe = window !== window.parent;
    
    // Debug logging helpers
    const debugLog = (...args) => {
        if (config.debug) {
            console.log('[Chat Widget]', ...args);
        }
    };
    
    const debugError = (...args) => {
        if (config.debug) {
            console.error('[Chat Widget]', ...args);
        }
    };
    
    const debugWarn = (...args) => {
        if (config.debug) {
            console.warn('[Chat Widget]', ...args);
        }
    };

    // Session management
    let currentSessionId = localStorage.getItem('chatbot-session-id');
    if (!currentSessionId) {
        currentSessionId = generateUUID();
        localStorage.setItem('chatbot-session-id', currentSessionId);
        debugLog('Generated new session ID:', currentSessionId);
    } else {
        debugLog('Using existing session ID from localStorage:', currentSessionId);
    }

    function generateUUID() {
        return crypto.randomUUID();
    }

    // Chat history management
    function saveChatHistory(messages) {
        try {
            localStorage.setItem('chatbot-history', JSON.stringify(messages));
        } catch (error) {
            debugWarn('Failed to save chat history:', error);
        }
    }

    function loadChatHistory() {
        try {
            const history = localStorage.getItem('chatbot-history');
            return history ? JSON.parse(history) : [];
        } catch (error) {
            debugWarn('Failed to load chat history:', error);
            return [];
        }
    }

    function addMessageToHistory(message, type) {
        // Don't add empty or undefined messages
        if (!message) {
            debugWarn('Skipping empty/undefined message in history');
            return null;
        }
        const chatHistory = loadChatHistory();
        const messageEntry = {
            id: generateUUID(),
            text: message,
            type: type, // 'user' or 'agent'
            timestamp: new Date().toISOString(),
            sessionId: currentSessionId
        };
        chatHistory.push(messageEntry);
        saveChatHistory(chatHistory);
        return messageEntry;
    }

    function clearChatHistory() {
        localStorage.removeItem('chatbot-history');
    }
    
    // Clean up any corrupted history entries on load
    function cleanupHistory() {
        const history = loadChatHistory();
        const cleanedHistory = history.filter(entry => {
            if (!entry.text || !entry.type || !entry.sessionId) {
                debugWarn('Removing invalid history entry:', entry);
                return false;
            }
            return true;
        });
        if (cleanedHistory.length !== history.length) {
            debugLog('Cleaned up history, removed', history.length - cleanedHistory.length, 'invalid entries');
            saveChatHistory(cleanedHistory);
        }
    }
    
    // Run cleanup on initialization
    cleanupHistory();

    // Create widget container
    const widgetContainer = document.createElement('div');
    widgetContainer.className = 'n8n-chat-widget';

    // Set CSS variables for colors
    widgetContainer.style.setProperty('--n8n-chat-primary-color', config.style.primaryColor);
    widgetContainer.style.setProperty('--n8n-chat-secondary-color', config.style.secondaryColor);
    widgetContainer.style.setProperty('--n8n-chat-background-color', config.style.backgroundColor);
    widgetContainer.style.setProperty('--n8n-chat-font-color', config.style.fontColor);

    const chatContainer = document.createElement('div');
    chatContainer.className = `chat-container${config.style.position === 'left' ? ' position-left' : ''}`;

    const newConversationHTML = `
        <div class="brand-header">
            <img src="${config.branding.logo}" alt="${config.branding.name}">
            <button class="close-button" title="${config.labels.closeButtonTooltip}">×</button>
        </div>
        <div class="new-conversation">
            <h2 class="welcome-text">${config.branding.welcomeText}</h2>
            <button class="new-chat-btn">
                <svg class="message-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                    <path fill="currentColor"
                        d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 14H5.2L4 17.2V4h16v12z" />
                </svg>
                ${config.labels.newChatButton}
            </button>
            <p class="response-text">${config.branding.responseTimeText}</p>
        </div>
    `;

    const chatInterfaceHTML = `
        <div class="chat-interface">
            <div class="brand-header">
                <img src="${config.branding.logo}" alt="${config.branding.name}">
                <button class="clear-history-btn" title="${config.labels.clearHistoryTooltip}">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/>
                    </svg>
                </button>
                <button class="close-button" title="${config.labels.closeButtonTooltip}">×</button>
            </div>
            <div class="chat-messages">
            </div>
            <div class="chat-input">
                <textarea placeholder="${config.labels.inputPlaceholder}" rows="1"></textarea>
                <button type="submit">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/>
                    </svg>
                </button>
            </div>
            <div class="chat-footer">
                <a href="${config.branding.poweredBy.link}" target="_blank">${config.branding.poweredBy.text}</a>
            </div>
        </div>
    `;

    chatContainer.innerHTML = newConversationHTML + chatInterfaceHTML;

    const toggleButton = document.createElement('button');
    toggleButton.className = `chat-toggle${config.style.position === 'left' ? ' position-left' : ''}`;
    toggleButton.innerHTML = `
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
            <path
                d="M12 2C6.477 2 2 6.477 2 12c0 1.821.487 3.53 1.338 5L2.5 21.5l4.5-.838A9.955 9.955 0 0012 22c5.523 0 10-4.477 10-10S17.523 2 12 2zm0 18c-1.476 0-2.886-.313-4.156-.878l-3.156.586.586-3.156A7.962 7.962 0 014 12c0-4.411 3.589-8 8-8s8 3.589 8 8-3.589 8-8 8z" />
        </svg>`;

    widgetContainer.appendChild(chatContainer);
    widgetContainer.appendChild(toggleButton);
    
    // If in iframe, add special class for iframe-specific styling
    if (isInIframe) {
        widgetContainer.classList.add('in-iframe');
        debugLog('Widget detected in iframe, applying iframe-specific styles');
    }
    
    document.body.appendChild(widgetContainer);

    const newChatBtn = chatContainer.querySelector('.new-chat-btn');
    const chatInterface = chatContainer.querySelector('.chat-interface');
    const messagesContainer = chatContainer.querySelector('.chat-messages');
    const textarea = chatContainer.querySelector('textarea');
    const sendButton = chatContainer.querySelector('button[type="submit"]');
    
    // Add event delegation for links in messages
    // This ensures links work even during streaming when DOM is being updated
    messagesContainer.addEventListener('click', (e) => {
        // Check if clicked element is a link or inside a link
        const link = e.target.closest('a');
        if (link && link.href) {
            e.preventDefault();
            e.stopPropagation();
            window.open(link.href, '_blank');
        }
    }, true); // Use capture phase to get event early

    // Message formatting
    function formatBotMessage(text) {
        try {
            debugLog('Formatting message, input text:', text);
            // Handle undefined or null text
            if (!text) {
                debugWarn('Received undefined/null text, returning empty string');
                return '';
            }
            // Convert newlines to <br> first
            let formatted = text.replace(/\n/g, '<br>');

            // Headers (must be done before other formatting) - improved regex
            formatted = formatted.replace(/^### (.+?)$/gm, '<h3>$1</h3>');
            formatted = formatted.replace(/^## (.+?)$/gm, '<h2>$1</h2>');
            formatted = formatted.replace(/^# (.+?)$/gm, '<h1>$1</h1>');

            // Also handle headers followed by <br>
            formatted = formatted.replace(/^### (.+?)<br>/gm, '<h3>$1</h3><br>');
            formatted = formatted.replace(/^## (.+?)<br>/gm, '<h2>$1</h2><br>');
            formatted = formatted.replace(/^# (.+?)<br>/gm, '<h1>$1</h1><br>');

            // Code blocks (must be done before inline code)
            formatted = formatted.replace(/```([\s\S]*?)```/g, '<pre><code>$1</code></pre>');

            // Inline code
            formatted = formatted.replace(/`([^`]+)`/g, '<code>$1</code>');

            // Bold (must be done before italic to avoid conflicts)
            formatted = formatted.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');

            // Italic
            formatted = formatted.replace(/\*([^*]+)\*/g, '<em>$1</em>');
            formatted = formatted.replace(/_([^_]+)_/g, '<em>$1</em>');

            // Strikethrough
            formatted = formatted.replace(/~~(.*?)~~/g, '<del>$1</del>');

            // Links in markdown format [text](url) - process first
            formatted = formatted.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank">$1</a>');

            // Standalone URLs (simplified for better compatibility)
            formatted = formatted.replace(/(^|\s)(https?:\/\/[^\s<>"]+)/g, '$1<a href="$2" target="_blank">$2</a>');

            // Blockquotes
            formatted = formatted.replace(/^> (.+?)(<br>|$)/gm, '<blockquote>$1</blockquote>');

            // Horizontal rules
            formatted = formatted.replace(/^(---+|===+|[*]{3,})(<br>|$)/gm, '<hr>');

            // Bullet lists (- or *)
            formatted = formatted.replace(/^[*-] (.+?)(<br>|$)/gm, '<li>$1</li>');

            // Numbered lists
            formatted = formatted.replace(/^(\d+)\. (.+?)(<br>|$)/gm, '<li>$2</li>');

            // Wrap consecutive bullet list items in <ul>
            formatted = formatted.replace(/(<li>.*?<\/li>)(<br>)*/g, function(match) {
                if (match.includes('</li><li>')) {
                    return '<ul>' + match.replace(/<br>/g, '') + '</ul>';
                }
                return match;
            });

            // Clean up extra <br> tags around block elements
            formatted = formatted.replace(/<br>(<h[1-6]>)/g, '$1');
            formatted = formatted.replace(/(<\/h[1-6]>)<br>/g, '$1');
            formatted = formatted.replace(/<br>(<ul>|<ol>|<li>|<blockquote>|<pre>|<hr>)/g, '$1');
            formatted = formatted.replace(/(<\/ul>|<\/ol>|<\/li>|<\/blockquote>|<\/pre>|<hr>)<br>/g, '$1');

            debugLog('Formatted message output:', formatted);
            return formatted;
        } catch (formatError) {
            debugError('Error in formatBotMessage:', formatError);
            return text; // Return original text if formatting fails
        }
    }

    // Create typing indicator
    function createTypingIndicator() {
        const typingDiv = document.createElement('div');
        typingDiv.className = 'chat-message bot typing-indicator';
        typingDiv.innerHTML = `
            <div class="typing-dots">
                <span></span>
                <span></span>
                <span></span>
            </div>
        `;
        return typingDiv;
    }
    
    // Get loading messages from config
    const loadingMessages = config.loadingMessages || [];
    
    // Show loading messages progressively
    function startLoadingMessages(typingIndicatorElement, container) {
        // If no loading messages configured, don't show them
        if (!loadingMessages || loadingMessages.length === 0) {
            return {
                cleanup: () => {},
                waitForMinimumDisplay: () => Promise.resolve()
            };
        }
        
        let loadingTextDiv = null;
        let messageInterval = null;
        let isActive = true;
        let messageShownAt = null;
        
        // Create a container for the loading text below the typing dots
        loadingTextDiv = document.createElement('div');
        loadingTextDiv.style.marginTop = '10px';
        loadingTextDiv.style.opacity = '0';
        loadingTextDiv.style.transition = 'opacity 0.5s ease-in-out';
        loadingTextDiv.style.fontSize = '14px';
        loadingTextDiv.style.color = '#666';
        typingIndicatorElement.appendChild(loadingTextDiv);
        
        const showNextMessage = () => {
            if (!isActive || !loadingTextDiv) {
                return;
            }
            
            // Pick a random loading phrase
            const randomPhrase = loadingMessages[Math.floor(Math.random() * loadingMessages.length)];
            
            // Fade out current text
            loadingTextDiv.style.opacity = '0';
            
            setTimeout(() => {
                if (!isActive || !loadingTextDiv) return;
                
                // Update the text content
                loadingTextDiv.innerHTML = `<span style="margin-right: 8px;">${randomPhrase.emoji}</span><em>${randomPhrase.text}</em>`;
                
                // Fade in new text and scroll to show it fully
                setTimeout(() => {
                    if (loadingTextDiv) {
                        loadingTextDiv.style.opacity = '0.8';
                        // Scroll to ensure the loading message is fully visible
                        if (container) {
                            container.scrollTop = container.scrollHeight;
                        }
                    }
                }, 50);
            }, 300); // Wait for fade out to complete
            
            // Track when message was shown
            messageShownAt = Date.now();
            
            // Schedule next message
            if (isActive) {
                messageInterval = setTimeout(showNextMessage, config.loadingMessageInterval || 3000);
            }
        };
        
        // Show first message after a short delay
        setTimeout(() => {
            showNextMessage();
            // Initial scroll to show the first loading message
            if (container) {
                setTimeout(() => {
                    container.scrollTop = container.scrollHeight;
                }, 100);
            }
        }, 500);
        
        // Return object with cleanup and wait functions
        return {
            cleanup: () => {
                isActive = false;
                if (messageInterval) {
                    clearTimeout(messageInterval);
                }
                if (loadingTextDiv && loadingTextDiv.parentNode) {
                    loadingTextDiv.remove();
                }
            },
            // Wait for minimum display time if a message is showing
            waitForMinimumDisplay: async () => {
                if (messageShownAt) {
                    const elapsed = Date.now() - messageShownAt;
                    const minimumTime = 3000; // Show each loading message for at least 3 seconds
                    if (elapsed < minimumTime) {
                        await new Promise(resolve => setTimeout(resolve, minimumTime - elapsed));
                    }
                }
            }
        };
    }

    // Helper function to check if user is at bottom of scroll
    function isScrolledToBottom() {
        const threshold = 2; // pixels from bottom - very minimal threshold for natural scrolling
        return messagesContainer.scrollHeight - messagesContainer.scrollTop - messagesContainer.clientHeight < threshold;
    }
    
    // Simple update function that just replaces content
    // We'll handle link clicking differently
    function updateStreamingContent(botMessageDiv, fullText, cursorElement) {
        const formattedContent = formatBotMessage(fullText);
        
        // Remove cursor if it exists
        if (cursorElement && cursorElement.parentNode === botMessageDiv) {
            cursorElement.remove();
        }
        
        // Update content
        botMessageDiv.innerHTML = formattedContent;
        
        // Add cursor at the end
        if (cursorElement) {
            botMessageDiv.appendChild(cursorElement);
        }
        
        // Make links clickable with event delegation
        // This is handled by a parent-level click handler
    }

    // Streaming support with improvements
    async function sendMessageWithStreaming(message) {
        const messageData = {
            action: "sendMessage",
            sessionId: currentSessionId,
            route: config.webhook.route,
            chatInput: message,
            metadata: {
                userId: "",
                streaming: config.webhook.streaming !== false
            }
        };

        // Add user message to history
        addMessageToHistory(message, 'user');

        const userMessageDiv = document.createElement('div');
        userMessageDiv.className = 'chat-message user';
        userMessageDiv.innerHTML = message.replace(/\n/g, '<br>');
        messagesContainer.appendChild(userMessageDiv);
        
        // Show typing indicator instead of empty bubble
        const typingIndicator = createTypingIndicator();
        messagesContainer.appendChild(typingIndicator);
        
        // Force scroll to show the typing indicator fully
        setTimeout(() => {
            messagesContainer.scrollTop = messagesContainer.scrollHeight;
        }, 50);

        // Disable input while processing
        textarea.disabled = true;
        sendButton.disabled = true;
        textarea.placeholder = config.labels.waitingForResponse || 'Waiting for response...';

        let accumulatedText = '';
        let cursorElement = null;
        let botMessageDiv = null;
        let firstChunkReceived = false;
        let userHasScrolled = false;
        let loadingMessagesHandler = null;
        let isAutoScrolling = false; // Track programmatic scrolls
        let chunkQueue = []; // Queue chunks that arrive early
        let processingChunks = false;
        
        // Track if user manually scrolls during streaming
        const scrollHandler = () => {
            // Ignore programmatic scrolls
            if (isAutoScrolling) {
                isAutoScrolling = false;
                return;
            }
            // User has scrolled manually
            userHasScrolled = !isScrolledToBottom();
        };
        messagesContainer.addEventListener('scroll', scrollHandler, { passive: true });
        
        // Start loading messages after configured delay
        setTimeout(() => {
            if (!firstChunkReceived && !loadingMessagesHandler && typingIndicator.parentNode) {
                loadingMessagesHandler = startLoadingMessages(typingIndicator, messagesContainer);
            }
        }, config.loadingMessageDelay || 5000);
        
        // Function to process a chunk (either immediately or from queue)
        const processChunk = async (chunk) => {
            // Filter out any JSON response that might have been sent as a chunk
            if (typeof chunk === 'string' && chunk.trim().startsWith('{') && chunk.includes('"output"')) {
                try {
                    const parsed = JSON.parse(chunk);
                    if (parsed.output !== undefined || parsed.intermediateSteps !== undefined) {
                        debugLog('Filtering out JSON response sent as chunk');
                        return; // Skip this chunk
                    }
                } catch (e) {
                    // Not JSON, process normally
                }
            }
            
            if (!firstChunkReceived) {
                firstChunkReceived = true;
                
                // Wait for loading message to show for minimum time
                if (loadingMessagesHandler) {
                    await loadingMessagesHandler.waitForMinimumDisplay();
                    loadingMessagesHandler.cleanup();
                    loadingMessagesHandler = null;
                }
                
                // Remove typing indicator and create bot message
                typingIndicator.remove();
                botMessageDiv = document.createElement('div');
                botMessageDiv.className = 'chat-message bot streaming';
                messagesContainer.appendChild(botMessageDiv);
                
                // Add cursor
                cursorElement = document.createElement('span');
                cursorElement.className = 'streaming-cursor';
                botMessageDiv.appendChild(cursorElement);
            }
            
            accumulatedText += chunk;
            // Update content with simple replacement
            updateStreamingContent(
                botMessageDiv, 
                accumulatedText, 
                cursorElement
            );
            
            // Only auto-scroll if user hasn't scrolled away
            if (!userHasScrolled) {
                isAutoScrolling = true;
                messagesContainer.scrollTop = messagesContainer.scrollHeight;
            }
        };
        
        // Function to process queued chunks
        const processQueuedChunks = async () => {
            if (processingChunks || chunkQueue.length === 0) return;
            
            processingChunks = true;
            while (chunkQueue.length > 0) {
                const chunk = chunkQueue.shift();
                await processChunk(chunk);
            }
            processingChunks = false;
        };
        
        // Create AbortController with optional timeout
        const controller = new AbortController();
        let timeoutId = null;
        
        // Set timeout if configured (0 or undefined means no timeout)
        if (config.webhook.timeout && config.webhook.timeout > 0) {
            timeoutId = setTimeout(() => {
                debugLog('Request timeout after', config.webhook.timeout, 'ms');
                controller.abort();
            }, config.webhook.timeout);
        } else {
            debugLog('No timeout set for streaming request');
        }

        try {
            debugLog('Sending message with streaming:', config.webhook.streaming !== false);
            debugLog('Request data:', messageData);
            
            // Check if streaming is enabled
            if (config.webhook.streaming !== false) {
                // Use streaming for real-time response
                debugLog('Attempting streaming request to:', config.webhook.url);
                const response = await fetch(config.webhook.url, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Accept': 'text/event-stream, application/x-ndjson, application/json'
                    },
                    body: JSON.stringify(messageData),
                    signal: controller.signal
                });

                debugLog('Response status:', response.status);
                debugLog('Response content-type:', response.headers.get('content-type'));
                
                // Try to read as stream regardless of content-type
                if (response.body) {
                    debugLog('Reading response as stream');
                    const reader = response.body.getReader();
                    const decoder = new TextDecoder();
                    let buffer = '';
                    
                    try {
                        while (true) {
                            const { done, value } = await reader.read();
                            if (done) {
                                debugLog('Stream ended');
                                // Process any remaining buffered data
                                if (buffer.trim()) {
                                    const lines = buffer.trim().split('\n');
                                    for (const line of lines) {
                                        if (!line.trim()) continue;
                                        try {
                                            const chunk = JSON.parse(line);
                                            // Ignore final JSON response object
                                            if (chunk.output !== undefined || chunk.intermediateSteps !== undefined) {
                                                debugLog('Ignoring final JSON response in buffer');
                                            } else if (chunk.type === 'item' && chunk.content) {
                                                // Queue the chunk for processing
                                                chunkQueue.push(chunk.content);
                                                processQueuedChunks();
                                            }
                                        } catch (e) {
                                            debugLog('Could not parse buffered line:', line);
                                        }
                                    }
                                }
                                // Wait for all queued chunks to be processed
                                await processQueuedChunks();
                                
                                // Remove cursor when stream ends
                                if (cursorElement && cursorElement.parentNode) {
                                    cursorElement.remove();
                                    cursorElement = null;
                                }
                                if (botMessageDiv) {
                                    botMessageDiv.classList.remove('streaming');
                                }
                                break;
                            }

                            // Decode the chunk
                            const chunkText = decoder.decode(value, { stream: true });
                            buffer += chunkText;
                            debugLog('Received chunk, buffer now:', buffer);
                            
                            // Process complete lines from buffer
                            const lines = buffer.split('\n');
                            // Keep the last incomplete line in buffer
                            buffer = lines.pop() || '';
                            
                            for (const line of lines) {
                                if (!line.trim()) continue;
                                
                                // Handle SSE format
                                if (line.startsWith('data: ')) {
                                    const data = line.slice(6);
                                    if (data === '[DONE]') {
                                        debugLog('Received [DONE] signal');
                                        break;
                                    }
                                    try {
                                        const parsed = JSON.parse(data);
                                        if (parsed.chunk || parsed.content) {
                                            // Queue the chunk for processing
                                            chunkQueue.push(parsed.chunk || parsed.content);
                                            processQueuedChunks();
                                        }
                                    } catch (e) {
                                        debugLog('Failed to parse SSE data:', data);
                                    }
                                } else {
                                    // Handle NDJSON format
                                    try {
                                        const chunk = JSON.parse(line);
                                        debugLog('Processing streamed chunk:', chunk);
                                        
                                        // Check if this is a final response object (not a streaming chunk)
                                        if (chunk.output !== undefined || chunk.intermediateSteps !== undefined) {
                                            debugLog('Received final JSON response, ignoring for streaming (already have content)');
                                            // This is the final response object, not a streaming chunk
                                            // We already have the content from streaming, so ignore this
                                        } else if (chunk.type === 'item' && chunk.content) {
                                            // Queue the chunk for processing
                                            chunkQueue.push(chunk.content);
                                            processQueuedChunks();
                                            
                                            // No delay - instant rendering
                                        } else if (chunk.type === 'begin') {
                                            debugLog('Stream begin');
                                        } else if (chunk.type === 'end') {
                                            debugLog('Stream end signal');
                                        }
                                    } catch (e) {
                                        debugLog('Failed to parse line as JSON:', line);
                                    }
                                }
                            }
                        }
                    } catch (streamError) {
                        debugError('Stream reading error:', streamError);
                        throw streamError;
                    }
                } else {
                    // Fallback for non-streaming response
                    debugLog('Fallback to regular JSON response');
                    try {
                        const responseText = await response.text();
                        debugLog('Raw response text:', responseText);
                        
                        // Clean up loading messages
                        if (loadingMessagesHandler) {
                            await loadingMessagesHandler.waitForMinimumDisplay();
                            loadingMessagesHandler.cleanup();
                            loadingMessagesHandler = null;
                        }
                        
                        // Remove typing indicator
                        typingIndicator.remove();
                        
                        // Create bot message
                        botMessageDiv = document.createElement('div');
                        botMessageDiv.className = 'chat-message bot';
                        messagesContainer.appendChild(botMessageDiv);
                        
                        // Check if response contains multiple JSON objects (NDJSON format)
                        const lines = responseText.trim().split('\n');
                        if (lines.length > 1) {
                            debugLog('Detected NDJSON format, processing chunks');
                            
                            // Process each line as a separate JSON object
                            for (const line of lines) {
                                if (!line.trim()) continue;
                                
                                try {
                                    const chunk = JSON.parse(line);
                                    debugLog('Processing chunk:', chunk);
                                    
                                    // Handle different chunk types
                                    if (chunk.type === 'item' && chunk.content) {
                                        accumulatedText += chunk.content;
                                    } else if (chunk.type === 'begin') {
                                        debugLog('Stream begin');
                                    } else if (chunk.type === 'end') {
                                        debugLog('Stream end');
                                    }
                                } catch (lineParseError) {
                                    debugError('Failed to parse line as JSON:', line, lineParseError);
                                }
                            }
                            
                            botMessageDiv.innerHTML = formatBotMessage(accumulatedText);
                        } else {
                            // Try to parse as single JSON object
                            try {
                                const data = JSON.parse(responseText);
                                debugLog('Received JSON data:', data);
                                accumulatedText = Array.isArray(data) ? data[0].output : data.output;
                                botMessageDiv.innerHTML = formatBotMessage(accumulatedText);
                            } catch (parseError) {
                                debugError('Failed to parse response as JSON:', parseError);
                                debugLog('Treating response as plain text');
                                accumulatedText = responseText;
                                botMessageDiv.innerHTML = formatBotMessage(accumulatedText);
                            }
                        }
                        
                        messagesContainer.scrollTop = messagesContainer.scrollHeight;
                    } catch (textError) {
                        debugError('Failed to read response text:', textError);
                        throw textError;
                    }
                }
            } else {
                debugLog('Non-streaming mode');
                // Non-streaming mode
                const response = await fetch(config.webhook.url, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(messageData),
                    signal: controller.signal
                });

                debugLog('Response status:', response.status);
                
                try {
                    const responseText = await response.text();
                    debugLog('Raw response text:', responseText);
                    
                    // Clean up loading messages
                    if (loadingMessagesHandler) {
                        await loadingMessagesHandler.waitForMinimumDisplay();
                        loadingMessagesHandler.cleanup();
                        loadingMessagesHandler = null;
                    }
                    
                    // Remove typing indicator
                    typingIndicator.remove();
                    
                    // Create bot message
                    botMessageDiv = document.createElement('div');
                    botMessageDiv.className = 'chat-message bot';
                    messagesContainer.appendChild(botMessageDiv);
                    
                    // Try to parse as JSON
                    let data;
                    try {
                        data = JSON.parse(responseText);
                    } catch (parseError) {
                        debugError('Failed to parse response as JSON:', parseError);
                        debugLog('Treating response as plain text');
                        accumulatedText = responseText;
                        botMessageDiv.innerHTML = formatBotMessage(accumulatedText);
                        messagesContainer.scrollTop = messagesContainer.scrollHeight;
                        return;
                    }
                    
                    debugLog('Received data:', data);
                    accumulatedText = Array.isArray(data) ? data[0].output : data.output;
                    botMessageDiv.innerHTML = formatBotMessage(accumulatedText);
                    messagesContainer.scrollTop = messagesContainer.scrollHeight;
                } catch (textError) {
                    debugError('Failed to read response text:', textError);
                    throw textError;
                }
            }

            // Remove cursor and streaming class if they exist (safety check)
            if (cursorElement && cursorElement.parentNode) {
                cursorElement.remove();
                cursorElement = null;
            }
            if (botMessageDiv) {
                botMessageDiv.classList.remove('streaming');
            }

            // Add bot message to history
            addMessageToHistory(accumulatedText, 'agent');
            
            // Clear timeout if it exists
            if (timeoutId) clearTimeout(timeoutId);
            
            // Remove scroll event listener before error handling
            messagesContainer.removeEventListener('scroll', scrollHandler);

        } catch (error) {
            // Clear timeout if it exists
            if (timeoutId) clearTimeout(timeoutId);
            
            // Clean up loading messages
            if (loadingMessagesHandler) {
                loadingMessagesHandler.cleanup();
                loadingMessagesHandler = null;
            }
            
            // Check if it's a timeout error
            const isTimeout = error.name === 'AbortError';
            
            debugError('Error details:', {
                message: error.message,
                stack: error.stack,
                name: error.name,
                isTimeout: isTimeout
            });
            debugError('Full error object:', error);
            
            // Remove typing indicator if it's still there
            if (typingIndicator.parentNode) {
                typingIndicator.remove();
            }
            
            // Show error message
            if (!botMessageDiv) {
                botMessageDiv = document.createElement('div');
                botMessageDiv.className = 'chat-message bot';
                messagesContainer.appendChild(botMessageDiv);
            }
            // Show appropriate error message
            const errorMessage = isTimeout 
                ? `<em>${config.labels.connectionErrorMessage || 'Connection timeout. Please try again later.'}</em>`
                : `<em>${config.labels.errorMessage || 'An error occurred while receiving the response.'}</em>`;
            botMessageDiv.innerHTML = errorMessage;
            botMessageDiv.classList.remove('streaming');
            
            if (cursorElement && cursorElement.parentNode) {
                cursorElement.remove();
            }
        } finally {
            // Remove scroll event listener
            messagesContainer.removeEventListener('scroll', scrollHandler);
            
            // Re-enable input
            textarea.disabled = false;
            sendButton.disabled = false;
            textarea.placeholder = config.labels.inputPlaceholder || 'Type your message here...';
            textarea.focus();
        }
    }

    function restoreChatHistory() {
        const chatHistory = loadChatHistory();

        // Filter messages to only include those from the current session
        const currentSessionMessages = chatHistory.filter(messageEntry =>
            messageEntry.sessionId === currentSessionId
        );

        if (currentSessionMessages.length === 0) return false;

        // Clear any existing messages
        messagesContainer.innerHTML = '';

        // Restore only messages from current session
        currentSessionMessages.forEach(messageEntry => {
            // Skip entries with no text
            if (!messageEntry.text) {
                debugWarn('Skipping history entry with no text:', messageEntry);
                return;
            }
            
            const messageDiv = document.createElement('div');
            // Use 'bot' class for agent messages to match CSS styling
            const messageClass = messageEntry.type === 'agent' ? 'bot' : messageEntry.type;
            messageDiv.className = `chat-message ${messageClass}`;

            if (messageEntry.type === 'agent') {
                messageDiv.innerHTML = formatBotMessage(messageEntry.text);
            } else {
                messageDiv.innerHTML = messageEntry.text.replace(/\n/g, '<br>');
            }

            messagesContainer.appendChild(messageDiv);
        });

        messagesContainer.scrollTop = messagesContainer.scrollHeight;
        return true;
    }

    async function startNewConversation() {
        debugLog('Starting new conversation');
        // Show the chat interface first
        chatContainer.querySelector('.brand-header').style.display = 'none';
        chatContainer.querySelector('.new-conversation').style.display = 'none';
        chatInterface.classList.add('active');

        // Check if we have existing chat history
        if (restoreChatHistory()) {
            debugLog('History restored from localStorage');
            // History restored, no need to make API call
            return;
        }

        debugLog('No history found, starting fresh conversation');
        
        // Check if we should show an initial message
        if (config.initialMessage && config.initialMessage.enabled && config.initialMessage.text) {
            debugLog('Showing configured initial message');
            const botMessageDiv = document.createElement('div');
            botMessageDiv.className = 'chat-message bot';
            botMessageDiv.innerHTML = formatBotMessage(config.initialMessage.text);
            messagesContainer.appendChild(botMessageDiv);
            messagesContainer.scrollTop = messagesContainer.scrollHeight;
            
            // Add to history
            addMessageToHistory(config.initialMessage.text, 'agent');
        }
        
        // Check if we should load previous session from webhook
        if (config.initialMessage && config.initialMessage.loadPreviousSession) {
            debugLog('Loading previous session from webhook');
            debugLog('Current session ID being used:', currentSessionId);
            // Changed from array to single object to match sendMessage format
            const data = {
                action: "loadPreviousSession",
                sessionId: currentSessionId,
                route: config.webhook.route,
                chatInput: '', // Empty chat input for loadPreviousSession
                metadata: {
                    userId: "",
                    streaming: false // No streaming for initial load
                }
            };

            debugLog('Sending loadPreviousSession request:', data);
            debugLog('Full request body:', JSON.stringify(data, null, 2));
            // Disable input while loading
            textarea.disabled = true;
            sendButton.disabled = true;
            textarea.placeholder = config.labels.waitingForResponse || 'Waiting for response...';

            try {
                const response = await fetch(config.webhook.url, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(data)
                });

                debugLog('LoadPreviousSession response status:', response.status);
                const responseData = await response.json();
                debugLog('LoadPreviousSession response data:', responseData);
                
                // Handle LangChain message format from backend
                if (responseData?.data && Array.isArray(responseData.data)) {
                    debugLog('Reconstructing chat history from LangChain messages');
                    
                    // Clear any existing messages first
                    messagesContainer.innerHTML = '';
                    const reconstructedHistory = [];
                    
                    // Process each message in the conversation
                    responseData.data.forEach((msg, index) => {
                        if (msg.id && msg.kwargs && msg.kwargs.content) {
                            const messageType = msg.id[2]; // 'HumanMessage' or 'AIMessage'
                            const content = msg.kwargs.content;
                            
                            // Determine if it's a user or agent message
                            const isUserMessage = messageType === 'HumanMessage';
                            const type = isUserMessage ? 'user' : 'agent';
                            
                            // Add to reconstructed history
                            const historyEntry = {
                                id: generateUUID(),
                                text: content,
                                type: type,
                                timestamp: new Date(Date.now() - (responseData.data.length - index) * 60000).toISOString(), // Approximate timestamps
                                sessionId: currentSessionId
                            };
                            reconstructedHistory.push(historyEntry);
                            
                            // Create and display the message bubble
                            const messageDiv = document.createElement('div');
                            messageDiv.className = `chat-message ${isUserMessage ? 'user' : 'bot'}`;
                            
                            if (isUserMessage) {
                                messageDiv.innerHTML = content.replace(/\n/g, '<br>');
                            } else {
                                messageDiv.innerHTML = formatBotMessage(content);
                            }
                            
                            messagesContainer.appendChild(messageDiv);
                        }
                    });
                    
                    // Save reconstructed history to localStorage
                    if (reconstructedHistory.length > 0) {
                        saveChatHistory(reconstructedHistory);
                        debugLog(`Reconstructed ${reconstructedHistory.length} messages from previous session`);
                    }
                    
                    // Scroll to bottom to show latest messages
                    messagesContainer.scrollTop = messagesContainer.scrollHeight;
                    
                } else {
                    // Handle other response formats (backwards compatibility)
                    let messageText;
                    if (Array.isArray(responseData)) {
                        messageText = responseData[0]?.output;
                    } else if (responseData?.output) {
                        messageText = responseData.output;
                    } else if (responseData?.content) {
                        // Handle error responses that have 'content' instead of 'output'
                        if (responseData.type === 'error') {
                            debugError('Error from webhook:', responseData.content);
                            messageText = null; // Don't show error messages as chat bubbles
                        } else {
                            messageText = responseData.content;
                        }
                    }

                    // Only create message bubble if we have actual text
                    if (messageText && messageText.trim()) {
                        // Add to history
                        addMessageToHistory(messageText, 'agent');

                        const botMessageDiv = document.createElement('div');
                        botMessageDiv.className = 'chat-message bot';
                        botMessageDiv.innerHTML = formatBotMessage(messageText);
                        messagesContainer.appendChild(botMessageDiv);
                        messagesContainer.scrollTop = messagesContainer.scrollHeight;
                    } else {
                        debugLog('No message text received from loadPreviousSession, skipping bubble creation');
                    }
                }
            } catch (error) {
                debugError('Error loading previous session:', error);
            } finally {
                // Re-enable input
                textarea.disabled = false;
                sendButton.disabled = false;
                textarea.placeholder = config.labels.inputPlaceholder || 'Type your message here...';
                textarea.focus();
            }
        } else {
            debugLog('Not loading previous session, chat ready for user input');
            // Just focus the input, ready for user to start typing
            textarea.focus();
        }
    }

    // Event handlers
    newChatBtn.addEventListener('click', startNewConversation);

    sendButton.addEventListener('click', () => {
        const message = textarea.value.trim();
        if (message) {
            sendMessageWithStreaming(message);
            textarea.value = '';
        }
    });

    textarea.addEventListener('keypress', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            const message = textarea.value.trim();
            if (message) {
                sendMessageWithStreaming(message);
                textarea.value = '';
            }
        }
    });

    toggleButton.addEventListener('click', () => {
        chatContainer.classList.toggle('open');
    });

    // Add close button handlers
    const closeButtons = chatContainer.querySelectorAll('.close-button');
    closeButtons.forEach(button => {
        button.addEventListener('click', () => {
            chatContainer.classList.remove('open');
        });
    });

    // Add clear history button handler
    const clearHistoryBtn = chatContainer.querySelector('.clear-history-btn');
    if (clearHistoryBtn) {
        clearHistoryBtn.addEventListener('click', () => {
            if (confirm(config.labels.confirmClearHistory || 'Are you sure you want to clear the entire conversation history?')) {
                clearChatHistory();
                messagesContainer.innerHTML = '';
                // Generate new session ID for fresh start
                currentSessionId = generateUUID();
                localStorage.setItem('chatbot-session-id', currentSessionId);
            }
        });
    }
})();