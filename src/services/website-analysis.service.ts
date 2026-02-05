import { Injectable, Logger } from '@nestjs/common';
import axios from 'axios';
import * as cheerio from 'cheerio';

@Injectable()
export class WebsiteAnalysisService {
  private readonly logger = new Logger(WebsiteAnalysisService.name);

  /**
   * Analyze a website and extract context information
   * @param url Website URL to analyze
   * @returns Website context information
   */
  async analyzeWebsite(url: string): Promise<WebsiteContext> {
    try {
      this.logger.log(`Analyzing website: ${url}`);
      
      // Fetch website content
      const response = await axios.get(url, {
        timeout: 10000, // 10 second timeout
        headers: {
          'User-Agent': 'MisyBot-Analyzer/1.0'
        }
      });
      
      const html = response.data;
      const $ = cheerio.load(html);
      
      // Extract basic information
      const title = $('title').text().trim();
      const description = $('meta[name="description"]').attr('content') || '';
      const keywords = $('meta[name="keywords"]').attr('content') || '';
      
      // Extract products/services from common patterns
      const products: string[] = [];
      const services: string[] = [];
      
      // Look for common product/service indicators
      const serviceIndicators = [
        'servicios', 'services', 'productos', 'products', 
        'soluciones', 'solutions', 'ofrecemos', 'we offer',
        'what we do', 'nuestros servicios', 'our services'
      ];
      
      // Check navigation links for service indicators
      $('a').each((i, elem) => {
        const text = $(elem).text().toLowerCase();
        const href = $(elem).attr('href') || '';
        
        // Check if link text indicates services or products
        if (serviceIndicators.some(indicator => text.includes(indicator))) {
          const linkText = $(elem).text().trim();
          if (linkText && !services.includes(linkText) && services.length < 10) {
            services.push(linkText);
          }
        }
        
        // Check href patterns
        if (href.includes('service') || href.includes('producto') || href.includes('solution')) {
          const linkText = $(elem).text().trim();
          if (linkText && !services.includes(linkText) && services.length < 10) {
            services.push(linkText);
          }
        }
      });
      
      // Look for service/product sections
      $('h1, h2, h3').each((i, elem) => {
        const text = $(elem).text().toLowerCase();
        if (text.includes('servicio') || text.includes('service') || 
            text.includes('producto') || text.includes('product') ||
            text.includes('solución') || text.includes('solution')) {
          const sectionTitle = $(elem).text().trim();
          if (sectionTitle && !services.includes(sectionTitle) && services.length < 10) {
            services.push(sectionTitle);
          }
        }
      });
      
      // Extract contact information
      const contactInfo = {
        email: $('a[href^="mailto:"]').attr('href')?.replace('mailto:', '') || '',
        phone: $('a[href^="tel:"]').attr('href')?.replace('tel:', '') || '',
        address: $('.address').text().trim() || $('footer').text().match(/[\w\s\d,\.]+(?:Street|Avenue|Road|Boulevard|Drive|Lane|Way|Circle|Heights|Plaza|Parkway|Commons|Calle|Carrera|Avenida|Transversal)/i)?.[0] || ''
      };
      
      // Determine website type based on content
      let siteType = 'general';
      if (html.toLowerCase().includes('ecommerce') || html.toLowerCase().includes('tienda') || 
          $('body').text().toLowerCase().includes('comprar') || $('body').text().toLowerCase().includes('buy')) {
        siteType = 'ecommerce';
      } else if (html.toLowerCase().includes('agency') || html.toLowerCase().includes('agencia') ||
                 html.toLowerCase().includes('marketing') || html.toLowerCase().includes('design')) {
        siteType = 'agency';
      } else if (html.toLowerCase().includes('consult') || html.toLowerCase().includes('asesor')) {
        siteType = 'consulting';
      }
      
      // Extract technologies (basic detection)
      const technologies: string[] = [];
      if (html.includes('WordPress')) technologies.push('WordPress');
      if (html.includes('React')) technologies.push('React');
      if (html.includes('Vue')) technologies.push('Vue.js');
      if (html.includes('Angular')) technologies.push('Angular');
      if (html.includes('Shopify')) technologies.push('Shopify');
      if (html.includes('WooCommerce')) technologies.push('WooCommerce');
      
      const result: WebsiteContext = {
        url,
        title,
        description,
        keywords: keywords.split(',').map(k => k.trim()).filter(k => k),
        products,
        services,
        siteType,
        technologies,
        contactInfo,
        language: this.detectLanguage(html, $),
        lastModified: response.headers['last-modified'] || new Date().toISOString()
      };
      
      this.logger.log(`Website analysis completed for: ${url}`, { 
        siteType: result.siteType,
        servicesCount: result.services.length,
        productsCount: result.products.length
      });
      
      return result;
    } catch (error) {
      this.logger.error(`Failed to analyze website ${url}:`, error.message);
      throw new Error(`Failed to analyze website: ${error.message}`);
    }
  }

  /**
   * Detect website language
   * @param html HTML content
   * @param $ Cheerio instance
   * @returns Detected language
   */
  private detectLanguage(html: string, $: ReturnType<typeof cheerio.load>): string {
    // Check html lang attribute
    const htmlLang = $('html').attr('lang');
    if (htmlLang) return htmlLang;
    
    // Check meta charset
    const charset = $('meta[charset]').attr('charset') || $('meta[http-equiv="Content-Type"]').attr('content');
    if (charset && charset.toLowerCase().includes('utf-8')) {
      // If UTF-8, check content for language indicators
      const text = $('body').text().toLowerCase();
      const spanishWords = ['el', 'la', 'de', 'en', 'que', 'y', 'a', 'los', 'las', 'un', 'una'];
      const englishWords = ['the', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of'];
      
      const spanishCount = spanishWords.filter(word => text.includes(word)).length;
      const englishCount = englishWords.filter(word => text.includes(word)).length;
      
      if (spanishCount > englishCount) return 'es';
      if (englishCount > spanishCount) return 'en';
    }
    
    // Default to English
    return 'en';
  }

  /**
   * Get website performance metrics
   * @param url Website URL
   * @returns Performance metrics
   */
  async getPerformanceMetrics(url: string): Promise<PerformanceMetrics> {
    try {
      // In a real implementation, this would integrate with performance APIs
      // For now, we'll return simulated data
      return {
        loadTime: Math.random() * 3000 + 500, // 500ms to 3500ms
        pageSize: Math.random() * 2000 + 500, // 500KB to 2500KB
        requests: Math.floor(Math.random() * 50) + 10, // 10 to 60 requests
        score: Math.floor(Math.random() * 40) + 60, // 60 to 100 score
        recommendations: [
          'Optimize images',
          'Minify CSS and JavaScript',
          'Enable browser caching',
          'Use a CDN'
        ]
      };
    } catch (error) {
      this.logger.error(`Failed to get performance metrics for ${url}:`, error.message);
      return {
        loadTime: 0,
        pageSize: 0,
        requests: 0,
        score: 0,
        recommendations: []
      };
    }
  }
}

// Interfaces for type safety
export interface WebsiteContext {
  url: string;
  title: string;
  description: string;
  keywords: string[];
  products: string[];
  services: string[];
  siteType: string;
  technologies: string[];
  contactInfo: {
    email: string;
    phone: string;
    address: string;
  };
  language: string;
  lastModified: string;
}

export interface PerformanceMetrics {
  loadTime: number; // in milliseconds
  pageSize: number; // in KB
  requests: number;
  score: number; // 0-100
  recommendations: string[];
}