import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';

export interface DocumentationConfig {
  categories: Array<{
    name: string;
    description: string;
    documents: Array<{
      id: string;
      title: string;
      description: string;
      content: string;
      format: 'markdown' | 'html' | 'text';
      version: string;
      lastUpdated: Date;
      tags: string[];
      relatedDocuments: string[]; // document IDs
    }>;
  }>;
  templates: Array<{
    name: string;
    description: string;
    content: string;
    variables: string[];
  }>;
  search: {
    indexing: {
      enabled: boolean;
      frequency: number; // in minutes
    };
    suggestions: {
      enabled: boolean;
      maxSuggestions: number;
    };
  };
  documentationMetrics: {
    minDocumentationCoverage: number; // percentage
    maxOutdatedThreshold: number; // in days
    minSearchRelevance: number; // percentage
  };
}

export interface DocumentationSearchResult {
  documentId: string;
  title: string;
  excerpt: string;
  relevance: number; // 0-100
  category: string;
  tags: string[];
}

export interface DocumentationGenerationResult {
  documentId: string;
  title: string;
  status: 'generated' | 'updated' | 'failed';
  message: string;
  timestamp: Date;
  content?: string;
}

export interface DocumentationQualityReport {
  overallScore: number; // 0-100
  coverage: number; // percentage
  freshness: number; // percentage
  completeness: number; // percentage
  searchability: number; // percentage
  issues: Array<{
    type: 'missing' | 'outdated' | 'incomplete' | 'duplicate';
    documentId?: string;
    categoryId?: string;
    description: string;
    severity: 'low' | 'medium' | 'high' | 'critical';
  }>;
  recommendations: string[];
}

export interface DocumentationAnalytics {
  views: number;
  searches: number;
  downloads: number;
  feedback: Array<{
    documentId: string;
    rating: number; // 1-5
    comment?: string;
    timestamp: Date;
  }>;
  popularDocuments: Array<{
    documentId: string;
    title: string;
    viewCount: number;
  }>;
}

@Injectable()
export class OperationalDocumentationService {
  private readonly logger = new Logger(OperationalDocumentationService.name);
  private config: DocumentationConfig;
  private analytics: DocumentationAnalytics = {
    views: 0,
    searches: 0,
    downloads: 0,
    feedback: [],
    popularDocuments: [],
  };

  constructor(private readonly httpService: HttpService) {}

  /**
   * Configure the documentation service
   * @param config Documentation configuration
   */
  configure(config: DocumentationConfig): void {
    this.config = config;
    this.logger.log(`Documentation service configured with ${config.categories.length} categories`);
    
    // Start indexing if enabled
    if (this.config.search.indexing.enabled) {
      setInterval(() => {
        this.updateSearchIndex();
      }, this.config.search.indexing.frequency * 60 * 1000);
    }
  }

  /**
   * Get document by ID
   * @param documentId Document ID
   * @returns Document content
   */
  getDocument(documentId: string): string | null {
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

  /**
   * Search documentation
   * @param query Search query
   * @param category Optional category filter
   * @param tags Optional tags filter
   * @returns Search results
   */
  searchDocumentation(
    query: string,
    category?: string,
    tags?: string[]
  ): DocumentationSearchResult[] {
    this.analytics.searches++;
    
    const results: DocumentationSearchResult[] = [];
    
    // Search through all documents
    for (const cat of this.config.categories) {
      // Skip category if filter is applied and doesn't match
      if (category && cat.name !== category) {
        continue;
      }
      
      for (const document of cat.documents) {
        // Skip document if tags filter is applied and doesn't match
        if (tags && !tags.every(tag => document.tags.includes(tag))) {
          continue;
        }
        
        // Calculate relevance based on query match
        const relevance = this.calculateRelevance(query, document);
        
        // Only include results above a certain threshold
        if (relevance > 10) {
          // Extract excerpt containing the query
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
    
    // Sort by relevance
    results.sort((a, b) => b.relevance - a.relevance);
    
    // Limit results
    return results.slice(0, 20);
  }

  /**
   * Calculate relevance of document to query
   * @param query Search query
   * @param document Document
   * @returns Relevance score (0-100)
   */
  private calculateRelevance(
    query: string,
    document: DocumentationConfig['categories'][0]['documents'][0]
  ): number {
    const queryLower = query.toLowerCase();
    const titleLower = document.title.toLowerCase();
    const contentLower = document.content.toLowerCase();
    const tagsLower = document.tags.map(tag => tag.toLowerCase());
    
    let relevance = 0;
    
    // Title match (highest weight)
    if (titleLower.includes(queryLower)) {
      relevance += 40;
    }
    
    // Content match (medium weight)
    const contentMatches = (contentLower.match(new RegExp(queryLower, 'g')) || []).length;
    relevance += Math.min(contentMatches * 5, 30);
    
    // Tag match (medium weight)
    const tagMatches = tagsLower.filter(tag => tag.includes(queryLower)).length;
    relevance += Math.min(tagMatches * 10, 20);
    
    // Description match (low weight)
    if (document.description.toLowerCase().includes(queryLower)) {
      relevance += 10;
    }
    
    return Math.min(relevance, 100);
  }

  /**
   * Extract excerpt containing query
   * @param content Document content
   * @param query Search query
   * @returns Excerpt
   */
  private extractExcerpt(content: string, query: string): string {
    const queryLower = query.toLowerCase();
    const contentLower = content.toLowerCase();
    const queryIndex = contentLower.indexOf(queryLower);
    
    if (queryIndex === -1) {
      // If query not found, return beginning of content
      return content.substring(0, 150) + '...';
    }
    
    // Extract 75 characters before and after the query
    const start = Math.max(0, queryIndex - 75);
    const end = Math.min(content.length, queryIndex + query.length + 75);
    
    let excerpt = content.substring(start, end);
    
    // Add ellipsis if excerpt doesn't start or end the content
    if (start > 0) {
      excerpt = '...' + excerpt;
    }
    if (end < content.length) {
      excerpt = excerpt + '...';
    }
    
    return excerpt;
  }

  /**
   * Generate documentation from template
   * @param templateName Template name
   * @param variables Template variables
   * @param documentId Optional document ID (if updating existing)
   * @returns Generation result
   */
  async generateDocumentation(
    templateName: string,
    variables: Record<string, string>,
    documentId?: string
  ): Promise<DocumentationGenerationResult> {
    const template = this.config.templates.find(t => t.name === templateName);
    if (!template) {
      throw new Error(`Template ${templateName} not found`);
    }

    try {
      // Validate required variables
      for (const variable of template.variables) {
        if (!variables[variable]) {
          throw new Error(`Missing required variable: ${variable}`);
        }
      }

      // Generate content by replacing variables
      let content = template.content;
      for (const [key, value] of Object.entries(variables)) {
        content = content.replace(new RegExp(`{{${key}}}`, 'g'), value);
      }

      const timestamp = new Date();
      
      if (documentId) {
        // Update existing document
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
      } else {
        // Create new document
        const newDocumentId = this.generateDocumentId();
        const title = variables.title || `Generated Document ${newDocumentId}`;
        
        // Add to appropriate category or create new one
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
          format: 'markdown' as const,
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
    } catch (error) {
      const result: DocumentationGenerationResult = {
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

  /**
   * Increment version string
   * @param version Current version
   * @returns Next version
   */
  private incrementVersion(version: string): string {
    const parts = version.split('.');
    if (parts.length === 3) {
      const patch = parseInt(parts[2]) + 1;
      return `${parts[0]}.${parts[1]}.${patch}`;
    }
    return version;
  }

  /**
   * Generate document ID
   * @returns Document ID
   */
  private generateDocumentId(): string {
    return `doc_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Update search index
   */
  private async updateSearchIndex(): Promise<void> {
    this.logger.log('Updating documentation search index');
    
    // In a real implementation, this would update a search index
    // For now, we'll just log that it's happening
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    this.logger.log('Documentation search index updated');
  }

  /**
   * Get documentation quality report
   * @returns Quality report
   */
  async getQualityReport(): Promise<DocumentationQualityReport> {
    this.logger.log('Generating documentation quality report');
    
    let totalDocuments = 0;
    let documentedFeatures = 0;
    let outdatedDocuments = 0;
    let completeDocuments = 0;
    const issues: DocumentationQualityReport['issues'] = [];
    
    // Analyze each document
    for (const category of this.config.categories) {
      for (const document of category.documents) {
        totalDocuments++;
        
        // Check if document is outdated
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
        
        // Check if document is complete (basic check)
        if (document.content.length > 100) {
          completeDocuments++;
        } else {
          issues.push({
            type: 'incomplete',
            documentId: document.id,
            description: `Document "${document.title}" appears to be incomplete`,
            severity: 'low',
          });
        }
        
        // Check for duplicate titles
        const duplicates = category.documents.filter(
          doc => doc.title === document.title && doc.id !== document.id
        );
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
    
    // Calculate metrics
    const coverage = totalDocuments > 0 ? (documentedFeatures / totalDocuments) * 100 : 100;
    const freshness = totalDocuments > 0 ? ((totalDocuments - outdatedDocuments) / totalDocuments) * 100 : 100;
    const completeness = totalDocuments > 0 ? (completeDocuments / totalDocuments) * 100 : 100;
    
    // Simple searchability score based on tags and related documents
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
    
    // Overall score (weighted average)
    const overallScore = (coverage * 0.3) + (freshness * 0.3) + (completeness * 0.2) + (searchability * 0.2);
    
    // Generate recommendations
    const recommendations: string[] = [];
    
    if (coverage < this.config.documentationMetrics.minDocumentationCoverage) {
      recommendations.push(`Increase documentation coverage from ${coverage.toFixed(1)}% to ${this.config.documentationMetrics.minDocumentationCoverage}%`);
    }
    
    if (freshness < 90) {
      recommendations.push(`Update ${outdatedDocuments} outdated documents`);
    }
    
    if (completeness < 95) {
      recommendations.push(`Complete documentation for ${totalDocuments - completeDocuments} incomplete documents`);
    }
    
    const report: DocumentationQualityReport = {
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

  /**
   * Submit feedback for document
   * @param documentId Document ID
   * @param rating Rating (1-5)
   * @param comment Optional comment
   */
  submitFeedback(documentId: string, rating: number, comment?: string): void {
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

  /**
   * Get documentation analytics
   * @returns Analytics data
   */
  getAnalytics(): DocumentationAnalytics {
    // Update popular documents ranking
    this.analytics.popularDocuments.sort((a, b) => b.viewCount - a.viewCount);
    
    return { ...this.analytics };
  }

  /**
   * Update popular documents list
   * @param documentId Document ID
   * @param title Document title
   */
  private updatePopularDocuments(documentId: string, title: string): void {
    const existing = this.analytics.popularDocuments.find(doc => doc.documentId === documentId);
    
    if (existing) {
      existing.viewCount++;
    } else {
      this.analytics.popularDocuments.push({
        documentId,
        title,
        viewCount: 1,
      });
    }
  }

  /**
   * Export documentation in specified format
   * @param format Export format
   * @param category Optional category filter
   * @returns Exported content
   */
  exportDocumentation(
    format: 'json' | 'markdown' | 'html',
    category?: string
  ): string {
    // Filter documents by category if specified
    let documentsToExport: Array<{
      id: string;
      title: string;
      description: string;
      content: string;
      format: 'markdown' | 'html' | 'text';
      version: string;
      lastUpdated: Date;
      tags: string[];
      relatedDocuments: string[]; // document IDs
    }> = [];
    
    if (category) {
      const cat = this.config.categories.find(c => c.name === category);
      if (cat) {
        documentsToExport = cat.documents;
      }
    } else {
      // Export all documents
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

  /**
   * Get documentation configuration
   * @returns Documentation configuration
   */
  getConfiguration(): DocumentationConfig {
    return { ...this.config };
  }

  /**
   * Update documentation configuration
   * @param config New configuration
   */
  updateConfiguration(config: Partial<DocumentationConfig>): void {
    this.config = { ...this.config, ...config };
    this.logger.log('Documentation configuration updated');
  }

  /**
   * Add category
   * @param category Category configuration
   */
  addCategory(category: DocumentationConfig['categories'][0]): void {
    this.config.categories.push(category);
    this.logger.log(`Added documentation category ${category.name}`);
  }

  /**
   * Add template
   * @param template Template configuration
   */
  addTemplate(template: DocumentationConfig['templates'][0]): void {
    this.config.templates.push(template);
    this.logger.log(`Added documentation template ${template.name}`);
  }

  /**
   * Remove category
   * @param categoryName Category name
   */
  removeCategory(categoryName: string): void {
    this.config.categories = this.config.categories.filter(cat => cat.name !== categoryName);
    this.logger.log(`Removed documentation category ${categoryName}`);
  }

  /**
   * Remove template
   * @param templateName Template name
   */
  removeTemplate(templateName: string): void {
    this.config.templates = this.config.templates.filter(t => t.name !== templateName);
    this.logger.log(`Removed documentation template ${templateName}`);
  }
}