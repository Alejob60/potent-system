export declare class ActivateRouteDto {
    routeType: string;
    sessionId: string;
    emotion: string;
    platforms: string[];
    agents: string[];
    schedule: {
        start: string;
        end: string;
    };
    metadata?: any;
}
