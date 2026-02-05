"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.EntitiesModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const context_bundle_entity_1 = require("./context-bundle.entity");
const context_turn_entity_1 = require("./context-turn.entity");
const agent_event_log_entity_1 = require("./agent-event-log.entity");
const agent_workflow_entity_1 = require("./agent-workflow.entity");
const generated_artifact_entity_1 = require("./generated-artifact.entity");
const customer_entity_1 = require("./customer.entity");
const customer_context_entity_1 = require("./customer-context.entity");
const import_job_entity_1 = require("./import-job.entity");
const legal_document_entity_1 = require("./legal-document.entity");
const consent_record_entity_1 = require("./consent-record.entity");
const consent_preferences_entity_1 = require("./consent-preferences.entity");
const data_export_request_entity_1 = require("./data-export-request.entity");
const data_delete_request_entity_1 = require("./data-delete-request.entity");
const tenant_entity_1 = require("./tenant.entity");
const data_warehouse_entity_1 = require("./data-warehouse.entity");
let EntitiesModule = class EntitiesModule {
};
exports.EntitiesModule = EntitiesModule;
exports.EntitiesModule = EntitiesModule = __decorate([
    (0, common_1.Module)({
        imports: [
            typeorm_1.TypeOrmModule.forFeature([
                context_bundle_entity_1.ContextBundle,
                context_turn_entity_1.ContextTurn,
                agent_event_log_entity_1.AgentEventLog,
                agent_workflow_entity_1.AgentWorkflow,
                generated_artifact_entity_1.GeneratedArtifact,
                customer_entity_1.Customer,
                customer_context_entity_1.CustomerContext,
                import_job_entity_1.ImportJob,
                legal_document_entity_1.LegalDocument,
                consent_record_entity_1.ConsentRecord,
                consent_preferences_entity_1.ConsentPreferences,
                data_export_request_entity_1.DataExportRequest,
                data_delete_request_entity_1.DataDeleteRequest,
                tenant_entity_1.Tenant,
                data_warehouse_entity_1.DataWarehouse,
            ]),
        ],
        exports: [
            typeorm_1.TypeOrmModule.forFeature([
                context_bundle_entity_1.ContextBundle,
                context_turn_entity_1.ContextTurn,
                agent_event_log_entity_1.AgentEventLog,
                agent_workflow_entity_1.AgentWorkflow,
                generated_artifact_entity_1.GeneratedArtifact,
                customer_entity_1.Customer,
                customer_context_entity_1.CustomerContext,
                import_job_entity_1.ImportJob,
                legal_document_entity_1.LegalDocument,
                consent_record_entity_1.ConsentRecord,
                consent_preferences_entity_1.ConsentPreferences,
                data_export_request_entity_1.DataExportRequest,
                data_delete_request_entity_1.DataDeleteRequest,
                tenant_entity_1.Tenant,
                data_warehouse_entity_1.DataWarehouse,
            ]),
        ],
    })
], EntitiesModule);
//# sourceMappingURL=entities.module.js.map