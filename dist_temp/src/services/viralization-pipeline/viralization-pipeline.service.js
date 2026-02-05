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
var ViralizationPipelineService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ViralizationPipelineService = void 0;
const common_1 = require("@nestjs/common");
const event_bus_service_1 = require("../event-bus/event-bus.service");
const context_store_service_1 = require("../context-store/context-store.service");
const uuid_1 = require("uuid");
let ViralizationPipelineService = ViralizationPipelineService_1 = class ViralizationPipelineService {
    constructor(eventBus, contextStore) {
        this.eventBus = eventBus;
        this.contextStore = contextStore;
        this.logger = new common_1.Logger(ViralizationPipelineService_1.name);
        this.executions = new Map();
        this.DEFAULT_TIMEOUT = 300000;
        this.STAGE_TYPES = {
            TREND_ANALYSIS: 'trend-scanner',
            CONTENT_CREATION: 'video-scriptor',
            VIDEO_PRODUCTION: 'video-engine',
            PUBLISHING: 'post-scheduler'
        };
    }
    async executeViralizationPipeline(tenantId, sessionId, inputData, userId) {
        this.logger.log(`Iniciando pipeline de viralización para tenant ${tenantId}, sesión ${sessionId}`);
        const execution = await this.createPipelineExecution(tenantId, sessionId, inputData, userId);
        await this.publishPipelineEvent('PIPELINE_STARTED', execution);
        try {
            const result = await this.runPipelineStages(execution);
            await this.updateContextWithResults(tenantId, sessionId, result);
            await this.publishPipelineEvent('PIPELINE_COMPLETED', execution, { result });
            return result;
        }
        catch (error) {
            this.logger.error(`Pipeline falló: ${error.message}`, error.stack);
            execution.status = 'failed';
            execution.error = error.message;
            execution.endTime = new Date();
            await this.publishPipelineEvent('PIPELINE_FAILED', execution, { error: error.message });
            throw error;
        }
    }
    async createPipelineExecution(tenantId, sessionId, inputData, userId) {
        const execution = {
            id: `pipeline_${(0, uuid_1.v4)()}`,
            tenantId,
            sessionId,
            userId,
            stages: this.initializePipelineStages(),
            currentStageIndex: 0,
            status: 'pending',
            inputData,
            outputData: {},
            startTime: new Date(),
            metadata: {
                createdAt: new Date().toISOString(),
                source: 'viralization-pipeline'
            }
        };
        this.executions.set(execution.id, execution);
        return execution;
    }
    initializePipelineStages() {
        return [
            {
                id: 'stage_1',
                name: 'Trend Analysis',
                type: 'TREND_ANALYSIS',
                service: null,
                inputMapper: (input) => ({
                    tenantId: input.tenantId,
                    sessionId: input.sessionId,
                    topics: input.topics || ['technology', 'innovation'],
                    platforms: input.platforms || ['instagram', 'tiktok'],
                    timeframe: input.timeframe || 'last_24_hours'
                }),
                outputMapper: (result) => ({
                    trends: result.trends,
                    audienceInsights: result.audience_data,
                    engagementPredictions: result.predictions
                }),
                timeout: this.DEFAULT_TIMEOUT,
                retryConfig: {
                    maxRetries: 3,
                    backoffMs: 1000,
                    exponentialBase: 2
                },
                dependencies: [],
                metrics: {
                    executions: 0,
                    successes: 0,
                    failures: 0,
                    avgDuration: 0,
                    lastExecution: null
                }
            },
            {
                id: 'stage_2',
                name: 'Content Creation',
                type: 'CONTENT_CREATION',
                service: null,
                inputMapper: (input) => ({
                    ...input,
                    trendData: input.previousStage?.output,
                    style: input.style || 'educational',
                    tone: input.tone || 'professional'
                }),
                outputMapper: (result) => ({
                    script: result.script,
                    hashtags: result.hashtags,
                    callToAction: result.cta
                }),
                timeout: this.DEFAULT_TIMEOUT * 2,
                retryConfig: {
                    maxRetries: 2,
                    backoffMs: 2000,
                    exponentialBase: 2
                },
                dependencies: ['stage_1'],
                metrics: {
                    executions: 0,
                    successes: 0,
                    failures: 0,
                    avgDuration: 0,
                    lastExecution: null
                }
            },
            {
                id: 'stage_3',
                name: 'Video Production',
                type: 'VIDEO_PRODUCTION',
                service: null,
                inputMapper: (input) => ({
                    ...input,
                    scriptData: input.previousStage?.output,
                    duration: input.duration || 60,
                    quality: input.quality || 'hd'
                }),
                outputMapper: (result) => ({
                    videoUrl: result.video_url,
                    thumbnail: result.thumbnail_url,
                    duration: result.actual_duration
                }),
                timeout: this.DEFAULT_TIMEOUT * 4,
                retryConfig: {
                    maxRetries: 1,
                    backoffMs: 5000,
                    exponentialBase: 2
                },
                dependencies: ['stage_2'],
                metrics: {
                    executions: 0,
                    successes: 0,
                    failures: 0,
                    avgDuration: 0,
                    lastExecution: null
                }
            },
            {
                id: 'stage_4',
                name: 'Content Publishing',
                type: 'PUBLISHING',
                service: null,
                inputMapper: (input) => ({
                    ...input,
                    contentData: input.previousStage?.output,
                    scheduleTime: this.calculateOptimalPostingTime(input),
                    platforms: input.platforms || ['instagram', 'tiktok']
                }),
                outputMapper: (result) => ({
                    postIds: result.post_ids,
                    scheduledTimes: result.scheduled_times,
                    publishingStatus: result.status
                }),
                timeout: this.DEFAULT_TIMEOUT,
                retryConfig: {
                    maxRetries: 2,
                    backoffMs: 1000,
                    exponentialBase: 2
                },
                dependencies: ['stage_3'],
                metrics: {
                    executions: 0,
                    successes: 0,
                    failures: 0,
                    avgDuration: 0,
                    lastExecution: null
                }
            }
        ];
    }
    async runPipelineStages(execution) {
        execution.status = 'running';
        let stageResults = {};
        let totalDuration = 0;
        let successes = 0;
        for (let i = 0; i < execution.stages.length; i++) {
            const stage = execution.stages[i];
            execution.currentStageIndex = i;
            try {
                this.logger.log(`Ejecutando etapa ${i + 1}/${execution.stages.length}: ${stage.name}`);
                const startTime = Date.now();
                if (!(await this.verifyStageDependencies(stage, stageResults))) {
                    throw new Error(`Dependencias no satisfechas para etapa ${stage.name}`);
                }
                const stageResult = await this.executeStageWithRetry(stage, {
                    ...execution.inputData,
                    previousStage: stageResults[stage.dependencies[0]] || null
                });
                const duration = Date.now() - startTime;
                totalDuration += duration;
                successes++;
                this.updateStageMetrics(stage, duration, true);
                stageResults[stage.id] = {
                    output: stage.outputMapper(stageResult),
                    duration,
                    timestamp: new Date().toISOString()
                };
                await this.publishPipelineEvent('STAGE_COMPLETED', execution, {
                    stageId: stage.id,
                    stageName: stage.name,
                    duration,
                    result: stageResults[stage.id]
                });
            }
            catch (error) {
                this.logger.error(`Etapa ${stage.name} falló: ${error.message}`);
                this.updateStageMetrics(stage, 0, false);
                await this.publishPipelineEvent('STAGE_FAILED', execution, {
                    stageId: stage.id,
                    stageName: stage.name,
                    error: error.message
                });
                if (this.shouldAbortPipeline(error, stage)) {
                    execution.status = 'failed';
                    execution.error = `Pipeline abortado en etapa ${stage.name}: ${error.message}`;
                    execution.endTime = new Date();
                    return this.buildPipelineResult(execution, stageResults, totalDuration, successes);
                }
            }
        }
        execution.status = 'completed';
        execution.endTime = new Date();
        execution.outputData = stageResults;
        return this.buildPipelineResult(execution, stageResults, totalDuration, successes);
    }
    async executeStageWithRetry(stage, inputData) {
        let lastError;
        for (let attempt = 0; attempt <= stage.retryConfig.maxRetries; attempt++) {
            try {
                this.logger.log(`Intento ${attempt + 1}/${stage.retryConfig.maxRetries + 1} para etapa ${stage.name}`);
                const mappedInput = stage.inputMapper(inputData);
                const result = await this.simulateStageExecution(stage.type, mappedInput);
                await this.enforceStageTimeout(stage, result);
                return result;
            }
            catch (error) {
                lastError = error;
                if (attempt < stage.retryConfig.maxRetries) {
                    const delay = this.calculateRetryDelay(stage.retryConfig, attempt);
                    this.logger.warn(`Etapa ${stage.name} falló, reintentando en ${delay}ms: ${error.message}`);
                    await new Promise(resolve => setTimeout(resolve, delay));
                }
            }
        }
        throw lastError;
    }
    async simulateStageExecution(stageType, input) {
        this.logger.debug(`Simulando ejecución de ${stageType} con input:`, input);
        await new Promise(resolve => setTimeout(resolve, 2000));
        switch (stageType) {
            case 'TREND_ANALYSIS':
                return {
                    trends: ['AI', 'Machine Learning', 'Tech Innovation'],
                    audience_data: { size: 15000, engagement: 0.08 },
                    predictions: { viral_potential: 0.75 }
                };
            case 'CONTENT_CREATION':
                return {
                    script: 'Guía completa sobre inteligencia artificial...',
                    hashtags: ['#AI', '#MachineLearning', '#Tech'],
                    cta: 'Sigue para más contenido educativo'
                };
            case 'VIDEO_PRODUCTION':
                return {
                    video_url: `https://storage.example.com/videos/${(0, uuid_1.v4)()}.mp4`,
                    thumbnail_url: `https://storage.example.com/thumbs/${(0, uuid_1.v4)()}.jpg`,
                    actual_duration: 60
                };
            case 'PUBLISHING':
                return {
                    post_ids: [`post_${(0, uuid_1.v4)()}`, `post_${(0, uuid_1.v4)()}`],
                    scheduled_times: [new Date(Date.now() + 3600000)],
                    status: 'scheduled'
                };
            default:
                throw new Error(`Tipo de etapa desconocido: ${stageType}`);
        }
    }
    async verifyStageDependencies(stage, results) {
        if (stage.dependencies.length === 0)
            return true;
        return stage.dependencies.every(depId => results[depId] && results[depId].output);
    }
    calculateRetryDelay(retryConfig, attempt) {
        return retryConfig.backoffMs * Math.pow(retryConfig.exponentialBase, attempt);
    }
    shouldAbortPipeline(error, stage) {
        const criticalErrors = ['INVALID_INPUT', 'AUTHENTICATION_FAILED', 'PERMISSION_DENIED'];
        const isFirstStage = stage.id === 'stage_1';
        return criticalErrors.some(critical => error.message.includes(critical)) || isFirstStage;
    }
    calculateOptimalPostingTime(input) {
        const optimalHour = input.optimalHour || 18;
        const postingTime = new Date();
        postingTime.setHours(optimalHour, 0, 0, 0);
        if (postingTime < new Date()) {
            postingTime.setDate(postingTime.getDate() + 1);
        }
        return postingTime;
    }
    async enforceStageTimeout(stage, result) {
        return new Promise((resolve, reject) => {
            const timeout = setTimeout(() => {
                reject(new Error(`Timeout excedido para etapa ${stage.name} (${stage.timeout}ms)`));
            }, stage.timeout);
            setTimeout(() => {
                clearTimeout(timeout);
                resolve(result);
            }, Math.random() * 1000);
        });
    }
    updateStageMetrics(stage, duration, success) {
        stage.metrics.executions++;
        if (success) {
            stage.metrics.successes++;
            stage.metrics.avgDuration = ((stage.metrics.avgDuration * (stage.metrics.successes - 1) + duration) /
                stage.metrics.successes);
        }
        else {
            stage.metrics.failures++;
        }
        stage.metrics.lastExecution = new Date();
    }
    buildPipelineResult(execution, stageResults, totalDuration, successes) {
        const totalStages = execution.stages.length;
        const successRate = successes / totalStages;
        return {
            executionId: execution.id,
            status: successRate === 1 ? 'success' : successRate > 0 ? 'partial_success' : 'failed',
            stagesCompleted: successes,
            totalStages,
            results: stageResults,
            metrics: {
                totalTime: totalDuration,
                avgStageTime: totalDuration / totalStages,
                successRate
            },
            recommendations: this.generateRecommendations(execution, successRate)
        };
    }
    generateRecommendations(execution, successRate) {
        const recommendations = [];
        if (successRate < 1) {
            recommendations.push('Revisar configuración de etapas fallidas');
            recommendations.push('Considerar aumentar timeouts para etapas complejas');
        }
        if (successRate < 0.5) {
            recommendations.push('Evaluar necesidad de más reintentos');
            recommendations.push('Verificar conectividad con servicios externos');
        }
        recommendations.push('Pipeline ejecutado exitosamente');
        return recommendations;
    }
    async updateContextWithResults(tenantId, sessionId, result) {
        try {
            await this.contextStore.addConversationMessage(tenantId, sessionId, 'assistant', `Pipeline de viralización completado: ${result.stagesCompleted}/${result.totalStages} etapas exitosas`, {
                messageType: 'pipeline_result',
                pipelineExecutionId: result.executionId,
                successRate: result.metrics.successRate,
                totalTime: result.metrics.totalTime
            });
        }
        catch (error) {
            this.logger.warn(`No se pudo actualizar contexto: ${error.message}`);
        }
    }
    async publishPipelineEvent(eventType, execution, payload) {
        try {
            await this.eventBus.publish({
                type: `PIPELINE_${eventType}`,
                tenantId: execution.tenantId,
                sessionId: execution.sessionId,
                payload: {
                    executionId: execution.id,
                    ...payload
                }
            });
        }
        catch (error) {
            this.logger.error(`Error publicando evento ${eventType}: ${error.message}`);
        }
    }
    async getPipelineExecution(executionId) {
        return this.executions.get(executionId);
    }
    async getTenantExecutions(tenantId) {
        return Array.from(this.executions.values())
            .filter(execution => execution.tenantId === tenantId)
            .sort((a, b) => b.startTime.getTime() - a.startTime.getTime());
    }
    async getPipelineMetrics() {
        const executions = Array.from(this.executions.values());
        const completed = executions.filter(e => e.status === 'completed').length;
        const failed = executions.filter(e => e.status === 'failed').length;
        const running = executions.filter(e => e.status === 'running').length;
        const stageMetrics = this.aggregateStageMetrics(executions);
        return {
            totalExecutions: executions.length,
            completed,
            failed,
            running,
            successRate: completed / Math.max(executions.length, 1),
            stageMetrics
        };
    }
    aggregateStageMetrics(executions) {
        const aggregated = {};
        executions.forEach(execution => {
            execution.stages.forEach(stage => {
                if (!aggregated[stage.name]) {
                    aggregated[stage.name] = {
                        executions: 0,
                        successes: 0,
                        failures: 0,
                        avgDuration: 0
                    };
                }
                aggregated[stage.name].executions += stage.metrics.executions;
                aggregated[stage.name].successes += stage.metrics.successes;
                aggregated[stage.name].failures += stage.metrics.failures;
                if (stage.metrics.successes > 0) {
                    aggregated[stage.name].avgDuration = ((aggregated[stage.name].avgDuration * (aggregated[stage.name].successes - 1) +
                        stage.metrics.avgDuration) /
                        aggregated[stage.name].successes);
                }
            });
        });
        return aggregated;
    }
};
exports.ViralizationPipelineService = ViralizationPipelineService;
exports.ViralizationPipelineService = ViralizationPipelineService = ViralizationPipelineService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [event_bus_service_1.EventBusService,
        context_store_service_1.ContextStoreService])
], ViralizationPipelineService);
//# sourceMappingURL=viralization-pipeline.service.js.map