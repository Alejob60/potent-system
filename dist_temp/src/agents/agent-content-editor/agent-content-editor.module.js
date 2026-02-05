"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ContentEditorModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const content_editor_controller_1 = require("./controllers/content-editor.controller");
const content_editor_service_1 = require("./services/content-editor.service");
const content_edit_task_entity_1 = require("./entities/content-edit-task.entity");
const axios_1 = require("@nestjs/axios");
let ContentEditorModule = class ContentEditorModule {
};
exports.ContentEditorModule = ContentEditorModule;
exports.ContentEditorModule = ContentEditorModule = __decorate([
    (0, common_1.Module)({
        imports: [
            typeorm_1.TypeOrmModule.forFeature([content_edit_task_entity_1.ContentEditTask]),
            axios_1.HttpModule,
        ],
        controllers: [content_editor_controller_1.ContentEditorController],
        providers: [content_editor_service_1.ContentEditorService],
        exports: [content_editor_service_1.ContentEditorService],
    })
], ContentEditorModule);
//# sourceMappingURL=agent-content-editor.module.js.map