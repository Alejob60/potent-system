# Misy Agent API Documentation

This document provides detailed explanations of all available endpoints in the Misy Agent system, which orchestrates AI agents for content creation and campaign management.

## Table of Contents
1. [OAuth Endpoints](#oauth-endpoints)
2. [Integration Endpoints](#integration-endpoints)
3. [Social Media Endpoints](#social-media-endpoints)
4. [Calendar Endpoints](#calendar-endpoints)
5. [Agent Orchestration Endpoints](#agent-orchestration-endpoints)
6. [Chat Endpoints](#chat-endpoints)
7. [Admin Endpoints](#admin-endpoints)

---

## OAuth Endpoints

### Get Available OAuth Platforms
**GET** `/api/oauth/platforms`

Returns a list of all supported OAuth platforms and their categories.

**Response:**
```json
{
  "platforms": ["instagram", "facebook", "youtube", "google", "microsoft"],
  "categories": {
    "social": ["instagram", "facebook", "youtube"],
    "email": ["google", "microsoft"],
    "calendar": ["google-calendar", "microsoft-calendar"]
  }
}
```

### Initiate OAuth Flow
**POST** `/api/oauth/connect/:platform`

Starts the OAuth authentication process for a specific platform.

**Path Parameters:**
- `platform` (string): OAuth platform (instagram, facebook, youtube, google, microsoft, etc.)

**Request Body:**
```json
{
  "sessionId": "user-session-123",
  "redirectUrl": "http://localhost:3000/oauth-success" // Optional
}
```

**Response:**
```json
{
  "success": true,
  "authUrl": "https://platform.com/oauth/authorize?...",
  "state": "session-platform-timestamp",
  "platform": "google",
  "message": "Please visit the auth URL to connect your google account"
}
```

### Get Connected Accounts
**GET** `/api/oauth/accounts/:sessionId`

Returns all OAuth accounts connected for a specific session.

**Path Parameters:**
- `sessionId` (string): User session ID

**Response:**
```json
{
  "accounts": [
    {
      "id": "account-123",
      "platform": "google",
      "name": "John Doe",
      "email": "john@example.com",
      "avatar": "https://example.com/avatar.jpg",
      "expiresAt": "2024-01-20T15:00:00Z",
      "scopes": ["email", "profile"]
    }
  ],
  "total": 1
}
```

### Disconnect Account
**POST** `/api/oauth/disconnect`

Disconnects an OAuth account.

**Request Body:**
```json
{
  "sessionId": "user-session-123",
  "accountId": "account-123"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Successfully disconnected account"
}
```

---

## Integration Endpoints

### Send Email
**POST** `/api/integrations/email/send`

Send an email through connected email provider (Gmail or Outlook).

**Request Body:**
```json
{
  "sessionId": "user-session-123",
  "provider": "google", // or "microsoft"
  "message": {
    "to": ["recipient@example.com"],
    "cc": ["cc@example.com"], // Optional
    "bcc": ["bcc@example.com"], // Optional
    "subject": "Hello from Misy Agent",
    "body": "<p>This is an HTML email</p>",
    "isHtml": true,
    "attachments": [
      {
        "filename": "document.pdf",
        "content": "base64-encoded-content",
        "contentType": "application/pdf"
      }
    ] // Optional
  }
}
```

**Response:**
```json
{
  "success": true,
  "messageId": "message-123",
  "message": "Email sent successfully"
}
```

### Create Calendar Event
**POST** `/api/integrations/calendar/create-event`

Create a calendar event in Google Calendar or Microsoft Calendar.

**Request Body:**
```json
{
  "sessionId": "user-session-123",
  "provider": "google-calendar", // or "microsoft-calendar"
  "event": {
    "title": "Team Meeting",
    "description": "Weekly team sync",
    "startTime": "2024-01-20T15:00:00Z",
    "endTime": "2024-01-20T16:00:00Z",
    "location": "Conference Room", // Optional
    "attendees": ["attendee@example.com"], // Optional
    "isAllDay": false, // Optional
    "recurrence": {
      "frequency": "weekly", // daily, weekly, monthly, yearly
      "interval": 1,
      "until": "2024-12-31T23:59:59Z" // Optional
    } // Optional
  }
}
```

**Response:**
```json
{
  "success": true,
  "eventId": "event-123",
  "eventUrl": "https://calendar.google.com/event?id=event-123",
  "message": "Calendar event created successfully"
}
```

### Post to Social Media
**POST** `/api/integrations/social/post/:platform`

Post content to social media platforms (Instagram, Facebook, etc.).

**Path Parameters:**
- `platform` (string): Social media platform (instagram, facebook, twitter, linkedin, youtube)

**Request Body:**
```json
{
  "sessionId": "user-session-123",
  "content": {
    "text": "Check out our latest update!",
    "imageUrls": ["https://example.com/image.jpg"], // Optional
    "videoUrls": ["https://example.com/video.mp4"] // Optional
  }
}
```

**Response:**
```json
{
  "success": true,
  "postId": "post-123",
  "message": "Posted successfully to instagram",
  "result": {
    // Platform-specific response data
  }
}
```

### Upload Video to YouTube
**POST** `/api/integrations/youtube/upload`

Upload a video to YouTube with metadata.

**Request Body:**
```json
{
  "sessionId": "user-session-123",
  "videoData": {
    "title": "My Awesome Video",
    "description": "Check out this amazing content!",
    "videoFile": "base64-encoded-video-file",
    "tags": ["tutorial", "tech"], // Optional
    "privacy": "public" // public, unlisted, private
  }
}
```

**Response:**
```json
{
  "success": true,
  "videoId": "video-123",
  "videoUrl": "https://www.youtube.com/watch?v=video-123",
  "message": "Video uploaded successfully to YouTube"
}
```

---

## Social Media Endpoints

### Initiate Social Media OAuth
**POST** `/api/social/auth/:platform/initiate`

Start OAuth flow for social media platforms.

**Path Parameters:**
- `platform` (string): Social media platform (instagram, facebook, twitter, linkedin, youtube, tiktok)

**Request Body:**
```json
{
  "sessionId": "user-session-123",
  "redirectUri": "http://localhost:3000/callback"
}
```

**Response:**
```json
{
  "success": true,
  "authUrl": "https://platform.com/oauth/authorize?...",
  "message": "OAuth flow initiated successfully"
}
```

### Complete Social Media OAuth
**POST** `/api/social/auth/:platform/complete`

Complete OAuth flow after user authorization.

**Path Parameters:**
- `platform` (string): Social media platform

**Request Body:**
```json
{
  "code": "auth-code-from-platform",
  "state": "oauth-state-string",
  "redirectUri": "http://localhost:3000/callback"
}
```

**Response:**
```json
{
  "success": true,
  "account": {
    "id": "account-123",
    "platform": "instagram",
    "name": "John Doe",
    "username": "johndoe"
  },
  "message": "Successfully connected Instagram account"
}
```

### Get Connected Social Accounts
**GET** `/api/social/accounts/:sessionId`

Retrieve all social media accounts connected for a session.

**Path Parameters:**
- `sessionId` (string): User session ID

**Response:**
```json
{
  "accounts": [
    {
      "id": "account-123",
      "platform": "instagram",
      "name": "John Doe",
      "username": "johndoe",
      "avatar": "https://example.com/avatar.jpg"
    }
  ],
  "total": 1
}
```

### Publish Social Media Post
**POST** `/api/social/publish`

Publish content to social media platforms.

**Request Body:**
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

**Response:**
```json
{
  "success": true,
  "postId": "post-123",
  "message": "Post published successfully"
}
```

### Schedule Social Media Post
**POST** `/api/social/schedule`

Schedule content for future publication on social media platforms.

**Request Body:**
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

**Response:**
```json
{
  "success": true,
  "postId": "post-123",
  "message": "Post scheduled successfully"
}
```

### Get Recent Mentions
**GET** `/api/social/mentions/:sessionId/:platform/:accountId`

Retrieve recent mentions for a social media account.

**Path Parameters:**
- `sessionId` (string): User session ID
- `platform` (string): Social media platform
- `accountId` (string): Social media account ID

**Query Parameters:**
- `hours` (number, optional): Number of hours to look back for mentions (default: 24)

**Response:**
```json
{
  "mentions": [
    {
      "id": "mention-123",
      "text": "@johndoe This is awesome!",
      "user": {
        "name": "Jane Smith",
        "username": "janesmith",
        "avatar": "https://example.com/avatar.jpg"
      },
      "timestamp": "2024-01-20T15:00:00Z",
      "url": "https://instagram.com/p/post-123"
    }
  ],
  "total": 1
}
```

---

## Calendar Endpoints

### Schedule Calendar Event
**POST** `/api/calendar/events`

Create a new calendar event in the internal calendar system.

**Request Body:**
```json
{
  "event": {
    "title": "Content Review Meeting",
    "description": "Weekly content review and approval",
    "startTime": "2024-01-20T15:00:00Z",
    "endTime": "2024-01-20T16:00:00Z",
    "type": "meeting", // content_publish, campaign_milestone, review, analysis, meeting
    "priority": "high", // low, medium, high, urgent
    "sessionId": "user-session-123",
    "metadata": {
      "contentId": "content-123",
      "campaignId": "campaign-456",
      "channels": ["instagram", "facebook"],
      "contentType": "video",
      "assignedAgent": "agent-post-scheduler"
    }, // Optional
    "recurrence": {
      "type": "weekly", // daily, weekly, monthly
      "interval": 1,
      "endDate": "2024-12-31T23:59:59Z"
    }, // Optional
    "reminders": [
      {
        "time": 30, // Minutes before event
        "type": "notification" // notification, email, webhook
      }
    ] // Optional
  }
}
```

**Response:**
```json
{
  "id": "event-123",
  "title": "Content Review Meeting",
  "description": "Weekly content review and approval",
  "startTime": "2024-01-20T15:00:00Z",
  "endTime": "2024-01-20T16:00:00Z",
  "type": "meeting",
  "status": "scheduled",
  "priority": "high",
  "metadata": {
    "contentId": "content-123",
    "campaignId": "campaign-456"
  },
  "sessionId": "user-session-123"
}
```

### Get Calendar Events
**GET** `/api/calendar/events/:sessionId`

Retrieve calendar events for a specific session with optional filtering.

**Path Parameters:**
- `sessionId` (string): User session ID

**Query Parameters:**
- `startDate` (string, optional): Filter events after this date (ISO 8601 format)
- `endDate` (string, optional): Filter events before this date (ISO 8601 format)
- `type` (string, optional): Filter events by type
- `status` (string, optional): Filter events by status
- `campaignId` (string, optional): Filter events by campaign ID

**Response:**
```json
[
  {
    "id": "event-123",
    "title": "Content Review Meeting",
    "description": "Weekly content review and approval",
    "startTime": "2024-01-20T15:00:00Z",
    "endTime": "2024-01-20T16:00:00Z",
    "type": "meeting",
    "status": "scheduled",
    "priority": "high",
    "metadata": {
      "contentId": "content-123",
      "campaignId": "campaign-456"
    },
    "sessionId": "user-session-123"
  }
]
```

### Update Calendar Event
**PUT** `/api/calendar/events/:eventId/:sessionId`

Update an existing calendar event.

**Path Parameters:**
- `eventId` (string): Calendar event ID
- `sessionId` (string): User session ID

**Request Body:**
```json
{
  "updates": {
    "title": "Updated Meeting Title",
    "description": "Updated meeting description",
    "startTime": "2024-01-20T15:00:00Z",
    "endTime": "2024-01-20T16:00:00Z",
    "type": "meeting",
    "status": "completed",
    "priority": "high",
    "metadata": {
      "contentId": "content-123",
      "campaignId": "campaign-456"
    }
  }
}
```

**Response:**
```json
{
  "id": "event-123",
  "title": "Updated Meeting Title",
  "description": "Updated meeting description",
  "startTime": "2024-01-20T15:00:00Z",
  "endTime": "2024-01-20T16:00:00Z",
  "type": "meeting",
  "status": "completed",
  "priority": "high",
  "metadata": {
    "contentId": "content-123",
    "campaignId": "campaign-456"
  },
  "sessionId": "user-session-123"
}
```

### Delete Calendar Event
**DELETE** `/api/calendar/events/:eventId/:sessionId`

Remove a calendar event from the system.

**Path Parameters:**
- `eventId` (string): Calendar event ID
- `sessionId` (string): User session ID

**Response:**
```json
{
  "success": true,
  "message": "Event deleted successfully"
}
```

### Get Upcoming Events
**GET** `/api/calendar/events/upcoming/:sessionId`

Retrieve upcoming calendar events for the next 24 hours (default) or specified hours.

**Path Parameters:**
- `sessionId` (string): User session ID

**Query Parameters:**
- `hours` (number, optional): Number of hours to look ahead for events (default: 24)

**Response:**
```json
[
  {
    "id": "event-123",
    "title": "Content Review Meeting",
    "description": "Weekly content review and approval",
    "startTime": "2024-01-20T15:00:00Z",
    "endTime": "2024-01-20T16:00:00Z",
    "type": "meeting",
    "status": "scheduled",
    "priority": "high",
    "metadata": {
      "contentId": "content-123",
      "campaignId": "campaign-456"
    },
    "sessionId": "user-session-123"
  }
]
```

### Get Overdue Events
**GET** `/api/calendar/events/overdue/:sessionId`

Retrieve calendar events that should have occurred but are still scheduled.

**Path Parameters:**
- `sessionId` (string): User session ID

**Response:**
```json
[
  {
    "id": "event-123",
    "title": "Content Review Meeting",
    "description": "Weekly content review and approval",
    "startTime": "2024-01-19T15:00:00Z",
    "endTime": "2024-01-19T16:00:00Z",
    "type": "meeting",
    "status": "scheduled",
    "priority": "high",
    "metadata": {
      "contentId": "content-123",
      "campaignId": "campaign-456"
    },
    "sessionId": "user-session-123"
  }
]
```

### Mark Event as Completed
**POST** `/api/calendar/events/:eventId/complete/:sessionId`

Mark a calendar event as completed and update related tasks.

**Path Parameters:**
- `eventId` (string): Calendar event ID
- `sessionId` (string): User session ID

**Response:**
```json
{
  "id": "event-123",
  "title": "Content Review Meeting",
  "description": "Weekly content review and approval",
  "startTime": "2024-01-20T15:00:00Z",
  "endTime": "2024-01-20T16:00:00Z",
  "type": "meeting",
  "status": "completed",
  "priority": "high",
  "metadata": {
    "contentId": "content-123",
    "campaignId": "campaign-456"
  },
  "sessionId": "user-session-123"
}
```

### Get Calendar Statistics
**GET** `/api/calendar/stats/:sessionId`

Retrieve statistics about calendar events for a session.

**Path Parameters:**
- `sessionId` (string): User session ID

**Response:**
```json
{
  "totalEvents": 10,
  "upcomingEvents": 3,
  "completedEvents": 5,
  "overdueEvents": 2,
  "eventsByType": {
    "content_publish": 4,
    "campaign_milestone": 3,
    "meeting": 3
  },
  "eventsByStatus": {
    "scheduled": 3,
    "completed": 5,
    "overdue": 2
  }
}
```

### Schedule Campaign Milestones
**POST** `/api/calendar/campaign/milestones`

Create calendar events for key campaign milestones.

**Request Body:**
```json
{
  "campaignId": "campaign-123",
  "campaignTitle": "Summer Marketing Campaign",
  "startDate": "2024-06-01T00:00:00Z",
  "duration": 30, // Campaign duration in days
  "sessionId": "user-session-123"
}
```

**Response:**
```json
[
  {
    "id": "event-123",
    "title": "Campaign Kickoff: Summer Marketing Campaign",
    "description": "Campaign launch and initial content publication",
    "startTime": "2024-06-01T00:00:00Z",
    "endTime": "2024-06-01T02:00:00Z",
    "type": "campaign_milestone",
    "status": "scheduled",
    "priority": "high",
    "metadata": {
      "campaignId": "campaign-123",
      "milestone": "kickoff"
    },
    "sessionId": "user-session-123"
  }
]
```

---

## Agent Orchestration Endpoints

### Orchestrate AI Agents
**POST** `/api/admin/orchestrate`

Coordinate multiple AI agents to perform complex tasks based on user requests.

**Request Body:**
```json
{
  "sessionId": "user-session-123",
  "task": "Create a social media campaign for our new product launch",
  "context": {
    "businessInfo": {
      "name": "MisyBot",
      "location": "San Francisco, CA"
    },
    "targetChannels": ["instagram", "facebook", "twitter"],
    "currentObjective": "Increase brand awareness",
    "preferences": {
      "contentTypes": ["video", "image", "text"],
      "tone": "professional",
      "frequency": "daily"
    }
  },
  "agents": ["trend-scanner", "video-scriptor", "post-scheduler"] // Optional
}
```

**Response:**
```json
[
  {
    "status": "fulfilled",
    "value": {
      "agent": "trend-scanner",
      "result": {
        // Agent-specific results
      }
    }
  }
]
```

---

## Chat Endpoints

### Handle Chat Request
**POST** `/api/chat`

Process user chat requests and coordinate with AI agents to generate responses.

**Request Body:**
```json
{
  "message": "Create a social media campaign for our new product",
  "context": {
    "sessionId": "user-session-123",
    "negocio": "MisyBot",
    "ubicacion": "San Francisco, CA",
    "canales": ["instagram", "facebook", "twitter"],
    "objetivo": "Increase brand awareness",
    "preferencias": {
      "contenido": ["video", "image", "text"],
      "tono": "professional",
      "frecuencia": "daily"
    }
  }
}
```

**Response:**
```json
{
  "reply": "I'm creating a comprehensive campaign strategy for you...",
  "sessionId": "user-session-123",
  "context": {
    // Updated context
  },
  "status": "processing",
  "message": "Response sent via WebSocket. Check real-time updates."
}
```

---

## Admin Endpoints

### Admin Orchestration
**POST** `/api/admin/orchestrate`

Coordinate multiple AI agents to perform complex tasks based on user requests.

**Request Body:**
```json
{
  "sessionId": "user-session-123",
  "task": "Create a social media campaign for our new product launch",
  "context": {
    "businessInfo": {
      "name": "MisyBot",
      "location": "San Francisco, CA"
    },
    "targetChannels": ["instagram", "facebook", "twitter"],
    "currentObjective": "Increase brand awareness",
    "preferences": {
      "contentTypes": ["video", "image", "text"],
      "tone": "professional",
      "frequency": "daily"
    }
  },
  "agents": ["trend-scanner", "video-scriptor", "post-scheduler"] // Optional
}
```

**Response:**
```json
[
  {
    "status": "fulfilled",
    "value": {
      "agent": "trend-scanner",
      "result": {
        // Agent-specific results
      }
    }
  }
]
```