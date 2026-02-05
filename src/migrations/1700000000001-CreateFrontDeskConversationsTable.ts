import { MigrationInterface, QueryRunner, Table } from 'typeorm';

export class CreateFrontDeskConversationsTable implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'front_desk_conversations',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            isGenerated: true,
            generationStrategy: 'uuid',
          },
          {
            name: 'sessionId',
            type: 'varchar',
          },
          {
            name: 'userId',
            type: 'varchar',
            isNullable: true,
          },
          {
            name: 'userMessage',
            type: 'text',
          },
          {
            name: 'agentResponse',
            type: 'text',
          },
          {
            name: 'objective',
            type: 'varchar',
          },
          {
            name: 'targetAgent',
            type: 'varchar',
          },
          {
            name: 'collectedInfo',
            type: 'jsonb',
          },
          {
            name: 'missingInfo',
            type: 'jsonb',
          },
          {
            name: 'language',
            type: 'varchar',
            isNullable: true,
          },
          {
            name: 'confidence',
            type: 'float',
            isNullable: true,
          },
          {
            name: 'emotion',
            type: 'varchar',
            isNullable: true,
          },
          {
            name: 'entities',
            type: 'jsonb',
            isNullable: true,
          },
          {
            name: 'context',
            type: 'jsonb',
            isNullable: true,
          },
          {
            name: 'integrationId',
            type: 'varchar',
            isNullable: true,
          },
          {
            name: 'integrationStatus',
            type: 'varchar',
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
    await queryRunner.dropTable('front_desk_conversations');
  }
}