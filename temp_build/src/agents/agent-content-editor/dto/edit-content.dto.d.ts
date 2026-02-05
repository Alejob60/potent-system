export declare class EditingProfile {
    resolution: string;
    durationLimit: string;
    aspectRatio: string;
    style: string;
    tags: string[];
}
export declare class EditContentDto {
    assetId: string;
    platform: string;
    emotion: string;
    campaignId: string;
    editingProfile: EditingProfile;
}
