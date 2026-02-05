import { Injectable, Logger } from '@nestjs/common';
import { StateManagementService } from '../../../state/state-management.service';
import { WebSocketGatewayService } from '../../../websocket/websocket.gateway';
import { AgentAnalyticsReporterService } from '../../agent-analytics-reporter/services/agent-analytics-reporter.service';
import {
  HistoricalComparisonResult,
  Bottleneck,
  Recommendation,
} from '../interfaces/metrics.interface';

@Injectable()
export class MetaMetricsService {
  private readonly logger = new Logger(MetaMetricsService.name);
  private agentesRegistrados: string[] = [
    'trend-scanner',
    'video-scriptor',
    'faq-responder',
    'post-scheduler',
    'analytics-reporter',
    'front-desk',
  ];
  private historicoMetricas: any[] = [];

  constructor(
    private readonly stateManager: StateManagementService,
    private readonly websocketGateway: WebSocketGatewayService,
    private readonly analyticsReporter: AgentAnalyticsReporterService,
  ) {}

  async getAggregateMetrics() {
    this.logger.log('Obteniendo m tricas agregadas de todos los agentes');

    // Obtener m tricas de todos los agentes
    const metricsCollection = {};
    for (const agent of this.agentesRegistrados) {
      metricsCollection[agent] = await this.getAgentMetrics(agent);
    }

    // Generar m tricas compuestas
    const compositeMetrics = this.generateCompositeMetrics(metricsCollection);

    // Guardar en hist rico
    const metricaHistorica = {
      timestamp: new Date().toISOString(),
      metrics: metricsCollection,
      compositeMetrics,
    };
    this.historicoMetricas.push(metricaHistorica);

    // Mantener solo las  ltimas 100 entradas
    if (this.historicoMetricas.length > 100) {
      this.historicoMetricas.shift();
    }

    return metricaHistorica;
  }

  async getAgentMetrics(agent: string) {
    this.logger.log(`Obteniendo m tricas para el agente: ${agent}`);

    // Para el agente analytics-reporter, obtener datos reales
    if (agent === 'analytics-reporter') {
      try {
        const reports = await this.analyticsReporter.findAll();
        return {
          agent,
          metrics: {
            reportsGenerated: reports.length,
            dataPoints: reports.reduce(
              (sum, report) => sum + (report.reportData?.stats?.length || 0),
              0,
            ),
            lastReport:
              reports.length > 0 ? reports[reports.length - 1].createdAt : null,
          },
          reports,
        };
      } catch (error) {
        this.logger.error(
          `Error obteniendo m tricas de analytics-reporter: ${error.message}`,
        );
      }
    }

    // Para otros agentes, simular m tricas
    const metrics = {
      requestsProcessed: Math.floor(Math.random() * 1000),
      successRate: Math.random() * 100,
      avgResponseTime: Math.floor(Math.random() * 5000),
      errors: Math.floor(Math.random() * 50),
      lastActive: new Date(
        Date.now() - Math.floor(Math.random() * 3600000),
      ).toISOString(),
    };

    return {
      agent,
      metrics,
    };
  }

  async generateInsights(params: any) {
    this.logger.log('Generando insights a partir de m tricas');

    // Obtener m tricas agregadas
    const aggregateMetrics = await this.getAggregateMetrics();

    // Comparar con campa as anteriores si se solicita
    let comparacionHistorica: HistoricalComparisonResult | null = null;
    if (params.compareWithHistorical) {
      comparacionHistorica = this.compararConHistorico(aggregateMetrics);
    }

    // Generar insights espec ficos
    const insights = this.calculateAdvancedMetrics(aggregateMetrics);

    // Notificar mediante WebSocket
    this.websocketGateway.broadcastSystemNotification({
      type: 'metrics_insights',
      data: {
        ...insights,
        historicalComparison: comparacionHistorica,
      },
      timestamp: new Date().toISOString(),
    });

    return {
      status: 'success',
      insights,
      historicalComparison: comparacionHistorica,
      timestamp: new Date().toISOString(),
    };
  }

  private compararConHistorico(metricasActuales: any) {
    this.logger.log('Comparando m tricas con hist rico');

    if (this.historicoMetricas.length === 0) {
      return {
        message: 'No hay datos hist ricos para comparar',
      };
    }

    // Tomar la  ltima entrada del hist rico para comparar
    const metricasHistoricas =
      this.historicoMetricas[this.historicoMetricas.length - 1];

    // Comparar m tricas compuestas
    const comparacion = {
      viralResonanceIndex: {
        actual: metricasActuales.compositeMetrics.viralResonanceIndex,
        historico: metricasHistoricas.compositeMetrics.viralResonanceIndex,
        cambio:
          metricasActuales.compositeMetrics.viralResonanceIndex -
          metricasHistoricas.compositeMetrics.viralResonanceIndex,
      },
      emotionalActivationRate: {
        actual: metricasActuales.compositeMetrics.emotionalActivationRate,
        historico: metricasHistoricas.compositeMetrics.emotionalActivationRate,
        cambio:
          metricasActuales.compositeMetrics.emotionalActivationRate -
          metricasHistoricas.compositeMetrics.emotionalActivationRate,
      },
    };

    const result: HistoricalComparisonResult = {
      comparisonPeriod: metricasHistoricas.timestamp,
      metrics: comparacion,
      improvement:
        comparacion.viralResonanceIndex.cambio > 0 &&
        comparacion.emotionalActivationRate.cambio > 0,
    };

    return result;
  }

  private generateCompositeMetrics(metricsCollection: any) {
    this.logger.log('Generando m tricas compuestas');

    // Calcular  ndice de Resonancia Viral
    const viralResonanceIndex =
      this.calculateViralResonanceIndex(metricsCollection);

    // Calcular Tasa de Activaci n Emocional
    const emotionalActivationRate =
      this.calculateEmotionalActivationRate(metricsCollection);

    // Calcular Curva de Escalabilidad de Contenido
    const contentScalabilityCurve =
      this.calculateContentScalabilityCurve(metricsCollection);

    return {
      viralResonanceIndex,
      emotionalActivationRate,
      contentScalabilityCurve,
    };
  }

  private calculateViralResonanceIndex(metricsCollection: any) {
    // F rmula simplificada para el  ndice de Resonancia Viral
    // Basada en tasa de  xito, tiempo de respuesta y actividad reciente
    let totalResonance = 0;
    let agentCount = 0;

    for (const agent in metricsCollection) {
      const metrics = metricsCollection[agent].metrics;
      // Verificar que las m tricas existan antes de usarlas
      if (
        metrics &&
        metrics.successRate !== undefined &&
        metrics.avgResponseTime !== undefined &&
        metrics.lastActive
      ) {
        const resonance =
          (metrics.successRate / 100) * 0.5 +
          (1 - metrics.avgResponseTime / 5000) * 0.3 +
          ((new Date().getTime() - new Date(metrics.lastActive).getTime()) /
            (24 * 3600 * 1000)) *
            0.2;

        totalResonance += Math.max(0, resonance); // Asegurar que no sea negativo
        agentCount++;
      }
    }

    return agentCount > 0 ? totalResonance / agentCount : 0;
  }

  private calculateEmotionalActivationRate(metricsCollection: any) {
    // F rmula simplificada para la Tasa de Activaci n Emocional
    // Basada en interacciones de agentes orientados al usuario
    const emotionalAgents = ['faq-responder', 'front-desk'];
    let totalActivation = 0;
    let count = 0;

    for (const agent of emotionalAgents) {
      if (metricsCollection[agent]) {
        const metrics = metricsCollection[agent].metrics;
        // Verificar que las m tricas existan antes de usarlas
        if (
          metrics &&
          metrics.successRate !== undefined &&
          metrics.avgResponseTime !== undefined
        ) {
          const activation =
            (metrics.successRate / 100) * 0.7 +
            (1 - metrics.avgResponseTime / 5000) * 0.3;

          totalActivation += Math.max(0, activation);
          count++;
        }
      }
    }

    return count > 0 ? totalActivation / count : 0;
  }

  private calculateContentScalabilityCurve(metricsCollection: any) {
    // F rmula simplificada para la Curva de Escalabilidad de Contenido
    // Basada en capacidad de procesamiento de agentes de contenido
    const contentAgents = ['trend-scanner', 'video-scriptor', 'post-scheduler'];
    const scalabilityMetrics = {};

    for (const agent of contentAgents) {
      if (metricsCollection[agent]) {
        const metrics = metricsCollection[agent].metrics;
        // Verificar que las m tricas existan antes de usarlas
        if (
          metrics &&
          metrics.requestsProcessed !== undefined &&
          metrics.successRate !== undefined
        ) {
          // Calcular escalabilidad basada en capacidad de procesamiento
          scalabilityMetrics[agent] = {
            processingCapacity: metrics.requestsProcessed,
            efficiency: metrics.successRate,
            scalabilityScore:
              (metrics.requestsProcessed / 1000) * (metrics.successRate / 100),
          };
        }
      }
    }

    return scalabilityMetrics;
  }

  private calculateAdvancedMetrics(aggregateMetrics: any) {
    // Calcular m tricas avanzadas a partir de las m tricas agregadas
    const insights = {
      systemHealth: this.calculateSystemHealth(aggregateMetrics),
      performanceTrends: this.calculatePerformanceTrends(aggregateMetrics),
      bottleneckDetection: this.detectBottlenecks(aggregateMetrics),
      optimizationRecommendations:
        this.generateOptimizationRecommendations(aggregateMetrics),
    };

    return insights;
  }

  private calculateSystemHealth(aggregateMetrics: any) {
    // Calcular salud general del sistema
    const totalErrors = Object.values(aggregateMetrics.metrics).reduce(
      (sum, agentMetrics: any) => sum + (agentMetrics.metrics?.errors || 0),
      0,
    ) as number;

    const totalRequests = Object.values(aggregateMetrics.metrics).reduce(
      (sum, agentMetrics: any) =>
        sum + (agentMetrics.metrics?.requestsProcessed || 0),
      0,
    ) as number;

    const errorRate = totalRequests > 0 ? totalErrors / totalRequests : 0;

    return {
      healthScore: Math.max(0, 100 - errorRate * 100),
      errorRate: errorRate * 100,
      totalErrors,
      totalRequests,
    };
  }

  private calculatePerformanceTrends(aggregateMetrics: any) {
    // Calcular tendencias de rendimiento (simplificado)
    const validMetrics = Object.values(aggregateMetrics.metrics).filter(
      (agentMetrics: any) =>
        agentMetrics.metrics?.avgResponseTime !== undefined,
    ) as any[];

    if (validMetrics.length === 0) {
      return {
        avgResponseTime: 0,
        trend: 'unknown',
      };
    }

    const avgResponseTime =
      validMetrics.reduce(
        (sum, agentMetrics: any) => sum + agentMetrics.metrics.avgResponseTime,
        0,
      ) / validMetrics.length;

    return {
      avgResponseTime,
      trend:
        avgResponseTime < 2000
          ? 'improving'
          : avgResponseTime < 4000
            ? 'stable'
            : 'degrading',
    };
  }

  private detectBottlenecks(aggregateMetrics: any) {
    // Detectar cuellos de botella en agentes
    const bottlenecks: Bottleneck[] = [];

    for (const [agent, metricsData] of Object.entries(
      aggregateMetrics.metrics,
    )) {
      const metrics: any = metricsData;
      if (
        metrics.metrics?.avgResponseTime > 4000 ||
        metrics.metrics?.successRate < 80
      ) {
        bottlenecks.push({
          agent,
          issue:
            metrics.metrics.avgResponseTime > 4000
              ? 'high_response_time'
              : 'low_success_rate',
          value:
            metrics.metrics.avgResponseTime > 4000
              ? metrics.metrics.avgResponseTime
              : metrics.metrics.successRate,
        });
      }
    }

    return bottlenecks;
  }

  private generateOptimizationRecommendations(aggregateMetrics: any) {
    // Generar recomendaciones de optimizaci n
    const recommendations: Recommendation[] = [];

    // Recomendaci n basada en errores
    const systemHealth = this.calculateSystemHealth(aggregateMetrics);
    if (systemHealth.errorRate > 5) {
      recommendations.push({
        type: 'error_reduction',
        priority: 'high',
        description: 'Tasa de error alta detectada. Revisar logs de agentes.',
      });
    }

    // Recomendaci n basada en tiempo de respuesta
    const performanceTrends = this.calculatePerformanceTrends(aggregateMetrics);
    if (performanceTrends.trend === 'degrading') {
      recommendations.push({
        type: 'performance_optimization',
        priority: 'medium',
        description:
          'Tiempo de respuesta degrad ndose. Considerar escalado horizontal.',
      });
    }

    return recommendations;
  }
}
