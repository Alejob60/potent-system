import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConsentManagementService } from './consent-management.service';
import { PrivacyControlsService } from './privacy-controls.service';
import { ComplianceService } from './compliance.service';
import { ConsentRecord } from '../../entities/consent-record.entity';
import { ConsentPreferences } from '../../entities/consent-preferences.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      ConsentRecord,
      ConsentPreferences,
    ]),
  ],
  providers: [
    ConsentManagementService,
    PrivacyControlsService,
    ComplianceService,
  ],
  exports: [
    ConsentManagementService,
    PrivacyControlsService,
    ComplianceService,
  ],
})
export class PrivacyConsentModule {}