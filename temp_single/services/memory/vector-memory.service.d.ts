/// <reference types="mongoose/types/aggregate" />
/// <reference types="mongoose/types/callback" />
/// <reference types="mongoose/types/collection" />
/// <reference types="mongoose/types/connection" />
/// <reference types="mongoose/types/cursor" />
/// <reference types="mongoose/types/document" />
/// <reference types="mongoose/types/error" />
/// <reference types="mongoose/types/expressions" />
/// <reference types="mongoose/types/helpers" />
/// <reference types="mongoose/types/middlewares" />
/// <reference types="mongoose/types/indexes" />
/// <reference types="mongoose/types/models" />
/// <reference types="mongoose/types/mongooseoptions" />
/// <reference types="mongoose/types/pipelinestage" />
/// <reference types="mongoose/types/populate" />
/// <reference types="mongoose/types/query" />
/// <reference types="mongoose/types/schemaoptions" />
/// <reference types="mongoose/types/session" />
/// <reference types="mongoose/types/types" />
/// <reference types="mongoose/types/utility" />
/// <reference types="mongoose/types/validation" />
/// <reference types="mongoose/types/virtuals" />
/// <reference types="mongoose/types/schematypes" />
/// <reference types="mongoose/types/inferschematype" />
/// <reference types="mongoose/types/inferhydrateddoctype" />
/// <reference types="mongoose/types/inferrawdoctype" />
import { Model } from 'mongoose';
import { Interaction, InteractionDocument } from '../../schemas/interaction.schema';
import { AzureClient } from '../../lib/api/azure-client';
export declare class VectorMemoryService {
    private interactionModel;
    private readonly azureClient;
    private readonly logger;
    private readonly EMBEDDING_DIMENSION;
    constructor(interactionModel: Model<InteractionDocument>, azureClient: AzureClient);
    /**
     * Guarda una interacción generando su embedding vectorial
     * SEGURIDAD: Valida que tenantId y userId sean válidos
     */
    saveInteraction(tenantId: string, userId: string, channel: string, content: string, role: string, metadata?: any): Promise<Interaction>;
    /**
     * Busca contexto relevante usando búsqueda vectorial
     * SEGURIDAD: Asegura aislamiento entre tenants
     */
    findRelevantContext(tenantId: string, userId: string, query: string, limit?: number, channel?: string): Promise<Interaction[]>;
    /**
     * Obtiene historial reciente de interacciones
     */
    getRecentInteractions(tenantId: string, userId: string, limit?: number, channel?: string): Promise<Interaction[]>;
    /**
     * Genera embeddings usando Azure OpenAI
     */
    private generateEmbedding;
    /**
     * Simula búsqueda vectorial segura (para entorno local sin Atlas Vector Search)
     * SEGURIDAD: Garantiza aislamiento multi-tenant
     */
    private performSecureVectorSearch;
    /**
     * Calcula similitud básica entre contenidos (para simulación)
     */
    private calculateSimilarity;
    /**
     * Elimina interacciones antiguas para mantenimiento
     */
    cleanupOldInteractions(tenantId: string, userId: string, daysToKeep?: number): Promise<number>;
}
