import { MigrationInterface, QueryRunner, Table } from 'typeorm';

export class CreateFrontDeskConversationTable1700000000001 implements MigrationInterface {
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
            name: 'session_id',
            type: 'varchar',
            isNullable: false,
          },
          {
            name: 'user_id',
            type: 'varchar',
            isNullable: true,
          },
          {
            name: 'user_message',
            type: 'text',
            isNullable: false,
          },
          {
            name: 'agent_response',
            type: 'text',
            isNullable: false,
          },
          {
            name: 'objective',
            type: 'text',
            isNullable: false,
          },
          {
            name: 'target_agent',
            type: 'varchar',
            isNullable: false,
          },
          {
            name: 'collected_info',
            type: 'jsonb',
            isNullable: false,
          },
          {
            name: 'missing_info',
            type: 'jsonb',
            isNullable: false,
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
            name: 'integration_id',
            type: 'varchar',
            isNullable: true,
          },
          {
            name: 'integration_status',
            type: 'varchar',
            isNullable: true,
          },
          {
            name: 'created_at',
            type: 'timestamptz',
            default: 'now()',
          },
          {
            name: 'updated_at',
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