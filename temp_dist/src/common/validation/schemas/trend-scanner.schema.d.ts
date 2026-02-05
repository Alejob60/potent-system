import { z } from 'zod';
export declare const trendScannerSchema: z.ZodObject<{
    sessionId: z.ZodString;
    platform: z.ZodEnum<["tiktok", "instagram", "twitter", "facebook", "youtube"]>;
    topic: z.ZodString;
    dateRange: z.ZodOptional<z.ZodEnum<["last_7_days", "last_30_days", "custom"]>>;
    detailLevel: z.ZodOptional<z.ZodEnum<["basic", "standard", "comprehensive"]>>;
    region: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    sessionId: string;
    platform: "facebook" | "instagram" | "twitter" | "tiktok" | "youtube";
    topic: string;
    detailLevel?: "basic" | "standard" | "comprehensive" | undefined;
    region?: string | undefined;
    dateRange?: "last_30_days" | "last_7_days" | "custom" | undefined;
}, {
    sessionId: string;
    platform: "facebook" | "instagram" | "twitter" | "tiktok" | "youtube";
    topic: string;
    detailLevel?: "basic" | "standard" | "comprehensive" | undefined;
    region?: string | undefined;
    dateRange?: "last_30_days" | "last_7_days" | "custom" | undefined;
}>;
export type TrendScannerDto = z.infer<typeof trendScannerSchema>;
