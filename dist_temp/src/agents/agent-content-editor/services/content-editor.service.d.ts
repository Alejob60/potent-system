import { Repository } from 'typeorm';
import { ContentEditTask, ContentEditStatus } from '../entities/content-edit-task.entity';
import { EditContentDto } from '../dto/edit-content.dto';
import { HttpService } from '@nestjs/axios';
export declare class ContentEditorService {
    private readonly contentEditTaskRepository;
    private readonly httpService;
    private readonly logger;
    constructor(contentEditTaskRepository: Repository<ContentEditTask>, httpService: HttpService);
    editContent(editContentDto: EditContentDto): Promise<ContentEditTask>;
    validateAsset(editContentDto: EditContentDto): Promise<boolean>;
    getContentEditTask(assetId: string): Promise<ContentEditTask | null>;
    getContentEditTasksBySession(sessionId: string): Promise<ContentEditTask[]>;
    updateTaskStatus(assetId: string, status: ContentEditStatus): Promise<ContentEditTask | null>;
    generateSasUrl(url: string): string;
    generateNarrative(emotion: string, platform: string, status: ContentEditStatus): string;
    generateSuggestions(platform: string, emotion: string): string[];
    private getPlatformRequirements;
    private callMoviePyService;
}
