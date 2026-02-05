import { MigrationInterface, QueryRunner, Table } from "typeorm";

export class CreateAgentAnalyticsReporterTable1764976201000 implements MigrationInterface {
    name = 'CreateAgentAnalyticsReporterTable1764976201000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.createTable(new Table({
            name: 'agent_analytics_reporters',
            columns: [
                {
                    name: 'id',
                    type: 'uuid',
                    isPrimary: true,
                    isGenerated: true,
                    generationStrategy: 'uuid'
                },
                {
                    name: 'metric',
                    type: 'varchar',
                },
                {
                    name: 'period',
                    type: 'varchar',
                },
                {
                    name: 'reportData',
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

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropTable('agent_analytics_reporters');
    }
}