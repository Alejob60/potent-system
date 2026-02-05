"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var OperationalDocumentationService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.OperationalDocumentationService = void 0;
const common_1 = require("@nestjs/common");
const axios_1 = require("@nestjs/axios");
let OperationalDocumentationService = OperationalDocumentationService_1 = class OperationalDocumentationService {
    constructor(httpService) {
        this.httpService = httpService;
        this.logger = new common_1.Logger(OperationalDocumentationService_1.name);
        this.analytics = {
            views: 0,
            searches: 0,
            downloads: 0,
            feedback: [],
            popularDocuments: [],
        };
    }
    configure(config) {
        this.config = config;
        this.logger.log(`Documentation service configured with ${config.categories.length} categories`);
        if (this.config.search.indexing.enabled) {
            setInterval(() => {
                this.updateSearchIndex();
            }, this.config.search.indexing.frequency * 60 * 1000);
        }
    }
    getDocument(documentId) {
        for (const category of this.config.categories) {
            const document = category.documents.find(doc => doc.id === documentId);
            if (document) {
                this.analytics.views++;
                this.updatePopularDocuments(documentId, document.title);
                return document.content;
            }
        }
        return null;
    }
    searchDocumentation(query, category, tags) {
        this.analytics.searches++;
        const results = [];
        for (const cat of this.config.categories) {
            if (category && cat.name !== category) {
                continue;
            }
            for (const document of cat.documents) {
                if (tags && !tags.every(tag => document.tags.includes(tag))) {
                    continue;
                }
                const relevance = this.calculateRelevance(query, document);
                if (relevance > 10) {
                    const excerpt = this.extractExcerpt(document.content, query);
                    results.push({
                        documentId: document.id,
                        title: document.title,
                        excerpt,
                        relevance,
                        category: cat.name,
                        tags: document.tags,
                    });
                }
            }
        }
        results.sort((a, b) => b.relevance - a.relevance);
        return results.slice(0, 20);
    }
    calculateRelevance(query, document) {
        const queryLower = query.toLowerCase();
        const titleLower = document.title.toLowerCase();
        const contentLower = document.content.toLowerCase();
        const tagsLower = document.tags.map(tag => tag.toLowerCase());
        let relevance = 0;
        if (titleLower.includes(queryLower)) {
            relevance += 40;
        }
        const contentMatches = (contentLower.match(new RegExp(queryLower, 'g')) || []).length;
        relevance += Math.min(contentMatches * 5, 30);
        const tagMatches = tagsLower.filter(tag => tag.includes(queryLower)).length;
        relevance += Math.min(tagMatches * 10, 20);
        if (document.description.toLowerCase().includes(queryLower)) {
            relevance += 10;
        }
        return Math.min(relevance, 100);
    }
    extractExcerpt(content, query) {
        const queryLower = query.toLowerCase();
        const contentLower = content.toLowerCase();
        const queryIndex = contentLower.indexOf(queryLower);
        if (queryIndex === -1) {
            return content.substring(0, 150) + '...';
        }
        const start = Math.max(0, queryIndex - 75);
        const end = Math.min(content.length, queryIndex + query.length + 75);
        let excerpt = content.substring(start, end);
        if (start > 0) {
            excerpt = '...' + excerpt;
        }
        if (end < content.length) {
            excerpt = excerpt + '...';
        }
        return excerpt;
    }
    async generateDocumentation(templateName, variables, documentId) {
        const template = this.config.templates.find(t => t.name === templateName);
        if (!template) {
            throw new Error(`Template ${templateName} not found`);
        }
        try {
            for (const variable of template.variables) {
                if (!variables[variable]) {
                    throw new Error(`Missing required variable: ${variable}`);
                }
            }
            let content = template.content;
            for (const [key, value] of Object.entries(variables)) {
                content = content.replace(new RegExp(`{{${key}}}`, 'g'), value);
            }
            const timestamp = new Date();
            if (documentId) {
                for (const category of this.config.categories) {
                    const document = category.documents.find(doc => doc.id === documentId);
                    if (document) {
                        document.content = content;
                        document.lastUpdated = timestamp;
                        document.version = this.incrementVersion(document.version);
                        this.logger.log(`Updated documentation ${documentId}`);
                        return {
                            documentId,
                            title: document.title,
                            status: 'updated',
                            message: 'Documentation updated successfully',
                            timestamp,
                            content,
                        };
                    }
                }
                throw new Error(`Document ${documentId} not found`);
            }
            else {
                const newDocumentId = this.generateDocumentId();
                const title = variables.title || `Generated Document ${newDocumentId}`;
                let category = this.config.categories.find(cat => cat.name === 'Generated');
                if (!category) {
                    category = {
                        name: 'Generated',
                        description: 'Automatically generated documentation',
                        documents: [],
                    };
                    this.config.categories.push(category);
                }
                const newDocument = {
                    id: newDocumentId,
                    title,
                    description: variables.description || '',
                    content,
                    format: 'markdown',
                    version: '1.0.0',
                    lastUpdated: timestamp,
                    tags: variables.tags ? variables.tags.split(',') : [],
                    relatedDocuments: [],
                };
                category.documents.push(newDocument);
                this.logger.log(`Generated new documentation ${newDocumentId}`);
                return {
                    documentId: newDocumentId,
                    title,
                    status: 'generated',
                    message: 'Documentation generated successfully',
                    timestamp,
                    content,
                };
            }
        }
        catch (error) {
            const result = {
                documentId: documentId || 'unknown',
                title: variables.title || 'Unknown',
                status: 'failed',
                message: `Documentation generation failed: ${error.message}`,
                timestamp: new Date(),
            };
            this.logger.error(`Documentation generation failed: ${error.message}`);
            return result;
        }
    }
    incrementVersion(version) {
        const parts = version.split('.');
        if (parts.length === 3) {
            const patch = parseInt(parts[2]) + 1;
            return `${parts[0]}.${parts[1]}.${patch}`;
        }
        return version;
    }
    generateDocumentId() {
        return `doc_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }
    async updateSearchIndex() {
        this.logger.log('Updating documentation search index');
        await new Promise(resolve => setTimeout(resolve, 1000));
        this.logger.log('Documentation search index updated');
    }
    async getQualityReport() {
        this.logger.log('Generating documentation quality report');
        let totalDocuments = 0;
        let documentedFeatures = 0;
        let outdatedDocuments = 0;
        let completeDocuments = 0;
        const issues = [];
        for (const category of this.config.categories) {
            for (const document of category.documents) {
                totalDocuments++;
                const daysSinceUpdate = (Date.now() - document.lastUpdated.getTime()) / (1000 * 60 * 60 * 24);
                if (daysSinceUpdate > this.config.documentationMetrics.maxOutdatedThreshold) {
                    outdatedDocuments++;
                    issues.push({
                        type: 'outdated',
                        documentId: document.id,
                        description: `Document "${document.title}" hasn't been updated in ${Math.floor(daysSinceUpdate)} days`,
                        severity: daysSinceUpdate > this.config.documentationMetrics.maxOutdatedThreshold * 2 ? 'high' : 'medium',
                    });
                }
                if (document.content.length > 100) {
                    completeDocuments++;
                }
                else {
                    issues.push({
                        type: 'incomplete',
                        documentId: document.id,
                        description: `Document "${document.title}" appears to be incomplete`,
                        severity: 'low',
                    });
                }
                const duplicates = category.documents.filter(doc => doc.title === document.title && doc.id !== document.id);
                if (duplicates.length > 0) {
                    issues.push({
                        type: 'duplicate',
                        documentId: document.id,
                        description: `Document "${document.title}" has ${duplicates.length} duplicate(s)`,
                        severity: 'medium',
                    });
                }
            }
        }
        const coverage = totalDocuments > 0 ? (documentedFeatures / totalDocuments) * 100 : 100;
        const freshness = totalDocuments > 0 ? ((totalDocuments - outdatedDocuments) / totalDocuments) * 100 : 100;
        const completeness = totalDocuments > 0 ? (completeDocuments / totalDocuments) * 100 : 100;
        let taggedDocuments = 0;
        let linkedDocuments = 0;
        for (const category of this.config.categories) {
            for (const document of category.documents) {
                if (document.tags.length > 0) {
                    taggedDocuments++;
                }
                if (document.relatedDocuments.length > 0) {
                    linkedDocuments++;
                }
            }
        }
        const searchability = totalDocuments > 0
            ? ((taggedDocuments + linkedDocuments) / (totalDocuments * 2)) * 100
            : 100;
        const overallScore = (coverage * 0.3) + (freshness * 0.3) + (completeness * 0.2) + (searchability * 0.2);
        const recommendations = [];
        if (coverage < this.config.documentationMetrics.minDocumentationCoverage) {
            recommendations.push(`Increase documentation coverage from ${coverage.toFixed(1)}% to ${this.config.documentationMetrics.minDocumentationCoverage}%`);
        }
        if (freshness < 90) {
            recommendations.push(`Update ${outdatedDocuments} outdated documents`);
        }
        if (completeness < 95) {
            recommendations.push(`Complete documentation for ${totalDocuments - completeDocuments} incomplete documents`);
        }
        const report = {
            overallScore,
            coverage,
            freshness,
            completeness,
            searchability,
            issues,
            recommendations,
        };
        this.logger.log(`Documentation quality report generated: ${overallScore.toFixed(1)}/100`);
        return report;
    }
    submitFeedback(documentId, rating, comment) {
        if (rating < 1 || rating > 5) {
            throw new Error('Rating must be between 1 and 5');
        }
        const feedback = {
            documentId,
            rating,
            comment,
            timestamp: new Date(),
        };
        this.analytics.feedback.push(feedback);
        this.logger.log(`Feedback submitted for document ${documentId}: ${rating}/5`);
    }
    getAnalytics() {
        this.analytics.popularDocuments.sort((a, b) => b.viewCount - a.viewCount);
        return { ...this.analytics };
    }
    updatePopularDocuments(documentId, title) {
        const existing = this.analytics.popularDocuments.find(doc => doc.documentId === documentId);
        if (existing) {
            existing.viewCount++;
        }
        else {
            this.analytics.popularDocuments.push({
                documentId,
                title,
                viewCount: 1,
            });
        }
    }
    exportDocumentation(format, category) {
        let documentsToExport = [];
        if (category) {
            const cat = this.config.categories.find(c => c.name === category);
            if (cat) {
                documentsToExport = cat.documents;
            }
        }
        else {
            for (const cat of this.config.categories) {
                documentsToExport = documentsToExport.concat(cat.documents);
            }
        }
        switch (format) {
            case 'json':
                return JSON.stringify(documentsToExport, null, 2);
            case 'markdown':
                let markdown = '# Documentation Export\n\n';
                for (const document of documentsToExport) {
                    markdown += `## ${document.title}\n\n`;
                    markdown += `${document.content}\n\n`;
                    markdown += `---\n\n`;
                }
                return markdown;
            case 'html':
                let html = '<!DOCTYPE html><html><head><title>Documentation Export</title></head><body>';
                html += '<h1>Documentation Export</h1>';
                for (const document of documentsToExport) {
                    html += `<h2>${document.title}</h2>`;
                    html += `<div>${document.content}</div>`;
                    html += `<hr>`;
                }
                html += '</body></html>';
                return html;
            default:
                throw new Error(`Unsupported export format: ${format}`);
        }
    }
    getConfiguration() {
        return { ...this.config };
    }
    updateConfiguration(config) {
        this.config = { ...this.config, ...config };
        this.logger.log('Documentation configuration updated');
    }
    addCategory(category) {
        this.config.categories.push(category);
        this.logger.log(`Added documentation category ${category.name}`);
    }
    addTemplate(template) {
        this.config.templates.push(template);
        this.logger.log(`Added documentation template ${template.name}`);
    }
    removeCategory(categoryName) {
        this.config.categories = this.config.categories.filter(cat => cat.name !== categoryName);
        this.logger.log(`Removed documentation category ${categoryName}`);
    }
    removeTemplate(templateName) {
        this.config.templates = this.config.templates.filter(t => t.name !== templateName);
        this.logger.log(`Removed documentation template ${templateName}`);
    }
};
exports.OperationalDocumentationService = OperationalDocumentationService;
exports.OperationalDocumentationService = OperationalDocumentationService = OperationalDocumentationService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [axios_1.HttpService])
], OperationalDocumentationService);
//# sourceMappingURL=operational-documentation.service.js.map