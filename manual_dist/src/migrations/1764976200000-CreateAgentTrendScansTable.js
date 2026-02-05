"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreateAgentTrendScansTable1764976200000 = void 0;
const typeorm_1 = require("typeorm");
class CreateAgentTrendScansTable1764976200000 {
    constructor() {
        this.name = 'CreateAgentTrendScansTable1764976200000';
    }
    async up(queryRunner) {
        await queryRunner.createTable(new typeorm_1.Table({
            name: 'agent_trend_scans',
            columns: [
                {
                    name: 'id',
                    type: 'uuid',
                    isPrimary: true,
                    isGenerated: true,
                    generationStrategy: 'uuid'
                },
                {
                    name: 'topic',
                    type: 'varchar',
                },
                {
                    name: 'trends',
                    type: 'jsonb',
                    isNullable: true
                },
                {
                    name: 'platform',
                    type: 'varchar',
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
        await queryRunner.dropTable('agent_trend_scans');
    }
}
exports.CreateAgentTrendScansTable1764976200000 = CreateAgentTrendScansTable1764976200000;
//# sourceMappingURL=1764976200000-CreateAgentTrendScansTable.js.map