import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
  Query,
  Logger,
  BadRequestException,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiBody, ApiQuery } from '@nestjs/swagger';
import { LoadBalancingService } from './load-balancing.service';
import { HealthMonitoringService } from './health-monitoring.service';
import { AutoScalingService } from './auto-scaling.service';
import { CachingStrategyService } from './caching-strategy.service';
import { DatabaseOptimizationService } from './database-optimization.service';
import { FailoverMechanismsService } from './failover-mechanisms.service';
import { PerformanceMonitoringService } from './performance-monitoring.service';

@ApiTags('scalability-ha')
@Controller('scalability-ha')
export class ScalabilityHaController {
  private readonly logger = new Logger(ScalabilityHaController.name);

  constructor(
    private readonly loadBalancingService: LoadBalancingService,
    private readonly healthMonitoringService: HealthMonitoringService,
    private readonly autoScalingService: AutoScalingService,
    private readonly cachingStrategyService: CachingStrategyService,
    private readonly databaseOptimizationService: DatabaseOptimizationService,
    private readonly failoverMechanismsService: FailoverMechanismsService,
    private readonly performanceMonitoringService: PerformanceMonitoringService,
  ) {}

  // LOAD BALANCING ENDPOINTS

  @Post('load-balancer/configure')
  @ApiOperation({
    summary: 'Configure load balancer',
    description: 'Configure the load balancer with specified settings',
  })
  @ApiBody({
    description: 'Load balancer configuration',
    schema: {
      type: 'object',
      properties: {
        strategy: { type: 'string', enum: ['round-robin', 'least-connections', 'weighted-round-robin'] },
        servers: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              url: { type: 'string' },
              weight: { type: 'number' },
              active: { type: 'boolean' },
            },
            required: ['url', 'active'],
          },
        },
        healthCheckInterval: { type: 'number' },
        timeout: { type: 'number' },
      },
      required: ['strategy', 'servers', 'healthCheckInterval', 'timeout'],
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Load balancer configured successfully',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean' },
        message: { type: 'string' },
      },
    },
  })
  async configureLoadBalancer(@Body() body: any) {
    try {
      if (!body.strategy || !body.servers || !body.healthCheckInterval || !body.timeout) {
        throw new BadRequestException('Missing required fields: strategy, servers, healthCheckInterval, timeout');
      }

      this.loadBalancingService.configure(body);

      return {
        success: true,
        message: 'Load balancer configured successfully',
      };
    } catch (error) {
      this.logger.error(`Failed to configure load balancer: ${error.message}`);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  @Get('load-balancer/next-server')
  @ApiOperation({
    summary: 'Get next server',
    description: 'Get the next server based on the load balancing strategy',
  })
  @ApiResponse({
    status: 200,
    description: 'Next server retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean' },
        data: { type: 'string' },
      },
    },
  })
  async getNextServer() {
    try {
      const server = this.loadBalancingService.getNextServer();

      return {
        success: true,
        data: server,
      };
    } catch (error) {
      this.logger.error(`Failed to get next server: ${error.message}`);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  @Get('load-balancer/health')
  @ApiOperation({
    summary: 'Get server health',
    description: 'Get health status of all servers',
  })
  @ApiResponse({
    status: 200,
    description: 'Server health retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean' },
        data: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              url: { type: 'string' },
              healthy: { type: 'boolean' },
              responseTime: { type: 'number' },
              lastChecked: { type: 'string', format: 'date-time' },
            },
          },
        },
      },
    },
  })
  async getServerHealth() {
    try {
      const health = this.loadBalancingService.getServerHealth();

      return {
        success: true,
        data: health,
      };
    } catch (error) {
      this.logger.error(`Failed to get server health: ${error.message}`);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  // HEALTH MONITORING ENDPOINTS

  @Post('health-monitoring/configure')
  @ApiOperation({
    summary: 'Configure health monitoring',
    description: 'Configure health monitoring for services',
  })
  @ApiBody({
    description: 'Health monitoring configuration',
    schema: {
      type: 'object',
      properties: {
        services: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              name: { type: 'string' },
              url: { type: 'string' },
              critical: { type: 'boolean' },
              expectedStatusCode: { type: 'number' },
              timeout: { type: 'number' },
            },
            required: ['name', 'url', 'critical', 'expectedStatusCode', 'timeout'],
          },
        },
        checkInterval: { type: 'number' },
        alertThreshold: { type: 'number' },
      },
      required: ['services', 'checkInterval', 'alertThreshold'],
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Health monitoring configured successfully',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean' },
        message: { type: 'string' },
      },
    },
  })
  async configureHealthMonitoring(@Body() body: any) {
    try {
      if (!body.services || !body.checkInterval || !body.alertThreshold) {
        throw new BadRequestException('Missing required fields: services, checkInterval, alertThreshold');
      }

      this.healthMonitoringService.configure(body);
      this.healthMonitoringService.startMonitoring();

      return {
        success: true,
        message: 'Health monitoring configured and started successfully',
      };
    } catch (error) {
      this.logger.error(`Failed to configure health monitoring: ${error.message}`);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  @Get('health-monitoring/status')
  @ApiOperation({
    summary: 'Get health status',
    description: 'Get health status of all monitored services',
  })
  @ApiResponse({
    status: 200,
    description: 'Health status retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean' },
        data: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              name: { type: 'string' },
              url: { type: 'string' },
              status: { type: 'string', enum: ['healthy', 'unhealthy', 'degraded'] },
              lastChecked: { type: 'string', format: 'date-time' },
              responseTime: { type: 'number' },
              statusCode: { type: 'number' },
              failureCount: { type: 'number' },
              lastFailureReason: { type: 'string' },
            },
          },
        },
      },
    },
  })
  async getHealthStatus() {
    try {
      const status = this.healthMonitoringService.getHealthStatus();

      return {
        success: true,
        data: status,
      };
    } catch (error) {
      this.logger.error(`Failed to get health status: ${error.message}`);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  @Get('health-monitoring/alerts')
  @ApiOperation({
    summary: 'Get health alerts',
    description: 'Get recent health alerts',
  })
  @ApiQuery({
    name: 'limit',
    description: 'Number of alerts to return (default: 20)',
    required: false,
  })
  @ApiResponse({
    status: 200,
    description: 'Health alerts retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean' },
        data: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              service: { type: 'string' },
              level: { type: 'string', enum: ['warning', 'critical'] },
              message: { type: 'string' },
              timestamp: { type: 'string', format: 'date-time' },
            },
          },
        },
      },
    },
  })
  async getHealthAlerts(@Query('limit') limit?: string) {
    try {
      const limitNum = limit ? parseInt(limit, 10) : 20;
      const alerts = this.healthMonitoringService.getAlerts(limitNum);

      return {
        success: true,
        data: alerts,
      };
    } catch (error) {
      this.logger.error(`Failed to get health alerts: ${error.message}`);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  // AUTO-SCALING ENDPOINTS

  @Post('auto-scaling/configure')
  @ApiOperation({
    summary: 'Configure auto-scaling',
    description: 'Configure auto-scaling for a service',
  })
  @ApiBody({
    description: 'Auto-scaling configuration',
    schema: {
      type: 'object',
      properties: {
        serviceName: { type: 'string' },
        minReplicas: { type: 'number' },
        maxReplicas: { type: 'number' },
        targetCPUUtilization: { type: 'number' },
        targetMemoryUtilization: { type: 'number' },
        scaleUpThreshold: { type: 'number' },
        scaleDownThreshold: { type: 'number' },
        scaleUpFactor: { type: 'number' },
        scaleDownFactor: { type: 'number' },
        cooldownPeriod: { type: 'number' },
        metricsCheckInterval: { type: 'number' },
      },
      required: [
        'serviceName', 'minReplicas', 'maxReplicas', 'targetCPUUtilization',
        'targetMemoryUtilization', 'scaleUpThreshold', 'scaleDownThreshold',
        'scaleUpFactor', 'scaleDownFactor', 'cooldownPeriod', 'metricsCheckInterval'
      ],
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Auto-scaling configured successfully',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean' },
        message: { type: 'string' },
      },
    },
  })
  async configureAutoScaling(@Body() body: any) {
    try {
      const requiredFields = [
        'serviceName', 'minReplicas', 'maxReplicas', 'targetCPUUtilization',
        'targetMemoryUtilization', 'scaleUpThreshold', 'scaleDownThreshold',
        'scaleUpFactor', 'scaleDownFactor', 'cooldownPeriod', 'metricsCheckInterval'
      ];

      for (const field of requiredFields) {
        if (body[field] === undefined) {
          throw new BadRequestException(`Missing required field: ${field}`);
        }
      }

      this.autoScalingService.configure(body);
      this.autoScalingService.startAutoScaling();

      return {
        success: true,
        message: 'Auto-scaling configured and started successfully',
      };
    } catch (error) {
      this.logger.error(`Failed to configure auto-scaling: ${error.message}`);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  @Get('auto-scaling/replicas')
  @ApiOperation({
    summary: 'Get current replicas',
    description: 'Get current number of replicas',
  })
  @ApiResponse({
    status: 200,
    description: 'Current replicas retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean' },
        data: { type: 'number' },
      },
    },
  })
  async getCurrentReplicas() {
    try {
      const replicas = this.autoScalingService.getCurrentReplicas();

      return {
        success: true,
        data: replicas,
      };
    } catch (error) {
      this.logger.error(`Failed to get current replicas: ${error.message}`);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  @Get('auto-scaling/events')
  @ApiOperation({
    summary: 'Get scaling events',
    description: 'Get recent scaling events',
  })
  @ApiQuery({
    name: 'limit',
    description: 'Number of events to return (default: 20)',
    required: false,
  })
  @ApiResponse({
    status: 200,
    description: 'Scaling events retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean' },
        data: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              timestamp: { type: 'string', format: 'date-time' },
              action: { type: 'string', enum: ['scale_up', 'scale_down', 'scale_to'] },
              fromReplicas: { type: 'number' },
              toReplicas: { type: 'number' },
              reason: { type: 'string' },
            },
          },
        },
      },
    },
  })
  async getScalingEvents(@Query('limit') limit?: string) {
    try {
      const limitNum = limit ? parseInt(limit, 10) : 20;
      const events = this.autoScalingService.getScalingEvents(limitNum);

      return {
        success: true,
        data: events,
      };
    } catch (error) {
      this.logger.error(`Failed to get scaling events: ${error.message}`);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  // CACHING STRATEGY ENDPOINTS

  @Post('caching/configure')
  @ApiOperation({
    summary: 'Configure caching strategy',
    description: 'Configure caching strategy with specified settings',
  })
  @ApiBody({
    description: 'Caching configuration',
    schema: {
      type: 'object',
      properties: {
        defaultTTL: { type: 'number' },
        maxMemory: { type: 'string' },
        evictionPolicy: { type: 'string' },
        compressionEnabled: { type: 'boolean' },
        compressionThreshold: { type: 'number' },
        namespace: { type: 'string' },
      },
      required: ['defaultTTL', 'maxMemory', 'evictionPolicy', 'compressionEnabled', 'compressionThreshold', 'namespace'],
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Caching strategy configured successfully',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean' },
        message: { type: 'string' },
      },
    },
  })
  async configureCaching(@Body() body: any) {
    try {
      const requiredFields = ['defaultTTL', 'maxMemory', 'evictionPolicy', 'compressionEnabled', 'compressionThreshold', 'namespace'];
      
      for (const field of requiredFields) {
        if (body[field] === undefined) {
          throw new BadRequestException(`Missing required field: ${field}`);
        }
      }

      this.cachingStrategyService.configure(body);

      return {
        success: true,
        message: 'Caching strategy configured successfully',
      };
    } catch (error) {
      this.logger.error(`Failed to configure caching strategy: ${error.message}`);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  @Post('caching/set')
  @ApiOperation({
    summary: 'Set cache value',
    description: 'Set a value in the cache',
  })
  @ApiBody({
    description: 'Cache set parameters',
    schema: {
      type: 'object',
      properties: {
        key: { type: 'string' },
        value: { type: 'object' },
        ttl: { type: 'number' },
      },
      required: ['key', 'value'],
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Value set in cache successfully',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean' },
        message: { type: 'string' },
      },
    },
  })
  async setCacheValue(@Body() body: any) {
    try {
      if (!body.key || body.value === undefined) {
        throw new BadRequestException('Missing required fields: key, value');
      }

      const success = await this.cachingStrategyService.set(body.key, body.value, body.ttl);

      return {
        success,
        message: success ? 'Value set in cache successfully' : 'Failed to set value in cache',
      };
    } catch (error) {
      this.logger.error(`Failed to set cache value: ${error.message}`);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  @Get('caching/get/:key')
  @ApiOperation({
    summary: 'Get cache value',
    description: 'Get a value from the cache',
  })
  @ApiParam({
    name: 'key',
    description: 'Cache key',
  })
  @ApiResponse({
    status: 200,
    description: 'Value retrieved from cache successfully',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean' },
        data: { type: 'object' },
      },
    },
  })
  async getCacheValue(@Param('key') key: string) {
    try {
      const value = await this.cachingStrategyService.get(key);

      return {
        success: true,
        data: value,
      };
    } catch (error) {
      this.logger.error(`Failed to get cache value: ${error.message}`);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  @Get('caching/stats')
  @ApiOperation({
    summary: 'Get cache statistics',
    description: 'Get cache statistics',
  })
  @ApiResponse({
    status: 200,
    description: 'Cache statistics retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean' },
        data: {
          type: 'object',
          properties: {
            hits: { type: 'number' },
            misses: { type: 'number' },
            hitRate: { type: 'number' },
            evictions: { type: 'number' },
            memoryUsage: { type: 'number' },
            keys: { type: 'number' },
            maxSize: { type: 'number' },
          },
        },
      },
    },
  })
  async getCacheStats() {
    try {
      const stats = this.cachingStrategyService.getStats();

      return {
        success: true,
        data: stats,
      };
    } catch (error) {
      this.logger.error(`Failed to get cache stats: ${error.message}`);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  // DATABASE OPTIMIZATION ENDPOINTS

  @Post('database/configure')
  @ApiOperation({
    summary: 'Configure database optimization',
    description: 'Configure database optimization settings',
  })
  @ApiBody({
    description: 'Database optimization configuration',
    schema: {
      type: 'object',
      properties: {
        connectionPooling: {
          type: 'object',
          properties: {
            min: { type: 'number' },
            max: { type: 'number' },
            acquireTimeoutMillis: { type: 'number' },
            createTimeoutMillis: { type: 'number' },
            destroyTimeoutMillis: { type: 'number' },
            idleTimeoutMillis: { type: 'number' },
            createRetryIntervalMillis: { type: 'number' },
          },
        },
        queryOptimization: {
          type: 'object',
          properties: {
            maxExecutionTime: { type: 'number' },
            slowQueryThreshold: { type: 'number' },
            logSlowQueries: { type: 'boolean' },
          },
        },
        indexing: {
          type: 'object',
          properties: {
            autoIndex: { type: 'boolean' },
            indexMaintenanceInterval: { type: 'number' },
          },
        },
        connectionRetry: {
          type: 'object',
          properties: {
            maxRetries: { type: 'number' },
            retryDelay: { type: 'number' },
            exponentialBackoff: { type: 'boolean' },
          },
        },
      },
      required: ['connectionPooling', 'queryOptimization', 'indexing', 'connectionRetry'],
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Database optimization configured successfully',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean' },
        message: { type: 'string' },
      },
    },
  })
  async configureDatabaseOptimization(@Body() body: any) {
    try {
      const requiredSections = ['connectionPooling', 'queryOptimization', 'indexing', 'connectionRetry'];
      
      for (const section of requiredSections) {
        if (!body[section]) {
          throw new BadRequestException(`Missing required section: ${section}`);
        }
      }

      this.databaseOptimizationService.configure(body);
      this.databaseOptimizationService.startMonitoring();

      return {
        success: true,
        message: 'Database optimization configured and monitoring started successfully',
      };
    } catch (error) {
      this.logger.error(`Failed to configure database optimization: ${error.message}`);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  @Get('database/stats')
  @ApiOperation({
    summary: 'Get database statistics',
    description: 'Get database statistics',
  })
  @ApiResponse({
    status: 200,
    description: 'Database statistics retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean' },
        data: {
          type: 'object',
          properties: {
            connections: {
              type: 'object',
              properties: {
                active: { type: 'number' },
                idle: { type: 'number' },
                total: { type: 'number' },
              },
            },
            performance: {
              type: 'object',
              properties: {
                avgQueryTime: { type: 'number' },
                slowQueries: { type: 'number' },
                totalQueries: { type: 'number' },
              },
            },
            maintenance: {
              type: 'object',
              properties: {
                lastIndexMaintenance: { type: 'string', format: 'date-time' },
                pendingIndexOperations: { type: 'number' },
              },
            },
          },
        },
      },
    },
  })
  async getDatabaseStats() {
    try {
      const stats = this.databaseOptimizationService.getStats();

      return {
        success: true,
        data: stats,
      };
    } catch (error) {
      this.logger.error(`Failed to get database stats: ${error.message}`);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  @Get('database/slow-queries')
  @ApiOperation({
    summary: 'Get slow queries',
    description: 'Get recent slow queries',
  })
  @ApiQuery({
    name: 'limit',
    description: 'Number of queries to return (default: 20)',
    required: false,
  })
  @ApiResponse({
    status: 200,
    description: 'Slow queries retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean' },
        data: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              query: { type: 'string' },
              executionTime: { type: 'number' },
              timestamp: { type: 'string', format: 'date-time' },
              rowsAffected: { type: 'number' },
              hasIndex: { type: 'boolean' },
            },
          },
        },
      },
    },
  })
  async getSlowQueries(@Query('limit') limit?: string) {
    try {
      const limitNum = limit ? parseInt(limit, 10) : 20;
      const queries = this.databaseOptimizationService.getSlowQueries(limitNum);

      return {
        success: true,
        data: queries,
      };
    } catch (error) {
      this.logger.error(`Failed to get slow queries: ${error.message}`);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  // FAILOVER MECHANISMS ENDPOINTS

  @Post('failover/configure')
  @ApiOperation({
    summary: 'Configure failover mechanisms',
    description: 'Configure failover mechanisms with specified settings',
  })
  @ApiBody({
    description: 'Failover configuration',
    schema: {
      type: 'object',
      properties: {
        primaryService: {
          type: 'object',
          properties: {
            name: { type: 'string' },
            url: { type: 'string' },
            healthCheckPath: { type: 'string' },
            timeout: { type: 'number' },
          },
          required: ['name', 'url', 'healthCheckPath', 'timeout'],
        },
        backupServices: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              name: { type: 'string' },
              url: { type: 'string' },
              priority: { type: 'number' },
              healthCheckPath: { type: 'string' },
              timeout: { type: 'number' },
            },
            required: ['name', 'url', 'priority', 'healthCheckPath', 'timeout'],
          },
        },
        failoverThreshold: { type: 'number' },
        healthCheckInterval: { type: 'number' },
        recoveryCheckInterval: { type: 'number' },
        enableAutoRecovery: { type: 'boolean' },
      },
      required: [
        'primaryService', 'backupServices', 'failoverThreshold',
        'healthCheckInterval', 'recoveryCheckInterval', 'enableAutoRecovery'
      ],
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Failover mechanisms configured successfully',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean' },
        message: { type: 'string' },
      },
    },
  })
  async configureFailover(@Body() body: any) {
    try {
      const requiredFields = [
        'primaryService', 'backupServices', 'failoverThreshold',
        'healthCheckInterval', 'recoveryCheckInterval', 'enableAutoRecovery'
      ];

      for (const field of requiredFields) {
        if (body[field] === undefined) {
          throw new BadRequestException(`Missing required field: ${field}`);
        }
      }

      this.failoverMechanismsService.configure(body);
      this.failoverMechanismsService.startFailoverMonitoring();

      return {
        success: true,
        message: 'Failover mechanisms configured and monitoring started successfully',
      };
    } catch (error) {
      this.logger.error(`Failed to configure failover mechanisms: ${error.message}`);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  @Get('failover/active-service')
  @ApiOperation({
    summary: 'Get active service',
    description: 'Get currently active service',
  })
  @ApiResponse({
    status: 200,
    description: 'Active service retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean' },
        data: { type: 'string' },
      },
    },
  })
  async getActiveService() {
    try {
      const service = this.failoverMechanismsService.getCurrentActiveService();

      return {
        success: true,
        data: service,
      };
    } catch (error) {
      this.logger.error(`Failed to get active service: ${error.message}`);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  @Get('failover/status')
  @ApiOperation({
    summary: 'Get service status',
    description: 'Get status of all services',
  })
  @ApiResponse({
    status: 200,
    description: 'Service status retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean' },
        data: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              name: { type: 'string' },
              url: { type: 'string' },
              status: { type: 'string', enum: ['healthy', 'unhealthy', 'degraded'] },
              lastChecked: { type: 'string', format: 'date-time' },
              responseTime: { type: 'number' },
              failureCount: { type: 'number' },
              lastFailureReason: { type: 'string' },
            },
          },
        },
      },
    },
  })
  async getServiceStatus() {
    try {
      const status = this.failoverMechanismsService.getAllServiceStatuses();

      return {
        success: true,
        data: status,
      };
    } catch (error) {
      this.logger.error(`Failed to get service status: ${error.message}`);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  @Get('failover/events')
  @ApiOperation({
    summary: 'Get failover events',
    description: 'Get recent failover events',
  })
  @ApiQuery({
    name: 'limit',
    description: 'Number of events to return (default: 20)',
    required: false,
  })
  @ApiResponse({
    status: 200,
    description: 'Failover events retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean' },
        data: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              timestamp: { type: 'string', format: 'date-time' },
              fromService: { type: 'string' },
              toService: { type: 'string' },
              reason: { type: 'string' },
              duration: { type: 'number' },
            },
          },
        },
      },
    },
  })
  async getFailoverEvents(@Query('limit') limit?: string) {
    try {
      const limitNum = limit ? parseInt(limit, 10) : 20;
      const events = this.failoverMechanismsService.getFailoverEvents(limitNum);

      return {
        success: true,
        data: events,
      };
    } catch (error) {
      this.logger.error(`Failed to get failover events: ${error.message}`);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  // PERFORMANCE MONITORING ENDPOINTS

  @Post('performance/configure')
  @ApiOperation({
    summary: 'Configure performance monitoring',
    description: 'Configure performance monitoring with specified settings',
  })
  @ApiBody({
    description: 'Performance monitoring configuration',
    schema: {
      type: 'object',
      properties: {
        metricsCollection: {
          type: 'object',
          properties: {
            interval: { type: 'number' },
            retentionPeriod: { type: 'number' },
          },
          required: ['interval', 'retentionPeriod'],
        },
        alerting: {
          type: 'object',
          properties: {
            enableAlerts: { type: 'boolean' },
            thresholds: {
              type: 'object',
              properties: {
                cpuUtilization: { type: 'number' },
                memoryUtilization: { type: 'number' },
                responseTime: { type: 'number' },
                errorRate: { type: 'number' },
                throughput: { type: 'number' },
              },
            },
            notificationChannels: {
              type: 'array',
              items: { type: 'string' },
            },
          },
          required: ['enableAlerts', 'thresholds', 'notificationChannels'],
        },
        sampling: {
          type: 'object',
          properties: {
            requestSamplingRate: { type: 'number' },
            traceSamplingRate: { type: 'number' },
          },
          required: ['requestSamplingRate', 'traceSamplingRate'],
        },
      },
      required: ['metricsCollection', 'alerting', 'sampling'],
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Performance monitoring configured successfully',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean' },
        message: { type: 'string' },
      },
    },
  })
  async configurePerformanceMonitoring(@Body() body: any) {
    try {
      const requiredSections = ['metricsCollection', 'alerting', 'sampling'];
      
      for (const section of requiredSections) {
        if (!body[section]) {
          throw new BadRequestException(`Missing required section: ${section}`);
        }
      }

      this.performanceMonitoringService.configure(body);
      this.performanceMonitoringService.startMonitoring();

      return {
        success: true,
        message: 'Performance monitoring configured and monitoring started successfully',
      };
    } catch (error) {
      this.logger.error(`Failed to configure performance monitoring: ${error.message}`);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  @Get('performance/system-metrics')
  @ApiOperation({
    summary: 'Get system metrics',
    description: 'Get recent system metrics',
  })
  @ApiQuery({
    name: 'limit',
    description: 'Number of metrics to return (default: 100)',
    required: false,
  })
  @ApiResponse({
    status: 200,
    description: 'System metrics retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean' },
        data: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              timestamp: { type: 'string', format: 'date-time' },
              cpu: {
                type: 'object',
                properties: {
                  utilization: { type: 'number' },
                  loadAverage: { type: 'number' },
                  cores: { type: 'number' },
                },
              },
              memory: {
                type: 'object',
                properties: {
                  used: { type: 'number' },
                  total: { type: 'number' },
                  utilization: { type: 'number' },
                },
              },
              disk: {
                type: 'object',
                properties: {
                  used: { type: 'number' },
                  total: { type: 'number' },
                  utilization: { type: 'number' },
                },
              },
              network: {
                type: 'object',
                properties: {
                  in: { type: 'number' },
                  out: { type: 'number' },
                },
              },
            },
          },
        },
      },
    },
  })
  async getSystemMetrics(@Query('limit') limit?: string) {
    try {
      const limitNum = limit ? parseInt(limit, 10) : 100;
      const metrics = this.performanceMonitoringService.getSystemMetrics(limitNum);

      return {
        success: true,
        data: metrics,
      };
    } catch (error) {
      this.logger.error(`Failed to get system metrics: ${error.message}`);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  @Get('performance/application-metrics')
  @ApiOperation({
    summary: 'Get application metrics',
    description: 'Get recent application metrics',
  })
  @ApiQuery({
    name: 'limit',
    description: 'Number of metrics to return (default: 100)',
    required: false,
  })
  @ApiResponse({
    status: 200,
    description: 'Application metrics retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean' },
        data: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              timestamp: { type: 'string', format: 'date-time' },
              requests: {
                type: 'object',
                properties: {
                  total: { type: 'number' },
                  successful: { type: 'number' },
                  failed: { type: 'number' },
                  errorRate: { type: 'number' },
                },
              },
              responseTimes: {
                type: 'object',
                properties: {
                  avg: { type: 'number' },
                  p50: { type: 'number' },
                  p90: { type: 'number' },
                  p95: { type: 'number' },
                  p99: { type: 'number' },
                },
              },
              throughput: {
                type: 'object',
                properties: {
                  requestsPerSecond: { type: 'number' },
                  currentRPS: { type: 'number' },
                },
              },
            },
          },
        },
      },
    },
  })
  async getApplicationMetrics(@Query('limit') limit?: string) {
    try {
      const limitNum = limit ? parseInt(limit, 10) : 100;
      const metrics = this.performanceMonitoringService.getApplicationMetrics(limitNum);

      return {
        success: true,
        data: metrics,
      };
    } catch (error) {
      this.logger.error(`Failed to get application metrics: ${error.message}`);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  @Get('performance/alerts')
  @ApiOperation({
    summary: 'Get performance alerts',
    description: 'Get recent performance alerts',
  })
  @ApiQuery({
    name: 'limit',
    description: 'Number of alerts to return (default: 50)',
    required: false,
  })
  @ApiQuery({
    name: 'includeResolved',
    description: 'Include resolved alerts (default: false)',
    required: false,
  })
  @ApiResponse({
    status: 200,
    description: 'Performance alerts retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean' },
        data: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              id: { type: 'string' },
              level: { type: 'string', enum: ['info', 'warning', 'critical'] },
              metric: { type: 'string' },
              currentValue: { type: 'number' },
              threshold: { type: 'number' },
              message: { type: 'string' },
              timestamp: { type: 'string', format: 'date-time' },
              resolved: { type: 'boolean' },
              resolvedAt: { type: 'string', format: 'date-time' },
            },
          },
        },
      },
    },
  })
  async getPerformanceAlerts(
    @Query('limit') limit?: string,
    @Query('includeResolved') includeResolved?: string
  ) {
    try {
      const limitNum = limit ? parseInt(limit, 10) : 50;
      const includeResolvedBool = includeResolved === 'true';
      const alerts = this.performanceMonitoringService.getAlerts(limitNum, includeResolvedBool);

      return {
        success: true,
        data: alerts,
      };
    } catch (error) {
      this.logger.error(`Failed to get performance alerts: ${error.message}`);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  @Get('performance/summary')
  @ApiOperation({
    summary: 'Get performance summary',
    description: 'Get performance summary',
  })
  @ApiResponse({
    status: 200,
    description: 'Performance summary retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean' },
        data: {
          type: 'object',
          properties: {
            timestamp: { type: 'string', format: 'date-time' },
            system: {
              type: 'object',
              properties: {
                cpu: {
                  type: 'object',
                  properties: {
                    utilization: { type: 'string' },
                    loadAverage: { type: 'string' },
                  },
                },
                memory: {
                  type: 'object',
                  properties: {
                    utilization: { type: 'string' },
                    used: { type: 'string' },
                    total: { type: 'string' },
                  },
                },
              },
            },
            application: {
              type: 'object',
              properties: {
                requests: {
                  type: 'object',
                  properties: {
                    total: { type: 'number' },
                    errorRate: { type: 'string' },
                  },
                },
                responseTime: {
                  type: 'object',
                  properties: {
                    average: { type: 'string' },
                  },
                },
                throughput: {
                  type: 'object',
                  properties: {
                    rps: { type: 'string' },
                  },
                },
              },
            },
            alerts: {
              type: 'object',
              properties: {
                total: { type: 'number' },
                critical: { type: 'number' },
              },
            },
          },
        },
      },
    },
  })
  async getPerformanceSummary() {
    try {
      const summary = this.performanceMonitoringService.getPerformanceSummary();

      return {
        success: true,
        data: summary,
      };
    } catch (error) {
      this.logger.error(`Failed to get performance summary: ${error.message}`);
      return {
        success: false,
        error: error.message,
      };
    }
  }
}