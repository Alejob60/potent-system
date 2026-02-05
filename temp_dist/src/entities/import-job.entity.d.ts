export declare class ImportJob {
    id: string;
    instance_id: string;
    status: 'pending' | 'processing' | 'completed' | 'failed';
    total_rows: number;
    processed_rows: number;
    failed_rows: number;
    file_name: string;
    column_mapping: Record<string, string>;
    error: string;
    created_at: Date;
    updated_at: Date;
}
