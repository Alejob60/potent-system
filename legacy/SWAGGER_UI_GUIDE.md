# 📖 Swagger UI Guide for Misybot Agents

## Overview
This guide explains how to use the Swagger UI to explore and test the Misybot API endpoints. Swagger UI provides an interactive interface to understand, test, and integrate with all agent APIs.

## 🚀 Accessing Swagger UI

### Local Development
When running the application locally, access Swagger UI at:
```
http://localhost:3000/api
```

### Production Environment
In production, access Swagger UI at:
```
https://your-domain.com/api
```

## 🎯 Navigation Guide

### 1. Main Interface
The Swagger UI interface consists of:
- **Top Bar**: Contains API information and authentication
- **Sidebar**: Lists all available API tags/endpoints
- **Main Content**: Detailed documentation for selected endpoints
- **Try It Out**: Interactive testing functionality

### 2. API Tags
The APIs are organized by tags representing each agent:
- **admin** - Admin Orchestrator
- **analytics-reporter** - Analytics Reporter Agent
- **faq-responder** - FAQ Responder Agent
- **front-desk** - Front Desk Agent
- **post-scheduler** - Post Scheduler Agent
- **trend-scanner** - Trend Scanner Agent
- **video-scriptor** - Video Scriptor Agent

## 🧪 Testing Endpoints

### 1. Expanding Endpoint Documentation
Click on any endpoint to expand its documentation, which includes:
- HTTP method and path
- Description and summary
- Request parameters/body schema
- Response examples
- Error codes

### 2. Using "Try It Out"
1. Click the **"Try it out"** button on any endpoint
2. Fill in the required parameters
3. Click **"Execute"** to make the API call
4. View the response in the **Responses** section

### 3. Authentication
Some endpoints require authentication:
1. Click **"Authorize"** in the top right
2. Enter your JWT token in the format: `Bearer your-token-here`
3. Click **"Authorize"** and then **"Close"**

## 📋 Detailed Agent Documentation

### Front Desk Agent
**Tag**: `front-desk`

Key endpoints:
- `POST /agents/front-desk` - Process user messages
- `GET /agents/front-desk/status` - Get agent status and metrics
- `GET /agents/front-desk/session/{sessionId}` - Get conversation history

**Use Case**: This is the entry point for all user interactions. Start here for testing user conversations.

**Example Workflow**:
1. Send a message like "I want to create a video for TikTok"
2. Observe the response asking for more details
3. Continue the conversation until the agent routes to a specialized agent

### Admin Orchestrator
**Tag**: `admin`

Key endpoint:
- `POST /admin/orchestrate` - Coordinate multiple agents

**Use Case**: For complex tasks that require multiple agents to work together.

### Video Scriptor
**Tag**: `video-scriptor`

Key endpoints:
- `POST /agents/video-scriptor` - Create video content
- `GET /agents/video-scriptor` - List all video creations
- `GET /agents/video-scriptor/{id}` - Get specific video creation

**Use Case**: Generate video content for social media platforms.

### Post Scheduler
**Tag**: `post-scheduler`

Key endpoints:
- `POST /agents/post-scheduler` - Schedule social media posts
- `GET /agents/post-scheduler` - List all scheduled posts
- `GET /agents/post-scheduler/{id}` - Get specific scheduled post

**Use Case**: Schedule content to be published on social media platforms.

### Trend Scanner
**Tag**: `trend-scanner`

Key endpoints:
- `POST /agents/trend-scanner` - Analyze social media trends
- `GET /agents/trend-scanner` - List all trend analyses
- `GET /agents/trend-scanner/{id}` - Get specific trend analysis

**Use Case**: Identify trending topics and content opportunities.

### FAQ Responder
**Tag**: `faq-responder`

Key endpoints:
- `POST /agents/faq-responder` - Generate FAQ responses
- `GET /agents/faq-responder` - List all FAQ responses
- `GET /agents/faq-responder/{id}` - Get specific FAQ response

**Use Case**: Create comprehensive FAQ content for customer support.

### Analytics Reporter
**Tag**: `analytics-reporter`

Key endpoints:
- `POST /agents/analytics-reporter` - Generate analytics reports
- `GET /agents/analytics-reporter` - List all analytics reports
- `GET /agents/analytics-reporter/{id}` - Get specific analytics report

**Use Case**: Create data-driven reports for content performance analysis.

## 🛠 Advanced Features

### 1. Model Schemas
Each endpoint documentation includes detailed schema definitions:
- Click on schema names to expand/collapse
- View example values and descriptions
- Understand required vs optional fields

### 2. Response Codes
Documentation includes all possible HTTP response codes:
- Success responses (200, 201)
- Client errors (400, 404)
- Server errors (500)

### 3. Example Values
All parameters include example values to help with testing:
- Click **"Example Value"** to populate the request body
- Modify examples to test different scenarios

## 🔍 Search and Filter

### 1. Search Bar
Use the search bar at the top to find specific endpoints:
- Search by endpoint path
- Search by tag name
- Search by operation ID

### 2. Tag Filtering
Filter endpoints by tags using the dropdown:
- Show only specific agent endpoints
- Hide irrelevant endpoints during testing

## 📊 Testing Workflows

### Complete User Journey
1. **Start**: Send message to Front Desk Agent
2. **Interact**: Continue conversation until routed
3. **Execute**: Use specialized agent endpoint
4. **Monitor**: Check status endpoint for metrics

### Example: Video Creation Workflow
1. `POST /agents/front-desk` with "Create a TikTok video about pets"
2. Continue conversation providing platform, topic, duration
3. Receive response with `targetAgent: "video-scriptor"`
4. `POST /agents/video-scriptor` with collected information
5. `GET /agents/front-desk/status` to check agent metrics

## 🔧 Troubleshooting

### Common Issues

#### 1. Authentication Errors
**Problem**: 401 Unauthorized responses
**Solution**: 
- Ensure you've clicked "Authorize"
- Verify your JWT token is valid
- Check token expiration

#### 2. Validation Errors
**Problem**: 400 Bad Request responses
**Solution**:
- Check all required fields are filled
- Verify data types match schema
- Ensure date formats are correct (ISO 8601)

#### 3. Not Found Errors
**Problem**: 404 Not Found responses
**Solution**:
- Verify resource IDs exist
- Check endpoint paths are correct
- Ensure you're using the right agent endpoint

### Debugging Tips

#### 1. Response Headers
Check response headers for:
- Rate limit information
- Request IDs for support
- Content type verification

#### 2. Curl Command
Each "Try it out" generates a curl command:
- Copy for command-line testing
- Modify for automation scripts
- Use for integration testing

#### 3. Server Response
View raw server responses to:
- Debug unexpected behavior
- Verify response structure
- Check for additional metadata

## 📈 Monitoring APIs

### Agent Status Endpoint
The `GET /agents/front-desk/status` endpoint provides real-time metrics:
- Agent operational status
- Task completion statistics
- Performance metrics
- System health indicators

### Testing Monitoring
1. Execute several agent requests
2. Call the status endpoint
3. Observe updated metrics
4. Verify agent health

## 🚀 Best Practices

### 1. Development Workflow
1. Explore endpoints in Swagger UI first
2. Test with example data
3. Verify response structures
4. Implement integration code
5. Test with real data

### 2. Error Handling
1. Test all error scenarios
2. Implement proper error handling
3. Log errors for debugging
4. Provide user-friendly error messages

### 3. Rate Limiting
1. Monitor API usage
2. Implement retry logic with exponential backoff
3. Cache responses when appropriate
4. Batch requests when possible

## 📞 Support Resources

### Documentation
- [Comprehensive API Documentation](COMPREHENSIVE_API_DOCUMENTATION.md)
- [Front Desk Agent Specification](FRONT_DESK_AGENT_SPECIFICATION.md)
- [Agent Status Dashboard](AGENT_STATUS_DASHBOARD_ENDPOINT.md)

### Contact
For Swagger UI issues:
- API Support: api-support@misybot.com
- Technical Issues: tech-support@misybot.com

---
*Last Updated: September 25, 2025*
*Version: 1.0*