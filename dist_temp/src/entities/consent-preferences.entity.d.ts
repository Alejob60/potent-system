export declare class ConsentPreferences {
    id: string;
    user_id: string;
    preferences: {
        marketing_emails?: boolean;
        analytics?: boolean;
        personalized_content?: boolean;
        data_sharing?: boolean;
    };
    created_at: Date;
    updated_at: Date;
}
