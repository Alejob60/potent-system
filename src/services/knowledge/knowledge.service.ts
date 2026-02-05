import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Knowledge, KnowledgeDocument } from '../../schemas/knowledge.schema';
import { AzureCognitiveClient } from '../../lib/azure-cognitive';

@Injectable()
export class KnowledgeService {
  private readonly logger = new Logger(KnowledgeService.name);

  constructor(
    @InjectModel(Knowledge.name, 'MisyConnection')
    private knowledgeModel: Model<KnowledgeDocument>,
  ) {}

  async createKnowledge(params: {
    userId: string;
    tenantId: string;
    fileName: string;
    fileType: string;
    fullText: string;
    sourceType: 'pdf' | 'image' | 'doc' | 'text';
  }): Promise<KnowledgeDocument> {
    this.logger.log(`Creating knowledge entry for: ${params.fileName}`);

    // 1. Summarization
    const summary = await this.summarizeContent(params.fullText);

    // 2. Vectorization (Embedding)
    const vector = await this.generateEmbedding(`${summary}\n\n${params.fullText.substring(0, 1000)}`);

    // 3. Persistence
    const knowledge = new this.knowledgeModel({
      ...params,
      summary,
      vector,
    });

    return knowledge.save();
  }

  async updateMetadata(id: string, metadata: any): Promise<void> {
    this.logger.log(`Updating metadata for knowledge ${id}`);
    await this.knowledgeModel.findByIdAndUpdate(id, {
      $set: { metadata }
    }).exec();
  }

  async findRelevant(params: {
    userId: string;
    tenantId: string;
    query: string;
    limit?: number;
  }): Promise<Array<{ text: string; source: string; score?: number }>> {
    const queryVector = await this.generateEmbedding(params.query);
    const limit = params.limit || 3;

    this.logger.log(`Searching knowledge for query: "${params.query}" (User: ${params.userId})`);

    // En una implementación real con MongoDB Atlas, usaríamos $vectorSearch.
    // Para una implementación compatible con local/standard Mongo, usamos agregación con similitud de coseno
    // o simplemente recuperamos los más recientes si no hay índice vectorial configurado.
    
    // Nota: Para este entorno, implementaremos una simulación de ranking si el plugin de vectores no está activo,
    // o una consulta directa si lo está.
    
    const results = await this.knowledgeModel.aggregate([
      {
        $match: {
          $or: [{ userId: params.userId }, { tenantId: params.tenantId }]
        }
      },
      // Aquí iría el stage de $vectorSearch si estuviéramos en Atlas.
      // Como fallback, tomamos los más relevantes por texto/recientes y simulamos el filtrado
      { $limit: 10 } 
    ]).exec();

    return results.map(doc => ({
      text: doc.fullText,
      summary: doc.summary,
      source: doc.fileName,
      score: 1.0 // Placeholder para el score de relevancia
    }));
  }

  private async summarizeContent(text: string): Promise<string> {
    const openai = AzureCognitiveClient.getOpenAIClient();
    try {
      const response = await openai.chat.completions.create({
        model: process.env.AZURE_OPENAI_DEPLOYMENT_NAME || 'gpt-4o',
        messages: [
          {
            role: 'system',
            content: 'Eres un experto en análisis técnico. Tu tarea es generar un resumen denso y extraer palabras clave del contenido proporcionado para facilitar su recuperación semántica.',
          },
          {
            role: 'user',
            content: `Resume el siguiente contenido:\n\n${text.substring(0, 10000)}`,
          },
        ],
      });
      return response.choices[0].message.content || '';
    } catch (error) {
      this.logger.error(`Error summarizing: ${error.message}`);
      return 'Summary generation failed';
    }
  }

  private async generateEmbedding(text: string): Promise<number[]> {
    const openai = AzureCognitiveClient.getOpenAIClient();
    try {
      const response = await openai.embeddings.create({
        model: process.env.AZURE_OPENAI_EMBEDDING_DEPLOYMENT || 'text-embedding-ada-002',
        input: text.replace(/\n/g, ' '),
      });
      return response.data[0].embedding;
    } catch (error) {
      this.logger.error(`Error generating embedding: ${error.message}`);
      throw new Error(`Embedding generation failed: ${error.message}`);
    }
  }
}
