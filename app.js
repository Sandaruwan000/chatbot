class CosmicChat {
    constructor() {
        this.chatWindow = document.getElementById('chat-window');
        this.userInput = document.getElementById('user-input');
        this.sendBtn = document.getElementById('send-btn');
        this.terminal = document.getElementById('terminal-output');
        
        this.initWebSocket();
        this.setupEventListeners();
        this.autoResizeTextarea();
    }

    initWebSocket() {
        this.ws = new WebSocket('wss://your-backend-url/chat');
        
        this.ws.onmessage = (event) => {
            const response = JSON.parse(event.data);
            if(response.type === 'token') {
                this.appendMessage(response.content, 'ai', false);
            } else {
                this.completeMessage();
            }
        };

        this.ws.onopen = () => this.logTerminal('Connected to neural network');
        this.ws.onerror = (error) => this.logTerminal(`ERROR: ${error.message}`);
    }

    appendMessage(content, sender, isComplete = true) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `${sender}-message`;
        
        const bubble = document.createElement('div');
        bubble.className = `message-bubble ${sender}`;
        
        if(sender === 'ai' && !isComplete) {
            bubble.innerHTML = `<span class="ai-pulse">🌀</span> ${content}`;
        } else {
            bubble.textContent = content;
        }
        
        messageDiv.appendChild(bubble);
        this.chatWindow.appendChild(messageDiv);
        this.chatWindow.scrollTop = this.chatWindow.scrollHeight;
    }

    async sendMessage() {
        const message = this.userInput.value.trim();
        if(!message) return;

        this.appendMessage(message, 'user');
        this.userInput.value = '';
        
        this.ws.send(JSON.stringify({
            message: message,
            model: 'tinyllama',
            options: { temperature: 0.7 }
        }));
    }

    logTerminal(text) {
        const entry = document.createElement('div');
        entry.textContent = `> ${text}`;
        this.terminal.appendChild(entry);
        this.terminal.scrollTop = this.terminal.scrollHeight;
    }

    autoResizeTextarea() {
        this.userInput.addEventListener('input', () => {
            this.userInput.style.height = 'auto';
            this.userInput.style.height = `${this.userInput.scrollHeight}px`;
        });
    }

    setupEventListeners() {
        this.sendBtn.addEventListener('click', () => this.sendMessage());
        this.userInput.addEventListener('keypress', (e) => {
            if(e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                this.sendMessage();
            }
        });
    }
}

// Initialize chat
document.addEventListener('DOMContentLoaded', () => new CosmicChat());