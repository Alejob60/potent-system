import { MigrationInterface, QueryRunner, Table } from "typeorm";

export class CreateWebhookEventsTable1702426000000 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.createTable(new Table({
            name: "webhook_events",
            columns: [
                {
                    name: "id",
                    type: "uuid",
                    isPrimary: true,
                    isGenerated: true,
                    generationStrategy: "uuid"
                },
                {
                    name: "eventId",
                    type: "varchar",
                    isUnique: true
                },
                {
                    name: "reference",
                    type: "varchar"
                },
                {
                    name: "hashBody",
                    type: "varchar"
                },
                {
                    name: "timestamp",
                    type: "timestamp"
                },
                {
                    name: "processed",
                    type: "boolean",
                    default: false
                },
                {
                    name: "status",
                    type: "varchar",
                    isNullable: true
                },
                {
                    name: "payload",
                    type: "json",
                    isNullable: true
                },
                {
                    name: "createdAt",
                    type: "timestamp",
                    default: "now()"
                },
                {
                    name: "updatedAt",
                    type: "timestamp",
                    default: "now()"
                }
            ],
            indices: [
                {
                    columnNames: ["eventId"],
                    isUnique: true
                },
                {
                    columnNames: ["reference"]
                },
                {
                    columnNames: ["timestamp"]
                }
            ]
        }), true);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropTable("webhook_events");
    }
}