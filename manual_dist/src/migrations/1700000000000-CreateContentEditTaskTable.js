"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreateContentEditTaskTable1700000000000 = void 0;
const typeorm_1 = require("typeorm");
class CreateContentEditTaskTable1700000000000 {
    async up(queryRunner) {
        await queryRunner.createTable(new typeorm_1.Table({
            name: 'content_edit_tasks',
            columns: [
                {
                    name: 'id',
                    type: 'uuid',
                    isPrimary: true,
                    isGenerated: true,
                    generationStrategy: 'uuid',
                },
                {
                    name: 'assetId',
                    type: 'varchar',
                },
                {
                    name: 'platform',
                    type: 'varchar',
                },
                {
                    name: 'emotion',
                    type: 'varchar',
                },
                {
                    name: 'campaignId',
                    type: 'varchar',
                },
                {
                    name: 'editingProfile',
                    type: 'jsonb',
                },
                {
                    name: 'status',
                    type: 'varchar',
                    default: 'received',
                },
                {
                    name: 'sasUrl',
                    type: 'varchar',
                },
                {
                    name: 'createdAt',
                    type: 'timestamp',
                    default: 'now()',
                },
                {
                    name: 'updatedAt',
                    type: 'timestamp',
                    default: 'now()',
                },
            ],
        }), true);
    }
    async down(queryRunner) {
        await queryRunner.dropTable('content_edit_tasks');
    }
}
exports.CreateContentEditTaskTable1700000000000 = CreateContentEditTaskTable1700000000000;
//# sourceMappingURL=1700000000000-CreateContentEditTaskTable.js.map