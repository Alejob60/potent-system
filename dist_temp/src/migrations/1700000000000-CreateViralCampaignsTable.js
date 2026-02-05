"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreateViralCampaignsTable = void 0;
const typeorm_1 = require("typeorm");
class CreateViralCampaignsTable {
    async up(queryRunner) {
        await queryRunner.createTable(new typeorm_1.Table({
            name: 'viral_campaigns',
            columns: [
                {
                    name: 'id',
                    type: 'uuid',
                    isPrimary: true,
                    isGenerated: true,
                    generationStrategy: 'uuid',
                },
                {
                    name: 'campaignType',
                    type: 'varchar',
                },
                {
                    name: 'sessionId',
                    type: 'varchar',
                },
                {
                    name: 'userId',
                    type: 'varchar',
                },
                {
                    name: 'emotion',
                    type: 'varchar',
                },
                {
                    name: 'platforms',
                    type: 'jsonb',
                },
                {
                    name: 'agents',
                    type: 'jsonb',
                },
                {
                    name: 'durationDays',
                    type: 'integer',
                },
                {
                    name: 'schedule',
                    type: 'jsonb',
                },
                {
                    name: 'stages',
                    type: 'jsonb',
                },
                {
                    name: 'currentStage',
                    type: 'integer',
                    isNullable: true,
                },
                {
                    name: 'status',
                    type: 'varchar',
                },
                {
                    name: 'metrics',
                    type: 'jsonb',
                    isNullable: true,
                },
                {
                    name: 'metadata',
                    type: 'jsonb',
                    isNullable: true,
                },
                {
                    name: 'createdAt',
                    type: 'timestamptz',
                    default: 'now()',
                },
                {
                    name: 'updatedAt',
                    type: 'timestamptz',
                    default: 'now()',
                },
            ],
        }), true);
    }
    async down(queryRunner) {
        await queryRunner.dropTable('viral_campaigns');
    }
}
exports.CreateViralCampaignsTable = CreateViralCampaignsTable;
//# sourceMappingURL=1700000000000-CreateViralCampaignsTable.js.map