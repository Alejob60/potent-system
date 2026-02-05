import { ContentEditorService } from '../services/content-editor.service';
import { EditContentDto } from '../dto/edit-content.dto';
import { ContentEditStatus } from '../entities/content-edit-task.entity';
export declare class ContentEditorController {
    private readonly contentEditorService;
    private readonly logger;
    constructor(contentEditorService: ContentEditorService);
    editContent(editContentDto: EditContentDto): Promise<{
        narrative: string;
        suggestions: string[];
        id: string;
        assetId: string;
        platform: string;
        emotion: string;
        campaignId: string;
        editingProfile: any;
        status: ContentEditStatus;
        sasUrl: string;
        createdAt: Date;
        updatedAt: Date;
    }>;
    getContentEditStatus(assetId: string): Promise<{
        narrative: string;
        suggestions: string[];
        id: string;
        assetId: string;
        platform: string;
        emotion: string;
        campaignId: string;
        editingProfile: any;
        status: ContentEditStatus;
        sasUrl: string;
        createdAt: Date;
        updatedAt: Date;
    }>;
    getContentEditTasksBySession(sessionId: string): Promise<import("../entities/content-edit-task.entity").ContentEditTask[]>;
}
