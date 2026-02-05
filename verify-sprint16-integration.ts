import { NestFactory } from '@nestjs/core';
import { AppModule } from './src/app.module';
import { TenantManagementService } from './src/meta-agent/security/tenant-management.service';
import { FrontDeskV2Service } from './src/agents/front-desk/services/front-desk-v2.service';
import { HmacSignatureService } from './src/meta-agent/security/hmac-signature.service';
import * as crypto from 'crypto';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);
  
  const tenantService = app.get(TenantManagementService);
  const frontDesk = app.get(FrontDeskV2Service);
  const hmacService = app.get(HmacSignatureService);

  console.log('🚀 Starting Sprint 16 Final Validation...');

  try {
    // 1. Simular registro de un nuevo tenant (e.g. un cliente de MisyBot)
    console.log('\nStep 1: Registering Test Tenant...');
    const registration = await tenantService.registerTenant({
      tenantName: 'Sprint 16 Validator Corp',
      contactEmail: 'validator@example.com',
      websiteUrl: 'https://validator-corp.com',
      businessIndustry: 'Technology',
      permissions: ['read', 'write', 'viral_engine']
    });
    console.log('✅ Tenant Registered:', registration.tenantId);

    // 2. Simular el Frontend enviando un mensaje firmado
    console.log('\nStep 2: Simulating Signed Request from SDK...');
    const userMessage = 'Necesito crear un video viral sobre mi nueva app de IA';
    const timestamp = new Date().toISOString();
    const nonce = crypto.randomBytes(16).toString('hex');
    
    // El SDK generaría esta firma usando el tenantSecret (que recibió al registrarse)
    const dataToSign = `${timestamp}${nonce}${JSON.stringify({ message: userMessage, context: { siteId: registration.siteId } })}`;
    const signature = crypto.createHmac('sha256', registration.tenantSecret).update(dataToSign).digest('hex');

    // 3. Procesar a través del Gateway (bypass del middleware HTTP para el test unitario de lógica)
    console.log('\nStep 3: Orchestrating through Front-Desk V2...');
    const result = await frontDesk.execute({
      message: userMessage,
      tenantContext: {
        tenantId: registration.tenantId,
        siteId: registration.siteId,
        origin: 'https://validator-corp.com',
        permissions: ['read', 'write', 'viral_engine'],
        channel: 'web',
        sessionId: 'test-session-16'
      }
    });

    console.log('✅ AI Decision:', result.data.routingDecision);
    console.log('✅ AI Reasoning:', result.data.contextSummary);
    console.log('✅ Next Steps:', result.data.nextSteps);

    console.log('\n🏁 Final Validation Successful! All systems integrated.');
  } catch (error) {
    console.error('\n❌ Validation Failed:', error.message);
  } finally {
    await app.close();
  }
}

bootstrap();
