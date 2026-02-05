"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppDataSource = exports.getAppDataSource = exports.createDataSourceOptions = void 0;
const dotenv = __importStar(require("dotenv"));
dotenv.config({ path: '.env.local' });
const typeorm_1 = require("typeorm");
const auth_log_entity_1 = require("./src/entities/auth-log.entity");
const agent_event_log_entity_1 = require("./src/entities/agent-event-log.entity");
const agent_workflow_entity_1 = require("./src/entities/agent-workflow.entity");
const context_bundle_entity_1 = require("./src/entities/context-bundle.entity");
const context_turn_entity_1 = require("./src/entities/context-turn.entity");
const customer_entity_1 = require("./src/entities/customer.entity");
const customer_context_entity_1 = require("./src/entities/customer-context.entity");
const generated_artifact_entity_1 = require("./src/entities/generated-artifact.entity");
const import_job_entity_1 = require("./src/entities/import-job.entity");
const legal_document_entity_1 = require("./src/entities/legal-document.entity");
const consent_record_entity_1 = require("./src/entities/consent-record.entity");
const data_delete_request_entity_1 = require("./src/entities/data-delete-request.entity");
const data_export_request_entity_1 = require("./src/entities/data-export-request.entity");
const agent_content_editor_entity_1 = require("./src/agents/agent-content-editor/entities/agent-content-editor.entity");
const content_edit_task_entity_1 = require("./src/agents/agent-content-editor/entities/content-edit-task.entity");
const agent_creative_synthesizer_entity_1 = require("./src/agents/agent-creative-synthesizer/entities/agent-creative-synthesizer.entity");
const creative_synthesizer_entity_1 = require("./src/agents/agent-creative-synthesizer/entities/creative-synthesizer.entity");
const agent_faq_responder_entity_1 = require("./src/agents/agent-faq-responder/entities/agent-faq-responder.entity");
const agent_post_scheduler_entity_1 = require("./src/agents/agent-post-scheduler/entities/agent-post-scheduler.entity");
const agent_trend_scanner_entity_1 = require("./src/agents/agent-trend-scanner/entities/agent-trend-scanner.entity");
const agent_video_scriptor_entity_1 = require("./src/agents/agent-video-scriptor/entities/agent-video-scriptor.entity");
const campaign_entity_1 = require("./src/agents/campaign/entities/campaign.entity");
const front_desk_conversation_entity_1 = require("./src/agents/front-desk/entities/front-desk-conversation.entity");
const viral_campaign_entity_1 = require("./src/agents/viral-campaign-orchestrator/entities/viral-campaign.entity");
const viralization_route_entity_1 = require("./src/agents/viralization-route-engine/entities/viralization-route.entity");
const oauth_account_entity_1 = require("./src/oauth/entities/oauth-account.entity");
const allEntities = [
    auth_log_entity_1.AuthLog,
    agent_event_log_entity_1.AgentEventLog,
    agent_workflow_entity_1.AgentWorkflow,
    context_bundle_entity_1.ContextBundle,
    context_turn_entity_1.ContextTurn,
    customer_entity_1.Customer,
    customer_context_entity_1.CustomerContext,
    generated_artifact_entity_1.GeneratedArtifact,
    import_job_entity_1.ImportJob,
    legal_document_entity_1.LegalDocument,
    consent_record_entity_1.ConsentRecord,
    data_delete_request_entity_1.DataDeleteRequest,
    data_export_request_entity_1.DataExportRequest,
    agent_content_editor_entity_1.AgentContentEditor,
    content_edit_task_entity_1.ContentEditTask,
    agent_creative_synthesizer_entity_1.AgentCreativeSynthesizer,
    creative_synthesizer_entity_1.CreativeSynthesizerCreation,
    agent_faq_responder_entity_1.AgentFaqResponder,
    agent_post_scheduler_entity_1.AgentPostScheduler,
    agent_trend_scanner_entity_1.AgentTrendScanner,
    agent_video_scriptor_entity_1.AgentVideoScriptor,
    campaign_entity_1.Campaign,
    front_desk_conversation_entity_1.FrontDeskConversation,
    viral_campaign_entity_1.ViralCampaign,
    viralization_route_entity_1.ViralizationRoute,
    oauth_account_entity_1.OAuthAccount
];
function getConnectionOptions() {
    const useAzureAD = !process.env.DB_PASSWORD || process.env.DB_PASSWORD === '';
    if (useAzureAD) {
        console.log('Azure AD authentication would be used here');
        return {
            type: 'postgres',
            host: process.env.DB_HOST || 'localhost',
            port: parseInt(process.env.DB_PORT || '5432'),
            username: process.env.DB_USERNAME || 'postgres',
            password: process.env.DB_PASSWORD || '1234',
            database: process.env.DB_NAME || 'postgres',
            ssl: process.env.DB_SSL === 'true' ? {
                rejectUnauthorized: false
            } : false,
            entities: allEntities,
            migrations: ['src/migrations/*.ts'],
            synchronize: false,
        };
    }
    else {
        return {
            type: 'postgres',
            host: process.env.DB_HOST || 'localhost',
            port: parseInt(process.env.DB_PORT || '5432'),
            username: process.env.DB_USERNAME || 'postgres',
            password: process.env.DB_PASSWORD || '1234',
            database: process.env.DB_NAME || 'postgres',
            ssl: process.env.DB_SSL === 'true' ? {
                rejectUnauthorized: false
            } : false,
            entities: allEntities,
            migrations: ['src/migrations/*.ts'],
            synchronize: false,
        };
    }
}
async function createDataSourceOptions() {
    return getConnectionOptions();
}
exports.createDataSourceOptions = createDataSourceOptions;
let appDataSource = null;
async function getAppDataSource() {
    if (!appDataSource) {
        const options = getConnectionOptions();
        appDataSource = new typeorm_1.DataSource(options);
    }
    return appDataSource;
}
exports.getAppDataSource = getAppDataSource;
exports.AppDataSource = new typeorm_1.DataSource(getConnectionOptions());
//# sourceMappingURL=data-source.js.map