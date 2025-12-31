/* ================================================================
   CHATBOX.JS - Medical AI Assistant
   ================================================================
   Handles chat messages and AI responses
   Dependencies: globals.js
   ================================================================ */

// ================================================================
// MESSAGE DISPLAY
// ================================================================

function addChatMessage(sender, message, type = 'normal') {
    const chatBox = document.getElementById('chatMessages');
    if (!chatBox) return;
    
    const messageDiv = document.createElement('div');
    messageDiv.className = `message-group ${sender.toLowerCase() === 'user' ? 'user' : 'ai'}`;
    
    const bubble = document.createElement('div');
    bubble.className = `message-bubble ${sender.toLowerCase() === 'user' ? 'user' : 'ai'}`;
    
    // Add message type class
    if (type === 'warning') {
        bubble.style.borderColor = '#ffbe0b';
        bubble.style.color = '#ffbe0b';
    } else if (type === 'error') {
        bubble.style.borderColor = '#ff0055';
        bubble.style.color = '#ff0055';
    }
    
    bubble.innerHTML = `
        <div style="margin-bottom: 4px;">${message}</div>
        <div class="message-timestamp">${getTimeString()}</div>
    `;
    
    messageDiv.appendChild(bubble);
    chatBox.appendChild(messageDiv);
    
    // Auto-scroll to latest message
    chatBox.scrollTop = chatBox.scrollHeight;
    
    // Add to history
    if (!APP_STATE.chatHistory) APP_STATE.chatHistory = [];
    APP_STATE.chatHistory.push({
        sender: sender,
        message: message,
        timestamp: new Date().toISOString(),
        type: type
    });
}

// ================================================================
// GET TIME STRING
// ================================================================

function getTimeString() {
    const now = new Date();
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    return `${hours}:${minutes}`;
}

// ================================================================
// SEND MESSAGE HANDLER
// ================================================================

function sendChatMessage() {
    const input = document.getElementById('chatInput');
    if (!input) return;
    
    const message = input.value.trim();
    if (!message) return;
    
    // Add user message
    addChatMessage('User', message);
    input.value = '';
    
    // Show typing indicator
    showTypingIndicator();
    
    // Get AI response after delay
    setTimeout(() => {
        const response = getAIResponse(message);
        removeTypingIndicator();
        addChatMessage('Doctor AI', response);
    }, 500 + Math.random() * 500);
}

// ================================================================
// AI RESPONSE GENERATOR
// ================================================================

function getAIResponse(userMessage) {
    const message = userMessage.toLowerCase();
    
    // Vital-based responses
    if (APP_STATE.vitals) {
        if (message.includes('heart') || message.includes('heartbeat')) {
            return `Heart rate is currently ${APP_STATE.vitals.heartRate} BPM. This is ${
                APP_STATE.vitals.heartRate < 60 ? 'lower' : APP_STATE.vitals.heartRate > 100 ? 'higher' : 'normal'
            } than average.`;
        }
        
        if (message.includes('temperature') || message.includes('temp')) {
            return `Current body temperature: ${APP_STATE.vitals.temperature}°C. ${
                APP_STATE.vitals.temperature > 37.5 ? 'Slightly elevated.' : 'Normal range.'
            }`;
        }
        
        if (message.includes('oxygen') || message.includes('saturation') || message.includes('o2')) {
            return `Oxygen saturation: ${APP_STATE.vitals.oxygenSaturation}%. ${
                APP_STATE.vitals.oxygenSaturation >= 95 ? 'Excellent oxygen levels.' : 'Monitor oxygen levels carefully.'
            }`;
        }
        
        if (message.includes('blood pressure') || message.includes('pressure')) {
            return `Blood pressure: ${APP_STATE.vitals.bloodPressure}. ${
                APP_STATE.vitals.bloodPressure === '120/80' ? 'Normal reading.' : 'Slightly elevated. Consider relaxation.'
            }`;
        }
    }
    
    // General medical knowledge
    const responses = {
        'hello|hi|hey|greetings': [
            'Hello! I am your medical AI assistant. How can I help you today?',
            'Hi there! I can help you understand your vitals and medical conditions.',
            'Greetings! Ask me about your health or vital signs.'
        ],
        'help|assist|what can you do|capabilities': [
            'I can help you with: vital sign monitoring, illness information, health advice, and medical education.',
            'I provide real-time vital monitoring, AI medical guidance, and anatomical education.',
            'My capabilities include: analyzing vitals, explaining symptoms, medical information.'
        ],
        'diabetes|diabetic': [
            'Diabetes affects blood sugar regulation. Type 1 is autoimmune, Type 2 involves insulin resistance. Manage with diet and exercise.',
            'Diabetes requires careful glucose monitoring and management. Would you like specific information?'
        ],
        'heart|cardiac|cardiovascular': [
            'The heart is a muscular organ pumping blood throughout the body. Heart rate varies with activity and stress.',
            'Cardiovascular health is vital. Monitor your heart rate, blood pressure, and oxygen levels regularly.'
        ],
        'respiratory|breathing|lungs|breath': [
            'The respiratory system oxygenates your blood. Normal oxygen saturation is 95-100%.',
            'Breathing is controlled by your diaphragm. Good respiratory health is essential for life.'
        ],
        'stress|anxiety|worried': [
            'Stress elevates heart rate and blood pressure. Try relaxation techniques: deep breathing, meditation.',
            'High stress levels affect multiple vital signs. Consider stress management activities.',
            'Breathing exercises can help manage stress. Try 4-7-8 breathing technique.'
        ],
        'fever|high temperature': [
            'High temperature may indicate infection. Stay hydrated and consult a healthcare provider if persistent.',
            'Fever is often your body fighting infection. Monitor and maintain hydration.'
        ],
        'sleep|rest': [
            'Quality sleep is crucial for health. Aim for 7-9 hours nightly.',
            'Rest helps your body recover. Sleep affects all vital signs and recovery.'
        ],
        'exercise|workout|fitness': [
            'Regular exercise strengthens the cardiovascular system and improves health.',
            'Physical activity increases heart rate and oxygen consumption. Start gradually if new to exercise.'
        ],
        'diet|nutrition|food': [
            'Proper nutrition supports health. Balanced diet with proteins, vegetables, and whole grains recommended.',
            'What you eat affects your vitals and overall health. Maintain balanced nutrition.'
        ]
    };
    
    // Find matching response
    for (const [keywords, responseList] of Object.entries(responses)) {
        const keywordArray = keywords.split('|');
        if (keywordArray.some(keyword => message.includes(keyword))) {
            return responseList[Math.floor(Math.random() * responseList.length)];
        }
    }
    
    // Default response
    const defaults = [
        'That\'s interesting. Can you tell me more about your symptoms?',
        'I understand. How are you feeling otherwise?',
        'Let me help you with that. Do you have specific vital signs you\'re concerned about?',
        'Good question. Based on your vitals, everything seems to be within normal ranges.',
        'That\'s important health information. Keep monitoring your vitals.'
    ];
    
    return defaults[Math.floor(Math.random() * defaults.length)];
}

// ================================================================
// TYPING INDICATOR
// ================================================================

function showTypingIndicator() {
    const chatBox = document.getElementById('chatMessages');
    if (!chatBox) return;
    
    const typingDiv = document.createElement('div');
    typingDiv.id = 'typingIndicator';
    typingDiv.className = 'message-group ai';
    
    const bubble = document.createElement('div');
    bubble.className = 'message-typing';
    
    bubble.innerHTML = `
        <div class="typing-dot"></div>
        <div class="typing-dot"></div>
        <div class="typing-dot"></div>
    `;
    
    typingDiv.appendChild(bubble);
    chatBox.appendChild(typingDiv);
    chatBox.scrollTop = chatBox.scrollHeight;
}

function removeTypingIndicator() {
    const indicator = document.getElementById('typingIndicator');
    if (indicator) indicator.remove();
}

// ================================================================
// QUICK RESPONSE BUTTONS
// ================================================================

function addQuickResponseButton(text) {
    const input = document.getElementById('chatInput');
    if (input) {
        input.value = text;
        sendChatMessage();
    }
}

// ================================================================
// CLEAR CHAT HISTORY
// ================================================================

function clearChatHistory() {
    const chatBox = document.getElementById('chatMessages');
    if (chatBox) {
        chatBox.innerHTML = '';
    }
    APP_STATE.chatHistory = [];
    showNotification('Chat history cleared', 'info');
}

// ================================================================
// EXPORT CHAT HISTORY
// ================================================================

function exportChatHistory() {
    if (!APP_STATE.chatHistory || APP_STATE.chatHistory.length === 0) {
        showNotification('No chat history to export', 'warning');
        return;
    }
    
    const content = APP_STATE.chatHistory
        .map(msg => `[${msg.timestamp}] ${msg.sender}: ${msg.message}`)
        .join('\n');
    
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = `chat_history_${Date.now()}.txt`;
    a.click();
    
    URL.revokeObjectURL(url);
    showNotification('Chat history exported', 'success');
}

// ================================================================
// INITIALIZATION
// ================================================================

function initializeChatbox() {
    // Send button
    document.getElementById('sendChatBtn')?.addEventListener('click', sendChatMessage);
    
    // Enter key to send
    document.getElementById('chatInput')?.addEventListener('keypress', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendChatMessage();
        }
    });
    
    // Clear button
    document.getElementById('clearChatBtn')?.addEventListener('click', clearChatHistory);
    
    // Export button
    document.getElementById('exportChatBtn')?.addEventListener('click', exportChatHistory);
    
    // Welcome message
    addChatMessage('Doctor AI', 'Hello! I\'m your medical AI assistant. How can I help you today? Ask me about your vital signs or health conditions.');
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeChatbox);
} else {
    initializeChatbox();
}