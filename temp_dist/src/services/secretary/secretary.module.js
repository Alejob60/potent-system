"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SecretaryModule = void 0;
const common_1 = require("@nestjs/common");
const secretary_service_1 = require("./secretary.service");
const secretary_controller_1 = require("../../controllers/secretary.controller");
const vector_memory_module_1 = require("../memory/vector-memory.module");
const azure_client_1 = require("../../lib/api/azure-client");
let SecretaryModule = class SecretaryModule {
};
exports.SecretaryModule = SecretaryModule;
exports.SecretaryModule = SecretaryModule = __decorate([
    (0, common_1.Module)({
        imports: [vector_memory_module_1.VectorMemoryModule],
        controllers: [secretary_controller_1.SecretaryController],
        providers: [secretary_service_1.SecretaryService, azure_client_1.AzureClient],
        exports: [secretary_service_1.SecretaryService]
    })
], SecretaryModule);
//# sourceMappingURL=secretary.module.js.map