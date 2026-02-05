"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var BugFixingService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.BugFixingService = void 0;
const common_1 = require("@nestjs/common");
let BugFixingService = BugFixingService_1 = class BugFixingService {
    constructor() {
        this.logger = new common_1.Logger(BugFixingService_1.name);
        this.bugs = [];
    }
    reportBug(bug) {
        const newBug = {
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
    getAllBugs() {
        return this.bugs;
    }
    getBugsByStatus(status) {
        return this.bugs.filter(bug => bug.status === status);
    }
    getBugsBySeverity(severity) {
        return this.bugs.filter(bug => bug.severity === severity);
    }
    assignBug(bugId, assignee) {
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
    async fixBug(bugId, fixDetails) {
        const bug = this.bugs.find(b => b.id === bugId);
        if (!bug) {
            return {
                bugId,
                status: 'failed',
                message: 'Bug not found',
            };
        }
        try {
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
        }
        catch (error) {
            this.logger.error(`Failed to fix bug ${bugId}: ${error.message}`);
            return {
                bugId,
                status: 'failed',
                message: `Failed to fix bug: ${error.message}`,
            };
        }
    }
    verifyBugFix(bugId) {
        const bug = this.bugs.find(b => b.id === bugId);
        if (!bug || bug.status !== 'fixed') {
            return null;
        }
        bug.status = 'verified';
        bug.updatedAt = new Date();
        this.logger.log(`Bug fix for ${bugId} verified successfully`);
        return bug;
    }
    getBugFixingStats() {
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
    generateBugReport() {
        const stats = this.getBugFixingStats();
        let report = '=== Bug Fixing Report ===\n';
        report += `Total Bugs: ${stats.totalBugs}\n`;
        report += `Fixed Bugs: ${stats.fixedBugs}\n`;
        report += `In Progress Bugs: ${stats.inProgressBugs}\n`;
        report += `Reported Bugs: ${stats.reportedBugs}\n`;
        report += `Critical Bugs: ${stats.criticalBugs}\n`;
        report += `High Severity Bugs: ${stats.highBugs}\n`;
        report += `\n`;
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
    generateBugId() {
        return `BUG-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    }
};
exports.BugFixingService = BugFixingService;
exports.BugFixingService = BugFixingService = BugFixingService_1 = __decorate([
    (0, common_1.Injectable)()
], BugFixingService);
//# sourceMappingURL=bug-fixing.service.js.map