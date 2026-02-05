"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AgentCreativeSynthesizerModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const creative_synthesizer_entity_1 = require("./entities/creative-synthesizer.entity");
const creative_synthesizer_service_1 = require("./services/creative-synthesizer.service");
const creative_synthesizer_controller_1 = require("./controllers/creative-synthesizer.controller");
const microservices_1 = require("@nestjs/microservices");
let AgentCreativeSynthesizerModule = class AgentCreativeSynthesizerModule {
};
exports.AgentCreativeSynthesizerModule = AgentCreativeSynthesizerModule;
exports.AgentCreativeSynthesizerModule = AgentCreativeSynthesizerModule = __decorate([
    (0, common_1.Module)({
        imports: [
            typeorm_1.TypeOrmModule.forFeature([creative_synthesizer_entity_1.CreativeSynthesizerCreation]),
            microservices_1.ClientsModule.register([
                {
                    name: 'ServiceBusClient',
                    transport: microservices_1.Transport.RMQ,
                    options: {
                        urls: [
                            process.env.AZURE_SERVICE_BUS_CONNECTION_STRING ||
                                'amqp://localhost:5672',
                        ],
                        queue: process.env.SERVICE_BUS_QUEUE_NAME || 'content_creation_queue',
                        queueOptions: {
                            durable: true,
                        },
                    },
                },
            ]),
        ],
        providers: [creative_synthesizer_service_1.CreativeSynthesizerService],
        controllers: [creative_synthesizer_controller_1.CreativeSynthesizerController],
        exports: [creative_synthesizer_service_1.CreativeSynthesizerService],
    })
], AgentCreativeSynthesizerModule);
//# sourceMappingURL=agent-creative-synthesizer.module.js.map