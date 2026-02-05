import { Controller, Get, Sse } from '@nestjs/common';
import { interval, map, Observable } from 'rxjs';
import { OrchestratorMetricsService } from '../../../../common/orchestrator/orchestrator-metrics.service';
// Swagger imports
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
} from '@nestjs/swagger';

@ApiTags('orchestrator')
@Controller('orchestrator/dashboard')
export class OrchestratorDashboardV1Controller {
  constructor(private readonly metricsService: OrchestratorMetricsService) {}

  @Get()
  @ApiOperation({
    summary: 'Get orchestrator dashboard data',
    description: 'Retrieve comprehensive dashboard data for orchestrator monitoring',
  })
  @ApiResponse({
    status: 200,
    description: 'Dashboard data retrieved successfully',
  })
  async getDashboard() {
    return this.getDashboardData();
  }

  @Sse('live')
  @ApiOperation({
    summary: 'Stream live orchestrator metrics',
    description: 'Stream real-time orchestrator metrics via Server-Sent Events',
  })
  @ApiResponse({
    status: 200,
    description: 'Live metrics stream',
  })
  sse(): Observable<any> {
    return interval(5000).pipe(
      map(async () => {
        const data = await this.getDashboardData();
        return { data };
      }),
    );
  }

  private async getDashboardData() {
    const metrics = await this.metricsService.getMetrics();
    
    // Calculate success rate
    const successRate = metrics.workflowsExecuted > 0 
      ? (metrics.successfulWorkflows / metrics.workflowsExecuted) * 100 
      : 0;

    // Get top 5 agents by execution count
    const topAgents = Object.entries(metrics.agentMetrics)
      .sort(([,a], [,b]) => b.executions - a.executions)
      .slice(0, 5)
      .map(([name, agentMetrics]) => ({
        name,
        executions: agentMetrics.executions,
        successRate: agentMetrics.successRate,
        averageResponseTime: agentMetrics.averageResponseTime,
        errors: agentMetrics.errors,
      }));

    // Calculate agent health score
    const agentHealthScore = topAgents.length > 0 
      ? topAgents.reduce((sum, agent) => sum + agent.successRate, 0) / topAgents.length
      : 100;

    return {
      overview: {
        workflowsExecuted: metrics.workflowsExecuted,
        successfulWorkflows: metrics.successfulWorkflows,
        failedWorkflows: metrics.failedWorkflows,
        successRate: parseFloat(successRate.toFixed(2)),
        averageExecutionTime: metrics.averageExecutionTime,
        lastUpdated: metrics.lastUpdated,
      },
      agentPerformance: {
        healthScore: parseFloat(agentHealthScore.toFixed(2)),
        topPerformers: topAgents,
      },
      systemStatus: {
        status: metrics.failedWorkflows === 0 ? 'healthy' : 
               metrics.failedWorkflows < 5 ? 'degraded' : 'unhealthy',
        lastUpdated: metrics.lastUpdated,
      },
    };
  }
}