import { IsString, IsDateString, IsNumber } from 'class-validator';

export class CampaignMilestonesDto {
  @IsString()
  campaignId: string;

  @IsString()
  campaignTitle: string;

  @IsDateString()
  startDate: string;

  @IsNumber()
  duration: number;

  @IsString()
  sessionId: string;
}
