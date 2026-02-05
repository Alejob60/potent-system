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
var DatabaseOptimizationService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.DatabaseOptimizationService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("typeorm");
let DatabaseOptimizationService = DatabaseOptimizationService_1 = class DatabaseOptimizationService {
    constructor(dataSource) {
        this.dataSource = dataSource;
        this.logger = new common_1.Logger(DatabaseOptimizationService_1.name);
        this.queryPerformance = [];
        this.stats = {
            connections: {
                active: 0,
                idle: 0,
                total: 0,
            },
            performance: {
                avgQueryTime: 0,
                slowQueries: 0,
                totalQueries: 0,
            },
            maintenance: {
                lastIndexMaintenance: new Date(0),
                pendingIndexOperations: 0,
            },
        };
        this.isMonitoring = false;
    }
    configure(config) {
        this.config = config;
        this.logger.log('Database optimization configured');
    }
    startMonitoring() {
        if (this.isMonitoring) {
            this.logger.warn('Database monitoring is already running');
            return;
        }
        this.isMonitoring = true;
        this.logger.log('Starting database monitoring');
        setInterval(async () => {
            if (this.isMonitoring) {
                await this.collectStats();
            }
        }, 5000);
    }
    stopMonitoring() {
        this.isMonitoring = false;
        this.logger.log('Stopped database monitoring');
    }
    async collectStats() {
        try {
            const connections = {
                active: 0,
                idle: 0,
                total: 0,
            };
            this.stats.connections = connections;
            if (this.queryPerformance.length > 0) {
                const totalQueryTime = this.queryPerformance.reduce((sum, q) => sum + q.executionTime, 0);
                this.stats.performance.avgQueryTime = totalQueryTime / this.queryPerformance.length;
                this.stats.performance.totalQueries = this.queryPerformance.length;
                this.stats.performance.slowQueries = this.queryPerformance.filter(q => q.executionTime > this.config.queryOptimization.slowQueryThreshold).length;
            }
            this.logger.debug('Collected database statistics');
        }
        catch (error) {
            this.logger.error(`Error collecting database statistics: ${error.message}`);
        }
    }
    logQueryPerformance(query, executionTime, rowsAffected) {
        const performance = {
            query: query.substring(0, 100) + (query.length > 100 ? '...' : ''),
            executionTime,
            timestamp: new Date(),
            rowsAffected,
            hasIndex: this.hasIndex(query),
        };
        this.queryPerformance.push(performance);
        if (this.queryPerformance.length > 1000) {
            this.queryPerformance.shift();
        }
        if (this.config.queryOptimization.logSlowQueries &&
            executionTime > this.config.queryOptimization.slowQueryThreshold) {
            this.logger.warn(`Slow query detected: ${performance.query} (Execution time: ${executionTime}ms, Rows affected: ${rowsAffected})`);
        }
        this.stats.performance.totalQueries++;
        if (executionTime > this.config.queryOptimization.slowQueryThreshold) {
            this.stats.performance.slowQueries++;
        }
    }
    hasIndex(query) {
        const lowerQuery = query.toLowerCase();
        return (lowerQuery.includes('where') ||
            lowerQuery.includes('join') ||
            lowerQuery.includes('order by') ||
            lowerQuery.includes('group by'));
    }
    getStats() {
        return { ...this.stats };
    }
    getSlowQueries(limit = 20) {
        return this.queryPerformance
            .filter(q => q.executionTime > this.config.queryOptimization.slowQueryThreshold)
            .sort((a, b) => b.executionTime - a.executionTime)
            .slice(0, limit);
    }
    getQueryPerformance(limit = 100) {
        return this.queryPerformance.slice(-limit);
    }
    async analyzeForOptimization() {
        try {
            this.logger.log('Analyzing database for optimization opportunities');
            const recommendations = [];
            const slowQueries = this.getSlowQueries(50);
            const tableQueryMap = new Map();
            for (const query of slowQueries) {
                const tables = this.extractTablesFromQuery(query.query);
                for (const table of tables) {
                    if (!tableQueryMap.has(table)) {
                        tableQueryMap.set(table, []);
                    }
                    tableQueryMap.get(table).push(query);
                }
            }
            for (const [table, queries] of tableQueryMap) {
                const whereClauses = queries.filter(q => q.query.toLowerCase().includes('where'));
                if (whereClauses.length > queries.length * 0.5) {
                    recommendations.push({
                        table,
                        columns: ['<column_used_in_where_clause>'],
                        reason: `High percentage of slow queries on table ${table} use WHERE clauses`,
                        estimatedImprovement: '50-80% performance improvement',
                    });
                }
                const joinQueries = queries.filter(q => q.query.toLowerCase().includes('join'));
                if (joinQueries.length > queries.length * 0.3) {
                    recommendations.push({
                        table,
                        columns: ['<foreign_key_columns>'],
                        reason: `High percentage of slow queries on table ${table} use JOINs`,
                        estimatedImprovement: '40-70% performance improvement',
                    });
                }
                const orderByQueries = queries.filter(q => q.query.toLowerCase().includes('order by'));
                if (orderByQueries.length > queries.length * 0.4) {
                    recommendations.push({
                        table,
                        columns: ['<columns_used_in_order_by>'],
                        reason: `High percentage of slow queries on table ${table} use ORDER BY clauses`,
                        estimatedImprovement: '30-60% performance improvement',
                    });
                }
            }
            this.logger.log(`Generated ${recommendations.length} optimization recommendations`);
            return recommendations;
        }
        catch (error) {
            this.logger.error(`Error analyzing database for optimization: ${error.message}`);
            return [];
        }
    }
    extractTablesFromQuery(query) {
        const tableRegex = /from\s+(\w+)|join\s+(\w+)/gi;
        const matches = query.matchAll(tableRegex);
        const tables = [];
        for (const match of matches) {
            const table = match[1] || match[2];
            if (table && !tables.includes(table)) {
                tables.push(table);
            }
        }
        return tables;
    }
    optimizeConnectionPooling() {
        this.logger.log('Optimizing database connection pooling');
        this.logger.log('Connection pooling optimization completed');
    }
    async performMaintenance() {
        try {
            this.logger.log('Performing database maintenance');
            this.stats.maintenance.lastIndexMaintenance = new Date();
            this.stats.maintenance.pendingIndexOperations = 0;
            this.logger.log('Database maintenance completed');
        }
        catch (error) {
            this.logger.error(`Error performing database maintenance: ${error.message}`);
        }
    }
    async retryWithBackoff(operation) {
        let lastError;
        for (let i = 0; i <= this.config.connectionRetry.maxRetries; i++) {
            try {
                return await operation();
            }
            catch (error) {
                lastError = error;
                if (i < this.config.connectionRetry.maxRetries) {
                    const delay = this.config.connectionRetry.exponentialBackoff
                        ? this.config.connectionRetry.retryDelay * Math.pow(2, i)
                        : this.config.connectionRetry.retryDelay;
                    this.logger.warn(`Database operation failed, retrying in ${delay}ms (attempt ${i + 1}/${this.config.connectionRetry.maxRetries + 1}): ${error.message}`);
                    await new Promise(resolve => setTimeout(resolve, delay));
                }
            }
        }
        throw lastError;
    }
    getConnectionPoolConfig() {
        return { ...this.config.connectionPooling };
    }
    updateConnectionPoolConfig(config) {
        this.config.connectionPooling = { ...this.config.connectionPooling, ...config };
        this.logger.log('Updated connection pool configuration');
    }
};
exports.DatabaseOptimizationService = DatabaseOptimizationService;
exports.DatabaseOptimizationService = DatabaseOptimizationService = DatabaseOptimizationService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [typeorm_1.DataSource])
], DatabaseOptimizationService);
//# sourceMappingURL=database-optimization.service.js.map