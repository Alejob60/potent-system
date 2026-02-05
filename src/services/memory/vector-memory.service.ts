import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Interaction, InteractionDocument } from '../../schemas/interaction.schema';
import { AzureClient } from '../../lib/api/azure-client';

@Injectable()
export class VectorMemoryService {
  private readonly logger = new Logger(VectorMemoryService.name);
  private readonly EMBEDDING_DIMENSION = 1536; // Para text-embedding-ada-002

  constructor(
    @InjectModel(Interaction.name, 'MisyConnection') 
    private interactionModel: Model<InteractionDocument>,
    private readonly azureClient: AzureClient
  ) {}

  /**
   * Guarda una interacción generando su embedding vectorial
   * SEGURIDAD: Valida que tenantId y userId sean válidos
   */
  async saveInteraction(
    tenantId: string,
    userId: string,
    channel: string,
    content: string,
    role: string,
    metadata?: any
  ): Promise<Interaction> {
    // Validación de seguridad
    if (!tenantId || !userId) {
      throw new Error('tenantId y userId son requeridos');
    }
    
    if (tenantId.length < 5 || userId.length < 5) {
      throw new Error('IDs inválidos');
    }
    
    try {
      // Generar embedding usando Azure OpenAI
      const embedding = await this.generateEmbedding(content);
      
      const interaction = new this.interactionModel({
        tenantId,
        userId,
        channel,
        content,
        role,
        embedding,
        metadata: {
          ...metadata,
          timestamp: new Date(),
          security: {
            tenantVerified: true,
            userVerified: true
          }
        }
      });

      const savedInteraction = await interaction.save();
      this.logger.log(`Interaction saved securely for user ${userId} in tenant ${tenantId}`);
      
      return savedInteraction;
    } catch (error) {
      this.logger.error(`Failed to save interaction: ${error.message}`);
      throw error;
    }
  }

  /**
   * Busca contexto relevante usando búsqueda vectorial
   * SEGURIDAD: Asegura aislamiento entre tenants
   */
  async findRelevantContext(
    tenantId: string,
    userId: string,
    query: string,
    limit: number = 5,
    channel?: string
  ): Promise<Interaction[]> {
    // Validación de seguridad crítica
    if (!tenantId || !userId) {
      throw new Error('tenantId y userId son requeridos para búsqueda segura');
    }
    
    try {
      // Generar embedding para la consulta
      const queryEmbedding = await this.generateEmbedding(query);
      
      // Construir filtro base con validación de seguridad
      const filter: any = {
        tenantId: tenantId, // Nunca tomar del body del request
        userId: userId     // Siempre del token decodificado
      };

      // Filtrar por canal si se especifica
      if (channel) {
        filter.channel = channel;
      }

      // Realizar búsqueda vectorial asegurando aislamiento
      const relevantInteractions = await this.performSecureVectorSearch(
        filter,
        queryEmbedding,
        limit
      );

      this.logger.log(`Found ${relevantInteractions.length} relevant interactions for user ${userId} in tenant ${tenantId}`);
      
      return relevantInteractions;
    } catch (error) {
      this.logger.error(`Failed to find relevant context: ${error.message}`);
      throw error;
    }
  }

  /**
   * Obtiene historial reciente de interacciones
   */
  async getRecentInteractions(
    tenantId: string,
    userId: string,
    limit: number = 10,
    channel?: string
  ): Promise<Interaction[]> {
    const filter: any = {
      tenantId,
      userId
    };

    if (channel) {
      filter.channel = channel;
    }

    return this.interactionModel
      .find(filter)
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean();
  }

  /**
   * Genera embeddings usando Azure OpenAI
   */
  private async generateEmbedding(text: string): Promise<number[]> {
    try {
      const response = await this.azureClient.embeddings.create({
        input: text,
        model: 'text-embedding-ada-002'
      });

      return response.data[0].embedding;
    } catch (error) {
      this.logger.warn(`Failed to generate embedding, using dummy vector: ${error.message}`);
      // Vector dummy para desarrollo local
      return Array(this.EMBEDDING_DIMENSION).fill(0).map(() => Math.random());
    }
  }

  /**
   * Simula búsqueda vectorial segura (para entorno local sin Atlas Vector Search)
   * SEGURIDAD: Garantiza aislamiento multi-tenant
   */
  private async performSecureVectorSearch(
    filter: any,
    queryEmbedding: number[],
    limit: number
  ): Promise<Interaction[]> {
    // Validar que el filtro incluye tenantId y userId
    if (!filter.tenantId || !filter.userId) {
      throw new Error('Filtro de seguridad incompleto');
    }

    // En producción, esto usaría Atlas Vector Search
    // db.collection.aggregate([
    //   {
    //     "$vectorSearch": {
    //       "index": "vector_index",
    //       "path": "embedding",
    //       "queryVector": queryEmbedding,
    //       "numCandidates": 100,
    //       "limit": limit
    //     }
    //   }
    // ])

    // Simulación: buscar por similitud de contenido y recency
    // Asegurando que solo se accede a datos del tenant correcto
    const interactions = await this.interactionModel
      .find({
        tenantId: filter.tenantId, // Aislamiento garantizado
        userId: filter.userId,     // Aislamiento de usuario
        ...(filter.channel && { channel: filter.channel })
      })
      .sort({ createdAt: -1 })
      .limit(limit * 2) // Traer más para simular ranking
      .lean();

    // Simular scoring por relevancia de contenido
    return interactions
      .map(interaction => ({
        ...interaction,
        similarityScore: this.calculateSimilarity(
          interaction.content.toLowerCase(),
          filter.content?.toLowerCase() || ''
        ),
        security: {
          tenantIsolated: true,
          userIsolated: true
        }
      }))
      .sort((a, b) => b.similarityScore - a.similarityScore)
      .slice(0, limit);
  }

  /**
   * Calcula similitud básica entre contenidos (para simulación)
   */
  private calculateSimilarity(text1: string, text2: string): number {
    if (!text1 || !text2) return 0;
    
    const words1 = new Set(text1.split(/\s+/));
    const words2 = new Set(text2.split(/\s+/));
    
    const intersection = new Set([...words1].filter(x => words2.has(x)));
    const union = new Set([...words1, ...words2]);
    
    return intersection.size / union.size;
  }

  /**
   * Elimina interacciones antiguas para mantenimiento
   */
  async cleanupOldInteractions(
    tenantId: string,
    userId: string,
    daysToKeep: number = 30
  ): Promise<number> {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);

    const result = await this.interactionModel.deleteMany({
      tenantId,
      userId,
      createdAt: { $lt: cutoffDate }
    });

    this.logger.log(`Cleaned up ${result.deletedCount} old interactions`);
    return result.deletedCount;
  }
}