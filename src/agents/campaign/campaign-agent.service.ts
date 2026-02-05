import { Injectable, Logger } from '@nestjs/common';
import {
  StateManagementService,
  Task,
} from '../../state/state-management.service';
import { WebSocketGatewayService } from '../../websocket/websocket.gateway';
import { TokenManagementService } from '../../services/token-management.service';
// Calendar integration will be added later

export interface CampaignRequest {
  title: string;
  objective: string;
  targetChannels: string[];
  duration: number; // days
  contentTypes: string[];
  tone: string;
  budget?: number;
  startDate?: Date;
  sessionId: string;
}

export interface CampaignPlan {
  id: string;
  title: string;
  objective: string;
  strategy: CampaignStrategy;
  contentCalendar: ContentItem[];
  metrics: CampaignMetrics;
  status: 'draft' | 'scheduled' | 'active' | 'completed' | 'paused';
}

export interface CampaignStrategy {
  approach: string;
  keyMessages: string[];
  targetAudience: string;
  postingFrequency: string;
  engagementTactics: string[];
  trendAlignment: string[];
}

export interface ContentItem {
  id: string;
  type: 'post' | 'video' | 'image' | 'story';
  title: string;
  content: string;
  channels: string[];
  scheduledDate: Date;
  status: 'planned' | 'created' | 'scheduled' | 'published';
  mediaUrls?: string[];
  hashtags?: string[];
  mentions?: string[];
}

export interface CampaignMetrics {
  targetReach: number;
  expectedEngagement: number;
  estimatedBudget: number;
  contentCount: number;
  channelsCount: number;
}

@Injectable()
export class CampaignAgentService {
  private readonly logger = new Logger(CampaignAgentService.name);

  constructor(
    private readonly stateManager: StateManagementService,
    private readonly websocketGateway: WebSocketGatewayService,
    private readonly tokenManager: TokenManagementService,
  ) {}

  async createCampaign(request: CampaignRequest): Promise<CampaignPlan> {
    this.logger.log(
      `Creating campaign: ${request.title} for session ${request.sessionId}`,
    );

    try {
      // Update session context
      this.stateManager.updateContext(request.sessionId, {
        campaignType: 'campaign',
        currentObjective: request.objective,
        targetChannels: request.targetChannels,
      });

      // Notify start
      this.websocketGateway.emitToSession(
        request.sessionId,
        'campaign_creation_started',
        {
          title: request.title,
          message: 'Starting campaign creation process...',
        },
      );

      // Step 1: Analyze trends and create strategy
      const strategy = await this.createCampaignStrategy(request);
      this.websocketGateway.emitCampaignUpdate(request.sessionId, {
        step: 'strategy_created',
        strategy,
        message: 'Campaign strategy developed',
      });

      // Step 2: Generate content calendar
      const contentCalendar = await this.generateContentCalendar(
        request,
        strategy,
      );
      this.websocketGateway.emitCampaignUpdate(request.sessionId, {
        step: 'content_calendar_created',
        contentCount: contentCalendar.length,
        message: 'Content calendar generated',
      });

      // Step 3: Calculate metrics
      const metrics = this.calculateCampaignMetrics(request, contentCalendar);

      // Step 4: Create campaign plan
      const campaignPlan: CampaignPlan = {
        id: `campaign_${Date.now()}`,
        title: request.title,
        objective: request.objective,
        strategy,
        contentCalendar,
        metrics,
        status: 'draft',
      };

      // Step 5: Schedule content items
      await this.scheduleContentItems(campaignPlan, request.sessionId);

      // Add campaign task to session
      this.stateManager.addTask(request.sessionId, {
        type: 'campaign_creation',
        status: 'completed',
        data: campaignPlan,
        result: campaignPlan,
      });

      // Notify completion
      this.websocketGateway.emitCampaignUpdate(request.sessionId, {
        step: 'campaign_completed',
        campaign: campaignPlan,
        message: 'Campaign successfully created and scheduled!',
      });

      this.logger.log(`Campaign created successfully: ${campaignPlan.id}`);
      return campaignPlan;
    } catch (error) {
      this.logger.error(
        `Failed to create campaign: ${error.message}`,
        error.stack,
      );

      this.websocketGateway.emitToSession(
        request.sessionId,
        'campaign_creation_error',
        {
          error: error.message,
          message: 'Failed to create campaign',
        },
      );

      throw error;
    }
  }

  private async createCampaignStrategy(
    request: CampaignRequest,
  ): Promise<CampaignStrategy> {
    // Simulate AI-powered strategy creation
    // In production, this would call trend scanner and AI services

    const strategies = {
      brand_awareness: {
        approach: 'Multi-touchpoint brand visibility campaign',
        keyMessages: [
          'Brand values',
          'Unique selling proposition',
          'Social proof',
        ],
        targetAudience:
          'Broad demographic with interest in ' + request.objective,
        postingFrequency: 'Daily posts with 2x engagement windows',
        engagementTactics: [
          'User-generated content',
          'Interactive polls',
          'Behind-the-scenes',
        ],
        trendAlignment: [
          'Current viral formats',
          'Platform-specific trends',
          'Seasonal relevance',
        ],
      },
      lead_generation: {
        approach: 'Conversion-focused content funnel',
        keyMessages: [
          'Problem identification',
          'Solution demonstration',
          'Clear call-to-action',
        ],
        targetAudience: 'Qualified prospects in target market',
        postingFrequency: '3-4 strategic posts per week',
        engagementTactics: [
          'Educational content',
          'Free resources',
          'Social proof',
        ],
        trendAlignment: [
          'Educational trends',
          'Problem-solving content',
          'Industry insights',
        ],
      },
      engagement: {
        approach: 'Community-building and interaction focus',
        keyMessages: [
          'Community values',
          'Shared experiences',
          'Interactive elements',
        ],
        targetAudience: 'Existing followers and community members',
        postingFrequency: 'Daily with emphasis on real-time interaction',
        engagementTactics: [
          'Live sessions',
          'Q&A content',
          'Community challenges',
        ],
        trendAlignment: [
          'Interactive trends',
          'Community-driven content',
          'Real-time events',
        ],
      },
    };

    // Determine strategy type based on objective
    const objectiveLower = request.objective.toLowerCase();
    let strategyType = 'engagement'; // default

    if (
      objectiveLower.includes('brand') ||
      objectiveLower.includes('awareness')
    ) {
      strategyType = 'brand_awareness';
    } else if (
      objectiveLower.includes('lead') ||
      objectiveLower.includes('sales') ||
      objectiveLower.includes('conversion')
    ) {
      strategyType = 'lead_generation';
    }

    return strategies[strategyType];
  }

  private async generateContentCalendar(
    request: CampaignRequest,
    strategy: CampaignStrategy,
  ): Promise<ContentItem[]> {
    const contentCalendar: ContentItem[] = [];
    const startDate = request.startDate || new Date();

    // Calculate posts per day based on duration and frequency
    const postsPerWeek = this.getPostsPerWeek(strategy.postingFrequency);
    const totalPosts = Math.ceil((request.duration / 7) * postsPerWeek);

    for (let i = 0; i < totalPosts; i++) {
      const daysOffset =
        Math.floor((i / postsPerWeek) * 7) + (i % postsPerWeek);
      const scheduledDate = new Date(startDate);
      scheduledDate.setDate(scheduledDate.getDate() + daysOffset);

      // Vary content types
      const contentType = this.selectContentType(request.contentTypes, i);

      const contentItem: ContentItem = {
        id: `content_${Date.now()}_${i}`,
        type: contentType,
        title: this.generateContentTitle(contentType, strategy, i),
        content: this.generateContentText(contentType, strategy, request),
        channels: request.targetChannels,
        scheduledDate,
        status: 'planned',
        hashtags: this.generateHashtags(request.objective, contentType),
        mentions: [],
      };

      contentCalendar.push(contentItem);
    }

    return contentCalendar;
  }

  private getPostsPerWeek(frequency: string): number {
    const frequencyMap = {
      daily: 7,
      'daily with 2x engagement windows': 10,
      '3-4 strategic posts per week': 3.5,
      'daily with emphasis on real-time interaction': 8,
    };

    return frequencyMap[frequency] || 5; // default 5 posts per week
  }

  private selectContentType(
    allowedTypes: string[],
    index: number,
  ): ContentItem['type'] {
    if (allowedTypes.includes('video') && index % 4 === 0) return 'video';
    if (allowedTypes.includes('image') && index % 3 === 0) return 'image';
    if (allowedTypes.includes('story') && index % 5 === 0) return 'story';
    return 'post';
  }

  private generateContentTitle(
    type: ContentItem['type'],
    strategy: CampaignStrategy,
    index: number,
  ): string {
    const titleTemplates = {
      post: [
        `${strategy.keyMessages[index % strategy.keyMessages.length]} - Day ${index + 1}`,
        `Sharing insights: ${strategy.keyMessages[index % strategy.keyMessages.length]}`,
        `Community update: ${strategy.keyMessages[index % strategy.keyMessages.length]}`,
      ],
      video: [
        `Video: ${strategy.keyMessages[index % strategy.keyMessages.length]}`,
        `Behind the scenes: ${strategy.keyMessages[index % strategy.keyMessages.length]}`,
        `Tutorial: ${strategy.keyMessages[index % strategy.keyMessages.length]}`,
      ],
      image: [
        `Visual story: ${strategy.keyMessages[index % strategy.keyMessages.length]}`,
        `Infographic: ${strategy.keyMessages[index % strategy.keyMessages.length]}`,
        `Photo series: ${strategy.keyMessages[index % strategy.keyMessages.length]}`,
      ],
      story: [
        `Quick update: ${strategy.keyMessages[index % strategy.keyMessages.length]}`,
        `Daily moment: ${strategy.keyMessages[index % strategy.keyMessages.length]}`,
        `Behind scenes: ${strategy.keyMessages[index % strategy.keyMessages.length]}`,
      ],
    };

    const templates = titleTemplates[type];
    return templates[index % templates.length];
  }

  private generateContentText(
    type: ContentItem['type'],
    strategy: CampaignStrategy,
    request: CampaignRequest,
  ): string {
    const baseContent = `Creating engaging ${type} content focused on ${request.objective}. `;
    const strategyContent = `Our approach: ${strategy.approach}. `;
    const audienceContent = `Targeting: ${strategy.targetAudience}. `;

    return (
      baseContent +
      strategyContent +
      audienceContent +
      'What do you think? Let us know in the comments!'
    );
  }

  private generateHashtags(
    objective: string,
    contentType: ContentItem['type'],
  ): string[] {
    const baseHashtags = ['#socialmedia', '#content', '#marketing'];
    const objectiveHashtags = objective
      .toLowerCase()
      .split(' ')
      .map((word) => `#${word}`);
    const typeHashtags = [`#${contentType}`, `#${contentType}content`];

    return [
      ...baseHashtags,
      ...objectiveHashtags.slice(0, 2),
      ...typeHashtags,
    ].slice(0, 8);
  }

  private calculateCampaignMetrics(
    request: CampaignRequest,
    contentCalendar: ContentItem[],
  ): CampaignMetrics {
    // Calculate estimated metrics based on content and channels
    const channelMultiplier = request.targetChannels.length;
    const contentCount = contentCalendar.length;

    return {
      targetReach: contentCount * channelMultiplier * 1000, // Estimated reach per post
      expectedEngagement: contentCount * channelMultiplier * 50, // Estimated engagement
      estimatedBudget: request.budget || contentCount * 25, // $25 per content piece
      contentCount,
      channelsCount: channelMultiplier,
    };
  }

  private async scheduleContentItems(
    campaign: CampaignPlan,
    sessionId: string,
  ): Promise<void> {
    // TODO: Integrate with calendar service once circular dependency is resolved
    this.logger.log(
      `Would schedule ${campaign.contentCalendar.length} content items`,
    );

    // Notify that scheduling is complete (mock)
    this.websocketGateway.emitToSession(sessionId, 'content_scheduled', {
      campaignId: campaign.id,
      itemsScheduled: campaign.contentCalendar.length,
      message: 'Content items have been prepared for scheduling',
    });
  }

  async getCampaignStatus(campaignId: string, sessionId: string): Promise<any> {
    const tasks = this.stateManager.getTasks(sessionId);
    const campaignTask = tasks.find(
      (task) =>
        task.type === 'campaign_creation' && task.result?.id === campaignId,
    );

    if (!campaignTask) {
      throw new Error('Campaign not found');
    }

    return campaignTask.result;
  }

  async updateCampaignStatus(
    campaignId: string,
    status: CampaignPlan['status'],
    sessionId: string,
  ): Promise<void> {
    const tasks = this.stateManager.getTasks(sessionId);
    const campaignTask = tasks.find(
      (task) =>
        task.type === 'campaign_creation' && task.result?.id === campaignId,
    );

    if (campaignTask && campaignTask.result) {
      campaignTask.result.status = status;

      this.websocketGateway.emitCampaignUpdate(sessionId, {
        campaignId,
        status,
        message: `Campaign status updated to ${status}`,
      });
    }
  }
}
