const axios = require('axios');

async function simpleFrontDeskTest() {
  const baseURL = 'http://localhost:3007/api/v1';
  
  console.log('=== PRUEBA SIMPLE DE FRONTDESK ===\n');
  
  try {
    // Probar endpoint de salud
    console.log('1. Probando endpoint de salud...');
    const healthResponse = await axios.get(`${baseURL}/health`);
    console.log('✅ Salud OK:', healthResponse.data.status);
    
    // Probar endpoint V2 del FrontDesk
    console.log('\n2. Probando endpoint V2 del FrontDesk...');
    const frontDeskResponse = await axios.post(`${baseURL}/v2/agents/front-desk`, {
      message: 'Hola, necesito ayuda para crear contenido en redes sociales',
      context: {
        sessionId: 'test-' + Date.now(),
        language: 'es'
      }
    });
    
    console.log('✅ Respuesta FrontDesk V2:');
    console.log('   Mensaje:', frontDeskResponse.data.data.response);
    console.log('   Enrutamiento:', frontDeskResponse.data.data.routingDecision);
    console.log('   Contexto:', frontDeskResponse.data.data.contextSummary);
    
    // Probar endpoint de métricas
    console.log('\n3. Probando endpoint de métricas...');
    const metricsResponse = await axios.get(`${baseURL}/v2/agents/front-desk/metrics`);
    console.log('✅ Métricas:');
    console.log('   Solicitudes procesadas:', metricsResponse.data.requestsProcessed);
    console.log('   Tasa de éxito:', metricsResponse.data.successRate + '%');
    console.log('   Tiempo promedio:', metricsResponse.data.avgResponseTime + 'ms');
    
    console.log('\n🎉 TODAS LAS PRUEBAS PASARON EXITOSAMENTE');
    
  } catch (error) {
    console.error('❌ Error:', error.response?.data || error.message);
  }
}

simpleFrontDeskTest();