import { CreativeSynthesizerService } from '../services/creative-synthesizer.service';
import { CreateContentDto } from '../dto/create-content.dto';
import { PublishContentDto } from '../dto/publish-content.dto';
export declare class CreativeSynthesizerController {
    private readonly creativeSynthesizerService;
    constructor(creativeSynthesizerService: CreativeSynthesizerService);
    processCreation(createContentDto: CreateContentDto): Promise<any>;
    publishContent(publishContentDto: PublishContentDto): Promise<any>;
    getCreationStatus(): Promise<any>;
    getCreationsBySession(sessionId: string): Promise<import("../entities/creative-synthesizer.entity").CreativeSynthesizerCreation[]>;
    getAllCreations(): Promise<import("../entities/creative-synthesizer.entity").CreativeSynthesizerCreation[]>;
    getCreationById(id: string): Promise<import("../entities/creative-synthesizer.entity").CreativeSynthesizerCreation | null>;
}
