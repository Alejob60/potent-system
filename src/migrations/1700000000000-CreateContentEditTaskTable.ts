import { MigrationInterface, QueryRunner, Table } from 'typeorm';

export class CreateContentEditTaskTable1700000000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
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
      }),
      true,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('content_edit_tasks');
  }
}