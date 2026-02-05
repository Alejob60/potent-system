import { MigrationInterface, QueryRunner, Table } from "typeorm";

export class CreateProfessionalLogsTable1702427000000 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.createTable(new Table({
            name: "professional_logs",
            columns: [
                {
                    name: "id",
                    type: "uuid",
                    isPrimary: true,
                    isGenerated: true,
                    generationStrategy: "uuid"
                },
                {
                    name: "category",
                    type: "varchar"
                },
                {
                    name: "action",
                    type: "varchar"
                },
                {
                    name: "userId",
                    type: "varchar",
                    isNullable: true
                },
                {
                    name: "productId",
                    type: "varchar",
                    isNullable: true
                },
                {
                    name: "reference",
                    type: "varchar",
                    isNullable: true
                },
                {
                    name: "message",
                    type: "text",
                    isNullable: true
                },
                {
                    name: "metadata",
                    type: "json",
                    isNullable: true
                },
                {
                    name: "timestamp",
                    type: "timestamp"
                },
                {
                    name: "createdAt",
                    type: "timestamp",
                    default: "now()"
                }
            ],
            indices: [
                {
                    columnNames: ["category"]
                },
                {
                    columnNames: ["timestamp"]
                }
            ]
        }), true);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropTable("professional_logs");
    }
}