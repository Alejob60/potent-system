"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const typeorm_config_1 = require("./typeorm-config");
const campaign_entity_1 = require("./src/agents/campaign/entities/campaign.entity");
const agent_analytics_reporter_entity_1 = require("./src/agents/agent-analytics-reporter/entities/agent-analytics-reporter.entity");
const agent_trend_scanner_entity_1 = require("./src/agents/agent-trend-scanner/entities/agent-trend-scanner.entity");
async function testTables() {
    try {
        await typeorm_config_1.AppDataSource.initialize();
        console.log('✅ Database connection established');
        const queryRunner = typeorm_config_1.AppDataSource.createQueryRunner();
        const tables = await queryRunner.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
    `);
        console.log('📋 Existing tables:');
        tables.forEach((table) => {
            console.log(`  - ${table.table_name}`);
        });
        const agentTables = [
            'viral_campaigns',
            'agent_analytics_reports',
            'agent_trend_scans'
        ];
        console.log('\n🔍 Checking agent tables:');
        for (const tableName of agentTables) {
            const exists = tables.some((table) => table.table_name === tableName);
            console.log(`  ${exists ? '✅' : '❌'} ${tableName}: ${exists ? 'Exists' : 'Missing'}`);
        }
        console.log('\n🧪 Testing entity repositories:');
        const campaignRepo = typeorm_config_1.AppDataSource.getRepository(campaign_entity_1.Campaign);
        const analyticsRepo = typeorm_config_1.AppDataSource.getRepository(agent_analytics_reporter_entity_1.AgentAnalyticsReporter);
        const trendRepo = typeorm_config_1.AppDataSource.getRepository(agent_trend_scanner_entity_1.AgentTrendScanner);
        console.log('  ✅ Campaign repository initialized');
        console.log('  ✅ Analytics reporter repository initialized');
        console.log('  ✅ Trend scanner repository initialized');
        try {
            const campaignCount = await campaignRepo.count();
            console.log(`  📊 Campaigns table record count: ${campaignCount}`);
        }
        catch (error) {
            console.log(`  ❌ Error counting campaigns: ${error.message}`);
        }
        try {
            const analyticsCount = await analyticsRepo.count();
            console.log(`  📊 Analytics reports table record count: ${analyticsCount}`);
        }
        catch (error) {
            console.log(`  ❌ Error counting analytics reports: ${error.message}`);
        }
        try {
            const trendCount = await trendRepo.count();
            console.log(`  📊 Trend scans table record count: ${trendCount}`);
        }
        catch (error) {
            console.log(`  ❌ Error counting trend scans: ${error.message}`);
        }
        await queryRunner.release();
        await typeorm_config_1.AppDataSource.destroy();
        console.log('\n✅ Database test completed successfully');
    }
    catch (error) {
        console.error('❌ Database test failed:', error);
        process.exit(1);
    }
}
testTables();
//# sourceMappingURL=test-db-tables.js.map