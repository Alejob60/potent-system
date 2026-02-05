"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreateTenantTable1763721146000 = void 0;
const typeorm_1 = require("typeorm");
class CreateTenantTable1763721146000 {
    async up(queryRunner) {
        await queryRunner.createTable(new typeorm_1.Table({
            name: 'tenants',
            columns: [
                {
                    name: 'id',
                    type: 'uuid',
                    isPrimary: true,
                    isGenerated: true,
                    generationStrategy: 'uuid',
                },
                {
                    name: 'tenantId',
                    type: 'varchar',
                    isUnique: true,
                    isNullable: false,
                },
                {
                    name: 'siteId',
                    type: 'varchar',
                    isUnique: true,
                    isNullable: false,
                },
                {
                    name: 'tenantName',
                    type: 'varchar',
                    isNullable: false,
                },
                {
                    name: 'contactEmail',
                    type: 'varchar',
                    isNullable: false,
                },
                {
                    name: 'websiteUrl',
                    type: 'varchar',
                    isNullable: false,
                },
                {
                    name: 'businessIndustry',
                    type: 'varchar',
                    isNullable: false,
                },
                {
                    name: 'allowedOrigins',
                    type: 'text',
                    isNullable: true,
                },
                {
                    name: 'permissions',
                    type: 'text',
                    isNullable: true,
                },
                {
                    name: 'tenantSecret',
                    type: 'varchar',
                    isNullable: false,
                },
                {
                    name: 'isActive',
                    type: 'boolean',
                    default: true,
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
            indices: [
                {
                    columnNames: ['tenantId'],
                    isUnique: true,
                },
                {
                    columnNames: ['siteId'],
                    isUnique: true,
                },
            ],
        }), true);
    }
    async down(queryRunner) {
        await queryRunner.dropTable('tenants');
    }
}
exports.CreateTenantTable1763721146000 = CreateTenantTable1763721146000;
//# sourceMappingURL=1763721146-CreateTenantTable.js.map