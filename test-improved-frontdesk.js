const axios = require('axios');

async function testImprovedFrontDesk() {
  console.log('=== PRUEBA DEL FRONT DESK V2 MEJORADO ===\n');
  
  // Configuración del cliente
  const client = axios.create({
    baseURL: 'http://localhost:3007/api/v1/v2/agents/front-desk',
    timeout: 15000,
  });
  
  // Crear un sessionId único para esta prueba
  const sessionId = `improved-test-session-${Date.now()}`;
  
  console.log(`Usando sessionId: ${sessionId}\n`);
  
  // Caso de prueba 1: Mensaje inicial
  console.log('--- CASO 1: Mensaje inicial para crear video ---');
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
      console.log('Confianza:', response1.data.data.contextSummary);
      console.log('Próximos pasos:', response1.data.data.nextSteps);
    } else {
      console.log('❌ Error en el mensaje inicial:', response1.data.error);
    }
  } catch (error) {
    console.log('❌ Error de red en el mensaje inicial:', error.message);
  }
  
  // Caso de prueba 2: Mensaje de análisis
  console.log('\n--- CASO 2: Mensaje de análisis de campaña ---');
  const analysisMessage = {
    message: 'Necesito un informe de análisis de mi campaña en Instagram',
    context: {
      sessionId: sessionId,
      language: 'es'
    }
  };
  
  try {
    console.log('Enviando mensaje de análisis...');
    const response2 = await client.post('', analysisMessage);
    
    if (response2.data.success) {
      console.log('✅ Éxito en el mensaje de análisis');
      console.log('Respuesta:', response2.data.data.response);
      console.log('Enrutamiento:', response2.data.data.routingDecision);
      console.log('Confianza:', response2.data.data.contextSummary);
      console.log('Próximos pasos:', response2.data.data.nextSteps);
    } else {
      console.log('❌ Error en el mensaje de análisis:', response2.data.error);
    }
  } catch (error) {
    console.log('❌ Error de red en el mensaje de análisis:', error.message);
  }
  
  // Caso de prueba 3: Mensaje de planificación
  console.log('\n--- CASO 3: Mensaje de planificación de campaña ---');
  const planningMessage = {
    message: 'Quiero planear una campaña para lanzar mi producto en todas las redes sociales',
    context: {
      sessionId: sessionId,
      language: 'es'
    }
  };
  
  try {
    console.log('Enviando mensaje de planificación...');
    const response3 = await client.post('', planningMessage);
    
    if (response3.data.success) {
      console.log('✅ Éxito en el mensaje de planificación');
      console.log('Respuesta:', response3.data.data.response);
      console.log('Enrutamiento:', response3.data.data.routingDecision);
      console.log('Confianza:', response3.data.data.contextSummary);
      console.log('Próximos pasos:', response3.data.data.nextSteps);
    } else {
      console.log('❌ Error en el mensaje de planificación:', response3.data.error);
    }
  } catch (error) {
    console.log('❌ Error de red en el mensaje de planificación:', error.message);
  }
  
  // Caso de prueba 4: Obtener métricas
  console.log('\n--- CASO 4: Obtener métricas del agente ---');
  try {
    console.log('Obteniendo métricas...');
    const metricsResponse = await client.get('metrics');
    console.log('✅ Métricas obtenidas exitosamente');
    console.log('Métricas:', JSON.stringify(metricsResponse.data, null, 2));
  } catch (error) {
    console.log('❌ Error al obtener métricas:', error.message);
  }
  
  console.log('\n=== PRUEBA DEL FRONT DESK V2 MEJORADO FINALIZADA ===');
}

testImprovedFrontDesk();