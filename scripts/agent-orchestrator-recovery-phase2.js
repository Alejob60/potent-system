#!/usr/bin/env node

/**
 * FASE 2: Reconexión del Orquestador y los Agentes
 * 
 * Objetivo: Que el Admin Orchestrator pueda despachar tareas.
 */

const fs = require('fs');
const path = require('path');

// Función para verificar y actualizar las URLs de los agentes en el .env.local
async function checkAndUpdateAgentUrls() {
  console.log('🔍 Verificando y actualizando URLs de los agentes...');
  
  try {
    // Leer el archivo .env.local
    const envLocalPath = path.join(__dirname, '..', '.env.local');
    if (!fs.existsSync(envLocalPath)) {
      console.log('❌ No se encontró el archivo .env.local');
      return false;
    }
    
    let envContent = fs.readFileSync(envLocalPath, 'utf8');
    
    // Verificar y actualizar las URLs de los agentes
    const agentUrls = {
      'AGENT_TREND_SCANNER_URL': 'http://localhost:3007/api/agents/trend-scanner',
      'AGENT_VIDEO_SCRIPTOR_URL': 'http://localhost:3007/api/agents/video-scriptor',
      'AGENT_FAQ_RESPONDER_URL': 'http://localhost:3007/api/agents/faq-responder',
      'AGENT_POST_SCHEDULER_URL': 'http://localhost:3007/api/agents/post-scheduler',
      'AGENT_ANALYTICS_REPORTER_URL': 'http://localhost:3007/api/agents/analytics-reporter'
    };
    
    let updated = false;
    
    for (const [key, value] of Object.entries(agentUrls)) {
      const regex = new RegExp(`${key}=.*`, 'g');
      if (envContent.match(regex)) {
        // Verificar si la URL es correcta
        const currentUrl = envContent.match(new RegExp(`${key}=(.*)`));
        if (currentUrl && currentUrl[1] !== value) {
          envContent = envContent.replace(regex, `${key}=${value}`);
          console.log(`✅ Actualizada ${key}: ${value}`);
          updated = true;
        } else {
          console.log(`✅ ${key} ya está configurada correctamente`);
        }
      } else {
        // Agregar la variable si no existe
        envContent += `\n${key}=${value}`;
        console.log(`✅ Agregada ${key}: ${value}`);
        updated = true;
      }
    }
    
    // Guardar el archivo si se realizaron cambios
    if (updated) {
      fs.writeFileSync(envLocalPath, envContent);
      console.log('✅ Archivo .env.local actualizado');
    } else {
      console.log('✅ No se requirieron cambios en .env.local');
    }
    
    return true;
  } catch (error) {
    console.error('❌ Error al verificar y actualizar las URLs de los agentes:', error.message);
    return false;
  }
}

// Función para implementar comprobación de salud para cada agente
async function implementAgentHealthCheck() {
  console.log('🔍 Implementando comprobación de salud para agentes...');
  
  try {
    // Verificar si existe el servicio del Admin Orchestrator
    const adminServicePath = path.join(__dirname, '..', 'src', 'agents', 'admin', 'services', 'admin-orchestrator.service.ts');
    if (!fs.existsSync(adminServicePath)) {
      console.log('❌ No se encontró el servicio del Admin Orchestrator');
      return false;
    }
    
    let serviceContent = fs.readFileSync(adminServicePath, 'utf8');
    
    // Verificar si ya existe la función checkAgentHealth
    if (serviceContent.includes('checkAgentHealth')) {
      console.log('✅ La función checkAgentHealth ya existe');
      return true;
    }
    
    // Agregar la función checkAgentHealth
    const healthCheckFunction = `
  async checkAgentHealth(url: string): Promise<boolean> {
    try {
      const response = await firstValueFrom(
        this.httpService.get(\`\${url}/health\`)
      );
      return response.status === 200;
    } catch (error) {
      console.error(\`Error checking health of agent at \${url}:\`, error.message);
      return false;
    }
  }
`;
    
    // Insertar la función antes del cierre de la clase
    const insertPosition = serviceContent.lastIndexOf('}');
    serviceContent = serviceContent.substring(0, insertPosition) + healthCheckFunction + '\n}';
    
    // Guardar el archivo actualizado
    fs.writeFileSync(adminServicePath, serviceContent);
    console.log('✅ Función checkAgentHealth implementada');
    
    return true;
  } catch (error) {
    console.error('❌ Error al implementar la comprobación de salud para agentes:', error.message);
    return false;
  }
}

// Función para crear job de verificación automática
async function createAutoVerificationJob() {
  console.log('🔍 Creando job de verificación automática...');
  
  try {
    // Crear directorio si no existe
    const jobsDir = path.join(__dirname, '..', 'src', 'jobs');
    if (!fs.existsSync(jobsDir)) {
      fs.mkdirSync(jobsDir, { recursive: true });
    }
    
    // Crear archivo del job
    const jobFilePath = path.join(jobsDir, 'agent-health-check.job.ts');
    
    const jobContent = `import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { AdminOrchestratorService } from '../agents/admin/services/admin-orchestrator.service';

@Injectable()
export class AgentHealthCheckJob {
  private readonly logger = new Logger(AgentHealthCheckJob.name);

  constructor(
    private readonly adminOrchestratorService: AdminOrchestratorService,
  ) {}

  @Cron(CronExpression.EVERY_5_MINUTES)
  async handleAgentHealthCheck() {
    this.logger.log('Iniciando verificación de salud de agentes');
    
    // Obtener las URLs de los agentes del servicio
    const agentMap = (this.adminOrchestratorService as any).agentMap;
    
    // Verificar la salud de cada agente
    const healthStatus = {};
    for (const [agentName, url] of Object.entries(agentMap)) {
      const isHealthy = await this.adminOrchestratorService.checkAgentHealth(url as string);
      healthStatus[agentName] = isHealthy;
      
      if (!isHealthy) {
        this.logger.warn(\`Agente \${agentName} (\${url}) no está saludable\`);
      } else {
        this.logger.log(\`Agente \${agentName} (\${url}) está saludable\`);
      }
    }
    
    // Emitir log centralizado
    this.logger.log('Estado de salud de agentes:', JSON.stringify(healthStatus, null, 2));
  }
}
`;
    
    fs.writeFileSync(jobFilePath, jobContent);
    console.log('✅ Job de verificación automática creado');
    
    // Actualizar el módulo de Admin para incluir el job
    const adminModulePath = path.join(__dirname, '..', 'src', 'agents', 'admin', 'admin.module.ts');
    if (fs.existsSync(adminModulePath)) {
      let moduleContent = fs.readFileSync(adminModulePath, 'utf8');
      
      // Verificar si ya está importado
      if (!moduleContent.includes('AgentHealthCheckJob')) {
        // Agregar importación
        const importLine = `import { AgentHealthCheckJob } from '../../jobs/agent-health-check.job';\n`;
        moduleContent = importLine + moduleContent;
        
        // Agregar al array de providers
        const providersRegex = /providers:\s*\[([^\]]*)\]/s;
        const match = moduleContent.match(providersRegex);
        if (match) {
          const currentProviders = match[1].trim();
          const newProviders = currentProviders ? 
            `${currentProviders},\n    AgentHealthCheckJob` : 
            'AgentHealthCheckJob';
          moduleContent = moduleContent.replace(providersRegex, `providers: [\n    ${newProviders}\n  ]`);
          
          fs.writeFileSync(adminModulePath, moduleContent);
          console.log('✅ Job agregado al módulo de Admin');
        }
      } else {
        console.log('✅ Job ya está incluido en el módulo de Admin');
      }
    }
    
    return true;
  } catch (error) {
    console.error('❌ Error al crear el job de verificación automática:', error.message);
    return false;
  }
}

// Función principal
async function main() {
  console.log('🚀 Iniciando FASE 2: Reconexión del Orquestador y los Agentes\n');
  
  // Verificar y actualizar URLs de los agentes
  const urlsOk = await checkAndUpdateAgentUrls();
  
  // Implementar comprobación de salud para agentes
  const healthCheckOk = await implementAgentHealthCheck();
  
  // Crear job de verificación automática
  const jobOk = await createAutoVerificationJob();
  
  console.log('\n📋 Resumen de la FASE 2:');
  console.log(`  - URLs de agentes: ${urlsOk ? '✅ OK' : '❌ Error'}`);
  console.log(`  - Comprobación de salud: ${healthCheckOk ? '✅ OK' : '❌ Error'}`);
  console.log(`  - Job de verificación: ${jobOk ? '✅ OK' : '❌ Error'}`);
  
  if (urlsOk && healthCheckOk && jobOk) {
    console.log('\n🎉 FASE 2 completada exitosamente');
    process.exit(0);
  } else {
    console.log('\n❌ FASE 2 no completada. Se requiere intervención manual');
    process.exit(1);
  }
}

// Ejecutar el script
if (require.main === module) {
  main().catch(console.error);
}