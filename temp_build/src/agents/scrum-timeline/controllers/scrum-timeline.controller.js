"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ScrumTimelineController = void 0;
const common_1 = require("@nestjs/common");
const scrum_timeline_service_1 = require("../services/scrum-timeline.service");
const swagger_1 = require("@nestjs/swagger");
let ScrumTimelineController = class ScrumTimelineController {
    constructor(service) {
        this.service = service;
    }
    async syncScrumTimeline(calendarData) {
        return this.service.syncScrumTimeline(calendarData);
    }
};
exports.ScrumTimelineController = ScrumTimelineController;
__decorate([
    (0, common_1.Post)(),
    (0, swagger_1.ApiOperation)({
        summary: 'Sincroniza tareas en el calendario',
        description: 'Carga y coordina tareas en el calendario del equipo',
    }),
    (0, swagger_1.ApiBody)({
        description: 'Datos para sincronizaci n de tareas en calendario',
        schema: {
            type: 'object',
            properties: {
                tasks: {
                    type: 'array',
                    items: {
                        type: 'object',
                        properties: {
                            id: { type: 'string' },
                            title: { type: 'string' },
                            description: { type: 'string' },
                            startDate: { type: 'string', format: 'date-time' },
                            endDate: { type: 'string', format: 'date-time' },
                            assignee: { type: 'string' },
                        },
                    },
                },
                agents: {
                    type: 'array',
                    items: { type: 'string' },
                    example: ['trend-scanner', 'video-scriptor'],
                },
                sessionId: { type: 'string', example: 'user-session-123' },
            },
        },
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Tareas sincronizadas exitosamente en calendario',
    }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Datos inv lidos' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], ScrumTimelineController.prototype, "syncScrumTimeline", null);
exports.ScrumTimelineController = ScrumTimelineController = __decorate([
    (0, swagger_1.ApiTags)('calendar'),
    (0, common_1.Controller)('calendar/scrum-sync'),
    __metadata("design:paramtypes", [scrum_timeline_service_1.ScrumTimelineService])
], ScrumTimelineController);
//# sourceMappingURL=scrum-timeline.controller.js.map