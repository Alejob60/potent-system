import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { FrontDeskConversation } from '../entities/front-desk-conversation.entity';
import axios from 'axios';
import { ContextCompressionService } from './context-compression.service';
import { CreativeSynthesizerIntegrationService } from './creative-synthesizer.integration.service';

@Injectable()
export class FrontDeskService {
  constructor(
    @InjectRepository(FrontDeskConversation)
    private readonly conversationRepository: Repository<FrontDeskConversation>,
    private readonly contextCompressionService: ContextCompressionService,
    private readonly creativeSynthesizerIntegrationService: CreativeSynthesizerIntegrationService,
  ) {}

  async processMessage(
    message: string,
    context?: { sessionId?: string; userId?: string; language?: string },
  ): Promise<any> {
    // Get conversation history for this session
    const sessionId = context?.sessionId || 'default';
    const userId = context?.userId || 'anonymous';
    const conversationHistory = await this.getConversationHistory(sessionId);

    // Use AI to analyze intent based on conversation history
    const intentAnalysis = await this.analyzeIntentWithAI(
      message,
      conversationHistory,
    );

    // Extract entities using AI
    const collectedInfo = await this.extractEntitiesWithAI(
      message,
      intentAnalysis.currentObjective,
      conversationHistory,
    );

    // Detect emotion in the message
    const emotion = await this.detectEmotionWithAI(
      message,
      conversationHistory,
    );

    // Merge with previously collected info
    const mergedInfo = this.mergeWithPreviousInfo(
      collectedInfo,
      conversationHistory,
    );

    // Determine target agent
    const targetAgent = this.determineTargetAgent(
      intentAnalysis.currentObjective,
    );

    // Identify missing information
    const missingInfo = this.identifyMissingInfo(
      intentAnalysis.currentObjective,
      mergedInfo,
    );

    // Generate appropriate response based on conversation state
    const agentResponse = await this.generateContextualResponseWithAI(
      message,
      intentAnalysis,
      mergedInfo,
      missingInfo,
      conversationHistory,
      emotion,
    );

    // Determine if we have enough information to proceed
    const isComplete =
      missingInfo.length === 0 && intentAnalysis.confidence > 0.8;

    // Save conversation
    const conversation = this.conversationRepository.create({
      sessionId,
      userId,
      userMessage: message,
      agentResponse,
      objective: intentAnalysis.currentObjective,
      targetAgent: isComplete ? targetAgent : '',
      collectedInfo: mergedInfo,
      missingInfo,
      language: context?.language || 'es',
      confidence: intentAnalysis.confidence,
      emotion,
      entities: collectedInfo,
      context: {
        objective: intentAnalysis.currentObjective,
        targetAgent: isComplete ? targetAgent : '',
        missingInfo,
        isComplete,
      },
    });

    await this.conversationRepository.save(conversation);

    return {
      agent: 'front-desk',
      status: isComplete ? 'ready' : 'clarification_needed',
      conversation: {
        userMessage: message,
        agentResponse,
        objective: intentAnalysis.currentObjective,
        targetAgent: isComplete ? targetAgent : '',
        collectedInfo: mergedInfo,
        missingInfo,
        confidence: intentAnalysis.confidence,
        emotion,
        isComplete,
      },
    };
  }

  async getAgentStatus(): Promise<any> {
    // Get conversation statistics
    const totalConversations = await this.conversationRepository.count();
    const activeConversations = await this.conversationRepository.count({
      where: {
        targetAgent: '',
      },
    });

    // Calculate average conversation length
    const allConversations = await this.conversationRepository.find();
    const completedConversations = allConversations.filter(
      (conv) => conv.targetAgent !== '',
    );
    const avgConversationLength =
      completedConversations.length > 0
        ? completedConversations.reduce(
            (sum, conv) => sum + JSON.stringify(conv.collectedInfo).length,
            0,
          ) / completedConversations.length
        : 0;

    // Define specialized agents
    const specializedAgents = [
      'video-scriptor',
      'post-scheduler',
      'trend-scanner',
      'faq-responder',
      'analytics-reporter',
    ];

    // Get agent-specific metrics
    const agentMetrics = specializedAgents.map((agentName) => {
      const agentConversations = allConversations.filter(
        (conv) => conv.targetAgent === agentName,
      );
      const completedTasks = agentConversations.length;
      const activeTasks = allConversations.filter(
        (conv) =>
          conv.targetAgent === agentName &&
          conv.missingInfo &&
          conv.missingInfo.length > 0,
      ).length;

      // Calculate average response time (mock data since we don't have timestamps in the entity)
      const avgResponseTime = 1000 + Math.random() * 2000; // Mock response time between 1-3 seconds

      return {
        name: agentName,
        status: 'operational', // In a real implementation, this would check actual service health
        activeTasks,
        completedTasks,
        failedTasks: 0, // In a real implementation, this would track actual failures
        avgResponseTime: Math.round(avgResponseTime),
        uptime: 99.9, // In a real implementation, this would be actual uptime percentage
      };
    });

    return {
      timestamp: new Date().toISOString(),
      agents: agentMetrics,
      system: {
        totalConversations,
        activeConversations,
        avgConversationLength: Math.round(avgConversationLength),
      },
    };
  }

  private async analyzeIntentWithAI(
    message: string,
    history: FrontDeskConversation[],
  ): Promise<{
    currentObjective: string;
    confidence: number;
    previousObjective: string;
  }> {
    try {
      // Prepare conversation history for AI
      const conversationContext = history
        .slice(0, 3) // Last 3 conversations
        .map(
          (conv) =>
            `User: ${conv.userMessage}\nAgent: ${conv.agentResponse}\nCollected: ${JSON.stringify(conv.collectedInfo)}`,
        )
        .reverse()
        .join('\n\n');

      // Call Azure OpenAI API
      const response = await axios.post(
        `${process.env.OPEN_API_ENDPOINT}/openai/deployments/${process.env.OPENAI_DEPLOYMENT_NAME}/chat/completions?api-version=2024-05-01-preview`,
        {
          messages: [
            {
              role: 'system',
              content: `You are a coaching AI assistant that helps users discover and create viral content products. 
              Your role is to understand what the user really wants to create and guide them toward viral content creation.
              Identify what the user wants to do from these categories:
              - generate_video: Create a viral video content
              - schedule_post: Schedule a high-engagement social media post
              - analyze_trends: Analyze social media trends to find viral opportunities
              - faq_response: Answer questions about content creation
              - generate_report: Generate analytics reports for content optimization
              
              Focus on helping users create content that will go viral. Ask yourself: What does the user really want to achieve?
              What type of content would be most likely to become viral based on their interests?
              
              Also provide a confidence score (0.0-1.0) indicating how certain you are about the intent.
              Respond ONLY in JSON format like this:
              {
                "objective": "generate_video",
                "confidence": 0.9
              }`,
            },
            {
              role: 'user',
              content: `Previous conversation:
              ${conversationContext}
              
              Current user message: "${message}"
              
              What does the user want to do?`,
            },
          ],
          temperature: 0.3,
          max_tokens: 150,
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'api-key': process.env.OPENAI_API_KEY,
          },
        },
      );

      const aiResponse = response.data.choices[0].message.content;
      let parsedResponse: { objective?: string; confidence?: number } = {
        objective: 'unknown',
        confidence: 0.5,
      };
      try {
        parsedResponse = JSON.parse(aiResponse);
      } catch (parseError) {
        console.error('Failed to parse AI response:', parseError);
      }

      return {
        currentObjective: parsedResponse.objective || 'unknown',
        confidence: parsedResponse.confidence || 0.5,
        previousObjective:
          history.length > 0 ? history[0].objective : 'unknown',
      };
    } catch (_error) {
      // Log the error for debugging
      console.error('AI Intent Analysis Error:', _error.message);
      // Fallback to rule-based approach if AI fails
      return this.analyzeIntentWithHistory(message, history);
    }
  }

  private async extractEntitiesWithAI(
    message: string,
    objective: string,
    history: FrontDeskConversation[],
  ): Promise<Record<string, any>> {
    try {
      // Prepare conversation history for AI
      const conversationContext = history
        .slice(0, 3)
        .map(
          (conv) =>
            `User: ${conv.userMessage}\nAgent: ${conv.agentResponse}\nCollected: ${JSON.stringify(conv.collectedInfo)}`,
        )
        .reverse()
        .join('\n\n');

      // Call Azure OpenAI API
      const response = await axios.post(
        `${process.env.OPEN_API_ENDPOINT}/openai/deployments/${process.env.OPENAI_DEPLOYMENT_NAME}/chat/completions?api-version=2024-05-01-preview`,
        {
          messages: [
            {
              role: 'system',
              content: `You are a coaching AI assistant that helps users discover what viral content they want to create.
              Based on the user's objective ("${objective}"), extract information that will help them create viral content:
              
              For generate_video:
              - platform: social media platform where viral videos perform best (tiktok, instagram, youtube)
              - topic: what the user is passionate about or what problem they want to solve
              - viral_elements: what makes this video likely to go viral (humor, education, controversy, emotion)
              - target_audience: who should see this video
              - duration: optimal length for engagement (15s, 30s, 60s)
              - narration: boolean (true/false)
              - subtitles: boolean (true/false)
              - music: boolean (true/false)
              
              For schedule_post:
              - platform: social media platform with highest engagement for this content
              - hook: attention-grabbing first line
              - content: what the post is about
              - viral_strategy: how to maximize engagement (questions, polls, challenges)
              - timing: when to post for maximum reach
              
              For analyze_trends:
              - platform: social media platform to analyze
              - trend_category: what type of trends to find (challenges, memes, topics)
              - target_audience: who engages with these trends
              - opportunity: how to leverage this trend
              
              Focus on extracting information that will help the user create viral content.
              What does the user really want to express? What would make their content stand out?
              
              Respond ONLY in JSON format with extracted information.
              If you can't extract something, omit it from the response.`,
            },
            {
              role: 'user',
              content: `Previous conversation:
              ${conversationContext}
              
              Current user message: "${message}"
              
              Extract relevant information:`,
            },
          ],
          temperature: 0.3,
          max_tokens: 200,
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'api-key': process.env.OPENAI_API_KEY,
          },
        },
      );

      const aiResponse = response.data.choices[0].message.content;
      let parsedData: Record<string, any> = {};
      try {
        parsedData = JSON.parse(aiResponse);
      } catch (parseError) {
        console.error(
          'Failed to parse entity extraction response:',
          (parseError as Error).message,
        );
      }
      return parsedData;
    } catch (_error) {
      // Log the error for debugging
      console.error('AI Entity Extraction Error:', (_error as Error).message);
      // Fallback to rule-based approach if AI fails
      return this.extractEntities(message, objective, history);
    }
  }

  private async generateContextualResponseWithAI(
    userMessage: string,
    intentAnalysis: any,
    collectedInfo: any,
    missingInfo: string[],
    history: FrontDeskConversation[],
    emotion?: string,
  ): Promise<string> {
    try {
      // If we have all information, generate confirmation
      if (missingInfo.length === 0) {
        const response = await axios.post(
          `${process.env.OPEN_API_ENDPOINT}/openai/deployments/${process.env.OPENAI_DEPLOYMENT_NAME}/chat/completions?api-version=2024-05-01-preview`,
          {
            messages: [
              {
                role: 'system',
                content: `You are a coaching AI assistant helping users create viral content. 
                The user wants to ${intentAnalysis.currentObjective}.
                We have collected this information: ${JSON.stringify(collectedInfo)}.
                The user's current emotion is: ${emotion || 'neutral'}.
                Create an engaging confirmation message that excites the user about their viral content creation.
                Emphasize how this content could become viral and engage their audience.
                Respond with empathy and understanding of their emotional state.
                Use emojis to make it engaging.
                Write in Spanish.`,
              },
              {
                role: 'user',
                content: `Please confirm this information is correct: ${JSON.stringify(collectedInfo)}`,
              },
            ],
            temperature: 0.7,
            max_tokens: 150,
          },
          {
            headers: {
              'Content-Type': 'application/json',
              'api-key': process.env.OPENAI_API_KEY,
            },
          },
        );

        const choice = response.data.choices[0];
        let content = '';
        if (
          choice &&
          choice.message &&
          typeof choice.message.content === 'string'
        ) {
          content = choice.message.content.trim();
        }
        const responseText =
          content ||
          'Lo siento, tuve un problema al generar la respuesta.  Podr as intentarlo de nuevo?';
        return responseText;
      }

      // If we're missing information, ask for it naturally with empathy
      // Generate clarifying questions based on missing info and emotion
      const clarifyingQuestions = this.generateClarifyingQuestions(
        missingInfo,
        intentAnalysis.currentObjective,
        emotion || 'neutral',
      );

      // Use AI to generate a contextual response with empathy
      const response = await axios.post(
        `${process.env.OPEN_API_ENDPOINT}/openai/deployments/${process.env.OPENAI_DEPLOYMENT_NAME}/chat/completions?api-version=2024-05-01-preview`,
        {
          messages: [
            {
              role: 'system',
              content: `You are a coaching AI assistant helping users discover what viral content they want to create.
              The user wants to ${intentAnalysis.currentObjective}.
              The user's current emotion is: ${emotion || 'neutral'}.
              We still need: ${missingInfo.join(', ')}.
              Ask for the missing information in a way that helps them think about what would make their content viral.
              Guide them to think about their audience and what would engage them.
              Respond with empathy and understanding of their emotional state.
              Use emojis to make it engaging.
              Write in Spanish.
              Here are some suggested questions to help guide your response: ${clarifyingQuestions.join(' ')}`,
            },
            {
              role: 'user',
              content: `We still need: ${missingInfo.join(', ')}. What ${missingInfo[0]} would you like?`,
            },
          ],
          temperature: 0.7,
          max_tokens: 150,
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'api-key': process.env.OPENAI_API_KEY,
          },
        },
      );

      const choice = response.data.choices[0];
      let content = '';
      if (
        choice &&
        choice.message &&
        typeof choice.message.content === 'string'
      ) {
        content = choice.message.content.trim();
      }
      const responseText =
        content ||
        'Lo siento, tuve un problema al generar la respuesta.  Podr as intentarlo de nuevo?';
      return responseText;
    } catch (_error) {
      // Log the error for debugging
      console.error('AI Response Generation Error:', (_error as Error).message);
      // Fallback to rule-based approach if AI fails
      return this.generateContextualResponse(
        userMessage,
        intentAnalysis,
        collectedInfo,
        missingInfo,
        history,
      );
    }
  }

  private async getConversationHistory(
    sessionId: string,
  ): Promise<FrontDeskConversation[]> {
    const conversations = await this.conversationRepository.find({
      where: { sessionId },
      order: { createdAt: 'DESC' },
      take: 10, // Increase to 10 for better context
    });

    // Compress the conversation history to maintain relevant context while reducing size
    return this.contextCompressionService.compressConversationHistory(
      conversations,
      5,
    );
  }

  private async detectEmotionWithAI(
    message: string,
    history: FrontDeskConversation[],
  ): Promise<string> {
    try {
      // Prepare conversation history for AI
      const conversationContext = history
        .slice(0, 3)
        .map(
          (conv) =>
            `User: ${conv.userMessage}\nAgent: ${conv.agentResponse}\nEmotion: ${conv.emotion}`,
        )
        .reverse()
        .join('\n\n');

      // Call Azure OpenAI API
      const response = await axios.post(
        `${process.env.OPEN_API_ENDPOINT}/openai/deployments/${process.env.OPENAI_DEPLOYMENT_NAME}/chat/completions?api-version=2024-05-01-preview`,
        {
          messages: [
            {
              role: 'system',
              content: `You are an emotion detection AI. Based on the user's message and conversation history, identify the primary emotion from these categories:
              - curious: When the user is asking questions or showing interest
              - frustrated: When the user seems annoyed or having difficulties
              - excited: When the user shows enthusiasm or eagerness
              - confused: When the user seems uncertain or unclear
              - satisfied: When the user seems content with the progress
              - neutral: When no strong emotion is detected
              
              Respond ONLY with one word from the categories above.`,
            },
            {
              role: 'user',
              content: `Previous conversation:
              ${conversationContext}
              
              Current user message: "${message}"
              
              What is the primary emotion?`,
            },
          ],
          temperature: 0.3,
          max_tokens: 20,
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'api-key': process.env.OPENAI_API_KEY,
          },
        },
      );

      const aiResponse = response.data.choices[0].message.content;
      const emotion = aiResponse.trim().toLowerCase();

      // Validate emotion
      const validEmotions = [
        'curious',
        'frustrated',
        'excited',
        'confused',
        'satisfied',
        'neutral',
      ];
      if (validEmotions.includes(emotion)) {
        return emotion;
      }

      return 'neutral';
    } catch (_error) {
      console.error('AI Emotion Detection Error:', _error.message);
      return 'neutral';
    }
  }

  private analyzeIntentWithHistory(
    message: string,
    history: FrontDeskConversation[],
  ): {
    currentObjective: string;
    confidence: number;
    previousObjective: string;
  } {
    const lowerMessage = message.toLowerCase();

    // Start with basic intent detection
    let objective = 'unknown';
    let confidence = 0.3; // Base confidence

    // Check for specific intents
    if (lowerMessage.includes('video') || lowerMessage.includes('v deo')) {
      objective = 'generate_video';
      confidence = 0.9;
    } else if (
      lowerMessage.includes('programar') ||
      lowerMessage.includes('publicar') ||
      lowerMessage.includes('post')
    ) {
      objective = 'schedule_post';
      confidence = 0.9;
    } else if (
      lowerMessage.includes('tendencia') ||
      lowerMessage.includes('trend') ||
      lowerMessage.includes('an lisis')
    ) {
      objective = 'analyze_trends';
      confidence = 0.9;
    } else if (
      lowerMessage.includes('faq') ||
      lowerMessage.includes('pregunta') ||
      lowerMessage.includes('respuesta')
    ) {
      objective = 'faq_response';
      confidence = 0.9;
    } else if (
      lowerMessage.includes('reporte') ||
      lowerMessage.includes('anal tica') ||
      lowerMessage.includes('m trica')
    ) {
      objective = 'generate_report';
      confidence = 0.9;
    }

    // Adjust confidence based on conversation history
    if (history.length > 0) {
      const lastConversation = history[0];

      // If we're continuing a previous conversation, increase confidence
      if (lastConversation.objective !== 'unknown' && objective === 'unknown') {
        objective = lastConversation.objective;
        confidence = Math.min(0.8, lastConversation.confidence || 0.5);
      }

      // If we're confirming previous info, increase confidence
      if (
        lowerMessage.includes('s ') ||
        lowerMessage.includes('si') ||
        lowerMessage.includes('correcto') ||
        lowerMessage.includes('exacto')
      ) {
        objective = lastConversation.objective;
        confidence = 0.95;
      }
    }

    return {
      currentObjective: objective,
      confidence,
      previousObjective: history.length > 0 ? history[0].objective : 'unknown',
    };
  }

  private extractEntities(
    message: string,
    objective: string,
    history: FrontDeskConversation[],
  ): Record<string, any> {
    const collectedInfo: Record<string, any> = {};
    const lowerMessage = message.toLowerCase();

    // If we have conversation history, start with previously collected info
    if (history.length > 0) {
      Object.assign(collectedInfo, history[0].collectedInfo);
    }

    // Extract platform
    if (lowerMessage.includes('tiktok')) {
      collectedInfo.platform = 'tiktok';
    } else if (lowerMessage.includes('instagram')) {
      collectedInfo.platform = 'instagram';
    } else if (lowerMessage.includes('facebook')) {
      collectedInfo.platform = 'facebook';
    } else if (lowerMessage.includes('youtube')) {
      collectedInfo.platform = 'youtube';
    } else if (
      lowerMessage.includes('twitter') ||
      lowerMessage.includes('x.com')
    ) {
      collectedInfo.platform = 'twitter';
    }

    // Extract duration based on objective
    if (objective === 'generate_video') {
      if (
        lowerMessage.includes('corto') ||
        lowerMessage.includes('30s') ||
        lowerMessage.includes('15s') ||
        (lowerMessage.includes('30') && lowerMessage.includes('segundo'))
      ) {
        collectedInfo.duration = '30s';
      } else if (
        lowerMessage.includes('largo') ||
        lowerMessage.includes('1min') ||
        lowerMessage.includes('minuto') ||
        (lowerMessage.includes('1') && lowerMessage.includes('minuto'))
      ) {
        collectedInfo.duration = '1min';
      } else if (
        lowerMessage.includes('60s') ||
        lowerMessage.includes('60 segundos') ||
        (lowerMessage.includes('60') && lowerMessage.includes('segundo'))
      ) {
        collectedInfo.duration = '60s';
      }
    }

    // Extract topic/content - but only if we don't already have one or if this seems like a topic response
    if (!collectedInfo.topic || this.isLikelyTopicResponse(message, history)) {
      const topic = this.extractTopic(message, history);
      if (topic) {
        collectedInfo.topic = topic;
      }
    }

    // Extract specific parameters based on objective
    switch (objective) {
      case 'generate_video':
        if (
          lowerMessage.includes('narraci n') ||
          lowerMessage.includes('voz') ||
          lowerMessage.includes('audio')
        ) {
          collectedInfo.narration = true;
        }
        if (
          lowerMessage.includes('subt tulo') ||
          lowerMessage.includes('subt tulos')
        ) {
          collectedInfo.subtitles = true;
        }
        if (
          lowerMessage.includes('m sica') ||
          lowerMessage.includes('sonido')
        ) {
          collectedInfo.music = true;
        }
        break;

      case 'schedule_post':
        if (
          lowerMessage.includes('ma ana') ||
          lowerMessage.includes('hoy') ||
          lowerMessage.includes('tarde') ||
          lowerMessage.includes('noche')
        ) {
          collectedInfo.timing = 'specific_time';
        }
        break;
    }

    return collectedInfo;
  }

  private isLikelyTopicResponse(
    message: string,
    history: FrontDeskConversation[],
  ): boolean {
    // If the last message was asking about the topic, this is likely a topic response
    if (
      history.length > 0 &&
      history[0].agentResponse &&
      history[0].agentResponse.includes('tema')
    ) {
      // But exclude responses that are just asking the same question
      const lowerMessage = message.toLowerCase();
      return (
        !lowerMessage.includes('tema') &&
        !lowerMessage.includes('sobre qu ') &&
        !lowerMessage.includes('cu l') &&
        message.length > 3
      );
    }
    return false;
  }

  private extractTopic(
    message: string,
    history: FrontDeskConversation[],
  ): string | null {
    const lowerMessage = message.toLowerCase();

    // If we have history and the last agent response was asking about topic
    if (
      history.length > 0 &&
      history[0].agentResponse &&
      history[0].agentResponse.includes('tema')
    ) {
      // Simple heuristic: if this isn't a question and isn't just confirming the previous question,
      // and it's reasonably long, treat it as the topic
      if (
        !message.endsWith('?') &&
        message.length > 3 &&
        !lowerMessage.includes('tema') &&
        !lowerMessage.includes('sobre qu ')
      ) {
        return message;
      }
    }

    // Extract topic using the existing logic as fallback
    const topicIndicators = [
      'sobre',
      'de',
      'acerca de',
      'sobre mi',
      'de mi',
      'para mi',
      'sobre el',
      'de el',
      'para el',
      'sobre la',
      'de la',
      'para la',
    ];

    for (const indicator of topicIndicators) {
      if (lowerMessage.includes(indicator)) {
        const startIndex = lowerMessage.indexOf(indicator) + indicator.length;
        let topic = lowerMessage.substring(startIndex).trim();

        // Clean up the topic (remove trailing punctuation, etc.)
        topic = topic.split(/[.!?]/)[0].trim();

        if (topic.length > 2) {
          return topic;
        }
      }
    }

    return null;
  }

  private mergeWithPreviousInfo(
    currentInfo: Record<string, any>,
    history: FrontDeskConversation[],
  ): Record<string, any> {
    if (history.length === 0) {
      return currentInfo;
    }

    // Start with the most recent conversation's info
    const mergedInfo: Record<string, any> = { ...history[0].collectedInfo };

    // Override with current info
    Object.keys(currentInfo).forEach((key) => {
      mergedInfo[key] = currentInfo[key];
    });

    return mergedInfo;
  }

  private determineTargetAgent(objective: string): string {
    switch (objective) {
      case 'generate_video':
        return 'video-scriptor';
      case 'schedule_post':
        return 'post-scheduler';
      case 'analyze_trends':
        return 'trend-scanner';
      case 'faq_response':
        return 'faq-responder';
      case 'generate_report':
        return 'analytics-reporter';
      default:
        return 'video-scriptor'; // Default to video scriptor
    }
  }

  private identifyMissingInfo(objective: string, collectedInfo: any): string[] {
    const missingInfo: string[] = [];

    // Always check for platform
    if (!collectedInfo.platform) {
      missingInfo.push('plataforma');
    }

    switch (objective) {
      case 'generate_video':
        if (!collectedInfo.duration) {
          missingInfo.push('duraci n');
        }
        if (!collectedInfo.topic) {
          missingInfo.push('tema');
        }
        // Don't force narration/subtitles - these are optional
        break;

      case 'schedule_post':
        if (!collectedInfo.topic) {
          missingInfo.push('contenido');
        }
        // Don't force timing - can be decided later
        break;

      case 'analyze_trends':
        if (!collectedInfo.topic) {
          missingInfo.push('palabra clave');
        }
        break;

      case 'generate_report':
        if (!collectedInfo.topic) {
          missingInfo.push('tipo de reporte');
        }
        break;

      default:
        if (!collectedInfo.topic) {
          missingInfo.push('tema');
        }
    }

    return missingInfo;
  }

  /**
   * Generate clarifying questions based on missing information and emotional context
   * @param missingInfo Array of missing information items
   * @param objective Current user objective
   * @param emotion Detected user emotion
   * @returns Array of clarifying questions
   */
  private generateClarifyingQuestions(
    missingInfo: string[],
    objective: string,
    emotion: string,
  ): string[] {
    const questions: string[] = [];

    // Adjust tone based on emotion
    const tone = this.getEmotionalTone(emotion);

    for (const item of missingInfo) {
      let question = '';

      switch (item) {
        case 'plataforma':
          question = `${tone}  En qu  plataforma te gustar a ${this.getObjectiveAction(objective)}?`;
          break;

        case 'tema':
          question = `${tone}  Sobre qu  tema te gustar a ${this.getObjectiveAction(objective)}?`;
          break;

        case 'duraci n':
          question = `${tone}  Qu  duraci n prefieres para tu video?`;
          break;

        case 'contenido':
          question = `${tone}  Sobre qu  quieres que sea tu publicaci n?`;
          break;

        case 'palabra clave':
          question = `${tone}  Qu  palabra clave te interesa analizar?`;
          break;

        case 'tipo de reporte':
          question = `${tone}  Qu  tipo de reporte necesitas?`;
          break;

        default:
          question = `${tone}  Podr as proporcionar m s detalles sobre ${item}?`;
      }

      questions.push(question);
    }

    return questions;
  }

  /**
   * Get appropriate tone based on detected emotion
   * @param emotion Detected emotion
   * @returns Appropriate tone prefix
   */
  private getEmotionalTone(emotion: string): string {
    switch (emotion) {
      case 'curious':
        return ' Me encanta tu curiosidad!   ';
      case 'frustrated':
        return 'Entiendo que esto puede ser frustrante   ';
      case 'excited':
        return ' Qu  emoci n!   ';
      case 'confused':
        return 'No te preocupes, te ayudo a aclarar las cosas   ';
      case 'satisfied':
        return ' Me alegra que est s satisfecho!   ';
      default:
        return 'Para ayudarte mejor';
    }
  }

  /**
   * Get action description based on objective
   * @param objective User objective
   * @returns Action description
   */
  private getObjectiveAction(objective: string): string {
    switch (objective) {
      case 'generate_video':
        return 'crear el video';
      case 'schedule_post':
        return 'programar la publicaci n';
      case 'analyze_trends':
        return 'analizar las tendencias';
      case 'generate_report':
        return 'generar el reporte';
      default:
        return 'trabajar en esto';
    }
  }

  private generateContextualResponse(
    userMessage: string,
    intentAnalysis: any,
    collectedInfo: any,
    missingInfo: string[],
    history: FrontDeskConversation[],
  ): string {
    const objective = intentAnalysis.currentObjective;
    let response = '';

    // Check if this is a confirmation message
    const isConfirmation =
      userMessage.toLowerCase().includes('s ') ||
      userMessage.toLowerCase().includes('si') ||
      userMessage.toLowerCase().includes('correcto') ||
      userMessage.toLowerCase().includes('exacto');

    // If we have a previous conversation and this is a confirmation
    if (history.length > 0 && isConfirmation) {
      const lastConversation = history[0];
      if (
        lastConversation.missingInfo &&
        lastConversation.missingInfo.length > 0
      ) {
        return ` Perfecto!    Entonces proceder  a crear ${this.getObjectiveDescription(objective)} con la informaci n que tenemos.  Hay algo m s que quieras agregar?`;
      }
    }

    // Generate response based on objective and missing info
    switch (objective) {
      case 'generate_video':
        response = this.generateVideoResponse(
          collectedInfo,
          missingInfo,
          history,
        );
        break;

      case 'schedule_post':
        response = this.generatePostResponse(
          collectedInfo,
          missingInfo,
          history,
        );
        break;

      case 'analyze_trends':
        response = this.generateTrendResponse(
          collectedInfo,
          missingInfo,
          history,
        );
        break;

      case 'faq_response':
        response = this.generateFaqResponse(
          collectedInfo,
          missingInfo,
          // history, // Not currently used
        );
        break;

      case 'generate_report':
        response = this.generateReportResponse(
          collectedInfo,
          missingInfo,
          // history, // Not currently used
        );
        break;

      default:
        // If we don't understand the intent, ask clarifying questions
        if (history.length > 0) {
          // Continue from previous conversation
          const lastObjective = history[0].objective;
          if (lastObjective !== 'unknown') {
            return `Continuando con ${this.getObjectiveDescription(lastObjective)}, ${this.getClarifyingQuestion(
              lastObjective,
              collectedInfo,
            )}`;
          }
        }
        return 'No estoy seguro de lo que necesitas.  Podr as decirme si quieres crear un video, programar una publicaci n, analizar tendencias, responder preguntas o generar un reporte?';
    }

    // Add confidence indicator for debugging
    // response += ` [Confianza: ${(intentAnalysis.confidence * 100).toFixed(0)}%]`;

    return response;
  }

  private generateVideoResponse(
    collectedInfo: any,
    missingInfo: string[],
    history: FrontDeskConversation[],
  ): string {
    if (missingInfo.length > 0) {
      // If we have conversation history, check what we asked last
      if (history.length > 0) {
        const lastAgentResponse = history[0].agentResponse;

        // If we just asked about platform and now have it, move to topic
        if (
          lastAgentResponse &&
          lastAgentResponse.includes('plataforma') &&
          collectedInfo.platform &&
          !collectedInfo.topic
        ) {
          return ' Sobre qu  tema quieres que sea el video?';
        }

        // If we just asked about topic and now have it, move to duration
        if (
          lastAgentResponse &&
          lastAgentResponse.includes('tema') &&
          collectedInfo.topic &&
          !collectedInfo.duration
        ) {
          return ' Qu  duraci n prefieres para el video? (30 segundos, 1 minuto, etc.)';
        }

        // If we just asked about duration and now have it, move to enhancements
        if (
          lastAgentResponse &&
          lastAgentResponse.includes('duraci n') &&
          collectedInfo.duration
        ) {
          let response = `Perfecto   , voy a crear un video`;

          if (collectedInfo.duration) {
            response += ` de ${collectedInfo.duration}`;
          }

          if (collectedInfo.platform) {
            response += ` para ${collectedInfo.platform}`;
          }

          if (collectedInfo.topic) {
            response += ` sobre "${collectedInfo.topic}"`;
          }

          response +=
            '.  Quieres agregarle narraci n, subt tulos o m sica de fondo?';
          return response;
        }
      }

      // Fallback to standard missing info checking
      if (missingInfo.includes('plataforma')) {
        return ' Para qu  plataforma quieres crear el video? (TikTok, Instagram, YouTube, etc.)';
      }

      if (missingInfo.includes('tema')) {
        return ' Sobre qu  tema quieres que sea el video?';
      }

      if (missingInfo.includes('duraci n')) {
        return ' Qu  duraci n prefieres para el video? (30 segundos, 1 minuto, etc.)';
      }

      // If we have basic info, ask for enhancements
      let response = `Perfecto   , voy a crear un video`;

      if (collectedInfo.duration) {
        response += ` de ${collectedInfo.duration}`;
      }

      if (collectedInfo.platform) {
        response += ` para ${collectedInfo.platform}`;
      }

      if (collectedInfo.topic) {
        response += ` sobre "${collectedInfo.topic}"`;
      }

      response +=
        '.  Quieres agregarle narraci n, subt tulos o m sica de fondo?';
      return response;
    } else {
      // All info collected
      let response = ` Entendido!    Crear  un video`;

      if (collectedInfo.duration) {
        response += ` de ${collectedInfo.duration}`;
      }

      if (collectedInfo.platform) {
        response += ` para ${collectedInfo.platform}`;
      }

      if (collectedInfo.topic) {
        response += ` sobre "${collectedInfo.topic}"`;
      }

      const enhancements: string[] = [];
      if (collectedInfo.narration) enhancements.push('narraci n');
      if (collectedInfo.subtitles) enhancements.push('subt tulos');
      if (collectedInfo.music) enhancements.push('m sica');

      if (enhancements.length > 0) {
        response += ` con ${enhancements.join(', ')}`;
      }

      response += '.  Es correcto?';
      return response;
    }
  }

  private generatePostResponse(
    collectedInfo: any,
    missingInfo: string[],
    history: FrontDeskConversation[],
  ): string {
    if (missingInfo.length > 0) {
      // If we have conversation history, check what we asked last
      if (history.length > 0) {
        const lastAgentResponse = history[0].agentResponse;

        // If we just asked about platform and now have it, move to content
        if (
          lastAgentResponse &&
          lastAgentResponse.includes('plataforma') &&
          collectedInfo.platform &&
          !collectedInfo.topic
        ) {
          return ' Sobre qu  quieres que sea la publicaci n?';
        }
      }

      // Ask about missing information
      if (missingInfo.includes('plataforma')) {
        return ' En qu  plataforma quieres publicar? (Instagram, Facebook, Twitter, etc.)';
      }

      if (missingInfo.includes('contenido')) {
        return ' Sobre qu  quieres que sea la publicaci n?';
      }

      // If we have basic info, confirm
      let response = `Voy a programar una publicaci n`;

      if (collectedInfo.platform) {
        response += ` en ${collectedInfo.platform}`;
      }

      if (collectedInfo.topic) {
        response += ` sobre "${collectedInfo.topic}"`;
      }

      response += '.  Quieres especificar una fecha o hora para publicarla?';
      return response;
    } else {
      // All info collected
      let response = `Perfecto   Programar  una publicaci n`;

      if (collectedInfo.platform) {
        response += ` en ${collectedInfo.platform}`;
      }

      if (collectedInfo.topic) {
        response += ` sobre "${collectedInfo.topic}"`;
      }

      response += '.  Es correcto?';
      return response;
    }
  }

  private generateTrendResponse(
    collectedInfo: any,
    missingInfo: string[],
    history: FrontDeskConversation[],
  ): string {
    if (missingInfo.length > 0) {
      // If we have conversation history, check what we asked last
      if (history.length > 0) {
        const lastAgentResponse = history[0].agentResponse;

        // If we just asked about platform and now have it, move to keyword
        if (
          lastAgentResponse &&
          lastAgentResponse.includes('plataforma') &&
          collectedInfo.platform &&
          !collectedInfo.topic
        ) {
          return ' Sobre qu  tema o palabra clave quieres analizar tendencias?';
        }
      }

      // Ask about missing information
      if (missingInfo.includes('plataforma')) {
        return ' En qu  plataforma quieres analizar tendencias? (Twitter, Instagram, TikTok, etc.)';
      }

      if (missingInfo.includes('palabra clave')) {
        return ' Sobre qu  tema o palabra clave quieres analizar tendencias?';
      }

      // If we have basic info, confirm
      let response = `Analizar  las tendencias`;

      if (collectedInfo.platform) {
        response += ` en ${collectedInfo.platform}`;
      }

      if (collectedInfo.topic) {
        response += ` relacionadas con "${collectedInfo.topic}"`;
      }

      response +=
        '.  Quieres incluir an lisis de sentimiento o comparaci n con per odos anteriores?';
      return response;
    } else {
      // All info collected
      let response = `   Analizar  las tendencias`;

      if (collectedInfo.platform) {
        response += ` en ${collectedInfo.platform}`;
      }

      if (collectedInfo.topic) {
        response += ` sobre "${collectedInfo.topic}"`;
      }

      response += '.  Es correcto?';
      return response;
    }
  }

  private generateFaqResponse(
    collectedInfo: any,
    missingInfo: string[],
    // history: FrontDeskConversation[], // Not currently used but kept for consistency
  ): string {
    if (missingInfo.length > 0) {
      if (missingInfo.includes('tema')) {
        return ' Sobre qu  tema necesitas respuestas a preguntas frecuentes?';
      }

      // If we have topic, ask for specific questions
      if (collectedInfo.topic) {
        return ` Tienes preguntas espec ficas sobre "${collectedInfo.topic}" que quieras que incluya en las respuestas?`;
      }
    }

    // All info collected
    if (collectedInfo.topic) {
      return `Responder  preguntas frecuentes sobre "${collectedInfo.topic}".  Es correcto?`;
    }

    return ' Sobre qu  tema quieres que responda preguntas frecuentes?';
  }

  private generateReportResponse(
    collectedInfo: any,
    missingInfo: string[],
    // history: FrontDeskConversation[], // Not currently used but kept for consistency
  ): string {
    if (missingInfo.length > 0) {
      if (missingInfo.includes('tipo de reporte')) {
        return ' Qu  tipo de reporte necesitas? (rendimiento, an lisis de audiencia, comparaci n de m tricas, etc.)';
      }

      // If we have topic, ask for time period
      if (collectedInfo.topic) {
        return ` Qu  per odo de tiempo quieres incluir en el reporte de "${collectedInfo.topic}"?`;
      }
    }

    // All info collected
    if (collectedInfo.topic) {
      return `Generar  un reporte sobre "${collectedInfo.topic}".  Es correcto?`;
    }

    return ' Sobre qu  m tricas o datos quieres generar un reporte?';
  }

  private getObjectiveDescription(objective: string): string {
    switch (objective) {
      case 'generate_video':
        return 'un video';
      case 'schedule_post':
        return 'una publicaci n';
      case 'analyze_trends':
        return 'un an lisis de tendencias';
      case 'faq_response':
        return 'respuestas a preguntas frecuentes';
      case 'generate_report':
        return 'un reporte';
      default:
        return 'un contenido';
    }
  }

  private getClarifyingQuestion(objective: string, collectedInfo: any): string {
    switch (objective) {
      case 'generate_video':
        if (!collectedInfo.platform) return ' Para qu  plataforma es el video?';
        if (!collectedInfo.topic) return ' Sobre qu  tema quieres el video?';
        if (!collectedInfo.duration) return ' Qu  duraci n prefieres?';
        return ' Quieres agregarle narraci n o subt tulos?';

      case 'schedule_post':
        if (!collectedInfo.platform)
          return ' En qu  plataforma quieres publicar?';
        if (!collectedInfo.topic) return ' Sobre qu  quieres publicar?';
        return ' Quieres programarla para una fecha espec fica?';

      default:
        if (!collectedInfo.topic) return ' Sobre qu  tema es esto?';
        return ' Puedes darme m s detalles?';
    }
  }

  async findAll(): Promise<FrontDeskConversation[]> {
    return this.conversationRepository.find({
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: string): Promise<FrontDeskConversation | null> {
    return this.conversationRepository.findOneBy({ id });
  }

  async findBySession(sessionId: string): Promise<FrontDeskConversation[]> {
    return this.conversationRepository.findBy({ sessionId });
  }

  /**
   * Send content creation request to Creative Synthesizer Agent
   * @param sessionId User session ID
   * @param userId User ID
   * @param intention Content creation intention
   * @param emotion Detected user emotion
   * @param entities Extracted entities
   * @param integrationId Integration ID (optional)
   * @param integrationStatus Integration status (optional)
   * @returns Creation request response
   */
  async sendToCreativeSynthesizer(
    sessionId: string,
    userId: string,
    intention: string,
    emotion: string,
    entities: any,
    integrationId?: string,
    integrationStatus?: string,
  ): Promise<any> {
    try {
      const payload = {
        sessionId,
        userId,
        intention,
        emotion,
        entities,
        integrationId,
        integrationStatus,
      };

      return await this.creativeSynthesizerIntegrationService.sendToCreativeSynthesizer(
        payload,
      );
    } catch (error) {
      console.error(
        'Failed to send request to Creative Synthesizer:',
        error.message,
      );
      throw error;
    }
  }
}
