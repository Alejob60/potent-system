export interface TrainingResult {
    agent: string;
    success: boolean;
    result?: {
        agent: string;
        improvements: {
            creativity: number;
            effectiveness: number;
            emotionalResonance: number;
        };
        sessionId: string;
    };
    error?: string;
}
