# Backend Connection Guide

## Overview
This document provides detailed instructions for connecting to the main backend API, including endpoint specifications, payload structures, and access management to prevent port overloading.

## API Base URL Configuration
The frontend must connect to the backend using a base URL configured via environment variables:
```
NEXT_PUBLIC_API_BASE_URL=https://realculture-backend-g3b9deb2fja4b8a2.canadacentral-01.azurewebsites.net
```

## Authentication

### JWT Token Authentication
Most endpoints require JWT token authentication through the Authorization header:
```
Authorization: Bearer <jwt_token>
```

### API Key Authentication
For service-to-service communication, use API key authentication:
```
x-api-key: <API_KEY>
```
API keys are cryptographically secure (32-byte hex) and can be generated via the `/auth/api-key/generate` endpoint.

## Core Endpoints

### Authentication Endpoints

#### 1. User Login
```
POST /auth/login
```

**Request Payload:**
```json
{
  "email": "user@example.com",
  "password": "user_password"
}
```

**Response:**
```json
{
  "success": true,
  "accessToken": "jwt_token_here",
  "refreshToken": "refresh_token_here",
  "user": {
    "userId": "uuid",
    "email": "user@example.com",
    "name": "User Name",
    "role": "FREE|CREATOR|PRO",
    "credits": 100
  }
}
```

#### 2. Refresh Token
```
POST /auth/refresh
```

**Request Headers:**
```
Authorization: Bearer <refresh_token>
```

**Response:**
```json
{
  "success": true,
  "accessToken": "new_jwt_token_here"
}
```

### Image Generation Endpoints

#### 1. Generate Promo Image (Synchronous)
```
POST /api/v1/promo-image
```

**Request Headers:**
```
Authorization: Bearer <jwt_token>
Content-Type: application/json
```

**Request Payload:**
```json
{
  "prompt": "A beautiful landscape with mountains and a lake",
  "dualImage": false,
  "isJsonPrompt": false,
  "useVoice": false,
  "useSubtitles": false,
  "useMusic": false,
  "useFlux": false
}
```

**Response:**
```json
{
  "success": true,
  "result": {
    "imageUrl": "https://storage-url/image.jpg?token",
    "filename": "generated-image.jpg",
    "userId": "user-id",
    "prompt": "original prompt used"
  },
  "credits": 85
}
```

#### 2. Generate Dual Images (Synchronous)
```
POST /api/v1/promo-image
```

**Request Payload:**
```json
{
  "prompt": "A futuristic cityscape at night with flying cars",
  "dualImage": true,
  "isJsonPrompt": false,
  "useVoice": false,
  "useSubtitles": false,
  "useMusic": false,
  "useFlux": false
}
```

**Response:**
```json
{
  "success": true,
  "result": {
    "promo": {
      "imageUrl": "https://storage-url/promo-image.jpg?token",
      "filename": "promo-image.jpg"
    },
    "flux": {
      "imageUrl": "https://storage-url/flux-image.jpg?token",
      "filename": "flux-image.jpg"
    }
  },
  "credits": 70
}
```

### Audio Generation Endpoints

#### 1. Generate Audio
```
POST /api/audio/generate
```

**Request Payload:**
```json
{
  "prompt": "Narration for a promotional video",
  "duration": 30
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "script": "Generated script content",
    "audioUrl": "https://storage-url/audio.mp3?token",
    "duration": 30,
    "creditsUsed": 5
  }
}
```

### User Management Endpoints

#### 1. Get User Profile
```
GET /users/profile
```

**Response:**
```json
{
  "success": true,
  "data": {
    "userId": "uuid",
    "email": "user@example.com",
    "name": "User Name",
    "role": "FREE",
    "credits": 100,
    "plan": "FREE",
    "createdAt": "2025-01-01T00:00:00.000Z"
  }
}
```

#### 2. Update User Profile
```
PUT /users/profile
```

**Request Payload:**
```json
{
  "name": "New Name",
  "picture": "https://example.com/avatar.jpg"
}
```

### Health Check Endpoints

#### 1. General Health
```
GET /health
```

#### 2. Ping Endpoint
```
GET /ping
```

#### 3. Health Ping
```
GET /health/ping
```

## Payload Structures

### Common Response Structure
All API responses follow a standard structure:
```json
{
  "success": true,
  "message": "Descriptive message",
  "data": {}
}
```

For errors:
```json
{
  "success": false,
  "message": "Error description",
  "error": "Error details",
  "statusCode": 400
}
```

## Error Handling

- **401 Unauthorized**: Redirect user to login page
- **403 Forbidden**: Insufficient permissions or credits
- **400 Bad Request**: Invalid input data
- **500 Internal Server Error**: Server-side issues

## Access Management and Port Overloading Prevention

### 1. Connection Pooling
Implement connection pooling in your frontend application to reuse connections:

```javascript
// Example implementation
class ApiClient {
  constructor() {
    this.connectionPool = [];
    this.maxConnections = 10;
  }
  
  async makeRequest(endpoint, options) {
    // Limit concurrent requests
    if (this.activeRequests >= this.maxConnections) {
      await this.waitForAvailableConnection();
    }
    
    // Make API request
    return fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}${endpoint}`, options);
  }
}
```

### 2. Rate Limiting
Implement client-side rate limiting:

```javascript
class RateLimiter {
  constructor(maxRequests = 5, timeWindow = 1000) {
    this.maxRequests = maxRequests;
    this.timeWindow = timeWindow;
    this.requests = [];
  }
  
  async execute(requestFn) {
    const now = Date.now();
    this.requests = this.requests.filter(time => now - time < this.timeWindow);
    
    if (this.requests.length >= this.maxRequests) {
      const waitTime = this.timeWindow - (now - this.requests[0]);
      await new Promise(resolve => setTimeout(resolve, waitTime));
    }
    
    this.requests.push(now);
    return requestFn();
  }
}
```

### 3. Request Queuing
For image generation requests, implement queuing to prevent overwhelming the backend:

```javascript
class RequestQueue {
  constructor() {
    this.queue = [];
    this.processing = false;
  }
  
  add(request) {
    this.queue.push(request);
    if (!this.processing) {
      this.processQueue();
    }
  }
  
  async processQueue() {
    this.processing = true;
    
    while (this.queue.length > 0) {
      const request = this.queue.shift();
      try {
        await request();
        // Add delay between requests to prevent overloading
        await new Promise(resolve => setTimeout(resolve, 1000));
      } catch (error) {
        console.error('Request failed:', error);
      }
    }
    
    this.processing = false;
  }
}
```

### 4. Caching Strategy
Implement caching for frequently accessed data:

```javascript
class CacheManager {
  constructor() {
    this.cache = new Map();
    this.ttl = 5 * 60 * 1000; // 5 minutes
  }
  
  get(key) {
    const item = this.cache.get(key);
    if (item && Date.now() - item.timestamp < this.ttl) {
      return item.data;
    }
    this.cache.delete(key);
    return null;
  }
  
  set(key, data) {
    this.cache.set(key, {
      data,
      timestamp: Date.now()
    });
  }
}
```

## Best Practices

### 1. Error Handling
```javascript
async function handleApiCall(apiCall) {
  try {
    const response = await apiCall();
    
    if (response.status === 401) {
      // Redirect to login
      window.location.href = '/login';
      return;
    }
    
    if (!response.ok) {
      throw new Error(`API Error: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('API call failed:', error);
    throw error;
  }
}
```

### 2. Token Management
```javascript
class TokenManager {
  static getAccessToken() {
    return localStorage.getItem('accessToken');
  }
  
  static setAccessToken(token) {
    localStorage.setItem('accessToken', token);
  }
  
  static clearTokens() {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
  }
}
```

### 3. Retry Logic
```javascript
async function retryApiCall(apiCall, maxRetries = 3) {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await apiCall();
    } catch (error) {
      if (i === maxRetries - 1) throw error;
      
      // Exponential backoff
      await new Promise(resolve => setTimeout(resolve, Math.pow(2, i) * 1000));
    }
  }
}
```

## Security Considerations

- Never expose JWT tokens in client-side code
- Use HTTPS for all API communications
- Validate all responses before using data
- Implement proper CORS configuration
- Sanitize user inputs before sending to API

## Monitoring and Debugging

### 1. Request Logging
```javascript
function logRequest(endpoint, options) {
  console.log(`API Request: ${endpoint}`, {
    method: options.method,
    headers: options.headers,
    timestamp: new Date().toISOString()
  });
}
```

### 2. Response Monitoring
```javascript
function logResponse(endpoint, response) {
  console.log(`API Response: ${endpoint}`, {
    status: response.status,
    timestamp: new Date().toISOString()
  });
}
```

## Support and Troubleshooting

### Common Issues

#### 401 Unauthorized Errors
- Check if token is expired
- Verify token format
- Refresh token if needed

#### 403 Forbidden Errors
- Check user permissions
- Verify credit balance
- Confirm plan limitations

#### 500 Internal Server Errors
- Check API status
- Review request payload
- Contact backend team

### Debugging Tips
- Check Network Tab in browser developer tools
- Verify Environment Variables are correctly set
- Test Endpoints with tools like Postman
- Review Application Logs for detailed error information

## Integration with MisyBot Backend-Refactor

### Context Management Integration
The frontend should integrate with the MisyBot backend's context management system by:

1. **Session Tracking**: Maintain session IDs for context continuity
2. **Context Bundles**: Use context bundles to maintain conversation history
3. **Semantic Search**: Leverage semantic search capabilities for intelligent responses

### Agent Communication
Frontend applications should communicate with agents through the established message bus:

1. **Agent Requests**: Send requests to specific agents via the message bus
2. **Response Handling**: Process agent responses with proper correlation IDs
3. **Real-time Updates**: Implement WebSocket connections for real-time status updates

### Data Synchronization
Ensure data synchronization between frontend and backend:

1. **User Data**: Keep user profile information synchronized
2. **Content Artifacts**: Track generated content and artifacts
3. **Workflow Status**: Monitor workflow and saga execution status

This guide ensures proper integration between frontend applications and the MisyBot backend-refactor system while maintaining security, performance, and scalability.