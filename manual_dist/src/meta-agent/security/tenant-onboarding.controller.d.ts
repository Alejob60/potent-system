import { TenantOnboardingService } from './tenant-onboarding.service';
export declare class TenantOnboardingController {
    private readonly onboardingService;
    constructor(onboardingService: TenantOnboardingService);
    startOnboarding(tenantId: string): Promise<{
        success: boolean;
        data: import("./tenant-onboarding.service").TenantOnboardingStatus;
        message: string;
        error?: undefined;
    } | {
        success: boolean;
        error: any;
        message: string;
        data?: undefined;
    }>;
    getOnboardingStatus(tenantId: string): Promise<{
        success: boolean;
        data: import("./tenant-onboarding.service").TenantOnboardingStatus;
        message: string;
        error?: undefined;
    } | {
        success: boolean;
        message: string;
        data?: undefined;
        error?: undefined;
    } | {
        success: boolean;
        error: any;
        message: string;
        data?: undefined;
    }>;
    completeOnboardingStep(tenantId: string, stepId: string, data?: any): Promise<{
        success: boolean;
        data: import("./tenant-onboarding.service").TenantOnboardingStatus;
        message: string;
        error?: undefined;
    } | {
        success: boolean;
        error: any;
        message: string;
        data?: undefined;
    }>;
    skipOnboardingStep(tenantId: string, stepId: string): Promise<{
        success: boolean;
        data: import("./tenant-onboarding.service").TenantOnboardingStatus;
        message: string;
        error?: undefined;
    } | {
        success: boolean;
        error: any;
        message: string;
        data?: undefined;
    }>;
    resetOnboarding(tenantId: string): Promise<{
        success: boolean;
        data: import("./tenant-onboarding.service").TenantOnboardingStatus;
        message: string;
        error?: undefined;
    } | {
        success: boolean;
        error: any;
        message: string;
        data?: undefined;
    }>;
}
