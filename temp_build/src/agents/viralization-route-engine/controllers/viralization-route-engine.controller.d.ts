import { ViralizationRouteEngineService } from '../services/viralization-route-engine.service';
import { ActivateRouteDto } from '../dto/activate-route.dto';
export declare class ViralizationRouteEngineController {
    private readonly viralizationRouteEngineService;
    constructor(viralizationRouteEngineService: ViralizationRouteEngineService);
    activateRoute(activateRouteDto: ActivateRouteDto, authHeader: string): Promise<any>;
    getRouteStatus(routeId: string): Promise<any>;
    getRoutesBySession(sessionId: string): Promise<import("../entities/viralization-route.entity").ViralizationRoute[]>;
    private extractUserIdFromToken;
}
