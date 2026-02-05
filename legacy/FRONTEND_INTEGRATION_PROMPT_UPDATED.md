# 📱 Frontend Integration Guide - Front Desk Agent Microservice

## 🎯 Objective
Create a seamless frontend integration with the Front Desk Agent microservice that provides an intelligent, conversational user experience for routing requests to specialized agents.

## 🏗️ Architecture Overview

### Technology Stack Recommendation
- **Framework**: React with Next.js or Vue.js with Nuxt.js
- **State Management**: Redux Toolkit or Pinia
- **UI Components**: Material-UI, Ant Design, or Tailwind CSS
- **Real-time Communication**: WebSocket (Socket.IO) for chat updates
- **HTTP Client**: Axios or Fetch API

### Component Structure
```
src/
├── components/
│   ├── chat/
│   │   ├── ChatWidget.jsx
│   │   ├── ChatHeader.jsx
│   │   ├── ChatMessages.jsx
│   │   ├── ChatInput.jsx
│   │   ├── MessageBubble.jsx
│   │   └── TypingIndicator.jsx
│   ├── front-desk/
│   │   ├── ConversationFlow.jsx
│   │   ├── QuestionPrompt.jsx
│   │   ├── ConfirmationPanel.jsx
│   │   └── ProgressIndicator.jsx
│   └── ...
├── services/
│   ├── frontDeskService.js
│   └── apiClient.js
├── store/
│   └── slices/
│       ├── chatSlice.js
│       └── frontDeskSlice.js
└── hooks/
    ├── useFrontDesk.js
    └── useChat.js
```

## 🔌 API Integration

### Front Desk Agent Endpoints
```javascript
// Base URL
const BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3000';

// Endpoints
const endpoints = {
  processMessage: `${BASE_URL}/api/agents/front-desk`,
  getConversations: `${BASE_URL}/api/agents/front-desk`,
  getConversationById: (id) => `${BASE_URL}/api/agents/front-desk/${id}`,
  getConversationsBySession: (sessionId) => `${BASE_URL}/api/agents/front-desk/session/${sessionId}`
};
```

### HTTP Service Implementation
```javascript
// services/frontDeskService.js
import axios from 'axios';

class FrontDeskService {
  constructor() {
    this.baseUrl = process.env.REACT_APP_API_URL || 'http://localhost:3000';
    this.sessionId = this.generateSessionId();
  }

  generateSessionId() {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  async processMessage(message, context = {}) {
    try {
      const response = await axios.post(`${this.baseUrl}/api/agents/front-desk`, {
        message,
        context: {
          sessionId: this.sessionId,
          language: 'es', // Default language
          ...context
        }
      });
      
      return response.data;
    } catch (error) {
      console.error('Error processing message:', error);
      throw error;
    }
  }

  async getConversationHistory() {
    try {
      const response = await axios.get(
        `${this.baseUrl}/api/agents/front-desk/session/${this.sessionId}`
      );
      return response.data;
    } catch (error) {
      console.error('Error fetching conversation history:', error);
      return [];
    }
  }
}

export default new FrontDeskService();
```

## 🎨 UI Component Design

### 1. Chat Widget Component
```jsx
// components/chat/ChatWidget.jsx
import React, { useState, useEffect } from 'react';
import ChatHeader from './ChatHeader';
import ChatMessages from './ChatMessages';
import ChatInput from './ChatInput';
import { useFrontDesk } from '../../hooks/useFrontDesk';

const ChatWidget = ({ isOpen, onClose }) => {
  const { messages, isProcessing, sendMessage } = useFrontDesk();
  const [inputValue, setInputValue] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (inputValue.trim() && !isProcessing) {
      await sendMessage(inputValue);
      setInputValue('');
    }
  };

  return (
    <div className={`chat-widget ${isOpen ? 'open' : 'closed'}`}>
      <ChatHeader onClose={onClose} />
      <ChatMessages messages={messages} isProcessing={isProcessing} />
      <ChatInput 
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        onSubmit={handleSubmit}
        disabled={isProcessing}
        placeholder={isProcessing ? "Procesando tu solicitud..." : "Escribe tu mensaje..."}
      />
    </div>
  );
};

export default ChatWidget;
```

### 2. Message Display Component
```jsx
// components/chat/ChatMessages.jsx
import React from 'react';
import MessageBubble from './MessageBubble';
import TypingIndicator from './TypingIndicator';

const ChatMessages = ({ messages, isProcessing }) => {
  return (
    <div className="chat-messages">
      {messages.map((message, index) => (
        <MessageBubble 
          key={index} 
          message={message} 
          isLast={index === messages.length - 1}
        />
      ))}
      {isProcessing && <TypingIndicator />}
    </div>
  );
};

export default ChatMessages;
```

### 3. Message Bubble Component
```jsx
// components/chat/MessageBubble.jsx
import React from 'react';

const MessageBubble = ({ message, isLast }) => {
  const isUser = message.type === 'user';
  
  return (
    <div className={`message-bubble ${isUser ? 'user' : 'agent'} ${isLast ? 'last' : ''}`}>
      <div className="message-content">
        {message.content}
        {message.confidence && (
          <span className="confidence-indicator">
            Confianza: {(message.confidence * 100).toFixed(0)}%
          </span>
        )}
      </div>
      <div className="message-timestamp">
        {new Date(message.timestamp).toLocaleTimeString()}
      </div>
    </div>
  );
};

export default MessageBubble;
```

## 🔄 Conversational Flow Implementation

### Custom Hook for Front Desk Logic
```javascript
// hooks/useFrontDesk.js
import { useState, useEffect } from 'react';
import frontDeskService from '../services/frontDeskService';

export const useFrontDesk = () => {
  const [messages, setMessages] = useState([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [conversationState, setConversationState] = useState({
    isComplete: false,
    targetAgent: '',
    collectedInfo: {},
    missingInfo: [],
    confidence: 0
  });

  const sendMessage = async (userMessage) => {
    // Add user message to chat
    const userMsg = {
      type: 'user',
      content: userMessage,
      timestamp: new Date().toISOString()
    };
    
    setMessages(prev => [...prev, userMsg]);
    setIsProcessing(true);

    try {
      // Process with Front Desk Agent
      const response = await frontDeskService.processMessage(userMessage);
      
      // Add agent response to chat
      const agentMsg = {
        type: 'agent',
        content: response.conversation.agentResponse,
        confidence: response.conversation.confidence,
        timestamp: new Date().toISOString(),
        isComplete: response.conversation.isComplete,
        targetAgent: response.conversation.targetAgent
      };
      
      setMessages(prev => [...prev, agentMsg]);
      setConversationState({
        isComplete: response.conversation.isComplete,
        targetAgent: response.conversation.targetAgent,
        collectedInfo: response.conversation.collectedInfo,
        missingInfo: response.conversation.missingInfo,
        confidence: response.conversation.confidence
      });
      
      // If conversation is complete, trigger routing to target agent
      if (response.conversation.isComplete && response.conversation.targetAgent) {
        // Here you would implement the routing logic to the target agent
        console.log(`Routing to agent: ${response.conversation.targetAgent}`);
      }
    } catch (error) {
      const errorMsg = {
        type: 'error',
        content: 'Lo siento, hubo un error procesando tu solicitud. Por favor intenta de nuevo.',
        timestamp: new Date().toISOString()
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setIsProcessing(false);
    }
  };

  const resetConversation = () => {
    setMessages([]);
    setConversationState({
      isComplete: false,
      targetAgent: '',
      collectedInfo: {},
      missingInfo: [],
      confidence: 0
    });
  };

  return {
    messages,
    isProcessing,
    conversationState,
    sendMessage,
    resetConversation
  };
};
```

## 🎯 Response Structure

The Front Desk Agent returns responses in the following structure:

```json
{
  "agent": "front-desk",
  "status": "clarification_needed|ready",
  "conversation": {
    "userMessage": "string",
    "agentResponse": "string",
    "objective": "generate_video|schedule_post|analyze_trends|faq_response|generate_report",
    "targetAgent": "video-scriptor|post-scheduler|trend-scanner|faq-responder|analytics-reporter",
    "collectedInfo": {
      "platform": "string",
      "topic": "string",
      "duration": "string",
      // ... other collected information
    },
    "missingInfo": ["string"],
    "confidence": 0.0-1.0,
    "isComplete": true|false
  }
}
```

## 🎨 Styling Guidelines

### CSS Classes for Chat Interface
```css
.chat-widget {
  position: fixed;
  bottom: 20px;
  right: 20px;
  width: 400px;
  height: 600px;
  background: white;
  border-radius: 10px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  display: flex;
  flex-direction: column;
  z-index: 1000;
  transition: all 0.3s ease;
}

.chat-widget.closed {
  transform: translateY(100px);
  opacity: 0;
  visibility: hidden;
}

.chat-messages {
  flex: 1;
  overflow-y: auto;
  padding: 20px;
  display: flex;
  flex-direction: column;
}

.message-bubble {
  max-width: 80%;
  padding: 12px 16px;
  margin-bottom: 15px;
  border-radius: 18px;
  position: relative;
}

.message-bubble.user {
  align-self: flex-end;
  background: #1976d2;
  color: white;
}

.message-bubble.agent {
  align-self: flex-start;
  background: #f5f5f5;
  color: #333;
}

.confidence-indicator {
  display: block;
  font-size: 0.8em;
  opacity: 0.7;
  margin-top: 5px;
}
```

## 🔧 Environment Configuration

### Required Environment Variables
```bash
# .env.local
REACT_APP_API_URL=http://localhost:3000
```

## 🚀 Integration Checklist

### Frontend Implementation
- [ ] Create chat widget component with open/close functionality
- [ ] Implement HTTP service for API communication with Front Desk Agent
- [ ] Design message display components with user/agent differentiation
- [ ] Implement conversational flow logic with progressive information gathering
- [ ] Add state management for conversation data and processing states
- [ ] Create responsive UI with proper styling for desktop and mobile
- [ ] Implement error handling and user feedback mechanisms
- [ ] Add session management for conversation continuity
- [ ] Test progressive information gathering and confirmation flow
- [ ] Validate routing to target agents when conversation is complete

### API Integration
- [ ] Configure base URL for microservice (default: http://localhost:3000)
- [ ] Implement POST /api/agents/front-desk endpoint for message processing
- [ ] Handle conversation history retrieval via session ID
- [ ] Process JSON responses from agent with proper error handling
- [ ] Manage session IDs for conversation tracking
- [ ] Implement retry mechanisms for failed API calls

### User Experience
- [ ] Ensure smooth conversational flow with natural language processing
- [ ] Provide clear prompts for missing information with contextual questions
- [ ] Visualize confidence levels to show understanding quality
- [ ] Implement confirmation flow before routing to specialized agents
- [ ] Add loading states and typing indicators for better feedback
- [ ] Handle edge cases and error scenarios gracefully
- [ ] Optimize for mobile and desktop viewing
- [ ] Ensure accessibility compliance (ARIA labels, keyboard navigation)

This integration guide provides a comprehensive approach for frontend developers to create a seamless interface that works with the Front Desk Agent microservice, enabling natural, conversational interactions that progressively gather user requirements and route them to the appropriate specialized agent.