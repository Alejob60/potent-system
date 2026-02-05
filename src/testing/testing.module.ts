import { Module } from '@nestjs/common';
import { TestingService } from './testing.service';
import { PerformanceTestingService } from './performance-testing.service';
import { SecurityTestingService } from './security-testing.service';
import { IntegrationTestingService } from './integration-testing.service';
import { BugFixingService } from './bug-fixing.service';

@Module({
  providers: [
    TestingService,
    PerformanceTestingService,
    SecurityTestingService,
    IntegrationTestingService,
    BugFixingService,
  ],
  exports: [
    TestingService,
    PerformanceTestingService,
    SecurityTestingService,
    IntegrationTestingService,
    BugFixingService,
  ],
})
export class TestingModule {}