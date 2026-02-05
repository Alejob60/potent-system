import { Injectable, Logger } from '@nestjs/common';
import { Repository, Between } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { ProfessionalLog } from '../../entities/professional-log.entity';

@Injectable()
export class ProfessionalLoggerService {
  private readonly logger = new Logger(ProfessionalLoggerService.name);

  constructor(
    @InjectRepository(ProfessionalLog)
    private readonly logRepository: Repository<ProfessionalLog>,
  ) {}

  /**
   * Registra un log profesional
   * @param logData Datos del log
   */
  async log(logData: {
    category: string;
    action: string;
    userId?: string;
    productId?: string;
    reference?: string;
    message?: string;
    metadata?: any;
    timestamp: Date;
  }): Promise<void> {
    try {
      const log = new ProfessionalLog();
      log.category = logData.category;
      log.action = logData.action;
      log.userId = logData.userId ?? '';
      log.productId = logData.productId ?? '';
      log.reference = logData.reference ?? '';
      log.message = logData.message ?? '';
      log.metadata = logData.metadata;
      log.timestamp = logData.timestamp;

      await this.logRepository.save(log);
      
      // También registrar en consola para debugging
      this.logger.log(`[${logData.category}] ${logData.action}`, {
        userId: logData.userId,
        productId: logData.productId,
        reference: logData.reference,
        message: logData.message,
        metadata: logData.metadata
      });
    } catch (error) {
      this.logger.error(`Error al registrar log profesional: ${error.message}`, error.stack);
    }
  }

  /**
   * Obtiene logs por categoría
   * @param category Categoría de los logs
   * @param limit Límite de registros a obtener
   */
  async getLogsByCategory(category: string, limit: number = 100): Promise<ProfessionalLog[]> {
    try {
      return await this.logRepository.find({
        where: { category },
        order: { timestamp: 'DESC' },
        take: limit
      });
    } catch (error) {
      this.logger.error(`Error al obtener logs por categoría: ${error.message}`, error.stack);
      return [];
    }
  }

  /**
   * Obtiene logs por rango de tiempo
   * @param startTime Fecha de inicio
   * @param endTime Fecha de fin
   * @param limit Límite de registros a obtener
   */
  async getLogsByTimeRange(startTime: Date, endTime: Date, limit: number = 100): Promise<ProfessionalLog[]> {
    try {
      return await this.logRepository.find({
        where: {
          timestamp: Between(startTime, endTime)
        },
        order: { timestamp: 'DESC' },
        take: limit
      });
    } catch (error) {
      this.logger.error(`Error al obtener logs por rango de tiempo: ${error.message}`, error.stack);
      return [];
    }
  }
}