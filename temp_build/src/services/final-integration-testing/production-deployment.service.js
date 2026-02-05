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
var ProductionDeploymentService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProductionDeploymentService = void 0;
const common_1 = require("@nestjs/common");
const axios_1 = require("@nestjs/axios");
const rxjs_1 = require("rxjs");
let ProductionDeploymentService = ProductionDeploymentService_1 = class ProductionDeploymentService {
    constructor(httpService) {
        this.httpService = httpService;
        this.logger = new common_1.Logger(ProductionDeploymentService_1.name);
    }
    configure(config) {
        this.config = config;
        this.logger.log(`Production deployment service configured with ${config.environments.length} environments`);
    }
    async executeDeployment(environmentName, version) {
        const startTime = Date.now();
        this.logger.log(`Starting deployment to ${environmentName} for version ${version}`);
        const environment = this.config.environments.find(env => env.name === environmentName);
        if (!environment) {
            throw new Error(`Environment ${environmentName} not found in configuration`);
        }
        const stageResults = [];
        let deploymentFailed = false;
        let rollbackTriggered = false;
        let rollbackInfo = undefined;
        for (const stage of this.config.deploymentPipeline) {
            try {
                const stageResult = await this.executeDeploymentStage(stage, environment, version);
                stageResults.push(stageResult);
                if (stageResult.status === 'failure') {
                    deploymentFailed = true;
                    this.logger.error(`Deployment stage ${stage.stage} failed`);
                    if (this.config.rollbackStrategy.autoRollback) {
                        this.logger.log('Auto-rollback triggered due to deployment failure');
                        rollbackTriggered = true;
                        rollbackInfo = await this.performRollback(environment, version, `Stage ${stage.stage} failed`);
                        break;
                    }
                }
            }
            catch (error) {
                const failedStageResult = {
                    stage: stage.stage,
                    status: 'failure',
                    actions: [{
                            actionName: 'Stage Execution',
                            stage: stage.stage,
                            status: 'failure',
                            message: `Stage execution failed: ${error.message}`,
                            startTime: new Date(),
                            endTime: new Date(),
                            duration: 0,
                        }],
                    startTime: new Date(),
                    endTime: new Date(),
                    duration: 0,
                };
                stageResults.push(failedStageResult);
                deploymentFailed = true;
                this.logger.error(`Deployment stage ${stage.stage} execution failed: ${error.message}`);
                if (this.config.rollbackStrategy.autoRollback) {
                    this.logger.log('Auto-rollback triggered due to deployment failure');
                    rollbackTriggered = true;
                    rollbackInfo = await this.performRollback(environment, version, `Stage ${stage.stage} execution failed: ${error.message}`);
                    break;
                }
            }
        }
        const endTime = Date.now();
        const duration = endTime - startTime;
        const status = rollbackTriggered
            ? 'rolled_back'
            : deploymentFailed
                ? 'failure'
                : 'success';
        const result = {
            status,
            environment: environmentName,
            stages: stageResults,
            startTime: new Date(startTime),
            endTime: new Date(endTime),
            duration,
            version,
            rollbackInfo,
        };
        this.logger.log(`Deployment to ${environmentName} completed: ${status}`);
        return result;
    }
    async executeDeploymentStage(stage, environment, version) {
        const startTime = Date.now();
        this.logger.log(`Executing deployment stage: ${stage.stage}`);
        const actionResults = [];
        for (const action of stage.actions) {
            try {
                const missingDependencies = action.dependencies.filter(dep => !actionResults.some(result => result.actionName === dep && result.status === 'success'));
                if (missingDependencies.length > 0) {
                    const skippedResult = {
                        actionName: action.name,
                        stage: stage.stage,
                        status: 'skipped',
                        message: `Skipped due to missing dependencies: ${missingDependencies.join(', ')}`,
                        startTime: new Date(),
                        endTime: new Date(),
                        duration: 0,
                    };
                    actionResults.push(skippedResult);
                    continue;
                }
                const actionResult = await this.executeDeploymentAction(action, environment, version);
                actionResults.push(actionResult);
                if (actionResult.status === 'failure') {
                    this.logger.error(`Deployment action ${action.name} failed: ${actionResult.message}`);
                }
            }
            catch (error) {
                const failedResult = {
                    actionName: action.name,
                    stage: stage.stage,
                    status: 'failure',
                    message: `Action execution failed: ${error.message}`,
                    startTime: new Date(),
                    endTime: new Date(),
                    duration: 0,
                };
                actionResults.push(failedResult);
                this.logger.error(`Deployment action ${action.name} execution failed: ${error.message}`);
            }
        }
        const endTime = Date.now();
        const duration = endTime - startTime;
        const failedActions = actionResults.filter(a => a.status === 'failure').length;
        const skippedActions = actionResults.filter(a => a.status === 'skipped').length;
        const status = failedActions === 0
            ? skippedActions === actionResults.length
                ? 'partial'
                : 'success'
            : 'failure';
        const stageResult = {
            stage: stage.stage,
            status,
            actions: actionResults,
            startTime: new Date(startTime),
            endTime: new Date(endTime),
            duration,
        };
        this.logger.log(`Deployment stage ${stage.stage} completed: ${status}`);
        return stageResult;
    }
    async executeDeploymentAction(action, environment, version) {
        const startTime = Date.now();
        this.logger.log(`Executing deployment action: ${action.name}`);
        try {
            let output = '';
            switch (action.type) {
                case 'build':
                    output = await this.executeBuildAction(action, environment, version);
                    break;
                case 'test':
                    output = await this.executeTestAction(action, environment, version);
                    break;
                case 'deploy':
                    output = await this.executeDeployAction(action, environment, version);
                    break;
                case 'validate':
                    output = await this.executeValidateAction(action, environment, version);
                    break;
                case 'rollback':
                    output = await this.executeRollbackAction(action, environment, version);
                    break;
            }
            const endTime = Date.now();
            const duration = endTime - startTime;
            const result = {
                actionName: action.name,
                stage: '',
                status: 'success',
                message: `Action ${action.name} completed successfully`,
                startTime: new Date(startTime),
                endTime: new Date(endTime),
                duration,
                output,
            };
            this.logger.log(`Deployment action ${action.name} completed successfully`);
            return result;
        }
        catch (error) {
            const endTime = Date.now();
            const duration = endTime - startTime;
            const result = {
                actionName: action.name,
                stage: '',
                status: 'failure',
                message: `Action ${action.name} failed: ${error.message}`,
                startTime: new Date(startTime),
                endTime: new Date(endTime),
                duration,
            };
            this.logger.error(`Deployment action ${action.name} failed: ${error.message}`);
            return result;
        }
    }
    async executeBuildAction(action, environment, version) {
        this.logger.log(`Building version ${version} for environment ${environment.name}`);
        await new Promise(resolve => setTimeout(resolve, 2000));
        return `Build completed successfully for version ${version}`;
    }
    async executeTestAction(action, environment, version) {
        this.logger.log(`Running tests for version ${version} in environment ${environment.name}`);
        await new Promise(resolve => setTimeout(resolve, 3000));
        return `Tests completed successfully for version ${version}`;
    }
    async executeDeployAction(action, environment, version) {
        this.logger.log(`Deploying version ${version} to environment ${environment.name}`);
        await new Promise(resolve => setTimeout(resolve, 5000));
        return `Deployment completed successfully for version ${version} to ${environment.name}`;
    }
    async executeValidateAction(action, environment, version) {
        this.logger.log(`Validating deployment of version ${version} in environment ${environment.name}`);
        await new Promise(resolve => setTimeout(resolve, 1000));
        return `Validation completed successfully for version ${version} in ${environment.name}`;
    }
    async executeRollbackAction(action, environment, version) {
        this.logger.log(`Rolling back version ${version} in environment ${environment.name}`);
        await new Promise(resolve => setTimeout(resolve, 4000));
        return `Rollback completed successfully for version ${version} in ${environment.name}`;
    }
    async performRollback(environment, version, reason) {
        const rollbackStartTime = Date.now();
        this.logger.log(`Performing rollback for version ${version} in environment ${environment.name}: ${reason}`);
        try {
            const rollbackStage = this.config.deploymentPipeline.find(stage => stage.actions.some(action => action.type === 'rollback'));
            if (rollbackStage) {
                const rollbackAction = rollbackStage.actions.find(action => action.type === 'rollback');
                if (rollbackAction) {
                    await this.executeRollbackAction(rollbackAction, environment, version);
                }
            }
            const rollbackEndTime = Date.now();
            const rollbackDuration = rollbackEndTime - rollbackStartTime;
            const rollbackInfo = {
                reason,
                rollbackTime: new Date(rollbackStartTime),
                rollbackDuration,
            };
            this.logger.log(`Rollback completed successfully for version ${version}`);
            return rollbackInfo;
        }
        catch (error) {
            const rollbackEndTime = Date.now();
            const rollbackDuration = rollbackEndTime - rollbackStartTime;
            const rollbackInfo = {
                reason: `Rollback failed: ${error.message} (Original reason: ${reason})`,
                rollbackTime: new Date(rollbackStartTime),
                rollbackDuration,
            };
            this.logger.error(`Rollback failed: ${error.message}`);
            return rollbackInfo;
        }
    }
    async checkDeploymentHealth(environmentName) {
        this.logger.log(`Checking deployment health for environment: ${environmentName}`);
        const environment = this.config.environments.find(env => env.name === environmentName);
        if (!environment) {
            throw new Error(`Environment ${environmentName} not found in configuration`);
        }
        const services = [];
        const issues = [];
        try {
            const healthStartTime = Date.now();
            const response = await (0, rxjs_1.firstValueFrom)(this.httpService.get(`${environment.baseUrl}/health`, {
                timeout: 5000,
            }));
            const healthResponseTime = Date.now() - healthStartTime;
            const healthResult = {
                service: 'main-application',
                status: response.status === 200 ? 'healthy' : 'unhealthy',
                responseTime: healthResponseTime,
                timestamp: new Date(),
                details: response.data,
            };
            services.push(healthResult);
            const criticalServices = ['database', 'cache', 'message-queue'];
            for (const service of criticalServices) {
                try {
                    const serviceStartTime = Date.now();
                    const serviceResponseTime = Date.now() - serviceStartTime;
                    const serviceResult = {
                        service,
                        status: 'healthy',
                        responseTime: serviceResponseTime,
                        timestamp: new Date(),
                    };
                    services.push(serviceResult);
                }
                catch (error) {
                    const serviceResult = {
                        service,
                        status: 'unhealthy',
                        responseTime: 0,
                        timestamp: new Date(),
                        details: { error: error.message },
                    };
                    services.push(serviceResult);
                    issues.push(`Service ${service} is unhealthy: ${error.message}`);
                }
            }
            const unhealthyServices = services.filter(s => s.status === 'unhealthy').length;
            const degradedServices = services.filter(s => s.status === 'degraded').length;
            const overallStatus = unhealthyServices > 0 ? 'unhealthy' :
                degradedServices > 0 ? 'degraded' : 'healthy';
            const report = {
                overallStatus,
                services,
                timestamp: new Date(),
                issues,
            };
            this.logger.log(`Deployment health check completed: ${overallStatus}`);
            return report;
        }
        catch (error) {
            const report = {
                overallStatus: 'unhealthy',
                services: [{
                        service: 'main-application',
                        status: 'unhealthy',
                        responseTime: 0,
                        timestamp: new Date(),
                        details: { error: error.message },
                    }],
                timestamp: new Date(),
                issues: [`Health check failed: ${error.message}`],
            };
            this.logger.error(`Deployment health check failed: ${error.message}`);
            return report;
        }
    }
    async validateDeployment(environmentName, version) {
        this.logger.log(`Validating deployment of version ${version} in environment ${environmentName}`);
        try {
            const healthReport = await this.checkDeploymentHealth(environmentName);
            if (healthReport.overallStatus !== 'healthy') {
                this.logger.warn(`Deployment validation failed: Health status is ${healthReport.overallStatus}`);
                return false;
            }
            const deploymentResult = await this.getLatestDeploymentResult(environmentName);
            if (deploymentResult) {
                const maxDeploymentTimeMs = this.config.deploymentMetrics.maxDeploymentTime * 60 * 1000;
                if (deploymentResult.duration > maxDeploymentTimeMs) {
                    this.logger.warn(`Deployment validation failed: Deployment took too long (${deploymentResult.duration}ms > ${maxDeploymentTimeMs}ms)`);
                    return false;
                }
                if (deploymentResult.status !== 'success') {
                    this.logger.warn(`Deployment validation failed: Deployment status is ${deploymentResult.status}`);
                    return false;
                }
            }
            this.logger.log(`Deployment validation passed for version ${version} in environment ${environmentName}`);
            return true;
        }
        catch (error) {
            this.logger.error(`Deployment validation failed: ${error.message}`);
            return false;
        }
    }
    async getLatestDeploymentResult(environmentName) {
        return null;
    }
    getConfiguration() {
        return { ...this.config };
    }
    updateConfiguration(config) {
        this.config = { ...this.config, ...config };
        this.logger.log('Deployment configuration updated');
    }
    addEnvironment(environment) {
        this.config.environments.push(environment);
        this.logger.log(`Added environment ${environment.name}`);
    }
    addPipelineStage(stage) {
        this.config.deploymentPipeline.push(stage);
        this.logger.log(`Added pipeline stage ${stage.stage}`);
    }
    removeEnvironment(environmentName) {
        this.config.environments = this.config.environments.filter(env => env.name !== environmentName);
        this.logger.log(`Removed environment ${environmentName}`);
    }
    removePipelineStage(stageName) {
        this.config.deploymentPipeline = this.config.deploymentPipeline.filter(stage => stage.stage !== stageName);
        this.logger.log(`Removed pipeline stage ${stageName}`);
    }
};
exports.ProductionDeploymentService = ProductionDeploymentService;
exports.ProductionDeploymentService = ProductionDeploymentService = ProductionDeploymentService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [axios_1.HttpService])
], ProductionDeploymentService);
//# sourceMappingURL=production-deployment.service.js.map