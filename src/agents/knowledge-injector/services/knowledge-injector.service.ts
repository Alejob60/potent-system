import { Injectable, Logger } from '@nestjs/common';
import { StateManagementService } from '../../../state/state-management.service';
import { WebSocketGatewayService } from '../../../websocket/websocket.gateway';
import { TrainingResult } from '../interfaces/training-result.interface';

@Injectable()
export class KnowledgeInjectorService {
  private readonly logger = new Logger(KnowledgeInjectorService.name);
  private agentesEntrenables: string[] = [
    'trend-scanner',
    'video-scriptor',
    'post-scheduler',
    'analytics-reporter',
    'faq-responder',
  ];

  constructor(
    private readonly stateManager: StateManagementService,
    private readonly websocketGateway: WebSocketGatewayService,
  ) {}

  async trainAgents(trainingData: any) {
    this.logger.log('Iniciando entrenamiento de agentes creativos');

    const { dataset, designManuals, darkStrategies, targetAgents } =
      trainingData;

    // Validar datos de entrenamiento
    if (!dataset || !Array.isArray(dataset)) {
      throw new Error('Dataset de entrenamiento inv lido');
    }

    // Validar que el dataset contenga campa as virales exitosas
    if (!this.validateViralCampaignsDataset(dataset)) {
      throw new Error('Dataset no contiene campa as virales exitosas v lidas');
    }

    // Validar manuales de dise o emocional si se proporcionan
    if (designManuals && !this.validateDesignManuals(designManuals)) {
      throw new Error('Manuales de dise o emocional inv lidos');
    }

    // Validar estrategias de marketing oscuro si se proporcionan
    if (darkStrategies && !this.validateDarkStrategies(darkStrategies)) {
      throw new Error('Estrategias de marketing oscuro inv lidas');
    }

    // Si no se especifican agentes objetivo, entrenar a todos los agentes entrenables
    const agentsToTrain =
      targetAgents && Array.isArray(targetAgents)
        ? targetAgents.filter((agent) =>
            this.agentesEntrenables.includes(agent),
          )
        : [...this.agentesEntrenables];

    this.logger.log(`Entrenando agentes: ${agentsToTrain.join(', ')}`);

    // Notificar inicio de entrenamiento
    this.websocketGateway.broadcastSystemNotification({
      type: 'training_started',
      targetAgents: agentsToTrain,
      timestamp: new Date().toISOString(),
    });

    // Entrenar cada agente
    const trainingResults: TrainingResult[] = [];
    for (const agent of agentsToTrain) {
      try {
        const result = await this.trainAgent(
          agent,
          dataset,
          designManuals,
          darkStrategies,
        );
        trainingResults.push({
          agent,
          success: true,
          result,
        });
      } catch (error) {
        this.logger.error(`Error entrenando agente ${agent}: ${error.message}`);
        trainingResults.push({
          agent,
          success: false,
          error: error.message,
        });
      }
    }

    // Notificar resultados
    this.websocketGateway.broadcastSystemNotification({
      type: 'training_completed',
      results: trainingResults,
      timestamp: new Date().toISOString(),
    });

    return {
      status: 'completed',
      results: trainingResults,
      timestamp: new Date().toISOString(),
    };
  }

  async trainSpecificAgent(agent: string, trainingData: any) {
    this.logger.log(`Iniciando entrenamiento espec fico para agente: ${agent}`);

    // Verificar que el agente sea entrenable
    if (!this.agentesEntrenables.includes(agent)) {
      throw new Error(`El agente ${agent} no es entrenable`);
    }

    const { dataset, designManuals, darkStrategies } = trainingData;

    // Validar datos de entrenamiento
    if (!dataset || !Array.isArray(dataset)) {
      throw new Error('Dataset de entrenamiento inv lido');
    }

    // Validar que el dataset contenga campa as virales exitosas
    if (!this.validateViralCampaignsDataset(dataset)) {
      throw new Error('Dataset no contiene campa as virales exitosas v lidas');
    }

    // Validar manuales de dise o emocional si se proporcionan
    if (designManuals && !this.validateDesignManuals(designManuals)) {
      throw new Error('Manuales de dise o emocional inv lidos');
    }

    // Validar estrategias de marketing oscuro si se proporcionan
    if (darkStrategies && !this.validateDarkStrategies(darkStrategies)) {
      throw new Error('Estrategias de marketing oscuro inv lidas');
    }

    // Notificar inicio de entrenamiento
    this.websocketGateway.broadcastSystemNotification({
      type: 'training_started',
      targetAgents: [agent],
      timestamp: new Date().toISOString(),
    });

    try {
      const result = await this.trainAgent(
        agent,
        dataset,
        designManuals,
        darkStrategies,
      );

      // Notificar resultados
      this.websocketGateway.broadcastSystemNotification({
        type: 'training_completed',
        results: [
          {
            agent,
            success: true,
            result,
          },
        ],
        timestamp: new Date().toISOString(),
      });

      return {
        status: 'completed',
        result,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      this.logger.error(`Error entrenando agente ${agent}: ${error.message}`);

      // Notificar error
      this.websocketGateway.broadcastSystemNotification({
        type: 'training_error',
        error: error.message,
        agent,
        timestamp: new Date().toISOString(),
      });

      throw error;
    }
  }

  private validateViralCampaignsDataset(dataset: any[]): boolean {
    // Validar que el dataset contenga las propiedades necesarias para campa as virales
    return dataset.every(
      (campaign) =>
        campaign.hasOwnProperty('engagement') &&
        campaign.hasOwnProperty('reach') &&
        campaign.hasOwnProperty('conversion') &&
        campaign.hasOwnProperty('content'),
    );
  }

  private validateDesignManuals(designManuals: any[]): boolean {
    // Validar que los manuales de dise o emocional contengan las propiedades necesarias
    return designManuals.every(
      (manual) =>
        manual.hasOwnProperty('principles') &&
        manual.hasOwnProperty('techniques') &&
        manual.hasOwnProperty('emotionalTriggers') &&
        Array.isArray(manual.principles) &&
        Array.isArray(manual.techniques) &&
        Array.isArray(manual.emotionalTriggers),
    );
  }

  private validateDarkStrategies(darkStrategies: any[]): boolean {
    // Validar que las estrategias de marketing oscuro contengan las propiedades necesarias
    return darkStrategies.every(
      (strategy) =>
        strategy.hasOwnProperty('type') &&
        strategy.hasOwnProperty('techniques') &&
        strategy.hasOwnProperty('ethicalConsiderations') &&
        Array.isArray(strategy.techniques) &&
        typeof strategy.type === 'string',
    );
  }

  private async trainAgent(
    agent: string,
    dataset: any[],
    designManuals: any[],
    darkStrategies: any[],
  ) {
    this.logger.log(`Entrenando agente espec fico: ${agent}`);

    // Crear un identificador de sesi n para este entrenamiento
    const trainingSessionId = `training_${agent}_${Date.now()}`;

    // Agregar entrada al estado para seguimiento
    this.stateManager.addTask('knowledge-injection', {
      type: 'agent_training',
      status: 'in_progress',
      data: {
        agent,
        trainingSessionId,
        datasetSize: dataset.length,
        designManualsCount: designManuals ? designManuals.length : 0,
        darkStrategiesCount: darkStrategies ? darkStrategies.length : 0,
      },
    });

    // Procesar manuales de dise o emocional si se proporcionan
    if (designManuals) {
      await this.processDesignManuals(agent, designManuals);
    }

    // Procesar estrategias de marketing oscuro si se proporcionan
    if (darkStrategies) {
      await this.processDarkStrategies(agent, darkStrategies);
    }

    // Simular proceso de entrenamiento (en implementaci n real, esto interactuar a con los agentes)
    await this.simulateTrainingProcess(
      agent,
      dataset,
      designManuals,
      darkStrategies,
    );

    // Actualizar estado
    this.stateManager.updateTask('knowledge-injection', trainingSessionId, {
      status: 'completed',
      result: {
        agent,
        improvements: this.calculateImprovements(agent),
      },
    });

    return {
      agent,
      improvements: this.calculateImprovements(agent),
      sessionId: trainingSessionId,
    };
  }

  private async processDesignManuals(agent: string, designManuals: any[]) {
    this.logger.log(`Procesando manuales de dise o emocional para ${agent}`);

    // En una implementaci n real, esto actualizar a los prompts internos del agente
    // basados en los principios y t cnicas de dise o emocional

    // Por ahora, solo registramos en el estado
    this.stateManager.addConversationEntry('knowledge-injection', {
      type: 'system_event',
      content: `Manuales de dise o emocional procesados para ${agent}`,
      metadata: {
        agent,
        manualsProcessed: designManuals.length,
      },
    });
  }

  private async processDarkStrategies(agent: string, darkStrategies: any[]) {
    this.logger.log(`Procesando estrategias de marketing oscuro para ${agent}`);

    // Validar y procesar estrategias de marketing oscuro
    const validStrategies = darkStrategies.filter((strategy) =>
      [
        'urgency',
        'scarcity',
        'social_proof',
        'authority',
        'liking',
        'reciprocity',
      ].includes(strategy.type),
    );

    // En una implementaci n real, esto activar a m dulos creativos seg n el contexto
    // y actualizar a los prompts internos del agente con t cnicas  ticas de marketing

    // Por ahora, solo registramos en el estado
    this.stateManager.addConversationEntry('knowledge-injection', {
      type: 'system_event',
      content: `Estrategias de marketing oscuro procesadas para ${agent}`,
      metadata: {
        agent,
        strategiesProcessed: validStrategies.length,
        strategyTypes: validStrategies.map((s) => s.type),
      },
    });
  }

  private async simulateTrainingProcess(
    agent: string,
    dataset: any[],
    designManuals: any[],
    darkStrategies: any[],
  ) {
    // Simular tiempo de procesamiento
    await new Promise((resolve) =>
      setTimeout(resolve, 2000 + Math.random() * 3000),
    );

    // Registrar detalles del entrenamiento en el estado
    this.stateManager.addConversationEntry('knowledge-injection', {
      type: 'system_event',
      content: `Entrenamiento completado para ${agent}`,
      metadata: {
        agent,
        datasetSize: dataset.length,
        designManualsCount: designManuals ? designManuals.length : 0,
        darkStrategiesCount: darkStrategies ? darkStrategies.length : 0,
      },
    });
  }

  private calculateImprovements(agent: string) {
    // Calcular mejoras simuladas basadas en el tipo de agente
    const improvements = {
      creativity: Math.random() * 0.3 + 0.1, // 10-40% de mejora
      effectiveness: Math.random() * 0.25 + 0.15, // 15-40% de mejora
      emotionalResonance: Math.random() * 0.35 + 0.05, // 5-40% de mejora
    };

    // Ajustar seg n el tipo de agente
    switch (agent) {
      case 'video-scriptor':
        improvements.creativity *= 1.2;
        break;
      case 'trend-scanner':
        improvements.effectiveness *= 1.3;
        break;
      case 'post-scheduler':
        improvements.emotionalResonance *= 1.1;
        break;
    }

    return {
      creativity: Math.min(1, improvements.creativity),
      effectiveness: Math.min(1, improvements.effectiveness),
      emotionalResonance: Math.min(1, improvements.emotionalResonance),
    };
  }
}
