#!/usr/bin/env node
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.performHealthCheck = void 0;
const core_1 = require("@nestjs/core");
const common_1 = require("@nestjs/common");
const agent_test_module_1 = require("../src/agents/test-utils/agent-test.module");
const agent_functionality_test_service_1 = require("../src/agents/test-utils/agent-functionality-test.service");
async function performHealthCheck() {
    const logger = new common_1.Logger('AgentHealthCheck');
    logger.log('Starting agent health check...');
    try {
        const app = await core_1.NestFactory.createApplicationContext(agent_test_module_1.AgentTestModule);
        const testService = app.get(agent_functionality_test_service_1.AgentFunctionalityTestService);
        logger.log('Running agent functionality tests...');
        const results = await testService.testAllAgents();
        const report = testService.generateReport(results);
        console.log(report);
        const complete = results.filter(r => r.status === 'complete').length;
        const incomplete = results.filter(r => r.status === 'incomplete').length;
        const partial = results.filter(r => r.status === 'partial').length;
        logger.log(`Health Check Summary:`);
        logger.log(`- Complete Agents: ${complete}`);
        logger.log(`- Incomplete Agents: ${incomplete}`);
        logger.log(`- Partial Agents: ${partial}`);
        if (incomplete > 0) {
            logger.warn(`${incomplete} agents require attention`);
        }
        else if (partial > 0) {
            logger.log(`${partial} agents have partial implementation`);
        }
        else {
            logger.log('All agents are complete!');
        }
        await app.close();
    }
    catch (error) {
        logger.error('Health check failed:', error.message);
        process.exit(1);
    }
}
exports.performHealthCheck = performHealthCheck;
if (require.main === module) {
    performHealthCheck().catch(console.error);
}
//# sourceMappingURL=agent-health-check.js.map