export declare class ConsentRecord {
    id: string;
    user_id: string;
    document_id: string;
    consented: boolean;
    consented_at: Date;
    withdrawn_at: Date;
    purpose: string;
    categories: string[];
    ip_address: string;
    user_agent: string;
    created_at: Date;
    updated_at: Date;
}
