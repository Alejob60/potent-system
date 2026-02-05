#!/usr/bin/env node

/**
 * Agent Health Check Script
 * 
 * This script performs a health check on all agents to verify:
 * 1. Agent modules are properly configured
 * 2. Required components exist
 * 3. Basic functionality can be executed
 * 4. Database connectivity
 * 5. External service connectivity
 */

import { NestFactory } from '@nestjs/core';
import { Logger } from '@nestjs/common';
import { AgentTestModule } from '../src/agents/test-utils/agent-test.module';
import { AgentFunctionalityTestService } from '../src/agents/test-utils/agent-functionality-test.service';

async function performHealthCheck() {
  const logger = new Logger('AgentHealthCheck');
  logger.log('Starting agent health check...');

  try {
    // Create a minimal NestJS application context
    const app = await NestFactory.createApplicationContext(AgentTestModule);
    
    // Get the test service
    const testService = app.get(AgentFunctionalityTestService);
    
    // Run the tests
    logger.log('Running agent functionality tests...');
    const results = await testService.testAllAgents();
    
    // Generate and display report
    const report = testService.generateReport(results);
    console.log(report);
    
    // Summary
    const complete = results.filter(r => r.status === 'complete').length;
    const incomplete = results.filter(r => r.status === 'incomplete').length;
    const partial = results.filter(r => r.status === 'partial').length;
    
    logger.log(`Health Check Summary:`);
    logger.log(`- Complete Agents: ${complete}`);
    logger.log(`- Incomplete Agents: ${incomplete}`);
    logger.log(`- Partial Agents: ${partial}`);
    
    if (incomplete > 0) {
      logger.warn(`${incomplete} agents require attention`);
    } else if (partial > 0) {
      logger.log(`${partial} agents have partial implementation`);
    } else {
      logger.log('All agents are complete!');
    }
    
    await app.close();
    
  } catch (error) {
    logger.error('Health check failed:', error.message);
    process.exit(1);
  }
}

// Run the health check if this script is executed directly
if (require.main === module) {
  performHealthCheck().catch(console.error);
}

export { performHealthCheck };