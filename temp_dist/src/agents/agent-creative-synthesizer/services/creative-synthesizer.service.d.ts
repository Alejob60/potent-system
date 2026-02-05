import { Repository } from 'typeorm';
import { CreativeSynthesizerCreation } from '../entities/creative-synthesizer.entity';
import { CreateContentDto } from '../dto/create-content.dto';
import { PublishContentDto } from '../dto/publish-content.dto';
import { ClientProxy } from '@nestjs/microservices';
export declare class CreativeSynthesizerService {
    private readonly creationRepository;
    private readonly serviceBusClient;
    constructor(creationRepository: Repository<CreativeSynthesizerCreation>, serviceBusClient: ClientProxy);
    processCreationRequest(createContentDto: CreateContentDto): Promise<any>;
    publishContent(publishContentDto: PublishContentDto): Promise<any>;
    getCreationsBySession(sessionId: string): Promise<CreativeSynthesizerCreation[]>;
    getCreationStatus(): Promise<any>;
    updateCreationStatus(creationId: string, status: string, assetUrl?: string, generationTime?: number, qualityScore?: number): Promise<void>;
    findAll(): Promise<CreativeSynthesizerCreation[]>;
    findOne(id: string): Promise<CreativeSynthesizerCreation | null>;
    private generateSasUrl;
    private generateEmotionalNarrative;
    private generateSuggestions;
}
