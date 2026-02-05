import { MigrationInterface, QueryRunner, Table } from 'typeorm';

export class CreateViralCampaignsTable implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
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
      }),
      true,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('viral_campaigns');
  }
}
