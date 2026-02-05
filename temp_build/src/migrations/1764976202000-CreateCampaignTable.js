"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreateCampaignTable1764976202000 = void 0;
const typeorm_1 = require("typeorm");
class CreateCampaignTable1764976202000 {
    constructor() {
        this.name = 'CreateCampaignTable1764976202000';
    }
    async up(queryRunner) {
        await queryRunner.createTable(new typeorm_1.Table({
            name: 'viral_campaigns',
            columns: [
                {
                    name: 'id',
                    type: 'uuid',
                    isPrimary: true,
                    isGenerated: true,
                    generationStrategy: 'uuid'
                },
                {
                    name: 'campaignName',
                    type: 'varchar',
                },
                {
                    name: 'objective',
                    type: 'varchar',
                },
                {
                    name: 'targetAudience',
                    type: 'varchar',
                },
                {
                    name: 'budget',
                    type: 'integer',
                },
                {
                    name: 'durationDays',
                    type: 'integer',
                },
                {
                    name: 'platforms',
                    type: 'jsonb',
                },
                {
                    name: 'details',
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
        await queryRunner.dropTable('viral_campaigns');
    }
}
exports.CreateCampaignTable1764976202000 = CreateCampaignTable1764976202000;
//# sourceMappingURL=1764976202000-CreateCampaignTable.js.map