import { z } from 'zod'; // Importing zod for schema validation

export const trendScannerSchema = z.object({
  sessionId: z.string().min(1, "Session ID is required"),
  platform: z.enum(['tiktok', 'instagram', 'twitter', 'facebook', 'youtube'], {
    errorMap: () => ({ message: "Platform must be one of: tiktok, instagram, twitter, facebook, youtube" }),
  }),
  topic: z.string().min(1, "Topic is required").max(100, "Topic must be less than 100 characters"),
  dateRange: z.enum(['last_7_days', 'last_30_days', 'custom']).optional(),
  detailLevel: z.enum(['basic', 'standard', 'comprehensive']).optional(),
  region: z.string().optional(),
});

export type TrendScannerDto = z.infer<typeof trendScannerSchema>;