export declare class ContextTurn {
    id: string;
    sessionId: string;
    bundleId: number;
    role: 'user' | 'agent';
    text: string;
    turnId: string;
    metadata: any;
    timestamp: Date;
}
