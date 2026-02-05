import { MigrationInterface, QueryRunner, Table } from "typeorm";

export class CreateCampaignTable1764976202000 implements MigrationInterface {
    name = 'CreateCampaignTable1764976202000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.createTable(new Table({
            name: 'viral_campaigns',
            columns: [
                {
                    name: 'id',
                    type: 'uuid',
                    isPrimary: true,
                    isGenerated: true,
                    generationStrategy: 'uuid'
                },
                {
                    name: 'campaignName',
                    type: 'varchar',
                },
                {
                    name: 'objective',
                    type: 'varchar',
                },
                {
                    name: 'targetAudience',
                    type: 'varchar',
                },
                {
                    name: 'budget',
                    type: 'integer',
                },
                {
                    name: 'durationDays',
                    type: 'integer',
                },
                {
                    name: 'platforms',
                    type: 'jsonb',
                },
                {
                    name: 'details',
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
        await queryRunner.dropTable('viral_campaigns');
    }
}