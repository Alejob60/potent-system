export interface BugReport {
    id: string;
    title: string;
    description: string;
    severity: 'low' | 'medium' | 'high' | 'critical';
    status: 'reported' | 'in-progress' | 'fixed' | 'verified';
    assignedTo?: string;
    createdAt: Date;
    updatedAt: Date;
    testReference?: string;
    reproductionSteps?: string[];
    fixApproach?: string;
}
export interface BugFixResult {
    bugId: string;
    status: 'fixed' | 'failed' | 'partially-fixed';
    message: string;
    fixDetails?: any;
}
export declare class BugFixingService {
    private readonly logger;
    private bugs;
    reportBug(bug: Omit<BugReport, 'id' | 'status' | 'createdAt' | 'updatedAt'>): BugReport;
    getAllBugs(): BugReport[];
    getBugsByStatus(status: BugReport['status']): BugReport[];
    getBugsBySeverity(severity: BugReport['severity']): BugReport[];
    assignBug(bugId: string, assignee: string): BugReport | null;
    fixBug(bugId: string, fixDetails: any): Promise<BugFixResult>;
    verifyBugFix(bugId: string): BugReport | null;
    getBugFixingStats(): {
        totalBugs: number;
        fixedBugs: number;
        inProgressBugs: number;
        reportedBugs: number;
        criticalBugs: number;
        highBugs: number;
    };
    generateBugReport(): string;
    private generateBugId;
}
