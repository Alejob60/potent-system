# Agent Testing Guide

This guide explains how to test the functionality and status of all agents in the Misy-Agent system.

## Overview

The testing framework includes:
1. Automated functionality tests for all agents
2. Endpoint health checks
3. Detailed status reporting
4. Integration testing capabilities

## Available Testing Tools

### 1. Agent Functionality Test Service

Located at: `src/agents/test-utils/agent-functionality-test.service.ts`

This service provides comprehensive testing of all agent components:
- Component existence verification
- Endpoint identification
- Status reporting

### 2. Agent Test Controller

Located at: `src/agents/test-utils/agent-test.controller.ts`

Provides REST endpoints for testing:
- `GET /agent-testing/status` - Get current agent status
- `GET /agent-testing/report` - Get detailed markdown report
- `POST /agent-testing/test` - Run comprehensive tests

### 3. Health Check Script

Located at: `scripts/agent-health-check.ts`

A standalone script that can be run to perform health checks:
```bash
npm run test:agents
```

### 4. Endpoint Test Script

Located at: `scripts/test-agent-endpoints.js`

A simple script to test API endpoints:
```bash
node scripts/test-agent-endpoints.js
```

## Running Tests

### 1. Using the API Endpoints

Start the application and make requests to the testing endpoints:

```bash
# Get agent status
curl http://localhost:3000/agent-testing/status

# Get detailed report
curl http://localhost:3000/agent-testing/report

# Run comprehensive tests
curl -X POST http://localhost:3000/agent-testing/test
```

### 2. Using the Health Check Script

```bash
# Run from the backend-refactor directory
npx ts-node scripts/agent-health-check.ts
```

### 3. Using the Endpoint Test Script

```bash
# Test endpoints (requires server to be running)
node scripts/test-agent-endpoints.js

# Test with custom base URL
BASE_URL=http://your-server:port node scripts/test-agent-endpoints.js
```

## Test Output Explanation

### Agent Status Values

- **complete**: All required components are present and functional
- **incomplete**: Missing critical components
- **partial**: Some components present but implementation incomplete

### Component Verification

Each agent is checked for:
- Controller files
- Service files
- Entity definitions
- DTO definitions
- Module files
- V2 versions of above components

### Endpoint Verification

Each agent's endpoints are identified and listed:
- REST endpoints for data operations
- Metrics endpoints
- Specialized endpoints (e.g., session-based queries)

## Interpreting Results

### Complete Agents
Agents marked as "complete" have:
- All required files present
- Proper module configuration
- Defined endpoints
- Basic functionality implemented

### Incomplete Agents
Agents marked as "incomplete" are missing:
- Critical components (controller, service, etc.)
- Proper module configuration
- Basic functionality

### Partial Agents
Agents marked as "partial" have:
- Some components implemented
- Incomplete functionality
- Work in progress

## Adding New Agents to Tests

To include a new agent in the testing framework:

1. Add the agent name to the agents array in `AgentFunctionalityTestService`
2. Update the componentMap with the agent's components
3. Add any agent-specific endpoint logic

## Customizing Tests

The testing framework can be customized by modifying:
- Component verification logic in `checkComponent()`
- Endpoint identification in `identifyEndpoints()`
- Status determination logic
- Report generation format

## Troubleshooting

### Common Issues

1. **Module not found errors**: Ensure all agent modules are properly imported
2. **Endpoint not found**: Verify controller routes are correctly defined
3. **Database connection issues**: Check TypeORM configuration
4. **Redis connectivity**: Verify Redis service is running

### Debugging Tips

1. Enable verbose logging to see detailed test execution
2. Check the NestJS application logs for initialization errors
3. Verify all dependencies are installed
4. Ensure environment variables are properly configured

## Extending the Framework

The testing framework can be extended to:
- Add performance testing
- Include integration testing with external services
- Add security scanning
- Implement automated regression testing
- Add load testing capabilities

## Next Steps

1. Run the health check to get current status
2. Review the detailed agent status report
3. Address any incomplete or partial agents
4. Implement additional testing as needed