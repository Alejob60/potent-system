"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreateProfessionalLogsTable1702427000000 = void 0;
const typeorm_1 = require("typeorm");
class CreateProfessionalLogsTable1702427000000 {
    async up(queryRunner) {
        await queryRunner.createTable(new typeorm_1.Table({
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
    async down(queryRunner) {
        await queryRunner.dropTable("professional_logs");
    }
}
exports.CreateProfessionalLogsTable1702427000000 = CreateProfessionalLogsTable1702427000000;
//# sourceMappingURL=1702427000000-CreateProfessionalLogsTable.js.map