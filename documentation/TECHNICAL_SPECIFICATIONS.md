# MisyBot Technical Specifications

## 📋 PR Templates

### Feature PR Template

```markdown
## Feature: [Feature Name]

### Description
[Brief description of the feature]

### Changes
- [List of key changes]
- [Implementation details]
- [API modifications]

### Testing
- [Unit tests added/modified]
- [Integration tests added/modified]
- [E2E tests added/modified]

### Documentation
- [API documentation updated]
- [README changes]
- [New documentation added]

### Security
- [Security implications]
- [PII handling]
- [Encryption considerations]

### Performance
- [Performance impact]
- [Scalability considerations]

### Dependencies
- [New dependencies added]
- [Existing dependencies updated]
- [Deprecated dependencies removed]

### Migration
- [Breaking changes]
- [Migration steps]
- [Backward compatibility]
```

### Bug Fix PR Template

```markdown
## Bug Fix: [Bug Title]

### Issue
[Description of the bug and its impact]

### Root Cause
[Analysis of what caused the bug]

### Solution
[How the bug was fixed]

### Testing
[Test cases added to prevent regression]

### Side Effects
[Any potential side effects of the fix]

### Documentation
[Documentation updates if needed]
```

### Security PR Template

```markdown
## Security: [Security Enhancement]

### Threat
[Description of the security threat addressed]

### Mitigation
[How the threat is mitigated]

### Implementation
[Technical implementation details]

### Testing
[Security testing performed]

### Compliance
[Compliance requirements met]

### Audit
[Audit trail considerations]
```

## 📡 API Specifications

### Consent Management API

#### POST /api/v1/consent
Register user consent for data processing

**Request Body**:
```json
{
  "userId": "string",
  "purpose": "string",
  "duration": "ISO 8601 duration",
  "rights": ["right_to_access", "right_to_rectification", "right_to_erasure"],
  "timestamp": "ISO 8601 datetime"
}
```

**Response**:
```json
{
  "consentId": "string",
  "status": "registered",
  "expiresAt": "ISO 8601 datetime"
}
```

#### GET /api/v1/consent/{userId}
Retrieve user consent information

**Response**:
```json
{
  "consentId": "string",
  "userId": "string",
  "purpose": "string",
  "grantedAt": "ISO 8601 datetime",
  "expiresAt": "ISO 8601 datetime",
  "rights": ["right_to_access", "right_to_rectification", "right_to_erasure"],
  "status": "active"
}
```

#### DELETE /api/v1/consent/{userId}
Revoke user consent and initiate data deletion

**Response**:
```json
{
  "consentId": "string",
  "status": "revoked",
  "deletionScheduledAt": "ISO 8601 datetime"
}
```

### Policy Management API

#### POST /api/v1/policy
Create or update a platform policy

**Request Body**:
```json
{
  "platform": "string",
  "policyType": "tos|community_guidelines|api_terms",
  "version": "string",
  "content": "string",
  "effectiveDate": "ISO 8601 datetime",
  "rules": [
    {
      "ruleId": "string",
      "description": "string",
      "severity": "low|medium|high",
      "action": "block|flag|warn"
    }
  ]
}
```

**Response**:
```json
{
  "policyId": "string",
  "version": "string",
  "status": "active",
  "createdAt": "ISO 8601 datetime"
}
```

#### GET /api/v1/policy/{platform}
Retrieve active policies for a platform

**Response**:
```json
{
  "policies": [
    {
      "policyId": "string",
      "platform": "string",
      "policyType": "tos|community_guidelines|api_terms",
      "version": "string",
      "effectiveDate": "ISO 8601 datetime",
      "rules": [
        {
          "ruleId": "string",
          "description": "string",
          "severity": "low|medium|high",
          "action": "block|flag|warn"
        }
      ]
    }
  ]
}
```

#### POST /api/v1/policy/evaluate
Evaluate content against platform policies

**Request Body**:
```json
{
  "content": "string",
  "platform": "string",
  "contentType": "post|comment|image|video",
  "metadata": {
    "tags": ["string"],
    "mentions": ["string"],
    "links": ["string"]
  }
}
```

**Response**:
```json
{
  "evaluationId": "string",
  "contentId": "string",
  "platform": "string",
  "result": "compliant|flagged|blocked",
  "violations": [
    {
      "ruleId": "string",
      "severity": "low|medium|high",
      "description": "string",
      "confidence": 0.0-1.0
    }
  ],
  "recommendations": ["string"],
  "timestamp": "ISO 8601 datetime"
}
```

### Task Management API

#### POST /api/v1/tasks
Create a new task

**Request Body**:
```json
{
  "sessionId": "string",
  "agentId": "string",
  "taskType": "string",
  "priority": 0-10,
  "payload": {},
  "metadata": {
    "traceId": "string",
    "policyVersionId": "string",
    "decisionId": "string"
  }
}
```

**Response**:
```json
{
  "taskId": "string",
  "status": "created",
  "createdAt": "ISO 8601 datetime"
}
```

#### GET /api/v1/tasks/{taskId}
Retrieve task information

**Response**:
```json
{
  "taskId": "string",
  "sessionId": "string",
  "agentId": "string",
  "taskType": "string",
  "status": "created|in_progress|completed|failed|retrying",
  "priority": 0-10,
  "attempts": 0,
  "payload": {},
  "result": {},
  "metadata": {
    "traceId": "string",
    "policyVersionId": "string",
    "decisionId": "string",
    "inputsHash": "string",
    "agentsInvolved": ["string"],
    "confidenceScores": {}
  },
  "createdAt": "ISO 8601 datetime",
  "updatedAt": "ISO 8601 datetime"
}
```

#### PATCH /api/v1/tasks/{taskId}/status
Update task status

**Request Body**:
```json
{
  "status": "in_progress|completed|failed|retrying",
  "result": {},
  "error": "string"
}
```

**Response**:
```json
{
  "taskId": "string",
  "status": "string",
  "updatedAt": "ISO 8601 datetime"
}
```

#### GET /api/v1/tasks
List tasks with filtering

**Query Parameters**:
- sessionId: string
- agentId: string
- status: string
- taskType: string
- limit: number (default: 100)
- offset: number (default: 0)

**Response**:
```json
{
  "tasks": [
    {
      "taskId": "string",
      "sessionId": "string",
      "agentId": "string",
      "taskType": "string",
      "status": "string",
      "priority": 0-10,
      "createdAt": "ISO 8601 datetime",
      "updatedAt": "ISO 8601 datetime"
    }
  ],
  "total": 0,
  "limit": 100,
  "offset": 0
}
```

### Feedback API

#### POST /api/v1/feedback
Submit user feedback on task or content

**Request Body**:
```json
{
  "taskId": "string",
  "userId": "string",
  "feedbackType": "positive|negative|suggestion|report",
  "contentId": "string",
  "rating": 1-5,
  "notes": "string",
  "metadata": {
    "platform": "string",
    "contentType": "string",
    "context": {}
  }
}
```

**Response**:
```json
{
  "feedbackId": "string",
  "status": "received",
  "timestamp": "ISO 8601 datetime"
}
```

## 📦 Data Models

### Consent Model

```typescript
interface Consent {
  consentId: string; // UUID
  userId: string; // Pseudonymized user ID
  purpose: string; // Purpose of consent
  grantedAt: Date; // When consent was granted
  expiresAt: Date; // When consent expires
  rights: Array<'right_to_access' | 'right_to_rectification' | 'right_to_erasure' | 'right_to_restrict_processing' | 'right_to_data_portability' | 'right_to_object'>;
  status: 'active' | 'revoked' | 'expired';
  metadata: {
    version: string; // Consent form version
    language: string; // Language of consent
    ipAddress: string; // IP address at time of consent
    userAgent: string; // User agent at time of consent
  };
}
```

### Policy Model

```typescript
interface Policy {
  policyId: string; // UUID
  platform: string; // Platform name (e.g., 'instagram', 'facebook')
  policyType: 'tos' | 'community_guidelines' | 'api_terms';
  version: string; // Policy version
  content: string; // Raw policy content
  effectiveDate: Date; // When policy became effective
  rules: Array<{
    ruleId: string; // Unique rule identifier
    description: string; // Human-readable description
    severity: 'low' | 'medium' | 'high'; // Violation severity
    action: 'block' | 'flag' | 'warn'; // Action to take
    patterns: string[]; // Regex patterns for detection
    categories: string[]; // Content categories
    confidenceThreshold: number; // Minimum confidence for triggering
  }>;
  metadata: {
    source: 'official' | 'scraped' | 'manual'; // Source of policy
    lastUpdated: Date; // Last update timestamp
    createdBy: string; // Creator identifier
    versionHistory: Array<{
      version: string;
      date: Date;
      changes: string[];
    }>;
  };
}
```

### Task Model

```typescript
interface Task {
  taskId: string; // UUID
  sessionId: string; // Session identifier
  agentId: string; // Assigned agent
  taskType: string; // Type of task
  status: 'created' | 'in_progress' | 'completed' | 'failed' | 'retrying' | 'queued';
  priority: number; // 0-10, higher is more urgent
  attempts: number; // Number of execution attempts
  maxRetries: number; // Maximum retry attempts
  payload: Record<string, any>; // Task input data
  result: Record<string, any>; // Task output data
  error: string; // Error message if failed
  metadata: {
    traceId: string; // Correlation ID for tracing
    policyVersionId: string; // Policy version used
    decisionId: string; // Decision that created this task
    inputsHash: string; // Hash of input data
    agentsInvolved: string[]; // All agents involved in decision
    confidenceScores: Record<string, number>; // Confidence scores
  };
  scheduledAt: Date; // When task should start
  startedAt: Date; // When task actually started
  completedAt: Date; // When task completed
  deadline: Date; // Task deadline
  createdAt: Date; // Record creation time
  updatedAt: Date; // Last update time
}
```

### Feedback Model

```typescript
interface Feedback {
  feedbackId: string; // UUID
  taskId: string; // Associated task
  userId: string; // User who provided feedback
  feedbackType: 'positive' | 'negative' | 'suggestion' | 'report';
  contentId: string; // Content being evaluated
  rating: number; // 1-5 star rating
  notes: string; // Free-form feedback
  metadata: {
    platform: string; // Platform where content was published
    contentType: string; // Type of content
    context: Record<string, any>; // Additional context
    userAgent: string; // User agent
    ipAddress: string; // IP address
  };
  processed: boolean; // Whether feedback has been processed
  processedAt: Date; // When feedback was processed
  createdAt: Date; // When feedback was submitted
}
```

## 🔧 Example Payloads

### Consent Registration
```json
{
  "userId": "user_1234567890",
  "purpose": "Content creation and social media management",
  "duration": "P2Y",
  "rights": ["right_to_access", "right_to_rectification", "right_to_erasure"],
  "timestamp": "2024-01-15T10:30:00Z"
}
```

### Policy Evaluation Request
```json
{
  "content": "Check out our amazing new product! #newproduct #amazing",
  "platform": "instagram",
  "contentType": "post",
  "metadata": {
    "tags": ["#newproduct", "#amazing"],
    "mentions": [],
    "links": []
  }
}
```

### Policy Evaluation Response
```json
{
  "evaluationId": "eval_0987654321",
  "contentId": "content_12345",
  "platform": "instagram",
  "result": "flagged",
  "violations": [
    {
      "ruleId": "excessive_hashtags",
      "severity": "medium",
      "description": "Post contains more than 10 hashtags",
      "confidence": 0.95
    }
  ],
  "recommendations": [
    "Reduce number of hashtags to 5-10 for better engagement",
    "Focus on relevant hashtags only"
  ],
  "timestamp": "2024-01-15T10:30:00Z"
}
```

### Task Creation
```json
{
  "sessionId": "session_abcdef123456",
  "agentId": "video-scriptor",
  "taskType": "generate_script",
  "priority": 5,
  "payload": {
    "topic": "New product launch",
    "tone": "exciting",
    "duration": 60,
    "platform": "instagram"
  },
  "metadata": {
    "traceId": "trace_7890",
    "policyVersionId": "policy_v1.2.3",
    "decisionId": "decision_456"
  }
}
```

### Feedback Submission
```json
{
  "taskId": "task_1234567890",
  "userId": "user_0987654321",
  "feedbackType": "positive",
  "contentId": "content_abc123",
  "rating": 5,
  "notes": "The video script was perfect for our audience!",
  "metadata": {
    "platform": "instagram",
    "contentType": "video",
    "context": {
      "audience": "tech enthusiasts",
      "product": "smartphone"
    }
  }
}
```

## 📊 API Response Codes

### Success Codes
- `200 OK` - Successful request
- `201 Created` - Resource created successfully
- `202 Accepted` - Request accepted for processing
- `204 No Content` - Successful request with no response body

### Client Error Codes
- `400 Bad Request` - Invalid request format
- `401 Unauthorized` - Authentication required
- `403 Forbidden` - Access denied
- `404 Not Found` - Resource not found
- `409 Conflict` - Resource conflict
- `422 Unprocessable Entity` - Valid request but semantic errors

### Server Error Codes
- `500 Internal Server Error` - Unexpected server error
- `501 Not Implemented` - Feature not implemented
- `503 Service Unavailable` - Service temporarily unavailable

## 🔒 Security Headers

All API responses include the following security headers:

```
Strict-Transport-Security: max-age=31536000; includeSubDomains
X-Content-Type-Options: nosniff
X-Frame-Options: DENY
Content-Security-Policy: default-src 'self'
X-XSS-Protection: 1; mode=block
```

## 📈 Rate Limiting

API endpoints are rate-limited to prevent abuse:

- **Anonymous requests**: 100 requests/hour
- **Authenticated requests**: 1000 requests/hour
- **Admin requests**: 10000 requests/hour

Rate limit responses include:
```json
{
  "error": "Rate limit exceeded",
  "retryAfter": "2024-01-15T11:30:00Z"
}
```

This technical specification provides a comprehensive guide to the new APIs and data models required for the enhanced security, compliance, and pipeline features in the MisyBot system.