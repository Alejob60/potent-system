"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.trendScannerSchema = void 0;
const zod_1 = require("zod");
exports.trendScannerSchema = zod_1.z.object({
    sessionId: zod_1.z.string().min(1, "Session ID is required"),
    platform: zod_1.z.enum(['tiktok', 'instagram', 'twitter', 'facebook', 'youtube'], {
        errorMap: () => ({ message: "Platform must be one of: tiktok, instagram, twitter, facebook, youtube" }),
    }),
    topic: zod_1.z.string().min(1, "Topic is required").max(100, "Topic must be less than 100 characters"),
    dateRange: zod_1.z.enum(['last_7_days', 'last_30_days', 'custom']).optional(),
    detailLevel: zod_1.z.enum(['basic', 'standard', 'comprehensive']).optional(),
    region: zod_1.z.string().optional(),
});
//# sourceMappingURL=trend-scanner.schema.js.map