# Misy Agent API Summary

This document provides a high-level overview of all available API endpoints in the Misy Agent system.

## Overview

The Misy Agent API provides comprehensive endpoints for managing OAuth connections, integrations with social media and productivity platforms, calendar management, and AI agent orchestration. All endpoints are organized into logical groups based on their functionality.

## API Endpoint Categories

### 1. OAuth Management (`/api/oauth`)
Endpoints for connecting and managing OAuth accounts across multiple platforms.

- **GET** `/platforms` - Get available OAuth platforms
- **POST** `/connect/:platform` - Initiate OAuth flow for a platform
- **GET** `/accounts/:sessionId` - Get connected accounts for a session
- **POST** `/disconnect` - Disconnect an account
- **POST** `/refresh/:accountId` - Refresh account token

### 2. Integrations (`/api/integrations`)
Endpoints for interacting with external services like email providers, calendar systems, and social media platforms.

- **POST** `/email/send` - Send email through Gmail or Outlook
- **POST** `/calendar/create-event` - Create calendar event in Google Calendar or Microsoft Calendar
- **POST** `/social/post/:platform` - Post content to social media platforms
- **POST** `/youtube/upload` - Upload video to YouTube

### 3. Social Media Management (`/api/social`)
Endpoints for managing social media accounts and content.

- **POST** `/auth/:platform/initiate` - Initiate OAuth for social media platform
- **POST** `/auth/:platform/complete` - Complete OAuth for social media platform
- **GET** `/accounts/:sessionId` - Get connected social accounts
- **POST** `/publish` - Publish social media post
- **POST** `/schedule` - Schedule social media post
- **GET** `/mentions/:sessionId/:platform/:accountId` - Get recent mentions
- **POST** `/webhook/:platform` - Handle social media webhook

### 4. Calendar Management (`/api/calendar`)
Endpoints for managing internal calendar events and scheduling.

- **POST** `/events` - Schedule calendar event
- **GET** `/events/:sessionId` - Get calendar events
- **PUT** `/events/:eventId/:sessionId` - Update calendar event
- **DELETE** `/events/:eventId/:sessionId` - Delete calendar event
- **GET** `/events/upcoming/:sessionId` - Get upcoming events
- **GET** `/events/overdue/:sessionId` - Get overdue events
- **POST** `/events/:eventId/complete/:sessionId` - Mark event as completed
- **GET** `/stats/:sessionId` - Get calendar statistics
- **POST** `/campaign/milestones` - Schedule campaign milestones

### 5. Agent Orchestration (`/api/admin/orchestrate`)
Endpoints for coordinating multiple AI agents to perform complex tasks.

- **POST** `/` - Orchestrate AI agents for complex tasks

### 6. Chat Interaction (`/api/chat`)
Endpoints for processing user chat requests and generating AI-powered responses.

- **POST** `/` - Handle chat request and coordinate with AI agents

## Authentication

Most endpoints require a session ID to identify the user context. Session IDs are automatically generated when a user first interacts with the system.

## Error Handling

All endpoints follow standard HTTP status codes:
- **200**: Success
- **400**: Bad request (invalid parameters)
- **401**: Unauthorized
- **404**: Not found
- **500**: Internal server error

Error responses include a JSON body with error details:
```json
{
  "success": false,
  "error": "Error message describing what went wrong"
}
```

## WebSocket Integration

Many operations in the Misy Agent system use WebSocket for real-time updates. Clients should establish a WebSocket connection to receive live updates about:
- OAuth connection status
- Calendar event changes
- Agent orchestration progress
- Chat responses

## Rate Limiting

The API implements rate limiting to ensure fair usage. Clients that exceed the rate limits will receive a 429 (Too Many Requests) response.

## Versioning

The current API version is v1. All endpoints are prefixed with `/api` as shown in the endpoint paths above.

## Support

For API support and questions, please contact the Misy Agent development team.