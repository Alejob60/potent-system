const axios = require('axios');

async function testContextManagement() {
  console.log('=== PRUEBA DE GESTIÓN DE CONTEXTO EN FRONT DESK V2 ===\n');
  
  // Configuración del cliente
  const client = axios.create({
    baseURL: 'http://localhost:3007/api/v1/v2/agents/front-desk',
    timeout: 10000,
  });
  
  // Crear un sessionId único para esta prueba
  const sessionId = `context-test-session-${Date.now()}`;
  
  console.log(`Usando sessionId: ${sessionId}\n`);
  
  // Caso de prueba 1: Mensaje inicial para establecer contexto
  console.log('--- CASO 1: Establecer contexto inicial ---');
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
    } else {
      console.log('❌ Error en el mensaje inicial:', response1.data.error);
    }
  } catch (error) {
    console.log('❌ Error de red en el mensaje inicial:', error.message);
  }
  
  // Caso de prueba 2: Mensaje adicional para enriquecer contexto
  console.log('\n--- CASO 2: Enriquecer contexto ---');
  const enrichMessage = {
    message: 'El producto es una crema facial para pieles sensibles',
    context: {
      sessionId: sessionId,
      language: 'es'
    }
  };
  
  try {
    console.log('Enviando mensaje para enriquecer contexto...');
    const response2 = await client.post('', enrichMessage);
    
    if (response2.data.success) {
      console.log('✅ Éxito en el mensaje de enriquecimiento');
      console.log('Respuesta:', response2.data.data.response);
      console.log('Enrutamiento:', response2.data.data.routingDecision);
    } else {
      console.log('❌ Error en el mensaje de enriquecimiento:', response2.data.error);
    }
  } catch (error) {
    console.log('❌ Error de red en el mensaje de enriquecimiento:', error.message);
  }
  
  // Caso de prueba 3: Mensaje con información específica
  console.log('\n--- CASO 3: Mensaje con información específica ---');
  const specificMessage = {
    message: 'Necesito que el video tenga música de fondo y texto animado',
    context: {
      sessionId: sessionId,
      language: 'es'
    }
  };
  
  try {
    console.log('Enviando mensaje con información específica...');
    const response3 = await client.post('', specificMessage);
    
    if (response3.data.success) {
      console.log('✅ Éxito en el mensaje específico');
      console.log('Respuesta:', response3.data.data.response);
      console.log('Enrutamiento:', response3.data.data.routingDecision);
    } else {
      console.log('❌ Error en el mensaje específico:', response3.data.error);
    }
  } catch (error) {
    console.log('❌ Error de red en el mensaje específico:', error.message);
  }
  
  console.log('\n=== PRUEBA DE GESTIÓN DE CONTEXTO FINALIZADA ===');
}

testContextManagement();