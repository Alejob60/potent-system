import { AgentResult } from '../../agents/admin/services/admin-orchestrator.service';

export interface PipelineStep {
  /**
   * Unique identifier for the step
   */
  id: string;

  /**
   * Name of the step
   */
  name: string;

  /**
   * Description of what the step does
   */
  description: string;

  /**
   * The agent responsible for executing this step
   */
  agent: string;

  /**
   * Input data required for the step
   */
  input: Record<string, any>;

  /**
   * Expected output format
   */
  outputSchema?: Record<string, any>;

  /**
   * Timeout for the step execution in milliseconds
   */
  timeout?: number;

  /**
   * Retry configuration
   */
  retryConfig?: {
    maxAttempts: number;
    delay: number;
    backoffMultiplier: number;
  };

  /**
   * Dependencies - steps that must complete before this one
   */
  dependencies?: string[];

  /**
   * Whether this step can be executed in parallel with others
   */
  parallel?: boolean;

  /**
   * Priority level (higher number = higher priority)
   */
  priority?: number;

  /**
   * Execute the step
   * @param context Execution context
   * @returns Promise resolving to the step result
   */
  execute(context: PipelineContext): Promise<StepResult>;
}

export interface PipelineContext {
  /**
   * Session ID for the workflow
   */
  sessionId: string;

  /**
   * Shared data between steps
   */
  sharedData: Record<string, any>;

  /**
   * Results from previous steps
   */
  stepResults: Record<string, StepResult>;

  /**
   * Current user context
   */
  userContext?: Record<string, any>;
}

export interface StepResult {
  /**
   * Whether the step was successful
   */
  success: boolean;

  /**
   * Data returned by the step
   */
  data?: any;

  /**
   * Error information if the step failed
   */
  error?: {
    message: string;
    code?: string;
    details?: any;
  };

  /**
   * Metrics about the step execution
   */
  metrics?: {
    duration: number;
    startTime: Date;
    endTime: Date;
  };

  /**
   * Output from the agent
   */
  agentResult?: AgentResult;
}