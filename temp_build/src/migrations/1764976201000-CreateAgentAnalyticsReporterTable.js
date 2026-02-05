"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreateAgentAnalyticsReporterTable1764976201000 = void 0;
const typeorm_1 = require("typeorm");
class CreateAgentAnalyticsReporterTable1764976201000 {
    constructor() {
        this.name = 'CreateAgentAnalyticsReporterTable1764976201000';
    }
    async up(queryRunner) {
        await queryRunner.createTable(new typeorm_1.Table({
            name: 'agent_analytics_reporters',
            columns: [
                {
                    name: 'id',
                    type: 'uuid',
                    isPrimary: true,
                    isGenerated: true,
                    generationStrategy: 'uuid'
                },
                {
                    name: 'metric',
                    type: 'varchar',
                },
                {
                    name: 'period',
                    type: 'varchar',
                },
                {
                    name: 'reportData',
                    type: 'jsonb',
                    isNullable: true
                },
                {
                    name: 'sessionId',
                    type: 'varchar',
                    isNullable: true
                },
                {
                    name: 'userId',
                    type: 'varchar',
                    isNullable: true
                },
                {
                    name: 'status',
                    type: 'varchar',
                    default: "'pending'"
                },
                {
                    name: 'createdAt',
                    type: 'timestamptz',
                    default: 'now()'
                }
            ]
        }), true);
    }
    async down(queryRunner) {
        await queryRunner.dropTable('agent_analytics_reporters');
    }
}
exports.CreateAgentAnalyticsReporterTable1764976201000 = CreateAgentAnalyticsReporterTable1764976201000;
//# sourceMappingURL=1764976201000-CreateAgentAnalyticsReporterTable.js.map