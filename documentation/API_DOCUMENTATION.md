# 📚 API Documentation - Misy Agent System

## 🚀 Swagger UI Access

After starting the application, Swagger UI will be available at:
```
http://localhost:3007/api-docs
```

This interactive documentation allows you to:
- View all available endpoints
- See detailed parameter descriptions
- Test endpoints directly in the browser
- View example requests and responses

## 📋 Complete Endpoint List

### 🔐 OAuth Endpoints (`/api/oauth`)

#### 1. Get Available Platforms
```
GET /api/oauth/platforms
```
**Description:** Returns a list of all supported OAuth platforms and their categories
**Response:**
```json
{
  "platforms": ["instagram", "facebook", "youtube", "google", "microsoft"],
  "categories": {
    "productivity": ["google", "microsoft"],
    "email": ["google", "microsoft"]
  }
}
```

#### 2. Initiate OAuth Flow
```
POST /api/oauth/connect/:platform
```
**Description:** Starts the OAuth authentication process for a specific platform
**Parameters:**
- `platform` (path): OAuth platform (instagram, facebook, youtube, google, microsoft, etc.)
**Body:**
```json
{
  "sessionId": "user-session-123",
  "redirectUrl": "http://localhost:3000/oauth-success"
}
```
**Response:**
```json
{
  "success": true,
  "authUrl": "https://accounts.google.com/oauth/authorize?...",
  "state": "random-state-string",
  "platform": "google",
  "message": "Please visit the auth URL to connect your google account"
}
```

#### 3. OAuth Callback Handler
```
GET /api/oauth/callback/:platform
```
**Description:** Handles the OAuth callback from external platforms after user authorization
**Parameters:**
- `platform` (path): OAuth platform
- `code` (query): Authorization code from OAuth provider
- `state` (query): State parameter for security validation
- `error` (query): Error message if OAuth failed

#### 4. Get Connected Accounts
```
GET /api/oauth/accounts/:sessionId
```
**Description:** Returns all OAuth accounts connected for a specific session
**Parameters:**
- `sessionId` (path): User session ID
**Response:**
```json
{
  "accounts": [
    {
      "id": "account-id-1",
      "platform": "google",
      "name": "John Doe",
      "email": "john@example.com",
      "avatar": "https://example.com/avatar.jpg",
      "expiresAt": "2024-01-20T15:00:00Z",
      "scopes": ["gmail.send", "calendar.events"]
    }
  ],
  "total": 1
}
```

### 🔄 Integration Endpoints (`/api/integrations`)

#### 1. Send Email
```
POST /api/integrations/email/send
```
**Description:** Send an email through connected email provider (Gmail or Outlook)
**Body:**
```json
{
  "sessionId": "user-session-123",
  "provider": "google",
  "message": {
    "to": ["recipient@example.com"],
    "cc": ["cc@example.com"],
    "bcc": ["bcc@example.com"],
    "subject": "Hello from Misy Agent",
    "body": "<p>This is an HTML email</p>",
    "isHtml": true,
    "attachments": [
      {
        "filename": "document.pdf",
        "content": "base64-encoded-content",
        "contentType": "application/pdf"
      }
    ]
  }
}
```

#### 2. Create Calendar Event
```
POST /api/integrations/calendar/create-event
```
**Description:** Create a calendar event in Google Calendar or Microsoft Calendar
**Body:**
```json
{
  "sessionId": "user-session-123",
  "provider": "google-calendar",
  "event": {
    "title": "Team Meeting",
    "description": "Weekly team sync",
    "startTime": "2024-01-20T15:00:00Z",
    "endTime": "2024-01-20T16:00:00Z",
    "location": "Conference Room",
    "attendees": ["attendee@example.com"],
    "isAllDay": false,
    "recurrence": {
      "frequency": "weekly",
      "interval": 1,
      "until": "2024-12-31T23:59:59Z"
    }
  }
}
```

#### 3. Post to Social Media
```
POST /api/integrations/social/post/:platform
```
**Description:** Post content to social media platforms (Instagram, Facebook, etc.)
**Parameters:**
- `platform` (path): Social media platform (instagram, facebook, twitter, linkedin, youtube)
**Body:**
```json
{
  "sessionId": "user-session-123",
  "content": {
    "text": "Check out our latest update!",
    "imageUrls": ["https://example.com/image.jpg"],
    "videoUrls": ["https://example.com/video.mp4"]
  }
}
```

#### 4. Upload Video to YouTube
```
POST /api/integrations/youtube/upload
```
**Description:** Upload a video to YouTube with metadata
**Body:**
```json
{
  "sessionId": "user-session-123",
  "videoData": {
    "title": "My Awesome Video",
    "description": "Check out this amazing content!",
    "videoFile": "binary-video-data",
    "tags": ["tutorial", "tech"],
    "privacy": "public"
  }
}
```

### 📱 Social Media Endpoints (`/api/social`)

#### 1. Initiate Social Media OAuth
```
POST /api/social/auth/:platform/initiate
```
**Description:** Start OAuth flow for social media platforms
**Parameters:**
- `platform` (path): Social media platform (instagram, facebook, twitter, linkedin, youtube, tiktok)
**Body:**
```json
{
  "sessionId": "user-session-123",
  "redirectUri": "http://localhost:3000/callback"
}
```

#### 2. Complete Social Media OAuth
```
POST /api/social/auth/:platform/complete
```
**Description:** Complete OAuth flow after user authorization
**Parameters:**
- `platform` (path): Social media platform
**Body:**
```json
{
  "code": "auth-code-from-platform",
  "state": "oauth-state-string",
  "redirectUri": "http://localhost:3000/callback"
}
```

#### 3. Get Connected Social Accounts
```
GET /api/social/accounts/:sessionId
```
**Description:** Retrieve all social media accounts connected for a session
**Parameters:**
- `sessionId` (path): User session ID

#### 4. Publish Social Media Post
```
POST /api/social/publish
```
**Description:** Publish content to social media platforms
**Body:**
```json
{
  "platform": "instagram",
  "accountId": "account-123",
  "content": {
    "text": "Check out our latest update!",
    "imageUrls": ["https://example.com/image.jpg"]
  },
  "status": "published",
  "sessionId": "user-session-123"
}
```

#### 5. Schedule Social Media Post
```
POST /api/social/schedule
```
**Description:** Schedule content for future publication on social media platforms
**Body:**
```json
{
  "platform": "instagram",
  "accountId": "account-123",
  "content": {
    "text": "Check out our latest update!",
    "imageUrls": ["https://example.com/image.jpg"]
  },
  "status": "scheduled",
  "sessionId": "user-session-123"
}
```

#### 6. Get Recent Mentions
```
GET /api/social/mentions/:sessionId/:platform/:accountId
```
**Description:** Retrieve recent mentions for a social media account
**Parameters:**
- `sessionId` (path): User session ID
- `platform` (path): Social media platform
- `accountId` (path): Social media account ID
- `hours` (query): Number of hours to look back for mentions (optional, default: 24)

#### 7. Handle Social Media Webhook
```
POST /api/social/webhook/:platform
```
**Description:** Process incoming webhooks from social media platforms
**Parameters:**
- `platform` (path): Social media platform

### 🤖 Agent Endpoints (`/api/agents`)

#### 1. Trend Scanner Agent
```
POST /api/agents/trend-scanner
GET /api/agents/trend-scanner
GET /api/agents/trend-scanner/:id
```

#### 2. Video Sciptor Agent
```
POST /api/agents/video-scriptor
GET /api/agents/video-scriptor
GET /api/agents/video-scriptor/:id
```

#### 3. FAQ Responder Agent
```
POST /api/agents/faq-responder
GET /api/agents/faq-responder
GET /api/agents/faq-responder/:id
```

#### 4. Post Scheduler Agent
```
POST /api/agents/post-scheduler
GET /api/agents/post-scheduler
GET /api/agents/post-scheduler/:id
```

#### 5. Analytics Reporter Agent
```
POST /api/agents/analytics-reporter
GET /api/agents/analytics-reporter
GET /api/agents/analytics-reporter/:id
```

### 👨‍💼 Admin Endpoints (`/api/admin`)

#### 1. Orchestrate Agents
```
POST /api/admin/orchestrate
```
**Description:** Orchestrate multiple AI agents for complex tasks
**Body:**
```json
{
  "agents": ["trend-scanner", "video-scriptor"],
  "params": {
    "message": "Create content about AI trends",
    "context": {
      "sessionId": "user-session-123",
      "business": "Tech Startup",
      "objective": "brand awareness",
      "channels": ["instagram", "facebook"],
      "preferences": {
        "content": ["video", "image"],
        "tone": "professional",
        "frequency": "daily"
      }
    }
  }
}
```

### 💬 Chat Endpoint (`/api/chat`)

#### 1. Chat Interaction
```
POST /api/chat
```
**Description:** Interact with the AI chat system
**Body:**
```json
{
  "message": "Create a marketing campaign for Instagram",
  "context": {
    "sessionId": "user-session-123",
    "business": "Tech Startup",
    "objective": "brand awareness",
    "channels": ["instagram", "facebook"],
    "preferences": {
      "content": ["video", "image"],
      "tone": "professional",
      "frequency": "daily"
    }
  }
}
```

## 🔐 Security Features

### OAuth 2.0 Implementation
- Secure token storage with AES-256-GCM encryption
- Automatic token refresh
- State parameter validation to prevent CSRF attacks
- Scope-based permissions

### Data Encryption
- All OAuth tokens are encrypted before storage
- Database encryption key management
- Secure token retrieval and usage

### Real-time Communication
- WebSocket notifications for OAuth events
- Live updates for content publishing
- Real-time status monitoring

## 🛠️ Technical Details

### Supported Platforms
1. **Social Media:**
   - Instagram
   - Facebook
   - YouTube
   - Twitter/X
   - LinkedIn
   - TikTok

2. **Productivity:**
   - Google (Gmail, Calendar, Drive)
   - Microsoft (Outlook, Calendar, OneDrive)

3. **Email Providers:**
   - Gmail
   - Outlook

4. **Calendar Services:**
   - Google Calendar
   - Microsoft Calendar

### Authentication Flow
1. User initiates OAuth connection
2. System generates secure authorization URL
3. User authorizes application on platform
4. Platform redirects to callback URL
5. System exchanges code for access tokens
6. Tokens are securely encrypted and stored
7. WebSocket notifies frontend of successful connection

### Error Handling
- Comprehensive error logging
- User-friendly error messages
- Automatic retry mechanisms
- Graceful degradation for failed integrations

## 🎯 Usage Examples

### 1. Connecting a Google Account
```bash
# Initiate OAuth flow
curl -X POST http://localhost:3007/api/oauth/connect/google \
  -H "Content-Type: application/json" \
  -d '{"sessionId":"user123","redirectUrl":"http://localhost:3000/callback"}'

# After user authorization, the system automatically handles the callback
# and stores encrypted tokens in the database
```

### 2. Sending an Email
```bash
curl -X POST http://localhost:3007/api/integrations/email/send \
  -H "Content-Type: application/json" \
  -d '{
    "sessionId": "user123",
    "provider": "google",
    "message": {
      "to": ["recipient@example.com"],
      "subject": "Hello from Misy Agent",
      "body": "<p>This is an HTML email sent via the API</p>",
      "isHtml": true
    }
  }'
```

### 3. Posting to Social Media
```bash
curl -X POST http://localhost:3007/api/integrations/social/post/instagram \
  -H "Content-Type: application/json" \
  -d '{
    "sessionId": "user123",
    "content": {
      "text": "Check out our latest product update! #innovation",
      "imageUrls": ["https://example.com/product-image.jpg"]
    }
  }'
```

### 4. Creating a Calendar Event
```bash
curl -X POST http://localhost:3007/api/integrations/calendar/create-event \
  -H "Content-Type: application/json" \
  -d '{
    "sessionId": "user123",
    "provider": "google-calendar",
    "event": {
      "title": "Product Launch Meeting",
      "description": "Final preparations for product launch",
      "startTime": "2024-01-20T15:00:00Z",
      "endTime": "2024-01-20T16:00:00Z",
      "location": "Virtual Meeting Room",
      "attendees": ["team@example.com"]
    }
  }'
```

## 📊 Monitoring and Analytics

### Real-time Updates
- WebSocket connections for live status updates
- Progress notifications for long-running operations
- Error notifications and recovery alerts

### Logging
- Structured logging for all API operations
- Audit trails for security events
- Performance metrics and monitoring

### Rate Limiting
- API rate limiting to prevent abuse
- Platform-specific rate limits
- Automatic retry with exponential backoff

## 🚀 Getting Started

1. **Start the Application:**
   ```bash
   npm run start:dev
   ```

2. **Access Swagger UI:**
   Open your browser to `http://localhost:3007/api-docs`

3. **Connect Your Accounts:**
   Use the OAuth endpoints to connect your social media and productivity accounts

4. **Start Using the API:**
   Explore the available endpoints and test them directly in Swagger UI

## 🆘 Support

For issues or questions about the API:
- Check the Swagger UI for detailed endpoint documentation
- Review the example requests and responses
- Contact the development team for assistance