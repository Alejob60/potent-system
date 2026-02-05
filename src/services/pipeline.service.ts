import { Injectable, Logger } from '@nestjs/common';
import { RedisService } from '../common/redis/redis.service';

export enum PipelineStep {
  SCRIPT = 'SCRIPT',
  VOICE = 'VOICE',
  VIDEO = 'VIDEO',
  CAPTION = 'CAPTION',
  PUBLISHED = 'PUBLISHED'
}

export interface WorkOrder {
  id: string;
  tenantId: string;
  userId: string;
  currentStep: PipelineStep;
  totalSteps: number;
  steps: {
    [key in PipelineStep]?: {
      status: 'pending' | 'processing' | 'completed' | 'failed';
      data?: any;
      error?: string;
    };
  };
}

@Injectable()
export class PipelineService {
  private readonly logger = new Logger(PipelineService.name);

  constructor(private readonly redisService: RedisService) {}

  async createWorkOrder(tenantId: string, userId: string, title: string): Promise<WorkOrder> {
    const id = `wo_${Date.now()}`;
    const workOrder: WorkOrder = {
      id,
      tenantId,
      userId,
      currentStep: PipelineStep.SCRIPT,
      totalSteps: 4,
      steps: {
        [PipelineStep.SCRIPT]: { status: 'pending' },
        [PipelineStep.VOICE]: { status: 'pending' },
        [PipelineStep.VIDEO]: { status: 'pending' },
        [PipelineStep.CAPTION]: { status: 'pending' },
      }
    };

    await this.saveWorkOrder(workOrder);
    return workOrder;
  }

  async updateStep(id: string, step: PipelineStep, status: any, data?: any): Promise<WorkOrder> {
    const workOrder = await this.getWorkOrder(id);
    if (!workOrder) throw new Error(`Work Order ${id} not found`);

    workOrder.steps[step] = { ...workOrder.steps[step], status, data };
    workOrder.currentStep = step;

    await this.saveWorkOrder(workOrder);
    return workOrder;
  }

  async getWorkOrder(id: string): Promise<WorkOrder | null> {
    const data = await this.redisService.get(`workorder:${id}`);
    return data ? JSON.parse(data) : null;
  }

  private async saveWorkOrder(workOrder: WorkOrder) {
    await this.redisService.set(`workorder:${workOrder.id}`, JSON.stringify(workOrder), 86400); // 24h
  }

  getStepNumber(step: PipelineStep): number {
    const steps = [PipelineStep.SCRIPT, PipelineStep.VOICE, PipelineStep.VIDEO, PipelineStep.CAPTION];
    return steps.indexOf(step) + 1;
  }
}
