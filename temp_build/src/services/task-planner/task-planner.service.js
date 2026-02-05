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
var TaskPlannerService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.TaskPlannerService = void 0;
const common_1 = require("@nestjs/common");
const event_bus_service_1 = require("../event-bus/event-bus.service");
const uuid_1 = require("uuid");
let TaskPlannerService = TaskPlannerService_1 = class TaskPlannerService {
    constructor(eventBus) {
        this.eventBus = eventBus;
        this.logger = new common_1.Logger(TaskPlannerService_1.name);
        this.ACTION_DURATION_MAP = {
            'CREATE_VIDEO': 1800,
            'SCHEDULE_POST': 300,
            'ANALYZE_AUDIENCE': 600,
            'GENERATE_CONTENT': 900,
            'OPTIMIZE_TIMING': 150
        };
    }
    async generatePlan(trendAnalysis) {
        this.logger.log(`Generating execution plan for tenant ${trendAnalysis.tenantId}`);
        const actions = this.analyzeTrendAndGenerateActions(trendAnalysis);
        const optimizedActions = this.optimizeActionSequence(actions);
        const resourceRequirements = this.calculateResourceRequirements(optimizedActions);
        const executionPlan = {
            id: `plan_${(0, uuid_1.v4)()}`,
            tenantId: trendAnalysis.tenantId,
            sessionId: trendAnalysis.sessionId,
            userId: trendAnalysis.userId,
            createdAt: new Date(),
            estimatedCompletion: this.calculateCompletionTime(optimizedActions),
            actions: optimizedActions,
            priority: this.calculatePriority(trendAnalysis),
            status: 'pending',
            metadata: {
                trendAnalysisId: trendAnalysis.createdAt.getTime(),
                confidenceFactors: this.identifyConfidenceFactors(trendAnalysis)
            }
        };
        const confidenceScore = this.calculateConfidenceScore(trendAnalysis, executionPlan);
        const risks = this.identifyRisks(trendAnalysis, executionPlan);
        const result = {
            plan: executionPlan,
            confidenceScore,
            resourceRequirements,
            risks
        };
        await this.eventBus.publish({
            type: 'PLAN_GENERATED',
            tenantId: trendAnalysis.tenantId,
            sessionId: trendAnalysis.sessionId,
            payload: result
        });
        this.logger.log(`Plan generated successfully: ${executionPlan.id} (confidence: ${confidenceScore})`);
        return result;
    }
    analyzeTrendAndGenerateActions(trendAnalysis) {
        const actions = [];
        const actionCounter = 1;
        if (trendAnalysis.audienceSize > 5000) {
            actions.push(this.createAction('ANALYZE_AUDIENCE', 1, {
                audienceSize: trendAnalysis.audienceSize,
                trendingTopics: trendAnalysis.trendingTopics,
                platforms: trendAnalysis.platforms
            }));
        }
        if (trendAnalysis.engagementRate > 0.05 && trendAnalysis.contentTypes.includes('video')) {
            actions.push(this.createAction('CREATE_VIDEO', 2, {
                trendingTopics: trendAnalysis.trendingTopics,
                sentiment: trendAnalysis.sentimentScore > 0 ? 'positive' : 'neutral',
                platforms: trendAnalysis.platforms.filter(p => ['tiktok', 'instagram', 'youtube'].includes(p)),
                targetEmotion: this.determineTargetEmotion(trendAnalysis.sentimentScore)
            }));
        }
        if (trendAnalysis.competitionLevel !== 'high') {
            actions.push(this.createAction('GENERATE_CONTENT', 3, {
                contentTypes: trendAnalysis.contentTypes,
                trendingHashtags: trendAnalysis.trendingHashtags.slice(0, 5),
                topics: trendAnalysis.trendingTopics
            }));
        }
        actions.push(this.createAction('OPTIMIZE_TIMING', 4, {
            peakTimes: trendAnalysis.peakTimes,
            platforms: trendAnalysis.platforms,
            audienceTimezone: 'America/Bogota'
        }));
        actions.push(this.createAction('SCHEDULE_POST', 5, {
            platforms: trendAnalysis.platforms,
            contentReady: actions.some(a => a.type === 'CREATE_VIDEO' || a.type === 'GENERATE_CONTENT'),
            optimalTimes: trendAnalysis.peakTimes
        }, ['OPTIMIZE_TIMING']));
        return actions;
    }
    optimizeActionSequence(actions) {
        const sortedActions = [...actions].sort((a, b) => {
            if (a.priority !== b.priority) {
                return a.priority - b.priority;
            }
            return this.ACTION_DURATION_MAP[a.type] - this.ACTION_DURATION_MAP[b.type];
        });
        const resolvedActions = [];
        const completedActionIds = new Set();
        for (const action of sortedActions) {
            const unsatisfiedDeps = action.dependencies.filter(depId => !completedActionIds.has(depId));
            if (unsatisfiedDeps.length === 0) {
                resolvedActions.push(action);
                completedActionIds.add(action.id);
            }
            else {
                action.priority = Math.max(...sortedActions
                    .filter(a => unsatisfiedDeps.includes(a.id))
                    .map(a => a.priority)) + 1;
                resolvedActions.push(action);
                completedActionIds.add(action.id);
            }
        }
        return resolvedActions;
    }
    calculateResourceRequirements(actions) {
        const totalDuration = actions.reduce((sum, action) => sum + action.estimatedDuration, 0);
        const requiredAgents = [...new Set(actions.flatMap(action => action.requiredAgents))];
        const estimatedCost = this.calculateEstimatedCost(actions);
        return {
            estimatedCost,
            requiredAgents,
            executionTime: totalDuration
        };
    }
    calculateCompletionTime(actions) {
        const totalDuration = actions.reduce((sum, action) => sum + action.estimatedDuration, 0);
        const completionDate = new Date();
        completionDate.setSeconds(completionDate.getSeconds() + totalDuration);
        return completionDate;
    }
    calculatePriority(trendAnalysis) {
        let priority = 1;
        if (trendAnalysis.engagementRate > 0.1)
            priority += 2;
        else if (trendAnalysis.engagementRate > 0.05)
            priority += 1;
        if (trendAnalysis.audienceSize > 50000)
            priority += 2;
        else if (trendAnalysis.audienceSize > 10000)
            priority += 1;
        if (trendAnalysis.competitionLevel === 'low')
            priority += 1;
        if (trendAnalysis.sentimentScore > 0.5)
            priority += 1;
        return Math.min(priority, 5);
    }
    calculateConfidenceScore(trendAnalysis, plan) {
        let score = 0.5;
        if (trendAnalysis.engagementRate > 0.05)
            score += 0.15;
        if (trendAnalysis.audienceSize > 10000)
            score += 0.1;
        if (trendAnalysis.competitionLevel === 'low')
            score += 0.1;
        if (trendAnalysis.sentimentScore > 0)
            score += 0.05;
        if (trendAnalysis.competitionLevel === 'high')
            score -= 0.15;
        if (plan.actions.length > 5)
            score -= 0.05;
        return Math.max(0, Math.min(1, score));
    }
    identifyConfidenceFactors(trendAnalysis) {
        const factors = [];
        if (trendAnalysis.engagementRate > 0.05)
            factors.push('high_engagement');
        if (trendAnalysis.audienceSize > 10000)
            factors.push('large_audience');
        if (trendAnalysis.competitionLevel === 'low')
            factors.push('low_competition');
        if (trendAnalysis.sentimentScore > 0)
            factors.push('positive_sentiment');
        return factors;
    }
    identifyRisks(trendAnalysis, plan) {
        const risks = [];
        if (trendAnalysis.competitionLevel === 'high')
            risks.push('high_competition');
        if (plan.actions.length > 4)
            risks.push('complex_execution');
        if (trendAnalysis.audienceSize < 1000)
            risks.push('small_audience');
        if (trendAnalysis.sentimentScore < -0.3)
            risks.push('negative_sentiment');
        return risks;
    }
    calculateEstimatedCost(actions) {
        const baseCostPerAction = 100;
        const agentCosts = {
            'video-scriptor': 500,
            'post-scheduler': 50,
            'trend-scanner': 200,
            'content-generator': 300
        };
        let totalCost = actions.length * baseCostPerAction;
        const requiredAgents = [...new Set(actions.flatMap(action => action.requiredAgents))];
        requiredAgents.forEach(agent => {
            if (agentCosts[agent]) {
                totalCost += agentCosts[agent];
            }
        });
        return totalCost;
    }
    determineTargetEmotion(sentimentScore) {
        if (sentimentScore > 0.5)
            return 'excited';
        if (sentimentScore > 0)
            return 'positive';
        if (sentimentScore > -0.3)
            return 'neutral';
        return 'serious';
    }
    createAction(type, priority, parameters, dependencies = []) {
        return {
            id: `action_${(0, uuid_1.v4)()}`,
            type,
            priority,
            estimatedDuration: this.ACTION_DURATION_MAP[type],
            requiredAgents: this.getRequiredAgents(type),
            dependencies,
            parameters,
            status: 'pending'
        };
    }
    getRequiredAgents(actionType) {
        const agentMap = {
            'CREATE_VIDEO': ['video-scriptor', 'video-engine'],
            'SCHEDULE_POST': ['post-scheduler'],
            'ANALYZE_AUDIENCE': ['trend-scanner'],
            'GENERATE_CONTENT': ['content-generator'],
            'OPTIMIZE_TIMING': ['trend-scanner']
        };
        return agentMap[actionType] || ['generic-agent'];
    }
};
exports.TaskPlannerService = TaskPlannerService;
exports.TaskPlannerService = TaskPlannerService = TaskPlannerService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [event_bus_service_1.EventBusService])
], TaskPlannerService);
//# sourceMappingURL=task-planner.service.js.map