import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';

export interface UATConfig {
  userStories: Array<{
    id: string;
    title: string;
    description: string;
    priority: 'low' | 'medium' | 'high' | 'critical';
    acceptanceCriteria: Array<{
      id: string;
      description: string;
      testSteps: Array<{
        step: number;
        action: string;
        expectedOutcome: string;
      }>;
      endpoint?: string;
      method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
      payload?: any;
      expectedStatus?: number;
    }>;
  }>;
  testUsers: Array<{
    id: string;
    name: string;
    role: string;
    credentials: {
      username: string;
      password: string;
    };
  }>;
  testEnvironment: {
    baseUrl: string;
    timeout: number;
    retryAttempts: number;
    retryDelay: number;
  };
  uatMetrics: {
    minPassRate: number; // percentage
    maxCriticalFailures: number;
    maxHighPriorityFailures: number;
  };
}

export interface UATTestResult {
  userStoryId: string;
  userStoryTitle: string;
  criterionId: string;
  status: 'passed' | 'failed' | 'blocked';
  message: string;
  timestamp: Date;
  tester: string;
  executionTime: number;
  details?: any;
}

export interface UserStoryResult {
  userStoryId: string;
  userStoryTitle: string;
  status: 'passed' | 'failed' | 'partial';
  totalCriteria: number;
  passedCriteria: number;
  failedCriteria: number;
  blockedCriteria: number;
  results: UATTestResult[];
  priority: 'low' | 'medium' | 'high' | 'critical';
}

export interface UATTestingReport {
  overallStatus: 'passed' | 'failed' | 'partial';
  totalUserStories: number;
  passedUserStories: number;
  failedUserStories: number;
  totalCriteria: number;
  passedCriteria: number;
  failedCriteria: number;
  blockedCriteria: number;
  userStoryResults: UserStoryResult[];
  summary: {
    criticalStories: number;
    highPriorityStories: number;
    mediumPriorityStories: number;
    lowPriorityStories: number;
    passedCriticalStories: number;
    passedHighPriorityStories: number;
    criticalFailures: number;
    highPriorityFailures: number;
  };
  timestamp: Date;
  duration: number;
}

@Injectable()
export class UserAcceptanceTestingService {
  private readonly logger = new Logger(UserAcceptanceTestingService.name);
  private config: UATConfig;

  constructor(private readonly httpService: HttpService) {}

  /**
   * Configure the UAT service
   * @param config UAT configuration
   */
  configure(config: UATConfig): void {
    this.config = config;
    this.logger.log(`UAT service configured with ${config.userStories.length} user stories`);
  }

  /**
   * Execute user acceptance tests
   * @returns Testing report
   */
  async executeUAT(): Promise<UATTestingReport> {
    const startTime = Date.now();
    this.logger.log('Starting user acceptance testing process');

    const userStoryResults: UserStoryResult[] = [];
    let totalCriteria = 0;
    let passedCriteria = 0;
    let failedCriteria = 0;
    let blockedCriteria = 0;

    // Execute tests for each user story
    for (const userStory of this.config.userStories) {
      try {
        const storyResult = await this.executeUserStoryTests(userStory);
        userStoryResults.push(storyResult);
        
        totalCriteria += storyResult.totalCriteria;
        passedCriteria += storyResult.passedCriteria;
        failedCriteria += storyResult.failedCriteria;
        blockedCriteria += storyResult.blockedCriteria;
      } catch (error) {
        const failedStoryResult: UserStoryResult = {
          userStoryId: userStory.id,
          userStoryTitle: userStory.title,
          status: 'failed',
          totalCriteria: 0,
          passedCriteria: 0,
          failedCriteria: 0,
          blockedCriteria: 0,
          results: [{
            userStoryId: userStory.id,
            userStoryTitle: userStory.title,
            criterionId: 'execution_failure',
            status: 'failed',
            message: `User story execution failed: ${error.message}`,
            timestamp: new Date(),
            tester: 'system',
            executionTime: 0,
          }],
          priority: userStory.priority,
        };
        userStoryResults.push(failedStoryResult);
        this.logger.error(`User story ${userStory.id} execution failed: ${error.message}`);
      }
    }

    const duration = Date.now() - startTime;
    const summary = this.generateSummary(userStoryResults);
    const overallStatus = this.determineOverallStatus(summary, failedCriteria, blockedCriteria);

    const report: UATTestingReport = {
      overallStatus,
      totalUserStories: this.config.userStories.length,
      passedUserStories: userStoryResults.filter(s => s.status === 'passed').length,
      failedUserStories: userStoryResults.filter(s => s.status === 'failed').length,
      totalCriteria,
      passedCriteria,
      failedCriteria,
      blockedCriteria,
      userStoryResults,
      summary,
      timestamp: new Date(),
      duration,
    };

    this.logger.log(`User acceptance testing completed: ${overallStatus}`);
    return report;
  }

  /**
   * Execute tests for a user story
   * @param userStory User story
   * @returns User story result
   */
  private async executeUserStoryTests(
    userStory: UATConfig['userStories'][0]
  ): Promise<UserStoryResult> {
    this.logger.log(`Executing tests for user story: ${userStory.title}`);

    const results: UATTestResult[] = [];
    let passedCriteria = 0;
    let failedCriteria = 0;
    let blockedCriteria = 0;

    // Execute tests for each acceptance criterion
    for (const criterion of userStory.acceptanceCriteria) {
      try {
        // Select a tester (in a real scenario, you might want to assign specific testers)
        const tester = this.config.testUsers.length > 0 
          ? this.config.testUsers[0].name 
          : 'default_tester';

        const result = await this.executeAcceptanceCriterion(criterion, tester);
        results.push(result);
        
        if (result.status === 'passed') {
          passedCriteria++;
        } else if (result.status === 'failed') {
          failedCriteria++;
        } else {
          blockedCriteria++;
        }
      } catch (error) {
        const failureResult: UATTestResult = {
          userStoryId: userStory.id,
          userStoryTitle: userStory.title,
          criterionId: criterion.id,
          status: 'failed',
          message: `Acceptance criterion execution failed: ${error.message}`,
          timestamp: new Date(),
          tester: 'system',
          executionTime: 0,
        };
        results.push(failureResult);
        failedCriteria++;
        this.logger.error(`Acceptance criterion ${criterion.id} execution failed: ${error.message}`);
      }
    }

    const status = this.determineUserStoryStatus(
      userStory.acceptanceCriteria.length,
      passedCriteria,
      failedCriteria,
      blockedCriteria
    );

    const storyResult: UserStoryResult = {
      userStoryId: userStory.id,
      userStoryTitle: userStory.title,
      status,
      totalCriteria: userStory.acceptanceCriteria.length,
      passedCriteria,
      failedCriteria,
      blockedCriteria,
      results,
      priority: userStory.priority,
    };

    this.logger.log(`User story ${userStory.id} completed: ${status} (${passedCriteria}/${userStory.acceptanceCriteria.length} criteria passed)`);
    return storyResult;
  }

  /**
   * Execute acceptance criterion
   * @param criterion Acceptance criterion
   * @param tester Tester name
   * @returns Test result
   */
  private async executeAcceptanceCriterion(
    criterion: UATConfig['userStories'][0]['acceptanceCriteria'][0],
    tester: string
  ): Promise<UATTestResult> {
    const startTime = Date.now();
    
    try {
      // If this is an API test criterion
      if (criterion.endpoint && criterion.method) {
        let lastError: Error | null = null;
        
        // Attempt with retries
        for (let attempt = 1; attempt <= this.config.testEnvironment.retryAttempts; attempt++) {
          try {
            let response: any;
            
            switch (criterion.method) {
              case 'GET':
                response = await firstValueFrom(
                  this.httpService.get(`${this.config.testEnvironment.baseUrl}${criterion.endpoint}`, {
                    timeout: this.config.testEnvironment.timeout,
                  })
                );
                break;
              case 'POST':
                response = await firstValueFrom(
                  this.httpService.post(
                    `${this.config.testEnvironment.baseUrl}${criterion.endpoint}`,
                    criterion.payload,
                    {
                      timeout: this.config.testEnvironment.timeout,
                    }
                  )
                );
                break;
              case 'PUT':
                response = await firstValueFrom(
                  this.httpService.put(
                    `${this.config.testEnvironment.baseUrl}${criterion.endpoint}`,
                    criterion.payload,
                    {
                      timeout: this.config.testEnvironment.timeout,
                    }
                  )
                );
                break;
              case 'DELETE':
                response = await firstValueFrom(
                  this.httpService.delete(`${this.config.testEnvironment.baseUrl}${criterion.endpoint}`, {
                    timeout: this.config.testEnvironment.timeout,
                  })
                );
                break;
              case 'PATCH':
                response = await firstValueFrom(
                  this.httpService.patch(
                    `${this.config.testEnvironment.baseUrl}${criterion.endpoint}`,
                    criterion.payload,
                    {
                      timeout: this.config.testEnvironment.timeout,
                    }
                  )
                );
                break;
            }
            
            const executionTime = Date.now() - startTime;
            
            // Check expected status if specified
            if (criterion.expectedStatus && response.status !== criterion.expectedStatus) {
              return {
                userStoryId: '', // Will be filled by caller
                userStoryTitle: '', // Will be filled by caller
                criterionId: criterion.id,
                status: 'failed',
                message: `Expected status ${criterion.expectedStatus}, got ${response.status}`,
                timestamp: new Date(),
                tester,
                executionTime,
                details: {
                  status: response.status,
                  data: response.data,
                },
              };
            }
            
            // If we get here, the test passed
            return {
              userStoryId: '', // Will be filled by caller
              userStoryTitle: '', // Will be filled by caller
              criterionId: criterion.id,
              status: 'passed',
              message: `Test passed with status ${response.status}`,
              timestamp: new Date(),
              tester,
              executionTime,
              details: {
                status: response.status,
                data: response.data,
              },
            };
          } catch (error) {
            lastError = error;
            
            if (attempt < this.config.testEnvironment.retryAttempts) {
              this.logger.warn(`Criterion ${criterion.id} test failed (attempt ${attempt}/${this.config.testEnvironment.retryAttempts}), retrying in ${this.config.testEnvironment.retryDelay}ms: ${error.message}`);
              await new Promise(resolve => setTimeout(resolve, this.config.testEnvironment.retryDelay));
            }
          }
        }
        
        // All retries failed
        const executionTime = Date.now() - startTime;
        return {
          userStoryId: '', // Will be filled by caller
          userStoryTitle: '', // Will be filled by caller
          criterionId: criterion.id,
          status: 'failed',
          message: `Test failed after ${this.config.testEnvironment.retryAttempts} attempts: ${lastError ? lastError.message : 'Unknown error'}`,
          timestamp: new Date(),
          tester,
          executionTime,
        };
      } else {
        // This is a manual test criterion - mark as blocked since we can't automate it
        const executionTime = Date.now() - startTime;
        return {
          userStoryId: '', // Will be filled by caller
          userStoryTitle: '', // Will be filled by caller
          criterionId: criterion.id,
          status: 'blocked',
          message: 'Manual test criterion - requires human verification',
          timestamp: new Date(),
          tester,
          executionTime,
        };
      }
    } catch (error) {
      const executionTime = Date.now() - startTime;
      return {
        userStoryId: '', // Will be filled by caller
        userStoryTitle: '', // Will be filled by caller
        criterionId: criterion.id,
        status: 'failed',
        message: `Test execution failed: ${error.message}`,
        timestamp: new Date(),
        tester,
        executionTime,
      };
    }
  }

  /**
   * Determine user story status
   * @param totalCriteria Total criteria
   * @param passedCriteria Passed criteria
   * @param failedCriteria Failed criteria
   * @param blockedCriteria Blocked criteria
   * @returns User story status
   */
  private determineUserStoryStatus(
    totalCriteria: number,
    passedCriteria: number,
    failedCriteria: number,
    blockedCriteria: number
  ): 'passed' | 'failed' | 'partial' {
    // If all criteria pass, the story passes
    if (passedCriteria === totalCriteria) {
      return 'passed';
    }
    
    // If there are failed criteria, the story fails
    if (failedCriteria > 0) {
      return 'failed';
    }
    
    // If there are only passed and blocked criteria, it's partial
    if (passedCriteria > 0 && blockedCriteria > 0) {
      return 'partial';
    }
    
    // Otherwise, it's failed
    return 'failed';
  }

  /**
   * Generate summary from user story results
   * @param userStoryResults User story results
   * @returns Summary statistics
   */
  private generateSummary(
    userStoryResults: UserStoryResult[]
  ): UATTestingReport['summary'] {
    const criticalStories = userStoryResults.filter(s => s.priority === 'critical').length;
    const highPriorityStories = userStoryResults.filter(s => s.priority === 'high').length;
    const mediumPriorityStories = userStoryResults.filter(s => s.priority === 'medium').length;
    const lowPriorityStories = userStoryResults.filter(s => s.priority === 'low').length;
    
    const passedCriticalStories = userStoryResults.filter(s => s.priority === 'critical' && s.status === 'passed').length;
    const passedHighPriorityStories = userStoryResults.filter(s => s.priority === 'high' && s.status === 'passed').length;
    
    const criticalFailures = userStoryResults.filter(s => s.priority === 'critical' && s.status === 'failed').length;
    const highPriorityFailures = userStoryResults.filter(s => s.priority === 'high' && s.status === 'failed').length;
    
    return {
      criticalStories,
      highPriorityStories,
      mediumPriorityStories,
      lowPriorityStories,
      passedCriticalStories,
      passedHighPriorityStories,
      criticalFailures,
      highPriorityFailures,
    };
  }

  /**
   * Determine overall status
   * @param summary Summary statistics
   * @param failedCriteria Failed criteria count
   * @param blockedCriteria Blocked criteria count
   * @returns Overall status
   */
  private determineOverallStatus(
    summary: UATTestingReport['summary'],
    failedCriteria: number,
    blockedCriteria: number
  ): 'passed' | 'failed' | 'partial' {
    // Check if critical thresholds are exceeded
    if (summary.criticalFailures > this.config.uatMetrics.maxCriticalFailures) {
      return 'failed';
    }
    
    if (summary.highPriorityFailures > this.config.uatMetrics.maxHighPriorityFailures) {
      return 'failed';
    }
    
    // Calculate pass rate
    const totalCriteria = failedCriteria + blockedCriteria;
    const passRate = totalCriteria > 0 ? (1 - (failedCriteria / totalCriteria)) * 100 : 100;
    
    if (passRate < this.config.uatMetrics.minPassRate) {
      return 'failed';
    }
    
    // If there are failed criteria, it's partial
    if (failedCriteria > 0) {
      return 'partial';
    }
    
    // If there are only passed and blocked criteria, it's partial
    if (blockedCriteria > 0) {
      return 'partial';
    }
    
    return 'passed';
  }

  /**
   * Get UAT configuration
   * @returns UAT configuration
   */
  getConfiguration(): UATConfig {
    return { ...this.config };
  }

  /**
   * Update UAT configuration
   * @param config New configuration
   */
  updateConfiguration(config: Partial<UATConfig>): void {
    this.config = { ...this.config, ...config };
    this.logger.log('UAT configuration updated');
  }

  /**
   * Add user story
   * @param userStory User story
   */
  addUserStory(userStory: UATConfig['userStories'][0]): void {
    this.config.userStories.push(userStory);
    this.logger.log(`Added user story ${userStory.id}: ${userStory.title}`);
  }

  /**
   * Add test user
   * @param testUser Test user
   */
  addTestUser(testUser: UATConfig['testUsers'][0]): void {
    this.config.testUsers.push(testUser);
    this.logger.log(`Added test user ${testUser.name}`);
  }

  /**
   * Remove user story
   * @param userStoryId User story ID
   */
  removeUserStory(userStoryId: string): void {
    this.config.userStories = this.config.userStories.filter(story => story.id !== userStoryId);
    this.logger.log(`Removed user story ${userStoryId}`);
  }

  /**
   * Remove test user
   * @param userId Test user ID
   */
  removeTestUser(userId: string): void {
    this.config.testUsers = this.config.testUsers.filter(user => user.id !== userId);
    this.logger.log(`Removed test user ${userId}`);
  }
}