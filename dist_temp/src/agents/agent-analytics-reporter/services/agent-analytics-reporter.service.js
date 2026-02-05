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
exports.AgentAnalyticsReporterService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const agent_analytics_reporter_entity_1 = require("../entities/agent-analytics-reporter.entity");
let AgentAnalyticsReporterService = class AgentAnalyticsReporterService {
    constructor(repo) {
        this.repo = repo;
    }
    async create(dto) {
        const reportData = {
            metric: dto.metric || 'engagement',
            period: dto.period || 'daily',
            stats: [1, 2, 3, 4],
        };
        const entity = this.repo.create({
            ...dto,
            reportData,
        });
        return this.repo.save(entity);
    }
    async findAll() {
        return this.repo.find();
    }
    async findOne(id) {
        return this.repo.findOneBy({ id });
    }
};
exports.AgentAnalyticsReporterService = AgentAnalyticsReporterService;
exports.AgentAnalyticsReporterService = AgentAnalyticsReporterService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(agent_analytics_reporter_entity_1.AgentAnalyticsReporter)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], AgentAnalyticsReporterService);
//# sourceMappingURL=agent-analytics-reporter.service.js.map