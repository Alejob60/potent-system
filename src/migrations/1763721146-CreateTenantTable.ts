import { MigrationInterface, QueryRunner, Table } from 'typeorm';

export class CreateTenantTable1763721146000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
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
      }),
      true,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('tenants');
  }
}