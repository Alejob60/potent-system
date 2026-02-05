export declare enum ContentEditStatus {
    RECEIVED = "received",
    EDITING = "editing",
    VALIDATED = "validated",
    EDITED = "edited",
    FAILED = "failed"
}
export declare class ContentEditTask {
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
}
