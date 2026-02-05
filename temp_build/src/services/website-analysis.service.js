"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var WebsiteAnalysisService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.WebsiteAnalysisService = void 0;
const common_1 = require("@nestjs/common");
const axios_1 = __importDefault(require("axios"));
const cheerio = __importStar(require("cheerio"));
let WebsiteAnalysisService = WebsiteAnalysisService_1 = class WebsiteAnalysisService {
    constructor() {
        this.logger = new common_1.Logger(WebsiteAnalysisService_1.name);
    }
    async analyzeWebsite(url) {
        try {
            this.logger.log(`Analyzing website: ${url}`);
            const response = await axios_1.default.get(url, {
                timeout: 10000,
                headers: {
                    'User-Agent': 'MisyBot-Analyzer/1.0'
                }
            });
            const html = response.data;
            const $ = cheerio.load(html);
            const title = $('title').text().trim();
            const description = $('meta[name="description"]').attr('content') || '';
            const keywords = $('meta[name="keywords"]').attr('content') || '';
            const products = [];
            const services = [];
            const serviceIndicators = [
                'servicios', 'services', 'productos', 'products',
                'soluciones', 'solutions', 'ofrecemos', 'we offer',
                'what we do', 'nuestros servicios', 'our services'
            ];
            $('a').each((i, elem) => {
                const text = $(elem).text().toLowerCase();
                const href = $(elem).attr('href') || '';
                if (serviceIndicators.some(indicator => text.includes(indicator))) {
                    const linkText = $(elem).text().trim();
                    if (linkText && !services.includes(linkText) && services.length < 10) {
                        services.push(linkText);
                    }
                }
                if (href.includes('service') || href.includes('producto') || href.includes('solution')) {
                    const linkText = $(elem).text().trim();
                    if (linkText && !services.includes(linkText) && services.length < 10) {
                        services.push(linkText);
                    }
                }
            });
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
            const contactInfo = {
                email: $('a[href^="mailto:"]').attr('href')?.replace('mailto:', '') || '',
                phone: $('a[href^="tel:"]').attr('href')?.replace('tel:', '') || '',
                address: $('.address').text().trim() || $('footer').text().match(/[\w\s\d,\.]+(?:Street|Avenue|Road|Boulevard|Drive|Lane|Way|Circle|Heights|Plaza|Parkway|Commons|Calle|Carrera|Avenida|Transversal)/i)?.[0] || ''
            };
            let siteType = 'general';
            if (html.toLowerCase().includes('ecommerce') || html.toLowerCase().includes('tienda') ||
                $('body').text().toLowerCase().includes('comprar') || $('body').text().toLowerCase().includes('buy')) {
                siteType = 'ecommerce';
            }
            else if (html.toLowerCase().includes('agency') || html.toLowerCase().includes('agencia') ||
                html.toLowerCase().includes('marketing') || html.toLowerCase().includes('design')) {
                siteType = 'agency';
            }
            else if (html.toLowerCase().includes('consult') || html.toLowerCase().includes('asesor')) {
                siteType = 'consulting';
            }
            const technologies = [];
            if (html.includes('WordPress'))
                technologies.push('WordPress');
            if (html.includes('React'))
                technologies.push('React');
            if (html.includes('Vue'))
                technologies.push('Vue.js');
            if (html.includes('Angular'))
                technologies.push('Angular');
            if (html.includes('Shopify'))
                technologies.push('Shopify');
            if (html.includes('WooCommerce'))
                technologies.push('WooCommerce');
            const result = {
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
        }
        catch (error) {
            this.logger.error(`Failed to analyze website ${url}:`, error.message);
            throw new Error(`Failed to analyze website: ${error.message}`);
        }
    }
    detectLanguage(html, $) {
        const htmlLang = $('html').attr('lang');
        if (htmlLang)
            return htmlLang;
        const charset = $('meta[charset]').attr('charset') || $('meta[http-equiv="Content-Type"]').attr('content');
        if (charset && charset.toLowerCase().includes('utf-8')) {
            const text = $('body').text().toLowerCase();
            const spanishWords = ['el', 'la', 'de', 'en', 'que', 'y', 'a', 'los', 'las', 'un', 'una'];
            const englishWords = ['the', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of'];
            const spanishCount = spanishWords.filter(word => text.includes(word)).length;
            const englishCount = englishWords.filter(word => text.includes(word)).length;
            if (spanishCount > englishCount)
                return 'es';
            if (englishCount > spanishCount)
                return 'en';
        }
        return 'en';
    }
    async getPerformanceMetrics(url) {
        try {
            return {
                loadTime: Math.random() * 3000 + 500,
                pageSize: Math.random() * 2000 + 500,
                requests: Math.floor(Math.random() * 50) + 10,
                score: Math.floor(Math.random() * 40) + 60,
                recommendations: [
                    'Optimize images',
                    'Minify CSS and JavaScript',
                    'Enable browser caching',
                    'Use a CDN'
                ]
            };
        }
        catch (error) {
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
};
exports.WebsiteAnalysisService = WebsiteAnalysisService;
exports.WebsiteAnalysisService = WebsiteAnalysisService = WebsiteAnalysisService_1 = __decorate([
    (0, common_1.Injectable)()
], WebsiteAnalysisService);
//# sourceMappingURL=website-analysis.service.js.map