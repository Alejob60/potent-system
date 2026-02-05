export declare class DataExportRequest {
    id: string;
    user_id: string;
    format: 'json' | 'csv' | 'pdf';
    include_conversations: boolean;
    include_sales: boolean;
    include_profile: boolean;
    status: 'pending' | 'processing' | 'completed' | 'failed';
    download_url: string;
    expires_at: Date;
    error_message: string;
    created_at: Date;
    updated_at: Date;
}
