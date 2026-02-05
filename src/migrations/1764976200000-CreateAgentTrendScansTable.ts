import { MigrationInterface, QueryRunner, Table } from "typeorm";

export class CreateAgentTrendScansTable1764976200000 implements MigrationInterface {
    name = 'CreateAgentTrendScansTable1764976200000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.createTable(new Table({
            name: 'agent_trend_scans',
            columns: [
                {
                    name: 'id',
                    type: 'uuid',
                    isPrimary: true,
                    isGenerated: true,
                    generationStrategy: 'uuid'
                },
                {
                    name: 'topic',
                    type: 'varchar',
                },
                {
                    name: 'trends',
                    type: 'jsonb',
                    isNullable: true
                },
                {
                    name: 'platform',
                    type: 'varchar',
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
        await queryRunner.dropTable('agent_trend_scans');
    }
}