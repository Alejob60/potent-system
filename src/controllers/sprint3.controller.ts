import { Controller, Post, Get, Param, Body, Query } from '@nestjs/common';
import { ViralizationPipelineService } from '../services/viralization-pipeline/viralization-pipeline.service';
import { HeartbeatMonitoringService } from '../services/heartbeat-monitoring/heartbeat-monitoring.service';

@Controller('sprint3')
export class Sprint3Controller {
  constructor(
    private readonly pipelineService: ViralizationPipelineService,
    private readonly monitoringService: HeartbeatMonitoringService,
  ) {}

  /**
   * Endpoint principal: Ejecutar pipeline de viralización completo
   */
  @Post('pipeline/execute')
  async executeViralizationPipeline(@Body() body: any) {
    const {
      tenantId = 'default-tenant',
      sessionId = `session-${Date.now()}`,
      userId,
      inputData
    } = body;

    try {
      const result = await this.pipelineService.executeViralizationPipeline(
        tenantId,
        sessionId,
        inputData,
        userId
      );

      return {
        success: true,
        message: 'Pipeline de viralización ejecutado exitosamente',
        result
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        message: 'Error ejecutando pipeline de viralización'
      };
    }
  }

  /**
   * Obtener estado de una ejecución específica
   */
  @Get('pipeline/execution/:executionId')
  async getPipelineExecution(@Param('executionId') executionId: string) {
    try {
      const execution = await this.pipelineService.getPipelineExecution(executionId);
      
      if (!execution) {
        return {
          success: false,
          message: 'Ejecución no encontrada'
        };
      }

      return {
        success: true,
        execution
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Obtener todas las ejecuciones de un tenant
   */
  @Get('pipeline/executions/tenant/:tenantId')
  async getTenantExecutions(@Param('tenantId') tenantId: string) {
    try {
      const executions = await this.pipelineService.getTenantExecutions(tenantId);
      
      return {
        success: true,
        executions,
        count: executions.length
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Obtener métricas del pipeline
   */
  @Get('pipeline/metrics')
  async getPipelineMetrics() {
    try {
      const metrics = await this.pipelineService.getPipelineMetrics();
      
      return {
        success: true,
        metrics
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Endpoint de monitoreo: Obtener estado de salud del sistema
   */
  @Get('monitoring/health')
  async getSystemHealth() {
    try {
      const health = await this.monitoringService.getSystemHealth();
      
      return {
        success: true,
        health
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Obtener estadísticas de alertas
   */
  @Get('monitoring/alerts/stats')
  async getAlertStats() {
    try {
      const stats = await this.monitoringService.getAlertStats();
      
      return {
        success: true,
        stats
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Obtener historial de un agente específico
   */
  @Get('monitoring/agent/:agentId/history')
  async getAgentHistory(
    @Param('agentId') agentId: string,
    @Query('hours') hours: string = '24'
  ) {
    try {
      const history = await this.monitoringService.getAgentHistory(agentId, parseInt(hours));
      
      if (!history) {
        return {
          success: false,
          message: 'Agente no encontrado'
        };
      }

      return {
        success: true,
        history
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Simular heartbeat de un agente
   */
  @Post('monitoring/agent/:agentId/heartbeat')
  async simulateAgentHeartbeat(
    @Param('agentId') agentId: string,
    @Body() body: any
  ) {
    try {
      const heartbeatData = {
        agentName: body.agentName || agentId,
        responseTime: body.responseTime || Math.floor(Math.random() * 1000),
        timestamp: Date.now(),
        metrics: body.metrics || {
          requestsProcessed: 1,
          successRate: 99.5,
          avgResponseTime: 150,
          errorRate: 0.5,
          memoryUsage: Math.floor(Math.random() * 500) + 100,
          cpuUsage: Math.floor(Math.random() * 50) + 10
        }
      };

      await this.monitoringService.processHeartbeat(agentId, heartbeatData);

      return {
        success: true,
        message: `Heartbeat procesado para agente ${agentId}`
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Simular error de un agente
   */
  @Post('monitoring/agent/:agentId/error')
  async simulateAgentError(
    @Param('agentId') agentId: string,
    @Body() body: { message: string }
  ) {
    try {
      const error = new Error(body.message || 'Error simulado del agente');
      await this.monitoringService.processAgentError(agentId, error);

      return {
        success: true,
        message: `Error procesado para agente ${agentId}`
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Endpoint de prueba: Pipeline simplificado
   */
  @Post('pipeline/test')
  async testSimplePipeline(@Body() body: any) {
    const testData = {
      tenantId: body.tenantId || 'test-tenant',
      sessionId: body.sessionId || `test-session-${Date.now()}`,
      inputData: {
        topics: ['technology', 'innovation'],
        platforms: ['instagram', 'tiktok'],
        style: 'educational',
        duration: 60
      }
    };

    try {
      const result = await this.pipelineService.executeViralizationPipeline(
        testData.tenantId,
        testData.sessionId,
        testData.inputData
      );

      return {
        success: true,
        message: 'Pipeline de prueba ejecutado exitosamente',
        testData,
        result
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        testData
      };
    }
  }

  /**
   * Endpoint de demostración: Todos los servicios
   */
  @Get('demo/status')
  async getDemoStatus() {
    try {
      const pipelineMetrics = await this.pipelineService.getPipelineMetrics();
      const systemHealth = await this.monitoringService.getSystemHealth();
      const alertStats = await this.monitoringService.getAlertStats();

      return {
        success: true,
        timestamp: new Date().toISOString(),
        services: {
          pipeline: {
            status: 'operational',
            metrics: pipelineMetrics
          },
          monitoring: {
            status: 'operational',
            health: systemHealth.overallStatus,
            alerts: alertStats.activeAlerts
          }
        },
        message: 'Todos los servicios del Sprint 3 están operativos'
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        timestamp: new Date().toISOString()
      };
    }
  }
}