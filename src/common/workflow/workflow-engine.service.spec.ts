import { Test, TestingModule } from '@nestjs/testing';
import { WorkflowEngineService } from './workflow-engine.service';
import { AgentConnectorService } from '../orchestrator/agent-connector.service';
import { WebSocketGatewayService } from '../../websocket/websocket.gateway';
import { StateManagementService } from '../../state/state-management.service';
import { PipelineStep, PipelineContext, StepResult } from './pipeline-step.interface';

describe('WorkflowEngineService', () => {
  let service: WorkflowEngineService;
  let agentConnector: AgentConnectorService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        WorkflowEngineService,
        {
          provide: AgentConnectorService,
          useValue: {
            post: jest.fn(),
          },
        },
        {
          provide: WebSocketGatewayService,
          useValue: {
            broadcastSystemNotification: jest.fn(),
          },
        },
        {
          provide: StateManagementService,
          useValue: {
            addConversationEntry: jest.fn(),
            getSession: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<WorkflowEngineService>(WorkflowEngineService);
    agentConnector = module.get<AgentConnectorService>(AgentConnectorService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createWorkflow', () => {
    it('should create a workflow definition', () => {
      const steps: PipelineStep[] = [
        {
          id: 'step1',
          name: 'Test Step',
          description: 'A test step',
          agent: 'test-agent',
          input: {},
          execute: jest.fn() as any,
        },
      ];

      const workflow = service.createWorkflow('Test Workflow', 'A test workflow', steps);

      expect(workflow).toBeDefined();
      expect(workflow.name).toBe('Test Workflow');
      expect(workflow.description).toBe('A test workflow');
      expect(workflow.steps).toBe(steps);
      expect(workflow.id).toBeDefined();
      expect(workflow.version).toBe('1.0.0');
    });
  });

  describe('validateWorkflow', () => {
    it('should validate a workflow with unique step IDs', () => {
      const steps: PipelineStep[] = [
        {
          id: 'step1',
          name: 'Step 1',
          description: 'First step',
          agent: 'test-agent',
          input: {},
          execute: jest.fn() as any,
        },
        {
          id: 'step2',
          name: 'Step 2',
          description: 'Second step',
          agent: 'test-agent',
          input: {},
          execute: jest.fn() as any,
        },
      ];

      const workflow = service.createWorkflow('Test Workflow', 'A test workflow', steps);
      const isValid = service.validateWorkflow(workflow);

      expect(isValid).toBe(true);
    });

    it('should reject a workflow with duplicate step IDs', () => {
      const steps: PipelineStep[] = [
        {
          id: 'step1',
          name: 'Step 1',
          description: 'First step',
          agent: 'test-agent',
          input: {},
          execute: jest.fn() as any,
        },
        {
          id: 'step1', // Duplicate ID
          name: 'Step 2',
          description: 'Second step',
          agent: 'test-agent',
          input: {},
          execute: jest.fn() as any,
        },
      ];

      const workflow = service.createWorkflow('Test Workflow', 'A test workflow', steps);
      const isValid = service.validateWorkflow(workflow);

      expect(isValid).toBe(false);
    });
  });
});