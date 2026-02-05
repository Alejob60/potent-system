export declare class DataWarehouse {
    id: string;
    name: string;
    dataSource: string;
    tableName: string;
    schema: any;
    description: string;
    isActive: boolean;
    owner: string;
    permissions: any;
    etlPipelineId: string;
    lastProcessedAt: Date;
    recordCount: number;
    status: string;
    createdAt: Date;
    updatedAt: Date;
}
