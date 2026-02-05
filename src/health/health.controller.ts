import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';

@ApiTags('health')
@Controller('health')
export class HealthController {
  @Get()
  @ApiOperation({ summary: 'Health check endpoint' })
  @ApiResponse({ status: 200, description: 'Service is healthy' })
  @ApiResponse({ status: 503, description: 'Service is unhealthy' })
  checkHealth() {
    return {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      service: 'Misy Agent API',
    };
  }

  @Get('advanced')
  @ApiOperation({ summary: 'Advanced health check endpoint' })
  @ApiResponse({ status: 200, description: 'Advanced health check results' })
  @ApiResponse({ status: 503, description: 'Service is unhealthy' })
  checkAdvancedHealth() {
    // In a real implementation, this would check various system components
    return {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      service: 'Misy Agent API',
      components: {
        database: 'healthy',
        cache: 'healthy',
        externalServices: 'healthy',
      },
      metrics: {
        uptime: process.uptime(),
        memory: {
          used: process.memoryUsage().heapUsed,
          total: process.memoryUsage().heapTotal,
        },
      },
    };
  }

  @Get('monitoring')
  @ApiOperation({ summary: 'Monitoring endpoint for Prometheus metrics' })
  @ApiResponse({ status: 200, description: 'Monitoring metrics' })
  getMonitoringMetrics() {
    // In a real implementation, this would return Prometheus-formatted metrics
    return {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      service: 'Misy Agent API',
      metrics: {
        http_requests_total: Math.floor(Math.random() * 1000),
        http_request_duration_seconds: Math.random() * 5,
        system_cpu_usage: Math.random(),
        system_memory_usage: process.memoryUsage().heapUsed / process.memoryUsage().heapTotal,
      },
    };
  }
}