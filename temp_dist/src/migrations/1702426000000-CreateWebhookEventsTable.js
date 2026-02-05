"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreateWebhookEventsTable1702426000000 = void 0;
const typeorm_1 = require("typeorm");
class CreateWebhookEventsTable1702426000000 {
    async up(queryRunner) {
        await queryRunner.createTable(new typeorm_1.Table({
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
    async down(queryRunner) {
        await queryRunner.dropTable("webhook_events");
    }
}
exports.CreateWebhookEventsTable1702426000000 = CreateWebhookEventsTable1702426000000;
//# sourceMappingURL=1702426000000-CreateWebhookEventsTable.js.map