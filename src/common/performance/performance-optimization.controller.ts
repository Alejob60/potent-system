import {
  Controller,
  Get,
  Post,
  Body,
  HttpCode,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
} from '@nestjs/swagger';
import { PerformanceOptimizationService } from './performance-optimization.service';

@ApiTags('Performance Optimization')
@Controller('api/performance')
export class PerformanceOptimizationController {
  private readonly logger = new Logger(PerformanceOptimizationController.name);

  constructor(
    private readonly performanceOptimizationService: PerformanceOptimizationService,
  ) {}

  @Get('status')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get performance optimization status' })
  @ApiResponse({
    status: 200,
    description: 'Performance optimization status retrieved successfully',
  })
  async getStatus() {
    this.logger.log('Retrieving performance optimization status');
    
    try {
      const poolStatus = this.performanceOptimizationService.getPoolStatus();
      
      return {
        success: true,
        data: {
          poolStatus,
          timestamp: new Date().toISOString(),
        },
      };
    } catch (error) {
      this.logger.error('Failed to retrieve performance optimization status', error.message);
      
      return {
        success: false,
        error: error.message,
        message: 'Failed to retrieve performance optimization status',
      };
    }
  }

  @Post('analyze-query')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Analyze query performance and provide recommendations' })
  @ApiResponse({
    status: 200,
    description: 'Query performance analysis completed successfully',
  })
  @ApiResponse({ status: 400, description: 'Invalid input data' })
  async analyzeQuery(
    @Body() body: { tableName: string; columns: string[] },
  ) {
    this.logger.log('Analyzing query performance', { body });
    
    try {
      const result = await this.performanceOptimizationService.analyzeQueryPerformance(
        body.tableName,
        body.columns,
      );
      
      return {
        success: true,
        data: result,
      };
    } catch (error) {
      this.logger.error('Failed to analyze query performance', error.message);
      
      return {
        success: false,
        error: error.message,
        message: 'Failed to analyze query performance',
      };
    }
  }

  @Post('optimized-query')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Execute an optimized query with caching' })
  @ApiResponse({
    status: 200,
    description: 'Optimized query executed successfully',
  })
  @ApiResponse({ status: 400, description: 'Invalid input data' })
  async executeOptimizedQuery(
    @Body() body: { query: string; params?: any[]; cacheKey?: string },
  ) {
    this.logger.log('Executing optimized query', { 
      query: body.query.substring(0, 100) + '...',
      hasParams: !!body.params,
      hasCacheKey: !!body.cacheKey,
    });
    
    try {
      const result = await this.performanceOptimizationService.optimizedQuery(
        body.query,
        body.params,
        body.cacheKey,
      );
      
      return {
        success: true,
        data: result,
        message: 'Query executed successfully',
      };
    } catch (error) {
      this.logger.error('Failed to execute optimized query', error.message);
      
      return {
        success: false,
        error: error.message,
        message: 'Failed to execute optimized query',
      };
    }
  }

  @Post('batch-redis')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Execute batch Redis operations' })
  @ApiResponse({
    status: 200,
    description: 'Batch Redis operations executed successfully',
  })
  @ApiResponse({ status: 400, description: 'Invalid input data' })
  async batchRedisOperations(
    @Body() body: { operations: Array<{key: string, value: string, ttl?: number}> },
  ) {
    this.logger.log('Executing batch Redis operations', { 
      operationCount: body.operations.length,
    });
    
    try {
      await this.performanceOptimizationService.batchRedisOperations(body.operations);
      
      return {
        success: true,
        message: `Executed ${body.operations.length} Redis operations successfully`,
      };
    } catch (error) {
      this.logger.error('Failed to execute batch Redis operations', error.message);
      
      return {
        success: false,
        error: error.message,
        message: 'Failed to execute batch Redis operations',
      };
    }
  }
}