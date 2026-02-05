import { SecretaryService, UserInput } from './secretary.service';
import { TenantRequest } from '../../common/guards/tenant.guard';
export declare class SecretaryController {
    private readonly secretaryService;
    constructor(secretaryService: SecretaryService);
    handleRequest(request: TenantRequest, payload: {
        input: UserInput;
    }): Promise<any>;
}
