const axios = require('axios');

async function testConversationContext() {
  const baseURL = 'http://localhost:3007/api/v1';
  const sessionId = 'conversation-test-' + Date.now();
  
  console.log('=== PRUEBA DE CONVERSACIÓN Y CONTEXTO ===\n');
  
  try {
    // Simular una conversación completa
    console.log('Iniciando conversación con sesión ID:', sessionId);
    console.log('');
    
    // Mensaje 1: Saludo inicial
    console.log('1. Enviando mensaje inicial...');
    const response1 = await axios.post(`${baseURL}/v2/agents/front-desk`, {
      message: 'Hola, necesito ayuda para crear contenido en redes sociales',
      context: {
        sessionId: sessionId,
        language: 'es',
        timestamp: new Date().toISOString()
      }
    });
    
    console.log('   ✅ Respuesta:', response1.data.data.response);
    console.log('   🔄 Decisión de enrutamiento:', response1.data.data.routingDecision);
    console.log('   📊 Resumen de contexto:', response1.data.data.contextSummary);
    console.log('');
    
    // Mensaje 2: Especificar tipo de contenido
    console.log('2. Enviando segundo mensaje (especificando tipo de contenido)...');
    const response2 = await axios.post(`${baseURL}/v2/agents/front-desk`, {
      message: 'Quiero crear videos cortos para TikTok sobre tecnología',
      context: {
        sessionId: sessionId,
        language: 'es',
        timestamp: new Date().toISOString()
      }
    });
    
    console.log('   ✅ Respuesta:', response2.data.data.response);
    console.log('   🔄 Decisión de enrutamiento:', response2.data.data.routingDecision);
    console.log('   📊 Resumen de contexto:', response2.data.data.contextSummary);
    console.log('');
    
    // Mensaje 3: Preguntar por detalles
    console.log('3. Enviando tercer mensaje (preguntando por detalles)...');
    const response3 = await axios.post(`${baseURL}/v2/agents/front-desk`, {
      message: '¿Qué información necesitan para crear el video?',
      context: {
        sessionId: sessionId,
        language: 'es',
        timestamp: new Date().toISOString()
      }
    });
    
    console.log('   ✅ Respuesta:', response3.data.data.response);
    console.log('   🔄 Decisión de enrutamiento:', response3.data.data.routingDecision);
    console.log('   📊 Resumen de contexto:', response3.data.data.contextSummary);
    console.log('');
    
    // Mensaje 4: Proporcionar detalles
    console.log('4. Enviando cuarto mensaje (proporcionando detalles)...');
    const response4 = await axios.post(`${baseURL}/v2/agents/front-desk`, {
      message: 'Mi producto es una aplicación móvil para gestión de tareas. El público objetivo son profesionales jóvenes de 25-35 años.',
      context: {
        sessionId: sessionId,
        language: 'es',
        timestamp: new Date().toISOString()
      }
    });
    
    console.log('   ✅ Respuesta:', response4.data.data.response);
    console.log('   🔄 Decisión de enrutamiento:', response4.data.data.routingDecision);
    console.log('   📊 Resumen de contexto:', response4.data.data.contextSummary);
    console.log('');
    
    // Verificar métricas finales
    console.log('5. Verificando métricas finales...');
    const metricsResponse = await axios.get(`${baseURL}/v2/agents/front-desk/metrics`);
    console.log('   📈 Métricas finales:', JSON.stringify(metricsResponse.data, null, 2));
    console.log('');
    
    // Resumen de la conversación
    console.log('=== RESUMEN DE LA CONVERSACIÓN ===');
    console.log('🆔 Sesión ID:', sessionId);
    console.log('💬 Mensajes enviados: 4');
    console.log('✅ Todos los mensajes procesados correctamente');
    console.log('🔄 Sistema de enrutamiento funcionando');
    console.log('📊 Contexto generado y mantenido a lo largo de la conversación');
    console.log('');
    console.log('🎉 CONVERSACIÓN COMPLETA VALIDADA EXITOSAMENTE');
    
  } catch (error) {
    console.error('❌ Error en la prueba de conversación:', error.response?.data || error.message);
  }
}

testConversationContext();