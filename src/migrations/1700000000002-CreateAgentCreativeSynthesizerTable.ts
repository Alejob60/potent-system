import { MigrationInterface, QueryRunner, Table } from 'typeorm';

export class CreateAgentCreativeSynthesizerTable1700000000002 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'agent_creative_synthesizer_creations',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            isGenerated: true,
            generationStrategy: 'uuid',
          },
          {
            name: 'intention',
            type: 'text',
            isNullable: false,
          },
          {
            name: 'emotion',
            type: 'text',
            isNullable: false,
          },
          {
            name: 'entities',
            type: 'jsonb',
            isNullable: false,
          },
          {
            name: 'session_id',
            type: 'uuid',
            isNullable: true,
          },
          {
            name: 'user_id',
            type: 'uuid',
            isNullable: true,
          },
          {
            name: 'asset_url',
            type: 'text',
            isNullable: true,
          },
          {
            name: 'asset_type',
            type: 'text',
            isNullable: true,
          },
          {
            name: 'status',
            type: 'text',
            default: 'pending',
            isNullable: false,
          },
          {
            name: 'generation_time',
            type: 'double precision',
            isNullable: true,
          },
          {
            name: 'quality_score',
            type: 'integer',
            isNullable: true,
          },
          {
            name: 'metadata',
            type: 'jsonb',
            isNullable: true,
          },
          {
            name: 'assets',
            type: 'jsonb',
            isNullable: true,
          },
          {
            name: 'created_at',
            type: 'timestamptz',
            default: 'now()',
            isNullable: false,
          },
          {
            name: 'updated_at',
            type: 'timestamptz',
            default: 'now()',
            isNullable: false,
          },
        ],
        indices: [
          {
            name: 'idx_agent_creative_session_status',
            columnNames: ['session_id', 'status'],
          },
          {
            name: 'idx_agent_creative_user_id',
            columnNames: ['user_id'],
          },
          {
            name: 'idx_agent_creative_created_at',
            columnNames: ['created_at'],
          },
        ],
      }),
      true,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('agent_creative_synthesizer_creations');
  }
}