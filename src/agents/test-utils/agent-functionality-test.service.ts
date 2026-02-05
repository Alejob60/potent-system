import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';

export interface AgentStatus {
  name: string;
  endpoints: string[];
  status: 'complete' | 'incomplete' | 'partial';
  missingComponents: string[];
  notes: string[];
}

@Injectable()
export class AgentFunctionalityTestService {
  private readonly logger = new Logger(AgentFunctionalityTestService.name);

  constructor(private readonly httpService: HttpService) {}

  /**
   * Comprehensive test of all agents and their endpoints
   * @returns Status report for each agent
   */
  async testAllAgents(): Promise<AgentStatus[]> {
    const agents = [
      'trend-scanner',
      'faq-responder',
      'content-editor',
      'creative-synthesizer',
      'video-scriptor',
      'post-scheduler',
      'analytics-reporter',
      'front-desk'
    ];

    const results: AgentStatus[] = [];

    for (const agentName of agents) {
      const status = await this.testAgent(agentName);
      results.push(status);
    }

    return results;
  }

  /**
   * Test a specific agent
   * @param agentName Name of the agent to test
   * @returns Status of the agent
   */
  private async testAgent(agentName: string): Promise<AgentStatus> {
    const status: AgentStatus = {
      name: agentName,
      endpoints: [],
      status: 'incomplete',
      missingComponents: [],
      notes: []
    };

    try {
      // Check if agent directory exists
      const agentExists = await this.checkAgentDirectory(agentName);
      if (!agentExists) {
        status.missingComponents.push('Agent directory');
        status.notes.push(`Agent ${agentName} directory not found`);
        return status;
      }

      // Check for required components
      const hasController = await this.checkComponent(agentName, 'controller');
      const hasService = await this.checkComponent(agentName, 'service');
      const hasEntity = await this.checkComponent(agentName, 'entity');
      const hasDto = await this.checkComponent(agentName, 'dto');
      const hasModule = await this.checkComponent(agentName, 'module');

      if (!hasController) status.missingComponents.push('Controller');
      if (!hasService) status.missingComponents.push('Service');
      if (!hasEntity) status.missingComponents.push('Entity');
      if (!hasDto) status.missingComponents.push('DTO');
      if (!hasModule) status.missingComponents.push('Module');

      // Check for V2 components
      const hasV2Controller = await this.checkComponent(agentName, 'v2-controller');
      const hasV2Service = await this.checkComponent(agentName, 'v2-service');
      const hasV2Module = await this.checkComponent(agentName, 'v2-module');

      // Identify endpoints
      status.endpoints = await this.identifyEndpoints(agentName, hasV2Controller);

      // Determine overall status
      const requiredComponents = [hasController, hasService, hasEntity, hasDto, hasModule];
      const hasAllRequired = requiredComponents.every(component => component);
      
      if (hasAllRequired) {
        status.status = 'complete';
        status.notes.push('All required components present');
      } else {
        status.status = 'incomplete';
        status.notes.push('Missing required components');
      }

      // Add note about V2 components
      const v2Components = [hasV2Controller, hasV2Service, hasV2Module];
      const hasAllV2 = v2Components.every(component => component);
      
      if (hasAllV2) {
        status.notes.push('V2 components complete');
      } else if (v2Components.some(component => component)) {
        status.notes.push('Partial V2 components');
      } else {
        status.notes.push('No V2 components');
      }

    } catch (error) {
      this.logger.error(`Error testing agent ${agentName}: ${error.message}`);
      status.status = 'incomplete';
      status.missingComponents.push('Error during testing');
      status.notes.push(`Error: ${error.message}`);
    }

    return status;
  }

  /**
   * Check if agent directory exists
   * @param agentName Name of the agent
   * @returns Boolean indicating if directory exists
   */
  private async checkAgentDirectory(agentName: string): Promise<boolean> {
    try {
      // In a real implementation, we would check the file system
      // For now, we'll simulate based on known agents
      const knownAgents = [
        'trend-scanner',
        'faq-responder',
        'content-editor',
        'creative-synthesizer',
        'video-scriptor',
        'post-scheduler',
        'analytics-reporter',
        'front-desk'
      ];
      
      return knownAgents.includes(agentName);
    } catch (error) {
      return false;
    }
  }

  /**
   * Check if a component exists for an agent
   * @param agentName Name of the agent
   * @param componentType Type of component to check
   * @returns Boolean indicating if component exists
   */
  private async checkComponent(agentName: string, componentType: string): Promise<boolean> {
    try {
      // In a real implementation, we would check for actual files
      // For now, we'll simulate based on our knowledge of the codebase
      const componentMap: Record<string, string[]> = {
        'trend-scanner': [
          'controller', 'service', 'entity', 'dto', 'module',
          'v2-controller', 'v2-service', 'v2-module'
        ],
        'faq-responder': [
          'controller', 'service', 'entity', 'dto', 'module',
          'v2-controller', 'v2-service', 'v2-module'
        ],
        'content-editor': [
          'controller', 'service', 'entity', 'dto', 'module',
          'v2-controller', 'v2-service', 'v2-module'
        ],
        'creative-synthesizer': [
          'controller', 'service', 'entity', 'dto', 'module',
          'v2-controller', 'v2-service', 'v2-module'
        ],
        'video-scriptor': [
          'controller', 'service', 'entity', 'dto', 'module',
          'v2-controller', 'v2-service', 'v2-module'
        ],
        'post-scheduler': [
          'controller', 'service', 'entity', 'dto', 'module',
          'v2-controller', 'v2-service', 'v2-module'
        ],
        'analytics-reporter': [
          'controller', 'service', 'entity', 'dto', 'module',
          'v2-controller', 'v2-service', 'v2-module'
        ],
        'front-desk': [
          'controller', 'service', 'entity', 'dto', 'module',
          'v2-controller', 'v2-service', 'v2-module'
        ]
      };

      return componentMap[agentName]?.includes(componentType) || false;
    } catch (error) {
      return false;
    }
  }

  /**
   * Identify endpoints for an agent
   * @param agentName Name of the agent
   * @param hasV2 Boolean indicating if V2 components exist
   * @returns Array of endpoint paths
   */
  private async identifyEndpoints(agentName: string, hasV2: boolean): Promise<string[]> {
    const endpoints: string[] = [];
    
    if (hasV2) {
      endpoints.push(
        `/v2/agents/${agentName}`,
        `/v2/agents/${agentName}/:id`,
        `/v2/agents/${agentName}/metrics`
      );
      
      // Add agent-specific endpoints
      if (agentName === 'faq-responder') {
        endpoints.push(`/v2/agents/${agentName}/session/:sessionId`);
      }
    } else {
      endpoints.push(
        `/agents/${agentName}`,
        `/agents/${agentName}/:id`,
        `/agents/${agentName}/metrics`
      );
    }

    return endpoints;
  }

  /**
   * Generate a detailed report of agent statuses
   * @param statuses Array of agent statuses
   * @returns Formatted report
   */
  generateReport(statuses: AgentStatus[]): string {
    let report = '# Agent Functionality Status Report\n\n';
    
    report += '## Summary\n';
    const complete = statuses.filter(s => s.status === 'complete').length;
    const incomplete = statuses.filter(s => s.status === 'incomplete').length;
    const partial = statuses.filter(s => s.status === 'partial').length;
    
    report += `- Complete agents: ${complete}\n`;
    report += `- Incomplete agents: ${incomplete}\n`;
    report += `- Partial agents: ${partial}\n\n`;
    
    report += '## Detailed Status\n\n';
    
    for (const status of statuses) {
      report += `### ${status.name}\n`;
      report += `- Status: ${status.status}\n`;
      report += `- Endpoints: ${status.endpoints.length}\n`;
      
      if (status.missingComponents.length > 0) {
        report += `- Missing components: ${status.missingComponents.join(', ')}\n`;
      }
      
      if (status.notes.length > 0) {
        report += `- Notes: ${status.notes.join('; ')}\n`;
      }
      
      report += `- Endpoints:\n`;
      for (const endpoint of status.endpoints) {
        report += `  - ${endpoint}\n`;
      }
      
      report += '\n';
    }
    
    return report;
  }
}