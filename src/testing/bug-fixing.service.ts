import { Injectable, Logger } from '@nestjs/common';

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

@Injectable()
export class BugFixingService {
  private readonly logger = new Logger(BugFixingService.name);
  private bugs: BugReport[] = [];

  /**
   * Report a new bug
   * @param bug Bug report details
   * @returns The created bug report
   */
  reportBug(bug: Omit<BugReport, 'id' | 'status' | 'createdAt' | 'updatedAt'>): BugReport {
    const newBug: BugReport = {
      id: this.generateBugId(),
      ...bug,
      status: 'reported',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    this.bugs.push(newBug);
    this.logger.log(`Bug reported: ${newBug.title} (ID: ${newBug.id})`);

    return newBug;
  }

  /**
   * Get all bugs
   * @returns Array of all bug reports
   */
  getAllBugs(): BugReport[] {
    return this.bugs;
  }

  /**
   * Get bugs by status
   * @param status Bug status
   * @returns Array of bug reports with the specified status
   */
  getBugsByStatus(status: BugReport['status']): BugReport[] {
    return this.bugs.filter(bug => bug.status === status);
  }

  /**
   * Get bugs by severity
   * @param severity Bug severity
   * @returns Array of bug reports with the specified severity
   */
  getBugsBySeverity(severity: BugReport['severity']): BugReport[] {
    return this.bugs.filter(bug => bug.severity === severity);
  }

  /**
   * Assign a bug to a developer
   * @param bugId Bug ID
   * @param assignee Developer name
   * @returns Updated bug report or null if not found
   */
  assignBug(bugId: string, assignee: string): BugReport | null {
    const bug = this.bugs.find(b => b.id === bugId);
    if (!bug) {
      return null;
    }

    bug.assignedTo = assignee;
    bug.status = 'in-progress';
    bug.updatedAt = new Date();

    this.logger.log(`Bug ${bugId} assigned to ${assignee}`);

    return bug;
  }

  /**
   * Fix a bug
   * @param bugId Bug ID
   * @param fixDetails Details about the fix
   * @returns Bug fix result
   */
  async fixBug(bugId: string, fixDetails: any): Promise<BugFixResult> {
    const bug = this.bugs.find(b => b.id === bugId);
    if (!bug) {
      return {
        bugId,
        status: 'failed',
        message: 'Bug not found',
      };
    }

    try {
      // In a real implementation, this would apply the actual fix
      // For now, we'll simulate the fix process
      await new Promise(resolve => setTimeout(resolve, 100));

      bug.status = 'fixed';
      bug.updatedAt = new Date();
      bug.fixApproach = fixDetails.approach;

      this.logger.log(`Bug ${bugId} fixed successfully`);

      return {
        bugId,
        status: 'fixed',
        message: 'Bug fixed successfully',
        fixDetails,
      };
    } catch (error) {
      this.logger.error(`Failed to fix bug ${bugId}: ${error.message}`);

      return {
        bugId,
        status: 'failed',
        message: `Failed to fix bug: ${error.message}`,
      };
    }
  }

  /**
   * Verify a bug fix
   * @param bugId Bug ID
   * @returns Updated bug report or null if not found
   */
  verifyBugFix(bugId: string): BugReport | null {
    const bug = this.bugs.find(b => b.id === bugId);
    if (!bug || bug.status !== 'fixed') {
      return null;
    }

    bug.status = 'verified';
    bug.updatedAt = new Date();

    this.logger.log(`Bug fix for ${bugId} verified successfully`);

    return bug;
  }

  /**
   * Get bug fixing statistics
   * @returns Bug fixing statistics
   */
  getBugFixingStats(): {
    totalBugs: number;
    fixedBugs: number;
    inProgressBugs: number;
    reportedBugs: number;
    criticalBugs: number;
    highBugs: number;
  } {
    const totalBugs = this.bugs.length;
    const fixedBugs = this.bugs.filter(b => b.status === 'fixed' || b.status === 'verified').length;
    const inProgressBugs = this.bugs.filter(b => b.status === 'in-progress').length;
    const reportedBugs = this.bugs.filter(b => b.status === 'reported').length;
    const criticalBugs = this.bugs.filter(b => b.severity === 'critical').length;
    const highBugs = this.bugs.filter(b => b.severity === 'high').length;

    return {
      totalBugs,
      fixedBugs,
      inProgressBugs,
      reportedBugs,
      criticalBugs,
      highBugs,
    };
  }

  /**
   * Generate bug report
   * @returns Formatted bug report
   */
  generateBugReport(): string {
    const stats = this.getBugFixingStats();
    
    let report = '=== Bug Fixing Report ===\n';
    report += `Total Bugs: ${stats.totalBugs}\n`;
    report += `Fixed Bugs: ${stats.fixedBugs}\n`;
    report += `In Progress Bugs: ${stats.inProgressBugs}\n`;
    report += `Reported Bugs: ${stats.reportedBugs}\n`;
    report += `Critical Bugs: ${stats.criticalBugs}\n`;
    report += `High Severity Bugs: ${stats.highBugs}\n`;
    report += `\n`;

    // Add details of critical and high severity bugs
    const criticalBugs = this.getBugsBySeverity('critical');
    const highBugs = this.getBugsBySeverity('high');

    if (criticalBugs.length > 0) {
      report += 'Critical Bugs:\n';
      for (const bug of criticalBugs) {
        report += `  [${bug.id}] ${bug.title} - ${bug.status}\n`;
      }
      report += `\n`;
    }

    if (highBugs.length > 0) {
      report += 'High Severity Bugs:\n';
      for (const bug of highBugs) {
        report += `  [${bug.id}] ${bug.title} - ${bug.status}\n`;
      }
      report += `\n`;
    }

    return report;
  }

  /**
   * Generate a unique bug ID
   * @returns Unique bug ID
   */
  private generateBugId(): string {
    return `BUG-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
  }
}