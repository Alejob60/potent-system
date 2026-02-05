const axios = require('axios');

async function testFrontDeskFullWorkflow() {
  console.log('=== PRUEBA COMPLETA DEL WORKFLOW DEL FRONT DESK V2 ===\n');
  
  // Configuración del cliente
  const client = axios.create({
    baseURL: 'http://localhost:3007/api/v1/v2/agents/front-desk',
    timeout: 10000,
  });
  
  // Crear un sessionId único para esta prueba
  const sessionId = `test-session-${Date.now()}`;
  
  console.log(`Usando sessionId: ${sessionId}\n`);
  
  // Caso de prueba 1: Mensaje inicial
  console.log('--- CASO 1: Mensaje inicial ---');
  const initialMessage = {
    message: 'Quiero crear un video para TikTok sobre mi producto nuevo',
    context: {
      sessionId: sessionId,
      language: 'es'
    }
  };
  
  try {
    console.log('Enviando mensaje inicial...');
    const response1 = await client.post('', initialMessage);
    
    if (response1.data.success) {
      console.log('✅ Éxito en el mensaje inicial');
      console.log('Respuesta:', response1.data.data.response);
      console.log('Enrutamiento:', response1.data.data.routingDecision);
      console.log('Resumen de contexto:', response1.data.data.contextSummary);
      console.log('Próximos pasos:', response1.data.data.nextSteps);
    } else {
      console.log('❌ Error en el mensaje inicial:', response1.data.error);
    }
  } catch (error) {
    console.log('❌ Error de red en el mensaje inicial:', error.message);
  }
  
  // Caso de prueba 2: Segundo mensaje en la misma sesión
  console.log('\n--- CASO 2: Segundo mensaje en la misma sesión ---');
  const secondMessage = {
    message: 'Necesito que el video tenga música de fondo y texto animado',
    context: {
      sessionId: sessionId,
      language: 'es'
    }
  };
  
  try {
    console.log('Enviando segundo mensaje...');
    const response2 = await client.post('', secondMessage);
    
    if (response2.data.success) {
      console.log('✅ Éxito en el segundo mensaje');
      console.log('Respuesta:', response2.data.data.response);
      console.log('Enrutamiento:', response2.data.data.routingDecision);
      console.log('Resumen de contexto:', response2.data.data.contextSummary);
      console.log('Próximos pasos:', response2.data.data.nextSteps);
    } else {
      console.log('❌ Error en el segundo mensaje:', response2.data.error);
    }
  } catch (error) {
    console.log('❌ Error de red en el segundo mensaje:', error.message);
  }
  
  // Caso de prueba 3: Obtener métricas
  console.log('\n--- CASO 3: Obtener métricas del agente ---');
  try {
    console.log('Obteniendo métricas...');
    const metricsResponse = await client.get('metrics');
    console.log('✅ Métricas obtenidas exitosamente');
    console.log('Métricas:', JSON.stringify(metricsResponse.data, null, 2));
  } catch (error) {
    console.log('❌ Error al obtener métricas:', error.message);
  }
  
  console.log('\n=== PRUEBA COMPLETA DEL WORKFLOW FINALIZADA ===');
}

testFrontDeskFullWorkflow();